import Parser from "rss-parser";
import { NewsItem } from "@/types/news";
import { RSS_SOURCES, RssSource } from "./rssConfig";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)",
  },
});

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
        language: source.lang,
        imageUrl: undefined,
        keywords: [],
      };
    });
  } catch (error) {
    console.warn(`RSS fetch failed for ${source.id}:`, error);
    return [];
  }
}

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
