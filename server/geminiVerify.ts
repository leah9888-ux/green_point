import crypto from "crypto";
import { GoogleGenAI, Type } from "@google/genai";

export type VerificationStatus =
  | "APPROVED"
  | "REJECTED"
  | "RETAKE_REQUIRED"
  | "MANUAL_REVIEW";

export type EcoActivityCode =
  | "TUMBLER"
  | "REUSABLE_CONTAINER"
  | "PUBLIC_BIKE"
  | "PERSONAL_BIKE"
  | "WALKING"
  | "PLOGGING"
  | "PUBLIC_TRANSIT"
  | "UNKNOWN";

export interface MissionRule {
  id: string;
  title: string;
  reward: number;
  co2SavedGrams: number;
  allowedActivities: EcoActivityCode[];
}

export const MISSION_CATALOG: Record<string, MissionRule> = {
  tumbler: {
    id: "tumbler",
    title: "텀블러 사용하기",
    reward: 500,
    co2SavedGrams: 52,
    allowedActivities: ["TUMBLER"]
  },
  bike: {
    id: "bike",
    title: "친환경 자전거 타기",
    reward: 700,
    co2SavedGrams: 140,
    allowedActivities: ["PUBLIC_BIKE", "PERSONAL_BIKE"]
  },
  stadium: {
    id: "stadium",
    title: "경기장 다회용기 사용",
    reward: 1000,
    co2SavedGrams: 210,
    allowedActivities: ["REUSABLE_CONTAINER"]
  },
  walk: {
    id: "walk",
    title: "경기장 걸어서 가기 (5,000보)",
    reward: 300,
    co2SavedGrams: 85,
    allowedActivities: ["WALKING"]
  },
  plogging: {
    id: "plogging",
    title: "경기 후 클린 관중석 플로깅",
    reward: 1200,
    co2SavedGrams: 320,
    allowedActivities: ["PLOGGING", "REUSABLE_CONTAINER"]
  },
  subway: {
    id: "subway",
    title: "대중교통 직관 인증",
    reward: 600,
    co2SavedGrams: 110,
    allowedActivities: ["PUBLIC_TRANSIT"]
  },
  // Preset test cases in TestLabScreen
  "test-tumbler-ok": {
    id: "test-tumbler-ok",
    title: "정상 텀블러 사용 (승인)",
    reward: 500,
    co2SavedGrams: 52,
    allowedActivities: ["TUMBLER"]
  },
  "test-disposable-plastic": {
    id: "test-disposable-plastic",
    title: "일회용 플라스틱 컵 (반려)",
    reward: 500,
    co2SavedGrams: 52,
    allowedActivities: ["TUMBLER"]
  },
  "test-blurry": {
    id: "test-blurry",
    title: "흐릿하고 어두운 사진 (재촬영)",
    reward: 500,
    co2SavedGrams: 52,
    allowedActivities: ["TUMBLER"]
  },
  "test-bike-ok": {
    id: "test-bike-ok",
    title: "따릉이 공공자전거 이용 (승인)",
    reward: 700,
    co2SavedGrams: 140,
    allowedActivities: ["PUBLIC_BIKE", "PERSONAL_BIKE"]
  },
  "test-ambiguous": {
    id: "test-ambiguous",
    title: "애매한 각도/보온병 (관리자 검토)",
    reward: 500,
    co2SavedGrams: 52,
    allowedActivities: ["TUMBLER"]
  }
};

export interface AnalyzePhotoPayload {
  imageBase64?: string;
  mimeType?: string;
  missionId?: string;
  missionTitle?: string;
  expectedReward?: number;
  uid?: string;
}

export interface AnalyzePhotoResponse {
  status: VerificationStatus;
  activity: EcoActivityCode;
  activityType: string;
  confidence: number;
  reason: string;
  suggestedPoints: number;
  co2SavedGrams?: number;
  photoHash?: string;
  isDuplicate?: boolean;
  approvalToken?: string;
}

const VALID_STATUSES: VerificationStatus[] = [
  "APPROVED",
  "REJECTED",
  "RETAKE_REQUIRED",
  "MANUAL_REVIEW"
];

const VALID_ACTIVITIES: EcoActivityCode[] = [
  "TUMBLER",
  "REUSABLE_CONTAINER",
  "PUBLIC_BIKE",
  "PERSONAL_BIKE",
  "WALKING",
  "PLOGGING",
  "PUBLIC_TRANSIT",
  "UNKNOWN"
];

const SUPPORTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif"
]);

const DEFAULT_ALLOWED_ORIGINS = [
  "https://leah9888-ux.github.io",
  "http://localhost:3000",
  "http://localhost:5173"
];

// Cache of approved photo hashes to prevent duplicate submissions in a server instance
export const approvedPhotoHashes = new Set<string>();

