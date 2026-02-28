"use client";

import { useNews } from "@/hooks/useNews";
import { useCountdown } from "@/hooks/useCountdown";
import NewsTimeline from "@/components/NewsTimeline";
import Header from "@/components/Header";

const REFRESH_INTERVAL =
  Number(process.env.NEXT_PUBLIC_REFRESH_INTERVAL) || 10000;

export default function Home() {
  const { timeline, news, isLoading, mutate } = useNews(REFRESH_INTERVAL);
  const { countdown, reset } = useCountdown(REFRESH_INTERVAL);

  const handleManualRefresh = () => {
    mutate();
    reset();
  };

  return (
    <main className="min-h-screen bg-white">
      <Header
        countdown={countdown}
        onManualRefresh={handleManualRefresh}
        isLoading={isLoading}
        total={news.length}
      />

      <div className="max-w-3xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-red-500 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">正在获取最新战况...</p>
          </div>
        ) : (
          <NewsTimeline groups={timeline} />
        )}
      </div>
    </main>
  );
}
