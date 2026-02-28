# 伊以美战事实时追踪平台

一个实时展示伊朗、以色列、美国军事动态的新闻聚合平台，支持多源 RSS 抓取、自动翻译、时间线展示。

## ✨ 功能特性

- 🔄 **实时更新**：每 10 秒自动刷新最新战况，支持手动刷新
- 📰 **多源聚合**：从 Google News、BBC、Al Jazeera、Defense News 等多个免费 RSS 源并行抓取
- 🌐 **自动翻译**：英文新闻自动翻译为中文，保留原文对照
- ⏰ **时间过滤**：仅展示 2026-02-28 及之后的新闻
- 🎯 **智能过滤**：基于关键词自动筛选相关军事新闻
- 📱 **响应式设计**：完美适配桌面端和移动端
- 🔗 **来源追溯**：每条新闻标注来源，点击可跳转原文

## 🛠️ 技术栈

- **框架**：Next.js 16 (App Router)
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **数据获取**：SWR
- **RSS 解析**：rss-parser
- **翻译**：@vitalets/google-translate-api
- **部署**：Vercel (Serverless)

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm / yarn / pnpm

### 安装依赖

```bash
npm install
```

### 环境配置

创建 `.env.local` 文件（可选，使用默认值也可运行）：

```bash
# 缓存过期时间（毫秒），默认 60000
CACHE_TTL=60000

# 前端刷新间隔（毫秒），默认 10000
NEXT_PUBLIC_REFRESH_INTERVAL=10000
```

### 开发运行

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
npm run build
npm start
```

## 📦 部署

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 自动部署完成

无需配置任何环境变量，项目使用完全免费的 RSS 源，无需 API Key。

### 其他平台

项目基于 Next.js，可部署到任何支持 Node.js 的平台：
- Netlify
- Railway
- 自建服务器

## 📁 项目结构

```
iron-fetch-news/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/news/     # API 路由
│   │   └── page.tsx      # 主页面
│   ├── components/       # React 组件
│   │   ├── Header.tsx
│   │   ├── NewsTimeline.tsx
│   │   ├── NewsItemCard.tsx
│   │   └── CountdownTimer.tsx
│   ├── hooks/            # 自定义 Hooks
│   │   ├── useNews.ts
│   │   └── useCountdown.ts
│   ├── lib/              # 核心逻辑
│   │   ├── rssFetcher.ts      # RSS 抓取
│   │   ├── rssConfig.ts       # RSS 源配置
│   │   ├── dateFilter.ts      # 时间过滤
│   │   ├── translator.ts      # 翻译模块
│   │   ├── filter.ts          # 关键词过滤
│   │   ├── newsService.ts     # 新闻聚合服务
│   │   └── cache.ts           # 内存缓存
│   └── types/            # TypeScript 类型定义
├── REQUIREMENTS.md        # 需求文档
├── TECHNICAL.md          # 技术实现文档
└── README.md             # 项目说明
```

## 🔧 核心模块说明

### RSS 源配置

项目支持三类 RSS 源：
- **第一梯队**：Google News 自定义搜索（中英文）
- **第二梯队**：国际权威媒体（BBC、Al Jazeera、NPR、DW）
- **第三梯队**：军事专业媒体（Defense News、Military Times）

所有源均免费，无需 API Key。

### 数据处理流程

```
RSS 抓取 → 时间过滤 → 关键词过滤 → 去重 → 翻译 → 排序 → 缓存
```

### 翻译机制

- 使用 `@vitalets/google-translate-api`（免费，无需 API Key）
- 仅翻译英文内容，中文内容原样保留
- 翻译结果缓存，避免重复请求
- 翻译失败时回退显示原文

## 📝 开发说明

### 添加新的 RSS 源

编辑 `src/lib/rssConfig.ts`，在 `RSS_SOURCES` 数组中添加新源：

```typescript
{
  id: "source-id",
  name: "Source Name",
  url: "https://example.com/rss",
  lang: "en" | "zh",
  tier: 1 | 2 | 3,
}
```

### 修改关键词过滤

编辑 `src/lib/constants.ts`，更新 `KEYWORDS` 对象中的国家/地区关键词和军事行动关键词。

### 调整刷新间隔

修改 `.env.local` 中的 `NEXT_PUBLIC_REFRESH_INTERVAL` 值（单位：毫秒）。

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，请通过 GitHub Issues 联系。

---

**注意**：本项目仅用于信息聚合展示，所有新闻内容来源于第三方 RSS 源，不代表项目立场。
