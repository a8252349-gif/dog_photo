import { FALLBACK_STORIES } from "@/lib/stories";
import type { Story } from "@/lib/types";

function normalizeStory(input: Partial<Story>): Story {
  return {
    id: String(input.id || ""),
    slug: String(input.slug || ""),
    title: String(input.title || ""),
    summary: String(input.summary || ""),
    content: String(input.content || ""),
    coverImage: String(input.coverImage || ""),
    seoTitle: String(input.seoTitle || ""),
    seoDescription: String(input.seoDescription || ""),
    status: input.status === "draft" ? "draft" : "published",
    publishedAt: String(input.publishedAt || ""),
    createdAt: String(input.createdAt || ""),
    updatedAt: String(input.updatedAt || ""),
  };
}

export async function getPublishedStories(limit = 0): Promise<Story[]> {
  const url = process.env.STORY_API_URL;
  if (!url) return limit > 0 ? FALLBACK_STORIES.slice(0, limit) : FALLBACK_STORIES;
  try {
    const separator = url.includes("?") ? "&" : "?";
    const response = await fetch(`${url}${separator}action=list&limit=${limit}`, {
      next: { revalidate: 300, tags: ["stories"] },
    });
    const body = (await response.json()) as { ok: boolean; data?: Partial<Story>[] };
    if (!body.ok || !Array.isArray(body.data)) throw new Error("Invalid story response");
    return body.data.map(normalizeStory);
  } catch (error) {
    console.error("Story API fallback", error);
    return limit > 0 ? FALLBACK_STORIES.slice(0, limit) : FALLBACK_STORIES;
  }
}

export async function getPublishedStory(slug: string): Promise<Story | null> {
  const url = process.env.STORY_API_URL;
  if (!url) return FALLBACK_STORIES.find((story) => story.slug === slug) || null;
  try {
    const separator = url.includes("?") ? "&" : "?";
    const response = await fetch(`${url}${separator}action=get&slug=${encodeURIComponent(slug)}`, {
      next: { revalidate: 300, tags: ["stories"] },
    });
    const body = (await response.json()) as { ok: boolean; data?: Partial<Story> };
    return body.ok && body.data ? normalizeStory(body.data) : null;
  } catch {
    return FALLBACK_STORIES.find((story) => story.slug === slug) || null;
  }
}

export async function storyAdminAction<T>(action: string, payload: Record<string, unknown> = {}) {
  const url = process.env.STORY_API_URL;
  const secret = process.env.STORY_API_SECRET;
  if (!url || !secret) throw new Error("STORY_API_URL 또는 STORY_API_SECRET이 설정되지 않았습니다.");
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, secret, ...payload }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`게시판 서버 오류: ${response.status}`);
  return (await response.json()) as T;
}
