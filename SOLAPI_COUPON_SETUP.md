# SOLAPI + 쿠폰 스프레드시트 설정 순서

## Render 환경변수

```env
COUPON_MODE=apps-script
COUPON_API_URL=https://script.google.com/macros/s/배포ID/exec
COUPON_API_SECRET=Apps-Script와-동일한-긴-문자열
SMARTSTORE_WEBHOOK_SECRET=스마트스토어-연동용-긴-문자열

SOLAPI_API_KEY=발급받은_API_KEY
SOLAPI_API_SECRET=발급받은_API_SECRET
SOLAPI_SENDER_NUMBER=등록완료된_발신번호
SOLAPI_TEST_SECRET=문자테스트용_긴-문자열
```

번호에는 하이픈을 넣어도 코드에서 제거하지만, 환경변수에는 숫자만 입력하는 것을 권장합니다.

## SOLAPI 문자 테스트

로컬 서버가 실행 중일 때:

```bash
curl -X POST http://localhost:3000/api/integrations/solapi/test \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: SOLAPI_TEST_SECRET에_넣은_값" \
  -d '{"phone":"01012345678"}'
```

성공 예시:

```json
{
  "ok": true,
  "provider": "solapi",
  "status": "sent",
  "groupId": "...",
  "messageId": "..."
}
```

## 쿠폰 발급 테스트

```bash
curl -X POST http://localhost:3000/api/integrations/smartstore/issue \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: SMARTSTORE_WEBHOOK_SECRET에_넣은_값" \
  -d '{
    "productOrderId":"TEST-ORDER-001",
    "phone":"01012345678",
    "productName":"증멍사진 제작 이용권",
    "productOption":"디지털 파일",
    "fulfillmentType":"digital",
    "source":"manual-test"
  }'
```

처음 요청하면 빈 쿠폰 하나를 발급하고 이용권 문자를 보냅니다. 같은 상품주문번호로 다시 호출하면 쿠폰을 중복 발급하거나 문자를 중복 발송하지 않습니다.

문자만 다시 보내야 할 때는 JSON에 `"resend": true`를 추가합니다.

## 상품 옵션 값

- `digital`: 디지털 파일
- `print`: 디지털 파일 + 인화
- `frame`: 디지털 파일 + 인화 + 액자

스마트스토어 옵션명에 `액자`가 포함되면 `frame`, `인화`가 포함되면 `print`, 둘 다 없으면 `digital`로 자동 분류됩니다.
