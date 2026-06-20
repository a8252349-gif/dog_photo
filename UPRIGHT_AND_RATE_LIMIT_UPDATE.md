# 머리·목 정렬 및 429 개선

- 정면 응시뿐 아니라 머리와 목의 세로축을 일직선으로 강제
- 좌우 고개 기울기, 목 굽힘, 질문하는 듯한 포즈 금지
- 로컬 개발 제작 제한 기본 비활성화
- 운영에서는 IP+쿠폰 기준 기본 30분 8회
- 빠른 중복 클릭 차단
- 실제 OpenAI 429/5xx는 최대 3회 지수 백오프 재시도

로컬 `.env.local`:

```env
GENERATE_RATE_LIMIT_ENABLED=false
OPENAI_MAX_RETRIES=3
```

Render:

```env
GENERATE_RATE_LIMIT_ENABLED=true
GENERATE_RATE_LIMIT_MAX=8
GENERATE_RATE_LIMIT_WINDOW_MINUTES=30
OPENAI_MAX_RETRIES=3
```
