import {
  approvedPhotoHashes,
  resolveAllowedOrigin,
  verifyApprovalToken
} from "../server/geminiVerify";

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
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { photoHash, status, points, approvalToken } = body;

    if (status !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "승인(APPROVED) 상태가 아닌 판독 건에는 포인트를 지급할 수 없습니다."
      });
    }

    let grantedPoints = points;
    let grantedCo2 = 0;

    if (approvalToken) {
      const check = verifyApprovalToken(approvalToken, photoHash);
      if (!check.valid || !check.payload) {
        return res.status(403).json({
          success: false,
          message: "유효하지 않거나 만료된 AI 승인 토큰입니다."
        });
      }
      grantedPoints = check.payload.reward;
      grantedCo2 = check.payload.co2SavedGrams;
    }

    if (photoHash && approvedPhotoHashes.has(photoHash)) {
      return res.status(409).json({
        success: false,
        message: "이미 포인트가 지급된 중복 사진입니다."
      });
    }

    if (photoHash) {
      approvedPhotoHashes.add(photoHash);
    }

    return res.status(200).json({
      success: true,
      pointsGranted: grantedPoints,
      co2SavedGrams: grantedCo2,
      savedToFirestore: false,
      grantedAt: new Date().toISOString()
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error?.message || "잘못된 요청 형식입니다."
    });
  }
}
