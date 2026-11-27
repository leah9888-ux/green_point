import React, { useState } from "react";
import { ScreenId, SportsMatch } from "../../types";
import { Calendar, MapPin, ExternalLink, ChevronRight } from "lucide-react";

interface SportsScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onStartMission: (missionId: string) => void;
}

const leagues = {
  football: { name: "K리그1", icon: "⚽", url: "https://www.kleague.com/news_view.do?category=notice&orderBy=seq&page=1&seq=96653&viewOption=album", round: "2026 파이널 38라운드" },
  basketball: { name: "KBL 프로농구", icon: "🏀", url: "https://www.kbl.or.kr", round: "2026-27 정규리그" },
  men: { name: "V-리그 남자부", icon: "🏐", url: "https://www.kovo.co.kr", round: "2026-27 정규리그" },
  women: { name: "V-리그 여자부", icon: "🏐", url: "https://www.kovo.co.kr", round: "2026-27 정규리그" }
};
type League = keyof typeof leagues;
type Fixture = [number, string, string, string, string];
const fixtures: Record<League, Fixture[]> = {
  football: [
    [5,"14:00","제주 SK","부천 FC","제주월드컵경기장"],
    [5,"14:00","FC안양","광주 FC","안양종합운동장"],
    [5,"14:00","김천 상무","포항 스틸러스","김천종합운동장"],
    [6,"14:00","강원 FC","FC서울","강릉하이원아레나"],
    [6,"14:00","대전 하나시티즌","울산 HD","대전월드컵경기장"],
    [6,"14:00","전북 현대","인천 유나이티드","전주월드컵경기장"]
  ],
  basketball: [
    [5,"14:00","고양 소노","안양 정관장","고양소노아레나"],
    [5,"14:00","창원 LG","대구 한국가스공사","창원체육관"],
    [5,"16:30","원주 DB","서울 SK","원주DB프로미아레나"],
    [6,"14:00","수원 KT","부산 KCC","수원 KT 소닉붐 아레나"],
    [6,"14:00","대구 한국가스공사","서울 삼성","대구체육관"],
    [6,"16:30","원주 DB","울산 현대모비스","원주DB프로미아레나"],
    [7,"19:00","창원 LG","서울 SK","창원체육관"],
    [8,"19:00","안양 정관장","울산 현대모비스","안양 정관장 아레나"],
    [9,"19:00","서울 삼성","부산 KCC","잠실학생체육관"],
    [10,"19:00","대구 한국가스공사","원주 DB","대구체육관"]
  ],
  men: [
    [5,"14:00","우리카드","OK저축은행","서울장충체육관"],
    [6,"14:00","현대캐피탈","대한항공","천안유관순체육관"],
    [8,"19:00","KB손해보험","한국전력","평택이충문화체육관"],
    [9,"19:00","OK저축은행","삼성화재","부산강서체육관"],
    [10,"19:00","대한항공","우리카드","인천계양체육관"],
    [11,"19:00","KB손해보험","현대캐피탈","평택이충문화체육관"],
    [12,"14:00","한국전력","삼성화재","수원체육관"],
    [13,"14:00","대한항공","OK저축은행","인천계양체육관"],
    [15,"19:00","현대캐피탈","우리카드","천안유관순체육관"],
    [16,"19:00","OK저축은행","KB손해보험","부산강서체육관"],
    [17,"19:00","삼성화재","대한항공","대전충무체육관"],
    [18,"19:00","한국전력","우리카드","수원체육관"],
    [19,"14:00","현대캐피탈","KB손해보험","천안유관순체육관"],
    [20,"14:00","삼성화재","OK저축은행","대전충무체육관"],
    [22,"19:00","대한항공","현대캐피탈","인천계양체육관"],
    [23,"19:00","우리카드","한국전력","서울장충체육관"],
    [24,"19:00","KB손해보험","삼성화재","평택이충문화체육관"],
    [25,"14:00","OK저축은행","대한항공","부산강서체육관"],
    [26,"14:00","현대캐피탈","한국전력","천안유관순체육관"]
  ],
  women: [
    [5,"16:00","정관장","현대건설","대전충무체육관"],
    [6,"16:00","한국도로공사","GS칼텍스","김천실내체육관"],
    [8,"19:00","흥국생명","IBK기업은행","인천삼산월드체육관"],
    [9,"19:00","정관장","SOOP 수퍼스","대전충무체육관"],
    [10,"19:00","GS칼텍스","현대건설","서울장충체육관"],
    [11,"19:00","흥국생명","한국도로공사","인천삼산월드체육관"],
    [12,"16:00","IBK기업은행","SOOP 수퍼스","화성종합실내체육관"],
    [13,"16:00","정관장","GS칼텍스","대전충무체육관"],
    [15,"19:00","한국도로공사","현대건설","김천실내체육관"]
  ]
};
// 출처: K리그 공식 파이널 일정, KBL 공개 일정(simplelife100.tistory.com/2136),
// Daum 스포츠 남자배구 2026년 12월, 배구인사이트 여자배구 일정.
// 전체 월간 일정이 아닌 확인 가능한 주요 경기만 표시합니다.
const DECEMBER_MATCHES = (Object.keys(fixtures) as League[]).flatMap(league =>
  fixtures[league].map(([day,time,homeTeam,awayTeam,stadium], index) => ({
    id: `${league}-${day}-${index}`,
    sport: league === "football" ? "football" : league === "basketball" ? "basketball" : "volleyball",
    sportName: leagues[league].name,
    roundName: leagues[league].round,
    homeTeam, awayTeam, stadium, time,
    homeLogo: leagues[league].icon, awayLogo: leagues[league].icon,
    date: `2026.12.${String(day).padStart(2,"0")} (${"일월화수목금토"[new Date(Date.UTC(2026,11,day)).getUTCDay()]})`,
    ecoFeatures: [], ecoDiscountAvailable: false, officialSiteUrl: leagues[league].url
  }))
).sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
// 기존 SportsMatch 타입의 축구 분류명과 무관하게 이 화면의 데이터는 독립적으로 사용합니다.
type DisplayMatch = Omit<SportsMatch, "sport"> & { sport: string };
const matches: DisplayMatch[] = DECEMBER_MATCHES;

