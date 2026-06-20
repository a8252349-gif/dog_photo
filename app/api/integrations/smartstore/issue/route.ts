import crypto from "node:crypto";
import { NextResponse } from "next/server";
import {
  issueCouponFromSmartStore,
  markCouponNotification,
} from "@/lib/coupon";
import { notifyCouponIssued } from "@/lib/notification";

function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const supplied =
      request.headers.get("x-webhook-secret") ||
      String(body.webhookSecret || "");
    const expected = process.env.SMARTSTORE_WEBHOOK_SECRET || "";

    if (!expected || !safeEqual(supplied, expected)) {
      return NextResponse.json(
        { ok: false, message: "웹훅 인증에 실패했습니다." },
        { status: 401 },
      );
    }

    const productOrderId = String(
      body.productOrderId || body.product_order_id || "",
    ).trim();
    const phone = String(body.phone || body.recipientPhone || "").trim();

    if (!productOrderId || !phone) {
      return NextResponse.json(
        { ok: false, message: "상품주문번호와 수신번호가 필요합니다." },
        { status: 400 },
      );
    }

    const productOption = String(
      body.productOption || body.option || "디지털 파일",
    );

    const result = (await issueCouponFromSmartStore({
      productOrderId,
      phone,
      productName: String(body.productName || "반려동물 증명사진"),
      productOption,
      fulfillmentType: String(body.fulfillmentType || ""),
      source: String(body.source || "smartstore-webhook"),
      paidAt: String(body.paidAt || new Date().toISOString()),
    })) as {
      ok?: boolean;
      code?: string;
      alreadyIssued?: boolean;
      productOption?: string;
      message?: string;
    };

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    const shouldResend = body.resend === true || body.resend === "true";
    let notification: Record<string, unknown> = {
      ok: true,
      status:
        result.alreadyIssued && !shouldResend
          ? "duplicate_skipped"
          : "pending",
    };

    if (result.code && (!result.alreadyIssued || shouldResend)) {
      const sent = await notifyCouponIssued({
        phone,
        code: result.code,
        productOption: result.productOption || productOption,
      });
      notification = sent;

      await markCouponNotification({
        code: result.code,
        productOrderId,
        status: sent.status,
        provider: sent.provider,
        messageId: sent.messageId,
        groupId: sent.groupId,
        error: sent.error,
      }).catch((error) =>
        console.error("쿠폰 문자 발송 기록 저장 실패", error),
      );
    }

    return NextResponse.json({ ...result, notification });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "쿠폰 발급 연동에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}
