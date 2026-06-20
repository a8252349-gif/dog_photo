# 전체 업데이트 내역

- 로고를 `public/brand-logo.png`로 반영하고 헤더/푸터에 적용했습니다.
- 고양이 샘플 3장을 `public/sample-cat-*.jpg`로 추가했습니다.
- 메인 샘플 카드에 고양이 예시를 포함했습니다.
- `app/cat-id-photo/page.tsx`에 고양이 샘플 갤러리를 추가했습니다.
- 프롬프트는 강아지/고양이 모두 `정면 응시 + 머리/목 수직 정렬 + 상반신 + 5:7` 기준으로 유지됩니다.
- 제작 요청 429는 `GENERATE_RATE_LIMIT_*` 환경변수로 조절합니다.
  - 로컬 개발 추천: `GENERATE_RATE_LIMIT_ENABLED=false`
  - 운영 추천: `GENERATE_RATE_LIMIT_ENABLED=true`, `GENERATE_RATE_LIMIT_MAX=8`, `GENERATE_RATE_LIMIT_WINDOW_MINUTES=30`

## 2026-06-20 추가 변경
- `/make`를 제외한 모든 페이지 우측 하단에 `증멍사진 만들기` 고정 버튼을 추가했습니다.
- 고정 버튼은 `/make`로 이동합니다.
- `/make` 상단에 `쿠폰 구매하러 가기` 안내 배너와 스마트스토어 링크를 추가했습니다.
