import type { RawItem } from '../types.js';
import { BaseFetcher } from './base.js';
import { fetchText } from '../utils/http.js';
import pLimit from 'p-limit';

interface WechatFeed {
  name: string;
  url: string;
  category: string;
}

const WECHAT_FEEDS: WechatFeed[] = [
  { name: '机器之心', url: 'https://decemberpei.cyou/rssbox/wechat-jiqizhixin.xml', category: 'AI' },
  { name: '量子位', url: 'https://decemberpei.cyou/rssbox/wechat-liangziwei.xml', category: 'AI' },
  { name: '新智元', url: 'https://decemberpei.cyou/rssbox/wechat-xinzhiyuan.xml', category: 'AI' },
  { name: 'DeepTech深科技', url: 'https://decemberpei.cyou/rssbox/wechat-shenkeji.xml', category: 'AI' },
  { name: 'PaperWeekly', url: 'https://decemberpei.cyou/rssbox/wechat-paperweekly.xml', category: 'AI' },
  { name: '计算机视觉life', url: 'https://decemberpei.cyou/rssbox/wechat-jisuanjishijuelife.xml', category: 'AI' },
  { name: 'AI前线', url: 'https://decemberpei.cyou/rssbox/wechat-aiqianxian.xml', category: 'AI' },
  { name: '夕小瑶科技说', url: 'https://decemberpei.cyou/rssbox/wechat-xixiaoyaokejishuo.xml', category: 'AI' },
  { name: '海外独角兽', url: 'https://decemberpei.cyou/rssbox/wechat-haiwaidujiaoshou.xml', category: 'AI' },
  { name: '甲子光年', url: 'https://decemberpei.cyou/rssbox/wechat-jiaziguangnian.xml', category: 'AI' },
  { name: '集智俱乐部', url: 'https://decemberpei.cyou/rssbox/wechat-jizhijvlebu.xml', category: 'AI' },
  { name: '晚点LatePost', url: 'https://decemberpei.cyou/rssbox/wechat-wandian.xml', category: '科技媒体' },
  { name: '36氪', url: 'https://decemberpei.cyou/rssbox/wechat-36ke.xml', category: '科技媒体' },
  { name: '36氪Pro', url: 'https://decemberpei.cyou/rssbox/wechat-sanliukepro.xml', category: '科技媒体' },
  { name: '虎嗅App', url: 'https://decemberpei.cyou/rssbox/wechat-huxiuapp.xml', category: '科技媒体' },
  { name: '极客公园', url: 'https://decemberpei.cyou/rssbox/wechat-jikegongyuan.xml', category: '科技媒体' },
  { name: '少数派', url: 'https://decemberpei.cyou/rssbox/wechat-shaoshupai.xml', category: '科技媒体' },
  { name: 'APPSO', url: 'https://decemberpei.cyou/rssbox/wechat-appso.xml', category: '科技媒体' },
  { name: '爱范儿', url: 'https://decemberpei.cyou/rssbox/wechat-anfaner.xml', category: '科技媒体' },
  { name: '差评', url: 'https://decemberpei.cyou/rssbox/wechat-chaping.xml', category: '科技媒体' },
  { name: '钛媒体', url: 'https://decemberpei.cyou/rssbox/wechat-taimeiti.xml', category: '科技媒体' },
  { name: 'InfoQ', url: 'https://decemberpei.cyou/rssbox/wechat-infoq.xml', category: '技术开发' },
  { name: '阿里云开发者', url: 'https://decemberpei.cyou/rssbox/wechat-aliyunkaifazhe.xml', category: '技术开发' },
  { name: '腾讯技术工程', url: 'https://decemberpei.cyou/rssbox/wechat-tengxunjishugongcheng.xml', category: '技术开发' },
  { name: '前端之巅', url: 'https://decemberpei.cyou/rssbox/wechat-qianduanzhidian.xml', category: '技术开发' },
  { name: '架构师之路', url: 'https://decemberpei.cyou/rssbox/wechat-jiagoushizhilu.xml', category: '技术开发' },
  { name: 'GitHubDaily', url: 'https://decemberpei.cyou/rssbox/wechat-githubdaily.xml', category: '技术开发' },
  { name: '华尔街见闻', url: 'https://decemberpei.cyou/rssbox/wechat-huaerjiejianwen.xml', category: '财经投资' },
  { name: '财经杂志', url: 'https://decemberpei.cyou/rssbox/wechat-caijingzazhi.xml', category: '财经投资' },
  { name: '第一财经YiMagazine', url: 'https://decemberpei.cyou/rssbox/wechat-diyicaijing.xml', category: '财经投资' },
  { name: '经纬创投', url: 'https://decemberpei.cyou/rssbox/wechat-jingweichuangtou.xml', category: '财经投资' },
  { name: '红杉汇', url: 'https://decemberpei.cyou/rssbox/wechat-hongshanhui.xml', category: '财经投资' },
  { name: '42章经', url: 'https://decemberpei.cyou/rssbox/wechat-sierzhangjing.xml', category: '财经投资' },
  { name: '远川投资评论', url: 'https://decemberpei.cyou/rssbox/wechat-chuanyuanyouzipinglun.xml', category: '财经投资' },
  { name: '泽平宏观展望', url: 'https://decemberpei.cyou/rssbox/wechat-zepinghongguanzhanwang.xml', category: '财经投资' },
  { name: 'caoz的梦呓', url: 'https://decemberpei.cyou/rssbox/wechat-caozdemengyi.xml', category: '个人博主' },
  { name: 'L先生说', url: 'https://decemberpei.cyou/rssbox/wechat-lxianshengshuo.xml', category: '个人博主' },
  { name: '槽边往事', url: 'https://decemberpei.cyou/rssbox/wechat-caobianwangshi.xml', category: '个人博主' },
  { name: '孟岩', url: 'https://decemberpei.cyou/rssbox/wechat-mengyan.xml', category: '个人博主' },
  { name: '刘润', url: 'https://decemberpei.cyou/rssbox/wechat-liurun.xml', category: '个人博主' },
  { name: '辉哥奇谭', url: 'https://decemberpei.cyou/rssbox/wechat-huigeqitan.xml', category: '个人博主' },
  { name: 'warfalcon', url: 'https://decemberpei.cyou/rssbox/wechat-warfalcon.xml', category: '个人博主' },
  { name: '玉树芝兰', url: 'https://decemberpei.cyou/rssbox/wechat-yushuzhilan.xml', category: '个人博主' },
  { name: '九边', url: 'https://decemberpei.cyou/rssbox/wechat-jiubian.xml', category: '个人博主' },
  { name: '也谈钱', url: 'https://decemberpei.cyou/rssbox/wechat-yetanqian.xml', category: '个人博主' },
  { name: 'keso怎么看', url: 'https://decemberpei.cyou/rssbox/wechat-kesozenmekan.xml', category: '个人博主' },
  { name: '阑夕', url: 'https://decemberpei.cyou/rssbox/wechat-lanxi.xml', category: '个人博主' },
  { name: '人人都是产品经理', url: 'https://decemberpei.cyou/rssbox/wechat-renrendoushichanpinjingli.xml', category: '产品商业' },
  { name: '互联网怪盗团', url: 'https://decemberpei.cyou/rssbox/wechat-hulianwangguaidaotuan.xml', category: '产品商业' },
  { name: '乱翻书', url: 'https://decemberpei.cyou/rssbox/wechat-luanfanshu.xml', category: '产品商业' },
  { name: '刘言飞语', url: 'https://decemberpei.cyou/rssbox/wechat-liuyanfeiyu.xml', category: '产品商业' },
  { name: '产品犬舍', url: 'https://decemberpei.cyou/rssbox/wechat-chanpinquanshe.xml', category: '产品商业' },
  { name: 'FounderPark', url: 'https://decemberpei.cyou/rssbox/wechat-founderpark.xml', category: '产品商业' },
];

