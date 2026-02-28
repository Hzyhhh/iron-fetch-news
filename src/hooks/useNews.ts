import useSWR from "swr";
import { NewsApiResponse, NewsItem, TimelineGroup } from "@/types/news";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function groupByDate(news: NewsItem[]): TimelineGroup[] {
  const map = new Map<string, NewsItem[]>();

  for (const item of news) {
    const date = format(new Date(item.publishTime), "yyyy-MM-dd");
    if (!map.has(date)) map.set(date, []);
    map.get(date)!.push(item);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      date,
      label: format(new Date(date + "T00:00:00"), "yyyy年M月d日", {
        locale: zhCN,
      }),
      items,
    }));
}

export function useNews(refreshInterval: number) {
  const { data, error, isLoading, mutate } = useSWR<NewsApiResponse>(
    "/api/news",
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const news = data?.data || [];
  const timeline: TimelineGroup[] = groupByDate(news);

  return {
    timeline,
    news,
    error,
    isLoading,
    mutate,
    fetchedAt: data?.fetchedAt,
  };
}
