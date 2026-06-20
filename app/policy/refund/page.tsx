import { Breadcrumbs } from "@/components/Breadcrumbs";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({ title: "취소 및 환불 안내", description: "반려동물 증명사진 디지털 제작, 인화, 액자 상품의 제작 단계별 취소와 환불 기준을 안내합니다.", path: "/policy/refund" });

export default function RefundPage() {
  return <section className="simple-page"><div className="shell narrow"><Breadcrumbs items={[{ label: "취소·환불 안내" }]} /><span className="eyebrow">CANCEL & REFUND</span><h1>취소 및 환불 안내</h1><article className="prose"><h2>제작 시작 전</h2><p>스마트스토어 주문 상태와 상품페이지의 최신 정책에 따라 취소할 수 있습니다.</p><h2>디지털 맞춤 제작 시작 후</h2><p>사진 생성이 시작된 뒤에는 개인 맞춤형 디지털 콘텐츠의 특성상 단순 변심 취소가 제한될 수 있습니다. 시스템 오류로 결과가 생성되지 않은 경우에는 쿠폰 복구 또는 재제작을 안내합니다.</p><h2>인화 및 액자 제작 시작 후</h2><p>최종 사진이 확정되어 인화나 액자 제작이 시작된 뒤에는 옵션 변경과 단순 변심 취소가 제한될 수 있습니다.</p><h2>오배송 또는 파손</h2><p>수령한 상품이 주문 내용과 다르거나 배송 중 파손된 경우에는 사진과 함께 고객센터로 문의해주세요. 확인 후 재제작 또는 교환 절차를 안내합니다.</p><div className="info-box"><strong>최종 기준</strong><p>실제 판매 시에는 스마트스토어 상품페이지에 표시된 최신 취소·환불 정책과 전자상거래 관련 법령이 우선합니다. 이 페이지의 문구는 사업자 정보와 상품 조건에 맞게 최종 검토 후 사용해주세요.</p></div></article></div></section>;
}
