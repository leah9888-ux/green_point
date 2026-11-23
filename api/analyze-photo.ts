
import { analyzeEcoPhoto, resolveAllowedOrigin } from "../server/geminiVerify.js";

export default async function handler(req: any, res: any) {
  const allowedOrigin = resolveAllowedOrigin(req.headers?.origin);

  if (allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};

    const { statusCode, body: result } = await analyzeEcoPhoto(body);

    return res.status(statusCode).json(result);
  } catch (error: any) {
    console.error("Serverless /api/analyze-photo error:", error);

    return res.status(500).json({
      status: "MANUAL_REVIEW",
      activity: "UNKNOWN",
      activityType: "error",
      confidence: 0,
      reason: `AI 판독 요청 처리 중 오류가 발생했습니다 (${error?.message || "서버 오류"}).`,
      suggestedPoints: 0
    });
  }
}
