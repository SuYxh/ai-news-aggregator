import { createHash } from 'crypto';
import { normalizeUrl } from './url.js';

export function makeItemId(siteId: string, source: string, title: string, url: string): string {
  const key = [
    siteId.trim().toLowerCase(),
    source.trim().toLowerCase(),
    title.trim().toLowerCase(),
    normalizeUrl(url),
  ].join('||');

  return createHash('sha1').update(key, 'utf-8').digest('hex');
}

export function hashString(s: string): string {
  return createHash('sha1').update(s, 'utf-8').digest('hex');
}
