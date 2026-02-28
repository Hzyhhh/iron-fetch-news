import { translate } from "@vitalets/google-translate-api";
import { NewsItem } from "@/types/news";

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
    return text;
  }
}

export async function translateNews(news: NewsItem[]): Promise<NewsItem[]> {
  const results: NewsItem[] = [];

  for (const item of news) {
    if (item.language === "zh") {
      results.push(item);
      continue;
    }

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
