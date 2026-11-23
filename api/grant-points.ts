
import { adminAuth, adminDb } from "../server/firebaseAdmin.js";
import {
  resolveAllowedOrigin,
  verifyApprovalToken
} from "../server/geminiVerify.js";

export default async function handler(req: any, res: any) {
  const allowedOrigin = resolveAllowedOrigin(req.headers?.origin);

  if (allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "POST 요청만 허용됩니다."
    });
  }

  try {
    const authHeader = req.headers.authorization || "";
    const idToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : "";

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: "구글 로그인이 필요합니다."
      });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};

    const { photoHash, approvalToken } = body;

    if (
      typeof photoHash !== "string" ||
      !/^[a-f0-9]{64}$/.test(photoHash) ||
      typeof approvalToken !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "사진 정보 또는 AI 승인 토큰이 없습니다."
      });
    }

    const check = verifyApprovalToken(approvalToken, photoHash, uid);

    if (
      !check.valid ||
      !check.payload ||
      check.payload.uid !== uid
    ) {
      return res.status(403).json({
        success: false,
        message: "유효하지 않거나 만료된 AI 승인 정보입니다."
      });
    }

    const { missionId, reward, co2SavedGrams } = check.payload;

    if (
      !Number.isSafeInteger(reward) ||
      reward <= 0 ||
      !Number.isSafeInteger(co2SavedGrams) ||
      co2SavedGrams < 0
    ) {
      return res.status(403).json({
        success: false,
        message: "포인트 지급 정보가 올바르지 않습니다."
      });
    }

    const userRef = adminDb.collection("users").doc(uid);
    const photoRef = adminDb.collection("rewardedPhotos").doc(photoHash);
    const txRef = userRef.collection("transactions").doc(`photo-${photoHash}`);
    const now = new Date().toISOString();

    const result = await adminDb.runTransaction(async (transaction) => {
      const [photoSnap, userSnap] = await Promise.all([
        transaction.get(photoRef),
        transaction.get(userRef)
      ]);

      if (photoSnap.exists) {
        return { duplicate: true };
      }

      if (!userSnap.exists) {
        return { userMissing: true };
      }

      const profile = userSnap.data() || {};
      const currentPoints = Number(profile.points || 0);
      const currentMissions = Number(profile.completedMissions || 0);
      const currentCo2 = Number(profile.co2SavedTotalG || 0);

      const nextMissions = currentMissions + 1;
      const level =
        nextMissions >= 5
          ? "에코 마스터 🌳"
          : nextMissions >= 2
            ? "초록 서포터 🌿"
            : "새싹 서포터 🌱";

      const newBalance = currentPoints + reward;

      transaction.update(userRef, {
        points: newBalance,
        completedMissions: nextMissions,
        co2SavedTotalG: currentCo2 + co2SavedGrams,
        level,
        updatedAt: now
      });

      transaction.create(photoRef, {
        photoHash,
        uid,
        missionId,
        reward,
        createdAt: now
      });

      transaction.create(txRef, {
        id: txRef.id,
        userId: uid,
        title: `${missionId} AI 인증 승인`,
        points: reward,
        date: new Date().toLocaleDateString("ko-KR"),
        category: "mission"
      });

      return {
        duplicate: false,
        pointsGranted: reward,
        co2SavedGrams,
        newBalance,
        completedMissions: nextMissions,
        level
      };
    });

    if ("duplicate" in result && result.duplicate) {
      return res.status(409).json({
        success: false,
        message: "이미 포인트가 지급된 사진입니다."
      });
    }

    if ("userMissing" in result && result.userMissing) {
      return res.status(404).json({
        success: false,
        message: "사용자 정보가 없습니다. 다시 로그인해 주세요."
      });
    }

    return res.status(200).json({
      success: true,
      savedToFirestore: true,
      ...result,
      grantedAt: now
    });
  } catch (error: any) {
    console.error("Point grant error:", error);

    return res.status(500).json({
      success: false,
      message: "포인트 저장 중 오류가 발생했습니다."
    });
  }
}
