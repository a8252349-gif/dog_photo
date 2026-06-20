import { Breadcrumbs } from "@/components/Breadcrumbs";
import { createMetadata } from "@/lib/metadata";
import { SITE } from "@/lib/site";

export const metadata = createMetadata({ title: "개인정보처리방침", description: `${SITE.name}의 사진, 연락처, 주문정보 처리와 보관 기준입니다.`, path: "/policy/privacy" });

export default function PrivacyPage() {
  return <section className="simple-page"><div className="shell narrow"><Breadcrumbs items={[{ label: "개인정보처리방침" }]} /><span className="eyebrow">PRIVACY</span><h1>개인정보처리방침</h1><article className="prose"><p>시행일: 2026년 6월 19일</p><h2>1. 수집하는 정보</h2><p>쿠폰 확인과 제작 접수를 위해 쿠폰코드, 휴대전화 번호, 반려동물 이름, 업로드 사진, 선택한 제작 옵션을 처리할 수 있습니다. 인화 또는 액자 배송 정보는 스마트스토어 주문정보를 기준으로 처리합니다.</p><h2>2. 이용 목적</h2><p>이용권 확인, 중복 사용 방지, 사진 제작, 결과 제공, 인화·액자 제작과 배송, 고객 문의 대응을 위해 사용합니다.</p><h2>3. 보관 기간</h2><p>완성 결과 링크는 기본 7일간 보관합니다. 주문과 회계 관련 정보는 관련 법령에 따른 기간 동안 보관될 수 있습니다. 원본 사진은 제작과 고객 응대에 필요한 최소 기간만 보관하도록 운영합니다.</p><h2>4. 처리 위탁 및 외부 서비스</h2><p>서비스 운영 과정에서 Render, OpenAI, Cloudinary, Google Apps Script·Drive, 네이버 스마트스토어, 문자 발송 또는 자동화 서비스를 사용할 수 있습니다. 실제 운영 시 사용 중인 업체와 처리 항목을 사업자 상황에 맞게 최종 수정해야 합니다.</p><h2>5. 이용자의 권리</h2><p>이용자는 본인 정보의 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다. 문의: {SITE.contactEmail}</p><h2>6. 사진 사용 권한</h2><p>업로드하는 사진의 촬영자 권리와 사용 권한을 확인해야 하며, 타인의 반려동물이나 사진을 무단으로 업로드해서는 안 됩니다.</p></article></div></section>;
}
