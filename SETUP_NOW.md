# 바로 실행하기

## 1. Node 20 사용

```bash
nvm install 20
nvm use 20
```

프로젝트에는 `.nvmrc`, `.node-version`, `render.yaml` 모두 Node 20.20.1이 지정되어 있습니다.

## 2. 환경변수 만들기

```bash
cp .env.example .env.local
```

`.env.local`에서 아래 항목을 수정합니다.

```env
COUPON_MODE=demo
DEMO_COUPON_CODE=DEMO-PET-2026

AI_MODE=openai
OPENAI_API_KEY=sk-여기에_실제_API키
OPENAI_IMAGE_MODEL=gpt-image-1.5
OPENAI_IMAGE_QUALITY=high

ORDER_TOKEN_SECRET=영문숫자혼합_충분히긴_임의문자열
```

API 키는 `NEXT_PUBLIC_`이 붙은 변수에 넣지 않습니다. 현재 프로젝트는 서버의 `/api/order/generate`에서만 API 키를 읽습니다.

## 3. 설치 및 실행

```bash
rm -rf node_modules
npm install
npm run dev
```

브라우저 주소:

```text
http://localhost:3000/make
```

데모 쿠폰:

```text
쿠폰코드: DEMO-PET-2026
휴대전화: 01012345678
```

## 4. 실제 제작 흐름

1. 데모 쿠폰 확인
2. 상품 옵션 선택
3. 같은 반려동물 사진 1~3장 업로드
4. 눈가 보정과 배경 선택
5. OpenAI 서버 API로 실제 증명사진 생성
6. 생성 결과에서 이름/한 줄 문구 편집
7. 폰트, 굵기, 크기, 색상, 가로/세로, 위치 선택
8. 사진을 직접 누르거나 드래그해 문구 이동
9. 최종 JPG 저장

## 5. Render 환경변수

```env
NODE_VERSION=20.20.1
AI_MODE=openai
OPENAI_API_KEY=sk-실제키
OPENAI_IMAGE_MODEL=gpt-image-1.5
OPENAI_IMAGE_QUALITY=high
COUPON_MODE=demo
ORDER_TOKEN_SECRET=충분히긴임의문자열
NEXT_PUBLIC_SITE_URL=https://실제도메인
```

스마트스토어 쿠폰 서버를 연결한 뒤에는 `COUPON_MODE=apps-script`로 변경합니다.
