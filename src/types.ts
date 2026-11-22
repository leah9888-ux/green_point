export type ScreenId =
  | "welcome"
  | "login"
  | "signup"
  | "home"
  | "missions"
  | "verify"
  | "points"
  | "benefits"
  | "coupon"
  | "sports"
  | "profile"
  | "admin"
  | "testlab";

export type VerificationStatus =
  | "APPROVED"
  | "RETAKE_REQUIRED"
  | "REJECTED"
  | "MANUAL_REVIEW";

export interface AIAnalysisResult {
  status: VerificationStatus;
  activity?: "TUMBLER" | "REUSABLE_CONTAINER" | "PUBLIC_BIKE" | "PERSONAL_BIKE" | "WALKING" | "UNKNOWN" | string;
  activityType?: string;
  confidence: number;
  reason: string;
  detectedObjects?: string[];
  sceneContext?: string;
  suggestedPoints?: number;
  isDuplicate?: boolean;
  photoHash?: string;
}

export interface VerificationRecord {
  id: string;
  photoId: string;
  userId: string;
  userEmail: string;
  userName: string;
  missionId: string;
  missionTitle: string;
  photoUrl: string;
  photoHash: string;
  analysis: AIAnalysisResult;
  pointsAwarded: number;
  createdAt: string;
  status: VerificationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  adminNote?: string;
}

export interface Mission {
  id: string;
  category: "daily" | "stadium" | "transport";
  categoryLabel: string;
  title: string;
  desc: string;
  reward: number;
  co2SavedGrams: number;
  icon: string;
  badge: string;
  hint: string;
  sampleImages?: { label: string; url: string }[];
}

export interface Transaction {
  id: string;
  title: string;
  points: number;
  date: string;
  category: "mission" | "coupon" | "bonus";
}

export interface CouponItem {
  id: string;
  title: string;
  subtitle: string;
  category: "ticket" | "goods" | "food" | "eco";
  requiredPoints: number;
  discountText: string;
  code: string;
  expiresAt: string;
  description: string;
  used: boolean;
  usedAt?: string;
}

export interface SportsMatch {
  id: string;
  sport: "soccer" | "baseball" | "basketball" | "volleyball";
  sportName: string;
  roundName?: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  stadium: string;
  date: string;
  time: string;
  ecoFeatures: string[];
  ecoDiscountAvailable: boolean;
  officialSiteUrl?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  points: number;
  completedMissions: number;
  co2SavedTotalG: number;
  level: string;
  avatarSeed: string;
}
