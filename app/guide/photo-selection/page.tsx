import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTA } from "@/components/CTA";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "반려동물 증명사진 원본 선택 방법",
  description: "강아지와 고양이 증명사진이 실제 모습을 닮게 나오도록 첫 번째 기준 사진과 보조 사진을 고르는 방법을 안내합니다.",
  path: "/guide/photo-selection",
});

export default function PhotoSelectionGuide() {
  return <><section className="page-hero"><div className="shell"><Breadcrumbs items={[{ label: "제작 가이드", href: "/guide/photo-selection" }, { label: "사진 선택 방법" }]} /><span className="eyebrow">PHOTO GUIDE</span><h1>닮은 결과는<br />사진을 고르는 순서에서 시작합니다.</h1><p>완벽한 정면 사진이 없어도 괜찮습니다. 다만 첫 번째 기준 사진과 보조 사진의 역할을 나누면 실제 특징을 더 안정적으로 파악할 수 있습니다.</p></div></section>
  <section className="content-section"><div className="shell content-grid"><aside className="side-nav"><Link href="/guide/photo-selection">사진 선택</Link><Link href="/guide/background-colors">배경색</Link><Link href="/guide/print-frame">인화·액자</Link></aside><article className="prose">
    <h2>1. 첫 번째 사진은 얼굴이 가장 익숙한 사진</h2><p>첫 번째 사진은 얼굴형과 표정, 현재 나이를 판단하는 주 기준이 됩니다. 얼굴이 충분히 크고 눈과 코에 초점이 맞은 사진을 선택해주세요.</p>
    <h2>2. 두 번째 사진은 반대쪽 얼굴이 보이게</h2><p>첫 사진에서 보이지 않는 털 무늬, 귀의 접힘, 점이나 흉터를 확인할 수 있는 사진이 좋습니다. 좌우가 모두 보이면 무늬가 반대로 생성되는 오류를 줄이는 데 도움이 됩니다.</p>
    <h2>3. 세 번째 사진은 전체적인 털과 체형 확인용</h2><p>목과 가슴 털의 색, 털 길이, 목줄이나 옷에 가려진 부분을 확인할 수 있는 사진을 올려주세요. 옷은 최종 결과에서 제거되지만 주변 털을 자연스럽게 복원하는 참고가 됩니다.</p>
    <h2>피하는 것이 좋은 사진</h2><ul><li>얼굴이 작게 나온 단체사진</li><li>강한 뷰티 필터나 색상 필터가 적용된 사진</li><li>눈이나 코가 손, 장난감, 간식에 가려진 사진</li><li>너무 오래전 모습과 최근 모습을 섞은 사진</li><li>서로 다른 반려동물의 사진</li></ul>
    <div className="info-box"><strong>가장 중요한 기준</strong><p>보호자가 보기에 “우리 아이답다”고 느끼는 사진을 첫 번째로 올려주세요. 카메라 각도가 조금 기울어져 있어도 얼굴의 특징이 선명한 사진이 더 유용합니다.</p></div>
  </article></div></section><CTA /></>;
}
