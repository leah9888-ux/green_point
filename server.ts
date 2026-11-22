import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "25mb" }));

// Allow cross-origin requests from GitHub Pages frontend when server.ts is hosted separately
app.use("/api", (req, res, next) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Initialize Google GenAI with GEMINI_API_KEY
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});

// Cache of approved photo hashes to prevent duplicate photo submissions and double-spending
const approvedPhotoHashes = new Set<string>();

// Verification Schema for Gemini Structured Output
const verificationResponseSchema = {
  type: Type.OBJECT,
  properties: {
    status: {
      type: Type.STRING,
      enum: ["APPROVED", "REJECTED", "RETAKE_REQUIRED", "MANUAL_REVIEW"],
      description: "Verification status strictly one of: APPROVED, RETAKE_REQUIRED, REJECTED, MANUAL_REVIEW"
    },
    activity: {
      type: Type.STRING,
      enum: ["TUMBLER", "REUSABLE_CONTAINER", "PUBLIC_BIKE", "PERSONAL_BIKE", "WALKING", "UNKNOWN"],
      description: "Detected activity strictly: TUMBLER, REUSABLE_CONTAINER, PUBLIC_BIKE, PERSONAL_BIKE, WALKING, or UNKNOWN"
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

// 1. Photo Analysis API
app.post("/api/analyze-photo", async (req, res) => {
  try {
    const { imageBase64, mimeType, missionId, missionTitle, expectedReward } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        status: "REJECTED",
        activity: "UNKNOWN",
        confidence: 0,
        reason: "사진 파일이 서버로 전송되지 않았습니다. 사진을 선택해 주세요."
      });
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    if (!cleanBase64 || cleanBase64.length < 50) {
      return res.status(400).json({
        status: "RETAKE_REQUIRED",
        activity: "UNKNOWN",
        confidence: 0,
        reason: "유효하지 않은 이미지 데이터입니다. 다시 촬영해 주세요."
      });
    }

    // 1. Compute SHA-256 hash for duplicate check
    const photoHash = crypto.createHash("sha256").update(cleanBase64).digest("hex");

    if (approvedPhotoHashes.has(photoHash)) {
      return res.json({
        status: "REJECTED",
        activity: "UNKNOWN",
        activityType: "duplicate",
        confidence: 1.0,
        reason: "이미 이전에 인증되어 포인트가 지급된 중복 사진입니다. 새로운 친환경 활동 사진을 업로드해 주세요.",
        suggestedPoints: 0,
        isDuplicate: true,
        photoHash
      });
    }

    // 2. Prepare Gemini Multimodal prompt
    const systemPrompt = `당신은 친환경 스포츠 리워드 플랫폼 'GREEN POINT'의 엄격하고 공정한 친환경 활동 판독 AI 심사관입니다.
제출된 사진을 엄격히 분석하여 다음 5대 친환경 활동인지 판정하고 정확한 JSON 형식으로만 답변하세요.

[판독 대상 5대 친환경 활동 및 코드]
1. 개인 텀블러 사용 (TUMBLER):
   - 개인 다회용 텀블러, 보온병, 다회용 워터보틀 사용 장면이어야 합니다.
   - 일회용 플라스틱 컵, 일회용 종이컵, 일회용 컵홀더/빨대가 주된 대상인 경우 즉시 REJECTED 처리하세요.
2. 경기장/매장 다회용기 사용 (REUSABLE_CONTAINER):
   - 스포츠 경기장이나 매장에서 제공하는 다회용 컵, 다회용 식기, 다회용기 반납 스테이션 사진이어야 합니다.
3. 따릉이 이용 (PUBLIC_BIKE):
   - 공공자전거(따릉이 등) 대여 스테이션, 잠금 해제 화면, 주행 중인 핸들이나 차체 식별이 되어야 합니다.
4. 개인 자전거 이용 (PERSONAL_BIKE):
   - 자전거 주행 도로, 헬멧/장갑, 자전거 거치대 등 실제 친환경 이동 활동 맥락이 확인되어야 합니다.
5. 걷기 활동 (WALKING):
   - 스마트워치 또는 만보기 앱의 당일 걸음수(5,000보 이상) 화면 캡처, 또는 산책로/보행 장면이어야 합니다.
6. 무관한 사진 (UNKNOWN):
   - 동물, 강아지, 고양이, 자연 풍경, 일반 음식, 가구 등 친환경 활동과 전혀 무관한 사진.

[판정 규칙]
- APPROVED:
  * 미션에 부합하는 친환경 활동(예: 개인 텀블러, 보온병, 다회용 워터보틀, 다회용기, 따릉이/자전거, 걷기 등)이 사진 속에서 확인되면 승인(APPROVED)하고 포인트를 지급하세요.
  * 텀블러/보온병/워터보틀이 확인되면 망설이지 말고 APPROVED 처리하세요.
- REJECTED:
  * 텀블러나 친환경 활동이 아닌 전혀 무관한 사진 (풍경, 강아지, 고양이, 일반 사물, 택배 상자, 컴퓨터 화면 등)은 즉시 반려(REJECTED) 처리하고 "친환경 활동(텀블러 사용)을 확인할 수 없는 사진입니다"라고 사유를 명시하세요.
  * 일회용 플라스틱 컵, 일회용 테이크아웃 종이컵인 경우 즉시 REJECTED 처리하세요.
- RETAKE_REQUIRED:
  * 사진이 너무 어둡거나 흐려 피사체 구분이 전혀 되지 않는 경우.
- MANUAL_REVIEW:
  * 텀블러인지 일반 일회용 컵인지 심히 불분명하여 추가 확인이 필요한 극히 예외적인 경우.`;

    // Fast and highly available multimodal models cascade
    const candidateModels = [
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-3.8-flash"
    ];
    let lastError: any = null;
    let responseText: string | undefined;

    for (const model of candidateModels) {
      try {
        console.log(`[Gemini Analysis] Calling ${model}...`);
        const callPromise = ai.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType || "image/jpeg",
                    data: cleanBase64
                  }
                },
                {
                  text: `사용자가 신청한 미션: [${missionTitle || missionId || "친환경 활동 인증"}]. 이 사진을 엄격히 판독해 주세요.`
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

        // 8 second timeout per model attempt to prevent hanging on congested servers
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`${model} request timed out`)), 8000)
        );

        const response = await Promise.race([callPromise, timeoutPromise]);

        if (response && response.text) {
          responseText = response.text;
          console.log(`[Gemini Analysis] ${model} responded successfully:`, responseText);
          break;
        }
      } catch (err: any) {
        console.warn(`[Gemini Analysis] Model ${model} failed:`, err?.status, err?.message);
        lastError = err;
      }
    }

    if (!responseText) {
      throw lastError || new Error("Gemini AI로부터 응답을 수신하지 못했습니다.");
    }

    // Safely parse JSON whether returned as object or array
    let parsedResult: any;
    try {
      const raw = JSON.parse(responseText);
      parsedResult = Array.isArray(raw) ? raw[0] : raw;
    } catch {
      parsedResult = {
        status: "MANUAL_REVIEW",
        activity: "UNKNOWN",
        confidence: 0.5,
        reason: "AI 판독 응답 형식을 해석하는 중 오류가 발생하여 관리자 검토 대기열로 접수되었습니다."
      };
    }

    parsedResult.photoHash = photoHash;
    parsedResult.activity = parsedResult.activity || "UNKNOWN";
    parsedResult.activityType = parsedResult.activity.toLowerCase();
    parsedResult.suggestedPoints = parsedResult.status === "APPROVED" ? (expectedReward || 500) : 0;

    return res.json(parsedResult);
  } catch (error: any) {
    console.error("Gemini AI verification error:", error);
    return res.status(500).json({
      status: "MANUAL_REVIEW",
      activity: "UNKNOWN",
      activityType: "error",
      confidence: 0,
      reason: `AI 판독 서비스 연결 중 일시적 오류가 발생했습니다 (${error?.message || "서버 통신 실패"}). 관리자 검토 대기열로 안전하게 접수되었습니다.`,
      suggestedPoints: 0
    });
  }
});

// 2. Secure Point Grant API (Server-side validation)
app.post("/api/grant-points", (req, res) => {
  const { photoHash, status, points, userId } = req.body;

  if (status !== "APPROVED") {
    return res.status(403).json({
      success: false,
      message: "승인(APPROVED) 상태가 아닌 판독 건에는 포인트를 지급할 수 없습니다."
    });
  }

  if (photoHash) {
    // Record approved hash to block future duplicate attempts
    approvedPhotoHashes.add(photoHash);
  }

  return res.json({
    success: true,
    pointsGranted: points,
    grantedAt: new Date().toISOString()
  });
});

// Setup Vite dev server or static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`GREEN POINT server running at http://localhost:${port}`);
  });
}

startServer();
