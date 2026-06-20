# 증멍사진 — Node.js · Next.js · Render 완성 프로젝트

기존 **기억사진**의 스마트스토어 쿠폰 → 홈페이지 제작 → 결과 보관 → 이야기 게시판 구조를 유지하면서, 강아지·고양이 등 반려동물 증명사진 서비스로 확장한 프로젝트입니다.

- Node.js 20 + Next.js App Router
- Render Web Service 배포
- 스마트스토어 결제 주문별 1회용 쿠폰 발급
- 같은 반려동물 사진 1~3장 업로드
- 눈물 자국 자연 정리 / 원본 유지
- 단색 배경 7종
- 디지털 / 인화 / 인화+액자 옵션 연결
- 이름·한 줄 문구를 AI가 아닌 웹 캔버스로 후처리
- 폰트 6종, 굵기, 크기, 색상, 가로·세로 방향, 3×3 위치 프리셋, 드래그 이동
- Google Drive 결과 보관과 만료 링크
- Google Sheets 기반 이야기 게시판 관리자
- RSS, sitemap.xml, robots.txt, canonical, Open Graph, JSON-LD
- 네이버·구글 사이트 소유권 확인 메타태그

## 1. 바로 로컬 테스트

```bash
npm install
cp .env.example .env.local
npm run dev
```

브라우저에서 `http://localhost:3000/make`를 열고 다음 값으로 테스트합니다.

```text
쿠폰코드: DEMO-PET-2026
휴대전화: 01012345678
```

`.env.local`의 기본값은 아래처럼 두면 API 키 없이도 전체 화면 흐름을 테스트할 수 있습니다.

```env
COUPON_MODE=demo
AI_MODE=demo
```

`AI_MODE=demo`에서는 첫 번째 업로드 사진을 선택한 배경색의 4:5 캔버스에 맞춰 결과로 돌려줍니다. **실제 정면 얼굴 재구성 테스트는 아닙니다.** 실제 제작을 시작할 때 아래처럼 변경합니다.

```env
AI_MODE=openai
OPENAI_API_KEY=sk-...
OPENAI_IMAGE_MODEL=gpt-image-1.5
OPENAI_IMAGE_QUALITY=high
```

기본 모델은 OpenAI Image API의 편집 기능에서 공식 문서로 확인되는 `gpt-image-1.5`입니다. 업로드 사진은 `input_fidelity=high`로 전달하고, 세로 결과를 2400×3000px 최종 캔버스에 맞춰 저장합니다.


### macOS에서 npm 오류가 날 때

이 프로젝트는 Node 20으로 고정되어 있습니다. 프로젝트 폴더에서 다음 순서로 실행하세요.

```bash
nvm install 20
nvm use 20
rm -rf node_modules
npm install
```

`.nvmrc`, `.node-version`, `render.yaml` 모두 Node 20.20.1을 사용하도록 맞춰져 있습니다.

## 2. 주요 페이지 트리

```text
/
├─ /products                    상품 구성
├─ /dog-id-photo                강아지 증명사진 랜딩
├─ /cat-id-photo                고양이 증명사진 랜딩
├─ /guide/photo-selection       원본 사진 선택법
├─ /guide/background-colors     배경색 7종
├─ /guide/print-frame           인화·액자 안내
├─ /story                       이야기 목록
│  └─ /story/[slug]             게시글 상세
├─ /faq                         자주 묻는 질문
├─ /about                       브랜드 소개
├─ /policy/privacy              개인정보처리방침
├─ /policy/terms                이용약관
├─ /policy/refund               취소·환불 안내
├─ /make                        쿠폰 제작 화면 · noindex
├─ /r/[token]                   결과 수령 화면 · noindex
├─ /admin/story                 게시판 관리자 · noindex
├─ /rss.xml
├─ /sitemap.xml
├─ /robots.txt
└─ /manifest.webmanifest
```

## 3. Render 배포

### Blueprint 사용

1. 이 프로젝트를 GitHub 저장소에 올립니다.
2. Render에서 **New → Blueprint**를 선택합니다.
3. 저장소의 `render.yaml`을 인식시켜 Web Service를 만듭니다.
4. Render 환경변수에 실제 값을 입력합니다.
5. 배포 후 `NEXT_PUBLIC_SITE_URL`을 Render 주소 또는 연결한 도메인으로 바꾸고 다시 배포합니다.

