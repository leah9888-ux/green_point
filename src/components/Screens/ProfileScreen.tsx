import React, { useState } from "react";
import { ScreenId, UserProfile } from "../../types";
import { Edit2, Check, Award, TreePine, RefreshCw, LogOut, Sparkles } from "lucide-react";

interface ProfileScreenProps {
  user: UserProfile;
  couponCount: number;
  onNavigate: (screen: ScreenId) => void;
  onUpdateName: (newName: string) => void;
  onResetData: () => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  couponCount,
  onNavigate,
  onUpdateName,
  onResetData,
  onLogout
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);

  const handleSaveName = () => {
    if (editName.trim()) {
      onUpdateName(editName.trim());
    }
    setIsEditing(false);
  };

  const badges = [
    { name: "새싹 서포터", icon: "🌱", unlocked: true, desc: "GREEN POINT 첫 발걸음" },
    { name: "텀블러 러버", icon: "🥤", unlocked: user.completedMissions >= 1, desc: "개인 텀블러 미션 인증" },
    { name: "그린 라이더", icon: "🚲", unlocked: user.completedMissions >= 2, desc: "친환경 이동 실천" },
    { name: "경기장 지킴이", icon: "🏟️", unlocked: user.completedMissions >= 3, desc: "직관 다회용기 사용" },
    { name: "지구 챔피언", icon: "🏆", unlocked: couponCount >= 1, desc: "첫 스포츠 쿠폰 교환" }
  ];

  return (
    <div className="px-5 py-5 pb-24 animate-in fade-in duration-300 flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-black text-[#202c24] tracking-tight">
          마이페이지
        </h1>
        <p className="text-xs text-[#7a857d] mt-1 leading-relaxed">
          나의 친환경 스포츠 활동과 적립 내역을 관리합니다.
        </p>
      </div>

      {/* User profile card */}
      <div className="rounded-[24px] bg-white p-5 border border-[#e5ebe2] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-[#eaf5ed] border-2 border-[#cbe4d2] flex items-center justify-center text-3xl shadow-xs shrink-0">
            🌱
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="px-2.5 py-1 text-sm font-bold border border-[#176b48] rounded-lg focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="p-1.5 bg-[#176b48] text-white rounded-lg text-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#202c24] truncate">
                  {user.name}
                </h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-[#7a857d] hover:text-[#176b48] p-1"
                  aria-label="닉네임 수정"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-xs text-[#7a857d] mt-0.5">
              지구를 위한 실천을 이어가는 중 · {user.level}
            </p>
            {user.email && (
              <p className="text-[11px] text-[#5b6a5f] mt-1 truncate">
                계정: {user.email}
              </p>
            )}
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#eaf5ed] border border-[#cfe4d2] text-[10px] font-bold text-[#176b48]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Firebase Firestore 연동됨</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="rounded-[22px] bg-white p-4.5 border border-[#e5ebe2] shadow-xs flex flex-col divide-y divide-[#edf1eb]">
        <div className="py-2.5 flex items-center justify-between first:pt-0">
          <span className="text-xs text-[#526356] font-medium">보유 GREEN POINT</span>
          <strong className="text-base font-black text-[#176b48]">
            {user.points.toLocaleString()} P
          </strong>
        </div>
        <div className="py-2.5 flex items-center justify-between">
          <span className="text-xs text-[#526356] font-medium">참여한 친환경 미션</span>
          <strong className="text-xs font-black text-[#202c24]">
            {user.completedMissions} 회
          </strong>
        </div>
        <div className="py-2.5 flex items-center justify-between">
          <span className="text-xs text-[#526356] font-medium">누적 탄소 저감량</span>
          <strong className="text-xs font-black text-[#176b48]">
            {(user.co2SavedTotalG / 1000).toFixed(2)} kg CO₂
          </strong>
        </div>
        <div className="py-2.5 flex items-center justify-between">
          <span className="text-xs text-[#526356] font-medium">보유한 스포츠 혜택 쿠폰</span>
          <strong className="text-xs font-black text-[#202c24]">
            {couponCount} 개
          </strong>
        </div>
        <div className="pt-3">
          <button
            onClick={() => onNavigate("points")}
            className="w-full py-3 rounded-xl bg-[#eaf5ed] hover:bg-[#d8edd9] text-[#176b48] text-xs font-bold transition-colors"
          >
            포인트 상세 내역 보기
          </button>
        </div>
      </div>

      {/* Badges Collection */}
      <div className="rounded-[22px] bg-white p-4.5 border border-[#e5ebe2] shadow-xs">
        <h3 className="text-sm font-extrabold text-[#202c24] mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#176b48]" />
          <span>친환경 활동 배지 컬렉션</span>
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {badges.map((badge, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                badge.unlocked
                  ? "bg-[#f5faf5] border-[#cfe4d2]"
                  : "bg-[#f7f8f6] border-[#e7ebe5] opacity-50 grayscale"
              }`}
            >
              <span className="text-2xl">{badge.icon}</span>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#202c24] truncate">
                  {badge.name}
                </h4>
                <p className="text-[10px] text-[#7a857d] truncate">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings / Actions */}
      <div className="flex flex-col gap-2 pt-2">
        {/* Admin and Test Lab Tools */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onNavigate("admin")}
            className="py-3 rounded-xl bg-[#eaf5ed] border border-[#cde3d3] text-[#176b48] hover:bg-[#d8eedf] text-xs font-black transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>🛡️ 관리자 심사 센터</span>
          </button>
          <button
            onClick={() => onNavigate("testlab")}
            className="py-3 rounded-xl bg-white border border-[#d6dfd4] text-[#2c3d31] hover:bg-[#f3f7f2] text-xs font-black transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>🧪 AI 판독 테스트 랩</span>
          </button>
        </div>

        <button
          onClick={onResetData}
          className="w-full py-3 rounded-xl bg-white border border-[#d6dfd4] text-[#607165] hover:bg-[#f3f7f2] text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>데모 데이터 초기화 (신규 시작 상태로)</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full py-3.5 rounded-xl bg-white border border-[#d7e5d8] text-[#176b48] hover:bg-[#eaf5ed] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  );
};
