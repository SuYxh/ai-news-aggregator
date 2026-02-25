import { fetchText } from '../utils/http.js';
import { toISOString } from '../utils/date.js';
import { cleanUpdateTitle } from '../utils/text.js';
import { CONFIG } from '../config.js';
import type { WaytoagiPayload, WaytoagiUpdate } from '../types.js';

function extractFeishuClientVars(pageHtml: string): Record<string, unknown> {
  const marker = 'window.DATA = Object.assign({}, window.DATA, { clientVars: Object(';
  const idx = pageHtml.indexOf(marker);
  if (idx === -1) throw new Error('Cannot locate Feishu clientVars marker');

  const start = idx + marker.length;
  let depth = 1;
  let inStr = false;
  let escaped = false;
  let end: number | null = null;

  for (let i = start; i < pageHtml.length; i++) {
    const ch = pageHtml[i];
    if (inStr) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inStr = false;
      }
      continue;
    }
    if (ch === '"') {
      inStr = true;
      continue;
    }
    if (ch === '(') {
      depth++;
    } else if (ch === ')') {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  if (end === null) throw new Error('Cannot parse Feishu clientVars payload');
  const payload = pageHtml.slice(start, end);
  return JSON.parse(payload);
}

function blockText(blockData: Record<string, unknown>): string {
  const textObj = (blockData.text || {}) as Record<string, unknown>;
  const initial = ((textObj.initialAttributedTexts || {}) as Record<string, unknown>).text || {};
  if (typeof initial !== 'object' || initial === null) return '';

  const entries = Object.entries(initial as Record<string, unknown>);
  entries.sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
  return entries.map(([, v]) => String(v)).join('').trim();
}

function parseYmHeading(text: string): [number, number] | null {
  const m = text.match(/(20\d{2})\s*年\s*(\d{1,2})\s*月/);
  if (!m) return null;
  return [parseInt(m[1]), parseInt(m[2])];
}

function parseMdHeading(text: string): [number, number] | null {
  const m = text.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
  if (!m) return null;
  return [parseInt(m[1]), parseInt(m[2])];
}

function inferShanghaiYearForMonthDay(nowSh: Date, month: number, day: number): number | null {
  const year = nowSh.getFullYear();
  try {
    const candidate = new Date(year, month - 1, day);
    const twoDaysLater = new Date(nowSh);
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);
    if (candidate > twoDaysLater) {
      return year - 1;
    }
    return year;
  } catch {
    return null;
  }
}

