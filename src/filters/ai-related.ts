import { CONFIG } from '../config.js';
import { hasMojibakeNoise } from '../utils/text.js';
import type { ArchiveItem } from '../types.js';

function containsAnyKeyword(haystack: string, keywords: string[]): boolean {
  const h = haystack.toLowerCase();
  return keywords.some((k) => h.includes(k));
}

export function isAiRelated(record: ArchiveItem): boolean {
  const siteId = (record.site_id || '').toLowerCase();
  const title = record.title || '';
  const source = record.source || '';
  const siteName = record.site_name || '';
  const url = record.url || '';
  const text = `${title} ${source} ${siteName} ${url}`.toLowerCase();

  if (siteId === 'zeli') {
    return source.toLowerCase().includes('24h') || source.includes('24h最热');
  }

  if (siteId === 'tophub') {
    const sourceL = source.toLowerCase();
    if (hasMojibakeNoise(source) || hasMojibakeNoise(title)) {
      return false;
    }
    if (containsAnyKeyword(sourceL, CONFIG.filter.tophubBlockKeywords)) {
      return false;
    }
    if (!containsAnyKeyword(sourceL, CONFIG.filter.tophubAllowKeywords)) {
      return false;
    }
  }

  if (['aibase', 'aihot', 'aihubtoday'].includes(siteId)) {
    return true;
  }

  const hasAi =
    containsAnyKeyword(text, CONFIG.filter.aiKeywords) ||
    CONFIG.filter.enSignalPattern.test(text);
  const hasTech = containsAnyKeyword(text, CONFIG.filter.techKeywords);

  if (!hasAi && !hasTech) {
    return false;
  }

  if (containsAnyKeyword(text, CONFIG.filter.commerceNoiseKeywords) && !hasAi) {
    return false;
  }

  if (containsAnyKeyword(text, CONFIG.filter.noiseKeywords) && !hasAi) {
    return false;
  }

  return true;
}
