"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CaptionDirection,
  CaptionFontKey,
  CaptionMode,
  CaptionWeight,
} from "@/lib/types";

const FONT_OPTIONS: Array<{
  key: CaptionFontKey;
  label: string;
  family: string;
  description: string;
}> = [
  {
    key: "noto-sans",
    label: "노토 산스",
    family: "Noto Sans KR",
    description: "단정하고 가장 무난한 기본 글꼴",
  },
  {
    key: "ibm-plex",
    label: "IBM 플렉스",
    family: "IBM Plex Sans KR",
    description: "반듯하고 현대적인 인상",
  },
  {
    key: "gowun-dodum",
    label: "고운 돋움",
    family: "Gowun Dodum",
    description: "부드럽고 자연스러운 감성",
  },
  {
    key: "noto-serif",
    label: "노토 세리프",
    family: "Noto Serif KR",
    description: "차분하고 고급스러운 명조",
  },
  {
    key: "nanum-myeongjo",
    label: "나눔 명조",
    family: "Nanum Myeongjo",
    description: "사진 엽서 같은 클래식한 느낌",
  },
  {
    key: "inter",
    label: "Inter",
    family: "Inter",
    description: "영문 이름에 어울리는 깔끔한 글꼴",
  },
];

const COLOR_PRESETS = ["#FFFFFF", "#111827", "#22313A", "#7A5736", "#B43A3A", "#F2E6D4"];

const POSITION_PRESETS = [
  { label: "왼쪽 위", x: 18, y: 15 },
  { label: "가운데 위", x: 50, y: 15 },
  { label: "오른쪽 위", x: 82, y: 15 },
  { label: "왼쪽 중간", x: 18, y: 50 },
  { label: "정중앙", x: 50, y: 50 },
  { label: "오른쪽 중간", x: 82, y: 50 },
  { label: "왼쪽 아래", x: 18, y: 86 },
  { label: "가운데 아래", x: 50, y: 86 },
  { label: "오른쪽 아래", x: 82, y: 86 },
];

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("이미지를 저장하지 못했습니다."))),
      "image/jpeg",
      0.95,
    );
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function splitCharacters(text: string) {
  return Array.from(text.replace(/\s+/g, " ").trim());
}

function getFontFamily(fontKey: CaptionFontKey) {
  return FONT_OPTIONS.find((font) => font.key === fontKey)?.family || "Noto Sans KR";
}