### 필수 운영 환경변수

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME=증멍사진
NEXT_PUBLIC_SMARTSTORE_URL=https://smartstore.naver.com/your-store
NEXT_PUBLIC_BASE_PRICE=14900

AI_MODE=openai
OPENAI_API_KEY=...

COUPON_MODE=apps-script
COUPON_API_URL=https://script.google.com/macros/s/.../exec
COUPON_API_SECRET=...
ORDER_TOKEN_SECRET=충분히-긴-무작위-문자열
SMARTSTORE_WEBHOOK_SECRET=충분히-긴-무작위-문자열

STORY_API_URL=https://script.google.com/macros/s/.../exec
STORY_API_SECRET=...
STORY_ADMIN_PASSWORD=...
```

Render는 API Route와 서버 렌더링이 필요하므로 **Static Site가 아니라 Web Service**로 배포해야 합니다.

## 4. 스마트스토어 쿠폰 자동 발급

스마트스토어 주문 결제 완료 시 Zapier, Make 또는 별도 네이버 커머스API 작업이 아래 홈페이지 엔드포인트를 호출하도록 연결합니다.

```http
POST /api/integrations/smartstore/issue
Content-Type: application/json
x-webhook-secret: SMARTSTORE_WEBHOOK_SECRET
```

```json
{
  "productOrderId": "20260619-1234567890",
  "phone": "01012345678",
  "productName": "반려동물 증명사진 제작 이용권",
  "productOption": "인화+액자 / 5x7",
  "fulfillmentType": "frame",
  "source": "smartstore-zapier",
  "paidAt": "2026-06-19T12:00:00+09:00"
}
```

성공 응답 예시:

```json
{
  "ok": true,
  "status": "issued",
  "code": "K4N7-9P2C-M6W8",
  "productOrderId": "20260619-1234567890",
  "phone": "01012345678",
  "productOption": "인화+액자 / 5x7",
  "fulfillmentType": "frame",
  "optionLocked": true
}
```

Zapier의 다음 단계에서 응답의 `code`와 홈페이지 `/make` 주소를 문자에 넣으면 됩니다. 같은 `productOrderId`가 다시 들어와도 기존 코드를 반환하도록 멱등 처리되어 있습니다.

### 쿠폰 상태 흐름

```text
available → issued → processing → redeemed
                    ↘ 실패·취소 시 issued 복구
