import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTA } from "@/components/CTA";
import { createMetadata } from "@/lib/metadata";
import { PRICE_OPTIONS, formatPrice } from "@/lib/site";

export const metadata = createMetadata({
  title: "반려동물 증명사진 인화와 액자 안내",
  description:
    "증명사진 8장, 4×6·5×7 인화 1장, 네컷·캘린더컷 인화 1장과 5×7 우드 액자 가격을 안내합니다.",
  path: "/guide/print-frame",
});

export default function PrintFrameGuide() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <Breadcrumbs
            items={[
              { label: "제작 가이드", href: "/guide/photo-selection" },
              { label: "인화·액자 안내" },
            ]}
          />
          <span className="eyebrow">PRINT & FRAME</span>
          <h1>
            필요한 인화 한 장과,
            <br />
            5×7 우드 액자만 선택하세요.
          </h1>
          <p>실물 옵션은 스마트스토어 주문 정보와 배송지를 기준으로 처리합니다.</p>
        </div>
      </section>
      <section className="content-section">
        <div className="shell content-grid">
          <aside className="side-nav">
            <a href="#digital">디지털</a>
            <a href="#print">인화</a>
            <a href="#frame">액자</a>
            <a href="#shipping">배송</a>
          </aside>
          <article className="prose">
            <h2 id="digital">디지털 파일</h2>
            <p>
              5:7 세로 비율의 고해상도 JPG 파일입니다. 기본 제작권 가격은
              {" "}<strong>{formatPrice(PRICE_OPTIONS.baseDigital)}원</strong>입니다.
            </p>

            <h2 id="print">인화 옵션</h2>
            <ul>
              <li>증명사진 3×4cm 8장: +{formatPrice(PRICE_OPTIONS.idPhotoEight)}원</li>
              <li>4×6인치 사진 1장: +{formatPrice(PRICE_OPTIONS.print4x6)}원</li>
              <li>5×7인치 사진 1장: +{formatPrice(PRICE_OPTIONS.print5x7)}원</li>
              <li>네컷사진 인화 1장: +{formatPrice(PRICE_OPTIONS.fourCutPrint)}원</li>
              <li>캘린더컷 인화 1장: +{formatPrice(PRICE_OPTIONS.calendarPrint)}원</li>
            </ul>
            <p>
              화면과 인화물은 디스플레이 밝기, 용지와 출력 장비에 따라 색감이 조금 다르게 보일 수 있습니다.
            </p>

            <h2 id="frame">5×7인치 우드 액자</h2>
            <p>
              5×7 인화 1장과 우드 액자를 함께 제공하며 최종 상품금액은
              {" "}<strong>{formatPrice(PRICE_OPTIONS.woodFrame5x7Total)}원</strong>입니다.
            </p>

            <h2 id="shipping">배송과 주문 변경</h2>
            <p>
              실물 옵션의 배송비는 {formatPrice(PRICE_OPTIONS.shipping)}원입니다. 수령인, 연락처, 주소는
              스마트스토어 주문 정보를 사용합니다. 제작과 인화가 시작된 뒤에는 개인 맞춤 제작 상품의
              특성상 옵션 변경이나 단순 변심 취소가 제한될 수 있습니다.
            </p>
            <div className="info-box">
              <strong>제작 전 꼭 확인해주세요</strong>
              <p>반려동물 이름, 배경색, 눈가 보정 방식과 스마트스토어 구매 옵션을 최종 저장 전에 확인해주세요.</p>
            </div>
          </article>
        </div>
      </section>
      <CTA />
    </>
  );
}
