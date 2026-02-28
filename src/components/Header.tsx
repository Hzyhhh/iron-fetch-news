"use client";

import CountdownTimer from "./CountdownTimer";

export default function Header({
  countdown,
  onManualRefresh,
  isLoading,
  total,
}: {
  countdown: number;
  onManualRefresh: () => void;
  isLoading: boolean;
  total: number;
}) {
  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* 左侧标题 */}
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 whitespace-nowrap">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
            实时战况
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">
            伊朗 · 以色列 · 美国 军事动态
            {!isLoading && (
              <span className="ml-2">共 {total} 条</span>
            )}
          </p>
        </div>

        {/* 右侧倒计时 */}
        <CountdownTimer
          seconds={countdown}
          onManualRefresh={onManualRefresh}
        />
      </div>
    </header>
  );
}
