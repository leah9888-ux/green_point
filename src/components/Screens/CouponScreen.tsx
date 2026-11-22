import React, { useState } from "react";
import { ScreenId, CouponItem } from "../../types";
import { QrCode, Copy, Check, Sparkles, Gift, Clock, AlertTriangle } from "lucide-react";
import confetti from "canvas-confetti";

interface CouponScreenProps {
  userPoints: number;
  availableCoupons: CouponItem[];
  myCoupons: CouponItem[];
  onExchange: (coupon: CouponItem) => boolean;
  onUseCoupon: (couponId: string) => void;
  onNavigate: (screen: ScreenId) => void;
  selectedCoupon?: CouponItem | null;
}

export const CouponScreen: React.FC<CouponScreenProps> = ({
  userPoints,
  availableCoupons,
  myCoupons,
  onExchange,
  onUseCoupon,
  onNavigate,
  selectedCoupon: initialSelectedCoupon
}) => {
  const [activeTab, setActiveTab] = useState<"exchange" | "wallet">(
    myCoupons.length > 0 && !initialSelectedCoupon ? "wallet" : "exchange"
  );
  const [selectedTarget, setSelectedTarget] = useState<CouponItem>(
    initialSelectedCoupon || availableCoupons[0]
  );
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleExchangeClick = () => {
    if (userPoints < selectedTarget.requiredPoints) {
      alert(
        `포인트가 부족합니다.\n현재 보유 포인트: ${userPoints.toLocaleString()}P\n필요 포인트: ${selectedTarget.requiredPoints.toLocaleString()}P`
      );
      return;
    }

    const success = onExchange(selectedTarget);
    if (success) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#176b48", "#c8ed83", "#ffd700"]
      });
      setActiveTab("wallet");
    }
  };

  // Helper to generate realistic visual QR matrix
  const renderQRMatrix = (seed: string) => {
    const size = 9;
    const cells = [];
    for (let i = 0; i < size * size; i++) {
      const x = i % size;
      const y = Math.floor(i / size);
      const isFinder =
        (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);
      const isFinderBorder = x === 0 || x === 2 || y === 0 || y === 2;
      const isFinderCenter = x === 1 && y === 1;

      let isOn = false;
      if (isFinder) {
        isOn = isFinderBorder || isFinderCenter;
      } else {
        const hash = (i * 7 + x * y + seed.charCodeAt(x % seed.length)) % 3;
        isOn = hash !== 0;
      }

      cells.push(
        <span
          key={i}
          className={`block w-full h-full rounded-[1px] transition-colors ${
            isOn ? "bg-[#173b29]" : "bg-white"
          }`}
        />
      );
    }
    return cells;
  };

  return (
    <div className="px-5 py-5 pb-24 animate-in fade-in duration-300">
      <div className="mb-4">
        <h1 className="text-2xl font-black text-[#202c24] tracking-tight">
          쿠폰함 & 교환소 🎟️
        </h1>
        <p className="text-xs text-[#7a857d] mt-1 leading-relaxed">
          모은 포인트로 스포츠 혜택 쿠폰을 발급받고 경기장과 스토어에서 사용하세요.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#e8eee5] p-1 rounded-2xl mb-4">
        <button
          onClick={() => setActiveTab("exchange")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "exchange"
              ? "bg-white text-[#176b48] shadow-xs"
              : "text-[#627266] hover:text-[#202c24]"
          }`}
        >
          포인트로 쿠폰 교환
        </button>
        <button
          onClick={() => setActiveTab("wallet")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === "wallet"
              ? "bg-white text-[#176b48] shadow-xs"
              : "text-[#627266] hover:text-[#202c24]"
          }`}
        >
          <span>내 보유 쿠폰</span>
          {myCoupons.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-[#176b48] text-white text-[10px]">
              {myCoupons.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "exchange" ? (
        <div className="flex flex-col gap-4">
          {/* Coupon Selector Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {availableCoupons.map((coupon) => (
              <button
                key={coupon.id}
                onClick={() => setSelectedTarget(coupon)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedTarget.id === coupon.id
                    ? "bg-[#176b48] text-white border-[#176b48]"
                    : "bg-white text-[#4d5d51] border-[#dce3da]"
                }`}
              >
                {coupon.title.split(" ")[0]} ({coupon.requiredPoints.toLocaleString()}P)
              </button>
            ))}
          </div>

          {/* Featured Exchange Coupon Card */}
          <div className="bg-[#e8f3e3] border-2 border-dashed border-[#a5c49c] rounded-[24px] p-5 text-center shadow-xs">
            <div className="text-4xl mb-2">🎟️</div>
            <h2 className="text-lg font-black text-[#202c24] mb-1">
              {selectedTarget.title}
            </h2>
            <p className="text-xs text-[#617366] mb-2">{selectedTarget.subtitle}</p>

            <div className="text-2xl font-black text-[#176b48] my-2">
              {selectedTarget.requiredPoints.toLocaleString()} P
            </div>

            {/* QR Visual */}
            <div className="w-[124px] h-[124px] bg-white p-2.5 mx-auto my-3 rounded-xl grid grid-cols-9 grid-rows-9 gap-[2px] shadow-xs border border-[#cfddcb]">
              {renderQRMatrix(selectedTarget.id)}
            </div>

            <p className="text-[11px] text-[#7a857d] mb-3">
              교환 시 발급되는 QR 코드를 경기장 및 굿즈샵에 제시하세요.
            </p>

            <div className="text-xs tracking-widest text-[#176b48] font-mono font-bold border border-dashed border-[#7eaa84] bg-white/70 rounded-xl p-2.5 mb-4">
              {selectedTarget.code}
            </div>

            <button
              onClick={handleExchangeClick}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                userPoints >= selectedTarget.requiredPoints
                  ? "bg-[#176b48] text-white hover:bg-[#12583a]"
                  : "bg-[#d8e2d6] text-[#7c8b7f]"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {userPoints >= selectedTarget.requiredPoints
                  ? `${selectedTarget.requiredPoints.toLocaleString()}P로 교환하기`
                  : `${(selectedTarget.requiredPoints - userPoints).toLocaleString()}P 부족합니다`}
              </span>
            </button>
          </div>

          <div className="rounded-2xl bg-[#fff7df] p-3 text-xs text-[#866a22] leading-relaxed border border-[#f6e5b4]">
            💡 보유 포인트: <strong>{userPoints.toLocaleString()}P</strong> · 친환경 미션을 완료하여 포인트를 모을 수 있습니다.
          </div>
        </div>
      ) : (
        /* Wallet Tab: My coupons */
        <div className="flex flex-col gap-3">
          {myCoupons.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white border border-[#e5ebe2] shadow-xs">
              <div className="text-4xl mb-2">🏷️</div>
              <p className="text-sm font-bold text-[#202c24]">보유 중인 쿠폰이 없습니다.</p>
              <p className="text-xs text-[#7a857d] mt-1 mb-4">
                모아둔 GREEN POINT로 스포츠 혜택 쿠폰을 교환해보세요!
              </p>
              <button
                onClick={() => setActiveTab("exchange")}
                className="px-4 py-2.5 rounded-xl bg-[#176b48] text-white text-xs font-bold hover:bg-[#12583a] transition-all"
              >
                쿠폰 교환하러 가기
              </button>
            </div>
          ) : (
            myCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`p-4.5 rounded-[22px] border transition-all ${
                  coupon.used
                    ? "bg-[#f2f4f1] border-[#d8dfd6] opacity-70"
                    : "bg-white border-[#d2e4d0] shadow-xs"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#eaf5ed] text-[#176b48]">
                        {coupon.discountText}
                      </span>
                      {coupon.used ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#e4e7e3] text-[#717b73]">
                          사용 완료
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#e3f4e8] text-[#1f754b] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          사용 가능
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-[#202c24]">
                      {coupon.title}
                    </h3>
                    <p className="text-xs text-[#7a857d] mt-0.5">
                      유효기간: {coupon.expiresAt}까지
                    </p>
                  </div>

                  {/* QR Box */}
                  <div className="w-16 h-16 bg-white p-1 rounded-lg grid grid-cols-9 grid-rows-9 gap-[1px] border border-[#d6dfd4] shrink-0">
                    {renderQRMatrix(coupon.code)}
                  </div>
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-[#f6faf5] border border-[#e5efe3] flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#176b48]">{coupon.code}</span>
                  <button
                    onClick={() => handleCopy(coupon.code)}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#445b4c] hover:text-[#176b48]"
                  >
                    {copiedCode === coupon.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">복사됨!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>코드 복사</span>
                      </>
                    )}
                  </button>
                </div>

                {!coupon.used ? (
                  <button
                    onClick={() => onUseCoupon(coupon.id)}
                    className="w-full mt-3 py-2.5 rounded-xl bg-[#176b48] hover:bg-[#12583a] text-white text-xs font-bold transition-all shadow-xs"
                  >
                    경기장/매장 현장 사용 완료 처리
                  </button>
                ) : (
                  <p className="text-center text-[11px] text-[#7a857d] mt-2.5">
                    ✓ {coupon.usedAt || "사용 완료된 쿠폰입니다."}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
