import React, { useState, useEffect } from "react";
import { ScreenId, VerificationRecord } from "../../types";
import { ArrowLeft, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Search, Filter, RefreshCw, MessageSquare } from "lucide-react";
import { fetchAllVerifications, updateVerificationAdminReview } from "../../firebase";

interface AdminScreenProps {
  onNavigate: (screen: ScreenId) => void;
  adminEmail?: string;
  onGrantUserPoints?: (userId: string, points: number, title: string) => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  onNavigate,
  adminEmail = "admin@sports.kr",
  onGrantUserPoints
}) => {
  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [filter, setFilter] = useState<"ALL" | "MANUAL_REVIEW" | "APPROVED" | "REJECTED" | "RETAKE_REQUIRED">("MANUAL_REVIEW");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedRecord, setSelectedRecord] = useState<VerificationRecord | null>(null);
  const [adminNote, setAdminNote] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const fetched = await fetchAllVerifications();
      if (fetched && fetched.length > 0) {
        setRecords(fetched);
      } else {
        // Sample demonstration records for review if none in DB yet
        setRecords([
          {
            id: "verify-demo-101",
            photoId: "photo-101",
            userId: "user-green-1",
            userEmail: "fan@sports.kr",
            userName: "축구팬 민수",
            missionId: "mission-tumbler",
            missionTitle: "경기장 텀블러 직관 인증",
            photoUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80",
            photoHash: "hash-demo-101",
            status: "MANUAL_REVIEW",
            pointsAwarded: 0,
            createdAt: new Date().toISOString(),
            analysis: {
              status: "MANUAL_REVIEW",
              activityType: "tumbler",
              confidence: 0.72,
              reason: "보온병 형태의 텀블러가 부분적으로 포착되었으나 카페 내부 배경인지 경기장 관중석인지 맥락 구분이 모호하여 관리자 확인이 필요합니다.",
              detectedObjects: ["텀블러", "음료 잔", "실내 조명"],
              sceneContext: "카페 또는 라운지 테이블 위",
              suggestedPoints: 0
            }
          },
          {
            id: "verify-demo-102",
            photoId: "photo-102",
            userId: "user-green-2",
            userEmail: "rider@sports.kr",
            userName: "자전거 출퇴근러",
            missionId: "mission-bike",
            missionTitle: "따릉이 타고 경기장 가기",
            photoUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80",
            photoHash: "hash-demo-102",
            status: "APPROVED",
            pointsAwarded: 800,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            analysis: {
              status: "APPROVED",
              activityType: "public_bike",
              confidence: 0.94,
              reason: "공공자전거 대여소 및 핸들 바구니 식별 완료. 신뢰도 94%로 친환경 이동 활동 승인.",
              detectedObjects: ["자전거 바구니", "대여소 거치대", "안장"],
              sceneContext: "야외 자전거 전용 도로 및 거치대",
              suggestedPoints: 800
            }
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleAdminDecision = async (decision: "APPROVED" | "REJECTED") => {
    if (!selectedRecord) return;
    setIsProcessing(true);
    const rewardPoints = decision === "APPROVED" ? (selectedRecord.analysis.suggestedPoints || 500) : 0;

    try {
      await updateVerificationAdminReview(
        selectedRecord.id,
        selectedRecord.userId,
        decision,
        adminNote || (decision === "APPROVED" ? "관리자 수동 검토 완료: 친환경 활동 정상 승인" : "관리자 수동 검토: 인증 규정 미충족 반려"),
        rewardPoints
      );

      // Update local state
      setRecords((prev) =>
        prev.map((rec) =>
          rec.id === selectedRecord.id
            ? {
                ...rec,
                status: decision,
                pointsAwarded: rewardPoints,
                reviewedBy: adminEmail,
                reviewedAt: new Date().toISOString(),
                adminNote: adminNote || (decision === "APPROVED" ? "수동 승인됨" : "반려됨")
              }
            : rec
        )
      );

      if (decision === "APPROVED" && onGrantUserPoints) {
        onGrantUserPoints(selectedRecord.userId, rewardPoints, `관리자 승인: ${selectedRecord.missionTitle}`);
      }

      setSelectedRecord(null);
      setAdminNote("");
    } catch (e) {
      console.error(e);
      alert("관리자 처리 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRecords = records.filter((r) => {
    if (filter === "ALL") return true;
    return r.status === filter;
  });

  return (
    <div className="px-5 py-4 pb-24 animate-in fade-in duration-300">
      <button
        onClick={() => onNavigate("profile")}
        className="flex items-center gap-1.5 text-xs text-[#7a857d] hover:text-[#202c24] mb-3 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>마이페이지로 돌아가기</span>
      </button>

      {/* Admin Screen Title Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-[#176b48]" />
            <h1 className="text-xl font-black text-[#202c24] tracking-tight">
              AI 판독 관리자 센터
            </h1>
          </div>
          <p className="text-xs text-[#7a857d] mt-0.5">
            Gemini 심사 대기열(MANUAL_REVIEW) 및 판독 로그 관리
          </p>
        </div>
        <button
          onClick={loadRecords}
          className="p-2 rounded-xl bg-white border border-[#dce5db] hover:bg-[#f2f7f1] text-[#176b48] text-xs font-bold transition-colors flex items-center gap-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>새로고침</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
        {(["MANUAL_REVIEW", "ALL", "APPROVED", "RETAKE_REQUIRED", "REJECTED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === tab
                ? "bg-[#176b48] text-white shadow-xs"
                : "bg-white text-[#526356] border border-[#dce5db] hover:bg-[#f6faf5]"
            }`}
          >
            {tab === "MANUAL_REVIEW" && "🔍 관리자 검토 대기"}
            {tab === "ALL" && "전체 로그"}
            {tab === "APPROVED" && "✅ 승인됨"}
            {tab === "RETAKE_REQUIRED" && "⚠️ 재촬영 요청"}
            {tab === "REJECTED" && "❌ 반려됨"}
          </button>
        ))}
      </div>

      {/* Records List */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-[#7a857d] flex flex-col items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-[#176b48]" />
          <span>인증 판독 데이터를 불러오는 중...</span>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-[#e5ebe2] p-6 text-xs text-[#7a857d]">
          <p className="text-sm font-bold text-[#202c24] mb-1">해당 상태의 판독 건이 없습니다.</p>
          <p>모든 인증 사진이 적절히 처리되었거나 새로운 업로드를 기다리고 있습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-2xl border border-[#e5ebe2] p-4 shadow-xs hover:border-[#176b48] transition-all"
            >
              <div className="flex items-start gap-3">
                <img
                  src={record.photoUrl}
                  alt={record.missionTitle}
                  className="w-16 h-16 rounded-xl object-cover border border-[#e5ebe2] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#202c24] truncate">
                      {record.missionTitle}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        record.status === "APPROVED"
                          ? "bg-[#eaf5ed] text-[#176b48]"
                          : record.status === "MANUAL_REVIEW"
                          ? "bg-blue-50 text-blue-700 border border-blue-200 animate-pulse"
                          : record.status === "RETAKE_REQUIRED"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {record.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#7a857d] mt-0.5">
                    작성자: {record.userName || record.userEmail} · {new Date(record.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                  </p>

                  <div className="mt-2 text-xs text-[#3d4d42] bg-[#f7faf6] p-2 rounded-lg border border-[#e8efe6]">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#176b48] mb-1">
                      <span>Gemini 분석 사유:</span>
                      <span>신뢰도 {Math.round((record.analysis?.confidence || 0) * 100)}%</span>
                    </div>
                    <p className="line-clamp-2 leading-relaxed text-[11px]">
                      {record.analysis?.reason || "분석 사유 없음"}
                    </p>
                  </div>

                  {record.status === "MANUAL_REVIEW" && (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="flex-1 py-1.5 rounded-xl bg-[#176b48] text-white text-xs font-bold hover:bg-[#12583a] transition-colors"
                      >
                        상세 심사 및 포인트 지급
                      </button>
                    </div>
                  )}

                  {record.reviewedBy && (
                    <div className="mt-2 text-[10px] text-[#6b7b70] bg-[#edf3ee] px-2 py-1 rounded-md">
                      검토자: {record.reviewedBy} ({record.adminNote})
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal Dialog */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 border border-[#e2e8df] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5ece2]">
              <h2 className="text-base font-black text-[#202c24] flex items-center gap-1.5">
                <Search className="w-4 h-4 text-[#176b48]" />
                <span>관리자 수동 심사</span>
              </h2>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-xs text-[#7a857d] hover:text-black font-bold p-1"
              >
                닫기 ✕
              </button>
            </div>

            <div className="mt-3">
              <img
                src={selectedRecord.photoUrl}
                alt="검토 대상 사진"
                className="w-full h-52 object-cover rounded-2xl border border-[#d9e5d7]"
              />
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#f0f4ee]">
                <span className="text-[#7a857d]">미션 항목</span>
                <span className="font-bold text-[#202c24]">{selectedRecord.missionTitle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f0f4ee]">
                <span className="text-[#7a857d]">제출자 계정</span>
                <span className="font-bold text-[#202c24]">{selectedRecord.userEmail}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f0f4ee]">
                <span className="text-[#7a857d]">AI 신뢰도</span>
                <span className="font-bold text-[#176b48]">
                  {Math.round((selectedRecord.analysis?.confidence || 0) * 100)}%
                </span>
              </div>
              <div className="p-2.5 bg-[#f6f9f5] rounded-xl border border-[#e0e9df]">
                <strong className="text-[11px] text-[#176b48] block mb-0.5">Gemini AI 소견:</strong>
                <p className="text-[#3c4c41] leading-relaxed text-[11px]">
                  {selectedRecord.analysis?.reason}
                </p>
              </div>
            </div>

            {/* Admin Note Input */}
            <div className="mt-3.5">
              <label className="text-xs font-bold text-[#202c24] block mb-1">
                관리자 심사 의견 기록:
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="예: 텀블러 로고 및 경기장 배경 확인되어 정상 승인 처리함"
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl border border-[#cfded0] focus:outline-none focus:border-[#176b48] resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                disabled={isProcessing}
                onClick={() => handleAdminDecision("REJECTED")}
                className="py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs border border-red-200 transition-colors flex items-center justify-center gap-1"
              >
                <XCircle className="w-4 h-4" />
                <span>심사 반려 (0P)</span>
              </button>
              <button
                disabled={isProcessing}
                onClick={() => handleAdminDecision("APPROVED")}
                className="py-2.5 rounded-xl bg-[#176b48] hover:bg-[#12583a] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>승인 및 +500P 지급</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
