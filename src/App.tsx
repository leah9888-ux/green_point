import React, { useState, useEffect } from "react";
import { ScreenId, Mission, Transaction, CouponItem, UserProfile } from "./types";
import { INITIAL_MISSIONS, AVAILABLE_COUPONS } from "./data/mockData";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { ToastContainer, ToastMessage } from "./components/Toast";
import { WelcomeScreen } from "./components/Screens/WelcomeScreen";
import { LoginScreen } from "./components/Screens/LoginScreen";
import { SignupScreen } from "./components/Screens/SignupScreen";
import { HomeScreen } from "./components/Screens/HomeScreen";
import { MissionsScreen } from "./components/Screens/MissionsScreen";
import { VerifyScreen } from "./components/Screens/VerifyScreen";
import { PointsScreen } from "./components/Screens/PointsScreen";
import { BenefitsScreen } from "./components/Screens/BenefitsScreen";
import { CouponScreen } from "./components/Screens/CouponScreen";
import { SportsScreen } from "./components/Screens/SportsScreen";
import { ProfileScreen } from "./components/Screens/ProfileScreen";
import { AdminScreen } from "./components/Screens/AdminScreen";
import { TestLabScreen } from "./components/Screens/TestLabScreen";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import {
  auth,
  signInWithGoogle,
  signOutUser,
  syncUserProfile,
  fetchUserProfile,
  saveTransaction,
  fetchUserTransactions,
  saveUserCoupon,
  fetchUserCoupons,
  updateUserCouponUsed
} from "./firebase";

const STORAGE_KEY = "green_point_app_state_v1";

const DEFAULT_USER: UserProfile = {
  name: "GREEN FAN",
  email: "greenfan@sports.kr",
  points: 1500,
  completedMissions: 1,
  co2SavedTotalG: 340,
  level: "새싹 서포터 🌱",
  avatarSeed: "green"
};

