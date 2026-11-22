import React, { useState } from "react";
import { ScreenId, Mission } from "../../types";
import { Filter, Sparkles, CheckCircle2 } from "lucide-react";

interface MissionsScreenProps {
  missions: Mission[];
  onStartMission: (missionId: string) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const MissionsScreen: React.FC<MissionsScreenProps> = ({
  missions,
  onStartMission
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filteredMissions =
    selectedFilter === "all"
      ? missions
      : missions.filter((m) => m.category === selectedFilter);

  return (
    <div className="px-5 py-5 pb-24 animate-in fade-in duration-300">
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#eaf5ed] text-[#176b48] text-[11px] font-bold mb-1.5">
          <Sparkles className="w-3 h-3" />
          ECO ACTION
        </div>
        <h1 className="text-2xl font-black text-[#202c24] tracking-tight">
          친환경 미션 🌿
        </h1>
        <p className="text-xs text-[#7a857d] mt-1 leading-relaxed">
          일상 속 작은 실천과 스포츠 직관 활동을 사진으로 인증하고 GREEN POINT를 적립하세요.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-4">
        {[
          { id: "all", label: "전체" },
          { id: "daily", label: "🥤 일상 실천" },
          { id: "transport", label: "🚲 친환경 이동" },
          { id: "stadium", label: "🏟️ 경기장 직관" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedFilter === tab.id
                ? "bg-[#176b48] text-white shadow-xs"
                : "bg-white text-[#526056] border border-[#e2e7df] hover:bg-[#f1f6ef]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mission Cards */}
      <div className="flex flex-col gap-3">
        {filteredMissions.map((mission) => (
          <div
            key={mission.id}
            className="p-4 rounded-2xl bg-white border border-[#e5ebe2] shadow-xs hover:border-[#176b48]/50 transition-all flex flex-col justify-between gap-3"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-[#eaf5ed] flex items-center justify-center text-3xl shrink-0">
                {mission.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold text-[#176b48] bg-[#eaf5ed] px-2 py-0.5 rounded-md">
                    {mission.categoryLabel}
                  </span>
                  <span className="text-[10px] text-[#7a857d] bg-[#f2f5f1] px-1.5 py-0.5 rounded-md font-medium">
                    {mission.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#202c24] leading-snug">
                  {mission.title}
                </h3>
                <p className="text-xs text-[#7a857d] mt-1 leading-relaxed">
                  {mission.desc}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-[#f1f4ef]">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-[#176b48]">
                  +{mission.reward.toLocaleString()}P
                </span>
                <span className="text-[11px] text-[#7a857d] bg-[#edf4ec] px-2 py-0.5 rounded-full font-medium">
                  🌱 -{mission.co2SavedGrams}g CO₂
                </span>
              </div>
              <button
                onClick={() => onStartMission(mission.id)}
                className="px-4 py-2 rounded-xl bg-[#176b48] text-white text-xs font-bold hover:bg-[#12583a] transition-all shadow-xs flex items-center gap-1"
              >
                <span>인증 참여</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 p-3.5 rounded-2xl bg-[#fff7df] border border-[#f5e6b7] text-[#866a22] text-xs leading-relaxed flex items-start gap-2">
        <span className="text-base leading-none">💡</span>
        <div>
          <strong>친환경 인증 안내</strong>
          <p className="mt-0.5 text-[11px] opacity-90">
            직접 찍은 사진을 업로드하거나 간편 테스트용 샘플 이미지를 선택하여 인증할 수 있습니다.
            적립된 포인트는 스포츠 경기 티켓 및 구단 굿즈샵 할인권으로 즉시 교환 가능합니다.
          </p>
        </div>
      </div>
    </div>
  );
};
