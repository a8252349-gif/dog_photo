import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { assertStoryAdmin } from "@/lib/admin";
import { storyAdminAction } from "@/lib/story-service";
export async function POST(request: Request) {
  try { assertStoryAdmin(request); const body = await request.json() as { id?: string }; const result = await storyAdminAction<{ ok: boolean; message?: string }>("delete", { id: String(body.id || "") }); if (result.ok) { revalidateTag("stories", "max"); revalidatePath("/"); revalidatePath("/story"); } return NextResponse.json(result, { status: result.ok ? 200 : 400 }); }
  catch (error) { return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "삭제 오류" }, { status: 400 }); }
}
