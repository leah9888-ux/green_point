
import React from "react";
import { ScreenId } from "../../types";
import { Sparkles, ArrowRight } from "lucide-react";

interface WelcomeScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onQuickStart: () => void;
  onGoogleSignIn: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onNavigate,
  onQuickStart
}) => {
  return (
    <div className="px-5 py-6 flex flex-col items-center text-center animate-in fade-in duration-300">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eaf5ed] text-[#176b48] text-xs font-bold mb-4 tracking-wide shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-[#176b48]" />
        GREEN FAN, GREEN LIFE
      </div>

      {/* Earth & Leaf SVG illustration */}
      <div className="relative my-3 w-56 h-56 max-w-full flex items-center justify-center">
        <svg
          viewBox="0 0 250 250"
          className="w-full h-full drop-shadow-md select-none"
          role="img"
          aria-label="지구와 잎사귀 일러스트"
        >
          <circle cx="125" cy="125" r="105" fill="#E4F1D9" />
          <circle cx="125" cy="125" r="75" fill="#8CCB8A" />
          <path d="M60 105Q90 74 112 101L100 123L76 126Z" fill="#3F9364" />
          <path d="M145 62Q181 76 188 105L160 118L142 95Z" fill="#3F9364" />
          <path
            d="M128 143Q159 131 175 153L161 182L134 188L117 166Z"
            fill="#3F9364"
          />
          <path d="M73 150Q92 137 110 151L102 180L83 176Z" fill="#3F9364" />
          <path
            d="M98 90Q124 76 151 92Q167 109 151 131Q131 148 106 130Q88 113 98 90Z"
            fill="#C8ED83"
          />
          <path
            d="M111 122Q122 100 144 95"
            fill="none"
            stroke="#3F9364"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="M38 70Q46 40 76 45Q77 72 48 78Z" fill="#176B48" />
          <path d="M205 162Q230 151 235 179Q217 197 198 181Z" fill="#176B48" />
          <circle cx="62" cy="180" r="8" fill="#C8ED83" />
          <circle cx="195" cy="65" r="6" fill="#C8ED83" />
          <path
            d="M85 215Q125 232 167 210"
            stroke="#176B48"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      <h1 className="text-[28px] font-extrabold leading-[1.35] tracking-tight text-[#202c24] mt-2 mb-3">
        작은 실천이
        <br />
        <span className="text-[#176b48]">스포츠의 혜택</span>이 되다
      </h1>

      <p className="text-sm text-[#7a857d] leading-relaxed mb-5">
        일상 속 친환경 행동을 인증하고 포인트를 모아
        <br />
        경기 티켓과 굿즈 할인 등 특별한 리워드를 누려보세요.
      </p>

      <div className="w-full flex flex-col gap-2.5">
        <button
          onClick={() => onNavigate("login")}
          className="w-full py-3.5 px-5 rounded-2xl bg-[#176b48] text-white font-bold text-sm shadow-sm hover:bg-[#12583a] transition-all flex items-center justify-center gap-2"
        >
          <span>이메일로 시작하기</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onQuickStart}
          className="w-full py-2.5 px-5 rounded-2xl bg-[#eaf5ed] text-[#176b48] font-medium text-xs hover:bg-[#d8eedd] transition-all"
        >
          🌱 체험 계정(GREEN FAN)으로 둘러보기
        </button>
      </div>

      <div className="mt-6 flex items-center justify-center gap-3 text-xs text-[#7a857d]">
        <span>⚽ K리그/KBO 제휴</span>
        <span>•</span>
        <span>🥤 다회용기 혜택</span>
        <span>•</span>
        <span>🌳 탄소 저감 리워드</span>
      </div>

      <p className="mt-4 text-[11px] text-[#93a096]">
        GREEN POINT와 함께 만드는 지속 가능한 친환경 스포츠 문화
      </p>
    </div>
  );
};
