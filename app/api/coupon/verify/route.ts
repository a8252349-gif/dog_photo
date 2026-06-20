import { NextResponse } from "next/server";
import { verifyCoupon } from "@/lib/coupon";
import { checkRateLimit, requestIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const limit = checkRateLimit(`coupon:${requestIp(request)}`, 12, 10 * 60 * 1000);
    if (!limit.ok) return NextResponse.json({ ok: false, message: "잠시 후 다시 시도해주세요." }, { status: 429 });
    const body = await request.json() as { code?: string; phone?: string };
    const result = await verifyCoupon(String(body.code || ""), String(body.phone || ""));
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "이용권 확인 중 오류가 발생했습니다." }, { status: 500 });
  }
}
