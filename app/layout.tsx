import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { JsonLd } from "@/components/JsonLd";
import { FloatingMakeButton } from "@/components/FloatingMakeButton";
import { SITE, absoluteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} | 반려동물 증명사진 제작`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.businessName }],
  creator: SITE.businessName,
  publisher: SITE.businessName,
  formatDetection: { email: false, address: false, telephone: false },
  alternates: {
    canonical: SITE.url,
    types: { "application/rss+xml": absoluteUrl("/rss.xml") },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NAVER_SITE_VERIFICATION
      ? { "naver-site-verification": process.env.NAVER_SITE_VERIFICATION }
      : undefined,
  },
  icons: { icon: "/icon", apple: "/apple-icon" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE.name,
    url: SITE.url,
    title: `${SITE.name} | 반려동물 증명사진 제작`,
    description: SITE.description,
    images: [{ url: absoluteUrl("/opengraph-image"), width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: SITE.name, description: SITE.description },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f1e7",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE.name,
              url: SITE.url,
              description: SITE.description,
              inLanguage: "ko-KR",
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE.businessName,
              alternateName: SITE.name,
              url: SITE.url,
              email: SITE.contactEmail,
              telephone: SITE.contactPhone,
              address: { "@type": "PostalAddress", streetAddress: SITE.address, addressCountry: "KR" },
              sameAs: /^https?:\/\//.test(SITE.smartStoreUrl) ? [SITE.smartStoreUrl] : undefined,
            },
          ]}
        />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <FloatingMakeButton />
      </body>
    </html>
  );
}
