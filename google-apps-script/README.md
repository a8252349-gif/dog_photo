# 증멍사진 쿠폰 스프레드시트 연결

## 1. Google 스프레드시트 만들기

제공된 `증멍사진_쿠폰관리_템플릿.xlsx`를 Google Drive에 업로드한 뒤 Google 스프레드시트로 열거나, 빈 스프레드시트에서 `CouponServer.gs`의 `setupCouponServer()`를 실행하세요.

기본 시트 이름은 다음과 같습니다.

- `쿠폰목록`
- `발송로그`
- `상품옵션`
- `설정안내`

## 2. 결과 저장 폴더 만들기

Google Drive에서 완성사진을 보관할 폴더를 하나 만든 뒤 주소의 폴더 ID를 복사합니다.

예시:

`https://drive.google.com/drive/folders/여기가_폴더_ID`

## 3. Apps Script 붙여넣기

스프레드시트에서 `확장 프로그램 → Apps Script`를 열고 기존 코드를 모두 지운 뒤 `CouponServer.gs` 전체를 붙여넣습니다.

## 4. 스크립트 속성

Apps Script의 `프로젝트 설정 → 스크립트 속성`에 다음 값을 추가합니다.

- `COUPON_API_SECRET`: Render의 `COUPON_API_SECRET`과 같은 긴 임의 문자열
- `COUPON_SPREADSHEET_ID`: 스프레드시트 주소의 ID
- `COUPON_SHEET_NAME`: `쿠폰목록`
- `RESULT_FOLDER_ID`: 결과 저장용 Google Drive 폴더 ID
- `RESULT_RETENTION_DAYS`: `7`

## 5. 초기 함수 실행

Apps Script 편집기에서 아래 함수를 차례로 실행하고 권한을 승인합니다.

1. `setupCouponServer`
2. 쿠폰이 없다면 `generateCouponCodes`를 선택한 후 함수 입력값으로 `500`을 전달

Apps Script 편집기에서 매개변수 함수 실행이 불편하다면 임시로 아래 함수를 추가하고 실행한 뒤 삭제해도 됩니다.

```javascript
function generate500Coupons() {
  return generateCouponCodes(500);
}
```

## 6. 웹 앱 배포

`배포 → 새 배포 → 웹 앱`에서 다음과 같이 설정합니다.

- 실행 사용자: 나
- 액세스 권한: 모든 사용자

배포 후 `/exec`로 끝나는 URL을 Render의 `COUPON_API_URL`에 입력합니다.

Apps Script 웹 앱은 `doPost(e)`로 홈페이지 요청을 받고 JSON을 반환합니다.

## 7. 만료 파일 자동 정리

Apps Script의 트리거 메뉴에서 `deleteExpiredResults`를 하루 1회 실행하도록 설정하면 만료된 결과 파일을 휴지통으로 이동합니다.
