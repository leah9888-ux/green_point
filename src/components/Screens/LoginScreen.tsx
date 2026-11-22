import React, { useState } from "react";
import { ScreenId } from "../../types";
import { ArrowLeft, Lock, Mail } from "lucide-react";

interface LoginScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onLogin: (email: string) => void;
  onGoogleSignIn: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigate,
  onLogin,
  onGoogleSignIn
}) => {
  const [email, setEmail] = useState("greenfan@sports.kr");
  const [password, setPassword] = useState("123456");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onLogin(email);
  };

  return (
    <div className="px-5 py-5 animate-in fade-in duration-300">
      <button
        onClick={() => onNavigate("welcome")}
        className="flex items-center gap-1.5 text-sm text-[#7a857d] hover:text-[#202c24] mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>뒤로</span>
      </button>

      <div className="mb-5">
        <h1 className="text-2xl font-black text-[#202c24] tracking-tight">
          다시 만나요! 🌱
        </h1>
        <p className="text-xs text-[#7a857d] mt-1.5 leading-relaxed">
          GREEN POINT에 로그인하고 스포츠와 지구를 위한 친환경 활동을 이어가세요.
        </p>
      </div>

      <button
        onClick={onGoogleSignIn}
        type="button"
        className="w-full mb-4 py-3.5 px-4 rounded-2xl bg-white border border-[#d2dcd0] text-[#202c24] font-bold text-sm shadow-xs hover:bg-[#f6faf4] transition-all flex items-center justify-center gap-2.5"
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
        <span>Google로 간편 로그인</span>
      </button>

      <div className="flex items-center gap-2 my-3 text-xs text-[#9aa49c]">
        <div className="flex-1 h-px bg-[#e1e7de]" />
        <span>또는 이메일 로그인</span>
        <div className="flex-1 h-px bg-[#e1e7de]" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold text-[#35453b] mb-1.5">
            이메일 계정
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a968d]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white border border-[#dce3da] text-sm text-[#202c24] placeholder-[#a2ada5] focus:outline-none focus:ring-2 focus:ring-[#176b48]/30 focus:border-[#176b48]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#35453b] mb-1.5">
            비밀번호
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a968d]" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white border border-[#dce3da] text-sm text-[#202c24] placeholder-[#a2ada5] focus:outline-none focus:ring-2 focus:ring-[#176b48]/30 focus:border-[#176b48]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-[#176b48] text-white font-bold text-sm shadow-sm hover:bg-[#12583a] transition-all mt-2"
        >
          로그인
        </button>
      </form>

      <div className="mt-4 flex flex-col gap-2.5">
        <button
          onClick={() => onNavigate("signup")}
          className="w-full py-3.5 rounded-2xl bg-[#eaf5ed] text-[#176b48] font-bold text-xs hover:bg-[#daede0] transition-colors"
        >
          아직 회원이 아니신가요? 회원가입
        </button>

        <div className="bg-[#f0f4ee] rounded-xl p-3 text-[11px] text-[#7a857d] text-center">
          💡 입력한 정보는 브라우저 로컬 저장소에 안전하게 유지되며 언제든지 마이페이지에서 변경할 수 있습니다.
        </div>
      </div>
    </div>
  );
};
