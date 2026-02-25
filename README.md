# AI News Aggregator

AI 新闻聚合器 - 从多个 AI/科技资讯网站自动抓取新闻，生成结构化 JSON 数据。

## 功能特性

- � **多源聚合** - 支持 10+ 个数据源同时抓取
- � **RSS 订阅** - 支持 OPML 格式导入自定义 RSS 订阅
- 🤖 **智能过滤** - 自动识别 AI/科技相关内容
- 🌐 **双语标题** - 英文标题自动翻译为中文
- � **增量归档** - 自动去重，保留历史数据
- ⚡ **高性能** - 并发抓取，快速处理

## 支持的数据源

| 数据源 | 说明 |
|--------|------|
| TechURLs | 技术链接聚合 |
| Buzzing | 热门话题聚合 |
| Info Flow | RSS 信息流 |
| BestBlogs | 博客周刊 |
| TopHub | 今日热榜 |
| Zeli | Hacker News 24h 热榜 |
| AI HubToday | AI 资讯日报 |
| AIbase | AI 新闻 |
| AI今日热榜 | AI 热点聚合 |
| NewsNow | 新闻聚合 |
| OPML RSS | 自定义 RSS 订阅 |
| WaytoAGI | 飞书知识库更新 |

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm (推荐) 或 npm

### 安装

```bash
# 克隆项目
git clone <repo-url>
cd ai-report

# 安装依赖
pnpm install
```

### 运行

```bash
# 基本用法 - 抓取所有数据源
pnpm fetch

# 单独测试 OPML RSS（用于调试）
pnpm fetch:opml

# 限制测试前 N 个 feed
pnpm fetch:opml ./feeds/follow.opml 10
```

默认会抓取 10 个内置数据源。如果 `./feeds/follow.opml` 文件存在，也会自动抓取其中的 RSS 订阅。

### 控制台输出示例

运行时会显示实时抓取进度：

```
📡 Fetching from built-in sources...
  ⏳ [TechURLs] Fetching...
  ⏳ [Buzzing] Fetching...
  ✅ [TopHub] 3041 items (2027ms)
  ✅ [TechURLs] 405 items (3177ms)
  ❌ [SomeSource] Failed: Connection timeout (5000ms)
  ...

📰 Fetching OPML RSS from ./feeds/follow.opml...
  📋 Found 70 feeds in OPML
  🚀 Fetching 65 feeds (concurrency: 20)...
    ✅ [RSS] 宝玉的分享: 50 items (3655ms)
    ❌ [RSS] 量子位: Status code 403 (919ms)
    ⏭️  [RSS] 某订阅: Skipped (no_official_rss)
    ...

📊 Fetched 6842 raw items from 11 sources
🤖 AI-related items: 1351 / 6788
🌐 Adding bilingual fields...

📚 Fetching WaytoAGI...
  ✅ WaytoAGI: 12 updates in last 7 days

💾 Writing output files...
  ✅ data/latest-24h.json (1266 items)
  ✅ data/archive.json (7028 items)
  ...

🎉 Done!
```

**状态图标说明**：⏳ 正在抓取 | ✅ 成功 | ❌ 失败 | ⚠️ 成功但 0 条 | ⏭️ 跳过

## 命令行参数

```bash
npx tsx src/index.ts [options]
```

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--output-dir <dir>` | `data` | 输出目录 |
| `--window-hours <hours>` | `24` | 时间窗口（小时） |
| `--archive-days <days>` | `45` | 归档保留天数 |
| `--translate-max-new <count>` | `80` | 单次运行最大翻译数 |
| `--rss-opml <path>` | `./feeds/follow.opml` | OPML 订阅文件路径 |
| `--rss-max-feeds <count>` | `0` | 最大抓取 RSS 数量 (0=全部) |

### 示例

```bash
# 使用默认配置
pnpm fetch

# 指定输出目录
npx tsx src/index.ts --output-dir ./output

# 不使用 OPML RSS（指定一个不存在的路径）
npx tsx src/index.ts --rss-opml /dev/null

# 限制翻译数量
npx tsx src/index.ts --translate-max-new 20

