import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { assertStoryAdmin } from "@/lib/admin";
import { storyAdminAction } from "@/lib/story-service";
export async function POST(request: Request) {
  try {
    assertStoryAdmin(request); const body = await request.json() as { post?: Record<string, unknown> };
    const result = await storyAdminAction<{ ok: boolean; data?: { slug?: string }; message?: string }>("upsert", { post: body.post || {} });
    if (result.ok) { revalidateTag("stories", "max"); revalidatePath("/"); revalidatePath("/story"); if (result.data?.slug) revalidatePath(`/story/${result.data.slug}`); }
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) { return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "저장 오류" }, { status: 400 }); }
}
