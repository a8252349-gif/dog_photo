"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { BACKGROUND_ENTRIES } from "@/lib/backgrounds";
import { PRODUCT_OPTIONS } from "@/lib/site";
import type { BackgroundKey, CouponInfo, FulfillmentType, TearOption } from "@/lib/types";
import { CaptionEditor } from "@/components/CaptionEditor";

type Preview = { file: File; url: string };

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function MakeWizard({ demoCode }: { demoCode: string | null }) {
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [coupon, setCoupon] = useState<CouponInfo | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>("digital");
  const [petName, setPetName] = useState("");
  const [backgroundKey, setBackgroundKey] = useState<BackgroundKey>("butter-yellow");
  const [tearOption, setTearOption] = useState<TearOption>("clean");
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [agree, setAgree] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState("");
  const [generation, setGeneration] = useState<{ imageDataUrl: string; sessionToken: string } | null>(null);
  const generateLockRef = useRef(false);

  useEffect(() => {
    if (!generating) {
      setElapsedSeconds(0);
      return;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [generating]);

  const canGenerate = useMemo(
    () => Boolean(coupon?.ok && previews.length > 0 && previews.length <= 3 && agree && !generating),
    [agree, coupon?.ok, generating, previews.length],
  );

  async function verify() {
    setVerifying(true);
    setError("");
    try {
      const response = await fetch("/api/coupon/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, phone }),
      });
      const body = (await response.json()) as CouponInfo;
      if (!response.ok || !body.ok) throw new Error(body.message || "쿠폰을 확인하지 못했습니다.");
      setCoupon(body);
      setFulfillmentType(body.fulfillmentType || "digital");
    } catch (err) {
      setCoupon(null);
      setError(err instanceof Error ? err.message : "쿠폰 확인 중 오류가 발생했습니다.");
    } finally {
      setVerifying(false);
    }
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files).slice(0, 3);
    previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    setPreviews(next.map((file) => ({ file, url: URL.createObjectURL(file) })));
  }

  async function generate() {
    if (generateLockRef.current) return;

    generateLockRef.current = true;
    setGenerating(true);
    setError("");
    try {
      const form = new FormData();
      form.append("code", code);
      form.append("phone", phone);
      form.append("petName", petName);
      form.append("backgroundKey", backgroundKey);
      form.append("tearOption", tearOption);
      form.append("fulfillmentType", fulfillmentType);
      previews.forEach((preview) => form.append("images", preview.file));

      const response = await fetch("/api/order/generate", { method: "POST", body: form });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.message || "사진 제작에 실패했습니다.");
      if (body.aiUsage) {
        console.info("[GPT Image 실제 사용량]", body.aiUsage);
      }
      setGeneration({ imageDataUrl: body.imageDataUrl, sessionToken: body.sessionToken });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "사진 제작 중 오류가 발생했습니다.");
    } finally {
      generateLockRef.current = false;
      setGenerating(false);
    }
  }

  async function cancelGeneration() {
    if (!generation) return;
    await fetch("/api/order/release", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionToken: generation.sessionToken }),
    }).catch(() => undefined);
    setGeneration(null);
  }

  if (generation) {
    return (
      <CaptionEditor
        imageDataUrl={generation.imageDataUrl}
        sessionToken={generation.sessionToken}
        defaultPetName={petName}
        onCancel={cancelGeneration}
      />
    );
  }

  return (
    <>
      <div className="make-wizard">
        <section className="wizard-step">
          <div className="step-number">01</div>
          <div className="wizard-step__content">
            <h2>스마트스토어 이용권 확인</h2>
            <p>결제 후 문자로 받은 1회용 쿠폰코드와 주문 시 입력한 휴대전화 번호를 입력해주세요.</p>
            {demoCode && <div className="demo-notice">로컬 테스트 코드: <strong>{demoCode}</strong> · 휴대전화 번호는 임의의 10~11자리를 입력하세요.</div>}
            <div className="inline-form">
              <label className="field-label">쿠폰코드<input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="XXXX-XXXX-XXXX" autoComplete="off" /></label>
              <label className="field-label">휴대전화 번호<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" inputMode="tel" /></label>
              <button className="button" type="button" onClick={verify} disabled={verifying}>{verifying ? "확인 중..." : "이용권 확인"}</button>
            </div>
            {coupon?.ok && (
              <div className="coupon-confirmed">
                <strong>✓ {coupon.message}</strong>
                <span>구매 옵션: {coupon.productOption || PRODUCT_OPTIONS[coupon.fulfillmentType || "digital"].label}</span>
              </div>
            )}
          </div>
        </section>

        <section className={`wizard-step ${!coupon?.ok ? "wizard-step--disabled" : ""}`}>
          <div className="step-number">02</div>
          <div className="wizard-step__content">
            <h2>구매 상품 구성</h2>
            <p>실제 운영에서는 스마트스토어에서 구매한 옵션이 자동으로 표시되고 잠깁니다.</p>
            <div className="option-cards option-cards--three">
              {(Object.keys(PRODUCT_OPTIONS) as FulfillmentType[]).map((key) => (
                <label className="radio-card radio-card--large" key={key}>
                  <input type="radio" name="fulfillment" value={key} checked={fulfillmentType === key} onChange={() => setFulfillmentType(key)} disabled={Boolean(coupon?.optionLocked)} />
                  <span><strong>{PRODUCT_OPTIONS[key].label}</strong><small>{PRODUCT_OPTIONS[key].description}</small></span>
                </label>
              ))}
            </div>
          </div>
        </section>

        <section className={`wizard-step ${!coupon?.ok ? "wizard-step--disabled" : ""}`}>
          <div className="step-number">03</div>
          <div className="wizard-step__content">
            <h2>같은 반려동물 사진 1~3장 업로드</h2>
            <p>첫 번째 사진을 주 기준으로 사용합니다. 정면에 가까운 사진을 먼저, 좌우 특징이 보이는 사진을 뒤에 올려주세요. 결과물은 머리·어깨·윗가슴이 보이는 상반신 5:7 증멍사진으로 제작됩니다.</p>
            <label className="upload-zone">
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => addFiles(event.target.files)} disabled={!coupon?.ok} />
              <strong>사진 선택하기</strong>
              <span>JPG · PNG · WEBP / 한 장당 최대 15MB / 최대 3장</span>
            </label>
            {previews.length > 0 && (
              <div className="upload-previews">
                {previews.map((preview, index) => (
                  <figure key={`${preview.file.name}-${index}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview.url} alt={`업로드 사진 ${index + 1}`} />
                    <figcaption>{index === 0 ? "주 기준 사진" : `보조 사진 ${index}`}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className={`wizard-step ${!coupon?.ok ? "wizard-step--disabled" : ""}`}>
          <div className="step-number">04</div>
          <div className="wizard-step__content">
            <h2>눈가 보정과 배경색 선택</h2>
            <label className="field-label field-label--short">반려동물 이름 <span>(선택)</span><input value={petName} onChange={(e) => setPetName(e.target.value)} maxLength={12} placeholder="완성 후 문구 옵션에도 사용됩니다." /></label>
            <fieldset>
              <legend>눈가 보정</legend>
              <div className="option-cards">
                <label className="radio-card"><input type="radio" checked={tearOption === "clean"} onChange={() => setTearOption("clean")} /><span><strong>기본형</strong><small>눈물 자국과 눈곱을 자연스럽게 정리</small></span></label>
                <label className="radio-card"><input type="radio" checked={tearOption === "preserve"} onChange={() => setTearOption("preserve")} /><span><strong>원본존중형</strong><small>눈가 표현을 포함해 원본에 가깝게 유지</small></span></label>
              </div>
            </fieldset>
            <fieldset>
              <legend>배경색 7종</legend>
              <div className="color-grid">
                {BACKGROUND_ENTRIES.map(([key, item]) => (
                  <label key={key} className={`color-card ${backgroundKey === key ? "color-card--selected" : ""}`}>
                    <input type="radio" name="background" checked={backgroundKey === key} onChange={() => setBackgroundKey(key)} />
                    <span className="color-swatch" style={{ background: item.hex }} />
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        <section className={`wizard-step ${!coupon?.ok ? "wizard-step--disabled" : ""}`}>
          <div className="step-number">05</div>
          <div className="wizard-step__content">
            <h2>제작 전 확인</h2>
            <div className="summary-box">
              <span>상품 <strong>{PRODUCT_OPTIONS[fulfillmentType].label}</strong></span>
              <span>사진 <strong>{previews.length}장</strong></span>
              <span>배경 <strong>{BACKGROUND_ENTRIES.find(([key]) => key === backgroundKey)?.[1].label}</strong></span>
              <span>눈가 <strong>{tearOption === "clean" ? "자연스럽게 정리" : "원본 유지"}</strong></span>
              <span>규격 <strong>5:7 · 2500×3500px · 상반신</strong></span>
            </div>
            <label className="check-row"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /><span>업로드한 사진의 사용 권한이 있으며, AI 제작 특성상 원본과 미세한 표현 차이가 생길 수 있음을 확인했습니다.</span></label>
            {error && <p className="form-error">{error}</p>}
            <button className="button button--wide" type="button" onClick={generate} disabled={!canGenerate}>{generating ? "제작 진행 중..." : "반려동물 증명사진 만들기"}</button>
            <p className="form-note">제작은 보통 1~3분 내외지만, 요청이 많거나 이미지 분석 시간이 길면 최대 10분 정도 소요될 수 있습니다.</p>
          </div>
        </section>

        <aside className="privacy-note">
          <Image src="/after-cat-tabby.webp" alt="" width={96} height={120} />
          <div><strong>사진은 제작 목적으로만 사용합니다.</strong><p>원본 보관이 필요한 경우에만 Cloudinary를 사용하도록 구성되어 있으며, 결과 파일의 기본 보관 기간은 7일입니다.</p></div>
        </aside>
      </div>

      {generating && (
        <div className="generation-modal" role="dialog" aria-modal="true" aria-labelledby="generation-modal-title">
          <div className="generation-modal__card">
            <div className="generation-modal__spinner" aria-hidden="true" />
            <p className="generation-modal__eyebrow">AI 제작 진행 중</p>
            <h3 id="generation-modal-title">반려동물 증명사진을 만들고 있어요.</h3>
            <p className="generation-modal__lead">
              사진을 분석해 정면 구도, 머리·목 수직 정렬, 배경색, 눈가 보정을 반영하고 있습니다.
            </p>
            <div className="generation-modal__time">
              <strong>{formatElapsed(elapsedSeconds)}</strong>
              <span>경과 시간</span>
            </div>
            <ul className="generation-modal__list">
              <li>보통 1~3분 내외로 완료됩니다.</li>
              <li>요청이 많거나 사진 분석 시간이 길면 최대 10분까지 걸릴 수 있습니다.</li>
              <li>완성될 때까지 이 창을 닫거나 새로고침하지 말아주세요.</li>
            </ul>
            <div className="generation-modal__progress">
              <span className="generation-modal__bar" />
            </div>
            <p className="generation-modal__sub">작업 중입니다. 잠시만 기다려주세요.</p>
          </div>
        </div>
      )}
    </>
  );
}
