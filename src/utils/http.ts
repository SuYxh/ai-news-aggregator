import { CONFIG } from '../config.js';

interface FetchOptions extends RequestInit {
  retries?: number;
  timeout?: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchWithRetry(url: string, options: FetchOptions = {}): Promise<Response> {
  const { retries = CONFIG.http.retries, timeout = CONFIG.http.timeout, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);
  if (!headers.has('User-Agent')) {
    headers.set('User-Agent', CONFIG.http.userAgent);
  }
  if (!headers.has('Accept-Language')) {
    headers.set('Accept-Language', 'zh-CN,zh;q=0.9,en;q=0.8');
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok && CONFIG.http.retryStatusCodes.includes(response.status)) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      if (attempt < retries) {
        await sleep(CONFIG.http.retryDelay * (attempt + 1));
      }
    }
  }

  throw lastError || new Error('Fetch failed');
}

export async function fetchText(url: string, options: FetchOptions = {}): Promise<string> {
  const response = await fetchWithRetry(url, options);
  return response.text();
}

export async function fetchJson<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const response = await fetchWithRetry(url, options);
  return response.json() as Promise<T>;
}

export async function postJson<T>(
  url: string,
  body: unknown,
  options: FetchOptions = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const response = await fetchWithRetry(url, {
    ...options,
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  return response.json() as Promise<T>;
}
