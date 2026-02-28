# 伊以美战事实时追踪平台 — 技术实现文档

## 1. 数据源调研（RSS 方案）

### 1.1 调研结论

完全弃用付费 API（TianAPI、NewsAPI），采用 **纯免费 RSS 源**。

### 1.2 最终选定的 RSS 源

#### 第一梯队：Google News 自定义搜索 RSS（核心源）

Google News 支持通过 URL 拼接关键词生成 RSS Feed，完全免费、无配额、实时聚合全网新闻。

```
格式：https://news.google.com/rss/search?q={关键词}&hl={语言}&gl={地区}&ceid={地区}:{语言}
```

选定的 Feed：

| ID          | URL                                                                                                  | 说明                 |
| ----------- | ---------------------------------------------------------------------------------------------------- | -------------------- |
| google-en-1 | `https://news.google.com/rss/search?q=Iran+Israel+war+military&hl=en&gl=US&ceid=US:en`               | 英文：伊朗以色列军事 |
| google-en-2 | `https://news.google.com/rss/search?q=Middle+East+conflict+airstrike+missile&hl=en&gl=US&ceid=US:en` | 英文：中东冲突       |
| google-zh-1 | `https://news.google.com/rss/search?q=伊朗+以色列+战争&hl=zh-CN&gl=CN&ceid=CN:zh-Hans`               | 中文：伊朗以色列战争 |
| google-zh-2 | `https://news.google.com/rss/search?q=伊朗+以色列+军事+打击&hl=zh-CN&gl=CN&ceid=CN:zh-Hans`          | 中文：军事打击       |

#### 第二梯队：国际权威媒体（补充源）

| ID        | 源名称      | RSS URL                                                   |
| --------- | ----------- | --------------------------------------------------------- |
| bbc       | BBC 中东    | `https://feeds.bbci.co.uk/news/world/middle_east/rss.xml` |
| aljazeera | Al Jazeera  | `https://www.aljazeera.com/xml/rss/all.xml`               |
| npr       | NPR 世界    | `https://feeds.npr.org/1004/rss.xml`                      |
| dw        | DW 德国之声 | `https://rss.dw.com/rdf/rss-en-world`                     |

#### 第三梯队：军事专业（深度源）

| ID              | 源名称           | RSS URL                                                               |
| --------------- | ---------------- | --------------------------------------------------------------------- |
| defensenews     | Defense News     | `https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml`   |
| militarytimes   | Military Times   | `https://www.militarytimes.com/arc/outboundfeeds/rss/?outputType=xml` |
| breakingdefense | Breaking Defense | `https://breakingdefense.com/feed/`                                   |

### 1.3 与原方案对比

| 指标     | 原方案（TianAPI+NewsAPI） | 新方案（纯 RSS） |
| -------- | ------------------------- | ---------------- |
| 费用     | 付费                      | **免费**         |
| API Key  | 需要                      | **不需要**       |
| 调用限制 | 100-10000 次/天           | **无限制**       |
| 来源追溯 | 部分                      | **100%**         |
| 容错     | 单源                      | **多源互备**     |

---

## 2. 技术架构

### 2.1 技术栈

```
┌─────────────────────────────────────────────┐
│                  前端 (Client)               │
│  Next.js 14 App Router + React 18 + TS      │
│  Tailwind CSS · SWR · date-fns              │
├─────────────────────────────────────────────┤
│               服务端 (Server)                │
│  Next.js API Routes (Serverless Functions)   │
│  rss-parser · 内存缓存 · 关键词过滤          │
│  @vitalets/google-translate-api（英→中翻译） │
├─────────────────────────────────────────────┤
│              数据源 (免费 RSS)                │
│  Google News RSS · BBC · Al Jazeera          │
│  NPR · DW · Defense News · Military Times   │
└─────────────────────────────────────────────┘
```

### 2.2 数据流

```
用户浏览器
    │ 每10秒 GET /api/news
    ▼
Next.js API Route (/api/news)
    │ 检查内存缓存（60秒有效期）
    │
    ├─ 缓存命中 → 直接返回缓存数据
    │
    └─ 缓存未命中
         │ 并行请求（Promise.allSettled）
         ├──→ Google News RSS × 4 (中英文各2)
         ├──→ BBC RSS
         ├──→ Al Jazeera RSS
         ├──→ NPR RSS
         ├──→ DW RSS
         ├──→ Defense News RSS
         ├──→ Military Times RSS
         └──→ Breaking Defense RSS
                │
                ▼
         rss-parser 解析 XML → 标准化 NewsItem[]
                │
                ▼
         时间过滤（仅保留 >= 2026-02-28 的新闻）
                │
                ▼
         关键词过滤（国家词+军事词） → 去重
                │
                ▼
         英文内容翻译为中文（@vitalets/google-translate-api）
                │
                ▼
         按时间倒序排序 → 写入缓存（60秒） → 返回前端
```