const DEFAULT_HISTORY: Transaction[] = [
  {
    id: "tx-welcome-bonus",
    title: "신규 가입 웰컴 그린 포인트",
    points: 1000,
    date: "2026.11.10",
    category: "bonus"
  },
  {
    id: "tx-first-tumbler",
    title: "텀블러 사용하기 인증 완료",
    points: 500,
    date: "2026.11.10",
    category: "mission"
  }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>("welcome");
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [history, setHistory] = useState<Transaction[]>(DEFAULT_HISTORY);
  const [myCoupons, setMyCoupons] = useState<CouponItem[]>([]);
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [selectedCouponForExchange, setSelectedCouponForExchange] = useState<CouponItem | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFbUser(currentUser);
      if (currentUser) {
        try {
          const profile = await fetchUserProfile(currentUser.uid);
          if (profile) {
            setUser((prev) => ({
              ...prev,
              name: profile.name || currentUser.displayName || prev.name,
              email: profile.email || currentUser.email || prev.email,
              points: profile.points ?? prev.points,
              completedMissions: profile.completedMissions ?? prev.completedMissions,
              co2SavedTotalG: profile.co2SavedTotalG ?? prev.co2SavedTotalG,
              level: profile.level ?? prev.level
            }));
          } else {
            // First time Firebase user initialization
            const initialProfile: UserProfile = {
              name: currentUser.displayName || currentUser.email?.split("@")[0] || "GREEN FAN",
              email: currentUser.email || "",
              points: 2000, // 2,000P welcome bonus for Firebase Google sign-in
              completedMissions: 0,
              co2SavedTotalG: 0,
              level: "새싹 서포터 🌱",
              avatarSeed: currentUser.uid
            };
            setUser(initialProfile);
            await syncUserProfile(initialProfile);

            const welcomeTx: Transaction = {
              id: "tx-fb-welcome-" + Date.now(),
              title: "Firebase 구글 로그인 웰컴 보너스",
              points: 2000,
              date: new Date().toLocaleDateString("ko-KR"),
              category: "bonus"
            };
            setHistory([welcomeTx]);
            await saveTransaction(welcomeTx);
          }

          // Fetch user transactions and coupons from Firestore
          const [remoteTxs, remoteCoupons] = await Promise.all([
            fetchUserTransactions(currentUser.uid),
            fetchUserCoupons(currentUser.uid)
          ]);

          if (remoteTxs.length > 0) {
            setHistory(remoteTxs);
          }
          if (remoteCoupons.length > 0) {
            setMyCoupons(remoteCoupons);
          }
        } catch (e) {
          console.warn("Failed to sync profile on auth change:", e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Load from localStorage on mount (fallback / guest persistence)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user && !auth.currentUser) setUser(parsed.user);
        if (parsed.history && !auth.currentUser) setHistory(parsed.history);
        if (parsed.myCoupons && !auth.currentUser) setMyCoupons(parsed.myCoupons);
        if (parsed.currentScreen && !["login", "signup"].includes(parsed.currentScreen)) {
          setCurrentScreen(parsed.currentScreen);
        }
      }
    } catch {
      // ignore storage parsing error
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user,
          history,
          myCoupons,
          currentScreen
        })
      );
    } catch {
      // ignore storage error
    }
  }, [user, history, myCoupons, currentScreen]);

  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleNavigate = (screen: ScreenId) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoogleSignIn = async () => {
    try {
      const loggedUser = await signInWithGoogle();
      addToast("success", `구글 계정(${loggedUser.displayName || loggedUser.email})으로 로그인되었습니다! ☁️`);
      handleNavigate("home");
    } catch (e) {
      console.error(e);
      addToast("error", "구글 로그인에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleQuickStart = () => {
    addToast("info", "GREEN FAN 체험 계정으로 시작합니다!");
    handleNavigate("home");
  };

  const handleLogin = (email: string) => {
    const derivedName = email.split("@")[0] || "GREEN FAN";
    setUser((prev) => ({
      ...prev,
      email,
      name: prev.name === "GREEN FAN" ? derivedName : prev.name
    }));
    addToast("success", `${user.name}님 환영합니다! 🌱`);
    handleNavigate("home");
  };

  const handleSignup = (name: string, email: string) => {
    const welcomeBonus = 1000;
    const newUserObj: UserProfile = {
      name,
      email,
      points: welcomeBonus,
      completedMissions: 0,
      co2SavedTotalG: 0,
      level: "새싹 서포터 🌱",
      avatarSeed: name
    };
    setUser(newUserObj);
    const welcomeTx: Transaction = {
      id: "tx-signup-bonus",
      title: "회원가입 웰컴 포인트 축하 보너스",
      points: welcomeBonus,
      date: new Date().toLocaleDateString("ko-KR"),
      category: "bonus"
    };
    setHistory([welcomeTx]);
    addToast("success", `회원가입 완료! 웰컴 +${welcomeBonus}P가 지급되었습니다.`);
    handleNavigate("home");
  };

  const handleLogout = async () => {
    try {
      if (auth.currentUser) {
        await signOutUser();
      }
    } catch {
      // ignore
    }
    addToast("info", "로그아웃 되었습니다.");
    handleNavigate("welcome");
  };

  const handleStartMission = (missionId: string) => {
    const mission = INITIAL_MISSIONS.find((m) => m.id === missionId);
    if (!mission) return;
    setCurrentMission(mission);
    handleNavigate("verify");
  };

  const handleSubmitMission = async (mission: Mission, photoUrl: string) => {
    const newPoints = user.points + mission.reward;
    const newMissionsCount = user.completedMissions + 1;
    const newCo2 = user.co2SavedTotalG + mission.co2SavedGrams;

    // Calculate level progression
    let newLevel = "새싹 서포터 🌱";
    if (newMissionsCount >= 5) newLevel = "에코 마스터 🌳";
    else if (newMissionsCount >= 2) newLevel = "초록 서포터 🌿";

    const updatedUser: UserProfile = {
      ...user,
      points: newPoints,
      completedMissions: newMissionsCount,
      co2SavedTotalG: newCo2,
      level: newLevel
    };

    setUser(updatedUser);

    const newTx: Transaction = {
      id: "tx-" + Date.now(),
      title: `${mission.title} 인증 완료`,
      points: mission.reward,
      date: new Date().toLocaleDateString("ko-KR"),
      category: "mission"
    };

    setHistory((prev) => [newTx, ...prev]);
    setCurrentMission(null);

    // Sync to Firestore if authenticated
    if (auth.currentUser) {
      try {
        await syncUserProfile(updatedUser);
        await saveTransaction(newTx);
      } catch (e) {
        console.error("Firestore sync error:", e);
      }
    }

    addToast(
      "success",
      `미션 인증 성공! +${mission.reward.toLocaleString()}P 및 ${mission.co2SavedGrams}g CO₂ 절감 완료!`
    );
    handleNavigate("points");
  };

  const handleSelectCoupon = (coupon: CouponItem) => {
    setSelectedCouponForExchange(coupon);
    handleNavigate("coupon");
  };

  const handleExchangeCoupon = (coupon: CouponItem): boolean => {
    if (user.points < coupon.requiredPoints) {
      addToast(
        "error",
        `포인트가 부족합니다. (현재: ${user.points.toLocaleString()}P / 필요: ${coupon.requiredPoints.toLocaleString()}P)`
      );
      return false;
    }

    const updatedPoints = user.points - coupon.requiredPoints;
    const updatedUser = { ...user, points: updatedPoints };
    setUser(updatedUser);

    const newCoupon: CouponItem = {
      ...coupon,
      id: "coupon-" + Date.now(),
      code: `${coupon.code.slice(0, 8)}-${Math.floor(1000 + Math.random() * 9000)}`,
      used: false
    };

    setMyCoupons((prev) => [newCoupon, ...prev]);

    const tx: Transaction = {
      id: "tx-coupon-" + Date.now(),
      title: `${coupon.title} 교환`,
      points: -coupon.requiredPoints,
      date: new Date().toLocaleDateString("ko-KR"),
      category: "coupon"
    };

    setHistory((prev) => [tx, ...prev]);

    // Sync to Firestore if authenticated
    if (auth.currentUser) {
      syncUserProfile(updatedUser).catch(console.error);
      saveUserCoupon(newCoupon).catch(console.error);
      saveTransaction(tx).catch(console.error);
    }

    addToast("success", `쿠폰이 발급되었습니다! 내 보유 쿠폰에서 바코드를 확인하세요.`);
    return true;
  };

  const handleUseCoupon = (couponId: string) => {
    const usedAt = new Date().toLocaleDateString("ko-KR") + " 현장 사용 완료";
    setMyCoupons((prev) =>
      prev.map((c) =>
        c.id === couponId
          ? {
              ...c,
              used: true,
              usedAt
            }
          : c
      )
    );

    if (auth.currentUser) {
      updateUserCouponUsed(couponId, usedAt).catch(console.error);
    }

    addToast("info", "쿠폰 현장 사용이 완료 처리되었습니다.");
  };

  const handleUpdateName = (newName: string) => {
    const updatedUser = { ...user, name: newName };
    setUser(updatedUser);
    if (auth.currentUser) {
      syncUserProfile(updatedUser).catch(console.error);
    }
    addToast("success", `닉네임이 '${newName}'으로 변경되었습니다.`);
  };

  const handleResetData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(DEFAULT_USER);
    setHistory(DEFAULT_HISTORY);
    setMyCoupons([]);
    addToast("info", "데모 데이터가 초기화되었습니다.");
    handleNavigate("home");
  };

  return (
    <div className="min-h-screen bg-[#edf1eb] flex flex-col justify-start items-center text-[#202c24] select-text">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Mobile App Viewport Container */}
      <div className="w-full max-w-[440px] min-h-screen bg-[#f6f8f4] relative overflow-x-hidden flex flex-col md:my-5 md:min-h-[calc(100vh-40px)] md:rounded-[28px] md:shadow-[0_12px_60px_rgba(23,42,21,0.12)] border border-[#e2e8df]">
        {/* App Header */}
        <Header
          currentScreen={currentScreen}
          points={user.points}
          userName={user.name}
          onNavigate={handleNavigate}
        />

        {/* Screen Content Router */}
        <main className="flex-1 w-full">
          {currentScreen === "welcome" && (
            <WelcomeScreen
              onNavigate={handleNavigate}
              onQuickStart={handleQuickStart}
              onGoogleSignIn={handleGoogleSignIn}
            />
          )}

          {currentScreen === "login" && (
            <LoginScreen
              onNavigate={handleNavigate}
              onLogin={handleLogin}
              onGoogleSignIn={handleGoogleSignIn}
            />
          )}

          {currentScreen === "signup" && (
            <SignupScreen onNavigate={handleNavigate} onSignup={handleSignup} />
          )}

          {currentScreen === "home" && (
            <HomeScreen
              user={user}
              missions={INITIAL_MISSIONS}
              onNavigate={handleNavigate}
              onStartMission={handleStartMission}
            />
          )}

          {currentScreen === "missions" && (
            <MissionsScreen
              missions={INITIAL_MISSIONS}
              onStartMission={handleStartMission}
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === "verify" && (
            <VerifyScreen
              mission={currentMission}
              user={user}
              onNavigate={handleNavigate}
              onPointsAwarded={(reward, co2Grams, title) => {
                const newPoints = user.points + reward;
                const newMissionsCount = user.completedMissions + 1;
                const newCo2 = user.co2SavedTotalG + co2Grams;

                let newLevel = "새싹 서포터 🌱";
                if (newMissionsCount >= 5) newLevel = "에코 마스터 🌳";
                else if (newMissionsCount >= 2) newLevel = "초록 서포터 🌿";

                const updatedUser: UserProfile = {
                  ...user,
                  points: newPoints,
                  completedMissions: newMissionsCount,
                  co2SavedTotalG: newCo2,
                  level: newLevel
                };
                setUser(updatedUser);

                const newTx: Transaction = {
                  id: "tx-" + Date.now(),
                  title: `${title} AI 인증 승인`,
                  points: reward,
                  date: new Date().toLocaleDateString("ko-KR"),
                  category: "mission"
                };
                setHistory((prev) => [newTx, ...prev]);

                if (auth.currentUser) {
                  syncUserProfile(updatedUser).catch(console.error);
                  saveTransaction(newTx).catch(console.error);
                }

                addToast(
                  "success",
                  `AI 판독 통과! +${reward.toLocaleString()}P 적립 및 ${co2Grams}g CO₂ 절감!`
                );
              }}
            />
          )}

          {currentScreen === "admin" && (
            <AdminScreen
              onNavigate={handleNavigate}
              adminEmail={user.email}
              onGrantUserPoints={(userId, points, title) => {
                const updatedUser = { ...user, points: user.points + points };
                setUser(updatedUser);
                const tx: Transaction = {
                  id: "tx-admin-" + Date.now(),
                  title,
                  points,
                  date: new Date().toLocaleDateString("ko-KR"),
                  category: "bonus"
                };
                setHistory((prev) => [tx, ...prev]);
                if (auth.currentUser) {
                  syncUserProfile(updatedUser).catch(console.error);
                  saveTransaction(tx).catch(console.error);
                }
                addToast("success", `[관리자 승인] ${points}P가 지급되었습니다.`);
              }}
            />
          )}

          {currentScreen === "testlab" && (
            <TestLabScreen onNavigate={handleNavigate} />
          )}

          {currentScreen === "points" && (
            <PointsScreen
              points={user.points}
              history={history}
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === "benefits" && (
            <BenefitsScreen
              coupons={AVAILABLE_COUPONS}
              userPoints={user.points}
              onNavigate={handleNavigate}
              onSelectCoupon={handleSelectCoupon}
            />
          )}

          {currentScreen === "coupon" && (
            <CouponScreen
              userPoints={user.points}
              availableCoupons={AVAILABLE_COUPONS}
              myCoupons={myCoupons}
              onExchange={handleExchangeCoupon}
              onUseCoupon={handleUseCoupon}
              onNavigate={handleNavigate}
              selectedCoupon={selectedCouponForExchange}
            />
          )}

          {currentScreen === "sports" && (
            <SportsScreen
              onNavigate={handleNavigate}
              onStartMission={handleStartMission}
            />
          )}

          {currentScreen === "profile" && (
            <ProfileScreen
              user={user}
              couponCount={myCoupons.length}
              onNavigate={handleNavigate}
              onUpdateName={handleUpdateName}
              onResetData={handleResetData}
              onLogout={handleLogout}
            />
          )}
        </main>

        {/* Persistent Bottom Navigation */}
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          couponCount={myCoupons.filter((c) => !c.used).length}
        />
      </div>
    </div>
  );
}