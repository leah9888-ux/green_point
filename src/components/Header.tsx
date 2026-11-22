import React from "react";
import { ScreenId } from "../types";

interface HeaderProps {
  currentScreen: ScreenId;
  points: number;
  userName: string;
  onNavigate: (screen: ScreenId) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  points,
  onNavigate
}) => {
  const isAuthScreen = ["welcome", "login", "signup"].includes(currentScreen);

  return (
    <header className="h-[68px] flex items-center justify-between px-5 bg-[#f6f8f4] sticky top-0 z-30 border-b border-[#e5ece2]">
      <button
        onClick={() => onNavigate(isAuthScreen ? "welcome" : "home")}
        className="flex items-center gap-2.5 text-[19px] font-black tracking-[-0.8px] text-[#176b48] hover:opacity-90 transition-opacity"
      >
        <div className="w-[34px] h-[34px] rounded-xl bg-[#176b48] flex items-center justify-center shadow-sm">
          <svg viewBox="0 0 40 40" className="w-[26px] h-[26px]" fill="none" aria-hidden="true">
            <path
              d="M31 7C15 7 7 15 8 26c1 6 7 8 12 5C28 27 31 17 31 7Z"
              fill="#C8ED83"
            />
            <path
              d="M8 33c5-9 11-14 18-19"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span>GREEN POINT</span>
      </button>

      {!isAuthScreen && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("points")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#eaf5ed] border border-[#d2e8d7] text-xs font-bold text-[#176b48] hover:bg-[#deede1] transition-colors"
          >
            <span>🌱</span>
            <span>{points.toLocaleString()}P</span>
          </button>
          <button
            onClick={() => onNavigate("profile")}
            className="w-10 h-10 rounded-full bg-white border border-[#e2e8df] flex items-center justify-center text-lg text-[#202c24] hover:bg-[#f0f4ee] shadow-sm transition-all"
            aria-label="마이페이지"
            title="마이페이지"
          >
            ☻
          </button>
        </div>
      )}
    </header>
  );
};