export const SportsScreen: React.FC<SportsScreenProps> = ({ onStartMission }) => {
  const [selectedSport, setSelectedSport] = useState("all");
  const filtered = matches.filter(m => selectedSport === "all" || m.sport === selectedSport);
  return (
    <div className="px-5 py-5 pb-24 animate-in fade-in duration-300">
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#eaf5ed] text-[#176b48] text-[11px] font-bold mb-1.5"><Calendar className="w-3 h-3" /> DECEMBER 2026 SPORTS</div>
        <h1 className="text-2xl font-black text-[#202c24]">2026년 12월 스포츠 일정 📅</h1>
        <p className="text-xs text-[#7a857d] mt-1">12월 5일부터의 공개 주요 경기 일정입니다. 관람 전 공식 일정을 확인해 주세요.</p>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[{ id: "all", label: "전체 경기" }, { id: "football", label: "⚽ 축구" }, { id: "baseball", label: "⚾ 야구" }, { id: "basketball", label: "🏀 농구" }, { id: "volleyball", label: "🏐 배구" }].map(tab => (
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
        {(selectedSport === "all" || selectedSport === "baseball") && (
          <div className="p-4 rounded-2xl bg-white border border-[#e5ebe2] flex flex-col gap-3">
            <h2 className="font-bold text-[#176b48]">⚾ KBO 프로야구 · 비시즌</h2>
            <p className="text-xs text-[#68776b]">12월 정규시즌 경기는 없습니다. 다음 시즌 일정은 KBO 공식 홈페이지에서 확인해 주세요.</p>
            <a href="https://www.koreabaseball.com/Schedule/Schedule.aspx" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-[#f2f6f1] text-[#425447] text-xs font-bold flex items-center gap-1"><ExternalLink className="w-3.5 h-3.5" /> KBO 공식 일정</a>
          </div>
        )}
      </div>
      <p className="mt-5 text-xs text-[#7a857d]">위 목록은 확인된 주요 경기이며 12월 전체 일정이 아닙니다. 경기 일정은 변경될 수 있으며 경기장 친환경 혜택 및 할인은 별도 확인이 필요합니다.</p>
    </div>
  );
};
