"use client";

import { useEffect, useState } from "react";

export function ResultViewer({ token }: { token: string }) {
  const [state, setState] = useState<{
    loading: boolean;
    error?: string;
    base64?: string;
    mimeType?: string;
    fileName?: string;
    expiresAt?: string;
    label?: string;
  }>({ loading: true });

  useEffect(() => {
    fetch(`/api/result/${encodeURIComponent(token)}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok || !body.ok) throw new Error(body.message || "완성사진을 불러오지 못했습니다.");
        return body;
      })
      .then((body) => setState({ loading: false, ...body }))
      .catch((error) => setState({
        loading: false,
        error: error instanceof Error ? error.message : "완성사진을 불러오지 못했습니다.",
      }));
  }, [token]);

  if (state.loading) return <div className="result-page-card"><p>완성사진을 불러오는 중입니다...</p></div>;
  if (state.error || !state.base64) return <div className="result-page-card"><h1>결과를 열 수 없습니다.</h1><p>{state.error}</p></div>;

  const src = `data:${state.mimeType || "image/jpeg"};base64,${state.base64}`;
  return (
    <div className="result-page-card">
      <span className="eyebrow">YOUR PET ID PHOTO</span>
      <h1>{state.label || "완성사진"}</h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="result-image" src={src} alt={state.label || "완성된 반려동물 증명사진"} />
      <a className="button button--wide" href={src} download={state.fileName || "pet-id-photo.jpg"}>고화질 사진 내려받기</a>
      {state.expiresAt && <p className="form-note">이 링크는 {new Intl.DateTimeFormat("ko-KR").format(new Date(state.expiresAt))}까지 열 수 있습니다.</p>}
    </div>
  );
}
