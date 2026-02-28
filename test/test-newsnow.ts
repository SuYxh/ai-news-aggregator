import { fetchText, postJson, fetchJson } from '../src/utils/http.js';
import { parseDate, parseUnixTimestamp } from '../src/utils/date.js';
import { joinUrl } from '../src/utils/url.js';
import { firstNonEmpty } from '../src/utils/text.js';
import * as cheerio from 'cheerio';
import type { RawItem } from '../src/types.js';

const JUEJIN_SNOWFLAKE_EPOCH = -42416499549n;

function parseJuejinId(id: string | undefined, now: Date): Date | null {
  if (!id || !/^\d{18,20}$/.test(id)) return null;
  try {
    const timestamp = (BigInt(id) >> 22n) + JUEJIN_SNOWFLAKE_EPOCH;
    const date = new Date(Number(timestamp));
    if (date.getTime() > now.getTime() + 24 * 60 * 60 * 1000) return null;
    if (date.getTime() < now.getTime() - 30 * 24 * 60 * 60 * 1000) return null;
    return date;
  } catch {
    return null;
  }
}

interface NewsNowItem {
  id?: string;
  title?: string;
  url?: string;
  pubDate?: string;
  extra?: { date?: unknown; [key: string]: unknown };
  [key: string]: unknown;
}

interface NewsNowBlock {
  id?: string;
  title?: string;
  name?: string;
  desc?: string;
  updatedTime?: number;
  items?: NewsNowItem[];
}

