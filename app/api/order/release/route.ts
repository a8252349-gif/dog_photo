import { NextResponse } from "next/server";
import { releaseCoupon } from "@/lib/coupon";
import { verifyOrderToken } from "@/lib/order-token";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { sessionToken?: string };
    const payload = verifyOrderToken(String(body.sessionToken || ""));
    const result = await releaseCoupon(payload.code, payload.phone, payload.orderId);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "제작 취소에 실패했습니다." }, { status: 400 });
  }
}