# 自定义时间窗口（48小时）
npx tsx src/index.ts --window-hours 48
```

## OPML RSS 配置

### 默认行为

- 默认读取 `./feeds/follow.opml` 文件
- 如果文件存在，自动抓取其中的 RSS 订阅
- 如果文件不存在，静默跳过（不报错）

### 添加自定义订阅

1. 创建 `feeds/` 目录
2. 将你的 OPML 文件放入 `feeds/follow.opml`

OPML 格式示例：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>我的 RSS 订阅</title>
  </head>
  <body>
    <outline text="技术博客" title="技术博客">
      <outline text="阮一峰的网络日志" type="rss" 
        xmlUrl="http://feeds.feedburner.com/ruanyifeng"/>
    </outline>
  </body>
</opml>
```

### RSS 源优化

程序内置了以下优化规则：

- **自动替换**：RSSHub 代理地址自动替换为官方源
- **自动跳过**：Telegram、B站等不稳定源自动跳过
- **并发控制**：RSS 抓取限制 20 并发

## 输出文件

运行后会在 `data/` 目录生成以下文件：

| 文件 | 说明 |
|------|------|
| `latest-24h.json` | 最近 24 小时的 AI 相关新闻 |
| `archive.json` | 历史归档（默认保留 45 天） |
| `source-status.json` | 各数据源抓取状态 |
| `waytoagi-7d.json` | WaytoAGI 近 7 天更新 |
| `title-zh-cache.json` | 标题翻译缓存 |

### latest-24h.json 结构

```json
{
  "generated_at": "2026-02-25T08:26:49Z",
  "window_hours": 24,
  "total_items": 1228,
  "topic_filter": "ai_tech_robotics",
  "site_stats": [...],
  "items": [
    {
      "id": "abc123...",
      "site_id": "aibase",
      "site_name": "AIbase",
      "source": "AIbase",
      "title": "OpenAI 发布 GPT-5",
      "url": "https://...",
      "published_at": "2026-02-25T08:00:00Z",
      "title_original": "OpenAI Releases GPT-5",
      "title_en": "OpenAI Releases GPT-5",
      "title_zh": "OpenAI 发布 GPT-5",
      "title_bilingual": "OpenAI 发布 GPT-5 / OpenAI Releases GPT-5"
    }
  ]
}
```

## 项目结构

```
ai-report/
├── src/
│   ├── index.ts              # 主入口
│   ├── types.ts              # 类型定义
│   ├── config.ts             # 配置常量
│   ├── utils/                # 工具函数
│   │   ├── http.ts           # HTTP 客户端
│   │   ├── url.ts            # URL 处理
│   │   ├── date.ts           # 日期解析
│   │   ├── text.ts           # 文本处理
│   │   └── hash.ts           # 哈希生成
│   ├── fetchers/             # 数据源抓取器
│   │   ├── techurls.ts
│   │   ├── buzzing.ts
│   │   ├── iris.ts
│   │   ├── bestblogs.ts
│   │   ├── tophub.ts
│   │   ├── zeli.ts
│   │   ├── aihubtoday.ts
│   │   ├── aibase.ts
│   │   ├── aihot.ts
│   │   ├── newsnow.ts
│   │   ├── opml-rss.ts
│   │   └── waytoagi.ts
│   ├── test-opml.ts          # OPML RSS 测试脚本
│   ├── filters/              # 过滤器
│   │   ├── ai-related.ts     # AI 相关性过滤
│   │   └── dedupe.ts         # 去重
│   ├── translate/            # 翻译
│   │   └── google.ts         # Google Translate
│   └── output/               # 输出
│       └── json-writer.ts
├── feeds/                    # RSS 订阅配置
│   └── follow.opml
├── data/                     # 输出数据
├── package.json
├── tsconfig.json
└── README.md
```

## 开发

```bash
# 类型检查
pnpm typecheck

# 构建
pnpm build
```

## 技术栈

- **运行时**: Node.js 18+
- **语言**: TypeScript 5+
- **HTML 解析**: Cheerio
- **RSS 解析**: rss-parser
- **XML 解析**: fast-xml-parser
- **日期处理**: dayjs
- **并发控制**: p-limit

## License

MIT
