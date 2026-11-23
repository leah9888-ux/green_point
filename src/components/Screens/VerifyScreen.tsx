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

    setMimeType("image/jpeg");
    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string;
      // Compress image for ultra-fast, reliable AI processing
      const optimizedDataUrl = await compressImage(rawDataUrl, 1000, 0.85);
      setPhotoUrl(optimizedDataUrl);
      setAnalysisResult(null);
      setGrantedPoints(0);
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
