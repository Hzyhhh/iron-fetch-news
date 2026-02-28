import { NewsItem } from "@/types/news";

const CUT_OFF_DATE = new Date("2026-02-28T00:00:00Z");

export function filterByDate(news: NewsItem[]): NewsItem[] {
  return news.filter((item) => {
    const pubTime = new Date(item.publishTime);
    return pubTime >= CUT_OFF_DATE;
  });
}
