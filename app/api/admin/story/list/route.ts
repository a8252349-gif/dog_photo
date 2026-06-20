import { NextResponse } from "next/server";
import { assertStoryAdmin } from "@/lib/admin";
import { storyAdminAction } from "@/lib/story-service";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try { assertStoryAdmin(request); const body = await storyAdminAction<{ ok: boolean; data?: unknown; message?: string }>("list"); return NextResponse.json(body, { status: body.ok ? 200 : 400 }); }
  catch (error) { return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "관리자 요청 오류" }, { status: 401 }); }
}
