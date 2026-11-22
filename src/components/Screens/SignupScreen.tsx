import React, { useState } from "react";
import { ScreenId } from "../../types";
import { ArrowLeft, User, Mail, Lock } from "lucide-react";

interface SignupScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onSignup: (name: string, email: string) => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({
  onNavigate,
  onSignup
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    onSignup(name, email);
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

      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#202c24] tracking-tight">
          함께 시작해요 🌿
        </h1>
        <p className="text-xs text-[#7a857d] mt-1.5 leading-relaxed">
          회원가입하고 나만의 친환경 스포츠 포인트 지갑을 만들어보세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold text-[#35453b] mb-1.5">
            활동 닉네임 (팬 네임)
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a968d]" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 그린풋볼러, 에코라이온즈"
              required
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white border border-[#dce3da] text-sm text-[#202c24] placeholder-[#a2ada5] focus:outline-none focus:ring-2 focus:ring-[#176b48]/30 focus:border-[#176b48]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#35453b] mb-1.5">
            이메일
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a968d]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
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
              placeholder="4자 이상 입력하세요"
              minLength={4}
              required
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white border border-[#dce3da] text-sm text-[#202c24] placeholder-[#a2ada5] focus:outline-none focus:ring-2 focus:ring-[#176b48]/30 focus:border-[#176b48]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-[#176b48] text-white font-bold text-sm shadow-sm hover:bg-[#12583a] transition-all mt-2"
        >
          가입하고 시작하기 (+1,000P 웰컴 보너스)
        </button>
      </form>

      <button
        onClick={() => onNavigate("login")}
        className="w-full py-3 text-center text-xs text-[#7a857d] hover:text-[#176b48] mt-3"
      >
        이미 계정이 있으신가요? 로그인하기
      </button>
    </div>
  );
};
