"use client";

import { useEffect, useMemo, useState } from "react";
import type { Story } from "@/lib/types";

const emptyStory: Story = {
  id: "", slug: "", title: "", summary: "", content: "", coverImage: "",
  seoTitle: "", seoDescription: "", status: "draft", publishedAt: "", createdAt: "", updatedAt: "",
};

async function callApi(path: string, password: string, init: RequestInit = {}) {
  const response = await fetch(path, {
    ...init,
    headers: { "x-admin-password": password, ...(init.headers || {}) },
  });
  const body = await response.json();
  if (!response.ok || !body.ok) throw new Error(body.message || "요청을 처리하지 못했습니다.");
  return body;
}

export function AdminStoryClient() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [draft, setDraft] = useState<Story>(emptyStory);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const sorted = useMemo(() => [...stories].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()), [stories]);

  async function load(inputPassword = password) {
    setBusy(true); setMessage("");
    try {
      const body = await callApi("/api/admin/story/list", inputPassword);
      setStories(body.data || []);
      setAuthenticated(true);
      sessionStorage.setItem("story-admin-password", inputPassword);
    } catch (error) {
      setAuthenticated(false);
      setMessage(error instanceof Error ? error.message : "관리자 인증에 실패했습니다.");
    } finally { setBusy(false); }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("story-admin-password");
    if (!saved) return;
    const timer = window.setTimeout(() => {
      setPassword(saved);
      void load(saved);
    }, 0);
    return () => window.clearTimeout(timer);
    // 첫 렌더에서 저장된 비밀번호만 확인합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(status: "draft" | "published") {
    setBusy(true); setMessage("");
    try {
      const body = await callApi("/api/admin/story/save", password, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ post: { ...draft, status } }),
      });
      setDraft(body.data);
      setMessage(status === "published" ? "게시글을 발행했습니다." : "임시저장했습니다.");
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "저장에 실패했습니다."); }
    finally { setBusy(false); }
  }

  async function remove(story: Story) {
    if (!window.confirm(`‘${story.title}’ 글을 삭제할까요?`)) return;
    setBusy(true);
    try {
      await callApi("/api/admin/story/delete", password, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: story.id }) });
      if (draft.id === story.id) setDraft(emptyStory);
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "삭제에 실패했습니다."); }
    finally { setBusy(false); }
  }

  async function upload(file: File | null) {
    if (!file) return;
    setUploading(true); setMessage("");
    try {
      const form = new FormData(); form.append("image", file);
      const body = await callApi("/api/admin/story/upload", password, { method: "POST", body: form });
      setDraft((current) => ({ ...current, coverImage: body.url }));
      setMessage("대표 이미지를 업로드했습니다.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "이미지 업로드에 실패했습니다."); }
    finally { setUploading(false); }
  }

  if (!authenticated) {
    return <div className="admin-login"><div className="admin-card"><span className="eyebrow">STORY ADMIN</span><h1>이야기 게시판 관리</h1><label className="field-label">관리자 비밀번호<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void load()} /></label><button className="button button--wide" onClick={() => void load()} disabled={busy}>{busy ? "확인 중..." : "로그인"}</button>{message && <p className="form-error">{message}</p>}</div></div>;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div><span className="eyebrow">STORY ADMIN</span><h1>게시글 관리</h1></div>
        <button className="button button--secondary button--wide" onClick={() => setDraft(emptyStory)}>+ 새 글</button>
        <div className="admin-story-list">
          {sorted.map((story) => <button key={story.id} className={draft.id === story.id ? "active" : ""} onClick={() => setDraft(story)}><strong>{story.title}</strong><small>{story.status === "published" ? "발행" : "임시저장"} · {story.updatedAt ? new Date(story.updatedAt).toLocaleDateString("ko-KR") : ""}</small></button>)}
        </div>
      </aside>
      <main className="admin-editor">
        <div className="admin-toolbar"><strong>{draft.id ? "게시글 수정" : "새 게시글"}</strong><div className="button-row"><button className="button button--ghost" onClick={() => void save("draft")} disabled={busy}>임시저장</button><button className="button" onClick={() => void save("published")} disabled={busy}>발행하기</button>{draft.id && <button className="button button--danger" onClick={() => void remove(draft)} disabled={busy}>삭제</button>}</div></div>
        {message && <p className="admin-message">{message}</p>}
        <div className="admin-form-grid">
          <label className="field-label">제목<input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
          <label className="field-label">슬러그 <span>비워두면 제목으로 자동 생성</span><input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} /></label>
          <label className="field-label admin-span-2">요약<textarea rows={3} value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} /></label>
          <label className="field-label">대표 이미지 주소<input value={draft.coverImage} onChange={(e) => setDraft({ ...draft, coverImage: e.target.value })} placeholder="https://... 또는 /sample..." /></label>
          <label className="field-label">대표 이미지 업로드 <span>Cloudinary 설정 시 사용</span><input type="file" accept="image/*" onChange={(e) => void upload(e.target.files?.[0] || null)} disabled={uploading} /></label>
          <label className="field-label">SEO 제목<input value={draft.seoTitle} onChange={(e) => setDraft({ ...draft, seoTitle: e.target.value })} /></label>
          <label className="field-label">SEO 설명<input value={draft.seoDescription} onChange={(e) => setDraft({ ...draft, seoDescription: e.target.value })} /></label>
          <label className="field-label admin-span-2">본문 <span>Markdown: ## 소제목, - 목록, ![설명](이미지주소)</span><textarea className="admin-content" rows={24} value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} /></label>
        </div>
      </main>
    </div>
  );
}
