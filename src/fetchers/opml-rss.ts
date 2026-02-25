import { readFile } from 'fs/promises';
import { XMLParser } from 'fast-xml-parser';
import Parser from 'rss-parser';
import pLimit from 'p-limit';
import type { RawItem, RssFeedStatus, FetchStatus, OpmlFeed } from '../types.js';
import { CONFIG } from '../config.js';
import { parseDate } from '../utils/date.js';
import { firstNonEmpty } from '../utils/text.js';
import { getHost } from '../utils/url.js';
import { hashString } from '../utils/hash.js';

export function parseOpmlSubscriptions(opmlContent: string): OpmlFeed[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });
  const doc = parser.parse(opmlContent);

  const feeds: OpmlFeed[] = [];
  const seen = new Set<string>();

  function processOutline(outline: unknown): void {
    if (!outline || typeof outline !== 'object') return;

    const outlines = Array.isArray(outline) ? outline : [outline];
    for (const o of outlines) {
      const obj = o as Record<string, unknown>;
      const xmlUrl = String(obj['@_xmlUrl'] || '').trim();

      if (xmlUrl && !seen.has(xmlUrl)) {
        seen.add(xmlUrl);
        feeds.push({
          title: firstNonEmpty(
            obj['@_title'],
            obj['@_text'],
            getHost(xmlUrl),
            xmlUrl
          ),
          xmlUrl,
          htmlUrl: String(obj['@_htmlUrl'] || '').trim(),
        });
      }

      if (obj.outline) {
        processOutline(obj.outline);
      }
    }
  }

  const body = doc?.opml?.body;
  if (body?.outline) {
    processOutline(body.outline);
  }

  return feeds;
}

function resolveOfficialRssUrl(feedUrl: string): { url: string | null; skipReason: string | null } {
  const src = (feedUrl || '').trim();
  if (!src) return { url: null, skipReason: 'empty_url' };

  if (CONFIG.rss.skipExact.has(src)) {
    return { url: null, skipReason: 'no_official_rss_or_unreachable' };
  }

  for (const prefix of CONFIG.rss.skipPrefixes) {
    if (src.startsWith(prefix)) {
      return { url: null, skipReason: 'no_official_rss_for_source_type' };
    }
  }

  const replaced = CONFIG.rss.replacements[src];
  if (replaced) {
    return { url: replaced, skipReason: null };
  }

  return { url: src, skipReason: null };
}

