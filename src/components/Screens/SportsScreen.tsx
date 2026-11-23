import React, { useState } from "react";
import { ScreenId, SportsMatch } from "../../types";
import { Calendar, MapPin, ExternalLink, ChevronRight } from "lucide-react";

interface SportsScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onStartMission: (missionId: string) => void;
}

// 2026년 12월 공개 경기 일정 기준. 일정은 주최 측 사정으로 변경될 수 있습니다.
// 경기장별 친환경 혜택은 확인되지 않아 기재하지 않습니다.
const DECEMBER_MATCHES: SportsMatch[] = [
  { id: "kbl-1203-sono", sport: "basketball", sportName: "KBL 프로농구", roundName: "2026-27 정규리그", homeTeam: "고양 소노", awayTeam: "서울 SK", homeLogo: "🏀", awayLogo: "🏀", stadium: "고양 소노 아레나", date: "2026.12.03 (목)", time: "19:00", ecoFeatures: [], ecoDiscountAvailable: false, officialSiteUrl: "https://www.kbl.or.kr" },
  { id: "kbl-1203-lg", sport: "basketball", sportName: "KBL 프로농구", roundName: "2026-27 정규리그", homeTeam: "창원 LG", awayTeam: "안양 정관장", homeLogo: "🏀", awayLogo: "🏀", stadium: "창원체육관", date: "2026.12.03 (목)", time: "19:00", ecoFeatures: [], ecoDiscountAvailable: false, officialSiteUrl: "https://www.kbl.or.kr" },
  { id: "kbl-1204-kcc", sport: "basketball", sportName: "KBL 프로농구", roundName: "2026-27 정규리그", homeTeam: "부산 KCC", awayTeam: "서울 삼성", homeLogo: "🏀", awayLogo: "🏀", stadium: "부산사직체육관", date: "2026.12.04 (금)", time: "19:00", ecoFeatures: [], ecoDiscountAvailable: false, officialSiteUrl: "https://www.kbl.or.kr" },
  { id: "kbl-1205-db", sport: "basketball", sportName: "KBL 프로농구", roundName: "2026-27 정규리그", homeTeam: "원주 DB", awayTeam: "서울 SK", homeLogo: "🏀", awayLogo: "🏀", stadium: "원주 DB프로미아레나", date: "2026.12.05 (토)", time: "16:30", ecoFeatures: [], ecoDiscountAvailable: false, officialSiteUrl: "https://www.kbl.or.kr" },
  { id: "kbl-1206-kt", sport: "basketball", sportName: "KBL 프로농구", roundName: "2026-27 정규리그", homeTeam: "수원 KT", awayTeam: "부산 KCC", homeLogo: "🏀", awayLogo: "🏀", stadium: "수원 KT 소닉붐 아레나", date: "2026.12.06 (일)", time: "14:00", ecoFeatures: [], ecoDiscountAvailable: false, officialSiteUrl: "https://www.kbl.or.kr" },
  { id: "kovo-1204", sport: "volleyball", sportName: "V-리그 남자부", roundName: "2026-27 정규리그", homeTeam: "삼성화재", awayTeam: "KB손해보험", homeLogo: "🏐", awayLogo: "🏐", stadium: "대전충무체육관", date: "2026.12.04 (금)", time: "19:00", ecoFeatures: [], ecoDiscountAvailable: false, officialSiteUrl: "https://www.kovo.co.kr" },
  { id: "kovo-1205", sport: "volleyball", sportName: "V-리그 남자부", roundName: "2026-27 정규리그", homeTeam: "우리카드", awayTeam: "OK저축은행", homeLogo: "🏐", awayLogo: "🏐", stadium: "서울장충체육관", date: "2026.12.05 (토)", time: "14:00", ecoFeatures: [], ecoDiscountAvailable: false, officialSiteUrl: "https://www.kovo.co.kr" },
  { id: "kovo-1206", sport: "volleyball", sportName: "V-리그 남자부", roundName: "2026-27 정규리그", homeTeam: "현대캐피탈", awayTeam: "대한항공", homeLogo: "🏐", awayLogo: "🏐", stadium: "천안유관순체육관", date: "2026.12.06 (일)", time: "14:00", ecoFeatures: [], ecoDiscountAvailable: false, officialSiteUrl: "https://www.kovo.co.kr" },
  { id: "kovo-1208", sport: "volleyball", sportName: "V-리그 남자부", roundName: "2026-27 정규리그", homeTeam: "KB손해보험", awayTeam: "한국전력", homeLogo: "🏐", awayLogo: "🏐", stadium: "평택이충문화체육관", date: "2026.12.08 (화)", time: "19:00", ecoFeatures: [], ecoDiscountAvailable: false, officialSiteUrl: "https://www.kovo.co.kr" },
  { id: "kovo-1210", sport: "volleyball", sportName: "V-리그 남자부", roundName: "2026-27 정규리그", homeTeam: "대한항공", awayTeam: "우리카드", homeLogo: "🏐", awayLogo: "🏐", stadium: "인천계양체육관", date: "2026.12.10 (목)", time: "19:00", ecoFeatures: [], ecoDiscountAvailable: false, officialSiteUrl: "https://www.kovo.co.kr" }
].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

