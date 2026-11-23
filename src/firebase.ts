import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  getDocFromServer,
  query,
  orderBy
} from "firebase/firestore";
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

// Optional backend API base URL (empty for same-origin server.ts; set VITE_API_BASE_URL when hosted on GitHub Pages)
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

const app = initializeApp(resolvedConfig);
export const db = getFirestore(app, resolvedConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write"
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Authentication helpers
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google sign in failed:", error);
    throw error;
  }
}

export async function signOutUser() {
  try {
    await fbSignOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
}

// Firestore user profile helpers
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
        name: profile.name,
        email: profile.email || user.email || "",
        points: profile.points,
        completedMissions: profile.completedMissions,
        co2SavedTotalG: profile.co2SavedTotalG,
        level: profile.level,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchUserProfile(uid: string): Promise<Partial<UserProfile> | null> {
  const path = `users/${uid}`;
  try {
    const docSnap = await getDoc(doc(db, "users", uid));
    if (docSnap.exists()) {
      return docSnap.data() as Partial<UserProfile>;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// Firestore transactions helpers
export async function saveTransaction(tx: Transaction): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  const path = `users/${user.uid}/transactions/${tx.id}`;
  try {
    const txRef = doc(db, "users", user.uid, "transactions", tx.id);
    await setDoc(txRef, {
      id: tx.id,
      userId: user.uid,
      title: tx.title,
      points: tx.points,
      date: tx.date,
      category: tx.category
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchUserTransactions(uid: string): Promise<Transaction[]> {
  const path = `users/${uid}/transactions`;
  try {
    const txCol = collection(db, "users", uid, "transactions");
    const q = query(txCol, orderBy("date", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Transaction);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// Firestore coupon helpers
export async function saveUserCoupon(coupon: CouponItem): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  const path = `users/${user.uid}/coupons/${coupon.id}`;
  try {
    const couponRef = doc(db, "users", user.uid, "coupons", coupon.id);
    await setDoc(couponRef, {
      id: coupon.id,
      userId: user.uid,
      title: coupon.title,
      subtitle: coupon.subtitle || "",
      category: coupon.category || "goods",
      requiredPoints: coupon.requiredPoints,
      discountText: coupon.discountText,
      code: coupon.code,
      expiresAt: coupon.expiresAt,
      description: coupon.description,
      used: coupon.used,
      usedAt: coupon.usedAt || ""
    });
  } catch (error) {
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
      used: true,
      usedAt
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function fetchUserCoupons(uid: string): Promise<CouponItem[]> {
  const path = `users/${uid}/coupons`;
  try {
    const couponCol = collection(db, "users", uid, "coupons");
    const snap = await getDocs(couponCol);
    return snap.docs.map((d) => d.data() as CouponItem);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// ==========================================
// Verification & AI Photo Pipeline Functions
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
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchAllVerifications(): Promise<VerificationRecord[]> {
  const path = "verifications";
  try {
    const colRef = collection(db, "verifications");
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => d.data() as VerificationRecord);
  } catch (error) {
    console.warn("Could not fetch from global verifications, will use local queue:", error);
    return [];
  }
}

export async function updateVerificationAdminReview(
  recordId: string,
  userId: string,
  decision: "APPROVED" | "REJECTED",
  adminNote: string,
  pointsToAward: number
): Promise<void> {
  const adminEmail = auth.currentUser?.email || "admin@sports.kr";
  const reviewedAt = new Date().toISOString();
  const path = `verifications/${recordId}`;
  try {
    const docRef = doc(db, "verifications", recordId);
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

  // Firebase 로그인 토큰을 서버로 전달해야 인증된 요청으로 처리됩니다.
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return {
      photoId,
      result: {
        status: "REJECTED",
        activity: "UNKNOWN",
        confidence: 0,
        reason: "구글 로그인 상태를 확인할 수 없습니다. 다시 로그인해 주세요."
      },
      pointsGranted: 0
    };
  }

  let idToken: string;
  try {
    idToken = await currentUser.getIdToken();
  } catch {
    return {
      photoId,
      result: {
        status: "REJECTED",
        activity: "UNKNOWN",
        confidence: 0,
        reason: "로그인 인증정보를 가져오지 못했습니다. 다시 로그인해 주세요."
      },
      pointsGranted: 0
    };
  }

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${idToken}`
  };

  // 1. Backend AI Analysis call
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/analyze-photo`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        imageBase64,
        mimeType,
        missionId,
        missionTitle,
        expectedReward
      })
    });
  } catch {
    return {
      photoId,
      result: {
        status: "REJECTED",
        activity: "UNKNOWN",
        confidence: 0,
        reason: "AI 판독 백엔드 서버에 연결할 수 없습니다. 별도 배포된 Gemini API 서버 상태를 확인해 주세요."
      },
      pointsGranted: 0
    };
  }

  let result: AIAnalysisResult & { photoHash?: string; approvalToken?: string };
  try {
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("Non-JSON response");
    }
    result = await response.json();
  } catch {
    result = {
      status: "REJECTED",
      activity: "UNKNOWN",
      confidence: 0,
      reason:
        response.status === 404
          ? "정적 웹페이지(GitHub Pages) 환경에서는 별도 배포된 Gemini API 서버(VITE_API_BASE_URL) 연결이 필요합니다."
          : `AI 판독 서버 오류 (HTTP ${response.status}). 서버 설정과 실행 로그를 확인해 주세요.`
    };
  }

  // Ensure result has required fields
  if (!result || !result.status) {
    result = {
      status: "REJECTED",
      activity: "UNKNOWN",
      confidence: 0,
      reason: "판독 불가: 유효한 분석 결과를 도출하지 못했습니다."
    };
  }

  let pointsGranted = 0;

  // 2. Only grant points if status === "APPROVED"
  if (result.status === "APPROVED") {
    const grantRes = await fetch(`${API_BASE_URL}/api/grant-points`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        photoHash: result.photoHash,
        approvalToken: result.approvalToken,
        status: result.status,
        points: expectedReward,
        userId
      })
    });

    if (grantRes.ok) {
      pointsGranted = expectedReward;
    }
  }

  // 3. Save verification record to Firestore
  const record: VerificationRecord = {
    id: photoId,
    photoId,
    userId,
    userEmail,
    userName,
    missionId,
    missionTitle,
    photoUrl: imageBase64.startsWith("data:") ? imageBase64 : `data:${mimeType};base64,${imageBase64}`,
    photoHash: result.photoHash || "",
    analysis: result,
    pointsAwarded: pointsGranted,
    createdAt: new Date().toISOString(),
    status: result.status
  };

  await saveVerificationRecord(record).catch((err) => {
    console.warn("Could not save to Firestore, stored locally:", err);
  });

  return { photoId, result, pointsGranted };
}