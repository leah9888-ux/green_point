import { Mission, CouponItem, SportsMatch } from "../types";

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: "tumbler",
    category: "daily",
    categoryLabel: "일상 실천",
    title: "텀블러 사용하기",
    desc: "카페나 일상에서 일회용 컵 대신 개인 텀블러를 사용한 사진을 인증해주세요.",
    reward: 500,
    co2SavedGrams: 52,
    icon: "🥤",
    badge: "인기 실천",
    hint: "음료가 담긴 텀블러나 카페 카운터 할인 영수증과 함께 촬영하면 빠른 승인!",
    sampleImages: [
      {
        label: "스테인리스 텀블러",
        url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80"
      },
      {
        label: "카페 개인 보틀 음료",
        url: "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=600&q=80"
      }
    ]
  },
  {
    id: "bike",
    category: "transport",
    categoryLabel: "친환경 이동",
    title: "친환경 자전거 타기",
    desc: "따릉이, 개인 자전거, 전동 킥보드 등 탄소 배출 없는 친환경 이동 수단을 이용해주세요.",
    reward: 700,
    co2SavedGrams: 140,
    icon: "🚲",
    badge: "탄소DOWN",
    hint: "자전거 핸들 또는 주행 앱 화면, 자전거 거치대 인증샷을 남겨주세요.",
    sampleImages: [
      {
        label: "따릉이/공공자전거",
        url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80"
      },
      {
        label: "로드 자전거 주행",
        url: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=600&q=80"
      }
    ]
  },
  {
    id: "stadium",
    category: "stadium",
    categoryLabel: "경기장 직관",
    title: "경기장 다회용기 사용",
    desc: "축구/야구 경기장에서 일회용 플라스틱 대신 다회용 컵 및 식기를 대여하여 응원해주세요.",
    reward: 1000,
    co2SavedGrams: 210,
    icon: "♻️",
    badge: "직관 특별 미션",
    hint: "경기장 다회용 식기 반납함 또는 구단 로고 다회용 맥주컵 사진을 올려주세요.",
    sampleImages: [
      {
        label: "경기장 다회용 응원컵",
        url: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&w=600&q=80"
      },
      {
        label: "다회용 식기 세트",
        url: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80"
      }
    ]
  },
  {
    id: "walk",
    category: "transport",
    categoryLabel: "친환경 이동",
    title: "경기장 걸어서 가기 (5,000보)",
    desc: "자가용 대신 도보 이동으로 탄소를 줄이고 경기장의 열기를 향해 힘차게 걸어보세요.",
    reward: 300,
    co2SavedGrams: 85,
    icon: "👟",
    badge: "건강+환경",
    hint: "스마트워치나 만보기 앱의 5,000보 이상 걸음수 화면을 캡처해 올려주세요.",
    sampleImages: [
      {
        label: "만보기 걸음수 캡처",
        url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=600&q=80"
      }
    ]
  },
  {
    id: "plogging",
    category: "stadium",
    categoryLabel: "경기장 직관",
    title: "경기 후 클린 관중석 플로깅",
    desc: "경기가 끝난 후 내 자리와 주변 관중석의 쓰레기를 분리수거하여 깨끗한 경기장을 만들어요.",
    reward: 1200,
    co2SavedGrams: 320,
    icon: "🧤",
    badge: "최고 보상",
    hint: "분리수거 봉투에 모은 쓰레기 또는 분리수거장에 배출하는 모습을 인증해주세요.",
    sampleImages: [
      {
        label: "경기장 관중석 정리 봉투",
        url: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80"
      }
    ]
  },
  {
    id: "subway",
    category: "transport",
    categoryLabel: "친환경 이동",
    title: "대중교통 직관 인증",
    desc: "지하철이나 시내버스를 타고 경기장으로 이동하는 티머니/교통카드 태그 인증!",
    reward: 600,
    co2SavedGrams: 110,
    icon: "🚇",
    badge: "교통 체증 제로",
    hint: "지하철 개찰구 태그 화면이나 버스 하차 승인 내역을 올려주세요.",
    sampleImages: [
      {
        label: "지하철역 게이트 태그",
        url: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80"
      }
    ]
  }
];

