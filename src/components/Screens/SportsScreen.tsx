import React, { useState } from "react";
import { ScreenId, SportsMatch } from "../../types";
import { UPCOMING_MATCHES } from "../../data/mockData";
import { Calendar, MapPin, Sparkles, ChevronRight, CheckCircle2, ShieldCheck, ExternalLink } from "lucide-react";

interface SportsScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onStartMission: (missionId: string) => void;
}

export const SportsScreen: React.FC<SportsScreenProps> = ({
  onNavigate,
  onStartMission
}) => {
  const [selectedSport, setSelectedSport] = useState<string>("all");

  const filteredMatches =
    selectedSport === "all"
      ? UPCOMING_MATCHES
      : UPCOMING_MATCHES.filter((m) => m.sport === selectedSport);

  return (
    <div className="px-5 py-5 pb-24 animate-in fade-in duration-300">
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#eaf5ed] text-[#176b48] text-[11px] font-bold mb-1.5">
          <Calendar className="w-3 h-3" />
          MATCH SCHEDULE & ECO STADIUM
        </div>
        <h1 className="text-2xl font-black text-[#202c24] tracking-tight">
          스포츠 일정 📅
        </h1>
        <p className="text-xs text-[#7a857d] mt-1 leading-relaxed">
          직관 경기 일정과 경기장별 친환경 다회용기 혜택을 한눈에 확인하세요.
        </p>
      </div>

      {/* Sport Category Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "all", label: "전체 경기" },
          { id: "basketball", label: "🏀 농구 (KBL)" },
          { id: "volleyball", label: "🏐 배구 (V-리그)" },
          { id: "soccer", label: "⚽ 축구 (K리그1)" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedSport(tab.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedSport === tab.id
                ? "bg-[#176b48] text-white shadow-xs"
                : "bg-white text-[#556459] border border-[#e2e8df] hover:bg-[#f1f6ef]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Match Cards */}
      <div className="flex flex-col gap-3.5 mb-5">
        {filteredMatches.map((match) => (
          <div
            key={match.id}
            className="p-4 rounded-2xl bg-white border border-[#e5ebe2] shadow-xs flex flex-col gap-3"
          >
            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#f1f4ef]">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[#176b48] bg-[#eaf5ed] px-2 py-0.5 rounded-md">
                  {match.sportName}
                </span>
                {match.roundName && (
                  <span className="text-[11px] font-bold text-[#5c6d61] bg-[#f2f6f1] px-1.5 py-0.5 rounded-md">
                    {match.roundName}
                  </span>
                )}
              </div>
              <span className="text-[#68776b] font-medium flex items-center gap-1">
                <span>{match.date}</span>
                <span>{match.time}</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{match.homeLogo}</span>
                <span className="font-bold text-sm text-[#202c24]">{match.homeTeam}</span>
              </div>
              <span className="text-xs font-extrabold text-[#7a857d] bg-[#f4f7f3] px-2 py-0.5 rounded-full">
                VS
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#202c24]">{match.awayTeam}</span>
                <span className="text-xl">{match.awayLogo}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#526356]">
              <MapPin className="w-3.5 h-3.5 text-[#176b48] shrink-0" />
              <span>{match.stadium}</span>
            </div>

            {/* Stadium Eco perks */}
            <div className="p-3 rounded-xl bg-[#f5faf4] border border-[#e2eee1] flex flex-col gap-1 text-[11px] text-[#2c533e]">
              <span className="font-bold text-[#176b48] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#176b48]" />
                이 경기장의 친환경 직관 혜택:
              </span>
              {match.ecoFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-1.5 opacity-90">
                  <span className="w-1 h-1 rounded-full bg-[#176b48]" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => onStartMission("stadium")}
                className="flex-1 py-2.5 rounded-xl bg-[#176b48] hover:bg-[#12583a] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1"
              >
                <span>경기장 다회용기 인증 (+1,000P)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              {match.officialSiteUrl ? (
                <a
                  href={match.officialSiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-[#f2f6f1] hover:bg-[#e4ece2] text-[#425447] text-xs font-bold transition-colors flex items-center gap-1"
                  title="연맹 공식 일정 확인"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#176b48]" />
                  <span>공식일정</span>
                </a>
              ) : (
                <button
                  onClick={() => onNavigate("coupon")}
                  className="py-2.5 px-3 rounded-xl bg-[#eaf5ed] hover:bg-[#d9ece0] text-[#176b48] text-xs font-bold transition-colors"
                >
                  티켓 할인권
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stadium Eco Guide */}
      <div className="rounded-2xl bg-[#e8f2e2] p-4 border border-[#d2e5ca] mb-4">
        <h3 className="text-sm font-bold text-[#176b48] flex items-center gap-1.5 mb-2">
          <ShieldCheck className="w-4 h-4 text-[#176b48]" />
          친환경 직관 팬 행동 수칙
        </h3>
        <ul className="text-xs text-[#394d3f] space-y-1.5 leading-relaxed">
          <li>1. 경기장 입장 시 개인 텀블러 지참 시 음료 할인</li>
          <li>2. 맥주 및 음료 주문 시 보증금 없는 다회용 컵 적극 이용하기</li>
          <li>3. 경기 종료 10분 전 클린 관중석 플로깅 미션 참여하기</li>
        </ul>
      </div>
    </div>
  );
};
