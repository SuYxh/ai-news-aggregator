import Parser from 'rss-parser';
import type { RawItem } from '../types.js';
import { BaseFetcher } from './base.js';
import { fetchText } from '../utils/http.js';
import { parseDate } from '../utils/date.js';
import { firstNonEmpty } from '../utils/text.js';

export class IrisFetcher extends BaseFetcher {
  siteId = 'iris';
  siteName = 'Info Flow';

  async fetch(now: Date): Promise<RawItem[]> {
    const html = await fetchText('https://iris.findtruman.io/web/info_flow');
    const items: RawItem[] = [];

    const feedMatch = html.match(/const\s+feeds\s*=\s*\[(.*?)\]\s*;/s);
    if (!feedMatch) return items;

    const feedSection = feedMatch[1];
    const feedRegex = /\{\s*name:\s*'([^']+)'\s*,\s*url:\s*'([^']+)'\s*\}/g;
    const feeds: Array<{ name: string; url: string }> = [];

    let match;
    while ((match = feedRegex.exec(feedSection)) !== null) {
      feeds.push({ name: match[1], url: match[2] });
    }

    const parser = new Parser();

    for (const feed of feeds) {
      try {
        const parsed = await parser.parseURL(feed.url);
        const sourceName = firstNonEmpty(feed.name, parsed.title, 'Iris Feed');

        for (const entry of parsed.items || []) {
          const title = (entry.title || '').trim();
          const url = (entry.link || '').trim();
          if (!title || !url) continue;

          const publishedAt =
            parseDate(entry.pubDate, now) ||
            parseDate(entry.isoDate, now) ||
            null;

          items.push(
            this.createItem({
              source: sourceName,
              title,
              url,
              publishedAt,
              meta: { feed_url: feed.url },
            })
          );
        }
      } catch {
        continue;
      }
    }

    return items;
  }
}
