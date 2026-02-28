import type { RawItem } from '../types.js';
import { BaseFetcher } from './base.js';
import { fetchText, postJson, fetchJson } from '../utils/http.js';
import { parseDate, parseUnixTimestamp } from '../utils/date.js';
import { firstNonEmpty } from '../utils/text.js';
import { joinUrl } from '../utils/url.js';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';

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

interface HNItem {
  time?: number;
}

interface GitHubRepo {
  pushed_at?: string;
  updated_at?: string;
  created_at?: string;
}

async function fetchHackerNewsTime(id: string): Promise<Date | null> {
  try {
    const data = await fetchJson<HNItem>(
      `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
      { timeout: 5000 }
    );
    return data?.time ? parseUnixTimestamp(data.time) : null;
  } catch {
    return null;
  }
}

async function fetchGitHubTime(repoPath: string): Promise<Date | null> {
  try {
    const cleanPath = repoPath.replace(/^\//, '');
    const data = await fetchJson<GitHubRepo>(
      `https://api.github.com/repos/${cleanPath}`,
      { timeout: 5000 }
    );
    const timeStr = data?.pushed_at || data?.updated_at || data?.created_at;
    return timeStr ? new Date(timeStr) : null;
  } catch {
    return null;
  }
}

interface SspaiRssTimeMap {
  [postId: string]: Date;
}

async function fetchSspaiRssTimes(): Promise<SspaiRssTimeMap> {
  const timeMap: SspaiRssTimeMap = {};
  try {
    const rss = await fetchText('https://sspai.com/feed', { timeout: 10000 });
    const itemMatches = rss.matchAll(/<item>[\s\S]*?<\/item>/g);
    for (const match of itemMatches) {
      const item = match[0];
      const linkMatch = item.match(/<link>https:\/\/sspai\.com\/post\/(\d+)<\/link>/);
      const pubDateMatch = item.match(/<pubDate>([^<]+)<\/pubDate>/);
      if (linkMatch && pubDateMatch) {
        const postId = linkMatch[1];
        const date = new Date(pubDateMatch[1]);
        if (!isNaN(date.getTime())) {
          timeMap[postId] = date;
        }
      }
    }
  } catch {
  }
  return timeMap;
}

type TimeMap = Map<string, Date | null>;

async function enrichTimesFromAPIs(
  items: Array<{ sid: string; id?: string; url: string }>,
  now: Date
): Promise<{ timeMap: TimeMap; sspaiTimes: SspaiRssTimeMap }> {
  const timeMap: TimeMap = new Map();
  const limit = pLimit(10);

  const tasks: Promise<void>[] = [];

  const hasSspai = items.some(i => i.sid === 'sspai');
  let sspaiTimes: SspaiRssTimeMap = {};
  if (hasSspai) {
    tasks.push(
      (async () => {
        sspaiTimes = await fetchSspaiRssTimes();
      })()
    );
  }

  for (const item of items) {
    const key = `${item.sid}:${item.id || item.url}`;

    if (item.sid === 'hackernews' && item.id && /^\d+$/.test(item.id)) {
      tasks.push(
        limit(async () => {
          const time = await fetchHackerNewsTime(item.id!);
          timeMap.set(key, time);
        })
      );
    } else if (item.sid === 'github' && item.id) {
      tasks.push(
        limit(async () => {
          const time = await fetchGitHubTime(item.id!);
          timeMap.set(key, time);
        })
      );
    }
  }

  await Promise.all(tasks);
  return { timeMap, sspaiTimes };
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

    const itemsToEnrich: Array<{ sid: string; id?: string; url: string }> = [];
    for (const block of sourceBlocks) {
      const sid = String(block.id || 'unknown');
      for (const it of block.items || []) {
        if (!it.title || !it.url) continue;
        if (sid === 'hackernews' || sid === 'github' || sid === 'sspai') {
          itemsToEnrich.push({ sid, id: it.id, url: it.url });
        }
      }
    }

    const { timeMap, sspaiTimes } = await enrichTimesFromAPIs(itemsToEnrich, now);

    const items: RawItem[] = [];

    for (const block of sourceBlocks) {
      const sid = String(block.id || 'unknown');
      const sourceTitle = firstNonEmpty(block.title, block.name, block.desc, sid);
      const sourceLabel = sourceTitle !== sid ? `${sourceTitle} (${sid})` : sid;
      const updated = parseUnixTimestamp(block.updatedTime) || now;

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
        if (!publishedAt && (sid === 'hackernews' || sid === 'github')) {
          const key = `${sid}:${it.id || url}`;
          publishedAt = timeMap.get(key) || null;
        }
        if (!publishedAt && sid === 'sspai' && it.id) {
          const postId = String(it.id);
          publishedAt = sspaiTimes[postId] || null;
        }
        if (!publishedAt) {
          publishedAt = updated;
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
