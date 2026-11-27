
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
  onLogin
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