function extractWaytoagiRecentUpdates(
  blockMap: Record<string, Record<string, unknown>>,
  nowSh: Date,
  pageUrl: string
): WaytoagiUpdate[] {
  if (!blockMap || typeof blockMap !== 'object') return [];

  const ymByHeading2 = new Map<string, [number, number]>();
  const nearLogParentIds = new Set<string>();

  for (const [bid, block] of Object.entries(blockMap)) {
    const bd = (block.data || {}) as Record<string, unknown>;
    const btype = bd.type;
    if (!['heading1', 'heading2', 'heading3'].includes(btype as string)) continue;
    const headingText = blockText(bd);
    if (headingText.includes('近7日更新日志') || headingText.includes('近 7 日更新日志')) {
      const parentId = String(bd.parent_id || '').trim();
      if (parentId) nearLogParentIds.add(parentId);
    }
  }

  const heading3Dates = new Map<string, string>();

  for (const [bid, block] of Object.entries(blockMap)) {
    const bd = (block.data || {}) as Record<string, unknown>;
    if (bd.type !== 'heading2') continue;
    const ym = parseYmHeading(blockText(bd));
    if (ym) ymByHeading2.set(bid, ym);
  }

  for (const [bid, block] of Object.entries(blockMap)) {
    const bd = (block.data || {}) as Record<string, unknown>;
    if (bd.type !== 'heading3') continue;
    const md = parseMdHeading(blockText(bd));
    if (!md) continue;
    const [month, day] = md;
    const parent = String(bd.parent_id || '');
    if (nearLogParentIds.size > 0 && !nearLogParentIds.has(parent)) continue;
    let year = (ymByHeading2.get(parent) || [nowSh.getFullYear(), month])[0];
    const inferred = inferShanghaiYearForMonthDay(nowSh, month, day);
    if (inferred !== null) year = inferred;
    try {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      heading3Dates.set(bid, dateStr);
    } catch {
      continue;
    }
  }

  const parentMap = new Map<string, string>();
  for (const [bid, block] of Object.entries(blockMap)) {
    const bd = (block.data || {}) as Record<string, unknown>;
    const parent = String(bd.parent_id || '').trim();
    if (parent) parentMap.set(bid, parent);
  }

  function nearestHeadingDate(blockId: string): string | null {
    let cur = parentMap.get(blockId);
    let hops = 0;
    while (cur && hops < 20) {
      if (heading3Dates.has(cur)) return heading3Dates.get(cur)!;
      cur = parentMap.get(cur);
      hops++;
    }
    return null;
  }

  const updates: WaytoagiUpdate[] = [];
  const seen = new Set<string>();

  for (const [bid, block] of Object.entries(blockMap)) {
    const bd = (block.data || {}) as Record<string, unknown>;
    if (!['bullet', 'text', 'todo', 'ordered'].includes(bd.type as string)) continue;

    const day = nearestHeadingDate(bid);
    if (!day) continue;
    const title = cleanUpdateTitle(blockText(bd));
    if (!title) continue;
    const key = `${day}::${title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    updates.push({ date: day, title, url: pageUrl });
  }

  return updates;
}

function extractHistoryUrl(rootHtml: string): string {
  const pattern = /\{\\"id\\":\\"[^"]+\\",\\"type\\":\\"mention_doc\\",\\"data\\":\{[^}]+\}\}/g;
  const matches = rootHtml.match(pattern) || [];

  for (const raw of matches) {
    try {
      const decoded = raw.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      const obj = JSON.parse(decoded);
      const data = obj.data || {};
      const title = String(data.title || '');
      if (title.includes('历史更新') || title.includes('更新日志')) {
        const rawUrl = String(data.raw_url || '').trim();
        if (rawUrl) return rawUrl;
      }
    } catch {
      continue;
    }
  }

  return CONFIG.waytoagi.historyFallback;
}

export async function fetchWaytoagiRecent7d(now: Date): Promise<WaytoagiPayload> {
  const nowSh = new Date(now.toLocaleString('en-US', { timeZone: CONFIG.timezone }));
  const rootUrl = CONFIG.waytoagi.defaultUrl;

  try {
    const rootHtml = await fetchText(rootUrl);
    const historyUrl = extractHistoryUrl(rootHtml);

    const rootClientVars = extractFeishuClientVars(rootHtml);
    const rootBlockMap = ((rootClientVars.data || {}) as Record<string, unknown>).block_map as Record<string, Record<string, unknown>> || {};

    let updates = extractWaytoagiRecentUpdates(rootBlockMap, nowSh, rootUrl);

    if (historyUrl && historyUrl !== rootUrl) {
      try {
        const historyHtml = await fetchText(historyUrl);
        const historyClientVars = extractFeishuClientVars(historyHtml);
        const historyBlockMap = ((historyClientVars.data || {}) as Record<string, unknown>).block_map as Record<string, Record<string, unknown>> || {};
        updates = updates.concat(extractWaytoagiRecentUpdates(historyBlockMap, nowSh, historyUrl));
      } catch {
        // ignore history fetch error
      }
    }

    const dedupUpdates = new Map<string, WaytoagiUpdate>();
    for (const item of updates) {
      const key = `${item.date}::${item.title}`;
      if (!dedupUpdates.has(key)) {
        dedupUpdates.set(key, item);
      }
    }

    const startDate = new Date(nowSh);
    startDate.setDate(startDate.getDate() - 6);
    const startDateStr = startDate.toISOString().slice(0, 10);
    const endDateStr = nowSh.toISOString().slice(0, 10);

    const recent = Array.from(dedupUpdates.values()).filter(
      (u) => u.date >= startDateStr && u.date <= endDateStr
    );
    recent.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return a.title.localeCompare(b.title);
    });

    const latestDate = recent.length > 0 ? recent[0].date : null;
    const updatesToday = latestDate ? recent.filter((u) => u.date === latestDate) : [];

    return {
      generated_at: toISOString(now)!,
      timezone: CONFIG.timezone,
      root_url: rootUrl,
      history_url: historyUrl,
      window_days: 7,
      latest_date: latestDate,
      count_today: updatesToday.length,
      updates_today: updatesToday,
      count_7d: recent.length,
      updates_7d: recent,
      warning: recent.length === 0 ? '近7日未解析到更新条目' : null,
      has_error: false,
      error: null,
    };
  } catch (e) {
    return {
      generated_at: toISOString(now)!,
      timezone: CONFIG.timezone,
      root_url: rootUrl,
      history_url: null,
      window_days: 7,
      latest_date: null,
      count_today: 0,
      updates_today: [],
      count_7d: 0,
      updates_7d: [],
      warning: 'WaytoAGI 近7日更新抓取失败',
      has_error: true,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
