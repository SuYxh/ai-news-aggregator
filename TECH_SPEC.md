# AI News Aggregator 技术方案

---

## 目录

1. [项目概览](#1-项目概览)
2. [技术栈分析](#2-技术栈分析)
3. [系统架构设计](#3-系统架构设计)
4. [核心模块深度解析](#4-核心模块深度解析)
5. [数据流转机制](#5-数据流转机制)
6. [Web 前端架构](#6-web-前端架构)
7. [自动化与 CI/CD](#7-自动化与-cicd)
8. [设计亮点与最佳实践](#8-设计亮点与最佳实践)
9. [扩展性分析](#9-扩展性分析)
10. [性能优化策略](#10-性能优化策略)

---

## 1. 项目概览

### 1.1 项目定位

AI News Aggregator 是一个**全自动化的 AI 资讯聚合系统**，主要解决以下问题：

- **信息碎片化**: 从 11 个聚合平台 + 70+ RSS 订阅源统一获取数据
- **信息噪音**: 通过智能过滤算法精准提取 AI/科技相关内容
- **语言障碍**: 自动翻译英文标题为中文，支持双语展示
- **实时性**: 通过 GitHub Actions 每 2 小时自动更新

### 1.2 核心功能矩阵

```
┌────────────────────────────────────────────────────────────────┐
│                    AI News Aggregator                          │
├────────────────┬───────────────────┬───────────────────────────┤
│   数据采集层   │    数据处理层      │      数据展示层           │
├────────────────┼───────────────────┼───────────────────────────┤
│ • 11 个平台    │ • AI 相关性过滤    │ • React SPA 应用          │
│ • 70+ RSS 源   │ • 内容去重         │ • 响应式设计              │
│ • 飞书知识库   │ • 英译中翻译       │ • 暗色模式                │
│ • OPML 解析    │ • 编码修复         │ • 多维度筛选              │
└────────────────┴───────────────────┴───────────────────────────┘
```

### 1.3 目录结构

```
ai-news-aggregator/
├── src/                          # 数据抓取核心代码
│   ├── index.ts                  # 主入口 (CLI + 业务逻辑)
│   ├── config.ts                 # 全局配置
│   ├── types.ts                  # TypeScript 类型定义
│   ├── fetchers/                 # 数据抓取器集合
│   │   ├── base.ts               # 抓取器基类
│   │   ├── opml-rss.ts           # OPML/RSS 解析器
│   │   ├── aihot.ts              # AI今日热榜抓取
│   │   ├── tophub.ts             # TopHub 抓取
│   │   └── ...                   # 其他平台抓取器
│   ├── filters/                  # 过滤器
│   │   ├── ai-related.ts         # AI 相关性过滤
│   │   └── dedupe.ts             # 去重逻辑
│   ├── translate/                # 翻译模块
│   │   └── google.ts             # Google 翻译 API
│   ├── output/                   # 输出模块
│   └── utils/                    # 工具函数
│       ├── date.ts               # 日期处理
│       ├── hash.ts               # 哈希生成
│       ├── http.ts               # HTTP 请求封装
│       ├── text.ts               # 文本处理
│       └── url.ts                # URL 处理
├── web/                          # Web 前端
│   ├── src/
│   │   ├── App.tsx               # 应用入口
│   │   ├── components/           # React 组件
│   │   ├── hooks/                # 自定义 Hooks
│   │   ├── types/                # 类型定义
│   │   └── utils/                # 工具函数
│   └── vite.config.ts            # Vite 配置
├── data/                         # 输出数据
├── feeds/                        # RSS 订阅配置
└── .github/workflows/            # CI/CD 配置
```

---

## 2. 技术栈分析

### 2.1 后端技术栈

| 技术 | 版本 | 用途 | 选型理由 |
|:-----|:-----|:-----|:---------|
| **TypeScript** | 5.6+ | 开发语言 | 类型安全，IDE 支持友好 |
| **tsx** | 4.19+ | 运行时 | 直接执行 TS，无需编译 |
| **Cheerio** | 1.0+ | HTML 解析 | jQuery 语法，轻量高效 |
| **rss-parser** | 3.13+ | RSS 解析 | 成熟稳定，支持多格式 |
| **fast-xml-parser** | 4.5+ | XML 解析 | 高性能，支持属性解析 |
| **dayjs** | 1.11+ | 日期处理 | 轻量级 moment 替代 |
| **p-limit** | 6.1+ | 并发控制 | Promise 并发限制 |
| **commander** | 12.1+ | CLI 工具 | 命令行参数解析 |

### 2.2 前端技术栈

| 技术 | 版本 | 用途 | 选型理由 |
|:-----|:-----|:-----|:---------|
| **React** | 18.3+ | UI 框架 | 生态丰富，社区活跃 |
| **TypeScript** | 5.6+ | 开发语言 | 前后端类型一致 |
| **Vite** | 5.4+ | 构建工具 | 极速 HMR，ESM 原生支持 |
| **Tailwind CSS** | 3.4+ | 样式框架 | 原子化 CSS，开发高效 |
| **date-fns** | 3.6+ | 日期格式化 | Tree-shaking 友好 |
| **Lucide React** | 0.453+ | 图标库 | 轻量美观 |

### 2.3 DevOps 技术

| 技术 | 用途 |
|:-----|:-----|
| **GitHub Actions** | CI/CD 自动化 |
| **GitHub Pages** | 静态网站托管 |
| **pnpm** | 包管理器 |
| **ESLint** | 代码质量检查 |
| **Prettier** | 代码格式化 |
| **Husky** | Git Hooks |

---

## 3. 系统架构设计

### 3.1 整体架构图

```
                                    ┌─────────────────────────────────┐
                                    │       GitHub Actions            │
                                    │    (每 2 小时自动触发)           │
                                    └────────────┬────────────────────┘
                                                 │
                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              数据采集层                                       │
├───────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  TechURLs   │  │   TopHub    │  │   Buzzing   │  │   NewsNow   │   ...    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
│         │                │                │                │                  │
│         └────────────────┴────────────────┴────────────────┘                  │
│                                    │                                          │
│                          ┌─────────┴─────────┐                                │
│                          │   OPML RSS 聚合    │                               │
│                          │   (70+ 订阅源)     │                               │
│                          └───────────────────┘                                │
└───────────────────────────────────┬───────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              数据处理层                                       │
├───────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐               │
│  │  AI 相关性过滤   │  │   内容去重       │  │   标题翻译       │              │
│  │  (关键词 + 正则)  │  │ (title + url)   │  │  (Google API)   │              │
│  └─────────┬───────┘  └─────────┬───────┘  └─────────┬───────┘               │
│            │                    │                    │                        │
│            └────────────────────┴────────────────────┘                        │
│                                 │                                             │
│                    ┌────────────┴────────────┐                                │
│                    │      归档管理            │                                │
│                    │  (45天历史 + 增量更新)    │                               │
│                    └─────────────────────────┘                                │
└───────────────────────────────────┬───────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              数据输出层                                       │
├───────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                  │
│  │ latest-24h.json │  │  archive.json   │  │ source-status  │                 │
│  │   (最新资讯)     │  │  (历史归档)     │  │   (抓取状态)    │                 │
│  └────────────────┘  └────────────────┘  └────────────────┘                  │
└───────────────────────────────────┬───────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              Web 展示层                                       │
├───────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                       React SPA 应用                                    │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │ │
│  │  │ Header  │  │ Stats   │  │ Filter  │  │NewsList │  │ Modal   │       │ │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 数据流转时序图

```
   GitHub Actions    Main Process      Fetchers        Filters       Translator      Output
        │                │                │               │               │             │
        │  触发定时任务   │                │               │               │             │
        │───────────────>│                │               │               │             │
        │                │                │               │               │             │
        │                │  创建 Fetcher   │               │               │             │
        │                │───────────────>│               │               │             │
        │                │                │               │               │             │
        │                │  并发抓取数据   │               │               │             │
        │                │───────────────>│               │               │             │
        │                │                │               │               │             │
        │                │  返回 RawItem[] │               │               │             │
        │                │<───────────────│               │               │             │
        │                │                │               │               │             │
        │                │  AI 相关性过滤               │               │             │
        │                │───────────────────────────────>│               │             │
        │                │                │               │               │             │
        │                │  返回过滤结果                 │               │             │
        │                │<───────────────────────────────│               │             │
        │                │                │               │               │             │
        │                │  标题翻译                                      │             │
        │                │───────────────────────────────────────────────>│             │
        │                │                │               │               │             │
        │                │  返回双语标题                                  │             │
        │                │<───────────────────────────────────────────────│             │
        │                │                │               │               │             │
        │                │  写入 JSON 文件                                             │
        │                │──────────────────────────────────────────────────────────────>│
        │                │                │               │               │             │
        │  构建 Web 应用  │                │               │               │             │
        │───────────────>│                │               │               │             │
        │                │                │               │               │             │
        │  部署到 Pages   │                │               │               │             │
        │───────────────>│                │               │               │             │
        │                │                │               │               │             │
```

---

## 4. 核心模块深度解析

### 4.1 配置系统 (`config.ts`)

配置系统采用**集中式管理**，所有可配置项统一在 `CONFIG` 对象中定义：

```typescript
export const CONFIG = {
  http: {
    userAgent: 'Mozilla/5.0 ...',       // 模拟浏览器请求
    timeout: 30000,                      // 请求超时 30s
    retries: 3,                          // 最多重试 3 次
    retryDelay: 800,                     // 重试间隔 800ms
    retryStatusCodes: [429, 500, ...],   // 需要重试的状态码
  },
  
  rss: {
    maxConcurrency: 20,                  // RSS 并发数
    feedTimeout: 30000,                  // 单个 Feed 超时
    replacements: {...},                 // URL 替换映射
    skipPrefixes: [...],                 // 跳过的 URL 前缀
  },
  
  filter: {
    aiKeywords: [...],                   // AI 关键词列表
    techKeywords: [...],                 // 科技关键词
    noiseKeywords: [...],                // 噪音过滤词
    enSignalPattern: /regex/,            // 英文信号正则
  }
};
```

**设计亮点**:
- 类型安全：所有配置项都有明确的 TypeScript 类型
- 易于维护：修改配置无需改动业务代码
- URL 替换机制：支持将不稳定的 RSSHub 地址替换为官方源

### 4.2 类型系统 (`types.ts`)

项目定义了完整的数据模型：

```typescript
// 原始抓取数据
interface RawItem {
  siteId: string;         // 数据源 ID
  siteName: string;       // 数据源名称
  source: string;         // 具体来源（如 RSS 订阅名）
  title: string;          // 标题
  url: string;            // 链接
  publishedAt: Date | null; // 发布时间
  meta: Record<string, unknown>; // 扩展元数据
}

// 归档条目（带双语支持）
interface ArchiveItem {
  id: string;                    // SHA1 唯一标识
  site_id: string;
  site_name: string;
  source: string;
  title: string;
  url: string;
  published_at: string | null;
  first_seen_at: string;         // 首次发现时间
  last_seen_at: string;          // 最后更新时间
  title_original?: string;       // 原始标题
  title_en?: string | null;      // 英文标题
  title_zh?: string | null;      // 中文标题
  title_bilingual?: string;      // 双语标题
}

// Fetcher 接口（策略模式）
interface Fetcher {
  siteId: string;
  siteName: string;
  fetch(now: Date): Promise<RawItem[]>;
}
```

### 4.3 抓取器架构 (`fetchers/`)

#### 4.3.1 基类设计 (`base.ts`)

采用**模板方法模式**，提供统一的抓取基础设施：

```typescript
abstract class BaseFetcher implements Fetcher {
  abstract siteId: string;
  abstract siteName: string;
  abstract fetch(now: Date): Promise<RawItem[]>;
  
  // 模板方法：HTML 抓取
  protected async fetchHtml(url: string): Promise<CheerioAPI> {
    const html = await fetchText(url);
    return cheerio.load(html);
  }
  
  // 模板方法：JSON 抓取
  protected async fetchJsonData<T>(url: string): Promise<T> {
    return fetchJson<T>(url);
  }
  
  // 工厂方法：创建标准数据项
  protected createItem(params: {...}): RawItem {
    return {
      siteId: this.siteId,
      siteName: this.siteName,
      ...params
    };
  }
}
```

#### 4.3.2 具体抓取器实现

以 **AiHotFetcher** 为例，展示 Next.js SSR 页面的数据提取：

```typescript
class AiHotFetcher extends BaseFetcher {
  siteId = 'aihot';
  siteName = 'AI今日热榜';

  async fetch(now: Date): Promise<RawItem[]> {
    const html = await fetchText('https://aihot.today/');
    
    // 方案1：从 __next_f.push 中提取数据
    const decoded = extractNextFMerged(html);
    let initialData = extractBalancedJson(decoded, 'initialDataMap');
    
    // 方案2：回退到 __NEXT_DATA__ script
    if (!initialData) {
      const nextData = extractNextDataPayload(html);
      initialData = nextData?.props?.pageProps?.initialDataMap;
    }
    
    // 数据转换
    for (const [sourceId, dataItems] of Object.entries(initialData)) {
      for (const item of dataItems) {
        items.push(this.createItem({
          source: sourceName,
          title: item.title_trans || item.title,
          url: item.link,
          publishedAt: parseDate(item.publish_time, now),
        }));
      }
    }
    
    return items;
  }
}
```

**技术要点**:
- Next.js 页面的数据可能在 `__NEXT_DATA__` 或流式 hydration 的 `__next_f.push` 中
- 使用平衡括号算法提取嵌套 JSON
- 双重降级策略确保数据提取的健壮性

#### 4.3.3 TopHub 抓取器（HTML 解析示例）

```typescript
class TophubFetcher extends BaseFetcher {
  async fetch(now: Date): Promise<RawItem[]> {
    const response = await fetchWithRetry('https://tophub.today/');
    const buffer = await response.arrayBuffer();
    
    // 智能编码检测：UTF-8 优先，GB18030 降级
    let html = new TextDecoder('utf-8').decode(buffer);
    if (html.includes('�')) {
      const gb18030Html = new TextDecoder('gb18030').decode(buffer);
      if (gb18030Html损坏字符更少) {
        html = gb18030Html;
      }
    }
    
    const $ = cheerio.load(html);
    
    // CSS 选择器提取数据
    $('.cc-cd').each((_, block) => {
      const sourceName = $(block).find('.cc-cd-lb span').text();
      $(block).find('.cc-cd-cb-l a').each((_, link) => {
        const title = $(link).find('.t').text();
        const href = $(link).attr('href');
        items.push(this.createItem({...}));
      });
    });
    
    return items;
  }
}
```

#### 4.3.4 OPML RSS 解析器 (`opml-rss.ts`)

```typescript
// OPML 解析
function parseOpmlSubscriptions(opmlContent: string): OpmlFeed[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });
  const doc = parser.parse(opmlContent);
  
  // 递归处理嵌套 outline
  function processOutline(outline: unknown): void {
    const outlines = Array.isArray(outline) ? outline : [outline];
    for (const o of outlines) {
      const xmlUrl = o['@_xmlUrl'];
      if (xmlUrl && !seen.has(xmlUrl)) {
        feeds.push({
          title: o['@_title'] || o['@_text'],
          xmlUrl,
          htmlUrl: o['@_htmlUrl'],
        });
      }
      if (o.outline) processOutline(o.outline); // 递归
    }
  }
  
  return feeds;
}

// URL 替换与跳过逻辑
function resolveOfficialRssUrl(feedUrl: string) {
  // 跳过不支持的源（Telegram/B站/知乎等）
  for (const prefix of CONFIG.rss.skipPrefixes) {
    if (feedUrl.startsWith(prefix)) {
      return { url: null, skipReason: 'no_official_rss' };
    }
  }
  
  // 替换不稳定的 RSSHub 为官方源
  const replaced = CONFIG.rss.replacements[feedUrl];
  if (replaced) return { url: replaced, skipReason: null };
  
  return { url: feedUrl, skipReason: null };
}

// 并发抓取
async function fetchOpmlRss(now, opmlPath, maxFeeds) {
  const feeds = parseOpmlSubscriptions(await readFile(opmlPath));
  
  // p-limit 控制并发数为 20
  const limit = pLimit(CONFIG.rss.maxConcurrency);
  
  const results = await Promise.all(
    resolvedFeeds.map((feed) => 
      limit(() => fetchSingleFeed(feed, now))
    )
  );
  
  return { items, summaryStatus, feedStatuses };
}
```

### 4.4 过滤器模块 (`filters/`)

#### 4.4.1 AI 相关性过滤 (`ai-related.ts`)

```typescript
function isAiRelated(record: ArchiveItem): boolean {
  const text = `${title} ${source} ${siteName} ${url}`.toLowerCase();
  
  // 规则1：特定站点全部放行
  if (['aibase', 'aihot', 'aihubtoday'].includes(siteId)) {
    return true;
  }
  
  // 规则2：TopHub 需要额外校验来源白名单
  if (siteId === 'tophub') {
    if (containsNoise(source)) return false;
    if (!containsAllowed(source)) return false;
  }
  
  // 规则3：关键词匹配
  const hasAi = containsAnyKeyword(text, CONFIG.filter.aiKeywords) ||
                CONFIG.filter.enSignalPattern.test(text);
  const hasTech = containsAnyKeyword(text, CONFIG.filter.techKeywords);
  
  // 规则4：噪音过滤
  if (containsCommerce(text) && !hasAi) return false;
  if (containsNoise(text) && !hasAi) return false;
  
  return hasAi || hasTech;
}
```

**过滤策略分层**:
1. **白名单放行**: AI 专业站点直接通过
2. **来源过滤**: 阻止电商/娱乐来源
3. **内容匹配**: 关键词 + 正则双重校验
4. **噪音排除**: 商业推广/非相关内容剔除

#### 4.4.2 去重逻辑 (`dedupe.ts`)

```typescript
function dedupeItemsByTitleUrl(items: ArchiveItem[], randomPick: boolean) {
  const groups = new Map<string, ArchiveItem[]>();
  
  for (const item of items) {
    // 生成去重 Key：title + url
    const key = siteId === 'aihubtoday' 
      ? `url::${url}`                    // 特殊处理
      : `${title.toLowerCase()}||${url}`;
    
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  
  const result: ArchiveItem[] = [];
  for (const values of groups.values()) {
    if (randomPick) {
      // 随机选择（用于 all 模式）
      result.push(values[Math.floor(Math.random() * values.length)]);
    } else {
      // 选择最新的（用于 AI 模式）
      result.push(values.reduce(pickNewest));
    }
  }
  
  return result.sort(byTimeDesc);
}
```

### 4.5 翻译模块 (`translate/google.ts`)

```typescript
const TRANSLATE_API = 'https://translate.googleapis.com/translate_a/single';

async function translateToZhCN(text: string): Promise<string | null> {
  const params = new URLSearchParams({
    client: 'gtx',      // 使用免费端点
    sl: 'auto',         // 自动检测语言
    tl: 'zh-CN',        // 目标语言
    dt: 't',            // 返回翻译
    q: text,
  });
  
  const response = await fetchJson(`${TRANSLATE_API}?${params}`);
  
  // 解析响应：[[["翻译结果", "原文", ...]]]
  const translated = response[0]
    .filter(seg => seg[0])
    .map(seg => String(seg[0]))
    .join('');
    
  return translated;
}

async function addBilingualFields(itemsAi, itemsAll, cache, maxNew) {
  let translatedNow = 0;
  
  const enrich = async (item, allowTranslate) => {
    const out = { ...item };
    const title = out.title;
    
    // 中文标题：直接使用
    if (hasCjk(title)) {
      out.title_zh = title;
      return out;
    }
    
    // 英文标题：尝试翻译
    if (isMostlyEnglish(title)) {
      out.title_en = title;
      
      // 优先使用缓存
      let zhTitle = cache.get(title);
      
      // 缓存未命中且允许翻译
      if (!zhTitle && allowTranslate && translatedNow < maxNew) {
        zhTitle = await translateToZhCN(title);
        if (zhTitle) {
          cache.set(title, zhTitle);
          translatedNow++;
        }
      }
      
      if (zhTitle) {
        out.title_zh = zhTitle;
        out.title_bilingual = `${zhTitle} / ${title}`;
      }
    }
    
    return out;
  };
  
  // AI 条目：允许翻译
  const aiOut = await Promise.all(itemsAi.map(it => enrich(it, true)));
  
  // 全部条目：仅使用缓存
  const allOut = await Promise.all(itemsAll.map(it => enrich(it, false)));
  
  return { itemsAi: aiOut, itemsAll: allOut, cache };
}
```

**翻译策略**:
- **增量翻译**: 每次最多翻译 80 个新标题
- **缓存复用**: 已翻译标题持久化到 `title-zh-cache.json`
- **分级处理**: AI 条目优先翻译，其他条目仅用缓存

### 4.6 工具函数 (`utils/`)

#### 4.6.1 HTTP 请求封装 (`http.ts`)

```typescript
async function fetchWithRetry(url: string, options = {}) {
  const { retries = 3, timeout = 30000 } = options;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': CONFIG.http.userAgent,
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // 可重试的状态码：429, 500, 502, 503, 504
      if (!response.ok && CONFIG.http.retryStatusCodes.includes(response.status)) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        // 指数退避：800ms, 1600ms, 2400ms
        await sleep(CONFIG.http.retryDelay * (attempt + 1));
      }
    }
  }
  
  throw lastError;
}
```

#### 4.6.2 日期处理 (`date.ts`)

```typescript
// 解析中文相对时间
function parseRelativeTimeZh(text: string, now: Date): Date | null {
  // "3 分钟前"
  let match = text.match(/(\d+)\s*分钟前/);
  if (match) {
    return new Date(now.getTime() - parseInt(match[1]) * 60 * 1000);
  }
  
  // "2 小时前"
  match = text.match(/(\d+)\s*小时前/);
  if (match) {
    return new Date(now.getTime() - parseInt(match[1]) * 60 * 60 * 1000);
  }
  
  // "昨天 14:30"
  if (text.includes('昨天')) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const timeMatch = text.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      yesterday.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]));
    }
    return yesterday;
  }
  
  // "3月15日"
  match = text.match(/(\d{1,2})月(\d{1,2})日/);
  if (match) {
    return new Date(now.getFullYear(), parseInt(match[1]) - 1, parseInt(match[2]));
  }
  
  return null;
}

// 统一日期解析
function parseDate(value: unknown, now: Date): Date | null {
  // 支持：Date 对象、Unix 时间戳、ISO 字符串、中文相对时间
  if (value instanceof Date) return value;
  if (typeof value === 'number') return parseUnixTimestamp(value);
  
  const str = String(value);
  
  // Unix 毫秒/秒时间戳
  if (/^\d{12,}$/.test(str)) return parseUnixTimestamp(parseInt(str));
  
  // 中文相对时间
  const relative = parseRelativeTimeZh(str, now);
  if (relative) return relative;
  
  // dayjs 通用解析
  return dayjs(str).toDate();
}
```

#### 4.6.3 哈希生成 (`hash.ts`)

```typescript
function makeItemId(siteId, source, title, url): string {
  // 拼接去重键
  const key = [
    siteId.trim().toLowerCase(),
    source.trim().toLowerCase(),
    title.trim().toLowerCase(),
    normalizeUrl(url),
  ].join('||');
  
  // SHA1 哈希
  return createHash('sha1').update(key, 'utf-8').digest('hex');
}
```

#### 4.6.4 文本处理 (`text.ts`)

```typescript
// Mojibake 修复（编码错误导致的乱码）
function maybeFixMojibake(text: string): string {
  // 检测常见乱码特征
  if (!/[Ãâåèæïð]|[\x80-\x9f]/.test(text)) {
    return text;
  }
  
  // 尝试 Latin1 -> UTF-8 转码
  try {
    const bytes = Buffer.from(text, 'latin1');
    const fixed = bytes.toString('utf-8');
    if (fixed && !fixed.includes('�')) {
      return fixed;
    }
  } catch {}
  
  return text;
}

// 中文检测
function hasCjk(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

// 英文占比检测
function isMostlyEnglish(text: string): boolean {
  if (hasCjk(text)) return false;
  const letters = text.match(/[A-Za-z]/g) || [];
  return letters.length >= Math.max(6, text.length / 4);
}
```

---

## 5. 数据流转机制

### 5.1 主流程 (`index.ts`)

```typescript
async function main(): Promise<number> {
  // 1. 命令行参数解析
  const program = new Command();
  program
    .option('--output-dir <dir>', 'data')
    .option('--window-hours <hours>', '24')
    .option('--archive-days <days>', '45')
    .option('--translate-max-new <count>', '80')
    .parse();
  
  // 2. 加载历史归档
  const archive = await loadArchive(archivePath);
  
  // 3. 创建并执行所有抓取器
  const fetchers = createAllFetchers();
  const limit = pLimit(5);
  
  const fetchResults = await Promise.all(
    fetchers.map(f => limit(() => runFetcher(f, now)))
  );
  
  // 4. 合并原始数据
  for (const { items, status } of fetchResults) {
    rawItems.push(...items);
    statuses.push(status);
  }
  
  // 5. 抓取 OPML RSS
  const { items: rssItems } = await fetchOpmlRss(now, opmlPath);
  rawItems.push(...rssItems);
  
  // 6. 更新归档（增量合并）
  for (const raw of rawItems) {
    const itemId = makeItemId(raw.siteId, raw.source, raw.title, raw.url);
    const existing = archive.get(itemId);
    
    if (!existing) {
      archive.set(itemId, {
        id: itemId,
        ...raw,
        first_seen_at: now,
        last_seen_at: now,
      });
    } else {
      existing.last_seen_at = now;
    }
  }
  
  // 7. 清理过期数据（45 天）
  for (const [id, record] of archive) {
    if (record.last_seen_at < keepAfter) {
      archive.delete(id);
    }
  }
  
  // 8. 时间窗口过滤（24 小时）
  let latestItems = Array.from(archive.values())
    .filter(item => eventTime(item) > windowStart);
  
  // 9. AI 相关性过滤
  let aiItems = latestItems.filter(isAiRelated);
  
  // 10. 标题翻译
  const { itemsAi, itemsAll } = await addBilingualFields(
    aiItems, latestItems, titleCache, translateMaxNew
  );
  
  // 11. 去重
  const deduped = dedupeItemsByTitleUrl(itemsAi, false);
  
  // 12. 写入输出文件
  await writeJson(latestPath, { items: deduped, ... });
  await writeJson(archivePath, { items: archive, ... });
  await writeJson(statusPath, statuses);
  
  return 0;
}
```

### 5.2 数据结构演变

```
RawItem (抓取层)
    │
    ▼ 合并入归档
ArchiveItem (存储层)
    │
    ▼ 时间窗口过滤
ArchiveItem[] (24h 数据)
    │
    ▼ AI 相关性过滤
ArchiveItem[] (AI 相关)
    │
    ▼ 标题翻译
ArchiveItem[] (含双语字段)
    │
    ▼ 去重
ArchiveItem[] (最终输出)
    │
    ▼ JSON 序列化
latest-24h.json
```

### 5.3 输出文件结构

#### `latest-24h.json`
```json
{
  "generated_at": "2026-02-25T08:26:49Z",
  "window_hours": 24,
  "total_items": 946,
  "total_items_ai_raw": 1024,
  "total_items_raw": 2500,
  "site_count": 12,
  "source_count": 156,
  "site_stats": [
    { "site_id": "opmlrss", "site_name": "OPML RSS", "count": 86, "raw_count": 150 }
  ],
  "items": [
    {
      "id": "sha1hash",
      "site_id": "opmlrss",
      "site_name": "OPML RSS",
      "source": "歸藏(guizang.ai)",
      "title": "GPT-5 即将发布",
      "url": "https://...",
      "published_at": "2026-02-25T08:00:00Z",
      "title_zh": "GPT-5 即将发布",
      "title_en": "GPT-5 Coming Soon",
      "title_bilingual": "GPT-5 即将发布 / GPT-5 Coming Soon"
    }
  ]
}
```

#### `source-status.json`
```json
{
  "generated_at": "2026-02-25T08:26:49Z",
  "sites": [
    {
      "site_id": "aihot",
      "site_name": "AI今日热榜",
      "ok": true,
      "item_count": 150,
      "duration_ms": 1234,
      "error": null
    }
  ],
  "successful_sites": 10,
  "failed_sites": ["waytoagi"],
  "rss_opml": {
    "enabled": true,
    "feed_total": 70,
    "ok_feeds": 65,
    "failed_feeds": ["https://..."],
    "skipped_feeds": [{ "feed_url": "...", "reason": "no_official_rss" }]
  }
}
```

---

## 6. Web 前端架构

### 6.1 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                     Hooks Layer                         ││
│  │  ┌───────────────┐  ┌───────────────┐                   ││
│  │  │ useNewsData   │  │  useTheme     │                   ││
│  │  │ • 数据获取    │  │ • 主题切换    │                   ││
│  │  │ • 筛选状态    │  │ • 持久化     │                   ││
│  │  │ • 分页逻辑    │  │              │                   ││
│  │  └───────────────┘  └───────────────┘                   ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  Components Layer                        ││
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐││
│  │  │ Header │ │ Stats  │ │ Filter │ │NewsList│ │ Modal  │││
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘││
│  │       │          │          │          │          │     ││
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           ││
│  │  │Loading │ │ Empty  │ │NewsCard│ │ Badge  │           ││
│  │  └────────┘ └────────┘ └────────┘ └────────┘           ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 6.2 核心 Hook: `useNewsData`

```typescript
function useNewsData(): UseNewsDataReturn {
  const [data, setData] = useState<NewsData | null>(null);
  const [selectedSite, setSelectedSite] = useState('opmlrss');
  const [selectedSource, setSelectedSource] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  
  // 数据获取
  const fetchData = async () => {
    const basePath = import.meta.env.BASE_URL || '/';
    const response = await fetch(`${basePath}data/latest-24h.json`);
    setData(await response.json());
  };
  
  // 来源统计（按选中站点）
  const sourceStats = useMemo(() => {
    if (!data?.items || selectedSite === 'all') return [];
    
    const sourceMap = new Map<string, number>();
    data.items
      .filter(item => item.site_id === selectedSite)
      .forEach(item => {
        sourceMap.set(item.source, (sourceMap.get(item.source) || 0) + 1);
      });
    
    return Array.from(sourceMap.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }, [data, selectedSite]);
  
  // 筛选逻辑
  const filteredItems = useMemo(() => {
    let items = data?.items || [];
    
    // 按站点筛选
    if (selectedSite !== 'all') {
      items = items.filter(item => item.site_id === selectedSite);
    }
    
    // 按来源筛选
    if (selectedSource !== 'all') {
      items = items.filter(item => item.source === selectedSource);
    }
    
    // 搜索
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query) ||
        item.title_zh?.toLowerCase().includes(query)
      );
    }
    
    // 分页
    return items.slice(0, displayCount);
  }, [data, selectedSite, selectedSource, searchQuery, displayCount]);
  
  // 加载更多
  const loadMore = () => setDisplayCount(prev => prev + PAGE_SIZE);
  
  // 重置联动
  useEffect(() => setSelectedSource('all'), [selectedSite]);
  
  return { data, filteredItems, sourceStats, ... };
}
```

### 6.3 组件设计

#### NewsCard 组件
```tsx
function NewsCard({ item, index }: NewsCardProps) {
  const displayTitle = item.title_zh || item.title;
  
  return (
    <a
      href={item.url}
      target="_blank"
      className="card card-hover animate-slide-up"
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <SourceBadge siteId={item.site_id} siteName={item.site_name} />
            <span className="text-xs text-slate-500">{item.source}</span>
          </div>
          
          <h3 className="group-hover:text-primary-600">{displayTitle}</h3>
          
          <div className="flex items-center gap-4 mt-3 text-xs">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDateTime(item.published_at)}
            </span>
          </div>
        </div>
        
        <ExternalLink className="opacity-0 group-hover:opacity-100" />
      </div>
    </a>
  );
}
```

### 6.4 样式系统

使用 Tailwind CSS + 自定义 CSS 变量实现主题切换：

```css
/* index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .card {
    @apply bg-white dark:bg-slate-800 rounded-xl border 
           border-slate-200 dark:border-slate-700 shadow-sm;
  }
  
  .card-hover {
    @apply hover:shadow-md hover:border-slate-300 
           dark:hover:border-slate-600 transition-all;
  }
  
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors;
  }
  
  .btn-primary {
    @apply bg-primary-600 text-white hover:bg-primary-700;
  }
}

@layer utilities {
  .animate-slide-up {
    animation: slide-up 0.3s ease-out forwards;
    opacity: 0;
  }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## 7. 自动化与 CI/CD

### 7.1 GitHub Actions 工作流

```yaml
# .github/workflows/update-ai-news.yml
name: Update AI News Snapshot

on:
  workflow_dispatch:                    # 手动触发
  schedule:
    - cron: "0 */2 * * *"               # 每 2 小时