export const AVAILABLE_COUPONS: CouponItem[] = [
  {
    id: "coupon-goods-10k",
    title: "스포츠 굿즈샵 10,000원 할인권",
    subtitle: "전국 프로 스포츠 구단 공식 온라인/오프라인 스토어",
    category: "goods",
    requiredPoints: 10000,
    discountText: "10,000원",
    code: "GP-GOODS-2026-X89K",
    expiresAt: "2026.12.31",
    description: "유니폼, 머플러, 볼캡, 응원도구 등 30,000원 이상 구매 시 10,000원 즉시 할인됩니다.",
    used: false
  },
  {
    id: "coupon-ticket-5k",
    title: "K리그 / KBO 경기 티켓 5,000원 할인권",
    subtitle: "인터파크 / 티켓링크 예매 시 사용 가능",
    category: "ticket",
    requiredPoints: 5000,
    discountText: "5,000원",
    code: "GP-TICKET-5000-K77L",
    expiresAt: "2026.11.30",
    description: "정규 리그 일반석 및 응원지정석 예매 시 등록하여 5,000원 즉시 할인 적용됩니다.",
    used: false
  },
  {
    id: "coupon-drink-free",
    title: "경기장 친환경 다회용 컵 음료 무료권",
    subtitle: "전국 제휴 경기장 내 F&B 식음료 매장 전점",
    category: "food",
    requiredPoints: 3000,
    discountText: "아메리카노/에이드 무료",
    code: "GP-DRINK-FREE-D32V",
    expiresAt: "2026.12.15",
    description: "경기장 내 친환경 다회용 컵 대여 시 음료 1잔 무료 교환 (제휴 매장 카운터에 바코드 제시)",
    used: false
  },
  {
    id: "coupon-eco-bag",
    title: "업사이클링 구단 에코백 교환권",
    subtitle: "폐 현수막 & 폐 유니폼으로 만든 리미티드 에코 굿즈",
    category: "eco",
    requiredPoints: 15000,
    discountText: "에코백 정품 증정",
    code: "GP-UPCYCLE-BAG-99Z",
    expiresAt: "2026.12.31",
    description: "각 구단 경기장 팬존 부스에서 실물 한정판 업사이클링 에코백으로 현장 수령 가능합니다.",
    used: false
  }
];

