import type { RawItem } from '../types.js';
import { BaseFetcher } from './base.js';
import { fetchText } from '../utils/http.js';
import pLimit from 'p-limit';

interface YouTubeChannel {
  id: string;
  name: string;
  channelId: string;
}

const YOUTUBE_CHANNELS: YouTubeChannel[] = [
  { id: 'peter-yang', name: 'Peter Yang', channelId: 'UCnpBg7yqNauHtlNSpOl5-cg' },
  { id: 'lenny-podcast', name: "Lenny's Podcast", channelId: 'UC6t1O76G0jYXOAoYCm153dA' },
  { id: '20vc', name: '20VC', channelId: 'UCf0PBRjhf0rF8fWBIxTuoWA' },
];

interface ParsedVideo {
  videoId: string;
  title: string;
  url: string;
  publishedAt: Date;
  thumbnail: string;
  views: number;
  description: string;
}

function parseYouTubeRss(xml: string): ParsedVideo[] {
  const videos: ParsedVideo[] = [];
  const entryMatches = xml.matchAll(/<entry>[\s\S]*?<\/entry>/g);

  for (const match of entryMatches) {
    const entry = match[0];

    const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
    const linkMatch = entry.match(/<link rel="alternate" href="([^"]+)"\/>/);
    const publishedMatch = entry.match(/<published>([^<]+)<\/published>/);
    const thumbnailMatch = entry.match(/<media:thumbnail url="([^"]+)"/);
    const viewsMatch = entry.match(/<media:statistics views="(\d+)"\/>/);
    const descMatch = entry.match(/<media:description>([\s\S]*?)<\/media:description>/);

    if (videoIdMatch && titleMatch && linkMatch && publishedMatch) {
      videos.push({
        videoId: videoIdMatch[1],
        title: titleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
        url: linkMatch[1],
        publishedAt: new Date(publishedMatch[1]),
        thumbnail: thumbnailMatch?.[1] || '',
        views: viewsMatch ? parseInt(viewsMatch[1], 10) : 0,
        description: descMatch?.[1]?.slice(0, 200) || '',
      });
    }
  }

  return videos;
}

export class YouTubeFetcher extends BaseFetcher {
  siteId = 'youtube';
  siteName = 'YouTube';

  async fetch(now: Date): Promise<RawItem[]> {
    const limit = pLimit(5);
    const items: RawItem[] = [];

    const results = await Promise.all(
      YOUTUBE_CHANNELS.map((channel) =>
        limit(async () => {
          try {
            const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`;
            const xml = await fetchText(feedUrl, { timeout: 15000 });
            const videos = parseYouTubeRss(xml);
            return { channel, videos };
          } catch {
            return { channel, videos: [] };
          }
        })
      )
    );

    for (const { channel, videos } of results) {
      for (const video of videos) {
        items.push(
          this.createItem({
            source: channel.name,
            title: video.title,
            url: video.url,
            publishedAt: video.publishedAt,
            meta: {
              videoId: video.videoId,
              thumbnail: video.thumbnail,
              views: video.views,
            },
          })
        );
      }
    }

    return items;
  }
}