### 2.3 项目目录结构（变更部分）

```
src/lib/
├── rssFetcher.ts          # RSS源抓取+解析
├── rssConfig.ts           # RSS源配置列表
├── newsService.ts         # 聚合服务（抓取→过滤→翻译→缓存）
├── translator.ts          # 【新增】英→中翻译模块
├── dateFilter.ts          # 【新增】时间过滤模块（>= 2026-02-28）
├── cache.ts               # 内存缓存
├── filter.ts              # 关键词过滤
└── constants.ts           # 常量定义
```

---

## 3. 实现步骤

### 步骤 1：安装依赖

```bash
npm install rss-parser @vitalets/google-translate-api
```

- `rss-parser`：Node.js 下最主流的 RSS/Atom 解析库
- `@vitalets/google-translate-api`：免费 Google Translate 封装，无需 API Key

### 步骤 2：RSS 源配置

`src/lib/rssConfig.ts`：

```typescript
export interface RssSource {
  id: string;
  name: string; // 展示用源名称
  url: string; // RSS Feed URL
  lang: "en" | "zh"; // 语言标识
  tier: 1 | 2 | 3; // 优先级梯队
}

export const RSS_SOURCES: RssSource[] = [
  // 第一梯队：Google News 自定义搜索
  {
    id: "google-en-1",
    name: "Google News",
    url: "https://news.google.com/rss/search?q=Iran+Israel+war+military&hl=en&gl=US&ceid=US:en",
    lang: "en",
    tier: 1,
  },
  {
    id: "google-en-2",
    name: "Google News",
    url: "https://news.google.com/rss/search?q=Middle+East+conflict+airstrike+missile&hl=en&gl=US&ceid=US:en",
    lang: "en",
    tier: 1,
  },
  {
    id: "google-zh-1",
    name: "Google News",
    url: "https://news.google.com/rss/search?q=伊朗+以色列+战争&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
    lang: "zh",
    tier: 1,
  },
  {
    id: "google-zh-2",
    name: "Google News",
    url: "https://news.google.com/rss/search?q=伊朗+以色列+军事+打击&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
    lang: "zh",
    tier: 1,
  },
  // 第二梯队：国际权威媒体
  {
    id: "bbc",
    name: "BBC News",
    url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",
    lang: "en",
    tier: 2,
  },
  {
    id: "aljazeera",
    name: "Al Jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    lang: "en",
    tier: 2,
  },
  {
    id: "npr",
    name: "NPR",
    url: "https://feeds.npr.org/1004/rss.xml",
    lang: "en",
    tier: 2,
  },
  {
    id: "dw",
    name: "DW News",
    url: "https://rss.dw.com/rdf/rss-en-world",
    lang: "en",
    tier: 2,
  },
  // 第三梯队：军事专业
  {
    id: "defensenews",
    name: "Defense News",
    url: "https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml",
    lang: "en",
    tier: 3,
  },
  {
    id: "militarytimes",
    name: "Military Times",
    url: "https://www.militarytimes.com/arc/outboundfeeds/rss/?outputType=xml",
    lang: "en",
    tier: 3,
  },
  {
    id: "breakingdefense",
    name: "Breaking Defense",
    url: "https://breakingdefense.com/feed/",
    lang: "en",
    tier: 3,
  },
];
```

### 步骤 3：RSS 抓取与解析

`src/lib/rssFetcher.ts`：

```typescript
import Parser from "rss-parser";
import { NewsItem } from "@/types/news";
import { RSS_SOURCES, RssSource } from "./rssConfig";

const parser = new Parser({
  timeout: 10000, // 10秒超时
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)",
  },
});

/**
 * 解析单个 RSS 源，返回标准化 NewsItem[]
 * 单源失败不影响其他源
 */
async function fetchSingleSource(source: RssSource): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(source.url);

    return (feed.items || []).map((item, idx) => {
      // Google News 的实际来源在 item.source 字段
      const actualSource =
        (item as Record<string, unknown>).source?.toString() || source.name;

      return {
        id: `${source.id}-${idx}-${new Date(item.pubDate || "").getTime()}`,
        title: item.title || "",
        description: item.contentSnippet || item.content || "",
        source: actualSource,
        sourceUrl: item.link || "",
        publishTime: item.pubDate
          ? new Date(item.pubDate).toISOString()
          : new Date().toISOString(),
        language: source.lang, // 保留原始语言标识，用于后续翻译判断
        imageUrl: undefined,
        keywords: [],
      };
    });
  } catch (error) {
    console.warn(`RSS fetch failed for ${source.id}:`, error);
    return [];
  }
}

/**
 * 并行抓取所有 RSS 源
 */
export async function fetchAllRSS(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    RSS_SOURCES.map((source) => fetchSingleSource(source))
  );

  const allNews: NewsItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allNews.push(...result.value);
    }
  }

  return allNews;
}
```

