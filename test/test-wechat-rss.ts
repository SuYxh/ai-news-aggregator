import { WechatRssFetcher, WECHAT_FEEDS } from '../src/fetchers/wechat-rss.js';

async function main() {
  const fetcher = new WechatRssFetcher();
  console.log('Testing WechatRss Fetcher...');
  console.log('siteId:', fetcher.siteId);
  console.log('siteName:', fetcher.siteName);
  console.log('配置的订阅源数量:', WECHAT_FEEDS.length);

  console.log('\n开始抓取...');
  const startTime = Date.now();
  const items = await fetcher.fetch(new Date());
  const duration = Date.now() - startTime;

  console.log('\n✅ 抓取完成!');
  console.log('总共获取:', items.length, '条文章');
  console.log('耗时:', (duration / 1000).toFixed(2), '秒');

  const bySource = new Map<string, number>();
  const byCategory = new Map<string, number>();
  for (const item of items) {
    bySource.set(item.source, (bySource.get(item.source) || 0) + 1);
    const category = (item.meta?.category as string) || '未分类';
    byCategory.set(category, (byCategory.get(category) || 0) + 1);
  }

  console.log('\n按分类分布:');
  for (const [category, count] of [...byCategory.entries()].sort((a, b) => b[1] - a[1])) {
    console.log('  -', category + ':', count, '条');
  }

  console.log('\n按公众号分布 (Top 20):');
  const sortedSources = [...bySource.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
  for (const [source, count] of sortedSources) {
    console.log('  -', source + ':', count, '条');
  }

  console.log('\n未抓取到文章的公众号:');
  const sourcesWithItems = new Set(items.map((i) => i.source));
  const feedNames = WECHAT_FEEDS.map((f) => f.name);
  const missingFeeds = feedNames.filter((name) => !sourcesWithItems.has(name));
  if (missingFeeds.length === 0) {
    console.log('  无 (全部成功)');
  } else {
    for (const name of missingFeeds) {
      console.log('  -', name);
    }
  }

  console.log('\n示例数据 (前10条):');
  for (const item of items.slice(0, 10)) {
    console.log('---');
    console.log('source:', item.source);
    console.log('title:', item.title.slice(0, 60) + (item.title.length > 60 ? '...' : ''));
    console.log('url:', item.url.slice(0, 80) + (item.url.length > 80 ? '...' : ''));
    console.log(
      'publishedAt:',
      item.publishedAt?.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) || 'null'
    );
    console.log('category:', item.meta?.category);
  }
}

main().catch(console.error);
