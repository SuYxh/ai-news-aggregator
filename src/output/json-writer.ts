import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

export async function writeJson(path: string, data: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const content = JSON.stringify(data, null, 2);
  await writeFile(path, content, 'utf-8');
}
