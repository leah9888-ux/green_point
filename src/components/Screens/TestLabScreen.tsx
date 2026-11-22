import React, { useState } from "react";
import { ScreenId, VerificationStatus, AIAnalysisResult } from "../../types";
import { ArrowLeft, Play, FlaskConical, CheckCircle2, XCircle, AlertTriangle, Search, RefreshCw } from "lucide-react";
import { API_BASE_URL } from "../../firebase";

interface TestCase {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  expectedStatus: VerificationStatus;
  expectedReason: string;
}

const PRESET_TEST_CASES: TestCase[] = [
  {
    id: "test-tumbler-ok",
    name: "정상 텀블러 사용 (승인)",
    category: "텀블러",
    description: "카페 및 일상 공간에서 개인 다회용 텀블러 음료 주문 장면",
    imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80",
    expectedStatus: "APPROVED",
    expectedReason: "개인 다회용 텀블러 및 음료 사용 맥락 확인"
  },
  {
    id: "test-disposable-plastic",
    name: "일회용 플라스틱 컵 (반려)",
    category: "일회용품",
    description: "일회용 플라스틱 테이크아웃 잔 사진 (친환경 활동 위반)",
    imageUrl: "https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=500&auto=format&fit=crop&q=80",
    expectedStatus: "REJECTED",
    expectedReason: "일회용 플라스틱 용기는 친환경 적립 대상 제외"
  },
  {
    id: "test-blurry",
    name: "흐릿하고 어두운 사진 (재촬영)",
    category: "품질 미달",
    description: "심하게 흔들리거나 어두워 물체 식별이 어려운 사진",
    imageUrl: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=500&auto=format&fit=crop&q=80",
    expectedStatus: "RETAKE_REQUIRED",
    expectedReason: "초점 불량 및 저조도로 판독 불가, 재촬영 안내"
  },
  {
    id: "test-bike-ok",
    name: "따릉이 공공자전거 이용 (승인)",
    category: "친환경 이동",
    description: "서울 따릉이 자전거 대여소 및 핸들 바구니 식별 사진",
    imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format&fit=crop&q=80",
    expectedStatus: "APPROVED",
    expectedReason: "공공자전거 및 이동 친환경 실천 확인"
  },
  {
    id: "test-ambiguous",
    name: "애매한 각도/보온병 (관리자 검토)",
    category: "경계 케이스",
    description: "물체 일부만 나오거나 배경 맥락이 불분명한 경우",
    imageUrl: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&auto=format&fit=crop&q=80",
    expectedStatus: "MANUAL_REVIEW",
    expectedReason: "신뢰도 0.60~0.84 구간, 자동 승인 방지 및 관리자 이관"
  }
];

interface TestResultItem {
  testId: string;
  actualStatus: VerificationStatus;
  confidence: number;
  reason: string;
  isMatch: boolean;
  timeMs: number;
}

interface TestLabScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const TestLabScreen: React.FC<TestLabScreenProps> = ({ onNavigate }) => {
  const [runningTestId, setRunningTestId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, TestResultItem>>({});
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);

