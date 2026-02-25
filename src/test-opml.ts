import { existsSync } from 'fs';
import { resolve } from 'path';
import { CONFIG } from './config.js';
import { utcNow, toISOString } from './utils/date.js';
import { fetchOpmlRss } from './fetchers/opml-rss.js';

async function main(): Promise<number> {
  const opmlPath = process.argv[2] || CONFIG.rss.defaultOpmlPath;
  const maxFeeds = parseInt(process.argv[3] || '0');

  const resolvedPath = resolve(opmlPath);

  if (!existsSync(resolvedPath)) {
    console.error(`OPML file not found: ${resolvedPath}`);
    return 1;
  }

  console.log(`Testing OPML RSS from: ${resolvedPath}`);
  if (maxFeeds > 0) {
    console.log(`Max feeds: ${maxFeeds}`);
  }
  console.log('');

  const now = utcNow();

  try {
    const { items, summaryStatus, feedStatuses } = await fetchOpmlRss(now, resolvedPath, maxFeeds);

    const okFeeds = feedStatuses.filter((s) => s.ok && !s.skipped);
    const failedFeeds = feedStatuses.filter((s) => !s.ok);
    const skippedFeeds = feedStatuses.filter((s) => s.skipped);
    const zeroItemFeeds = feedStatuses.filter((s) => s.ok && !s.skipped && s.item_count === 0);

    console.log('=== Summary ===');
    console.log(`Total feeds in OPML: ${feedStatuses.length}`);
    console.log(`Skipped feeds: ${skippedFeeds.length}`);
    console.log(`Effective feeds: ${feedStatuses.length - skippedFeeds.length}`);
    console.log(`Successful feeds: ${okFeeds.length}`);
    console.log(`Failed feeds: ${failedFeeds.length}`);
    console.log(`Zero-item feeds: ${zeroItemFeeds.length}`);
    console.log(`Total items fetched: ${items.length}`);
    console.log(`Duration: ${summaryStatus.duration_ms}ms`);
    console.log('');

    if (failedFeeds.length > 0) {
      console.log('=== Failed Feeds ===');
      for (const feed of failedFeeds) {
        console.log(`❌ ${feed.feed_title || feed.feed_url}`);
        console.log(`   URL: ${feed.effective_feed_url || feed.feed_url}`);
        console.log(`   Error: ${feed.error}`);
        console.log('');
      }
    }

    if (skippedFeeds.length > 0) {
      console.log('=== Skipped Feeds ===');
      for (const feed of skippedFeeds) {
        console.log(`⏭️  ${feed.feed_title || feed.feed_url}`);
        console.log(`   Reason: ${feed.skip_reason}`);
      }
      console.log('');
    }

    console.log('=== Successful Feeds ===');
    for (const feed of okFeeds) {
      const emoji = feed.item_count > 0 ? '✅' : '⚠️';
      console.log(`${emoji} ${feed.feed_title || feed.feed_url}: ${feed.item_count} items (${feed.duration_ms}ms)`);
    }
    console.log('');

    if (items.length > 0) {
      console.log('=== Sample Items (first 10) ===');
      for (const item of items.slice(0, 10)) {
        console.log(`- [${item.source}] ${item.title}`);
        console.log(`  ${item.url}`);
        console.log(`  ${toISOString(item.publishedAt)}`);
        console.log('');
      }
    }

    return failedFeeds.length > 0 ? 1 : 0;
  } catch (e) {
    console.error('Error:', e instanceof Error ? e.message : String(e));
    return 1;
  }
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
