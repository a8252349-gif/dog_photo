export function assertStoryAdmin(request: Request) {
  const expected = process.env.STORY_ADMIN_PASSWORD;
  const provided = request.headers.get("x-admin-password") || "";
  if (!expected || provided !== expected) throw new Error("관리자 인증에 실패했습니다.");
}
