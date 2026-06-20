import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  const all = [{ label: "홈", href: "/" }, ...items];
  return (
    <>
      <nav className="breadcrumbs" aria-label="현재 위치">
        {all.map((item, index) => (
          <span key={`${item.label}-${index}`}>
            {item.href && index !== all.length - 1 ? <Link href={item.href}>{item.label}</Link> : item.label}
            {index < all.length - 1 && <b aria-hidden="true">/</b>}
          </span>
        ))}
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.label,
            item: absoluteUrl(item.href || ""),
          })),
        }}
      />
    </>
  );
}
