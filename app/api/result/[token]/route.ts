import { NextResponse } from "next/server";
import { getResult } from "@/lib/coupon";

export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const result = await getResult(token, true) as { ok?: boolean; message?: string };
    return NextResponse.json(result, { status: result.ok ? 200 : 404, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "결과를 불러오지 못했습니다." }, { status: 500 });
  }
}