function extractSourceIds(js: string): string[] {
  const marker = '{v2ex:vL';
  const start = js.indexOf(marker);
  if (start === -1) {
    return ['hackernews', 'producthunt', 'github', 'sspai', 'juejin', '36kr'];
  }

  let blockStart = start;
  let depth = 0;
  let end: number | null = null;
  let inStr = false;
  let esc = false;

  for (let i = blockStart; i < js.length; i++) {
    const ch = js[i];
    if (inStr) {
      if (esc) {
        esc = false;
      } else if (ch === '\\') {
        esc = true;
      } else if (ch === '"') {
        inStr = false;
      }
      continue;
    }
    if (ch === '"') {
      inStr = true;
      continue;
    }
    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }

  if (end === null) {
    return ['hackernews', 'producthunt', 'github', 'sspai', 'juejin', '36kr'];
  }

  const obj = js.slice(blockStart, end);
  const allKeys = [...obj.matchAll(/(['"]?)([a-zA-Z0-9_-]+)\1\s*:/g)].map((m) => m[2]);

  const ignore = new Set([
    'name',
    'column',
    'home',
    'https',
    'color',
    'interval',
    'title',
    'type',
    'redirect',
    'desc',
  ]);

  const sourceIds: string[] = [];
  for (const key of allKeys) {
    if (ignore.has(key)) continue;
    if (!sourceIds.includes(key)) {
      sourceIds.push(key);
    }
  }

  return sourceIds;
}

async function testNewsNow() {
  console.log('====== NewsNow 数据抓取测试 ======\n');
  const now = new Date();
  console.log(`当前时间: ${now.toISOString()} (本地: ${now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })})\n`);

  console.log('1. 获取首页 HTML...');
  const homeHtml = await fetchText('https://newsnow.busiyi.world/');
  const $ = cheerio.load(homeHtml);

  let bundle: string | null = null;
  $('script[src]').each((_, script) => {
    const src = $(script).attr('src') || '';
    if (src.includes('/assets/index-') && src.endsWith('.js')) {
      bundle = joinUrl('https://newsnow.busiyi.world/', src);
    }
  });
  console.log(`   Bundle URL: ${bundle}\n`);

  console.log('2. 提取 Source IDs...');
  let sourceIds = ['hackernews', 'producthunt', 'github', 'sspai', 'juejin', '36kr'];
  if (bundle) {
    const js = await fetchText(bundle);
    sourceIds = extractSourceIds(js);
  }
  console.log(`   找到 ${sourceIds.length} 个数据源: ${sourceIds.join(', ')}\n`);

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    Origin: 'https://newsnow.busiyi.world',
    Referer: 'https://newsnow.busiyi.world/',
  };

  console.log('3. 调用 API 获取数据...');
  let sourceBlocks: NewsNowBlock[] = [];
  try {
    const response = await postJson<{ data?: NewsNowBlock[] } | NewsNowBlock[]>(
      'https://newsnow.busiyi.world/api/s/entire',
      { sources: sourceIds },
      { headers, timeout: 45000 }
    );
    sourceBlocks = Array.isArray(response) ? response : response.data || [];
    console.log(`   成功获取 ${sourceBlocks.length} 个数据块\n`);
  } catch (e) {
    console.log(`   批量请求失败: ${e}\n`);
  }

  console.log('====== 原始数据分析 ======\n');

  for (const block of sourceBlocks.slice(0, 5)) {
    const sid = String(block.id || 'unknown');
    console.log(`\n--- 数据源: ${sid} (${block.title || block.name || '未知'}) ---`);
    console.log(`updatedTime: ${block.updatedTime}`);
    if (block.updatedTime) {
      const parsed = parseUnixTimestamp(block.updatedTime);
      console.log(`  -> 解析为: ${parsed?.toISOString()} (本地: ${parsed?.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })})`);
    }

    const items = block.items || [];
    console.log(`\n共 ${items.length} 条数据，显示前 3 条:\n`);

    for (const item of items.slice(0, 3)) {
      console.log(`  标题: ${item.title}`);
      console.log(`  URL: ${item.url}`);
      console.log(`  pubDate 原始值: ${JSON.stringify(item.pubDate)} (类型: ${typeof item.pubDate})`);
      console.log(`  extra 原始值: ${JSON.stringify(item.extra)}`);

      const parsedPubDate = parseDate(item.pubDate, now);
      console.log(`  pubDate 解析结果: ${parsedPubDate?.toISOString()} (本地: ${parsedPubDate?.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })})`);

      if (item.extra?.date) {
        const parsedExtra = parseDate(item.extra.date, now);
        console.log(`  extra.date 解析结果: ${parsedExtra?.toISOString()} (本地: ${parsedExtra?.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })})`);
      }

      console.log(`  其他字段: ${JSON.stringify(Object.keys(item).filter(k => !['title', 'url', 'pubDate', 'extra'].includes(k)))}`);
      console.log('');
    }
  }

  console.log('\n====== 详细检查 36kr 数据 ======\n');
  const kr36Block = sourceBlocks.find(b => b.id === '36kr');
  if (kr36Block) {
    console.log('36kr 数据块的 items:');
    for (const item of (kr36Block.items || []).slice(0, 5)) {
      console.log(`\n  标题: ${item.title}`);
      console.log(`  extra.date: ${item.extra?.date}`);
      if (item.extra?.date) {
        const ts = item.extra.date as number;
        const d = new Date(ts);
        console.log(`  解析为毫秒时间戳: ${d.toISOString()} (本地: ${d.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })})`);
      }
    }
  } else {
    console.log('未找到 36kr 数据块');
  }

  console.log('\n====== 各平台时间字段分析 ======\n');
  const platformsToCheck = ['hackernews', 'producthunt', 'github', 'sspai', 'juejin', '36kr'];
  
  console.log('| 平台 | ID 格式 | 时间来源 | 能否提取时间 |');
  console.log('|------|---------|----------|--------------|');
  
  for (const pid of platformsToCheck) {
    const block = sourceBlocks.find(b => b.id === pid);
    if (block) {
      const items = block.items || [];
      const firstItem = items[0];
      let idFormat = '无';
      let timeSource = '无';
      let canExtract = '❌';
      
      if (firstItem) {
        if (firstItem.id) {
          const id = String(firstItem.id);
          if (id.length >= 18 && /^\d+$/.test(id)) {
            idFormat = `雪花ID (${id.length}位)`;
          } else if (/^\d+$/.test(id)) {
            idFormat = `递增ID (${id.length}位)`;
          } else {
            idFormat = `路径/字符串`;
          }
        }
        
        if (firstItem.pubDate) {
          timeSource = 'pubDate';
          canExtract = '✅';
        } else if (firstItem.extra?.date) {
          timeSource = 'extra.date';
          canExtract = '✅';
        } else if (pid === 'juejin' && firstItem.id && String(firstItem.id).length >= 18) {
          timeSource = 'ID解析';
          canExtract = '✅';
        }
      }
      
      console.log(`| ${pid.padEnd(12)} | ${idFormat.padEnd(15)} | ${timeSource.padEnd(10)} | ${canExtract} |`);
    }
  }
  
  console.log('\n结论:');
  console.log('- 36kr: 有 extra.date 字段 ✅');
  console.log('- juejin: ID 是雪花格式，可解析时间 ✅');
  console.log('- hackernews/producthunt/github/sspai: NewsNow API 不返回时间字段 ❌');
  console.log('  (这些平台的原始 API 有时间，但 NewsNow 没有聚合该字段)');

  console.log('\n====== 验证修复后的逻辑 ======\n');

  const items: RawItem[] = [];
  for (const block of sourceBlocks) {
    const sid = String(block.id || 'unknown');
    const sourceTitle = firstNonEmpty(block.title, block.name, block.desc, sid);
    const sourceLabel = sourceTitle !== sid ? `${sourceTitle} (${sid})` : sid;

    for (const it of block.items || []) {
      const title = (it.title || '').trim();
      const url = (it.url || '').trim();
      if (!title || !url) continue;

      let publishedAt = parseDate(it.pubDate, now);
      if (!publishedAt && it.extra?.date) {
        publishedAt = parseDate(it.extra.date, now);
      }
      if (!publishedAt && sid === 'juejin' && it.id) {
        publishedAt = parseJuejinId(it.id, now);
      }

      items.push({
        siteId: 'newsnow',
        siteName: 'NewsNow',
        source: sourceLabel,
        title,
        url,
        publishedAt,
        meta: {},
      });
    }
  }

  console.log(`总共获取 ${items.length} 条数据\n`);

  const withTime = items.filter(i => i.publishedAt !== null);
  const withoutTime = items.filter(i => i.publishedAt === null);

  console.log(`有时间的文章: ${withTime.length} 条`);
  console.log(`无时间的文章: ${withoutTime.length} 条\n`);

  console.log('有时间的文章示例 (前5条):');
  for (const item of withTime.slice(0, 5)) {
    const localTime = item.publishedAt?.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    console.log(`  [${item.source}] ${item.title.slice(0, 30)}... -> ${localTime}`);
  }

  console.log('\n无时间的文章示例 (前5条):');
  for (const item of withoutTime.slice(0, 5)) {
    console.log(`  [${item.source}] ${item.title.slice(0, 40)}...`);
  }

  console.log('\n====== 修复完成 ======');
  console.log('现在没有精确时间的文章 publishedAt 会是 null，而不是错误地使用 updatedTime');
}

testNewsNow().catch(console.error);
