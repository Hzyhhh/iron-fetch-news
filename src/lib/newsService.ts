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
