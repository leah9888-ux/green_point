import React from "react";
import { ScreenId } from "../types";
import { Home, RefreshCw, Coins, Gift, Trophy } from "lucide-react";

interface BottomNavProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  couponCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  couponCount
}) => {
  const isAuthScreen = ["welcome", "login", "signup"].includes(currentScreen);
  if (isAuthScreen) return null;

  const navItems = [
    { id: "home" as ScreenId, label: "홈", icon: Home },
    { id: "missions" as ScreenId, label: "미션", icon: RefreshCw },
    { id: "points" as ScreenId, label: "포인트", icon: Coins },
    { id: "benefits" as ScreenId, label: "혜택", icon: Gift, badge: couponCount > 0 ? couponCount : undefined },
    { id: "sports" as ScreenId, label: "스포츠", icon: Trophy }
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] h-[74px] bg-white/95 backdrop-blur-md border-t border-[#e8eee5] z-30 flex items-center justify-around px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)] md:rounded-b-[28px]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          currentScreen === item.id ||
          (item.id === "missions" && currentScreen === "verify") ||
          (item.id === "benefits" && currentScreen === "coupon");

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`relative flex flex-col items-center justify-center gap-1 min-w-[58px] py-1 transition-colors ${
              isActive ? "text-[#176b48] font-bold" : "text-[#7a857d] hover:text-[#425046]"
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#176b48] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] tracking-tight">{item.label}</span>
            {isActive && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 bg-[#176b48] rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
