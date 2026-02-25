import { Command } from 'commander';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join, resolve } from 'path';
import pLimit from 'p-limit';

import { CONFIG } from './config.js';
import type {
  RawItem,
  ArchiveItem,
  FetchStatus,
  RssFeedStatus,
  SiteStat,
  LatestPayload,
  ArchivePayload,
  StatusPayload,
} from './types.js';
import { utcNow, toISOString, parseISO } from './utils/date.js';
import { normalizeUrl, getHost } from './utils/url.js';
import { maybeFixMojibake } from './utils/text.js';
import { makeItemId } from './utils/hash.js';
import { createAllFetchers, runFetcher, fetchOpmlRss, fetchWaytoagiRecent7d } from './fetchers/index.js';
import { isAiRelated, dedupeItemsByTitleUrl, normalizeAihubTodayRecords } from './filters/index.js';
import { addBilingualFields, loadTitleZhCache, cacheToPojo } from './translate/index.js';
import { writeJson } from './output/index.js';

function eventTime(record: ArchiveItem): Date | null {
  if (record.site_id === 'opmlrss') {
    return parseISO(record.published_at);
  }
  return parseISO(record.published_at) || parseISO(record.first_seen_at);
}

function normalizeSourceForDisplay(siteId: string, source: string, url: string): string {
  const src = (source || '').trim();
  if (!src) {
    let host = getHost(url);
    if (host.startsWith('www.')) host = host.slice(4);
    return host || '未分区';
  }
  if (siteId === 'buzzing' && src.toLowerCase() === 'buzzing') {
    let host = getHost(url);
    if (host.startsWith('www.')) host = host.slice(4);
    return host || src;
  }
  return src;
}

async function loadArchive(path: string): Promise<Map<string, ArchiveItem>> {
  const archive = new Map<string, ArchiveItem>();
  if (!existsSync(path)) return archive;

  try {
    const content = await readFile(path, 'utf-8');
    const payload = JSON.parse(content);
    const items = payload.items || [];

    if (Array.isArray(items)) {
      for (const it of items) {
        if (it.id) archive.set(it.id, it);
      }
    } else if (typeof items === 'object') {
      for (const [id, it] of Object.entries(items)) {
        if (typeof it === 'object' && it !== null) {
          (it as ArchiveItem).id = id;
          archive.set(id, it as ArchiveItem);
        }
      }
    }
  } catch {
    // ignore
  }

  return archive;
}

async function loadTitleCache(path: string): Promise<Map<string, string>> {
  if (!existsSync(path)) return new Map();
  try {
    const content = await readFile(path, 'utf-8');
    const data = JSON.parse(content);
    return loadTitleZhCache(data);
  } catch {
    return new Map();
  }
}

