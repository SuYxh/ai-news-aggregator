import * as cheerio from 'cheerio';
import type { RawItem, Fetcher, FetchStatus } from '../types.js';
import { fetchText, fetchJson } from '../utils/http.js';

export abstract class BaseFetcher implements Fetcher {
  abstract siteId: string;
  abstract siteName: string;

  abstract fetch(now: Date): Promise<RawItem[]>;

  protected async fetchHtml(url: string): Promise<cheerio.CheerioAPI> {
    const html = await fetchText(url);
    return cheerio.load(html);
  }

  protected async fetchJsonData<T>(url: string): Promise<T> {
    return fetchJson<T>(url);
  }

  protected createItem(params: {
    source: string;
    title: string;
    url: string;
    publishedAt: Date | null;
    meta?: Record<string, unknown>;
  }): RawItem {
    return {
      siteId: this.siteId,
      siteName: this.siteName,
      source: params.source,
      title: params.title,
      url: params.url,
      publishedAt: params.publishedAt,
      meta: params.meta || {},
    };
  }
}

export async function runFetcher(
  fetcher: Fetcher,
  now: Date,
  verbose: boolean = true
): Promise<{ items: RawItem[]; status: FetchStatus }> {
  const start = performance.now();
  let items: RawItem[] = [];
  let error: string | null = null;

  if (verbose) {
    console.log(`  ⏳ [${fetcher.siteName}] Fetching...`);
  }

  try {
    items = await fetcher.fetch(now);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const durationMs = Math.round(performance.now() - start);

  if (verbose) {
    if (error) {
      console.log(`  ❌ [${fetcher.siteName}] Failed: ${error} (${durationMs}ms)`);
    } else {
      console.log(`  ✅ [${fetcher.siteName}] ${items.length} items (${durationMs}ms)`);
    }
  }

  return {
    items,
    status: {
      site_id: fetcher.siteId,
      site_name: fetcher.siteName,
      ok: error === null,
      item_count: items.length,
      duration_ms: durationMs,
      error,
    },
  };
}
