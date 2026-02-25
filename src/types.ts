export interface RawItem {
  siteId: string;
  siteName: string;
  source: string;
  title: string;
  url: string;
  publishedAt: Date | null;
  meta: Record<string, unknown>;
}

export interface ArchiveItem {
  id: string;
  site_id: string;
  site_name: string;
  source: string;
  title: string;
  url: string;
  published_at: string | null;
  first_seen_at: string;
  last_seen_at: string;
  title_original?: string;
  title_en?: string | null;
  title_zh?: string | null;
  title_bilingual?: string;
}

export interface FetchStatus {
  site_id: string;
  site_name: string;
  ok: boolean;
  item_count: number;
  duration_ms: number;
  error: string | null;
}

export interface RssFeedStatus extends FetchStatus {
  feed_title?: string;
  feed_url?: string;
  effective_feed_url?: string | null;
  skipped?: boolean;
  skip_reason?: string | null;
  replaced?: boolean;
}

export interface Fetcher {
  siteId: string;
  siteName: string;
  fetch(now: Date): Promise<RawItem[]>;
}

export interface CliOptions {
  outputDir: string;
  windowHours: number;
  archiveDays: number;
  translateMaxNew: number;
  rssOpml: string;
  rssMaxFeeds: number;
}

export interface SiteStat {
  site_id: string;
  site_name: string;
  count: number;
  raw_count: number;
}

export interface LatestPayload {
  generated_at: string;
  window_hours: number;
  total_items: number;
  total_items_ai_raw: number;
  total_items_raw: number;
  total_items_all_mode: number;
  topic_filter: string;
  archive_total: number;
  site_count: number;
  source_count: number;
  site_stats: SiteStat[];
  items: ArchiveItem[];
  items_ai: ArchiveItem[];
  items_all_raw: ArchiveItem[];
  items_all: ArchiveItem[];
}

export interface ArchivePayload {
  generated_at: string;
  total_items: number;
  items: ArchiveItem[];
}

export interface StatusPayload {
  generated_at: string;
  sites: FetchStatus[];
  successful_sites: number;
  failed_sites: string[];
  zero_item_sites: string[];
  fetched_raw_items: number;
  items_before_topic_filter: number;
  items_in_24h: number;
  rss_opml: {
    enabled: boolean;
    path: string | null;
    feed_total: number;
    effective_feed_total: number;
    ok_feeds: number;
    failed_feeds: string[];
    zero_item_feeds: string[];
    skipped_feeds: Array<{ feed_url: string; reason: string | null }>;
    replaced_feeds: Array<{ from: string; to: string }>;
    feeds: RssFeedStatus[];
  };
}

export interface WaytoagiUpdate {
  date: string;
  title: string;
  url: string;
}

export interface WaytoagiPayload {
  generated_at: string;
  timezone: string;
  root_url: string;
  history_url: string | null;
  window_days: number;
  latest_date: string | null;
  count_today: number;
  updates_today: WaytoagiUpdate[];
  count_7d: number;
  updates_7d: WaytoagiUpdate[];
  warning: string | null;
  has_error: boolean;
  error: string | null;
}

export interface OpmlFeed {
  title: string;
  xmlUrl: string;
  htmlUrl: string;
  xmlUrlOriginal?: string;
  replaced?: boolean;
}
