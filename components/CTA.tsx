import Link from "next/link";
import { SITE } from "@/lib/site";

export function CTA() {
  const storeExternal = /^https?:\/\//.test(SITE.smartStoreUrl);
  return (
    <section className="cta-band">
      <div className="shell cta-band__inner">
        <div>
          <span className="eyebrow eyebrow--light">ONE-TIME COUPON</span>
          <h2>스마트스토어에서 구매하고<br />문자로 받은 쿠폰으로 제작하세요.</h2>
          <p>결제와 배송 정보는 스마트스토어에서 관리하고, 사진 업로드와 제작 옵션 선택은 이 홈페이지에서 진행합니다.</p>
        </div>
        <div className="cta-band__actions">
          <a className="button button--light" href={SITE.smartStoreUrl} target={storeExternal ? "_blank" : undefined} rel={storeExternal ? "noreferrer" : undefined}>스마트스토어 상품 보기</a>
          <Link className="button button--outline-light" href="/make">쿠폰이 있어요</Link>
        </div>
      </div>
    </section>
  );
}
