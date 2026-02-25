import type { RawItem } from '../types.js';
import { BaseFetcher } from './base.js';
import { normalizeUrl } from '../utils/url.js';

function isPlaceholderTitle(title: string): boolean {
  const t = (title || '').trim();
  if (!t) return true;
  if (t.includes('详情见官方介绍')) return true;
  return ['原文链接', '查看详情', '点击查看', '详情'].includes(t);
}

function isGenericAnchorTitle(title: string): boolean {
  const t = (title || '').trim();
  if (!t) return true;
  if (isPlaceholderTitle(t)) return true;
  return /\(AI资讯\)\s*$/.test(t);
}

export class AiHubTodayFetcher extends BaseFetcher {
  siteId = 'aihubtoday';
  siteName = 'AI HubToday';

  async fetch(now: Date): Promise<RawItem[]> {
    const $ = await this.fetchHtml('https://ai.hubtoday.app/');
    const items: RawItem[] = [];
    const seenUrls = new Set<string>();

    let issueDate: Date | null = null;
    const text = $('body').text();
    let match = text.match(/AI资讯日报\s*(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (match) {
      issueDate = new Date(
        parseInt(match[1]),
        parseInt(match[2]) - 1,
        parseInt(match[3])
      );
    }

    const addItem = (
      title: string,
      href: string,
      source: string = 'Daily Digest',
      fallbackTitle: string = ''
    ) => {
      title = (title || '').trim();
      href = (href || '').trim();
      fallbackTitle = (fallbackTitle || '').trim();

      if (isGenericAnchorTitle(title) && fallbackTitle) {
        title = fallbackTitle;
      }

      if (title.length < 5 || !href.startsWith('http')) return;
      if (title === '自媒体账号' || href.includes('source.hubtoday.app')) return;
      if (isGenericAnchorTitle(title)) return;

      const keyUrl = normalizeUrl(href);
      if (seenUrls.has(keyUrl)) return;
      seenUrls.add(keyUrl);

      items.push(
        this.createItem({
          source,
          title,
          url: href,
          publishedAt: issueDate,
          meta: {},
        })
      );
    };

    $('article .content li p').each((_, p) => {
      const $p = $(p);
      const $link = $p.find("a[href^='http']").first();
      if (!$link.length) return;

      const $strong = $p.find('strong').first();
      const strongTitle = $strong.length ? $strong.text().trim() : '';
      addItem(strongTitle, $link.attr('href') || '', 'Daily Digest');
    });

    $("article .content a[target='_blank']").each((_, a) => {
      const $a = $(a);
      let fallbackTitle = '';
      const $p = $a.closest('p');
      if ($p.length) {
        const $strong = $p.find('strong').first();
        if ($strong.length) fallbackTitle = $strong.text().trim();
      }
      addItem($a.text().trim(), $a.attr('href') || '', 'Daily Digest', fallbackTitle);
    });

    $("article a[href^='http']").each((_, a) => {
      const $a = $(a);
      let fallbackTitle = '';
      const $p = $a.closest('p');
      if ($p.length) {
        const $strong = $p.find('strong').first();
        if ($strong.length) fallbackTitle = $strong.text().trim();
      }
      addItem($a.text().trim(), $a.attr('href') || '', 'Daily Digest', fallbackTitle);
    });

    if (items.length === 0) {
      $("a[href^='http']").each((_, a) => {
        const $a = $(a);
        let fallbackTitle = '';
        const $p = $a.closest('p');
        if ($p.length) {
          const $strong = $p.find('strong').first();
          if ($strong.length) fallbackTitle = $strong.text().trim();
        }
        addItem($a.text().trim(), $a.attr('href') || '', 'Page Fallback', fallbackTitle);
      });
    }

    return items;
  }
}
