import type { RawItem } from '../types.js';
import { BaseFetcher } from './base.js';

interface WPPost {
  id: number;
  date: string;
  title: { rendered: string };
  link: string;
}

const WINDOW_DAYS = 7;
const MAX_PER_PAGE = 100;

export class XinzhiyuanFetcher extends BaseFetcher {
  siteId = 'xinzhiyuan';
  siteName = '新智元';

  async fetch(now: Date): Promise<RawItem[]> {
    const windowStart = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const items: RawItem[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const url = `https://aiera.com.cn/wp-json/wp/v2/posts?per_page=${MAX_PER_PAGE}&page=${page}`;
      let posts: WPPost[];

      try {
        posts = await this.fetchJsonData<WPPost[]>(url);
      } catch {
        break;
      }

      if (posts.length === 0) break;

      for (const post of posts) {
        const publishedAt = new Date(post.date);

        if (publishedAt < windowStart) {
          hasMore = false;
          break;
        }

        const title = post.title.rendered
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');

        items.push(
          this.createItem({
            source: '新智元',
            title,
            url: post.link,
            publishedAt,
            meta: { postId: post.id },
          })
        );
      }

      if (posts.length < MAX_PER_PAGE) break;
      page++;
    }

    return items;
  }
}
