import crypto from "node:crypto";
import { NextResponse } from "next/server";
import {
  verifyCoupon,
  reserveCoupon,
  releaseCoupon,
  normalizePhone,
} from "@/lib/coupon";
import { generatePetPortrait } from "@/lib/image-generation";
import { signOrderToken } from "@/lib/order-token";
import {
  checkRateLimit,
  generateRateLimitEnabled,
  getGenerateRateLimitConfig,
  refundRateLimit,
  requestIp,
} from "@/lib/rate-limit";
import type {
  BackgroundKey,
  FulfillmentType,
  TearOption,
} from "@/lib/types";
import { BACKGROUNDS } from "@/lib/backgrounds";
import { PRODUCT_OPTIONS } from "@/lib/site";

const fulfillmentTypes = new Set<FulfillmentType>([
  "digital",
  "print",
  "frame",
]);
const tearOptions = new Set<TearOption>(["clean", "preserve"]);

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  let reserved: { code: string; phone: string; orderId: string } | null = null;
  let consumedRateLimitKey: string | null = null;

  try {
    /*
     * 먼저 폼과 이용권을 검증합니다.
     * 사진 누락이나 잘못된 쿠폰 때문에 발생한 요청은 제작 횟수 제한에 포함하지 않습니다.
     */
    const form = await request.formData();
    const code = String(form.get("code") || "")
      .trim()
      .toUpperCase();
    const phone = normalizePhone(String(form.get("phone") || ""));
    const petName = String(form.get("petName") || "")
      .trim()
      .slice(0, 12);
    const backgroundKey = String(
      form.get("backgroundKey") || "butter-yellow",
    ) as BackgroundKey;
    const tearOption = String(
      form.get("tearOption") || "clean",
    ) as TearOption;
    const requestedFulfillment = String(
      form.get("fulfillmentType") || "digital",
    ) as FulfillmentType;
    const images = form
      .getAll("images")
      .filter(
        (item): item is File => item instanceof File && item.size > 0,
      );

    if (!(backgroundKey in BACKGROUNDS)) {
      throw new Error("배경색 선택을 확인해주세요.");
    }

    if (!tearOptions.has(tearOption)) {
      throw new Error("눈가 보정 옵션을 확인해주세요.");
    }

    if (!fulfillmentTypes.has(requestedFulfillment)) {
      throw new Error("상품 구성을 확인해주세요.");
    }

    if (images.length < 1 || images.length > 3) {
      throw new Error("같은 반려동물 사진을 1~3장 올려주세요.");
    }

    const coupon = await verifyCoupon(code, phone);
    if (!coupon.ok) {
      return NextResponse.json(coupon, { status: 400 });
    }

    const fulfillmentType =
      coupon.optionLocked && coupon.fulfillmentType
        ? coupon.fulfillmentType
        : requestedFulfillment;

    if (!fulfillmentTypes.has(fulfillmentType)) {
      throw new Error("스마트스토어 상품 옵션을 확인하지 못했습니다.");
    }

    /*
     * 운영 환경에서만 기본 활성화됩니다.
     * IP 하나만 기준으로 잡지 않고 IP + 쿠폰 코드 조합으로 제한해
     * 여러 고객이 같은 네트워크를 쓰더라도 서로 영향을 주지 않게 합니다.
     */
    if (generateRateLimitEnabled()) {
      const { limit, windowMs } = getGenerateRateLimitConfig();
      const rateLimitKey = `generate:${requestIp(request)}:${code}`;
      const rate = checkRateLimit(rateLimitKey, limit, windowMs);

      if (!rate.ok) {
        const retryMinutes = Math.max(
          1,
          Math.ceil(rate.retryAfterSeconds / 60),
        );

        return NextResponse.json(
          {
            ok: false,
            message: `제작 요청이 연속으로 너무 많이 접수되었습니다. 약 ${retryMinutes}분 후 다시 시도해주세요.`,
            retryAfterSeconds: rate.retryAfterSeconds,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(rate.retryAfterSeconds),
              "X-RateLimit-Limit": String(limit),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": String(rate.resetAt),
            },
          },
        );
      }

      consumedRateLimitKey = rateLimitKey;
    }

    const orderId = `PET-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;

    const reserve = await reserveCoupon({
      code,
      phone,
      orderId,
      backgroundKey,
      tearOption,
      petName,
      fulfillmentType,
    });

    if (!reserve.ok) {
      throw new Error(
        reserve.message || "이용권을 제작 상태로 변경하지 못했습니다.",
      );
    }

    reserved = { code, phone, orderId };

    const { buffer, usage } = await generatePetPortrait({
      images,
      backgroundKey,
      tearOption,
    });

    const now = Date.now();
    const sessionToken = signOrderToken({
      code,
      phone,
      orderId,
      petName,
      fulfillmentType,
      iat: now,
      exp: now + 45 * 60 * 1000,
    });

    return NextResponse.json({
      ok: true,
      imageDataUrl: `data:image/jpeg;base64,${buffer.toString("base64")}`,
      sessionToken,
      orderId,
      fulfillmentLabel: PRODUCT_OPTIONS[fulfillmentType].label,
      aiMode:
        process.env.AI_MODE ||
        (process.env.OPENAI_API_KEY ? "openai" : "demo"),
      aiUsage: usage,
    });
  } catch (error) {
    if (reserved) {
      await releaseCoupon(
        reserved.code,
        reserved.phone,
        reserved.orderId,
      ).catch(() => undefined);
    }

    // AI 호출·저장 중 실패했다면 재시도할 수 있도록 제한 횟수를 되돌립니다.
    if (consumedRateLimitKey) {
      refundRateLimit(consumedRateLimitKey);
    }

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "사진 제작 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