### 步骤 3.1：时间过滤模块

`src/lib/dateFilter.ts`（新增）：

```typescript
/**
 * 时间过滤：仅保留 2026-02-28 00:00:00 UTC 之后的新闻
 */
import { NewsItem } from "@/types/news";

const CUT_OFF_DATE = new Date("2026-02-28T00:00:00Z");

export function filterByDate(news: NewsItem[]): NewsItem[] {
  return news.filter((item) => {
    const pubTime = new Date(item.publishTime);
    return pubTime >= CUT_OFF_DATE;
  });
}
```

### 步骤 3.2：翻译模块

`src/lib/translator.ts`（新增）：

```typescript
/**
 * 英文→中文翻译模块
 * 使用 @vitalets/google-translate-api，免费、无需 API Key
 * 内置翻译缓存避免重复请求
 */
import translate from "@vitalets/google-translate-api";
import { NewsItem } from "@/types/news";

// 翻译结果缓存（key: 原文, value: 译文）
const translateCache = new Map<string, string>();

async function translateText(text: string): Promise<string> {
  if (!text || text.trim().length === 0) return text;

  const cached = translateCache.get(text);
  if (cached) return cached;

  try {
    const result = await translate(text, { to: "zh-CN" });
    translateCache.set(text, result.text);
    return result.text;
  } catch (error) {
    console.warn("Translation failed:", error);
    return text; // 翻译失败返回原文
  }
}

/**
 * 批量翻译英文新闻为中文
 * - 中文新闻原样保留
 * - 英文新闻翻译 title 和 description，原文保存到 originalTitle/originalDescription
 */
export async function translateNews(news: NewsItem[]): Promise<NewsItem[]> {
  const results: NewsItem[] = [];

  for (const item of news) {
    if (item.language === "zh") {
      results.push(item);
      continue;
    }

    // 英文源：翻译标题和摘要
    const [translatedTitle, translatedDesc] = await Promise.all([
      translateText(item.title),
      translateText(item.description),
    ]);

    results.push({
      ...item,
      originalTitle: item.title,
      originalDescription: item.description,
      title: translatedTitle,
      description: translatedDesc,
    });
  }

  return results;
}
```

### 步骤 4：修改聚合服务

`src/lib/newsService.ts`（修改后）：

```typescript
import { NewsItem } from "@/types/news";
import { fetchAllRSS } from "./rssFetcher";
import { filterRelevantNews, deduplicateNews } from "./filter";
import { filterByDate } from "./dateFilter";
import { translateNews } from "./translator";
import { cache } from "./cache";
import { CACHE_TTL } from "./constants";

const CACHE_KEY = "military_news";

export async function getLatestNews(): Promise<NewsItem[]> {
  // 1. 检查缓存
  const cached = cache.get<NewsItem[]>(CACHE_KEY);
  if (cached) return cached;

  // 2. 抓取所有 RSS 源
  const allNews = await fetchAllRSS();

  // 3. 时间过滤（仅保留 >= 2026-02-28 的新闻）
  let result = filterByDate(allNews);

  // 4. 关键词过滤 → 去重
  result = filterRelevantNews(result);
  result = deduplicateNews(result);

  // 5. 英文内容翻译为中文
  result = await translateNews(result);

  // 6. 按时间倒序排序
  result.sort(
    (a, b) =>
      new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime()
  );

  // 7. 写入缓存
  cache.set(CACHE_KEY, result, CACHE_TTL);

  return result;
}
```

### 步骤 5：修改常量文件

`src/lib/constants.ts`（修改后）：

