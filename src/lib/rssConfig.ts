export interface RssSource {
  id: string;
  name: string;
  url: string;
  lang: "en" | "zh";
  tier: 1 | 2 | 3;
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
    url: "https://news.google.com/rss/search?q=%E4%BC%8A%E6%9C%97+%E4%BB%A5%E8%89%B2%E5%88%97+%E6%88%98%E4%BA%89&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
    lang: "zh",
    tier: 1,
  },
  {
    id: "google-zh-2",
    name: "Google News",
    url: "https://news.google.com/rss/search?q=%E4%BC%8A%E6%9C%97+%E4%BB%A5%E8%89%B2%E5%88%97+%E5%86%9B%E4%BA%8B+%E6%89%93%E5%87%BB&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
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
