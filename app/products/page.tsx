import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTA } from "@/components/CTA";
import { JsonLd } from "@/components/JsonLd";
import { ProductCards } from "@/components/ProductCards";
import { createMetadata } from "@/lib/metadata";
import { PRICE_OPTIONS, SITE, absoluteUrl, formatPrice } from "@/lib/site";

export const metadata = createMetadata({
  title: "반려동물 증명사진 상품 구성",
  description:
    "2,000원 기본 디지털 제작권과 인화 1장, 증명사진 8장, 5×7 우드 액자 옵션 가격을 안내합니다.",
  path: "/products",
});

const digitalAddOns = [
  ["스마트폰 배경화면 1종", PRICE_OPTIONS.smartphoneWallpaper],
  ["디지털 네컷 1종", PRICE_OPTIONS.digitalFourCut],
  ["디지털 캘린더컷 1종", PRICE_OPTIONS.digitalCalendar],
  ["꾸미기 세트", PRICE_OPTIONS.decorationBundle],
] as const;

const printOptions = [
  ["증명사진 3×4cm 8장", PRICE_OPTIONS.idPhotoEight],
  ["4×6인치 사진 1장", PRICE_OPTIONS.print4x6],
  ["5×7인치 사진 1장", PRICE_OPTIONS.print5x7],
  ["네컷사진 인화 1장", PRICE_OPTIONS.fourCutPrint],
  ["캘린더컷 인화 1장", PRICE_OPTIONS.calendarPrint],
] as const;

export default function ProductsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: `${SITE.name} 반려동물 증명사진`,
          description: SITE.description,
          image: absoluteUrl("/after-dog-pomeranian.webp"),
          offers: {
            "@type": "Offer",
            priceCurrency: "KRW",
            price: SITE.basePrice,
            availability: "https://schema.org/InStock",
            url: SITE.smartStoreUrl,
          },
        }}
      />

      <section className="page-hero">
        <div className="shell">
          <Breadcrumbs items={[{ label: "상품 안내" }]} />
          <span className="eyebrow">PRODUCT</span>
          <h1>
            2,000원 기본 제작권에,
            <br />
            필요한 옵션만 더하세요.
          </h1>
          <p>
            디지털 꾸미기, 인화 1장, 증명사진 8장, 5×7 우드 액자 중 필요한 구성만 선택할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="content-section">
        <div className="shell">
          <div className="section-heading">
            <span className="eyebrow">OPTIONS</span>
            <h2>확정 상품 구성</h2>
            <p>
              기본 증멍사진 제작권은 <strong>{formatPrice()}원</strong>입니다. 실물 상품을 선택한 경우 배송비
              {" "}{formatPrice(PRICE_OPTIONS.shipping)}원이 별도로 적용됩니다.
            </p>
          </div>

          <ProductCards />

          <div className="pricing-sections">
            <section className="pricing-panel">
              <h2>디지털 추가 옵션</h2>
              <p>같은 완성 사진을 활용해 별도 디자인 파일을 제작합니다.</p>
              <div className="price-list">
                {digitalAddOns.map(([label, price]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>+{formatPrice(price)}원</strong>
                  </div>
                ))}
              </div>
              <div className="info-box">
                <strong>꾸미기 세트 구성</strong>
                <p>스마트폰 배경화면 1종 + 디지털 네컷 1종 + 디지털 캘린더컷 1종</p>
              </div>
            </section>

            <section className="pricing-panel">
              <h2>인화 옵션</h2>
              <p>증명사진은 8장 세트, 나머지 인화 옵션은 모두 1장 기준입니다.</p>
              <div className="price-list">
                {printOptions.map(([label, price]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>+{formatPrice(price)}원</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="pricing-panel pricing-panel--featured">
              <h2>5×7인치 우드 액자</h2>
              <p>5×7 인화 1장을 액자에 넣어 배송하는 단일 액자 옵션입니다.</p>
              <div className="frame-price">
                <span>최종 상품금액</span>
                <strong>{formatPrice(PRICE_OPTIONS.woodFrame5x7Total)}원</strong>
                <small>기본 제작권 포함 · 옵션 추가금 +{formatPrice(PRICE_OPTIONS.woodFrame5x7Option)}원</small>
              </div>
            </section>
          </div>

          <div className="prose">
            <h2>스마트스토어 옵션과 쿠폰은 어떻게 연결되나요?</h2>
            <p>
              결제 완료 주문이 Zapier 또는 네이버 커머스 연동을 통해 쿠폰 시트로 전달되면, 사용 가능한
              1회용 코드를 주문에 배정합니다. 쿠폰에는 상품주문번호와 구매 옵션이 함께 저장됩니다.
            </p>
            <div className="info-box">
              <strong>실물 옵션을 구매한 경우</strong>
              <p>
                인화와 액자 배송은 스마트스토어에 입력한 수령인과 배송지를 기준으로 처리합니다. 제작
                홈페이지에서 주소를 다시 입력하지 않습니다.
              </p>
            </div>
            <h2>완성 파일 규격</h2>
            <ul>
              <li>세로 5:7 비율</li>
              <li>고해상도 JPG</li>
              <li>이름과 한 줄 문구는 웹 후처리 선택</li>
              <li>기본 결과 링크 보관 기간 7일</li>
            </ul>
            <p>
              <Link className="text-link" href="/guide/print-frame">
                인화와 액자 주문 전 확인사항 →
              </Link>
            </p>
          </div>
        </div>
      </section>
      <CTA />
    </>
  );
}
