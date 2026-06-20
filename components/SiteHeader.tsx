import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/site";

const nav = [
  ["상품 안내", "/products"],
  ["강아지 증명사진", "/dog-id-photo"],
  ["고양이 증명사진", "/cat-id-photo"],
  ["제작 가이드", "/guide/photo-selection"],
  ["이야기", "/story"],
  ["자주 묻는 질문", "/faq"],
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner shell">
        <Link href="/" className="brand brand--wordmark" aria-label={`${SITE.name} 홈`}>
          <Image
            src="/brand-logo.png"
            alt="증멍사진"
            width={737}
            height={209}
            className="brand__wordmark"
            priority
          />
        </Link>
        <nav className="desktop-nav" aria-label="주요 메뉴">
          {nav.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/make" className="button button--small">
          쿠폰으로 제작하기
        </Link>
      </div>
      <nav className="mobile-nav" aria-label="모바일 주요 메뉴">
        {nav.slice(0, 5).map(([label, href]) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
