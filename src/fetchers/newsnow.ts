import type { RawItem } from '../types.js';
import { BaseFetcher } from './base.js';
import { fetchText, postJson, fetchJson } from '../utils/http.js';
import { parseDate } from '../utils/date.js';
import { firstNonEmpty } from '../utils/text.js';
import { joinUrl } from '../utils/url.js';
import * as cheerio from 'cheerio';

function extractSourceIds(js: string): string[] {
  const marker = '{v2ex:vL';
  const start = js.indexOf(marker);
  if (start === -1) {
    return ['hackernews', 'producthunt', 'github', 'sspai', 'juejin', '36kr'];
  }

  let blockStart = start;
  let depth = 0;
  let end: number | null = null;
  let inStr = false;
  let esc = false;

  for (let i = blockStart; i < js.length; i++) {
    const ch = js[i];
    if (inStr) {
      if (esc) {
        esc = false;
      } else if (ch === '\\') {
        esc = true;
      } else if (ch === '"') {
        inStr = false;
      }
      continue;
    }
    if (ch === '"') {
      inStr = true;
      continue;
    }
    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }

  if (end === null) {
    return ['hackernews', 'producthunt', 'github', 'sspai', 'juejin', '36kr'];
  }

  const obj = js.slice(blockStart, end);
  const allKeys = [...obj.matchAll(/(['"]?)([a-zA-Z0-9_-]+)\1\s*:/g)].map((m) => m[2]);

  const ignore = new Set([
    'name',
    'column',
    'home',
    'https',
    'color',
    'interval',
    'title',
    'type',
    'redirect',
    'desc',
  ]);

  const sourceIds: string[] = [];
  for (const key of allKeys) {
    if (ignore.has(key)) continue;
    if (!sourceIds.includes(key)) {
      sourceIds.push(key);
    }
  }

  return sourceIds;
}

interface NewsNowItem {
  id?: string;
  title?: string;
  url?: string;
  pubDate?: string;
  extra?: { date?: unknown };
}

const JUEJIN_SNOWFLAKE_EPOCH = -42416499549n;

function parseJuejinId(id: string | undefined, now: Date): Date | null {
  if (!id || !/^\d{18,20}$/.test(id)) return null;
  try {
    const timestamp = (BigInt(id) >> 22n) + JUEJIN_SNOWFLAKE_EPOCH;
    const date = new Date(Number(timestamp));
    if (date.getTime() > now.getTime() + 24 * 60 * 60 * 1000) return null;
    if (date.getTime() < now.getTime() - 30 * 24 * 60 * 60 * 1000) return null;
    return date;
  } catch {
    return null;
  }
}

interface NewsNowBlock {
  id?: string;
  title?: string;
  name?: string;
  desc?: string;
  updatedTime?: number;
  items?: NewsNowItem[];
}

export class NewsNowFetcher extends BaseFetcher {
  siteId = 'newsnow';
  siteName = 'NewsNow';

  async fetch(now: Date): Promise<RawItem[]> {
    const homeHtml = await fetchText('https://newsnow.busiyi.world/');
    const $ = cheerio.load(homeHtml);

    let bundle: string | null = null;
    $('script[src]').each((_, script) => {
      const src = $(script).attr('src') || '';
      if (src.includes('/assets/index-') && src.endsWith('.js')) {
        bundle = joinUrl('https://newsnow.busiyi.world/', src);
      }
    });

    let sourceIds = ['hackernews', 'producthunt', 'github', 'sspai', 'juejin', '36kr'];
    if (bundle) {
      const js = await fetchText(bundle);
      sourceIds = extractSourceIds(js);
    }

    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Origin: 'https://newsnow.busiyi.world',
      Referer: 'https://newsnow.busiyi.world/',
    };

    let sourceBlocks: NewsNowBlock[] = [];
    try {
      const response = await postJson<{ data?: NewsNowBlock[] } | NewsNowBlock[]>(
        'https://newsnow.busiyi.world/api/s/entire',
        { sources: sourceIds },
        { headers, timeout: 45000 }
      );
      sourceBlocks = Array.isArray(response) ? response : response.data || [];
    } catch {
      for (const sid of sourceIds) {
        try {
          const block = await fetchJson<NewsNowBlock>(
            `https://newsnow.busiyi.world/api/s?id=${sid}`,
            { headers, timeout: 20000 }
          );
          sourceBlocks.push(block);
        } catch {
          continue;
        }
      }
    }

    const items: RawItem[] = [];

    for (const block of sourceBlocks) {
      const sid = String(block.id || 'unknown');
      const sourceTitle = firstNonEmpty(block.title, block.name, block.desc, sid);
      const sourceLabel = sourceTitle !== sid ? `${sourceTitle} (${sid})` : sid;

      for (const it of block.items || []) {
        const title = (it.title || '').trim();
        const url = (it.url || '').trim();
        if (!title || !url) continue;

        let publishedAt = parseDate(it.pubDate, now);
        if (!publishedAt && it.extra?.date) {
          publishedAt = parseDate(it.extra.date, now);
        }
        if (!publishedAt && sid === 'juejin' && it.id) {
          publishedAt = parseJuejinId(it.id, now);
        }

        items.push(
          this.createItem({
            source: sourceLabel,
            title,
            url,
            publishedAt,
            meta: {},
          })
        );
      }
    }

    return items;
  }
}