```

- `issued`: 문자 발급 완료, 제작 가능
- `processing`: 이미지 생성 중, 중복 사용 방지
- `redeemed`: 최종 사진 저장 완료
- 생성 실패나 사용자가 결과를 취소하면 다시 `issued`
- 60분 이상 멈춘 `processing` 쿠폰은 확인 과정에서 자동 복구

## 5. Google Apps Script 설치

자세한 내용은 [`google-apps-script/README.md`](google-apps-script/README.md)를 확인합니다.

중요: 쿠폰 서버와 이야기 게시판 모두 `doGet`, `doPost`를 사용하므로 **서로 다른 Apps Script 프로젝트**로 배포해야 합니다.

### 쿠폰 서버

- 파일: `google-apps-script/CouponServer.gs`
- 기존 쿠폰 시트의 열은 유지하고 필요한 열을 오른쪽에 자동 추가합니다.
- 스마트스토어 주문 발급, 전화번호 확인, 제작 예약, 실패 복구, 사용 완료, Drive 결과 보관을 포함합니다.

### 이야기 게시판

- 파일: `google-apps-script/StoryBoard.gs`
- 관리자: `/admin/story`
- 글 목록: `/story`
- 새 글 발행 시 메인 최근 글, 상세 메타데이터, 사이트맵, RSS에 반영됩니다.

## 6. 상품 옵션 연결 원칙

스마트스토어 주문에서 받은 옵션을 홈페이지 쿠폰에 함께 저장합니다.

```text
상품 옵션에 ‘액자’ 포함 → frame
상품 옵션에 ‘인화’ 포함 → print
그 외                   → digital
```

웹훅에서 `fulfillmentType`을 `digital`, `print`, `frame` 중 하나로 명시하면 그 값을 우선합니다. 운영 모드에서 구매 옵션은 `/make` 화면에 표시되고 선택이 잠깁니다.

배송지는 홈페이지에서 다시 받지 않습니다. 인화·액자 주문은 스마트스토어 주문의 수령 정보로 처리합니다.

## 7. 이미지 제작 프롬프트

`lib/pet-prompt.ts`에 최종 프롬프트가 있습니다.

- 첫 번째 사진을 주 기준으로 사용
- 두 번째·세 번째 사진은 귀, 털 무늬, 반대쪽 얼굴 보완
- 좌우 비대칭과 개체 특징 유지
- 과도한 미용, 회춘, 눈 확대, 주둥이 축소 금지
- 눈물 자국만 선택적으로 자연 정리
- 목줄·옷·사람 손·주변 사물 제거
- 7개 배경색의 정확한 HEX 지정
- 상단 문구 안전 영역 확보
- AI 단계에서는 글자를 만들지 않음

이름과 문구는 `components/CaptionEditor.tsx`의 Canvas 렌더링으로 넣습니다.

## 8. 검색 노출 설정

### 네이버 서치어드바이저

1. 도메인을 사이트로 등록합니다.
2. 발급된 메타태그의 `content` 값을 Render의 `NAVER_SITE_VERIFICATION`에 입력합니다.
3. 배포 후 다음 주소를 제출합니다.

```text
https://도메인/sitemap.xml
https://도메인/rss.xml
```

### Google Search Console

1. 도메인 또는 URL 접두어 속성을 등록합니다.
2. HTML 태그 방식이면 `GOOGLE_SITE_VERIFICATION`에 발급 값을 입력합니다.
3. `sitemap.xml`을 제출합니다.

### 프로젝트에 반영된 기술 요소

- 각 페이지별 고유 title과 description
- 한 페이지의 핵심 H1 한 개
- canonical URL
- 서버 렌더링되는 본문과 내부 링크
- crawl 가능한 일반 `<a href>` 링크
- WebSite, Organization, Product, Article, FAQ, Breadcrumb 구조화 데이터
- 이미지 대체텍스트
- 공개 페이지와 noindex 페이지 구분
- 게시글 URL 자동 사이트맵·RSS 반영
- 모바일 반응형 구조

검색 결과의 순위나 노출 시점 자체를 보장하지는 않으며, 실제 콘텐츠 품질·도메인 상태·외부 신호·수집 주기에 따라 달라집니다.

## 9. 이야기 게시판 이미지

Cloudinary를 사용할 경우 다음 환경변수를 입력하면 관리자 화면에서 대표 이미지를 바로 업로드할 수 있습니다.

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=pet-id-photo
```

설정하지 않아도 외부 `https://` 이미지 주소나 `/public` 이미지 경로를 직접 입력해 글을 발행할 수 있습니다.

## 10. 운영 전 교체할 내용

`.env`의 아래 항목은 반드시 실제 정보로 교체합니다.

- 스마트스토어 주소
- 상호, 대표자, 사업자등록번호, 사업장 주소
- 고객센터 이메일과 전화번호
- 기본 판매가
- 개인정보처리방침의 처리자·문의처
- 이용약관과 취소·환불 정책
- 인화 규격, 액자 규격, 추가 가격, 배송 기간

맞춤 제작 상품의 취소·환불 문구와 개인정보 처리 내용은 실제 판매·운영 방식에 맞춰 최종 검토해야 합니다.

## 11. 주요 명령

```bash
npm run dev       # 개발 서버
npm run lint      # ESLint
npm run build     # 운영 빌드 확인
npm start         # Render와 같은 운영 서버 실행
```

## 10. 제작본 검증 결과

- `npm run lint` 통과
- `npm run build` 통과
- 홈, health API, sitemap.xml, rss.xml 응답 확인
- demo 쿠폰 확인과 사진 생성 API 응답 확인
- 검색 반영 기준과 공식 문서는 `SEO_REFERENCE.md`에 정리

## SOLAPI 문자와 쿠폰 스프레드시트

최신 통합본에는 다음 기능이 포함됩니다.

- 스마트스토어 주문별 이용권 1회 발급
- 상품주문번호 중복 발급 차단
- 이용권 발급 즉시 SOLAPI 문자 발송
- 완성사진 저장 후 결과 링크 문자 발송
- 이용권 문자·결과 문자 발송 상태와 메시지 ID를 스프레드시트에 기록
- 별도 `발송로그` 시트에 모든 발송 성공·실패 기록 보관

설정 순서는 `SOLAPI_COUPON_SETUP.md`와 `google-apps-script/README.md`를 참고하세요.