permissions:
  contents: write
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false             # 防止并发冲突

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      # 1. 代码检出
      - uses: actions/checkout@v4
      
      # 2. 环境准备
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - uses: pnpm/action-setup@v4
        with: { version: 7 }
      - run: pnpm install --frozen-lockfile
      
      # 3. 解密 OPML（Base64 编码存储在 Secret 中）
      - name: Prepare OPML
        env:
          FOLLOW_OPML_B64: ${{ secrets.FOLLOW_OPML_B64 }}
        run: |
          if [ -n "$FOLLOW_OPML_B64" ]; then
            echo "$FOLLOW_OPML_B64" | base64 --decode > feeds/follow.opml
          fi
      
      # 4. 数据抓取
      - run: pnpm run fetch
      
      # 5. 提交数据更新
      - name: Commit changes
        run: |
          if git diff --quiet; then
            echo "No changes"
          else
            git config user.name "github-actions-bot"
            git add data/*.json
            git commit -m "chore: update ai news snapshot"
            git push
          fi
      
      # 6. 构建 Web
      - name: Build web
        run: |
          cd web
          pnpm install && pnpm build
          mkdir -p dist/data
          cp ../data/latest-24h.json dist/data/
      
      # 7. 部署到 GitHub Pages
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with: { path: ./web/dist }
  
  deploy:
    needs: update
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

### 7.2 自动化流程图

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GitHub Actions 定时触发                          │
│                      (每 2 小时 / 手动)                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        环境准备阶段                                  │
│  • 检出代码                                                          │
│  • 安装 Node.js 20                                                   │
│  • 安装 pnpm                                                         │
│  • 安装项目依赖                                                       │
│  • 解密 OPML 配置                                                    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        数据抓取阶段                                  │
│  • pnpm run fetch                                                   │
│  • 输出: latest-24h.json, archive.json, source-status.json          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        数据提交阶段                                  │
│  • 检测数据变化                                                      │
│  • git commit && git push                                           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Web 构建阶段                                  │
│  • pnpm install (web)                                               │
│  • pnpm build (Vite)                                                │
│  • 复制数据文件到 dist/data/                                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        部署阶段                                      │
│  • 上传 Artifact                                                    │
│  • 部署到 GitHub Pages                                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. 设计亮点与最佳实践

### 8.1 架构设计亮点

| 设计模式 | 应用场景 | 效果 |
|:---------|:---------|:-----|
| **策略模式** | Fetcher 接口 | 轻松扩展新数据源 |
| **模板方法** | BaseFetcher | 复用通用逻辑 |
| **工厂模式** | createAllFetchers | 统一创建管理 |
| **单一职责** | 模块划分 | 高内聚低耦合 |

### 8.2 健壮性设计

```typescript
// 1. 请求重试机制
fetchWithRetry(url, { retries: 3, retryDelay: 800 });

// 2. 双重编码检测
if (html.includes('�')) {
  const gb18030Html = new TextDecoder('gb18030').decode(buffer);
  if (fewer损坏字符) html = gb18030Html;
}

// 3. 降级数据提取
let data = extractNextFMerged(html);    // 方案1
if (!data) data = extractNextDataPayload(html); // 方案2

// 4. 翻译缓存复用
const cached = cache.get(title);
if (!cached && translatedNow < maxNew) {
  // 增量翻译
}
```

### 8.3 性能优化

- **并发控制**: p-limit 限制并发数为 5/20
- **增量更新**: 归档数据只更新变化部分
- **翻译限流**: 单次最多翻译 80 条
- **前端分页**: 默认展示 50 条，按需加载

### 8.4 可维护性

- **TypeScript**: 完整类型定义
- **ESLint + Prettier**: 统一代码风格
- **Husky**: 提交前检查
- **集中配置**: 所有可调参数在 config.ts

---

## 9. 扩展性分析

### 9.1 添加新数据源

只需三步：

```typescript
// 1. 创建新的 Fetcher 类
class NewSourceFetcher extends BaseFetcher {
  siteId = 'newsource';
  siteName = 'New Source';
  
  async fetch(now: Date): Promise<RawItem[]> {
    // 实现抓取逻辑
    const html = await this.fetchHtml('https://newsource.com');
    // ...解析数据
    return items.map(item => this.createItem({...}));
  }
}

// 2. 在 index.ts 中注册
export { NewSourceFetcher } from './newsource.js';

// 3. 在 createAllFetchers 中添加
export function createAllFetchers(): Fetcher[] {
  return [
    ...existing,
    new NewSourceFetcher(),
  ];
}
```

### 9.2 添加新过滤规则

```typescript
// config.ts
filter: {
  aiKeywords: [
    ...existing,
    'newkeyword',       // 添加新关键词
  ],
  // 或添加新规则类别
  newCategory: ['keyword1', 'keyword2'],
}

// ai-related.ts
const hasNewCategory = containsAnyKeyword(text, CONFIG.filter.newCategory);
```

### 9.3 自定义输出格式

```typescript
// 扩展 output/index.ts
export async function writeMarkdown(path: string, items: ArchiveItem[]): Promise<void> {
  const content = items.map(item => 
    `- [${item.title}](${item.url}) - ${item.source}`
  ).join('\n');
  
  await writeFile(path, content, 'utf-8');
}
```

---

## 10. 性能优化策略

### 10.1 抓取层优化

| 策略 | 实现 | 效果 |
|:-----|:-----|:-----|
| 并发限制 | p-limit(5) / p-limit(20) | 避免被封禁 |
| 请求超时 | AbortController | 快速失败 |
| 指数退避 | retryDelay * (attempt + 1) | 平滑重试 |
| URL 替换 | CONFIG.rss.replacements | 绕过不稳定源 |

### 10.2 处理层优化

| 策略 | 实现 | 效果 |
|:-----|:-----|:-----|
| 增量合并 | Map<id, ArchiveItem> | O(1) 查找 |
| 翻译缓存 | title-zh-cache.json | 减少 API 调用 |
| 翻译限流 | maxNewTranslations: 80 | 控制耗时 |

### 10.3 前端优化

| 策略 | 实现 | 效果 |
|:-----|:-----|:-----|
| 虚拟滚动思想 | displayCount + loadMore | 减少初始渲染 |
| useMemo | 筛选结果缓存 | 避免重复计算 |
| 动画延迟上限 | Math.min(index * 30, 300) | 流畅动画 |

---

## 总结

AI News Aggregator 是一个设计精良的全栈资讯聚合系统，具有以下特点：

1. **架构清晰**: 采用分层设计，职责明确
2. **扩展性强**: 策略模式使新增数据源极为简单
3. **健壮可靠**: 多重降级策略确保稳定运行
4. **自动化程度高**: GitHub Actions 实现全自动更新部署
5. **用户体验佳**: 响应式设计 + 暗色模式 + 多维度筛选
