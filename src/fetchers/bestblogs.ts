import type { RawItem } from '../types.js';
import { BaseFetcher } from './base.js';
import { postJson } from '../utils/http.js';
import { parseUnixTimestamp } from '../utils/date.js';

interface BestBlogsIssue {
  id?: string;
  title?: string;
  createdTimestamp?: number;
  articleCount?: number;
}

interface BestBlogsResponse {
  data?: {
    pageCount?: number;
    dataList?: BestBlogsIssue[];
  };
}

export class BestBlogsFetcher extends BaseFetcher {
  siteId = 'bestblogs';
  siteName = 'BestBlogs';

  async fetch(now: Date): Promise<RawItem[]> {
    const items: RawItem[] = [];
    const seen = new Set<string>();
    const api = 'https://api.bestblogs.dev/api/newsletter/list';

    try {
      let currentPage = 1;
      let pageCount = 1;

      while (currentPage <= pageCount && currentPage <= 12) {
        const response = await postJson<BestBlogsResponse>(api, {
          currentPage,
          pageSize: 20,
          userLanguage: 'en',
        });

        const data = response.data || {};
        pageCount = data.pageCount || 1;

        for (const issue of data.dataList || []) {
          const issueId = (issue.id || '').trim();
          const title = (issue.title || '').trim();
          if (!issueId || !title) continue;

          const url = `https://www.bestblogs.dev/en/newsletter#${issueId}`;
          if (seen.has(url)) continue;
          seen.add(url);

          const publishedAt = parseUnixTimestamp(issue.createdTimestamp);

          items.push(
            this.createItem({
              source: 'Weekly Newsletter',
              title,
              url,
              publishedAt,
              meta: {
                issue_id: issueId,
                article_count: issue.articleCount,
              },
            })
          );
        }

        currentPage++;
      }
    } catch {
      // API failed, fallback not implemented for brevity
    }

    return items;
  }
}
