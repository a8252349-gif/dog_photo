import type { CouponInfo, FulfillmentType } from "@/lib/types";

const mode = process.env.COUPON_MODE || "demo";
const demoCode = (process.env.DEMO_COUPON_CODE || "DEMO-PET-2026").toUpperCase();

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

async function postCouponAction<T extends Record<string, unknown>>(
  action: string,
  payload: Record<string, unknown>,
): Promise<T> {
  const url = process.env.COUPON_API_URL;
  const secret = process.env.COUPON_API_SECRET;
  if (!url || !secret) {
    throw new Error("COUPON_API_URL 또는 COUPON_API_SECRET이 설정되지 않았습니다.");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, secret, ...payload }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`쿠폰 서버 응답 오류: ${response.status}`);
  return (await response.json()) as T;
}

export async function verifyCoupon(codeRaw: string, phoneRaw: string): Promise<CouponInfo> {
  const code = normalizeCode(codeRaw);
  const phone = normalizePhone(phoneRaw);

  if (mode === "demo") {
    if (code !== demoCode) {
      return { ok: false, status: "invalid", message: `테스트 코드는 ${demoCode}입니다.` };
    }
    if (phone.length < 10) {
      return { ok: false, status: "invalid_phone", message: "휴대전화 번호를 확인해주세요." };
    }
    return {
      ok: true,
      status: "issued",
      message: "테스트 이용권이 확인되었습니다.",
      code,
      productOrderId: "DEMO-ORDER",
      productOption: "테스트 중 직접 선택",
      fulfillmentType: "digital",
      optionLocked: false,
    };
  }

  return postCouponAction<CouponInfo>("verify", { code, phone });
}

export async function reserveCoupon(input: {
  code: string;
  phone: string;
  orderId: string;
  backgroundKey: string;
  tearOption: string;
  petName: string;
  fulfillmentType: FulfillmentType;
}) {
  if (mode === "demo") {
    return { ok: true, status: "processing", message: "테스트 이용권이 예약되었습니다." };
  }
  return postCouponAction<{ ok: boolean; status: string; message: string }>("reserve", {
    ...input,
    code: normalizeCode(input.code),
    phone: normalizePhone(input.phone),
  });
}

export async function releaseCoupon(code: string, phone: string, orderId: string) {
  if (mode === "demo") return { ok: true, status: "issued", message: "테스트 이용권이 다시 사용 가능 상태가 되었습니다." };
  return postCouponAction<{ ok: boolean; status: string; message: string }>("release", {
    code: normalizeCode(code),
    phone: normalizePhone(phone),
    orderId,
  });
}

export async function completeCoupon(code: string, phone: string, orderId: string) {
  if (mode === "demo") return { ok: true, status: "redeemed", message: "테스트 이용권 사용이 완료되었습니다." };
  return postCouponAction<{ ok: boolean; status: string; message: string }>("complete", {
    code: normalizeCode(code),
    phone: normalizePhone(phone),
    orderId,
  });
}

export async function saveResult(input: {
  code: string;
  phone: string;
  orderId: string;
  imageDataUrl: string;
  label: string;
  siteOrigin: string;
}) {
  if (mode === "demo") {
    return {
      ok: true,
      status: "ready",
      resultToken: `demo-${input.orderId}`,
      resultUrl: "",
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    };
  }
  return postCouponAction<{
    ok: boolean;
    status: string;
    message?: string;
    resultToken?: string;
    resultUrl?: string;
    expiresAt?: string;
  }>("save_result", {
    code: normalizeCode(input.code),
    phone: normalizePhone(input.phone),
    orderId: input.orderId,
    imageDataUrl: input.imageDataUrl,
    label: input.label,
    siteOrigin: input.siteOrigin,
  });
}

export async function getResult(resultToken: string, includeFile: boolean) {
  if (mode === "demo") {
    return { ok: false, status: "demo", message: "테스트 결과는 제작 화면에서 바로 내려받아주세요." };
  }
  return postCouponAction<Record<string, unknown>>(
    includeFile ? "get_result_file" : "get_result",
    { resultToken },
  );
}

export async function issueCouponFromSmartStore(payload: Record<string, unknown>) {
  if (mode === "demo") {
    return { ok: true, status: "issued", code: demoCode, message: "테스트 쿠폰이 발급되었습니다." };
  }
  return postCouponAction<Record<string, unknown>>("issue", payload);
}

export async function markCouponNotification(input: {
  code: string;
  productOrderId: string;
  status: string;
  provider?: string;
  messageId?: string;
  groupId?: string;
  error?: string;
}) {
  if (mode === "demo") {
    return { ok: true, status: "logged", message: "테스트 이용권 문자 기록을 저장했습니다." };
  }
  return postCouponAction<{ ok: boolean; status: string; message: string }>(
    "mark_coupon_notified",
    input,
  );
}

export async function markResultNotification(input: {
  code: string;
  orderId: string;
  resultToken: string;
  status: string;
  provider?: string;
  messageId?: string;
  groupId?: string;
  error?: string;
}) {
  if (mode === "demo") {
    return { ok: true, status: "logged", message: "테스트 결과 문자 기록을 저장했습니다." };
  }
  return postCouponAction<{ ok: boolean; status: string; message: string }>(
    "mark_result_notified",
    input,
  );
}

export function getCouponMode() {
  return mode;
}
