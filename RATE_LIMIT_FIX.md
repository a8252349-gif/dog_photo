# 제작 요청 429 수정

기존 코드는 같은 IP에서 20분 동안 4번 요청하면 이후 요청을 모두 차단했습니다.
로컬 개발에서는 IP가 `unknown`으로 처리될 수 있어 테스트 요청이 전부 같은 사용자로 합쳐지는 문제가 있었습니다.

이번 수정 내용:

- 로컬 개발 환경에서는 제작 제한 기본 비활성화
- 운영 환경에서만 기본 활성화
- IP + 쿠폰 코드 조합으로 구분
- 기본 30분에 8회
- 사진/쿠폰 검증을 통과한 요청만 횟수 계산
- AI 제작 실패 시 횟수 복구
- 빠른 연속 클릭 방지
- 429 응답에 `Retry-After` 포함

로컬에서 제한을 완전히 끄려면 `.env.local`:

```env
GENERATE_RATE_LIMIT_ENABLED=false
```

Render 운영 권장값:

```env
GENERATE_RATE_LIMIT_ENABLED=true
GENERATE_RATE_LIMIT_MAX=8
GENERATE_RATE_LIMIT_WINDOW_MINUTES=30
```
