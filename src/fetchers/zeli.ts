import type { RawItem } from '../types.js';
import { BaseFetcher } from './base.js';
import { parseUnixTimestamp } from '../utils/date.js';

interface ZeliPost {
  id?: string;
  title?: string;
  url?: string;
  time?: number;
}

interface ZeliResponse {
  posts?: ZeliPost[];
}

export class ZeliFetcher extends BaseFetcher {
  siteId = 'zeli';
  siteName = 'Zeli';

  async fetch(now: Date): Promise<RawItem[]> {
    const data = await this.fetchJsonData<ZeliResponse>(
      'https://zeli.app/api/hacker-news?type=hot24h'
    );
    const items: RawItem[] = [];

    for (const p of data.posts || []) {
      const title = (p.title || '').trim();
      const url = (p.url || '').trim();
      if (!title || !url) continue;

      const publishedAt = parseUnixTimestamp(p.time) || now;

      items.push(
        this.createItem({
          source: 'Hacker News · 24h最热',
          title,
          url,
          publishedAt,
          meta: { hn_id: p.id },
        })
      );
    }

    return items;
  }
}
