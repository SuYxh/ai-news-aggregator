export function maybeFixMojibake(text: string): string {
  const s = (text || '').trim();
  if (!s) return s;

  if (!/[Ãâåèæïð]|[\x80-\x9f]|æ|ç|å|é/.test(s)) {
    return s;
  }

  const encodings = ['latin1'] as const;
  for (const enc of encodings) {
    try {
      const bytes = Buffer.from(s, enc);
      const fixed = bytes.toString('utf-8');
      if (fixed && fixed !== s && !fixed.includes('�')) {
        return fixed;
      }
    } catch {
      continue;
    }
  }

  return s;
}

export function hasCjk(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text || '');
}

export function isMostlyEnglish(text: string): boolean {
  const s = (text || '').trim();
  if (!s) return false;
  if (hasCjk(s)) return false;

  const letters = s.match(/[A-Za-z]/g) || [];
  return letters.length >= Math.max(6, Math.floor(s.length / 4));
}

export function firstNonEmpty(...values: unknown[]): string {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const s = String(value).trim();
    if (s) return s;
  }
  return '';
}

export function cleanUpdateTitle(text: string): string {
  let s = text.replace(/《 》/g, '').replace(/《》/g, '');
  return s.replace(/\s+/g, ' ').trim();
}

export function hasMojibakeNoise(text: string): boolean {
  if (!text) return false;
  return /(Ã|Â|â€|æ·|�)/.test(text);
}
