import type { RawItem } from '../types.js';
import { BaseFetcher } from './base.js';
import { parseDate } from '../utils/date.js';
import { firstNonEmpty } from '../utils/text.js';
import { getHost } from '../utils/url.js';

interface BuzzingItem {
  title?: string;
  url?: string;
  source?: string;
  site_name?: string;
  channel?: string;
  category?: string;
  date_published?: string;
  date_modified?: string;
}

interface BuzzingFeed {
  items: BuzzingItem[];
}

export class BuzzingFetcher extends BaseFetcher {
  siteId = 'buzzing';
  siteName = 'Buzzing';

  async fetch(now: Date): Promise<RawItem[]> {
    const data = await this.fetchJsonData<BuzzingFeed>('https://www.buzzing.cc/feed.json');
    const items: RawItem[] = [];

    for (const it of data.items || []) {
      const title = (it.title || '').trim();
      const url = (it.url || '').trim();
      if (!title || !url) continue;

      const source = firstNonEmpty(
        it.source,
        it.site_name,
        it.channel,
        it.category,
        getHost(url),
        this.siteName
      );

      const publishedAt = parseDate(it.date_published || it.date_modified, now);

      items.push(
        this.createItem({
          source,
          title,
          url,
          publishedAt,
          meta: {
            raw: {
              source: it.source,
              site_name: it.site_name,
              channel: it.channel,
              category: it.category,
            },
          },
        })
      );
    }

    return items;
  }
}