async function main(): Promise<number> {
  const program = new Command();

  program
    .name('ai-news-aggregator')
    .description('Aggregate AI news updates from multiple sources')
    .option('--output-dir <dir>', 'Directory for output JSON files', 'data')
    .option('--window-hours <hours>', '24h window size', '24')
    .option('--archive-days <days>', 'Keep archive for N days', '45')
    .option('--translate-max-new <count>', 'Max new EN->ZH title translations per run', '80')
    .option('--rss-opml <path>', 'Optional OPML file path to include RSS sources', CONFIG.rss.defaultOpmlPath)
    .option('--rss-max-feeds <count>', 'Optional max OPML RSS feeds to fetch (0 means all)', '0')
    .parse();

  const opts = program.opts();
  const outputDir = resolve(opts.outputDir);
  const windowHours = parseInt(opts.windowHours);
  const archiveDays = parseInt(opts.archiveDays);
  const translateMaxNew = parseInt(opts.translateMaxNew);
  const rssOpml = opts.rssOpml;
  const rssMaxFeeds = parseInt(opts.rssMaxFeeds);

  const now = utcNow();

  const archivePath = join(outputDir, 'archive.json');
  const latestPath = join(outputDir, 'latest-24h.json');
  const statusPath = join(outputDir, 'source-status.json');
  const waytoagiPath = join(outputDir, 'waytoagi-7d.json');
  const titleCachePath = join(outputDir, 'title-zh-cache.json');

  const archive = await loadArchive(archivePath);

  const fetchers = createAllFetchers();
  const limit = pLimit(5);

  console.log('');
  console.log('📡 Fetching from built-in sources...');

  const fetchResults = await Promise.all(
    fetchers.map((f) => limit(() => runFetcher(f, now, true)))
  );

  const rawItems: RawItem[] = [];
  const statuses: FetchStatus[] = [];

  for (const { items, status } of fetchResults) {
    rawItems.push(...items);
    statuses.push(status);
  }

  let rssFeedStatuses: RssFeedStatus[] = [];
  const opmlPath = resolve(rssOpml);

  if (existsSync(opmlPath)) {
    console.log('');
    console.log(`📰 Fetching OPML RSS from ${opmlPath}...`);
    try {
      const { items: rssItems, summaryStatus, feedStatuses } = await fetchOpmlRss(
        now,
        opmlPath,
        rssMaxFeeds,
        true
      );
      rawItems.push(...rssItems);
      statuses.push(summaryStatus);
      rssFeedStatuses = feedStatuses;
    } catch (e) {
      statuses.push({
        site_id: 'opmlrss',
        site_name: 'OPML RSS',
        ok: false,
        item_count: 0,
        duration_ms: 0,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  } else if (rssOpml !== CONFIG.rss.defaultOpmlPath) {
    statuses.push({
      site_id: 'opmlrss',
      site_name: 'OPML RSS',
      ok: false,
      item_count: 0,
      duration_ms: 0,
      error: `OPML not found: ${opmlPath}`,
    });
  }

  console.log('');
  console.log(`📊 Fetched ${rawItems.length} raw items from ${statuses.length} sources`);

  for (const raw of rawItems) {
    const title = raw.title.trim();
    const url = normalizeUrl(raw.url);
    if (!title || !url || !url.startsWith('http')) continue;

    const itemId = makeItemId(raw.siteId, raw.source, title, url);
    const existing = archive.get(itemId);

    if (!existing) {
      archive.set(itemId, {
        id: itemId,
        site_id: raw.siteId,
        site_name: raw.siteName,
        source: raw.source,
        title,
        url,
        published_at: toISOString(raw.publishedAt),
        first_seen_at: toISOString(now)!,
        last_seen_at: toISOString(now)!,
      });
    } else {
      existing.site_id = raw.siteId;
      existing.site_name = raw.siteName;
      existing.source = raw.source;
      existing.title = title;
      existing.url = url;
      if (raw.publishedAt) {
        if (raw.siteId === 'opmlrss' || !existing.published_at) {
          existing.published_at = toISOString(raw.publishedAt);
        }
      }
      existing.last_seen_at = toISOString(now)!;
    }
  }

  const keepAfter = new Date(now.getTime() - archiveDays * 24 * 60 * 60 * 1000);
  for (const [id, record] of archive) {
    const ts =
      parseISO(record.last_seen_at) ||
      parseISO(record.published_at) ||
      parseISO(record.first_seen_at) ||
      now;
    if (ts < keepAfter) {
      archive.delete(id);
    }
  }

  const windowStart = new Date(now.getTime() - windowHours * 60 * 60 * 1000);
  let latestItemsAll: ArchiveItem[] = [];

  for (const record of archive.values()) {
    const ts = eventTime(record);
    if (!ts || ts < windowStart) continue;

    const normalized = { ...record };
    normalized.title = maybeFixMojibake(normalized.title || '');
    normalized.source = maybeFixMojibake(
      normalizeSourceForDisplay(normalized.site_id, normalized.source, normalized.url)
    );

    if (normalized.site_id === 'aihubtoday') {
      const t = (normalized.title || '').trim();
      if (!t || t.includes('详情见官方介绍') || ['原文链接', '查看详情', '点击查看', '详情'].includes(t)) {
        continue;
      }
    }

    latestItemsAll.push(normalized);
  }

  latestItemsAll = normalizeAihubTodayRecords(latestItemsAll);
  latestItemsAll.sort((a, b) => {
    const timeA = eventTime(a)?.getTime() ?? 0;
    const timeB = eventTime(b)?.getTime() ?? 0;
    return timeB - timeA;
  });

  let latestItems = latestItemsAll.filter(isAiRelated);
  console.log(`🤖 AI-related items: ${latestItems.length} / ${latestItemsAll.length}`);

  let titleCache = await loadTitleCache(titleCachePath);
  console.log('🌐 Adding bilingual fields...');
  const bilingualResult = await addBilingualFields(
    latestItems,
    latestItemsAll,
    titleCache,
    translateMaxNew
  );
  latestItems = bilingualResult.itemsAi;
  latestItemsAll = bilingualResult.itemsAll;
  titleCache = bilingualResult.cache;

  const latestItemsAiDedup = dedupeItemsByTitleUrl(latestItems, false);
  const latestItemsAllDedup = dedupeItemsByTitleUrl(latestItemsAll, true);

  const siteStat = new Map<string, SiteStat>();
  const rawCountBySite = new Map<string, number>();

  for (const record of latestItemsAll) {
    const sid = record.site_id;
    rawCountBySite.set(sid, (rawCountBySite.get(sid) || 0) + 1);
  }

  const siteNameById = new Map<string, string>();
  for (const record of latestItemsAll) {
    siteNameById.set(record.site_id, record.site_name);
  }
  for (const s of statuses) {
    if (!siteNameById.has(s.site_id)) {
      siteNameById.set(s.site_id, s.site_name);
    }
  }

  for (const record of latestItemsAiDedup) {
    const sid = record.site_id;
    if (!siteStat.has(sid)) {
      siteStat.set(sid, {
        site_id: sid,
        site_name: record.site_name,
        count: 0,
        raw_count: rawCountBySite.get(sid) || 0,
      });
    }
    siteStat.get(sid)!.count++;
  }

  for (const [sid, siteName] of siteNameById) {
    if (!siteStat.has(sid)) {
      siteStat.set(sid, {
        site_id: sid,
        site_name: siteName,
        count: 0,
        raw_count: rawCountBySite.get(sid) || 0,
      });
    }
  }

  const latestPayload: LatestPayload = {
    generated_at: toISOString(now)!,
    window_hours: windowHours,
    total_items: latestItemsAiDedup.length,
    total_items_ai_raw: latestItems.length,
    total_items_raw: latestItemsAll.length,
    total_items_all_mode: latestItemsAllDedup.length,
    topic_filter: 'ai_tech_robotics',
    archive_total: archive.size,
    site_count: siteStat.size,
    source_count: new Set(latestItemsAiDedup.map((i) => `${i.site_id}::${i.source}`)).size,
    site_stats: Array.from(siteStat.values()).sort((a, b) => b.count - a.count),
    items: latestItemsAiDedup,
    items_ai: latestItemsAiDedup,
    items_all_raw: latestItemsAll,
    items_all: latestItemsAllDedup,
  };

  const archivePayload: ArchivePayload = {
    generated_at: toISOString(now)!,
    total_items: archive.size,
    items: Array.from(archive.values()).sort((a, b) => {
      const timeA = parseISO(a.last_seen_at)?.getTime() ?? 0;
      const timeB = parseISO(b.last_seen_at)?.getTime() ?? 0;
      return timeB - timeA;
    }),
  };

  const statusPayload: StatusPayload = {
    generated_at: toISOString(now)!,
    sites: statuses,
    successful_sites: statuses.filter((s) => s.ok).length,
    failed_sites: statuses.filter((s) => !s.ok).map((s) => s.site_id),
    zero_item_sites: statuses
      .filter((s) => s.ok && s.item_count === 0)
      .map((s) => s.site_id),
    fetched_raw_items: rawItems.length,
    items_before_topic_filter: latestItemsAll.length,
    items_in_24h: latestItemsAiDedup.length,
    rss_opml: {
      enabled: existsSync(opmlPath),
      path: existsSync(opmlPath) ? opmlPath : null,
      feed_total: rssFeedStatuses.length,
      effective_feed_total: rssFeedStatuses.filter((s) => !s.skipped).length,
      ok_feeds: rssFeedStatuses.filter((s) => s.ok && !s.skipped).length,
      failed_feeds: rssFeedStatuses
        .filter((s) => !s.ok)
        .map((s) => s.effective_feed_url || s.feed_url || ''),
      zero_item_feeds: rssFeedStatuses
        .filter((s) => s.ok && !s.skipped && s.item_count === 0)
        .map((s) => s.effective_feed_url || s.feed_url || ''),
      skipped_feeds: rssFeedStatuses
        .filter((s) => s.skipped)
        .map((s) => ({ feed_url: s.feed_url || '', reason: s.skip_reason || null })),
      replaced_feeds: rssFeedStatuses
        .filter((s) => s.replaced && s.effective_feed_url)
        .map((s) => ({ from: s.feed_url || '', to: s.effective_feed_url || '' })),
      feeds: rssFeedStatuses,
    },
  };

  console.log('');
  console.log('📚 Fetching WaytoAGI...');
  const waytoagiPayload = await fetchWaytoagiRecent7d(now);
  console.log(`  ✅ WaytoAGI: ${waytoagiPayload.count_7d} updates in last 7 days`);

  console.log('');
  console.log('💾 Writing output files...');
  await writeJson(latestPath, latestPayload);
  await writeJson(archivePath, archivePayload);
  await writeJson(statusPath, statusPayload);
  await writeJson(waytoagiPath, waytoagiPayload);
  await writeJson(titleCachePath, cacheToPojo(titleCache));

  console.log(`  ✅ ${latestPath} (${latestItemsAiDedup.length} items)`);
  console.log(`  ✅ ${archivePath} (${archive.size} items)`);
  console.log(`  ✅ ${statusPath}`);
  console.log(`  ✅ ${waytoagiPath}`);
  console.log(`  ✅ ${titleCachePath} (${titleCache.size} entries)`);
  console.log('');
  console.log('🎉 Done!');

  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
