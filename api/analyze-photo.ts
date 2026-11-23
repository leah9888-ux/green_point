
import { adminAuth } from "../server/firebaseAdmin.js";
import {
  analyzeEcoPhoto,
  resolveAllowedOrigin
} from "../server/geminiVerify.js";

export default async function handler(req: any, res: any) {
  const allowedOrigin = resolveAllowedOrigin(req.headers?.origin);

  if (allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "POST 요청만 허용됩니다."
    });
  }

  try {
    const authHeader = req.headers.authorization || "";

    const idToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : "";

    if (!idToken) {
      return res.status(401).json({
        status: "REJECTED",
        activity: "UNKNOWN",
        confidence: 0,
        reason: "친환경 활동 인증을 위해 구글 로그인이 필요합니다.",
        suggestedPoints: 0
      });
    }

    let uid: string;

    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      uid = decodedToken.uid;
    } catch {
      return res.status(401).json({
        status: "REJECTED",
        activity: "UNKNOWN",
        confidence: 0,
        reason: "로그인 인증이 만료되었거나 유효하지 않습니다. 다시 로그인해 주세요.",
        suggestedPoints: 0
      });
    }

    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};

    const { statusCode, body: result } = await analyzeEcoPhoto({
      ...body,
      uid
    });

    return res.status(statusCode).json(result);
  } catch (error: any) {
    console.error("Serverless /api/analyze-photo error:", error);

    return res.status(500).json({
      status: "MANUAL_REVIEW",
      activity: "UNKNOWN",
      confidence: 0,
      reason: "AI 판독 요청을 처리하는 중 서버 오류가 발생했습니다.",
      suggestedPoints: 0
    });
  }
}
