"use client";

import { NewsItem } from "@/types/news";
import { format } from "date-fns";

export default function NewsItemCard({ item }: { item: NewsItem }) {
  const time = format(new Date(item.publishTime), "HH:mm");

  return (
    <div className="group flex gap-4 py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors">
      {/* 时间 */}
      <span className="shrink-0 text-red-600 font-mono font-bold text-base pt-0.5">
        {time}
      </span>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 leading-relaxed text-[15px]">
          {item.title}
          {item.description &&
            item.description !== item.title &&
            item.description.length > 0 && (
              <span className="text-gray-500">。{item.description}</span>
            )}
        </p>

        {/* 来源 + 关键词 */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors whitespace-nowrap shrink-0"
          >
            <span className="text-gray-400">来源：</span>
            <span>{item.source}</span>
            <svg
              className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
          {item.keywords.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {item.keywords.slice(0, 3).map((kw) => (
                <span
                  key={kw}
                  className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-xs whitespace-nowrap"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
