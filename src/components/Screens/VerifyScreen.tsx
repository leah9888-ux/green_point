import React, { useState, useRef } from "react";
import { ScreenId, Mission, AIAnalysisResult, UserProfile } from "../../types";
import { ArrowLeft, Camera, CheckCircle2, AlertTriangle, XCircle, Search, RefreshCw, Sparkles, Clock } from "lucide-react";
import confetti from "canvas-confetti";
import { executePhotoVerificationPipeline } from "../../firebase";

interface VerifyScreenProps {
  mission: Mission | null;
  user: UserProfile;
  onNavigate: (screen: ScreenId) => void;
  onPointsAwarded: (reward: number, co2Grams: number, title: string) => void;
}

export const VerifyScreen: React.FC<VerifyScreenProps> = ({
  mission,
  user,
  onNavigate,
  onPointsAwarded
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!mission) {
    return (
      <div className="px-5 py-10 text-center">
        <p className="text-sm text-[#7a857d]">선택된 미션이 없습니다.</p>
        <button
          onClick={() => onNavigate("missions")}
          className="mt-4 px-4 py-2 bg-[#176b48] text-white rounded-xl text-xs font-bold"
        >
          미션 목록으로 가기
        </button>
      </div>
    );
  }

  const compressImage = (dataUrl: string, maxWidth = 1000, quality = 0.85): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType("image/jpeg");
    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string;
      // Compress image for ultra-fast, reliable AI processing
      const optimizedDataUrl = await compressImage(rawDataUrl, 1000, 0.85);
      setPhotoUrl(optimizedDataUrl);
      setAnalysisResult(null);
      setErrorMsg(null);
      startAIVerification(optimizedDataUrl, "image/jpeg");
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = async (sampleUrl: string) => {
    try {
      setIsVerifying(true);
      setErrorMsg(null);
      // Fetch sample image and convert to Base64 for actual Gemini multimodal API call
      const res = await fetch(sampleUrl);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoUrl(base64);
        setMimeType(blob.type || "image/jpeg");
        startAIVerification(base64, blob.type || "image/jpeg");
      };
      reader.readAsDataURL(blob);
    } catch {
      setIsVerifying(false);
      setErrorMsg("샘플 이미지를 불러오는 중 문제가 발생했습니다.");
    }
  };

  const startAIVerification = async (base64Data: string, type: string) => {
    setIsVerifying(true);
    setAnalysisResult(null);
    setErrorMsg(null);

    try {
      const { result, pointsGranted } = await executePhotoVerificationPipeline(
        base64Data,
        type,
        mission.id,
        mission.title,
        mission.reward,
        user.avatarSeed || "user",
        user.email,
        user.name
      );

      setAnalysisResult(result);

      if (result.status === "APPROVED" && pointsGranted > 0) {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#176b48", "#c8ed83", "#ffd700", "#ffffff"]
        });
        onPointsAwarded(mission.reward, mission.co2SavedGrams, mission.title);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "AI 사진 판독 중 오류가 발생했습니다.");
    } finally {
      setIsVerifying(false);
    }
  };

  const resetPhoto = () => {
    setPhotoUrl(null);
    setAnalysisResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="px-5 py-4 pb-24 animate-in fade-in duration-300">
      <button
        onClick={() => onNavigate("missions")}
        className="flex items-center gap-1.5 text-xs text-[#7a857d] hover:text-[#202c24] mb-3 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>미션 목록으로 돌아가기</span>
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-[#eaf5ed] flex items-center justify-center text-2xl shrink-0">
          {mission.icon}
        </div>
        <div>
          <span className="text-[10px] font-bold text-[#176b48] bg-[#eaf5ed] px-2 py-0.5 rounded-md">
            {mission.categoryLabel}
          </span>
          <h1 className="text-xl font-black text-[#202c24] tracking-tight mt-0.5">
            {mission.title}
          </h1>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 border border-[#e5ebe2] shadow-xs mb-4">
        <p className="text-xs text-[#526056] leading-relaxed mb-3">
          {mission.desc}
        </p>

        <div className="p-3 rounded-xl bg-[#f5f8f3] border border-[#e5ece2] text-xs text-[#4b5c50] flex items-start gap-2 mb-4">
          <span className="text-sm">💡</span>
          <div>
            <strong className="text-[#176b48]">인증 팁:</strong> {mission.hint}
          </div>
        </div>

        {/* Upload Box or Image Preview */}
        {!photoUrl ? (
          <div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-[#b7cbb6] bg-[#f5faf3] rounded-2xl min-h-[170px] flex flex-col items-center justify-center gap-2 p-5 text-center hover:bg-[#eef6ec] transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#176b48] shadow-xs">
                <Camera className="w-6 h-6" />
              </div>
              <strong className="text-sm text-[#202c24]">실제 인증 사진 촬영/업로드</strong>
              <span className="text-xs text-[#7a857d]">
                카메라 촬영 또는 갤러리에서 사진 업로드 (Gemini AI가 실시간 분석합니다)
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Quick Sample Photos */}
            {mission.sampleImages && mission.sampleImages.length > 0 && (
              <div className="mt-3.5">
                <p className="text-[11px] font-bold text-[#56685a] mb-2 flex items-center gap-1">
                  <span>⚡ 테스트용 샘플 사진 선택:</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {mission.sampleImages.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSample(sample.url)}
                      className="group flex items-center gap-2 p-1.5 rounded-xl border border-[#d9e5d7] bg-white hover:border-[#176b48] hover:bg-[#f6faf4] transition-all text-left"
                    >
                      <img
                        src={sample.url}
                        alt={sample.label}
                        className="w-11 h-11 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-[#202c24] block truncate group-hover:text-[#176b48]">
                          {sample.label}
                        </span>
                        <span className="text-[10px] text-[#7a857d]">AI 판독 테스트</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="relative rounded-2xl overflow-hidden border border-[#d8e3d5] bg-black/5 max-h-[260px] flex items-center justify-center">
              <img
                src={photoUrl}
                alt="선택한 인증 사진"
                className="w-full max-h-[260px] object-cover"
              />
              <button
                onClick={resetPhoto}
                disabled={isVerifying}
                className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 text-white text-[11px] font-medium backdrop-blur-xs flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>사진 변경</span>
              </button>
            </div>

            {/* AI Verification Status Card */}
            {isVerifying && (
              <div className="p-4 rounded-xl bg-[#eaf5ed] border border-[#cbe5d2] flex items-center gap-3 text-xs text-[#176b48] font-bold animate-pulse">
                <RefreshCw className="w-5 h-5 animate-spin text-[#176b48] shrink-0" />
                <div>
                  <div className="text-sm font-black">Google Gemini AI 실시간 정밀 분석 중...</div>
                  <div className="text-[11px] font-normal text-[#2e5942] mt-0.5">
                    사진 속 물체와 실제 친환경 활동 맥락을 심사하고 있습니다.
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {analysisResult && !isVerifying && (
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  analysisResult.status === "APPROVED"
                    ? "bg-[#eaf5ed] border-[#9fd5ae]"
                    : analysisResult.status === "RETAKE_REQUIRED"
                    ? "bg-[#fff8e6] border-[#ffe082]"
                    : analysisResult.status === "MANUAL_REVIEW"
                    ? "bg-[#edf4ff] border-[#b6d4fe]"
                    : "bg-[#fdf2f2] border-[#f8b4b4]"
                }`}
              >
                <div className="flex items-start gap-2.5 mb-2">
                  {analysisResult.status === "APPROVED" && (
                    <CheckCircle2 className="w-6 h-6 text-[#176b48] shrink-0 mt-0.5" />
                  )}
                  {analysisResult.status === "RETAKE_REQUIRED" && (
                    <AlertTriangle className="w-6 h-6 text-[#d97706] shrink-0 mt-0.5" />
                  )}
                  {analysisResult.status === "MANUAL_REVIEW" && (
                    <Search className="w-6 h-6 text-[#2563eb] shrink-0 mt-0.5" />
                  )}
                  {analysisResult.status === "REJECTED" && (
                    <XCircle className="w-6 h-6 text-[#dc2626] shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black tracking-tight">
                        {analysisResult.status === "APPROVED" && "✅ 친환경 인증 승인 (포인트 적립)"}
                        {analysisResult.status === "RETAKE_REQUIRED" && "⚠️ 사진 재촬영 필요 (판독 불가)"}
                        {analysisResult.status === "MANUAL_REVIEW" && "🔍 관리자 검토 대기 (0P)"}
                        {analysisResult.status === "REJECTED" && "❌ 판독 불가 / 인증 기준 미달 (반려)"}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-black/10">
                        신뢰도 {Math.round(analysisResult.confidence * 100)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-black/5 text-[#2b3b2f]">
                        인식 활동: {analysisResult.activity || analysisResult.activityType || "미확인"}
                      </span>
                      {analysisResult.status !== "APPROVED" && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                          포인트 미지급 (0P)
                        </span>
                      )}
                    </div>

                    {/* Prominent warning notice when photo is not an approved tumbler/eco activity */}
                    {analysisResult.status === "REJECTED" && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-red-100/80 border border-red-300 text-red-800 text-xs font-bold flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <div>친환경 활동 인증 실패 경고</div>
                          <div className="text-[11px] font-normal text-red-700 mt-0.5">
                            {mission.title}과 무관하거나 일회용품인 사진은 포인트가 지급되지 않습니다. 올바른 텀블러 사진을 올려주세요.
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-[#202c24] mt-2 leading-relaxed font-medium">
                      {analysisResult.reason}
                    </p>

                    {analysisResult.detectedObjects && analysisResult.detectedObjects.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="text-[10px] text-[#556658]">식별 객체:</span>
                        {analysisResult.detectedObjects.map((obj, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.2 rounded bg-white/90 text-[#304235] border border-black/5"
                          >
                            {obj}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Guidance */}
                <div className="mt-3 pt-3 border-t border-black/10 flex items-center justify-between text-xs">
                  {analysisResult.status === "APPROVED" ? (
                    <>
                      <div className="font-extrabold text-[#176b48]">
                        +{mission.reward.toLocaleString()}P 적립 완료! 🎉
                      </div>
                      <button
                        onClick={() => onNavigate("points")}
                        className="px-3 py-1.5 rounded-xl bg-[#176b48] text-white text-xs font-bold hover:bg-[#12583a]"
                      >
                        포인트 내역 확인
                      </button>
                    </>
                  ) : analysisResult.status === "RETAKE_REQUIRED" ? (
                    <>
                      <div className="text-[#b45309] font-medium">
                        사진 품질로 인해 포인트가 지급되지 않았습니다.
                      </div>
                      <button
                        onClick={resetPhoto}
                        className="px-3 py-1.5 rounded-xl bg-[#d97706] text-white text-xs font-bold hover:bg-[#b45309]"
                      >
                        다시 촬영하기
                      </button>
                    </>
                  ) : analysisResult.status === "MANUAL_REVIEW" ? (
                    <>
                      <div className="text-[#1e40af] font-medium">
                        승인 전까지 포인트는 지급되지 않습니다.
                      </div>
                      <button
                        onClick={() => onNavigate("missions")}
                        className="px-3 py-1.5 rounded-xl bg-[#2563eb] text-white text-xs font-bold hover:bg-[#1d4ed8]"
                      >
                        미션 목록으로
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="text-[#dc2626] font-medium">
                        인증 기준 미달 (지급 포인트: 0P)
                      </div>
                      <button
                        onClick={resetPhoto}
                        className="px-3 py-1.5 rounded-xl bg-[#dc2626] text-white text-xs font-bold hover:bg-[#b91c1c]"
                      >
                        새 사진 등록
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
