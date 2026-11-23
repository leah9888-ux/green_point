import crypto from "crypto";
import { GoogleGenAI, Type } from "@google/genai";

export type VerificationStatus =
  | "APPROVED"
  | "REJECTED"
  | "RETAKE_REQUIRED"
  | "MANUAL_REVIEW";

export type EcoActivityCode =
  | "TUMBLER"
  | "REUSABLE_CONTAINER"
  | "PUBLIC_BIKE"
  | "PERSONAL_BIKE"
  | "WALKING"
  | "PLOGGING"
  | "PUBLIC_TRANSIT"
  | "UNKNOWN";

export interface MissionRule {
  id: string;
  title: string;
  reward: number;
  co2SavedGrams: number;
  allowedActivities: EcoActivityCode[];
}

export const MISSION_CATALOG: Record<string, MissionRule> = {
  tumbler: {
    id: "tumbler",
    title: "텀블러 사용하기",
    reward: 500,
    co2SavedGrams: 52,
    allowedActivities: ["TUMBLER"]
  },
  bike: {
    id: "bike",
    title: "친환경 자전거 타기",
    reward: 700,
    co2SavedGrams: 140,
    allowedActivities: ["PUBLIC_BIKE", "PERSONAL_BIKE"]
  },
  stadium: {
    id: "stadium",
    title: "경기장 다회용기 사용",
    reward: 1000,
    co2SavedGrams: 210,
    allowedActivities: ["REUSABLE_CONTAINER"]
  },
  walk: {
    id: "walk",
    title: "경기장 걸어서 가기 (5,000보)",
    reward: 300,
    co2SavedGrams: 85,
    allowedActivities: ["WALKING"]
  },
  plogging: {
    id: "plogging",
    title: "경기 후 클린 관중석 플로깅",
    reward: 1200,
    co2SavedGrams: 320,
    allowedActivities: ["PLOGGING", "REUSABLE_CONTAINER"]
  },
  subway: {
    id: "subway",
    title: "대중교통 직관 인증",
    reward: 600,
    co2SavedGrams: 110,
    allowedActivities: ["PUBLIC_TRANSIT"]
  },
  // Preset test cases in TestLabScreen
  "test-tumbler-ok": {
    id: "test-tumbler-ok",
    title: "정상 텀블러 사용 (승인)",
    reward: 500,
    co2SavedGrams: 52,
    allowedActivities: ["TUMBLER"]
  },
  "test-disposable-plastic": {
    id: "test-disposable-plastic",
    title: "일회용 플라스틱 컵 (반려)",
    reward: 500,
    co2SavedGrams: 52,
    allowedActivities: ["TUMBLER"]
  },
  "test-blurry": {
    id: "test-blurry",
    title: "흐릿하고 어두운 사진 (재촬영)",
    reward: 500,
    co2SavedGrams: 52,
    allowedActivities: ["TUMBLER"]
  },
  "test-bike-ok": {
    id: "test-bike-ok",
    title: "따릉이 공공자전거 이용 (승인)",
    reward: 700,
