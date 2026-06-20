import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { createMetadata } from "@/lib/metadata";

const faqs = [
  ["정면 사진이 없어도 만들 수 있나요?", "가능합니다. 얼굴이 선명한 사진을 첫 번째로 올리고 좌우 특징이 보이는 사진을 보조로 올리면 정면 모습을 재구성할 수 있습니다."],
  ["강아지와 고양이 모두 가능한가요?", "네. 강아지와 고양이를 포함해 얼굴과 털 특징이 확인되는 반려동물 사진이라면 제작할 수 있습니다."],
  ["눈물 자국은 지워지나요?", "기본형은 눈가 털 질감을 유지하면서 눈물 자국과 눈곱을 자연스럽게 정리합니다. 원본존중형을 선택하면 눈가 표현을 최대한 유지합니다."],
  ["사진을 몇 장 올려야 하나요?", "최소 1장, 최대 3장입니다. 한 장만으로도 가능하지만 정면과 좌우 특징을 확인할 수 있는 2~3장을 권장합니다."],
  ["서로 다른 반려동물 사진을 함께 올려도 되나요?", "아니요. 한 번의 제작에는 동일한 반려동물 사진만 올려주세요. 서로 다른 개체를 섞으면 얼굴 특징이 평균화될 수 있습니다."],
  ["이름 문구는 왜 생성 후 넣나요?", "이미지 생성 모델은 한글 철자와 배치를 틀릴 수 있어, 완성 사진 위에 홈페이지가 직접 글자를 렌더링하도록 분리했습니다."],
  ["인화와 액자는 어디로 배송되나요?", "스마트스토어 주문 시 입력한 수령인과 배송지를 기준으로 발송합니다."],
  ["쿠폰을 사용했는데 제작에 실패하면 어떻게 되나요?", "제작이 완료되기 전에는 쿠폰을 예약 상태로 두고, 오류가 발생하면 다시 사용할 수 있도록 복구하는 구조입니다."],
  ["결과 파일은 얼마나 보관되나요?", "기본 보관 기간은 7일입니다. 기간이 끝나기 전에 파일을 내려받아 별도로 보관해주세요."],
  ["완성 사진이 원본과 완전히 같나요?", "실제 개체 특징을 최대한 유지하도록 설계했지만 AI 제작 특성상 털 결이나 미세한 표정에 차이가 생길 수 있습니다."],
];

export const metadata = createMetadata({
  title: "반려동물 증명사진 자주 묻는 질문",
  description: "사진 업로드, 눈물 자국 보정, 배경색, 쿠폰, 인화와 액자 배송에 관한 자주 묻는 질문을 확인하세요.",
  path: "/faq",
});

export default function FaqPage() {
  return <><JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }} />
  <section className="page-hero"><div className="shell"><Breadcrumbs items={[{ label: "자주 묻는 질문" }]} /><span className="eyebrow">FAQ</span><h1>제작 전 궁금한 점을<br />먼저 확인해주세요.</h1><p>사진 선택부터 쿠폰 사용, 결과 보관과 실물 배송까지 자주 묻는 내용을 모았습니다.</p></div></section>
  <section className="content-section"><div className="shell narrow"><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></div></section></>;
}
