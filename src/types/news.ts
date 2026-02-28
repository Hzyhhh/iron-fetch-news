export interface NewsItem {
  id: string;
  title: string;
  description: string;
  originalTitle?: string;
  originalDescription?: string;
  language: "zh" | "en";
  source: string;
  sourceUrl: string;
  publishTime: string;
  imageUrl?: string;
  keywords: string[];
}

export interface NewsApiResponse {
  success: boolean;
  data: NewsItem[];
  total: number;
  fetchedAt: string;
}

export interface TimelineGroup {
  date: string;
  label: string;
  items: NewsItem[];
}