```typescript
export const REFRESH_INTERVAL =
  Number(process.env.NEXT_PUBLIC_REFRESH_INTERVAL) || 10000;

export const CACHE_TTL = Number(process.env.CACHE_TTL) || 60;

// 移除所有 API Key 相关常量

export const KEYWORDS = {
  countries: [
    "伊朗",
    "Iran",
    "Tehran",
    "德黑兰",
    "以色列",
    "Israel",
    "Tel Aviv",
    "特拉维夫",
    "耶路撒冷",
    "美国",
    "USA",
    "United States",
    "美军",
    "Pentagon",
    "五角大楼",
    "巴林",
    "卡塔尔",
    "阿联酋",
    "沙特",
    "科威特",
    "伊拉克",
    "叙利亚",
    "黎巴嫩",
    "胡塞",
    "也门",
    "哈马斯",
    "真主党",
  ],
  military: [
    "导弹",
    "missile",
    "轰炸",
    "bombing",
    "空袭",
    "airstrike",
    "袭击",
    "attack",
    "防空",
    "拦截",
    "intercept",
    "打击",
    "strike",
    "爆炸",
    "explosion",
    "战争",
    "war",
    "军事",
    "military",
    "冲突",
    "conflict",
    "战斗",
    "combat",
    "无人机",
    "drone",
    "核设施",
    "nuclear",
    "舰队",
    "海军",
    "防御",
    "进攻",
    "弹道",
    "战机",
    "武装",
    "交火",
    "炮击",
    "战舰",
    "航母",
    "基地",
  ],
} as const;
```

### 步骤 6：清理废弃文件

```bash
# 删除原 API 客户端文件
rm src/lib/tianapi.ts
rm src/lib/newsapi.ts
```

### 步骤 7：更新环境变量

`.env.local`（简化后）：

```bash
# 缓存过期时间（秒）
CACHE_TTL=60

# 前端刷新间隔（毫秒）
NEXT_PUBLIC_REFRESH_INTERVAL=10000
```

不再需要任何 API Key。

### 步骤 8：API 路由保持不变

`src/app/api/news/route.ts` 无需修改，因为它只调用 `getLatestNews()`，底层已切换为 RSS。

### 步骤 9：前端组件保持不变

所有前端组件（`NewsTimeline`、`NewsItemCard`、`CountdownTimer`、`Header`、`page.tsx`）和 Hooks（`useNews`、`useCountdown`）无需修改，因为数据结构 `NewsItem` 未变。

---

## 4. 代码变更总结

| 文件                              | 操作     | 说明                                                         |
| --------------------------------- | -------- | ------------------------------------------------------------ |
| `src/lib/dateFilter.ts`           | **新增** | 时间过滤模块，仅保留 >= 2026-02-28 的新闻                    |
| `src/lib/translator.ts`           | **新增** | 英 → 中翻译模块，使用 `@vitalets/google-translate-api`       |
| `src/lib/rssFetcher.ts`           | **修改** | 为 NewsItem 增加 `language` 字段                             |
| `src/lib/newsService.ts`          | **修改** | 在处理链中加入时间过滤和翻译步骤                             |
| `src/types/news.ts`               | **修改** | 增加 `originalTitle`、`originalDescription`、`language` 字段 |
| `src/components/NewsItemCard.tsx` | **修改** | 适配新字段，显示中文内容                                     |
| `package.json`                    | **修改** | 新增 `@vitalets/google-translate-api` 依赖                   |

---

## 5. 部署方案

### 5.1 Vercel 部署

```bash
git add .
git commit -m "refactor: switch to free RSS sources"
git push
# Vercel 自动部署
```

### 5.2 环境变量（简化）

| 变量名                         | 必须 | 说明                         |
| ------------------------------ | ---- | ---------------------------- |
| `CACHE_TTL`                    | 否   | 缓存过期秒数，默认 60        |
| `NEXT_PUBLIC_REFRESH_INTERVAL` | 否   | 前端刷新间隔毫秒，默认 10000 |

不再需要配置任何 API Key。

---

## 6. 风险与应对

| 风险                       | 影响             | 应对措施                                       |
| -------------------------- | ---------------- | ---------------------------------------------- |
| 单个 RSS 源不可用          | 该源数据缺失     | `Promise.allSettled` 确保单源失败不影响整体    |
| RSS 源被封禁/限流          | 抓取失败         | 设 `User-Agent` 头、10 秒超时、多源互备        |
| Google News RSS 返回重定向 | 链接不直接       | Google News item.link 已指向原文               |
| 翻译 API 被限流            | 英文内容无法翻译 | 翻译缓存 + 失败时回退显示原文                  |
| 翻译延迟导致响应变慢       | 首次请求耗时增加 | 翻译结果随缓存一起缓存 60 秒，后续请求直接命中 |
| RSS XML 格式异常           | 解析失败         | `rss-parser` 内置容错，`try-catch` 兜底        |
| Vercel 冷启动延迟          | 首次请求慢       | 多源并行 + 缓存复用                            |
