import type { ArchiveItem } from '../types.js';
import { normalizeUrl } from '../utils/url.js';
import { parseISO } from '../utils/date.js';

function eventTime(record: ArchiveItem): Date | null {
  if (record.site_id === 'opmlrss') {
    return parseISO(record.published_at);
  }
  return parseISO(record.published_at) || parseISO(record.first_seen_at);
}

export function dedupeItemsByTitleUrl(
  items: ArchiveItem[],
  randomPick: boolean = true
): ArchiveItem[] {
  const groups = new Map<string, ArchiveItem[]>();

  for (const item of items) {
    const siteId = (item.site_id || '').toLowerCase();
    const title = (item.title_original || item.title || '').toLowerCase();
    const url = normalizeUrl(item.url || '');

    const key = siteId === 'aihubtoday' ? `url::${url}` : `${title}||${url}`;

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  }

  const result: ArchiveItem[] = [];

  for (const values of groups.values()) {
    if (values.length === 0) continue;

    if (randomPick) {
      const randomIndex = Math.floor(Math.random() * values.length);
      result.push(values[randomIndex]);
    } else {
      const chosen = values.reduce((best, current) => {
        const bestTime = eventTime(best);
        const currentTime = eventTime(current);
        if (!bestTime && !currentTime) {
          return (best.id || '') > (current.id || '') ? best : current;
        }
        if (!bestTime) return current;
        if (!currentTime) return best;
        if (currentTime > bestTime) return current;
        if (currentTime < bestTime) return best;
        return (best.id || '') > (current.id || '') ? best : current;
      });
      result.push(chosen);
    }
  }

  result.sort((a, b) => {
    const timeA = eventTime(a)?.getTime() ?? 0;
    const timeB = eventTime(b)?.getTime() ?? 0;
    return timeB - timeA;
  });

  return result;
}

function isHubtodayPlaceholderTitle(title: string): boolean {
  const t = (title || '').trim();
  if (!t) return true;
  if (t.includes('详情见官方介绍')) return true;
  return ['原文链接', '查看详情', '点击查看', '详情'].includes(t);
}

function isHubtodayGenericAnchorTitle(title: string): boolean {
  const t = (title || '').trim();
  if (!t) return true;
  if (isHubtodayPlaceholderTitle(t)) return true;
  return /\(AI资讯\)\s*$/.test(t);
}

export function normalizeAihubTodayRecords(items: ArchiveItem[]): ArchiveItem[] {
  const byUrl = new Map<string, ArchiveItem[]>();
  const keep: ArchiveItem[] = [];

  for (const item of items) {
    if (item.site_id !== 'aihubtoday') {
      keep.push(item);
      continue;
    }
    const url = normalizeUrl(item.url || '');
    if (!url) continue;
    if (!byUrl.has(url)) {
      byUrl.set(url, []);
    }
    byUrl.get(url)!.push(item);
  }

  for (const group of byUrl.values()) {
    if (group.length === 0) continue;

    const preferred = group.filter((g) => !isHubtodayGenericAnchorTitle(g.title || ''));
    const source = preferred.length > 0 ? preferred : group;

    const best = source.reduce((best, current) => {
      const bestTime = eventTime(best);
      const currentTime = eventTime(current);
      if (!bestTime && !currentTime) {
        return (best.id || '') > (current.id || '') ? best : current;
      }
      if (!bestTime) return current;
      if (!currentTime) return best;
      if (currentTime > bestTime) return current;
      if (currentTime < bestTime) return best;
      return (best.id || '') > (current.id || '') ? best : current;
    });

    keep.push(best);
  }

  keep.sort((a, b) => {
    const timeA = eventTime(a)?.getTime() ?? 0;
    const timeB = eventTime(b)?.getTime() ?? 0;
    return timeB - timeA;
  });

  return keep;
}
