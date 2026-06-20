import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { sendSolapiTestMessage } from "@/lib/solapi";

function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { phone?: string; secret?: string };
    const supplied =
      request.headers.get("x-webhook-secret") || String(body.secret || "");
    const expected = process.env.SOLAPI_TEST_SECRET || "";

    if (!expected || !safeEqual(supplied, expected)) {
      return NextResponse.json(
        { ok: false, message: "테스트 요청 인증에 실패했습니다." },
        { status: 401 },
      );
    }

    const result = await sendSolapiTestMessage(String(body.phone || ""));
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "SOLAPI 테스트 발송에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}
