import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTA } from "@/components/CTA";
import { createMetadata } from "@/lib/metadata";
import { SITE } from "@/lib/site";

export const metadata = createMetadata({ title: `${SITE.name} 소개`, description: "반려동물의 실제 개체 특징을 지키는 증명사진 제작 원칙과 서비스 운영 방식을 소개합니다.", path: "/about" });

export default function AboutPage() {
  return <><section className="page-hero"><div className="shell"><Breadcrumbs items={[{ label: "브랜드 소개" }]} /><span className="eyebrow">ABOUT US</span><h1>더 예쁜 얼굴보다,<br />더 익숙한 얼굴을 남깁니다.</h1><p>{SITE.name}은 반려동물 사진을 단정한 스튜디오 증명사진으로 재구성하는 디지털 제작 서비스입니다.</p></div></section>
  <section className="content-section"><div className="shell"><article className="prose"><h2>반려동물의 개체성을 우선합니다.</h2><p>강아지와 고양이는 같은 품종 안에서도 귀의 높이, 눈매, 털 무늬와 표정이 모두 다릅니다. 제작 과정에서는 품종의 전형적인 모습보다 업로드한 사진 속 반려동물의 실제 특징을 먼저 비교합니다.</p><h2>AI 생성과 웹 후처리를 분리했습니다.</h2><p>정면 얼굴과 스튜디오 배경은 이미지 모델이 만들고, 한글 이름과 문구는 웹 캔버스가 별도로 렌더링합니다. 이미지 생성 모델에서 글자가 깨지는 문제를 줄이기 위한 구조입니다.</p><h2>결제와 배송은 스마트스토어에서 관리합니다.</h2><p>홈페이지에 별도 결제를 붙이지 않고 스마트스토어 주문을 기준으로 쿠폰, 상품 옵션, 배송 정보를 연결합니다. 고객은 문자로 받은 1회용 코드만 입력하면 됩니다.</p></article></div></section><CTA /></>;
}
