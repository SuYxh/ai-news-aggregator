import { XinzhiyuanFetcher } from '../src/fetchers/xinzhiyuan.js';

async function main() {
  const fetcher = new XinzhiyuanFetcher();
  console.log('Testing 新智元 Fetcher...');
  console.log('siteId:', fetcher.siteId);
  console.log('siteName:', fetcher.siteName);

  const items = await fetcher.fetch(new Date());
  console.log('\n总共获取:', items.length, '篇文章');

  const dates = items.map(i => i.publishedAt!);
  const oldest = new Date(Math.min(...dates.map(d => d.getTime())));
  const newest = new Date(Math.max(...dates.map(d => d.getTime())));
  console.log('最新:', newest.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
  console.log('最老:', oldest.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
  console.log('时间跨度:', Math.round((newest.getTime() - oldest.getTime()) / (24*60*60*1000)), '天');

  console.log('\n示例数据 (前5条):');
  for (const item of items.slice(0, 5)) {
    console.log('---');
    console.log('source:', item.source);
    console.log('title:', item.title);
    console.log('url:', item.url);
    console.log('publishedAt:', item.publishedAt?.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
    console.log('meta:', JSON.stringify(item.meta));
  }

  const withTime = items.filter(i => i.publishedAt !== null).length;
  console.log('\n有时间的文章:', withTime, '/', items.length);
}

main().catch(console.error);
