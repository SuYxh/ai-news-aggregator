import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export function toISOString(date: Date | null): string | null {
  if (!date) return null;
  return date.toISOString().replace('.000Z', 'Z');
}

export function parseISO(str: string | null | undefined): Date | null {
  if (!str) return null;
  try {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export function parseUnixTimestamp(value: unknown): Date | null {
  if (value === null || value === undefined) return null;

  let num: number;
  if (typeof value === 'number') {
    num = value;
  } else if (typeof value === 'string') {
    num = parseFloat(value);
    if (isNaN(num)) return null;
  } else {
    return null;
  }

  if (num > 10_000_000_000) {
    num = num / 1000;
  }

  try {
    const d = new Date(num * 1000);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export function parseRelativeTimeZh(text: string, now: Date): Date | null {
  const s = (text || '').trim();
  if (!s) return null;

  let match = s.match(/(\d+)\s*分钟前/);
  if (match) {
    return new Date(now.getTime() - parseInt(match[1]) * 60 * 1000);
  }

  match = s.match(/(\d+)\s*小时前/);
  if (match) {
    return new Date(now.getTime() - parseInt(match[1]) * 60 * 60 * 1000);
  }

  match = s.match(/(\d+)\s*天前/);
  if (match) {
    return new Date(now.getTime() - parseInt(match[1]) * 24 * 60 * 60 * 1000);
  }

  if (s.includes('刚刚')) {
    return now;
  }

  if (s.includes('昨天')) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const timeMatch = s.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      yesterday.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0, 0);
    }
    return yesterday;
  }

  match = s.match(/^(?:今天)?\s*(\d{1,2}):(\d{2})$/);
  if (match) {
    const candidate = new Date(now);
    candidate.setHours(parseInt(match[1]), parseInt(match[2]), 0, 0);
    if (candidate.getTime() > now.getTime() + 5 * 60 * 1000) {
      candidate.setDate(candidate.getDate() - 1);
    }
    return candidate;
  }

  match = s.match(/(?:\d{4}年\s*)?(\d{1,2})月(\d{1,2})日/);
  if (match) {
    const month = parseInt(match[1]);
    const day = parseInt(match[2]);
    let year = now.getFullYear();
    const candidate = new Date(year, month - 1, day);
    if (candidate.getTime() > now.getTime() + 2 * 24 * 60 * 60 * 1000) {
      year -= 1;
    }
    return new Date(year, month - 1, day);
  }

  return null;
}

export function parseDate(value: unknown, now: Date): Date | null {
  if (value === null || value === undefined) return null;

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'number') {
    return parseUnixTimestamp(value);
  }

  const s = String(value).trim();
  if (!s) return null;

  let str = s;
  if (str.startsWith('$D')) {
    str = str.slice(2);
  }

  if (/^\d{12,}$/.test(str)) {
    return parseUnixTimestamp(parseInt(str));
  }

  if (/^\d{9,11}$/.test(str)) {
    return parseUnixTimestamp(parseInt(str));
  }

  const relativeResult = parseRelativeTimeZh(str, now);
  if (relativeResult) return relativeResult;

  const techUrlsMatch = str.match(/(\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2}:\d{2}[AP]M)\s+UTC/);
  if (techUrlsMatch) {
    const parsed = dayjs(techUrlsMatch[1], 'YYYY-MM-DD h:mm:ssA');
    if (parsed.isValid()) {
      return parsed.utc().toDate();
    }
  }

  const d = dayjs(str);
  if (d.isValid()) {
    return d.toDate();
  }

  return null;
}

export function utcNow(): Date {
  return new Date();
}
