import React from "react";
import { ScreenId, CouponItem } from "../../types";
import { Gift, ArrowRight, CheckCircle2, Ticket, Sparkles } from "lucide-react";

interface BenefitsScreenProps {
  coupons: CouponItem[];
  userPoints: number;
  onNavigate: (screen: ScreenId) => void;
  onSelectCoupon: (coupon: CouponItem) => void;
}

export const BenefitsScreen: React.FC<BenefitsScreenProps> = ({
  coupons,
  userPoints,
  onNavigate,
  onSelectCoupon
}) => {
  return (
    <div className="px-5 py-5 pb-24 animate-in fade-in duration-300">
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#eaf5ed] text-[#176b48] text-[11px] font-bold mb-1.5">
          <Sparkles className="w-3 h-3" />
          SPORTS PERKS
        </div>
        <h1 className="text-2xl font-black text-[#202c24] tracking-tight">
          스포츠 혜택 🎁
        </h1>
        <p className="text-xs text-[#7a857d] mt-1 leading-relaxed">
          일상과 경기장에서 모은 GREEN POINT로 다양한 프로 스포츠 혜택을 누려보세요.
        </p>
      </div>

      {/* User points banner */}
      <div className="p-3.5 rounded-2xl bg-[#eaf5ed] border border-[#d2e7d7] flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] text-[#4b6051]">현재 사용 가능한 포인트</span>
          <div className="text-lg font-black text-[#176b48]">
            {userPoints.toLocaleString()} P
          </div>
        </div>
        <button
          onClick={() => onNavigate("coupon")}
          className="px-3 py-1.5 rounded-xl bg-[#176b48] text-white text-xs font-bold hover:bg-[#12583a] transition-colors"
        >
          내 쿠폰함 확인
        </button>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {coupons.map((coupon) => {
          const canAfford = userPoints >= coupon.requiredPoints;
          const categoryIcon =
            coupon.category === "ticket"
              ? "🎟️"
              : coupon.category === "goods"
              ? "🛍️"
              : coupon.category === "food"
              ? "🥤"
              : "🌱";

          return (
            <div
              key={coupon.id}
              className="p-4 rounded-2xl bg-white border border-[#e5ebe2] shadow-xs flex flex-col justify-between gap-3 hover:border-[#176b48]/50 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#f0f6ec] flex items-center justify-center text-2xl">
                    {categoryIcon}
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-full ${
                      canAfford
                        ? "bg-[#176b48] text-white"
                        : "bg-[#e8eee6] text-[#6d7970]"
                    }`}
                  >
                    {coupon.requiredPoints.toLocaleString()} P
                  </span>
                </div>

                <h3 className="text-sm font-extrabold text-[#202c24] leading-snug">
                  {coupon.title}
                </h3>
                <p className="text-[11px] text-[#7a857d] mt-1 leading-snug">
                  {coupon.subtitle}
                </p>
                <p className="text-[11px] text-[#4c5c50] mt-2 bg-[#f6faf5] p-2 rounded-lg border border-[#e8f1e6]">
                  {coupon.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#f0f4ee] flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#176b48]">
                  {coupon.discountText}
                </span>
                <button
                  onClick={() => onSelectCoupon(coupon)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    canAfford
                      ? "bg-[#176b48] text-white hover:bg-[#12583a] shadow-xs"
                      : "bg-[#eaf5ed] text-[#176b48] hover:bg-[#d8eedf]"
                  }`}
                >
                  <span>{canAfford ? "교환하기" : "상세보기"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3.5 rounded-2xl bg-[#fff7df] border border-[#f5e6b7] text-[#866a22] text-xs leading-relaxed">
        ※ 위 혜택은 친환경 스포츠 실천 활성화를 위한 리워드 예시이며, 지속 가능한 스포츠 문화를 응원하는 공식 파트너십 구단과 함께합니다.
      </div>
    </div>
  );
};
