import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Link href="/" className="brand brand--footer brand--wordmark" aria-label={`${SITE.name} 홈`}>
            <Image
              src="/brand-logo.png"
              alt="증멍사진"
              width={737}
              height={209}
              className="brand__wordmark brand__wordmark--footer"
            />
          </Link>
          <p className="muted footer-copy">{SITE.description}</p>
        </div>
        <div>
          <strong>안내</strong>
          <Link href="/products">상품 구성</Link>
          <Link href="/guide/photo-selection">사진 선택 방법</Link>
          <Link href="/guide/background-colors">배경색 안내</Link>
          <Link href="/guide/print-frame">인화·액자 안내</Link>
        </div>
        <div>
          <strong>정책</strong>
          <Link href="/policy/terms">이용약관</Link>
          <Link href="/policy/privacy">개인정보처리방침</Link>
          <Link href="/policy/refund">취소·환불 안내</Link>
          <Link href="/rss.xml">RSS</Link>
          <Link href="/sitemap.xml">사이트맵</Link>
        </div>
        <div className="business-info">
          <strong>사업자 정보</strong>
          <span>{SITE.businessName} · 대표 {SITE.ownerName}</span>
          <span>사업자등록번호 {SITE.businessNumber}</span>
          <span>{SITE.address}</span>
          <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
          <a href={`tel:${SITE.contactPhone.replace(/\D/g, "")}`}>{SITE.contactPhone}</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </div>
    </footer>
  );
}