interface ParsedArticle {
  title: string;
  url: string;
  description: string;
}

interface ParsedFeed {
  channelTitle: string;
  lastBuildDate: Date | null;
  articles: ParsedArticle[];
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function parseWechatRss(xml: string): ParsedFeed {
  const channelTitleMatch = xml.match(/<channel>[\s\S]*?<title>([^<]+)<\/title>/);
  const lastBuildDateMatch = xml.match(/<lastBuildDate>([^<]+)<\/lastBuildDate>/);

  const channelTitle = channelTitleMatch
    ? decodeHtmlEntities(channelTitleMatch[1])
    : '';
  const lastBuildDate = lastBuildDateMatch
    ? new Date(lastBuildDateMatch[1])
    : null;

  const articles: ParsedArticle[] = [];
  const itemMatches = xml.matchAll(/<item>[\s\S]*?<\/item>/g);

  for (const match of itemMatches) {
    const item = match[0];

    const titleMatch = item.match(/<title>([^<]+)<\/title>/);
    const linkMatch = item.match(/<link>([^<]+)<\/link>/);
    const descMatch = item.match(/<description>([^<]*)<\/description>/);

    if (titleMatch && linkMatch) {
      articles.push({
        title: decodeHtmlEntities(titleMatch[1]),
        url: decodeHtmlEntities(linkMatch[1]),
        description: descMatch ? decodeHtmlEntities(descMatch[1]) : '',
      });
    }
  }

  return { channelTitle, lastBuildDate, articles };
}

export class WechatRssFetcher extends BaseFetcher {
  siteId = 'wechat-rss';
  siteName = '微信公众号';

  async fetch(_now: Date): Promise<RawItem[]> {
    const limit = pLimit(10);
    const items: RawItem[] = [];

    const results = await Promise.all(
      WECHAT_FEEDS.map((feed) =>
        limit(async () => {
          try {
            const xml = await fetchText(feed.url, { timeout: 15000 });
            const parsed = parseWechatRss(xml);
            return { feed, parsed };
          } catch {
            return { feed, parsed: null };
          }
        })
      )
    );

    for (const { feed, parsed } of results) {
      if (!parsed) continue;

      const sourceName = feed.name || parsed.channelTitle.replace('微信公众号-', '');

      for (const article of parsed.articles) {
        items.push(
          this.createItem({
            source: sourceName,
            title: article.title,
            url: article.url,
            publishedAt: parsed.lastBuildDate,
            meta: {
              category: feed.category,
              description: article.description.slice(0, 200),
            },
          })
        );
      }
    }

    return items;
  }
}

export { WECHAT_FEEDS };
