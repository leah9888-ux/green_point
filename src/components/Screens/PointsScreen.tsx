import React, { useState } from "react";
import { ScreenId, Transaction } from "../../types";
import { ArrowUpRight, ArrowDownLeft, Gift, Sparkles, Filter } from "lucide-react";

interface PointsScreenProps {
  points: number;
  history: Transaction[];
  onNavigate: (screen: ScreenId) => void;
}

export const PointsScreen: React.FC<PointsScreenProps> = ({
  points,
  history,
  onNavigate
}) => {
  const [filter, setFilter] = useState<"all" | "plus" | "minus">("all");

  const targetPoints = 10000;
  const progressPercent = Math.min(100, Math.round((points / targetPoints) * 100));
  const remaining = Math.max(0, targetPoints - points);

  const filteredHistory = history.filter((item) => {
    if (filter === "plus") return item.points > 0;
    if (filter === "minus") return item.points < 0;
    return true;
  });

  return (
    <div className="px-5 py-5 pb-24 animate-in fade-in duration-300 flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-black text-[#202c24] tracking-tight">
          나의 포인트
        </h1>
        <p className="text-xs text-[#7a857d] mt-1 leading-relaxed">
          작은 실천이 쌓여 더 큰 스포츠 혜택이 됩니다.
        </p>
      </div>

      {/* Main Points Card */}
      <div className="rounded-[22px] bg-[#e5f2dc] p-5 border border-[#d2e5c6] shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs text-[#526456] font-medium">
            보유 GREEN POINT
          </span>
          <div className="text-3xl font-black text-[#176b48] tracking-tight mt-1">
            {points.toLocaleString()} <span className="text-xl font-bold">P</span>
          </div>
          <span className="inline-block mt-2 text-[11px] font-bold text-[#176b48] bg-white/70 px-2 py-0.5 rounded-full">
            10,000P부터 쿠폰 교환 가능
          </span>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-white/80 flex items-center justify-center text-3xl shadow-xs">
          🌳
        </div>
      </div>

      {/* Progress to Next Coupon */}
      <div className="rounded-[22px] bg-white p-4.5 border border-[#e5ebe2] shadow-xs">
        <div className="flex items-center justify-between text-xs mb-2">
          <strong className="text-[#202c24]">10,000P 굿즈 할인 쿠폰까지</strong>
          <strong className="text-[#176b48] text-sm">
            {remaining === 0 ? "교환 가능! 🎉" : `${remaining.toLocaleString()}P 남음`}
          </strong>
        </div>

        <div className="w-full h-2.5 rounded-full bg-[#e8eee6] overflow-hidden mb-2.5">
          <div
            className="h-full bg-[#176b48] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="text-[11px] text-[#7a857d] leading-normal mb-3">
          10,000P를 모으면 스포츠 구단 굿즈샵 10,000원 즉시 할인권으로 교환할 수 있어요.
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => onNavigate("coupon")}
            className="flex-1 py-3 px-4 rounded-xl bg-[#176b48] text-white text-xs font-bold hover:bg-[#12583a] transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>쿠폰 교환하기</span>
          </button>
          <button
            onClick={() => onNavigate("missions")}
            className="py-3 px-4 rounded-xl bg-[#eaf5ed] text-[#176b48] text-xs font-bold hover:bg-[#d9ede0] transition-colors"
          >
            포인트 더 모으기
          </button>
        </div>
      </div>

      {/* Point History Section */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-[#202c24]">
            포인트 적립·사용 내역
          </h2>

          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                filter === "all"
                  ? "bg-[#176b48] text-white"
                  : "bg-white text-[#7a857d] border border-[#e2e7df]"
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter("plus")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                filter === "plus"
                  ? "bg-[#176b48] text-white"
                  : "bg-white text-[#7a857d] border border-[#e2e7df]"
              }`}
            >
              적립(+)
            </button>
            <button
              onClick={() => setFilter("minus")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                filter === "minus"
                  ? "bg-[#176b48] text-white"
                  : "bg-white text-[#7a857d] border border-[#e2e7df]"
              }`}
            >
              사용(-)
            </button>
          </div>
        </div>

        <div className="rounded-[22px] bg-white p-4 border border-[#e5ebe2] shadow-xs">
          {filteredHistory.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#7a857d]">
              적립 또는 사용 내역이 없습니다.
              <br />
              친환경 미션을 실천하고 포인트를 쌓아보세요!
            </div>
          ) : (
            <div className="divide-y divide-[#eff1ed]">
              {filteredHistory.map((item) => {
                const isEarned = item.points > 0;
                return (
                  <div key={item.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isEarned
                            ? "bg-[#eaf5ed] text-[#176b48]"
                            : "bg-[#fdf0f0] text-[#c93b3b]"
                        }`}
                      >
                        {isEarned ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-[#202c24] block">
                          {item.title}
                        </strong>
                        <span className="text-[10px] text-[#7a857d]">
                          {item.date}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`text-sm font-black ${
                        isEarned ? "text-[#176b48]" : "text-[#202c24]"
                      }`}
                    >
                      {isEarned ? `+${item.points.toLocaleString()}` : item.points.toLocaleString()} P
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