export const UPCOMING_MATCHES: SportsMatch[] = [
  // 1. KBL 프로농구 (정규리그 2라운드 공식 일정)
  {
    id: "kbl-2026-1111",
    sport: "basketball",
    sportName: "KBL 프로농구",
    roundName: "정규리그 2라운드",
    homeTeam: "창원 LG 세이커스",
    awayTeam: "서울 SK 나이츠",
    homeLogo: "🏀🟡",
    awayLogo: "🏀🔴",
    stadium: "창원체육관",
    date: "2026.11.11 (수)",
    time: "19:00",
    ecoFeatures: ["대중교통 버스 탑승객 현장 텀블러 증정", "창원체육관 모바일 스마트 티켓 입장"],
    ecoDiscountAvailable: true,
    officialSiteUrl: "https://www.kbl.or.kr"
  },
  {
    id: "kbl-2026-1112",
    sport: "basketball",
    sportName: "KBL 프로농구",
    roundName: "정규리그 2라운드",
    homeTeam: "대구 한국가스공사",
    awayTeam: "고양 소노 스카이거너스",
    homeLogo: "🏀🔵",
    awayLogo: "🏀⚪",
    stadium: "대구실내체육관",
    date: "2026.11.12 (목)",
    time: "19:00",
    ecoFeatures: ["친환경 다회용 컵 음료 매점 운영", "도시철도 1호선 칠성시장역 도보 직관 인증"],
    ecoDiscountAvailable: true,
    officialSiteUrl: "https://www.kbl.or.kr"
  },
  {
    id: "kbl-2026-1113",
    sport: "basketball",
    sportName: "KBL 프로농구",
    roundName: "정규리그 2라운드",
    homeTeam: "원주 DB 프로미",
    awayTeam: "수원 KT 소닉붐",
    homeLogo: "🏀🟢",
    awayLogo: "🏀🖤",
    stadium: "원주 DB프로미아레나",
    date: "2026.11.13 (금)",
    time: "19:00",
    ecoFeatures: ["원주종합체육관 실내 텀블러 전용 급수대 완비", "종이 티켓 없는 100% 모바일 게이트"],
    ecoDiscountAvailable: true,
    officialSiteUrl: "https://www.kbl.or.kr"
  },
  {
    id: "kbl-2026-1114",
    sport: "basketball",
    sportName: "KBL 프로농구",
    roundName: "정규리그 2라운드",
    homeTeam: "부산 KCC 이지스",
    awayTeam: "서울 SK 나이츠",
    homeLogo: "🏀🔵",
    awayLogo: "🏀🔴",
    stadium: "부산사직실내체육관",
    date: "2026.11.14 (토)",
    time: "14:00",
    ecoFeatures: ["사직체육관 친환경 다회용기 반납 부스", "지하철 3호선 종합운동장역 이용 권장"],
    ecoDiscountAvailable: true,
    officialSiteUrl: "https://www.kbl.or.kr"
  },

  // 2. KOVO V-리그 (2026-2027 정규리그 공식 일정)
  {
    id: "kovo-2026-1111",
    sport: "volleyball",
    sportName: "KOVO V-리그",
    roundName: "남자부 1라운드",
    homeTeam: "우리카드 우리WON",
    awayTeam: "대한항공 점보스",
    homeLogo: "🏐🔵",
    awayLogo: "🏐✈️",
    stadium: "서울 장충체육관",
    date: "2026.11.11 (수)",
    time: "19:00",
    ecoFeatures: ["장충체육관 지하철 3호선 동대입구역 직결", "친환경 응원도구 재사용 캠페인"],
    ecoDiscountAvailable: true,
    officialSiteUrl: "https://www.kovo.co.kr"
  },
  {
    id: "kovo-2026-1112",
    sport: "volleyball",
    sportName: "KOVO V-리그",
    roundName: "남자부 1라운드",
    homeTeam: "OK저축은행 읏맨",
    awayTeam: "현대캐피탈 스카이워커스",
    homeLogo: "🏐🟠",
    awayLogo: "🏐⚪",
    stadium: "안산 상록수체육관",
    date: "2026.11.12 (목)",
    time: "19:00",
    ecoFeatures: ["상록수역 도보 5분 친환경 직관", "경기장 텀블러 음료 구매 시 500원 현장 할인"],
    ecoDiscountAvailable: true,
    officialSiteUrl: "https://www.kovo.co.kr"
  },

  // 3. K리그1 (2026시즌 파이널 라운드 공식 일정)
  {
    id: "kleague-2026-36r-1",
    sport: "soccer",
    sportName: "K리그1",
    roundName: "파이널A 36라운드",
    homeTeam: "울산 HD FC",
    awayTeam: "강원 FC",
    homeLogo: "⚽🔵",
    awayLogo: "⚽🟠",
    stadium: "울산문수축구경기장",
    date: "2026.11.21 (토)",
    time: "14:00",
    ecoFeatures: ["문수경기장 다회용기 맥주컵 전면 운영", "친환경 생분해 비닐봉투 제공"],
    ecoDiscountAvailable: true,
    officialSiteUrl: "https://www.kleague.com"
  },
  {
    id: "kleague-2026-36r-2",
    sport: "soccer",
    sportName: "K리그1",
    roundName: "파이널A 36라운드",
    homeTeam: "FC서울",
    awayTeam: "전북 현대 모터스",
    homeLogo: "⚽🔴⚫",
    awayLogo: "⚽🟢⚪",
    stadium: "서울월드컵경기장",
    date: "2026.11.21 (토)",
    time: "16:30",
    ecoFeatures: ["지하철 6호선 월드컵경기장역 대중교통 인증", "FC서울 에코 다회용 컵 보증금 무료"],
    ecoDiscountAvailable: true,
    officialSiteUrl: "https://www.kleague.com"
  },
  {
    id: "kleague-2026-36r-3",
    sport: "soccer",
    sportName: "K리그1",
    roundName: "파이널A 36라운드",
    homeTeam: "포항 스틸러스",
    awayTeam: "김천 상무",
    homeLogo: "⚽🔴",
    awayLogo: "⚽🔴🔵",
    stadium: "포항스틸야드",
    date: "2026.11.22 (일)",
    time: "14:00",
    ecoFeatures: ["경기 후 관중석 클린 플로깅 미션 존", "친환경 에코 머플러 지참 관중 이벤트"],
    ecoDiscountAvailable: true,
    officialSiteUrl: "https://www.kleague.com"
  },
  {
    id: "kleague-2026-37r-1",
    sport: "soccer",
    sportName: "K리그1",
    roundName: "파이널A 37라운드",
    homeTeam: "전북 현대 모터스",
    awayTeam: "포항 스틸러스",
    homeLogo: "⚽🟢⚪",
    awayLogo: "⚽🔴",
    stadium: "전주월드컵경기장",
    date: "2026.11.28 (토)",
    time: "14:00",
    ecoFeatures: ["전주성 다회용기 회수 스테이션 8개소 가동", "전주 시내 셔틀버스 환승 그린포인트 적립"],
    ecoDiscountAvailable: true,
    officialSiteUrl: "https://www.kleague.com"
  }
];
