<div align="center">

# 🤖 AI News Aggregator

**实时追踪 AI 领域最前沿动态，聚合全球顶级 AI 资讯源**

[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/SuYxh/ai-news-aggregator/update-ai-news.yml?label=auto%20update&logo=github)](https://github.com/SuYxh/ai-news-aggregator/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)](https://www.typescriptlang.org/)

[🌐 在线预览](https://suyxh.github.io/ai-news-aggregator/) · [📝 更新日志](./CHANGELOG.md) · [🔧 技术方案](./TECH_SPEC.md)

</div>

---

## ✨ 项目亮点

<table>
<tr>
<td width="50%">

### 📡 多源聚合
从 **14 个专业平台** + **70+ 个精选 RSS 订阅** + **52 个微信公众号** 实时抓取资讯，覆盖全球 AI 生态

### 🧠 智能筛选
基于关键词匹配的 AI 相关性过滤，从海量信息中精准提取 AI/科技内容

### 🌐 双语支持
英文标题自动翻译为中文，提供原文/译文/双语三种展示方式

</td>
<td width="50%">

### ⚡ 自动更新
GitHub Actions 每 2 小时自动抓取，数据永远保持最新

### 🎨 Web 可视化
内置 React + TypeScript Web 应用，支持多维度筛选、搜索、暗色模式

### 📦 结构化数据
输出标准 JSON 格式，方便二次开发和数据分析

</td>
</tr>
</table>

---

## 🖼️ 界面预览

<div align="center">

### 📰 首页资讯流

<img src="./assets/home.jpeg" alt="首页" width="800" />

<br />

<table>
<tr>
<td width="50%" align="center">

### ⭐ 收藏功能

<img src="./assets/favorite.jpeg" alt="收藏" width="380" />

</td>
<td width="50%" align="center">

### 📖 阅读历史

<img src="./assets/read-history.jpeg" alt="阅读历史" width="380" />

</td>
</tr>
</table>

### 📡 RSS 订阅源

<img src="./assets/rss-1.jpeg" alt="RSS订阅源" width="800" />

</div>

---

## 🌐 在线预览

访问 [https://suyxh.github.io/ai-news-aggregator/](https://suyxh.github.io/ai-news-aggregator/) 查看实时 AI 资讯聚合。

**功能特性：**
- 📱 响应式设计，支持移动端
- 🔍 按平台、订阅源筛选
- 🔎 标题关键词搜索
- 🌙 浅色/深色主题切换
- ⭐ 文章收藏（本地持久化）
- � 阅读历史追踪
- 📤 数据导出（JSON 格式）
- ⏱️ 24h/7d 时间范围切换
- 🚀 智能预加载，切换秒开

---

## 📊 数据源矩阵

### 聚合平台（14 个）

| 平台 | 说明 | 特点 |
|:-----|:-----|:-----|
| **AI今日热榜** | AI 热点聚合 | 专注 AI 领域，覆盖全面 |
| **TechURLs** | 技术链接聚合 | HN、Reddit 热门技术文章 |
| **NewsNow** | 新闻聚合 | 全球科技新闻实时追踪 |
| **TopHub** | 今日热榜 | 50+ 平台热门内容聚合 |
| **Buzzing** | 话题聚合 | Reddit、HN、Twitter 讨论 |
| **Info Flow** | RSS 信息流 | 精选科技博客资讯 |
| **Zeli** | HN 24h 热榜 | Hacker News 每日精选 |
| **AI HubToday** | AI 日报 | AI 领域重要动态 |
| **AIbase** | AI 产品库 | 最新 AI 工具和应用 |
| **BestBlogs** | 博客周刊 | 优质技术博客文章 |
| **WaytoAGI** | 知识库 | 飞书知识库 AI 更新 |
| **YouTube** | 视频平台 | AI 博主最新视频 |
| **新智元** | AI 媒体 | 国内领先 AI 资讯 |
| **微信公众号** | 公众号聚合 | 52 个优质订阅源 |

### 微信公众号订阅（52 个）

精选国内最优质的微信公众号，涵盖 AI、科技、财经、技术等领域：

<details>
<summary><b>🤖 AI/人工智能（11 个）</b></summary>

| 公众号 | 说明 |
|:-------|:-----|
| **机器之心** | AI 领域头部媒体，深度报道 |
| **量子位** | AI 科技媒体，前沿动态 |
| **新智元** | AI 产业媒体，技术与应用 |
| **DeepTech深科技** | 深度科技报道 |
| **PaperWeekly** | AI 论文解读，学术前沿 |
| **计算机视觉life** | CV 方向技术内容 |
| **AI前线** | InfoQ 旗下 AI 技术媒体 |
| **夕小瑶科技说** | AI/NLP 技术博主 |
| **海外独角兽** | 海外 AI 创业与投资 |
| **甲子光年** | 科技产业深度报道 |
| **集智俱乐部** | 复杂系统与 AI 交叉研究 |

</details>

<details>
<summary><b>📰 科技/互联网媒体（10 个）</b></summary>

| 公众号 | 说明 |
|:-------|:-----|
| **晚点LatePost** | 深度商业报道，科技巨头内幕 |
| **36氪** | 头部科技商业媒体 |
| **36氪Pro** | 36氪深度版 |
| **虎嗅App** | 科技商业评论 |
| **极客公园** | 科技创新报道 |
| **少数派** | 数字生活，效率工具 |
| **APPSO** | 应用推荐与数码评测 |
| **爱范儿** | 消费科技媒体 |
| **差评** | 科技评论与深度报道 |
| **钛媒体** | 科技商业媒体 |

</details>

<details>
<summary><b>💻 技术/开发者（6 个）</b></summary>

| 公众号 | 说明 |
|:-------|:-----|
| **InfoQ** | 软件开发技术媒体 |
| **阿里云开发者** | 阿里技术分享 |
| **腾讯技术工程** | 腾讯技术分享 |
| **前端之巅** | 前端技术 |
| **架构师之路** | 架构设计 |
| **GitHubDaily** | 开源项目推荐 |

</details>

<details>
<summary><b>💰 财经/投资（8 个）</b></summary>

| 公众号 | 说明 |
|:-------|:-----|
| **华尔街见闻** | 全球财经资讯 |
| **财经杂志** | 财经深度报道 |
| **第一财经YiMagazine** | 商业财经 |
| **经纬创投** | 创投视角 |
| **红杉汇** | 红杉资本 |
| **42章经** | 创投与创业 |
| **远川投资评论** | 投资分析 |
| **泽平宏观展望** | 宏观经济分析 |

</details>

<details>
<summary><b>✍️ 高质量个人博主（12 个）</b></summary>

| 公众号 | 说明 |
|:-------|:-----|
| **caoz的梦呓** | 互联网老兵，行业洞察 |
| **L先生说** | 思维方法论 |
| **槽边往事** | 和菜头，生活随笔 |
| **孟岩** | 投资与认知 |
| **刘润** | 商业洞察 |
| **辉哥奇谭** | 职场与成长 |
| **warfalcon** | 阅读与学习方法 |
| **玉树芝兰** | 知识管理 |
| **九边** | 历史与时事评论 |
| **也谈钱** | 理财与投资 |
| **keso怎么看** | 互联网评论 |
| **阑夕** | 科技评论 |

</details>

<details>
<summary><b>🎯 产品/商业（6 个）</b></summary>

| 公众号 | 说明 |
|:-------|:-----|
| **人人都是产品经理** | 产品方法论 |
| **互联网怪盗团** | 互联网行业分析 |
| **乱翻书** | 商业与产品 |
| **刘言飞语** | 产品思考 |
| **产品犬舍** | 产品设计 |
| **FounderPark** | 创业者访谈 |

</details>

### 精选 RSS 订阅（70+ 个）

我们精心筛选了 AI 领域最具影响力的信息源，包括：

<details>
<summary><b>🏢 顶级 AI 公司官方账号（17 个）</b></summary>

| 公司 | Twitter/X |
|:-----|:----------|
| OpenAI | [@OpenAI](https://twitter.com/OpenAI) · [@OpenAIDevs](https://twitter.com/OpenAIDevs) · [@ChatGPTapp](https://twitter.com/ChatGPTapp) |
| Anthropic | [@AnthropicAI](https://twitter.com/AnthropicAI) · [@claudeai](https://twitter.com/claudeai) |
| Google | [@GoogleAI](https://twitter.com/GoogleAI) · [@GoogleDeepMind](https://twitter.com/GoogleDeepMind) · [@GeminiApp](https://twitter.com/GeminiApp) |
| Meta | [@AIatMeta](https://twitter.com/AIatMeta) |
| Microsoft | [@MSFTResearch](https://twitter.com/MSFTResearch) |
| NVIDIA | [@NVIDIAAI](https://twitter.com/NVIDIAAI) |
| xAI | [@xai](https://twitter.com/xai) |
| Hugging Face | [@huggingface](https://twitter.com/huggingface) |
| Groq | [@GroqInc](https://twitter.com/GroqInc) |

</details>

<details>
<summary><b>🇨🇳 中国 AI 公司（11 个）</b></summary>

| 公司 | 产品/领域 |
|:-----|:----------|
| **阿里 Qwen** | 通义千问大模型 |
| **DeepSeek** | DeepSeek 大模型 |
| **腾讯 Hunyuan** | 混元大模型 |
| **昆仑万维 Skywork** | 天工大模型 |
| **快手 Kling AI** | 可灵视频生成 |
| **MiniMax** | 海螺 AI |
| **Fish Audio** | AI 语音合成 |
| **Monica** | AI 助手 |
| **Dify** | LLM 应用开发平台 |
| **Jina AI** | 向量搜索/嵌入 |
| **Milvus** | 向量数据库 |

</details>

<details>
<summary><b>👨‍🔬 华人 AI 研究者（8 人）</b></summary>

| 研究者 | 身份/贡献 |
|:-------|:----------|
| **Fei-Fei Li 李飞飞** | 斯坦福教授，ImageNet 创始人 |
| **Andrew Ng 吴恩达** | DeepLearning.AI 创始人 |
| **Jim Fan 范麟熙** | NVIDIA 高级研究科学家 |
| **Lilian Weng** | OpenAI 安全系统负责人 |
| **Jerry Liu** | LlamaIndex 创始人 |
| **Junyang Lin 林俊旸** | 阿里 Qwen 核心成员 |
| **Binyuan Hui** | 阿里 Qwen 核心成员 |
| **Hung-yi Lee 李宏毅** | 台大教授，机器学习课程 |

</details>

<details>
<summary><b>🛠️ AI 开发工具（12 个）</b></summary>

| 工具 | 用途 |
|:-----|:-----|
| **LangChain** | LLM 应用开发框架 |
| **LlamaIndex** | 数据索引/RAG 框架 |
| **Ollama** | 本地 LLM 运行 |
| **Cursor** | AI 代码编辑器 |
| **Windsurf** | AI 编程助手 |
| **bolt.new** | AI 全栈开发 |
| **Firecrawl** | Web 爬虫/数据提取 |
| **Browser Use** | 浏览器自动化 |
| **OpenRouter** | LLM API 聚合 |
| **AI SDK** | Vercel AI SDK |
| **NotebookLM** | Google AI 笔记 |
| **DeepLearning.AI** | AI 教育平台 |

</details>

<details>
<summary><b>✍️ 中文 AI 博主（15 人）</b></summary>

| 博主 | 领域/特点 |
|:-----|:----------|
| **宝玉** | AI 技术解读、行业分析 |
| **歸藏** | AI 产品、前沿动态 |
| **小互** | AI 应用、效率工具 |
| **向阳乔木** | AI 创业、产品思考 |
| **AI产品黄叔** | AI 产品设计 |
| **李继刚** | Prompt 工程、AI 写作 |
| **Tw93** | 前端开发、AI 工具 |
| **idoubi** | AI 开发、技术分享 |
| **Viking** | 全栈开发、AI 应用 |
| **Geek** | 技术极客、工具推荐 |
| **Yangyi** | AI 研究、深度分析 |
| **hidecloud** | AI 产品、行业洞察 |
| **cat** | AI 技术、前沿探索 |
| **meng shao** | AI 应用、效率提升 |
| **Eric Jing** | AI 创业、商业化 |

</details>

<details>
<summary><b>📰 中文技术博客（6 个）</b></summary>

| 博客 | 说明 |
|:-----|:-----|
| **量子位** | AI 领域头部媒体 |
| **宝玉的分享** | 技术深度文章 |
| **爱范儿** | 科技数码资讯 |
| **阮一峰的网络日志** | 技术周刊 |
| **美团技术团队** | 工程实践分享 |
| **掘金本周最热** | 开发者社区精选 |

</details>

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm（推荐）或 npm

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/SuYxh/ai-news-aggregator.git
cd ai-news-aggregator

# 安装依赖
pnpm install

# 运行数据抓取
pnpm fetch

# 启动 Web 界面
cd web && pnpm install && pnpm dev
```

### 命令说明

```bash
# 完整抓取（所有数据源）
pnpm fetch

# 仅测试 OPML RSS
pnpm fetch:opml

# 限制测试前 N 个 RSS
pnpm fetch:opml ./feeds/follow.opml 10

# Web 开发模式
cd web && pnpm dev

# Web 生产构建
cd web && pnpm build
```

### 命令行参数

| 参数 | 默认值 | 说明 |
|:-----|:-------|:-----|
| `--output-dir` | `data` | 输出目录 |
| `--window-hours` | `24` | 时间窗口（小时） |
| `--archive-days` | `45` | 归档保留天数 |
| `--translate-max-new` | `80` | 单次最大翻译数 |
| `--rss-opml` | `./feeds/follow.opml` | OPML 订阅文件 |
| `--rss-max-feeds` | `0` | 最大 RSS 数量 |

---

## 📁 输出文件

运行后在 `data/` 目录生成：

| 文件 | 说明 |
|:-----|:-----|
| `latest-24h.json` | 最近 24 小时 AI 资讯 |
| `latest-7d.json` | 最近 7 天 AI 资讯 |
| `archive.json` | 历史归档（45 天） |
| `source-status.json` | 数据源抓取状态 |
| `opml-feeds.json` | OPML 订阅源列表 |
| `waytoagi-7d.json` | WaytoAGI 近 7 天更新 |
| `title-zh-cache.json` | 标题翻译缓存 |

### 数据结构

```json
{
  "generated_at": "2026-02-25T08:26:49Z",
  "window_hours": 24,
  "total_items": 946,
  "source_count": 156,
  "site_stats": [
    { "site_id": "opmlrss", "site_name": "OPML RSS", "count": 86, "raw_count": 150 }
  ],
  "items": [
    {
      "id": "abc123...",
      "site_id": "opmlrss",
      "site_name": "OPML RSS",
      "source": "歸藏(guizang.ai)(@op7418)",
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

---

## 🔧 自定义配置

### 添加自定义 RSS 订阅

1. 编辑 `feeds/follow.opml`
2. 按 OPML 格式添加订阅：

```xml
<outline text="分组名称" title="分组名称">
  <outline text="订阅名称" type="rss" xmlUrl="RSS_URL"/>
</outline>
```

### GitHub Actions 自动更新

项目已配置 GitHub Actions，每 2 小时自动：
1. 抓取所有数据源
2. 构建 Web 应用
3. 部署到 GitHub Pages

如需修改更新频率，编辑 `.github/workflows/update-ai-news.yml`：

```yaml
schedule:
  - cron: "0 */2 * * *"  # 每 2 小时
```

---

## 🏗️ 项目结构

```
ai-news-aggregator/
├── src/                      # 数据抓取源码
│   ├── index.ts              # 主入口
│   ├── config.ts             # 配置
│   ├── types.ts              # 类型定义
│   ├── fetchers/             # 各平台抓取器
│   │   ├── wechat-rss.ts     # 微信公众号抓取
│   │   ├── youtube.ts        # YouTube 抓取
│   │   └── ...               # 其他平台
│   ├── filters/              # 过滤器（AI 相关性、去重）
│   ├── translate/            # 翻译模块
│   └── utils/                # 工具函数
├── web/                      # Web 前端
│   ├── src/
│   │   ├── components/       # React 组件
│   │   ├── hooks/            # 自定义 Hooks
│   │   └── App.tsx           # 应用入口
│   ├── index.html
│   └── vite.config.ts
├── feeds/                    # RSS 订阅配置
│   └── follow.opml
├── assets/                   # 截图资源
├── data/                     # 输出数据
└── .github/workflows/        # GitHub Actions
```

---

## 🛠️ 技术栈

### 数据抓取

| 技术 | 用途 |
|:-----|:-----|
| **TypeScript** | 类型安全 |
| **Cheerio** | HTML 解析 |
| **rss-parser** | RSS 解析 |
| **fast-xml-parser** | XML 解析 |
| **dayjs** | 日期处理 |
| **p-limit** | 并发控制 |

### Web 前端

| 技术 | 用途 |
|:-----|:-----|
| **React 18** | UI 框架 |
| **TypeScript** | 类型安全 |
| **Vite** | 构建工具 |
| **Tailwind CSS** | 样式框架 |
| **Lucide React** | 图标库 |

---

## 📝 更新日志

查看 [CHANGELOG.md](./CHANGELOG.md) 了解版本更新详情。

---

## 📄 License

MIT © [SuYxh](https://github.com/SuYxh)

---

<div align="center">

**如果这个项目对你有帮助，欢迎 ⭐ Star 支持！**

[🐛 报告问题](https://github.com/SuYxh/ai-news-aggregator/issues) · [💡 功能建议](https://github.com/SuYxh/ai-news-aggregator/issues)

</div>