export const SportsScreen: React.FC<SportsScreenProps> = ({ onStartMission }) => {
  const [selectedSport, setSelectedSport] = useState("all");
  const filtered = DECEMBER_MATCHES.filter(m => selectedSport === "all" || m.sport === selectedSport);
  return (
    <div className="px-5 py-5 pb-24 animate-in fade-in duration-300">
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#eaf5ed] text-[#176b48] text-[11px] font-bold mb-1.5"><Calendar className="w-3 h-3" /> DECEMBER 2026 SPORTS</div>
        <h1 className="text-2xl font-black text-[#202c24]">2026년 12월 스포츠 일정 📅</h1>
        <p className="text-xs text-[#7a857d] mt-1">공개된 프로농구·프로배구 경기 일정입니다. 관람 전 공식 일정을 다시 확인해 주세요.</p>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[{ id: "all", label: "전체 경기" }, { id: "basketball", label: "🏀 농구" }, { id: "volleyball", label: "🏐 배구" }].map(tab => (
          <button key={tab.id} onClick={() => setSelectedSport(tab.id)} className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${selectedSport === tab.id ? "bg-[#176b48] text-white" : "bg-white border border-[#e2e8df] text-[#556459]"}`}>{tab.label}</button>
        ))}
      </div>
      <div className="flex flex-col gap-3.5">
        {filtered.map(match => (
          <div key={match.id} className="p-4 rounded-2xl bg-white border border-[#e5ebe2] shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 text-xs pb-2 border-b border-[#f1f4ef]"><span className="font-extrabold text-[#176b48] bg-[#eaf5ed] px-2 py-0.5 rounded-md">{match.sportName}</span><span className="text-[#68776b]">{match.date} {match.time}</span></div>
            <div className="flex items-center justify-between gap-2 py-1 text-sm font-bold text-[#202c24]"><span>{match.homeLogo} {match.homeTeam}</span><span className="text-xs text-[#7a857d]">VS</span><span>{match.awayTeam} {match.awayLogo}</span></div>
            <div className="flex items-center gap-1.5 text-xs text-[#526356]"><MapPin className="w-3.5 h-3.5 text-[#176b48]" /> {match.stadium}</div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => onStartMission("stadium")} className="flex-1 py-2.5 rounded-xl bg-[#176b48] text-white text-xs font-bold flex items-center justify-center gap-1">경기장 친환경 미션 <ChevronRight className="w-3.5 h-3.5" /></button>
              <a href={match.officialSiteUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2.5 rounded-xl bg-[#f2f6f1] text-[#425447] text-xs font-bold flex items-center gap-1"><ExternalLink className="w-3.5 h-3.5" /> 공식일정</a>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-xs text-[#7a857d]">경기장 다회용기 혜택이나 할인은 별도 확인이 필요합니다. 위 목록은 12월 전체 경기의 완전한 목록이 아닌 확인된 주요 경기입니다.</p>
    </div>
  );
};
