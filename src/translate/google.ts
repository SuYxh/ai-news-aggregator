import { fetchJson } from '../utils/http.js';
import { hasCjk, isMostlyEnglish } from '../utils/text.js';
import { normalizeUrl } from '../utils/url.js';
import type { ArchiveItem } from '../types.js';

const TRANSLATE_API = 'https://translate.googleapis.com/translate_a/single';

export async function translateToZhCN(text: string): Promise<string | null> {
  const s = (text || '').trim();
  if (!s) return null;

  try {
    const params = new URLSearchParams({
      client: 'gtx',
      sl: 'auto',
      tl: 'zh-CN',
      dt: 't',
      q: s,
    });

    const response = await fetchJson<unknown[]>(`${TRANSLATE_API}?${params}`, {
      timeout: 12000,
    });

    if (!Array.isArray(response) || !response.length) return null;

    const segs = response[0];
    if (!Array.isArray(segs)) return null;

    const translated = segs
      .filter((seg): seg is unknown[] => Array.isArray(seg) && seg.length > 0 && seg[0])
      .map((seg) => String(seg[0]))
      .join('')
      .trim();

    if (translated && translated !== s) {
      return translated;
    }
  } catch {
    return null;
  }

  return null;
}

export async function addBilingualFields(
  itemsAi: ArchiveItem[],
  itemsAll: ArchiveItem[],
  cache: Map<string, string>,
  maxNewTranslations: number
): Promise<{
  itemsAi: ArchiveItem[];
  itemsAll: ArchiveItem[];
  cache: Map<string, string>;
}> {
  const zhByUrl = new Map<string, string>();
  for (const it of itemsAll) {
    const title = (it.title || '').trim();
    const url = normalizeUrl(it.url || '');
    if (title && url && hasCjk(title)) {
      zhByUrl.set(url, title);
    }
  }

  let translatedNow = 0;

  const enrich = async (item: ArchiveItem, allowTranslate: boolean): Promise<ArchiveItem> => {
    const out = { ...item };
    const title = (out.title || '').trim();
    const url = normalizeUrl(out.url || '');

    out.title_original = title;
    out.title_en = null;
    out.title_zh = null;
    out.title_bilingual = title;

    if (hasCjk(title)) {
      out.title_zh = title;
      return out;
    }

    if (!isMostlyEnglish(title)) {
      return out;
    }

    out.title_en = title;

    let zhTitle = zhByUrl.get(url) || null;
    if (!zhTitle) {
      zhTitle = cache.get(title) || null;
    }

    if (!zhTitle && allowTranslate && translatedNow < maxNewTranslations) {
      const tr = await translateToZhCN(title);
      if (tr && hasCjk(tr)) {
        zhTitle = tr;
        cache.set(title, tr);
        translatedNow++;
      }
    }

    if (zhTitle) {
      out.title_zh = zhTitle;
      out.title_bilingual = `${zhTitle} / ${title}`;
    }

    return out;
  };

  const aiOut: ArchiveItem[] = [];
  for (const it of itemsAi) {
    aiOut.push(await enrich(it, true));
  }

  const allOut: ArchiveItem[] = [];
  for (const it of itemsAll) {
    allOut.push(await enrich(it, false));
  }

  return { itemsAi: aiOut, itemsAll: allOut, cache };
}

export function loadTitleZhCache(data: Record<string, string>): Map<string, string> {
  const cache = new Map<string, string>();
  for (const [k, v] of Object.entries(data)) {
    if (k.trim() && v.trim()) {
      cache.set(k, v);
    }
  }
  return cache;
}

export function cacheToPojo(cache: Map<string, string>): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const [k, v] of cache) {
    obj[k] = v;
  }
  return obj;
}
