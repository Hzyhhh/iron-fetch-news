"use client";

export default function CountdownTimer({
  seconds,
  onManualRefresh,
}: {
  seconds: number;
  onManualRefresh: () => void;
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 text-sm shrink-0">
      {/* 状态指示 */}
      <div className="flex items-center gap-1.5 text-gray-500 whitespace-nowrap">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="tabular-nums">{seconds}s 后刷新</span>
      </div>

      {/* 手动刷新按钮 */}
      <button
        onClick={onManualRefresh}
        className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 transition-colors text-xs font-medium cursor-pointer whitespace-nowrap"
      >
        立即刷新
      </button>
    </div>
  );
}
