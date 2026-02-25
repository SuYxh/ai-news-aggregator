import type { RawItem } from '../types.js';
import { BaseFetcher } from './base.js';
import { fetchText } from '../utils/http.js';
import { parseDate } from '../utils/date.js';
import { maybeFixMojibake } from '../utils/text.js';

function extractNextFMerged(html: string): string {
  const chunks = html.match(/self\.__next_f\.push\(\[1,"(.*?)"\]\)<\/script>/gs) || [];
  if (!chunks.length) return '';

  const merged = chunks
    .map((chunk) => {
      const match = chunk.match(/self\.__next_f\.push\(\[1,"(.*?)"\]\)<\/script>/s);
      return match ? match[1] : '';
    })
    .join('');

  try {
    return JSON.parse(`"${merged}"`);
  } catch {
    return merged.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
}

function extractBalancedJson(decoded: string, key: string): unknown {
  const idx = decoded.indexOf(key);
  if (idx === -1) throw new Error(`Key not found: ${key}`);

  let start = idx + key.length;
  while (start < decoded.length && decoded[start] !== ':') start++;
  start++;
  while (start < decoded.length && !['{', '['].includes(decoded[start])) start++;

  const openCh = decoded[start];
  const closeCh = openCh === '{' ? '}' : ']';
  let depth = 0;
  let inStr = false;
  let esc = false;
  let end: number | null = null;

  for (let i = start; i < decoded.length; i++) {
    const ch = decoded[i];
    if (inStr) {
      if (esc) {
        esc = false;
      } else if (ch === '\\') {
        esc = true;
      } else if (ch === '"') {
        inStr = false;
      }
    } else {
      if (ch === '"') {
        inStr = true;
      } else if (ch === openCh) {
        depth++;
      } else if (ch === closeCh) {
        depth--;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }
  }

  if (end === null) throw new Error(`Cannot parse JSON for key: ${key}`);

  let snippet = decoded.slice(start, end);
  snippet = snippet.replace(/\$undefined/g, 'null');
  snippet = snippet.replace(/"\$D([^"]+)"/g, '"$1"');

  return JSON.parse(snippet);
}

function extractNextDataPayload(html: string): Record<string, unknown> | null {
  const match = html.match(
    /<script[^>]*id=["']__NEXT_DATA__["'][^>]*>\s*(\{.*?\})\s*<\/script>/s
  );
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

interface AiHotItem {
  title?: string;
  title_trans?: string;
  link?: string;
  publish_time?: unknown;
}

interface AiHotSource {
  id?: string;
  title?: string;
}

export class AiHotFetcher extends BaseFetcher {
  siteId = 'aihot';
  siteName = 'AI今日热榜';

  async fetch(now: Date): Promise<RawItem[]> {
    const html = await fetchText('https://aihot.today/');
    const items: RawItem[] = [];

    let initialData: Record<string, AiHotItem[]> | null = null;
    let sourceList: AiHotSource[] | null = null;

    const decoded = extractNextFMerged(html);
    if (decoded) {
      try {
        initialData = extractBalancedJson(decoded, 'initialDataMap') as Record<string, AiHotItem[]>;
        sourceList = extractBalancedJson(decoded, 'dataSources') as AiHotSource[];
      } catch {
        initialData = null;
        sourceList = null;
      }
    }

    if (!initialData || !sourceList) {
      const nextData = extractNextDataPayload(html);
      if (nextData) {
        const pageProps = (nextData as Record<string, unknown>).props as Record<string, unknown> | undefined;
        const pp = pageProps?.pageProps as Record<string, unknown> | undefined;
        if (pp?.initialDataMap && typeof pp.initialDataMap === 'object') {
          initialData = pp.initialDataMap as Record<string, AiHotItem[]>;
        }
        if (pp?.dataSources && Array.isArray(pp.dataSources)) {
          sourceList = pp.dataSources as AiHotSource[];
        }
      }
    }

    if (!initialData || !sourceList) return items;

    const sourceMap = new Map<string, string>();
    for (const s of sourceList) {
      if (s.id) sourceMap.set(String(s.id), s.title || String(s.id));
    }

    for (const [sourceId, dataItems] of Object.entries(initialData)) {
      const sourceName = maybeFixMojibake(sourceMap.get(sourceId) || sourceId);
      if (!Array.isArray(dataItems)) continue;

      for (const item of dataItems) {
        const title = maybeFixMojibake((item.title_trans || item.title || '').trim());
        const link = (item.link || '').trim();
        if (!title || !link) continue;

        const publishedAt = parseDate(item.publish_time, now) || now;

        items.push(
          this.createItem({
            source: sourceName,
            title,
            url: link,
            publishedAt,
            meta: { raw_source_id: sourceId },
          })
        );
      }
    }

    return items;
  }
}
