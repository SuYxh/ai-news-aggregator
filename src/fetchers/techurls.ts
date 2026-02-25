import type { RawItem } from '../types.js';
import { BaseFetcher } from './base.js';
import { parseDate } from '../utils/date.js';

export class TechUrlsFetcher extends BaseFetcher {
  siteId = 'techurls';
  siteName = 'TechURLs';

  async fetch(now: Date): Promise<RawItem[]> {
    const $ = await this.fetchHtml('https://techurls.com/');
    const items: RawItem[] = [];

    $('div.publisher-block').each((_, block) => {
      const $block = $(block);
      const primaryEl = $block.find('.publisher-text .primary');
      const secondaryEl = $block.find('.publisher-text .secondary');

      const primary = primaryEl.length
        ? primaryEl.text().trim()
        : $block.attr('data-publisher') || 'unknown';
      const secondary = secondaryEl.length ? secondaryEl.text().trim() : '';

      const source = secondary && secondary !== primary ? `${primary} · ${secondary}` : primary;

      $block.find('div.publisher-link').each((_, linkRow) => {
        const $row = $(linkRow);
        const $a = $row.find('a.article-link');
        if (!$a.length) return;

        const href = $a.attr('href')?.trim();
        if (!href) return;

        const title = $a.text().trim();
        const $aside = $row.find('.aside .text');
        const timeHint = $aside.attr('title') || $aside.text().trim() || '';
        const publishedAt = parseDate(timeHint, now);

        items.push(
          this.createItem({
            source,
            title,
            url: href,
            publishedAt,
            meta: { time_hint: timeHint },
          })
        );
      });
    });

    return items;
  }
}
