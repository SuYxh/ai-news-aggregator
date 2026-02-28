import { YouTubeFetcher } from '../src/fetchers/youtube.js';

async function main() {
  const fetcher = new YouTubeFetcher();
  console.log('Testing YouTube Fetcher...');
  console.log('siteId:', fetcher.siteId);
  console.log('siteName:', fetcher.siteName);

  const items = await fetcher.fetch(new Date());
  console.log('\n总共获取:', items.length, '条视频');

  const bySource = new Map<string, number>();
  for (const item of items) {
    bySource.set(item.source, (bySource.get(item.source) || 0) + 1);
  }
  console.log('\n按频道分布:');
  for (const [source, count] of bySource) {
    console.log('  -', source + ':', count, '条');
  }

  console.log('\n示例数据 (前5条):');
  for (const item of items.slice(0, 5)) {
    console.log('---');
    console.log('source:', item.source);
    console.log('title:', item.title);
    console.log('url:', item.url);
    console.log('publishedAt:', item.publishedAt?.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
    console.log('meta:', JSON.stringify(item.meta));
  }
}

main().catch(console.error);
