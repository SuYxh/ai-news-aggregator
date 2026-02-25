import type { RawItem } from '../types.js';
import { BaseFetcher } from './base.js';
import { parseDate } from '../utils/date.js';
import { joinUrl } from '../utils/url.js';

export class AiBaseFetcher extends BaseFetcher {
  siteId = 'aibase';
  siteName = 'AIbase';

  async fetch(now: Date): Promise<RawItem[]> {
    const $ = await this.fetchHtml('https://www.aibase.com/zh/news');
    const items: RawItem[] = [];

    $("a[href^='/news/']").each((_, a) => {
      const $a = $(a);
      const $h3 = $a.find('h3');
      if (!$h3.length) return;

      const title = $h3.text().trim();
      const href = ($a.attr('href') || '').trim();
      if (!title || !href) return;

      const $timeTag = $a.find('div.text-sm.text-gray-400 span');
      const timeText = $timeTag.length ? $timeTag.text().trim() : '';
      const publishedAt = parseDate(timeText, now);

      items.push(
        this.createItem({
          source: this.siteName,
          title,
          url: joinUrl('https://www.aibase.com', href),
          publishedAt,
          meta: { time_hint: timeText },
        })
      );
    });

    return items;
  }
}
