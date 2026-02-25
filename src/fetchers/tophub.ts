import type { RawItem } from '../types.js';
import { BaseFetcher } from './base.js';
import { fetchWithRetry } from '../utils/http.js';
import { parseRelativeTimeZh } from '../utils/date.js';
import { maybeFixMojibake } from '../utils/text.js';
import { joinUrl } from '../utils/url.js';
import * as cheerio from 'cheerio';

export class TophubFetcher extends BaseFetcher {
  siteId = 'tophub';
  siteName = 'TopHub';

  async fetch(now: Date): Promise<RawItem[]> {
    const response = await fetchWithRetry('https://tophub.today/');
    const buffer = await response.arrayBuffer();

    let html = new TextDecoder('utf-8').decode(buffer);
    if (html.includes('�')) {
      try {
        const gb18030Html = new TextDecoder('gb18030').decode(buffer);
        if ((gb18030Html.match(/�/g) || []).length < (html.match(/�/g) || []).length) {
          html = gb18030Html;
        }
      } catch {
        // keep utf-8
      }
    }

    const $ = cheerio.load(html);
    const items: RawItem[] = [];

    $('.cc-cd').each((_, block) => {
      const $block = $(block);
      const sourceNameTag = $block.find('.cc-cd-lb span');
      const boardTag = $block.find('.cc-cd-sb-st');

      let sourceName = sourceNameTag.length ? sourceNameTag.text().trim() : 'TopHub';
      let boardName = boardTag.length ? boardTag.text().trim() : '';

      sourceName = maybeFixMojibake(sourceName);
      boardName = maybeFixMojibake(boardName);

      const source = boardName ? `${sourceName} · ${boardName}` : sourceName;

      $block.find('.cc-cd-cb-l a').each((_, link) => {
        const $a = $(link);
        const href = ($a.attr('href') || '').trim();
        const $row = $a.find('.cc-cd-cb-ll');
        const $titleTag = $row.find('.t');
        const $metricTag = $row.find('.e');

        let title = $titleTag.length ? $titleTag.text().trim() : $a.text().trim();
        title = maybeFixMojibake(title);

        if (!title || !href) return;

        const fullUrl = href.startsWith('http') ? href : joinUrl('https://tophub.today', href);
        const rowText = $row.length ? $row.text().trim() : title;
        const publishedAt = parseRelativeTimeZh(rowText, now);

        items.push(
          this.createItem({
            source,
            title,
            url: fullUrl,
            publishedAt,
            meta: { metric: $metricTag.length ? $metricTag.text().trim() : '' },
          })
        );
      });
    });

    return items;
  }
}
