import { Breadcrumbs } from "@/components/Breadcrumbs";
import { createMetadata } from "@/lib/metadata";
import { SITE } from "@/lib/site";

export const metadata = createMetadata({ title: "서비스 이용약관", description: `${SITE.name} 반려동물 증명사진 제작 서비스 이용 조건입니다.`, path: "/policy/terms" });

export default function TermsPage() {
  return <section className="simple-page"><div className="shell narrow"><Breadcrumbs items={[{ label: "이용약관" }]} /><span className="eyebrow">TERMS</span><h1>서비스 이용약관</h1><article className="prose"><p>시행일: 2026년 6월 19일</p><h2>1. 서비스 내용</h2><p>{SITE.name}은 이용자가 제공한 반려동물 사진을 바탕으로 디지털 증명사진을 제작하고, 구매 옵션에 따라 인화 또는 액자 상품을 제공합니다.</p><h2>2. 이용권</h2><p>스마트스토어 주문별로 발급된 쿠폰은 원칙적으로 1회 사용할 수 있습니다. 타인에게 무단 양도하거나 중복 사용할 수 없습니다.</p><h2>3. 제작 결과</h2><p>실제 개체 특징을 유지하도록 제작하지만 AI와 이미지 처리 특성상 원본과 털 결, 미세한 표정, 색감에 차이가 생길 수 있습니다.</p><h2>4. 이용자의 책임</h2><p>이용자는 업로드 사진에 대한 적법한 사용 권한을 보유해야 하며, 불법적이거나 타인의 권리를 침해하는 자료를 올려서는 안 됩니다.</p><h2>5. 금지 행위</h2><p>쿠폰 위조, 자동화된 과도한 요청, 시스템 보안 침해, 결과물의 불법적 이용을 금지합니다.</p><h2>6. 운영 중단</h2><p>외부 API 장애, 점검, 천재지변 등 불가피한 사유로 서비스가 일시 중단될 수 있으며, 미완료 쿠폰은 다시 사용할 수 있도록 확인합니다.</p></article></div></section>;
}
