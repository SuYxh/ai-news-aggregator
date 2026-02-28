export { BaseFetcher, runFetcher } from './base.js';
export { TechUrlsFetcher } from './techurls.js';
export { BuzzingFetcher } from './buzzing.js';
export { IrisFetcher } from './iris.js';
export { BestBlogsFetcher } from './bestblogs.js';
export { TophubFetcher } from './tophub.js';
export { ZeliFetcher } from './zeli.js';
export { AiHubTodayFetcher } from './aihubtoday.js';
export { AiBaseFetcher } from './aibase.js';
export { AiHotFetcher } from './aihot.js';
export { NewsNowFetcher } from './newsnow.js';
export { YouTubeFetcher } from './youtube.js';
export { XinzhiyuanFetcher } from './xinzhiyuan.js';
export { fetchOpmlRss } from './opml-rss.js';
export { fetchWaytoagiRecent7d } from './waytoagi.js';

import type { Fetcher } from '../types.js';
import { TechUrlsFetcher } from './techurls.js';
import { BuzzingFetcher } from './buzzing.js';
import { IrisFetcher } from './iris.js';
import { BestBlogsFetcher } from './bestblogs.js';
import { TophubFetcher } from './tophub.js';
import { ZeliFetcher } from './zeli.js';
import { AiHubTodayFetcher } from './aihubtoday.js';
import { AiBaseFetcher } from './aibase.js';
import { AiHotFetcher } from './aihot.js';
import { NewsNowFetcher } from './newsnow.js';
import { YouTubeFetcher } from './youtube.js';
import { XinzhiyuanFetcher } from './xinzhiyuan.js';

export function createAllFetchers(): Fetcher[] {
  return [
    new TechUrlsFetcher(),
    new BuzzingFetcher(),
    new IrisFetcher(),
    new BestBlogsFetcher(),
    new TophubFetcher(),
    new ZeliFetcher(),
    new AiHubTodayFetcher(),
    new AiBaseFetcher(),
    new AiHotFetcher(),
    new NewsNowFetcher(),
    new YouTubeFetcher(),
    new XinzhiyuanFetcher(),
  ];
}
