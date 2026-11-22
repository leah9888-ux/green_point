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
  onQuickStart,
  onGoogleSignIn
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
          onClick={onGoogleSignIn}
          className="w-full py-3.5 px-5 rounded-2xl bg-white border border-[#d2dcd0] text-[#202c24] font-bold text-sm shadow-xs hover:bg-[#f6faf4] transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google 계정으로 계속하기</span>
        </button>

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
