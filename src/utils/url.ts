const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'ref',
  'spm',
  'fbclid',
  'gclid',
  'igshid',
  'mkt_tok',
  'mc_cid',
  'mc_eid',
  '_hsenc',
  '_hsmi',
]);

export function normalizeUrl(rawUrl: string): string {
  try {
    const trimmed = rawUrl.trim();
    if (!trimmed) return trimmed;

    const url = new URL(trimmed);

    const params = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey.startsWith('utm_')) return;
      if (TRACKING_PARAMS.has(lowerKey)) return;
      params.append(key, value);
    });

    url.search = params.toString();
    url.hash = '';

    let normalized = url.toString();
    if (normalized.endsWith('/') && url.pathname !== '/') {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  } catch {
    return rawUrl.trim();
  }
}

export function getHost(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

export function joinUrl(base: string, path: string): string {
  try {
    return new URL(path, base).toString();
  } catch {
    return path;
  }
}
