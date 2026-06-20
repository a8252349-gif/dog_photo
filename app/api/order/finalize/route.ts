import { NextResponse } from "next/server";
import {
  completeCoupon,
  getCouponMode,
  markResultNotification,
  saveResult,
} from "@/lib/coupon";
import { verifyOrderToken } from "@/lib/order-token";
import { notifyResult } from "@/lib/notification";
import { PRODUCT_OPTIONS, SITE } from "@/lib/site";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const sessionToken = String(form.get("sessionToken") || "");
    const image = form.get("image");

    if (!(image instanceof File) || image.size === 0) {
      throw new Error("최종 이미지를 확인해주세요.");
    }
    if (image.size > 8.5 * 1024 * 1024) {
      throw new Error("최종 이미지 용량은 8.5MB 이하여야 합니다.");
    }
    if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(image.type)) {
      throw new Error("최종 이미지 형식을 확인해주세요.");
    }

    const payload = verifyOrderToken(sessionToken);
    const bytes = Buffer.from(await image.arrayBuffer());
    const imageDataUrl = `data:${image.type};base64,${bytes.toString("base64")}`;
    const siteOrigin = new URL(request.url).origin;
    const label = payload.petName
      ? `${payload.petName} 증명사진`
      : "반려동물 증명사진";

    const saved = await saveResult({
      code: payload.code,
      phone: payload.phone,
      orderId: payload.orderId,
      imageDataUrl,
      label,
      siteOrigin,
    });

    if (!saved.ok) {
      throw new Error(saved.message || "완성사진을 저장하지 못했습니다.");
    }

    const completed = await completeCoupon(
      payload.code,
      payload.phone,
      payload.orderId,
    );

    if (!completed.ok) {
      throw new Error(
        completed.message || "이용권 사용 완료 처리에 실패했습니다.",
      );
    }

    let notification: Record<string, unknown> | undefined;

    if (saved.resultUrl) {
      const sent = await notifyResult({
        orderId: payload.orderId,
        phone: payload.phone,
        petName: payload.petName,
        fulfillmentType: payload.fulfillmentType,
        fulfillmentLabel: PRODUCT_OPTIONS[payload.fulfillmentType].label,
        resultUrl: saved.resultUrl,
        expiresAt: saved.expiresAt,
        siteName: SITE.name,
      });
      notification = sent;

      if (saved.resultToken) {
        await markResultNotification({
          code: payload.code,
          orderId: payload.orderId,
          resultToken: saved.resultToken,
          status: sent.status,
          provider: sent.provider,
          messageId: sent.messageId,
          groupId: sent.groupId,
          error: sent.error,
        }).catch((error) =>
          console.error("결과 문자 발송 기록 저장 실패", error),
        );
      }
    }

    return NextResponse.json({
      ok: true,
      resultUrl: saved.resultUrl || undefined,
      resultDataUrl:
        getCouponMode() === "demo" ? imageDataUrl : undefined,
      expiresAt: saved.expiresAt,
      fulfillmentType: payload.fulfillmentType,
      orderId: payload.orderId,
      notification,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "최종 저장 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
