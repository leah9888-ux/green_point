import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from "firebase/auth";
가져오기 {
  getFirestore,
  문서,
  getDoc,
  setDoc,
  updateDoc,
  컬렉션,
  getDocs,
  getDocFromServer,
  쿼리,
  정렬 기준
"firebase/firestore"에서 가져온 }
import firebaseConfig from "../firebase-applet-config.json";
import { UserProfile, Transaction, CouponItem, VerificationRecord, AIAnalysisResult, VerificationStatus } from "./types";

const resolvedConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId
};

// 선택 사항인 백엔드 API 기본 URL (동일 출처 server.ts의 경우 비워 두세요. GitHub Pages에서 호스팅하는 경우 VITE_API_BASE_URL을 설정하세요.)
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

const app = initializeApp(resolvedConfig);
export const db = getFirestore(app, resolvedConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = "생성",
  UPDATE = "업데이트",
  DELETE = "삭제",
  LIST = "list",
  GET = "get",
  WRITE = "쓰기"
}

FirestoreErrorInfo 인터페이스를 내보냅니다.
  오류: 문자열;
  operationType: OperationType;
  경로: 문자열 | null;
  인증 정보: {
    사용자 ID?: 문자열 | null;
    이메일?: 문자열 | null;
    이메일 인증 여부: 부울 | null;
    익명 사용자입니까?: 부울 | null;
    tenantId?: 문자열 | null;
    providerInfo?: {
      providerId?: 문자열 | null;
      이메일?: 문자열 | null;
    }[];
  };
}

export function handleFirestoreError(
  오류: 알 수 없음,
  operationType: OperationType,
  경로: 문자열 | null
) {
  const errInfo: FirestoreErrorInfo = {
    오류: Error 인스턴스 오류 ? 오류 메시지 : 문자열(error),
    인증 정보: {
      userId: auth.currentUser?.uid,
      이메일: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          이메일: provider.email
        })) || []
    },
    operationType,
    경로
  };
  console.error("Firestore 오류: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 부팅 시 연결 테스트
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (오류) {
    오류가 Error 인스턴스이고 오류 메시지에 "클라이언트가 오프라인입니다"라는 내용이 포함되어 있으면 {
      console.error("Firebase 설정을 확인해 주세요.");
    }
  }
}
testConnection();

// 인증 도우미
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    result.user를 반환합니다
  } catch (오류) {
    console.error("Google 로그인 실패:", error);
    오류를 발생시키세요
  }
}

export async function signOutUser() {
  try {
    await fbSignOut(auth);
  } catch (오류) {
    console.error("로그아웃 오류:", error);
    오류를 발생시키세요
  }
}

// Firestore 사용자 프로필 도우미
export async function syncUserProfile(profile: UserProfile): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, "users", user.uid);
    await setDoc(
      userRef,
      {
        uid: user.uid,
        이름: profile.name,
        이메일: profile.email || user.email || "",
        포인트: profile.points,
        completedMissions: profile.completedMissions,
        co2SavedTotalG: profile.co2SavedTotalG,
        레벨: profile.level,
        updatedAt: new Date().toISOString()
      },
      { 병합: true }
    );
  } catch (오류) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchUserProfile(uid: string): Promise<Partial<UserProfile> | null> {
  const path = `users/${uid}`;
  try {
    const docSnap = await getDoc(doc(db, "users", uid));
    if (docSnap.exists()) {
      docSnap.data()를 Partial<UserProfile>로 반환합니다.
    }
    null을 반환합니다
  } catch (오류) {
    handleFirestoreError(error, OperationType.GET, path);
    null을 반환합니다
  }
}

