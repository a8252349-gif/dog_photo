import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { assertStoryAdmin } from "@/lib/admin";
import { cloudinaryConfigured, uploadBuffer } from "@/lib/cloudinary";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    assertStoryAdmin(request);
    if (!cloudinaryConfigured()) throw new Error("Cloudinary 환경변수를 먼저 설정해주세요.");
    const form = await request.formData(); const image = form.get("image");
    if (!(image instanceof File) || !image.type.startsWith("image/")) throw new Error("이미지 파일을 선택해주세요.");
    if (image.size > 10 * 1024 * 1024) throw new Error("이미지 용량은 10MB 이하여야 합니다.");
    const result = await uploadBuffer(Buffer.from(await image.arrayBuffer()), { publicId: `story-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`, folder: `${process.env.CLOUDINARY_FOLDER || "pet-id-photo"}/story` });
    if (!result) throw new Error("이미지 업로드 설정을 확인해주세요.");
    return NextResponse.json({ ok: true, url: result.secure_url });
  } catch (error) { return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "업로드 오류" }, { status: 400 }); }
}