function fitHorizontalFontSize({
  context,
  text,
  family,
  weight,
  desiredSize,
  maxWidth,
}: {
  context: CanvasRenderingContext2D;
  text: string;
  family: string;
  weight: CaptionWeight;
  desiredSize: number;
  maxWidth: number;
}) {
  let size = desiredSize;
  while (size > 36) {
    context.font = `${weight} ${size}px "${family}", sans-serif`;
    if (context.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  return size;
}

function drawHorizontalCaption({
  context,
  canvas,
  x,
  y,
  name,
  line,
  mode,
  family,
  weight,
  fontSize,
}: {
  context: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  x: number;
  y: number;
  name: string;
  line: string;
  mode: CaptionMode;
  family: string;
  weight: CaptionWeight;
  fontSize: number;
}) {
  const safeName = (name.trim() || "우리 아이").slice(0, 20);
  const safeLine = line.trim().slice(0, 40);
  const mainSize = fitHorizontalFontSize({
    context,
    text: safeName,
    family,
    weight,
    desiredSize: fontSize,
    maxWidth: canvas.width * 0.82,
  });
  const subSize = Math.max(30, Math.round(mainSize * 0.43));
  const hasLine = mode === "name-line" && Boolean(safeLine);
  const nameY = hasLine ? y - mainSize * 0.24 : y;

  context.font = `${weight} ${mainSize}px "${family}", sans-serif`;
  context.fillText(safeName, x, nameY);

  if (hasLine) {
    context.font = `${Math.min(weight, 600)} ${subSize}px "${family}", sans-serif`;
    context.fillText(safeLine, x, nameY + mainSize * 0.82);
  }
}

function drawVerticalColumn({
  context,
  text,
  x,
  centerY,
  family,
  weight,
  fontSize,
  maxHeight,
}: {
  context: CanvasRenderingContext2D;
  text: string;
  x: number;
  centerY: number;
  family: string;
  weight: CaptionWeight;
  fontSize: number;
  maxHeight: number;
}) {
  const characters = splitCharacters(text);
  if (characters.length === 0) return { width: 0, size: fontSize };

  let size = fontSize;
  let gap = size * 1.12;
  while (characters.length * gap > maxHeight && size > 34) {
    size -= 2;
    gap = size * 1.12;
  }

  context.font = `${weight} ${size}px "${family}", sans-serif`;
  const totalHeight = characters.length * gap;
  const startY = centerY - totalHeight / 2 + gap / 2;

  characters.forEach((character, index) => {
    context.fillText(character, x, startY + index * gap);
  });

  return { width: size, size };
}

function drawVerticalCaption({
  context,
  canvas,
  x,
  y,
  name,
  line,
  mode,
  family,
  weight,
  fontSize,
}: {
  context: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  x: number;
  y: number;
  name: string;
  line: string;
  mode: CaptionMode;
  family: string;
  weight: CaptionWeight;
  fontSize: number;
}) {
  const safeName = (name.trim() || "우리 아이").slice(0, 12);
  const safeLine = line.trim().slice(0, 18);
  const maxHeight = canvas.height * 0.76;
  const hasLine = mode === "name-line" && Boolean(safeLine);
  const columnGap = fontSize * 0.72;
  const nameX = hasLine ? x + columnGap * 0.42 : x;

  const main = drawVerticalColumn({
    context,
    text: safeName,
    x: nameX,
    centerY: y,
    family,
    weight,
    fontSize,
    maxHeight,
  });

  if (hasLine) {
    drawVerticalColumn({
      context,
      text: safeLine,
      x: x - main.width * 0.78,
      centerY: y,
      family,
      weight: Math.min(weight, 600) as CaptionWeight,
      fontSize: Math.max(34, Math.round(main.size * 0.48)),
      maxHeight,
    });
  }
}

export function CaptionEditor({
  imageDataUrl,
  sessionToken,
  defaultPetName,
  onCancel,
}: {
  imageDataUrl: string;
  sessionToken: string;
  defaultPetName: string;
  onCancel: () => Promise<void>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draggingRef = useRef(false);
  const [mode, setMode] = useState<CaptionMode>(defaultPetName ? "name" : "none");
  const [name, setName] = useState(defaultPetName);
  const [line, setLine] = useState("");
  const [fontKey, setFontKey] = useState<CaptionFontKey>("noto-sans");
  const [fontSize, setFontSize] = useState(132);
  const [fontWeight, setFontWeight] = useState<CaptionWeight>(600);
  const [direction, setDirection] = useState<CaptionDirection>("horizontal");
  const [color, setColor] = useState("#FFFFFF");
  const [xPercent, setXPercent] = useState(50);
  const [yPercent, setYPercent] = useState(15);
  const [shadow, setShadow] = useState(true);
  const [finalizing, setFinalizing] = useState(false);
  const [result, setResult] = useState<{
    resultUrl?: string;
    resultDataUrl?: string;
    expiresAt?: string;
    previewDataUrl: string;
  } | null>(null);
  const [error, setError] = useState("");

  const selectedFont = useMemo(() => getFontFamily(fontKey), [fontKey]);

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const image = new Image();
    image.src = imageDataUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("미리보기 이미지를 불러오지 못했습니다."));
    });

    canvas.width = image.naturalWidth || 2500;
    canvas.height = image.naturalHeight || 3500;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    if (mode === "none") return;

    try {
      await document.fonts.load(`${fontWeight} ${fontSize}px "${selectedFont}"`);
      await document.fonts.ready;
    } catch {
      // 외부 폰트가 일시적으로 늦어지면 시스템 폰트로 먼저 렌더링합니다.
    }

    const x = (canvas.width * xPercent) / 100;
    const y = (canvas.height * yPercent) / 100;

    context.save();
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = color;
    if (shadow) {
      context.shadowColor = color.toUpperCase() === "#FFFFFF" ? "rgba(25, 25, 25, 0.42)" : "rgba(255, 255, 255, 0.34)";
      context.shadowBlur = Math.round(canvas.width * 0.008);
      context.shadowOffsetY = Math.round(canvas.width * 0.003);
    }

    if (direction === "horizontal") {
      drawHorizontalCaption({
        context,
        canvas,
        x,
        y,
        name,
        line,
        mode,
        family: selectedFont,
        weight: fontWeight,
        fontSize,
      });
    } else {
      drawVerticalCaption({
        context,
        canvas,
        x,
        y,
        name,
        line,
        mode,
        family: selectedFont,
        weight: fontWeight,
        fontSize,
      });
    }

    context.restore();
  }, [
    color,
    direction,
    fontSize,
    fontWeight,
    imageDataUrl,
    line,
    mode,
    name,
    selectedFont,
    shadow,
    xPercent,
    yPercent,
  ]);

  useEffect(() => {
    draw().catch((err) => setError(err instanceof Error ? err.message : "미리보기 오류"));
  }, [draw]);

  function updatePositionFromPointer(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas || mode === "none") return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    setXPercent(clamp(((clientX - rect.left) / rect.width) * 100, 4, 96));
    setYPercent(clamp(((clientY - rect.top) / rect.height) * 100, 4, 96));
  }

  async function finalize() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setFinalizing(true);
    setError("");

    try {
      await draw();
      const previewDataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const blob = await canvasToBlob(canvas);
      const form = new FormData();
      form.append("sessionToken", sessionToken);
      form.append("image", blob, "pet-id-photo-final.jpg");

      const response = await fetch("/api/order/finalize", {
        method: "POST",
        body: form,
      });
      const body = await response.json();
      if (!response.ok || !body.ok) {
        throw new Error(body.message || "최종 저장에 실패했습니다.");
      }
      setResult({ ...body, previewDataUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "최종 저장 중 오류가 발생했습니다.");
    } finally {
      setFinalizing(false);
    }
  }

  if (result) {
    return (
      <section className="result-panel" aria-live="polite">
        <span className="result-panel__check">✓</span>
        <h2>제작 접수가 완료되었습니다.</h2>
        <p>디지털 파일은 바로 저장할 수 있으며, 인화 또는 액자 옵션은 스마트스토어 주문 정보에 따라 제작됩니다.</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={result.resultDataUrl || result.previewDataUrl}
          className="editor-canvas"
          alt="완성된 반려동물 증명사진"
        />
        <div className="button-row">
          <a
            className="button"
            href={result.resultDataUrl || result.previewDataUrl}
            download={`${name.trim() || "pet"}-id-photo.jpg`}
          >
            사진 내려받기
          </a>
          {result.resultUrl && (
            <a className="button button--secondary" href={result.resultUrl}>
              결과 보관 링크 열기
            </a>
          )}
        </div>
        {result.expiresAt && (
          <p className="form-note">
            결과 링크는 {new Intl.DateTimeFormat("ko-KR").format(new Date(result.expiresAt))}까지 보관됩니다.
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="editor-panel">
      <div className="section-heading section-heading--compact">
        <span className="eyebrow">CAPTION EDITOR</span>
        <h2>문구를 원하는 모습으로 직접 배치해보세요.</h2>
        <p>글자는 AI가 만들지 않습니다. 폰트, 크기, 색상, 방향과 위치를 정한 뒤 홈페이지에서 선명하게 합성합니다.</p>
      </div>

      <div className="editor-grid">
        <div className="editor-preview">
          <canvas
            ref={canvasRef}
            className={`editor-canvas ${mode !== "none" ? "editor-canvas--movable" : ""}`}
            onPointerDown={(event) => {
              if (mode === "none") return;
              draggingRef.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              updatePositionFromPointer(event.clientX, event.clientY);
            }}
            onPointerMove={(event) => {
              if (!draggingRef.current) return;
              updatePositionFromPointer(event.clientX, event.clientY);
            }}
            onPointerUp={(event) => {
              draggingRef.current = false;
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
            }}
            onPointerCancel={() => {
              draggingRef.current = false;
            }}
          />
          {mode !== "none" && <p className="editor-drag-hint">사진 위를 누르거나 드래그하면 문구 위치가 이동합니다.</p>}
        </div>

        <div className="editor-controls">
          <fieldset>
            <legend>문구 구성</legend>
            {[
              { key: "none", label: "문구 없음" },
              { key: "name", label: "이름만" },
              { key: "name-line", label: "이름 + 한 줄" },
            ].map((item) => (
              <label className="radio-card" key={item.key}>
                <input
                  type="radio"
                  name="captionMode"
                  value={item.key}
                  checked={mode === item.key}
                  onChange={() => setMode(item.key as CaptionMode)}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </fieldset>

          {mode !== "none" && (
            <>
              <label className="field-label">
                반려동물 이름
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={20}
                  placeholder="예: 토리"
                />
              </label>

              {mode === "name-line" && (
                <label className="field-label">
                  한 줄 문구
                  <input
                    value={line}
                    onChange={(event) => setLine(event.target.value)}
                    maxLength={40}
                    placeholder="예: 언제나 우리 곁에"
                  />
                </label>
              )}

              <label className="field-label">
                폰트
                <select value={fontKey} onChange={(event) => setFontKey(event.target.value as CaptionFontKey)}>
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.key} value={font.key}>
                      {font.label} · {font.description}
                    </option>
                  ))}
                </select>
              </label>

              <div className="font-preview" style={{ fontFamily: `"${selectedFont}", sans-serif` }}>
                {name.trim() || "우리 아이"}
              </div>

              <div className="control-grid control-grid--two">
                <label className="field-label">
                  글자 굵기
                  <select
                    value={fontWeight}
                    onChange={(event) => setFontWeight(Number(event.target.value) as CaptionWeight)}
                  >
                    <option value={400}>보통</option>
                    <option value={500}>중간</option>
                    <option value={600}>도톰하게</option>
                    <option value={700}>굵게</option>
                  </select>
                </label>

                <label className="field-label">
                  글자 방향
                  <select
                    value={direction}
                    onChange={(event) => setDirection(event.target.value as CaptionDirection)}
                  >
                    <option value="horizontal">가로</option>
                    <option value="vertical">세로</option>
                  </select>
                </label>
              </div>

              <label className="range-field">
                <span>
                  글자 크기 <strong>{fontSize}px</strong>
                </span>
                <input
                  type="range"
                  min={48}
                  max={240}
                  step={2}
                  value={fontSize}
                  onChange={(event) => setFontSize(Number(event.target.value))}
                />
              </label>

              <fieldset className="caption-fieldset">
                <legend>글자 색상</legend>
                <div className="caption-color-row">
                  {COLOR_PRESETS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`caption-color ${color.toUpperCase() === item ? "caption-color--selected" : ""}`}
                      style={{ background: item }}
                      aria-label={`글자색 ${item}`}
                      onClick={() => setColor(item)}
                    />
                  ))}
                  <label className="caption-custom-color">
                    직접 선택
                    <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
                  </label>
                </div>
              </fieldset>

              <label className="check-row check-row--compact">
                <input type="checkbox" checked={shadow} onChange={(event) => setShadow(event.target.checked)} />
                <span>배경과 글자가 잘 구분되도록 은은한 그림자 적용</span>
              </label>

              <fieldset className="caption-fieldset">
                <legend>빠른 위치 선택</legend>
                <div className="position-grid">
                  {POSITION_PRESETS.map((position) => (
                    <button
                      key={position.label}
                      type="button"
                      aria-label={position.label}
                      title={position.label}
                      className={
                        Math.abs(xPercent - position.x) < 2 && Math.abs(yPercent - position.y) < 2
                          ? "position-dot position-dot--selected"
                          : "position-dot"
                      }
                      onClick={() => {
                        setXPercent(position.x);
                        setYPercent(position.y);
                      }}
                    />
                  ))}
                </div>
              </fieldset>

              <label className="range-field">
                <span>
                  가로 위치 <strong>{Math.round(xPercent)}%</strong>
                </span>
                <input
                  type="range"
                  min={4}
                  max={96}
                  step={1}
                  value={xPercent}
                  onChange={(event) => setXPercent(Number(event.target.value))}
                />
              </label>

              <label className="range-field">
                <span>
                  세로 위치 <strong>{Math.round(yPercent)}%</strong>
                </span>
                <input
                  type="range"
                  min={4}
                  max={96}
                  step={1}
                  value={yPercent}
                  onChange={(event) => setYPercent(Number(event.target.value))}
                />
              </label>
            </>
          )}

          {error && <p className="form-error">{error}</p>}
          <div className="button-stack">
            <button type="button" className="button" onClick={finalize} disabled={finalizing}>
              {finalizing ? "최종 저장 중..." : "이대로 최종 저장"}
            </button>
            <button type="button" className="button button--ghost" onClick={onCancel} disabled={finalizing}>
              결과 취소하고 다시 만들기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
