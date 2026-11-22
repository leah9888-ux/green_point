import React from "react";
import { ScreenId, Mission, UserProfile } from "../../types";
import { ChevronRight, ArrowUpRight, Sparkles, Trophy, ShoppingBag, Ticket, Leaf } from "lucide-react";

interface HomeScreenProps {
  user: UserProfile;
  missions: Mission[];
  onNavigate: (screen: ScreenId) => void;
  onStartMission: (missionId: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  missions,
  onNavigate,
  onStartMission
}) => {
  const targetPoints = 10000;
  const progressPercent = Math.min(100, Math.round((user.points / targetPoints) * 100));
  const remaining = Math.max(0, targetPoints - user.points);

  return (
    <div className="px-5 py-4 pb-20 animate-in fade-in duration-300 flex flex-col gap-5">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[#7a857d] font-medium flex items-center gap-1.5">
            <span>오늘도 지구를 위한 한 걸음</span>
            <span>🌎</span>
          </p>
          <h2 className="text-xl font-extrabold text-[#202c24] mt-0.5 tracking-tight">
            반가워요, <span className="text-[#176b48]">{user.name}</span>님!
          </h2>
        </div>
        <button
          onClick={() => onNavigate("profile")}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eaf5ed] text-[#176b48] text-xs font-bold hover:bg-[#d6ecd9] transition-colors"
        >
          <Leaf className="w-3.5 h-3.5" />
          <span>{user.level}</span>
        </button>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-[26px] bg-[#176b48] text-white p-5 shadow-md min-h-[195px] flex flex-col justify-between">
        <div className="relative z-10">
          <span className="inline-block px-2.5 py-1 rounded-full bg-white/20 text-[#c8ed83] text-[11px] font-bold mb-2.5 backdrop-blur-xs">
            GREEN ACTION, GREEN REWARD
          </span>
          <h1 className="text-[22px] font-black leading-snug tracking-tight">
            오늘의 작은 실천,
            <br />
            스포츠의 즐거움으로!
          </h1>
          <p className="text-xs text-white/85 mt-1.5 leading-relaxed">
            친환경 미션을 완료하고 다양한 스포츠 혜택을 만나보세요.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 mt-3">
          <button
            onClick={() => onNavigate("missions")}
            className="px-3.5 py-2 rounded-xl bg-[#c8ed83] text-[#176b48] font-bold text-xs hover:bg-[#bce672] transition-colors flex items-center gap-1 shadow-xs"
          >
            <span>미션 바로가기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate("sports")}
            className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium text-xs backdrop-blur-xs transition-colors"
          >
            친환경 직관 경기
          </button>
        </div>

        {/* Hero SVG art */}
        <svg
          className="absolute -right-4 -bottom-4 w-36 h-36 opacity-90 pointer-events-none select-none"
          viewBox="0 0 180 180"
          aria-hidden="true"
        >
          <circle cx="90" cy="90" r="75" fill="#C8ED83" />
          <path d="M28 67Q50 42 76 59L69 81L45 91Z" fill="#64AA71" />
          <path d="M102 26Q145 32 158 66L128 83L105 60Z" fill="#64AA71" />
          <path
            d="M100 103Q128 89 151 116L137 145L104 150L88 127Z"
            fill="#64AA71"
          />
          <path d="M46 112Q62 95 79 111L73 137L51 135Z" fill="#64AA71" />
          <path
            d="M73 76Q96 57 118 75Q134 92 118 111Q97 128 79 110Q62 94 73 76Z"
            fill="#176B48"
          />
          <path
            d="M83 104Q95 87 114 79"
            fill="none"
            stroke="#C8ED83"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Points Card */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-extrabold text-[#202c24] tracking-tight">
            나의 포인트
          </h2>
          <button
            onClick={() => onNavigate("points")}
            className="text-xs font-bold text-[#176b48] hover:underline flex items-center gap-0.5"
          >
            <span>내역 보기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="rounded-[22px] bg-[#e5f2dc] p-4.5 border border-[#d3e5c7] shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-[#526456] font-medium">
                사용 가능한 GREEN POINT
              </span>
              <div className="text-3xl font-black text-[#176b48] tracking-tight mt-0.5">
                {user.points.toLocaleString()}{" "}
                <span className="text-xl font-bold">P</span>
              </div>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-white/70 flex items-center justify-center text-3xl shadow-xs">
              🌱
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-[#d1e5c4]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#596d5e] font-medium">10,000P 굿즈 할인권까지</span>
              <span className="font-extrabold text-[#176b48]">
                {remaining === 0 ? "교환 가능! 🎉" : `${remaining.toLocaleString()}P 남음`}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/60 overflow-hidden">
              <div
                className="h-full bg-[#176b48] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Eco Missions */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-base font-extrabold text-[#202c24] tracking-tight">
            오늘의 친환경 미션
          </h2>
          <button
            onClick={() => onNavigate("missions")}
            className="text-xs font-bold text-[#176b48] hover:underline flex items-center gap-0.5"
          >
            <span>전체 보기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {missions.slice(0, 3).map((mission) => (
            <div
              key={mission.id}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-[#e8ece5] shadow-xs hover:border-[#c5dbc9] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#eaf5ed] flex items-center justify-center text-2xl shrink-0">
                {mission.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#176b48] bg-[#eaf5ed] px-1.5 py-0.5 rounded-md">
                    {mission.categoryLabel}
                  </span>
                  <h3 className="text-sm font-bold text-[#202c24] truncate">
                    {mission.title}
                  </h3>
                </div>
                <p className="text-xs font-black text-[#176b48] mt-0.5">
                  +{mission.reward.toLocaleString()}P
                  <span className="ml-1.5 text-[10px] font-normal text-[#7a857d]">
                    (-{mission.co2SavedGrams}g CO₂)
                  </span>
                </p>
              </div>
              <button
                onClick={() => onStartMission(mission.id)}
                className="px-3 py-2 rounded-xl bg-[#176b48] text-white text-xs font-bold hover:bg-[#12583a] transition-all shrink-0 shadow-xs"
              >
                인증하기
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sports Benefits */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-base font-extrabold text-[#202c24] tracking-tight">
            스포츠 혜택
          </h2>
          <button
            onClick={() => onNavigate("benefits")}
            className="text-xs font-bold text-[#176b48] hover:underline flex items-center gap-0.5"
          >
            <span>더 보기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div
            onClick={() => onNavigate("benefits")}
            className="cursor-pointer p-4 rounded-2xl bg-white border border-[#e8ece5] hover:border-[#176b48] transition-all group shadow-xs flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-[#f0f6ec] flex items-center justify-center text-xl mb-2 text-[#176b48]">
                🎟️
              </div>
              <h3 className="text-sm font-bold text-[#202c24] group-hover:text-[#176b48] transition-colors">
                스포츠 경기 혜택
              </h3>
              <p className="text-[11px] text-[#7a857d] mt-1 leading-snug">
                K리그 & KBO 직관 티켓 5,000원 할인권
              </p>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-[#176b48] mt-2 pt-2 border-t border-[#f0f3ee]">
              <span>5,000P 교환</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => onNavigate("coupon")}
            className="cursor-pointer p-4 rounded-2xl bg-white border border-[#e8ece5] hover:border-[#176b48] transition-all group shadow-xs flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-[#f0f6ec] flex items-center justify-center text-xl mb-2 text-[#176b48]">
                🛍️
              </div>
              <h3 className="text-sm font-bold text-[#202c24] group-hover:text-[#176b48] transition-colors">
                구단 굿즈샵 쿠폰
              </h3>
              <p className="text-[11px] text-[#7a857d] mt-1 leading-snug">
                공식 스토어 10,000원 즉시 할인권
              </p>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-[#176b48] mt-2 pt-2 border-t border-[#f0f3ee]">
              <span>10,000P 교환</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Eco Impact Summary Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#176b48] to-[#0f462f] p-4 text-white shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] text-[#c8ed83] font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            지구를 지킨 나의 기여
          </span>
          <p className="text-lg font-black mt-1">
            {(user.co2SavedTotalG / 1000).toFixed(2)} kg <span className="text-xs font-normal">CO₂ 절감</span>
          </p>
          <p className="text-[11px] text-white/80">
            소나무 약 {Math.max(1, Math.round(user.co2SavedTotalG / 300))}그루를 심은 효과예요!
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl backdrop-blur-xs">
          🌲
        </div>
      </div>
    </div>
  );
};
