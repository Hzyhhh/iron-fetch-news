import { NewsItem } from "@/types/news";
import { KEYWORDS } from "./constants";

export function filterRelevantNews(newsList: NewsItem[]): NewsItem[] {
  return newsList
    .map((item) => {
      const text = `${item.title} ${item.description}`.toLowerCase();
      const matchedKeywords: string[] = [];

      let hasCountry = false;
      let hasMilitary = false;

      for (const kw of KEYWORDS.countries) {
        if (text.includes(kw.toLowerCase())) {
          hasCountry = true;
          matchedKeywords.push(kw);
        }
      }

      for (const kw of KEYWORDS.military) {
        if (text.includes(kw.toLowerCase())) {
          hasMilitary = true;
          matchedKeywords.push(kw);
        }
      }

      if (hasCountry && hasMilitary) {
        return { ...item, keywords: matchedKeywords };
      }
      return null;
    })
    .filter((item): item is NewsItem => item !== null);
}

export function deduplicateNews(newsList: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return newsList.filter((item) => {
    const key = item.title.substring(0, 20);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
