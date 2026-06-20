import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTA } from "@/components/CTA";
import { BACKGROUND_ENTRIES } from "@/lib/backgrounds";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "강아지 고양이 증명사진 배경색 7종",
  description: "버터 옐로우, 크림, 베이지, 핑크, 세이지 그린, 스카이 블루, 라벤더 배경의 특징과 털색별 선택 기준을 안내합니다.",
  path: "/guide/background-colors",
});

export default function BackgroundGuide() {
  return <><section className="page-hero"><div className="shell"><Breadcrumbs items={[{ label: "제작 가이드", href: "/guide/photo-selection" }, { label: "배경색 7종" }]} /><span className="eyebrow">BACKGROUND COLORS</span><h1>반려동물이 먼저 보이는<br />단색 배경 7가지</h1><p>배경은 화려한 장식보다 털 윤곽과 얼굴 무늬가 잘 드러나는 명도와 채도를 기준으로 구성했습니다.</p></div></section>
  <section className="content-section"><div className="shell"><div className="prose">
    {BACKGROUND_ENTRIES.map(([key, item]) => <section id={key} key={key} style={{ scrollMarginTop: 120 }}><div style={{ background: item.hex, height: 180, borderRadius: 24, border: "1px solid rgba(0,0,0,.06)" }} /><h2>{item.label} <small style={{ fontSize: 14, color: "#8b8b8b" }}>{item.hex}</small></h2><p>{item.description}</p></section>)}
    <h2>털색에 따른 빠른 선택</h2><ul><li><strong>검정·짙은 갈색:</strong> 버터 옐로우, 크림, 스카이 블루</li><li><strong>흰색·크림색:</strong> 세이지 그린, 소프트 핑크, 라벤더</li><li><strong>회색·실버:</strong> 버터 옐로우, 웜 베이지, 라벤더</li><li><strong>무늬가 복잡한 경우:</strong> 크림 또는 웜 베이지처럼 차분한 색</li></ul>
  </div></div></section><CTA /></>;
}
