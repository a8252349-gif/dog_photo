import type { Metadata } from "next";
import { SITE, absoluteUrl } from "@/lib/site";

export function createMetadata({
  title,
  description,
  path,
  noIndex = false,
  image = "/opengraph-image",
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  image?: string;
}): Metadata {
  const canonical = absoluteUrl(path);
  return {
    title,
    description,
    alternates: {
      canonical,
      types: { "application/rss+xml": absoluteUrl("/rss.xml") },
    },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: SITE.name,
      title,
      description,
      url: canonical,
      images: [{ url: absoluteUrl(image), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(image)],
    },
  };
}
