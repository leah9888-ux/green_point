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
