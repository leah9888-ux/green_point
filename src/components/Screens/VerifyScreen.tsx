import React, { useState, useRef } from "react";
import { ScreenId, Mission, AIAnalysisResult, UserProfile } from "../../types";
import { ArrowLeft, Camera, CheckCircle2, AlertTriangle, XCircle, Search, RefreshCw } from "lucide-react";
import confetti from "canvas-confetti";


// 발표용 사진 인증: AI 서버 호출 없이 지정된 원본 이미지와 비교합니다.
const DEMO_IMAGES = [
  { missionId: "tumbler", url: "/demo-photos/tumbler.jpg", activity: "TUMBLER" },
  { missionId: "bike", url: "/demo-photos/bike.png", activity: "PUBLIC_BIKE" }
];

function imageSignature(source: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 24;
      canvas.height = 24;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return reject(new Error("이미지 분석을 시작할 수 없습니다."));
      ctx.drawImage(image, 0, 0, 24, 24);
      const pixels = ctx.getImageData(0, 0, 24, 24).data;
      const values: number[] = [];
      for (let i = 0; i < pixels.length; i += 4) {
        values.push(pixels[i], pixels[i + 1], pixels[i + 2]);
      }
      resolve(values);
    };
    image.onerror = () => reject(new Error("사진을 읽을 수 없습니다."));
    image.src = source;
  });
}

function imageDifference(a: number[], b: number[]): number {
  if (a.length !== b.length) return 1;
  let total = 0;
  for (let i = 0; i < a.length; i++) total += Math.abs(a[i] - b[i]);
  return total / (a.length * 255);
}

interface VerifyScreenProps {
  mission: Mission | null;
  user: UserProfile;
  onNavigate: (screen: ScreenId) => void;
  onPointsAwarded: (reward: number, co2Grams: number, title: string) => void;
}

export const VerifyScreen: React.FC<VerifyScreenProps> = ({
  mission,
  onNavigate,
  onPointsAwarded
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [grantedPoints, setGrantedPoints] = useState<number>(0);
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

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string;
      // Compress image for ultra-fast, reliable AI processing
      const optimizedDataUrl = await compressImage(rawDataUrl, 1000, 0.85);
      setPhotoUrl(optimizedDataUrl);
      setAnalysisResult(null);
      setGrantedPoints(0);
      setErrorMsg(null);
      startAIVerification(optimizedDataUrl);
    };
    reader.readAsDataURL(file);
  };

  const startAIVerification = async (base64Data: string) => {
    setIsVerifying(true);
    setAnalysisResult(null);
    setGrantedPoints(0);
    setErrorMsg(null);
    try {
      const uploaded = await imageSignature(base64Data);
      let matched: (typeof DEMO_IMAGES)[number] | undefined;
      for (const entry of DEMO_IMAGES) {
        if (entry.missionId !== mission.id) continue;
        const known = await imageSignature(entry.url);
        if (imageDifference(uploaded, known) < 0.055) {
          matched = entry;
          break;
        }
      }
      if (!matched) {
        setAnalysisResult({
          status: "REJECTED", activity: "UNKNOWN", confidence: 0,
          reason: "등록된 시연용 인증 사진과 일치하지 않습니다. 지정된 사진을 업로드해 주세요."
        });
        return;
      }
      // 발표 시연 전용: 반복 인증 허용 (실서비스에서는 중복 방지 필요).
      const result: AIAnalysisResult = {
        status: "APPROVED", activity: matched.activity, confidence: 1,
        reason: "사전 등록된 사진과 일치하여 사진 인증 시연에 성공했습니다."
      };
      setAnalysisResult(result);
      setGrantedPoints(mission.reward);
      onPointsAwarded(mission.reward, mission.co2SavedGrams, mission.title);
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 }, colors: ["#176b48", "#c8ed83", "#ffd700"] });
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "사진 인증 중 문제가 발생했습니다.");
    } finally {
      setIsVerifying(false);
    }
  };

  const resetPhoto = () => {
    setPhotoUrl(null);
    setAnalysisResult(null);
    setGrantedPoints(0);
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
                카메라 촬영 또는 갤러리에서 사진 업로드 (등록된 사진과 일치하는지 확인합니다)
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

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
                  <div className="text-sm font-black">등록된 사진과 비교하는 중...</div>
                  <div className="text-[11px] font-normal text-[#2e5942] mt-0.5">
                    시연용으로 지정된 사진인지 확인하고 있습니다.
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
                        {analysisResult.status === "REJECTED" && "❌ 사진 인증 실패 (반려)"}
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
                          <div>사진 인증 실패 안내</div>
                          <div className="text-[11px] font-normal text-red-700 mt-0.5">
                            {mission.title}과 무관하거나 일회용품인 사진은 포인트가 지급되지 않습니다. 등록된 시연용 사진을 올려주세요.
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
                        +{grantedPoints.toLocaleString()}P 적립 완료! 🎉
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