// Runtime fallback signing secret so tokens work even when VERIFICATION_SECRET is not explicitly configured
const RUNTIME_SIGNING_SECRET = crypto.randomBytes(32);

function getSigningKey(): Buffer {
  const configured = process.env.VERIFICATION_SECRET || process.env.GEMINI_API_KEY;
  if (configured && configured !== "MY_GEMINI_API_KEY") {
    return crypto.createHash("sha256").update(`gp-verify:${configured}`).digest();
  }
  return RUNTIME_SIGNING_SECRET;
}

export function resolveAllowedOrigin(requestOrigin?: string): string | null {
  if (!requestOrigin) return null;
  const envList = (process.env.ALLOWED_ORIGIN || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (envList.includes("*")) return requestOrigin;
  const allowlist = new Set([...DEFAULT_ALLOWED_ORIGINS, ...envList]);
  if (allowlist.has(requestOrigin)) {
    return requestOrigin;
  }
  // Allow preview Run/Vercel origins if hosted on same platform
  try {
    const parsed = new URL(requestOrigin);
    if (parsed.hostname.endsWith(".run.app") || parsed.hostname.endsWith(".vercel.app")) {
      return requestOrigin;
    }
  } catch {
    return null;
  }
  return null;
}

export function createApprovalToken(data: {
  photoHash: string;
  missionId: string;
  reward: number;
  co2SavedGrams: number;
  uid?: string;
}): string {
  const payload = {
    photoHash: data.photoHash,
    missionId: data.missionId,
    reward: data.reward,
    co2SavedGrams: data.co2SavedGrams,
    uid: data.uid || "guest",
    exp: Date.now() + 5 * 60 * 1000 // 5 minutes validity
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSigningKey())
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyApprovalToken(
  token: string,
  expectedPhotoHash?: string,
  expectedUid?: string
): { valid: boolean; payload?: { photoHash: string; missionId: string; reward: number; co2SavedGrams: number; uid: string; exp: number } } {
  if (!token || typeof token !== "string") return { valid: false };
  const parts = token.split(".");
  if (parts.length !== 2) return { valid: false };
  const [encoded, sig] = parts;
  const expectedSig = crypto
    .createHmac("sha256", getSigningKey())
    .update(encoded)
    .digest("base64url");
  if (sig.length !== expectedSig.length) return { valid: false };
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
    return { valid: false };
  }
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!payload.exp || Date.now() > payload.exp) return { valid: false };
    if (expectedPhotoHash && payload.photoHash !== expectedPhotoHash) return { valid: false };
    if (expectedUid && payload.uid !== "guest" && payload.uid !== expectedUid) return { valid: false };
    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

const verificationResponseSchema = {
  type: Type.OBJECT,
  properties: {
    status: {
      type: Type.STRING,
      enum: ["APPROVED", "REJECTED", "RETAKE_REQUIRED", "MANUAL_REVIEW"],
      description:
        "Verification status strictly one of: APPROVED, RETAKE_REQUIRED, REJECTED, MANUAL_REVIEW"
    },
    activity: {
      type: Type.STRING,
      enum: [
        "TUMBLER",
        "REUSABLE_CONTAINER",
        "PUBLIC_BIKE",
        "PERSONAL_BIKE",
        "WALKING",
        "PLOGGING",
        "PUBLIC_TRANSIT",
        "UNKNOWN"
      ],
      description:
        "Detected activity strictly: TUMBLER, REUSABLE_CONTAINER, PUBLIC_BIKE, PERSONAL_BIKE, WALKING, PLOGGING, PUBLIC_TRANSIT, or UNKNOWN"
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence score between 0.0 and 1.0 (e.g. 0.95)"
    },
    reason: {
      type: Type.STRING,
      description: "Clear and user-friendly Korean explanation of the verification judgment"
    }
  },
  required: ["status", "activity", "confidence", "reason"]
};

function extractBase64AndMime(
  rawInput: string,
  providedMime?: string
): { cleanBase64: string; resolvedMimeType: string } {
  let cleanBase64 = rawInput.trim();
  let detectedMime = (providedMime || "").trim().toLowerCase();

  if (cleanBase64.startsWith("data:")) {
    const commaIdx = cleanBase64.indexOf(",");
    if (commaIdx !== -1) {
      const header = cleanBase64.slice(5, commaIdx);
      const mimePart = header.split(";")[0]?.trim().toLowerCase();
      if (mimePart) {
        detectedMime = mimePart;
      }
      cleanBase64 = cleanBase64.slice(commaIdx + 1).trim();
    }
  }

  if (detectedMime === "image/jpg") {
    detectedMime = "image/jpeg";
  }

  const resolvedMimeType = SUPPORTED_MIME_TYPES.has(detectedMime)
    ? detectedMime
    : "image/jpeg";

  return { cleanBase64, resolvedMimeType };
}

export async function analyzeEcoPhoto(
  payload: AnalyzePhotoPayload
): Promise<{ statusCode: number; body: AnalyzePhotoResponse }> {
  const { imageBase64, mimeType, missionId = "tumbler", missionTitle, uid } = payload;

  if (!imageBase64 || typeof imageBase64 !== "string") {
    return {
      statusCode: 400,
      body: {
        status: "REJECTED",
        activity: "UNKNOWN",
        activityType: "unknown",
        confidence: 0,
        reason: "사진 파일이 서버로 전송되지 않았습니다. 사진을 선택해 주세요.",
        suggestedPoints: 0
      }
    };
  }

  const { cleanBase64, resolvedMimeType } = extractBase64AndMime(imageBase64, mimeType);

  if (!cleanBase64 || cleanBase64.length < 50) {
    return {
      statusCode: 400,
      body: {
        status: "RETAKE_REQUIRED",
        activity: "UNKNOWN",
        activityType: "unknown",
        confidence: 0,
        reason: "유효하지 않은 이미지 데이터입니다. 다시 촬영해 주세요.",
        suggestedPoints: 0
      }
    };
  }

  const photoHash = crypto.createHash("sha256").update(cleanBase64).digest("hex");

  if (approvedPhotoHashes.has(photoHash)) {
    return {
      statusCode: 200,
      body: {
        status: "REJECTED",
        activity: "UNKNOWN",
        activityType: "duplicate",
        confidence: 1.0,
        reason:
          "이미 이전에 인증되어 포인트가 지급된 중복 사진입니다. 새로운 친환경 활동 사진을 업로드해 주세요.",
        suggestedPoints: 0,
        isDuplicate: true,
        photoHash
      }
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return {
      statusCode: 500,
      body: {
        status: "MANUAL_REVIEW",
        activity: "UNKNOWN",
        activityType: "error",
        confidence: 0,
        reason:
          "서버에 GEMINI_API_KEY 환경 변수가 설정되지 않아 AI 판독을 실행할 수 없습니다. 서버 환경 설정에서 API 키를 등록해 주세요.",
        suggestedPoints: 0,
        photoHash
      }
    };
  }

  const missionRule = MISSION_CATALOG[missionId];
  const resolvedTitle = missionRule?.title || missionTitle || missionId;
  const expectedActivitiesText = missionRule
    ? missionRule.allowedActivities.join(", ")
    : "선택된 미션에 해당하는 친환경 활동";

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });

  const systemPrompt = `당신은 친환경 스포츠 리워드 플랫폼 'GREEN POINT'의 엄격하고 공정한 친환경 활동 판독 AI 심사관입니다.
사용자가 선택한 미션은 [${resolvedTitle}] (허용 활동 코드: ${expectedActivitiesText}) 입니다.
제출된 사진을 엄격히 분석하여, 실제로 촬영된 활동 코드(activity)를 판별하고, 사용자가 선택한 미션과 일치하는 경우에만 APPROVED 처리하세요.

[판독 활동 코드 정의]
1. TUMBLER (개인 텀블러 사용):
   - 개인 다회용 텀블러, 보온병, 다회용 워터보틀 사용 장면.
   - 일회용 플라스틱 컵, 일회용 테이크아웃 종이컵, 일회용 빨대/홀더만 있는 경우는 즉시 REJECTED 처리하세요.
2. REUSABLE_CONTAINER (경기장/매장 다회용기 사용):
   - 스포츠 경기장이나 매장의 다회용 컵, 다회용 식기, 다회용기 반납 스테이션 사진.
3. PUBLIC_BIKE (따릉이/공공자전거 이용):
   - 공공자전거(따릉이 등) 대여소, 잠금해제, 주행 핸들/차체 사진.
4. PERSONAL_BIKE (개인 자전거 이용):
   - 개인 자전거, 자전거 도로, 헬멧/거치대 등 친환경 이동 인증 사진.
5. WALKING (걷기 활동):
   - 스마트워치/만보기 앱의 당일 걸음수(5,000보 이상) 화면 캡처, 또는 산책로 보행 인증 사진.
6. PLOGGING (클린 관중석/플로깅):
   - 경기장 관중석 쓰레기 정리, 분리수거 봉투, 분리수거 배출 현장 사진.
7. PUBLIC_TRANSIT (대중교통 직관 인증):
   - 지하철 개찰구, 지하철/버스 승하차, 교통카드 태그 인증 사진.
8. UNKNOWN (무관한 사진):
   - 강아지, 고양이, 풍경, 일반 음식, 가구, 일회용품 등 친환경 미션과 무관한 사진.

[엄격 판정 규칙]
- APPROVED:
  * 사진 속 활동이 실제 친환경 활동이며, 사용자가 선택한 미션 [${resolvedTitle}] (${expectedActivitiesText})과 일치할 때만 APPROVED 처리하세요.
- REJECTED:
  * 일회용 플라스틱/종이컵이거나, 강아지/풍경 등 무관한 사진이거나, **다른 친환경 활동이더라도 사용자가 선택한 미션 [${resolvedTitle}]과 일치하지 않는 사진**이면 반드시 REJECTED 처리하고 불일치 사유를 한국어로 설명하세요.
- RETAKE_REQUIRED:
  * 사진이 너무 어둡거나 심하게 흔들려 피사체 식별이 불가능한 경우.
- MANUAL_REVIEW:
  * 텀블러/다회용기/일회용 컵 여부가 경계선상에 있어 육안 확인이 추가로 필요한 예외적인 경우.`;

  const candidateModels = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash"
  ];

  let lastError: any = null;
  let responseText: string | undefined;

  for (const model of candidateModels) {
    try {
      const callPromise = ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: resolvedMimeType,
                  data: cleanBase64
                }
              },
              {
                text: `사용자가 선택한 미션: [${resolvedTitle}] (코드: ${missionId}). 이 사진이 선택한 미션에 부합하는지 엄격히 판독해 주세요.`
              }
            ]
          }
        ],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: verificationResponseSchema
        }
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`${model} request timed out`)), 8000)
      );

      const response = await Promise.race([callPromise, timeoutPromise]);

      if (response && response.text) {
        responseText = response.text;
        break;
      }
    } catch (err: any) {
      console.warn(`[Gemini Analysis] Model ${model} failed:`, err?.status, err?.message);
      lastError = err;
    }
  }

  if (!responseText) {
    return {
      statusCode: 502,
      body: {
        status: "MANUAL_REVIEW",
        activity: "UNKNOWN",
        activityType: "error",
        confidence: 0,
        reason: `AI 판독 서비스 연결 중 일시적 오류가 발생했습니다 (${lastError?.message || "서버 통신 실패"}). 관리자 검토 대기열로 접수되었습니다.`,
        suggestedPoints: 0,
        photoHash
      }
    };
  }

  let parsedRaw: any;
  try {
    const json = JSON.parse(responseText);
    parsedRaw = Array.isArray(json) ? json[0] : json;
  } catch {
    return {
      statusCode: 200,
      body: {
        status: "MANUAL_REVIEW",
        activity: "UNKNOWN",
        activityType: "unknown",
        confidence: 0.5,
        reason:
          "AI 판독 응답 형식을 해석하는 중 오류가 발생하여 관리자 검토 대기열로 접수되었습니다.",
        suggestedPoints: 0,
        photoHash
      }
    };
  }

  let normalizedStatus: VerificationStatus = VALID_STATUSES.includes(parsedRaw?.status)
    ? parsedRaw.status
    : "MANUAL_REVIEW";

  const normalizedActivity: EcoActivityCode = VALID_ACTIVITIES.includes(parsedRaw?.activity)
    ? parsedRaw.activity
    : "UNKNOWN";

  const rawConf = Number(parsedRaw?.confidence);
  const normalizedConfidence = Number.isFinite(rawConf)
    ? Math.max(0, Math.min(1, rawConf))
    : 0.5;

  let reason =
    typeof parsedRaw?.reason === "string" && parsedRaw.reason.trim().length > 0
      ? parsedRaw.reason.trim()
      : "AI 판독 사유가 제공되지 않았습니다.";

  // Enforce strict server-side mission-to-activity alignment
  if (
    normalizedStatus === "APPROVED" &&
    missionRule &&
    !missionRule.allowedActivities.includes(normalizedActivity)
  ) {
    normalizedStatus = "REJECTED";
    reason = `선택하신 미션(${missionRule.title})과 사진 속 활동(${normalizedActivity})이 일치하지 않아 승인할 수 없습니다.`;
  }

  const reward =
    missionRule?.reward ??
    (typeof payload.expectedReward === "number" && payload.expectedReward > 0
      ? payload.expectedReward
      : 500);
  const co2SavedGrams = missionRule?.co2SavedGrams ?? 50;

  const isApproved = normalizedStatus === "APPROVED";
  const approvalToken = isApproved
    ? createApprovalToken({
        photoHash,
        missionId,
        reward,
        co2SavedGrams,
        uid
      })
    : undefined;

  return {
    statusCode: 200,
    body: {
      status: normalizedStatus,
      activity: normalizedActivity,
      activityType: normalizedActivity.toLowerCase(),
      confidence: normalizedConfidence,
      reason,
      suggestedPoints: isApproved ? reward : 0,
      co2SavedGrams: isApproved ? co2SavedGrams : 0,
      photoHash,
      approvalToken
    }
  };
}
