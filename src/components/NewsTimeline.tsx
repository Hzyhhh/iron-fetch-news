"use client";

import { TimelineGroup } from "@/types/news";
import NewsItemCard from "./NewsItemCard";

export default function NewsTimeline({
  groups,
}: {
  groups: TimelineGroup[];
}) {
  if (groups.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">暂无相关军事新闻</p>
        <p className="text-gray-300 text-sm mt-2">
          请确认 API 密钥已正确配置
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.date}>
          {/* 日期标题 */}
          <div className="sticky top-[61px] z-[5] bg-white/95 backdrop-blur-sm py-2">
            <h2 className="text-base font-bold text-gray-800 border-l-4 border-red-500 pl-3">
              {group.label}
            </h2>
          </div>

          {/* 新闻列表 */}
          <div className="ml-1 border-l-2 border-gray-100 pl-3 mt-2">
            {group.items.map((item) => (
              <NewsItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
