    await updateDoc(docRef, {
      status: decision,
      reviewedBy: adminEmail,
      reviewedAt,
      adminNote,
      pointsAwarded: decision === "APPROVED" ? pointsToAward : 0
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Requested 4-step secure photo upload & AI verification pipeline:
 * 1. 사진을 Firebase/스토리지에 저장
 * 2. 백엔드에 Gemini AI 판독 요청
 * 3. 승인(APPROVED)된 경우에만 서버에 포인트 지급 요청
 * 4. 나머지는 포인트 지급하지 않음 (0P)
 */
export async function executePhotoVerificationPipeline(
  imageBase64: string,
  mimeType: string,
  missionId: string,
  missionTitle: string,
  expectedReward: number,
  userId: string,
  userEmail: string,
  userName: string
): Promise<{ photoId: string; result: AIAnalysisResult; pointsGranted: number }> {
  const photoId = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("포인트 적립을 위해 구글 로그인이 필요합니다.");
  }

  const idToken = await currentUser.getIdToken();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/analyze-photo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({ imageBase64, mimeType, missionId, missionTitle, expectedReward })
    });
  } catch {
    throw new Error("AI 판독 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }

  if (!(response.headers.get("content-type") || "").includes("application/json")) {
    throw new Error("AI 판독 서버에서 올바른 응답을 받지 못했습니다.");
  }

  const result = (await response.json()) as AIAnalysisResult & {
    photoHash?: string;
    approvalToken?: string;
  };

  if (!response.ok) {
    throw new Error(result?.reason || "AI 사진 분석 요청에 실패했습니다.");
  }
  if (!result?.status) {
    throw new Error("AI 판독 결과가 올바르지 않습니다.");
  }

  let pointsGranted = 0;
  if (result.status === "APPROVED") {
    if (!result.photoHash || !result.approvalToken) {
      throw new Error("AI 승인 정보가 누락되었습니다. 다시 인증해 주세요.");
    }

    const grantResponse = await fetch(`${API_BASE_URL}/api/grant-points`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({
        photoHash: result.photoHash,
        approvalToken: result.approvalToken
      })
    });

    if (!(grantResponse.headers.get("content-type") || "").includes("application/json")) {
      throw new Error("포인트 저장 서버에서 올바른 응답을 받지 못했습니다.");
    }

    const grantData = await grantResponse.json();
    if (!grantResponse.ok || grantData.success !== true || grantData.savedToFirestore !== true) {
      throw new Error(grantData.message || "AI 인증은 승인되었지만 포인트 저장에 실패했습니다.");
    }

    pointsGranted = Number(grantData.pointsGranted || 0);
    if (!Number.isFinite(pointsGranted) || pointsGranted <= 0) {
      throw new Error("서버에서 올바른 포인트 지급 결과를 받지 못했습니다.");
    }
  }

  const record: VerificationRecord = {
    id: photoId,
    photoId,
    userId: currentUser.uid,
    userEmail,
    userName,
    missionId,
    missionTitle,
    photoUrl: imageBase64.startsWith("data:")
      ? imageBase64
      : `data:${mimeType};base64,${imageBase64}`,
    photoHash: result.photoHash || "",
    analysis: result,
    pointsAwarded: pointsGranted,
    createdAt: new Date().toISOString(),
    status: result.status
  };

  try {
    await saveVerificationRecord(record);
  } catch (error) {
    console.warn("인증 기록 저장 실패 (포인트 지급 결과에는 영향 없음):", error);
  }

  return { photoId, result, pointsGranted };
}
