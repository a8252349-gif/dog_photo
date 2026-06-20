import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MakeWizard } from "@/components/MakeWizard";
import { createMetadata } from "@/lib/metadata";
import { SITE, formatPrice } from "@/lib/site";

export const metadata = createMetadata({
  title: "쿠폰으로 반려동물 증명사진 제작",
  description:
    "스마트스토어에서 받은 1회용 쿠폰을 확인하고 반려동물 사진, 눈가 보정, 배경색을 선택해 증명사진을 제작합니다.",
  path: "/make",
  noIndex: true,
});

export default function MakePage() {
  const demoCode =
    (process.env.COUPON_MODE || "demo") === "demo"
      ? process.env.DEMO_COUPON_CODE || "DEMO-PET-2026"
      : null;
  const externalStore = /^https?:\/\//.test(SITE.smartStoreUrl);

  return (
    <section className="make-page">
      <div className="shell">
        <div className="make-page__intro">
          <Breadcrumbs items={[{ label: "쿠폰으로 제작하기" }]} />
          <span className="eyebrow">MAKE YOUR PET ID</span>
          <h1>
            사진을 올리고
            <br />
            우리 아이의 증명사진을 만드세요.
          </h1>
          <p>쿠폰 확인부터 최종 문구 저장까지 한 화면에서 순서대로 진행합니다.</p>
        </div>

        <aside className="coupon-purchase-banner" aria-label="증멍사진 쿠폰 구매 안내">
          <div>
            <span className="coupon-purchase-banner__eyebrow">쿠폰이 아직 없으신가요?</span>
            <h2>스마트스토어에서 제작 쿠폰을 먼저 구매해주세요.</h2>
            <p>
              기본 증멍사진 제작권은 {formatPrice()}원이며, 결제 확인 후 문자로 받은 쿠폰코드와
              주문자 휴대전화 번호를 아래 제작 페이지에 입력하면 됩니다.
            </p>
          </div>
          <a
            href={SITE.smartStoreUrl}
            className="button coupon-purchase-banner__button"
            target={externalStore ? "_blank" : undefined}
            rel={externalStore ? "noreferrer" : undefined}
          >
            쿠폰 구매하러 가기
          </a>
        </aside>

        <MakeWizard demoCode={demoCode} />
      </div>
    </section>
  );
}