async function fetchSingleFeed(
  feed: OpmlFeed,
  now: Date,
  verbose: boolean = true
): Promise<{ items: RawItem[]; status: RssFeedStatus }> {
  const feedUrl = feed.xmlUrl;
  const originalFeedUrl = feed.xmlUrlOriginal || feedUrl;
  const feedTitle = feed.title;
  const feedId = hashString(feedUrl).slice(0, 10);

  const start = performance.now();
  let error: string | null = null;
  const localItems: RawItem[] = [];

  try {
    const parser = new Parser({
      timeout: CONFIG.rss.feedTimeout,
      headers: {
        'User-Agent': CONFIG.http.userAgent,
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    });

    const parsed = await parser.parseURL(feedUrl);
    const sourceName = firstNonEmpty(feedTitle, parsed.title, getHost(feedUrl));

    for (const entry of parsed.items || []) {
      const title = (entry.title || '').trim();
      const url = (entry.link || '').trim();
      if (!title || !url) continue;

      const publishedAt =
        parseDate(entry.pubDate, now) ||
        parseDate(entry.isoDate, now) ||
        null;

      if (!publishedAt) continue;

      localItems.push({
        siteId: 'opmlrss',
        siteName: 'OPML RSS',
        source: sourceName,
        title,
        url,
        publishedAt,
        meta: {
          feed_url: feedUrl,
          feed_home: feed.htmlUrl || '',
        },
      });
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const durationMs = Math.round(performance.now() - start);

  if (verbose) {
    if (error) {
      console.log(`    ❌ [RSS] ${feedTitle}: ${error} (${durationMs}ms)`);
    } else if (localItems.length === 0) {
      console.log(`    ⚠️  [RSS] ${feedTitle}: 0 items (${durationMs}ms)`);
    } else {
      console.log(`    ✅ [RSS] ${feedTitle}: ${localItems.length} items (${durationMs}ms)`);
    }
  }

  return {
    items: localItems,
    status: {
      site_id: `opmlrss:${feedId}`,
      site_name: 'OPML RSS',
      feed_title: feedTitle,
      feed_url: originalFeedUrl,
      effective_feed_url: feedUrl,
      ok: error === null,
      item_count: localItems.length,
      duration_ms: durationMs,
      error,
      skipped: false,
      skip_reason: null,
      replaced: originalFeedUrl !== feedUrl,
    },
  };
}

export async function fetchOpmlRss(
  now: Date,
  opmlPath: string,
  maxFeeds: number = 0,
  verbose: boolean = true
): Promise<{
  items: RawItem[];
  summaryStatus: FetchStatus;
  feedStatuses: RssFeedStatus[];
}> {
  const opmlContent = await readFile(opmlPath, 'utf-8');
  let feeds = parseOpmlSubscriptions(opmlContent);

  if (maxFeeds > 0) {
    feeds = feeds.slice(0, maxFeeds);
  }

  if (verbose) {
    console.log(`  📋 Found ${feeds.length} feeds in OPML`);
  }

  const items: RawItem[] = [];
  const feedStatuses: RssFeedStatus[] = [];
  const resolvedFeeds: OpmlFeed[] = [];

  for (const feed of feeds) {
    const { url: resolvedUrl, skipReason } = resolveOfficialRssUrl(feed.xmlUrl);

    if (!resolvedUrl) {
      const feedId = hashString(feed.xmlUrl).slice(0, 10);
      feedStatuses.push({
        site_id: `opmlrss:${feedId}`,
        site_name: 'OPML RSS',
        feed_title: feed.title,
        feed_url: feed.xmlUrl,
        effective_feed_url: null,
        ok: true,
        item_count: 0,
        duration_ms: 0,
        error: null,
        skipped: true,
        skip_reason: skipReason || 'skipped',
        replaced: false,
      });
      if (verbose) {
        console.log(`    ⏭️  [RSS] ${feed.title}: Skipped (${skipReason})`);
      }
      continue;
    }

    resolvedFeeds.push({
      ...feed,
      xmlUrlOriginal: feed.xmlUrl,
      xmlUrl: resolvedUrl,
      replaced: resolvedUrl !== feed.xmlUrl,
    });
  }

  if (verbose) {
    console.log(`  🚀 Fetching ${resolvedFeeds.length} feeds (concurrency: ${CONFIG.rss.maxConcurrency})...`);
  }

  if (resolvedFeeds.length > 0) {
    const limit = pLimit(CONFIG.rss.maxConcurrency);

    const results = await Promise.all(
      resolvedFeeds.map((feed) => limit(() => fetchSingleFeed(feed, now, verbose)))
    );

    for (const { items: feedItems, status } of results) {
      items.push(...feedItems);
      feedStatuses.push(status);
    }
  }

  feedStatuses.sort((a, b) =>
    (a.feed_title || a.feed_url || '').localeCompare(b.feed_title || b.feed_url || '')
  );

  const totalDurationMs = feedStatuses.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
  const okFeeds = feedStatuses.filter((s) => s.ok && !s.skipped).length;
  const failedFeeds = feedStatuses.filter((s) => !s.ok).length;

  const summaryStatus: FetchStatus = {
    site_id: 'opmlrss',
    site_name: 'OPML RSS',
    ok: okFeeds > 0,
    item_count: items.length,
    duration_ms: totalDurationMs,
    error: failedFeeds === 0 ? null : `${failedFeeds} feeds failed`,
  };

  return { items, summaryStatus, feedStatuses };
}
