# 🌱 GREEN POINT (친환경 스포츠 포인트)

친환경 행동(텀블러 사용, 다회용기 사용, 따릉이/개인 자전거, 걷기)을 카메라로 인증하고, Google Gemini AI 판독을 거쳐 포인트를 적립·사용하는 그린 스포츠 리워드 웹 애플리케이션입니다.

---

## 🧩 아키텍처 구분 (GitHub Pages 화면 vs 별도 백엔드 서버)

GitHub Pages는 **정적 파일(HTML/CSS/JS) 전용 호스팅**이므로, 보안상 **Gemini API 키(`GEMINI_API_KEY`)를 넣은 서버 코드를 실행할 수 없습니다.**

1. **GitHub Pages에서 실행되는 화면 코드 (`src/`, `dist/`)**
   - 로그인(Firebase Authentication), 포인트/미션 데이터 저장(Cloud Firestore), 카메라/사진 업로드 UI, 포인트 내역 표·그래프, 스포츠 경기 일정 등 모든 프런트엔드 화면
   - `vite.config.ts`의 `base: './'` 설정으로 `https://<아이디>.github.io/<저장소이름>/` 하위 경로에서도 정상 동작
2. **별도로 배포해야 하는 서버 기능 (`server.ts`)**
   - `/api/analyze-photo` (Gemini AI 이미지 판독, SHA-256 중복 차단)
   - `/api/grant-points` (승인 건 포인트 지급 검증)
   - `GEMINI_API_KEY` 환경 변수는 오직 이 백엔드 서버(Cloud Run, Render, Railway 등)의 Secret/환경 변수에만 보관합니다.
   - 별도 서버 배포 후 GitHub 저장소의 **Settings > Secrets and variables > Actions > Variables** 탭에서 `VITE_API_BASE_URL` 변수(예: `https://your-backend-url.run.app`)를 등록하고 재배포하면 GitHub Pages 화면과 자동 연결됩니다.

---

## ⚙️ 로컬 개발 및 빌드

```bash
npm install
npm run dev      # Express(server.ts) + Vite 통합 개발 서버 (포트 3000)
npm run build    # GitHub Pages용 정적 빌드 (dist/ 생성)
```

---

## 🚀 GitHub Pages 자동 배포 설정

1. GitHub 저장소의 **Settings > Pages** 로 이동합니다.
2. **Build and deployment > Source** 를 **`GitHub Actions`** 로 선택합니다.
3. `main` 또는 `master` 브랜치에 코드가 푸시되면 `.github/workflows/deploy.pages.yml` 이 자동으로 `npm run build` 를 실행해 `dist/` 를 GitHub Pages에 배포합니다.

---

## 🔑 Firebase 로그인 승인 도메인 등록 (필수)

GitHub Pages 주소에서 Firebase Google 로그인을 사용하려면 Firebase 콘솔에 도메인을 추가해야 합니다:

1. [Firebase Console](https://console.firebase.google.com/) → 프로젝트(`sports-ai-makers-3c6e1`) 선택
2. **Authentication > 설정(Settings) > 승인된 도메인(Authorized Domains)**
3. **도메인 추가** 클릭 후 `<본인아이디>.github.io` 추가