  const runSingleTest = async (testCase: TestCase) => {
    setRunningTestId(testCase.id);
    const start = performance.now();

    try {
      // 1. Fetch the image and convert to Base64
      const imgRes = await fetch(testCase.imageUrl);
      const blob = await imgRes.blob();
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      // 2. Call backend Gemini AI endpoint
      const res = await fetch(`${API_BASE_URL}/api/analyze-photo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: blob.type || "image/jpeg",
          missionId: testCase.id,
          missionTitle: testCase.name,
          expectedReward: 500
        })
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          res.status === 404
            ? "정적 호스팅(GitHub Pages)에서는 별도 Gemini 백엔드 서버(VITE_API_BASE_URL) 연결이 필요합니다."
            : "서버가 유효한 JSON 응답을 반환하지 않았습니다."
        );
      }

      const data: AIAnalysisResult = await res.json();
      const timeMs = Math.round(performance.now() - start);

      const isMatch =
        data.status === testCase.expectedStatus ||
        (testCase.expectedStatus === "REJECTED" && (data.status === "REJECTED" || data.status === "MANUAL_REVIEW")) ||
        (testCase.expectedStatus === "MANUAL_REVIEW" && (data.status === "MANUAL_REVIEW" || data.status === "RETAKE_REQUIRED"));

      setResults((prev) => ({
        ...prev,
        [testCase.id]: {
          testId: testCase.id,
          actualStatus: data.status,
          confidence: data.confidence,
          reason: data.reason,
          isMatch: Boolean(isMatch),
          timeMs
        }
      }));
    } catch (e: any) {
      setResults((prev) => ({
        ...prev,
        [testCase.id]: {
          testId: testCase.id,
          actualStatus: "MANUAL_REVIEW",
          confidence: 0,
          reason: `실행 실패: ${e?.message || "네트워크 오류"}`,
          isMatch: false,
          timeMs: Math.round(performance.now() - start)
        }
      }));
    } finally {
      setRunningTestId(null);
    }
  };

  const runAllTests = async () => {
    setIsRunningAll(true);
    for (const testCase of PRESET_TEST_CASES) {
      await runSingleTest(testCase);
    }
    setIsRunningAll(false);
  };

  const totalTested = Object.keys(results).length;
  const matchCount = Object.values(results).filter((r) => r.isMatch).length;
  const passRate = totalTested > 0 ? Math.round((matchCount / totalTested) * 100) : 0;

  return (
    <div className="px-5 py-4 pb-24 animate-in fade-in duration-300">
      <button
        onClick={() => onNavigate("profile")}
        className="flex items-center gap-1.5 text-xs text-[#7a857d] hover:text-[#202c24] mb-3 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>마이페이지로 돌아가기</span>
      </button>

      {/* Screen Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <FlaskConical className="w-5 h-5 text-[#176b48]" />
            <h1 className="text-xl font-black text-[#202c24] tracking-tight">
              Gemini AI 판독 테스트 랩
            </h1>
          </div>
          <p className="text-xs text-[#7a857d] mt-0.5">
            정상·부정·품질미달 등 5대 시나리오 정답표(Ground Truth) 비교 검증
          </p>
        </div>
      </div>

      {/* Accuracy KPI Card */}
      <div className="rounded-2xl bg-white p-4 border border-[#e5ebe2] shadow-xs mb-4 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-[#7a857d] font-bold block">검증 완료율 및 일치도</span>
          <div className="text-lg font-black text-[#176b48] mt-0.5">
            {totalTested}건 테스트 중 {matchCount}건 일치 ({passRate}%)
          </div>
        </div>
        <button
          onClick={runAllTests}
          disabled={isRunningAll || runningTestId !== null}
          className="px-3.5 py-2 rounded-xl bg-[#176b48] hover:bg-[#12583a] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          {isRunningAll ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>전체 실행 중...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>5종 시나리오 전체 검증</span>
            </>
          )}
        </button>
      </div>

      {/* Test Scenarios List */}
      <div className="flex flex-col gap-3">
        {PRESET_TEST_CASES.map((tc) => {
          const res = results[tc.id];
          const isRunning = runningTestId === tc.id;

          return (
            <div
              key={tc.id}
              className="rounded-2xl bg-white p-4 border border-[#e5ebe2] shadow-xs hover:border-[#176b48] transition-all"
            >
              <div className="flex items-start gap-3">
                <img
                  src={tc.imageUrl}
                  alt={tc.name}
                  className="w-16 h-16 rounded-xl object-cover border border-[#e0e7de] shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#202c24] truncate">
                      {tc.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f2f6f1] text-[#4b5c4f] border border-[#dce5db]">
                      기대: {tc.expectedStatus}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#6b7b70] mt-0.5 leading-relaxed">
                    {tc.description}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between">
                    <button
                      onClick={() => runSingleTest(tc)}
                      disabled={isRunning || isRunningAll}
                      className="px-2.5 py-1.5 rounded-lg bg-[#eaf5ed] hover:bg-[#d5eedb] text-[#176b48] text-[11px] font-bold transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      {isRunning ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Gemini 판독 중...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>단독 판독 실행</span>
                        </>
                      )}
                    </button>

                    {res && (
                      <span
                        className={`text-[11px] font-bold flex items-center gap-1 ${
                          res.isMatch ? "text-[#176b48]" : "text-amber-600"
                        }`}
                      >
                        {res.isMatch ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                        <span>
                          판정: {res.actualStatus} ({Math.round(res.confidence * 100)}% / {res.timeMs}ms)
                        </span>
                      </span>
                    )}
                  </div>

                  {res && (
                    <div className="mt-2 text-[10px] bg-[#f8faf7] p-2 rounded-lg border border-[#e5ebe2] text-[#405044]">
                      <strong>Gemini 판단 사유:</strong> {res.reason}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