// 파이어스토어 트랜잭션 도우미
export async function saveTransaction(tx: Transaction): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  const path = `users/${user.uid}/transactions/${tx.id}`;
  try {
    const txRef = doc(db, "users", user.uid, "transactions", tx.id);
    await setDoc(txRef, {
      id: tx.id,
      userId: user.uid,
      제목: tx.title,
      포인트: tx.points,
      날짜: tx.date,
      카테고리: tx.category
    });
  } catch (오류) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchUserTransactions(uid: string): Promise<Transaction[]> {
  const path = `users/${uid}/transactions`;
  try {
    const txCol = collection(db, "users", uid, "transactions");
    const q = query(txCol, orderBy("date", "desc"));
    const snap = await getDocs(q);
    snap.docs.map((d) => d.data() as Transaction)를 반환합니다.
  } catch (오류) {
    handleFirestoreError(error, OperationType.LIST, path);
    []를 반환합니다
  }
}

// 파이어스토어 쿠폰 도우미
export async function saveUserCoupon(coupon: CouponItem): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  const path = `users/${user.uid}/coupons/${coupon.id}`;
  try {
    const couponRef = doc(db, "users", user.uid, "coupons", coupon.id);
    await setDoc(couponRef, {
      id: coupon.id,
      userId: user.uid,
      제목: coupon.title,
      부제목: coupon.subtitle || "",
      카테고리: 쿠폰 카테고리 || "상품",
      requiredPoints: coupon.requiredPoints,
      discountText: coupon.discountText,
      코드: coupon.code,
      expiresAt: coupon.expiresAt,
      설명: 쿠폰.설명,
      사용됨: coupon.used,
      사용 위치: 쿠폰.사용 위치 || ""
    });
  } catch (오류) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateUserCouponUsed(couponId: string, usedAt: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  const path = `users/${user.uid}/coupons/${couponId}`;
  try {
    const couponRef = doc(db, "users", user.uid, "coupons", couponId);
    await updateDoc(couponRef, {
      사용됨: true,
      usedAt
    });
  } catch (오류) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function fetchUserCoupons(uid: string): Promise<CouponItem[]> {
  const path = `users/${uid}/coupons`;
  try {
    const couponCol = collection(db, "users", uid, "coupons");
    const snap = await getDocs(couponCol);
    return snap.docs.map((d) => d.data() as CouponItem);
  } catch (오류) {
    handleFirestoreError(error, OperationType.LIST, path);
    []를 반환합니다
  }
}

// ==========================================
// 검증 및 AI 사진 파이프라인 기능
// ==========================================

export async function saveVerificationRecord(record: VerificationRecord): Promise<void> {
  const user = auth.currentUser;
  const path = `verifications/${record.id}`;
  try {
    const docRef = doc(db, "verifications", record.id);
    await setDoc(docRef, record);
    if (user) {
      const userDocRef = doc(db, "users", user.uid, "verifications", record.id);
      await setDoc(userDocRef, record);
    }
  } catch (오류) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchAllVerifications(): Promise<VerificationRecord[]> {
  const path = "검증";
  try {
    const colRef = collection(db, "검증");
    const snap = await getDocs(colRef);
    snap.docs.map((d) => d.data() as VerificationRecord)를 반환합니다.
  } catch (오류) {
    console.warn("전역 검증에서 가져올 수 없습니다. 로컬 큐를 사용합니다.:", error);
    []를 반환합니다
  }
}

export async function updateVerificationAdminReview(
  recordId: 문자열,
  userId: 문자열,
  결정: "승인" | "거부"
  관리자 참고: 문자열,
  pointsToAward: 숫자
): Promise<void> {
  const adminEmail = auth.currentUser?.email || "admin@sports.kr";
  const reviewedAt = new Date().toISOString();
  const path = `verifications/${recordId}`;
  try {
    const docRef = doc(db, "verifications", recordId);
    await updateDoc(docRef, {
      상태: 결정,
      검토자: 관리자 이메일,
      검토됨,
      관리자 참고,
      획득 점수: 결정 === "승인됨" ? 획득할 점수: 0
    });
  } catch (오류) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * 4단계 보안 사진 업로드 및 AI 검증 파이프라인을 요청했습니다.
 * 1. 사진을 Firebase/스토리지에 저장
 * 2. 백엔드에 Gemini AI 사용 요청
 * 3. 승인(APPROVED)된 경우에만 서버에 포인트 지급 요청
 * 4. 나머지는 지급하지 않습니다 (0P)
 */
export async function executePhotoVerificationPipeline(
  imageBase64: 문자열,
  mimeType: 문자열,
  missionId: 문자열,
  missionTitle: 문자열,
  예상 보상: 숫자,
  userId: 문자열,
  userEmail: 문자열,
  userName: 문자열
): Promise<{ photoId: string; result: AIAnalysisResult; pointsGranted: number }> {
  const photoId = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  // 1. 백엔드 AI 분석 호출 (server.ts 프록시를 통한 Gemini)
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/analyze-photo`, {
      메서드: "POST",
      헤더: { "Content-Type": "application/json" },
      본문: JSON.stringify({
        imageBase64,
        mimeType,
        missionId,
        미션 제목,
        예상 보상
      })
    });
  } catch {
    반환 {
      photoId,
      결과: {
        상태: "거부됨"
        활동: "알 수 없음",
        신뢰도: 0,
        이유: "AI 백엔드 서버에 제외할 수 없습니다. 별도로 배포된 Gemini API 서버를 확인해 주세요."
      },
      부여된 포인트: 0
    };
  }

  let result: AIAnalysisResult & { photoHash?: string };
  try {
    const contentType = response.headers.get("content-type") || "";
    만약 (!contentType.includes("application/json")) {
      "JSON이 아닌 응답입니다."라는 오류 메시지를 새로 생성합니다.
    }
    결과 = 응답의 json을 기다립니다();
  } catch {
    결과 = {
      상태: "거부됨"
      활동: "알 수 없음",
      신뢰도: 0,
      이유:
        response.status === 404
          ? "정적 웹페이지(GitHub Pages) 환경에서는 특별히 배포된 Gemini API 서버(VITE_API_BASE_URL) 연결이 필요합니다."
          : "판독 해제: 서버와 통신할 수 있는 특수 이미지 분석 중 문제가 발생했습니다."
    };
  }

  // 결과에 필수 필드가 포함되어 있는지 확인합니다.
  결과가 아니거나 결과가 아닌 경우 {
    결과 = {
      상태: "거부됨"
      활동: "알 수 없음",
      신뢰도: 0,
      이유: "판독 해제: 분석 결과를 종료하지 않았습니다."
    };
  }

  pointsGranted를 0으로 설정하세요.

  // 2. 상태가 "승인됨"인 경우에만 점수를 부여합니다.
  결과 상태가 "승인됨"인 경우 {
    const grantRes = await fetch(`${API_BASE_URL}/api/grant-points`, {
      메서드: "POST",
      헤더: { "Content-Type": "application/json" },
      본문: JSON.stringify({
        photoHash: result.photoHash,
        상태: result.status,
        포인트: 예상 보상,
        userId
      })
    });

    (grantRes.ok)인 경우 {
      부여된 포인트 = 예상 보상;
    }
  }

  3. 검증 기록을 Firestore에 저장합니다.
  const record: VerificationRecord = {
    id: photoId,
    photoId,
    userId,
    사용자 이메일,
    사용자 이름,
    missionId,
    미션 제목,
    photoUrl: imageBase64.startsWith("data:") ? imageBase64 : `data:${mimeType};base64,${imageBase64}`,
    photoHash: result.photoHash || "",
    분석: 결과,
    획득한 포인트: 부여된 포인트,
    createdAt: new Date().toISOString(),
    상태: result.status
  };

  await saveVerificationRecord(record).catch((err) => {
    console.warn("Firestore에 저장할 수 없습니다. 로컬에 저장되었습니다.:", err);
  });

  { photoId, result, pointsGranted }를 반환합니다.
}
