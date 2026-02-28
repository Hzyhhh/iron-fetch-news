import { NextResponse } from "next/server";
import { getLatestNews } from "@/lib/newsService";
import { NewsApiResponse } from "@/types/news";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const news = await getLatestNews();

    const response: NewsApiResponse = {
      success: true,
      data: news,
      total: news.length,
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return NextResponse.json(
      {
        success: false,
        data: [],
        total: 0,
        fetchedAt: new Date().toISOString(),
      } satisfies NewsApiResponse,
      { status: 500 }
    );
  }
}
