import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTA } from "@/components/CTA";
import { JsonLd } from "@/components/JsonLd";
import { getPublishedStory } from "@/lib/story-service";
import { createMetadata } from "@/lib/metadata";
import { absoluteUrl, SITE } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const story = await getPublishedStory(slug);
  if (!story) return createMetadata({ title: "게시글을 찾을 수 없습니다", description: SITE.description, path: `/story/${slug}`, noIndex: true });
  return createMetadata({
    title: story.seoTitle || story.title,
    description: story.seoDescription || story.summary,
    path: `/story/${story.slug}`,
    image: story.coverImage || "/opengraph-image",
  });
}

export default async function StoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await getPublishedStory(slug);
  if (!story) notFound();
  const published = story.publishedAt || story.createdAt;
  const cover = story.coverImage || "/after-dog-pomeranian.webp";

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: story.title,
        description: story.summary,
        image: [absoluteUrl(cover)],
        datePublished: published,
        dateModified: story.updatedAt || published,
        author: { "@type": "Organization", name: SITE.businessName },
        publisher: { "@type": "Organization", name: SITE.businessName },
        mainEntityOfPage: absoluteUrl(`/story/${story.slug}`),
      }} />
      <article>
        <header className="article-hero">
          <div className="container article-hero__inner">
            <div>
              <Breadcrumbs items={[{ label: "홈", href: "/" }, { label: "이야기", href: "/story" }, { label: story.title }]} />
              <span className="eyebrow">PET PHOTO JOURNAL</span>
              <h1>{story.title}</h1>
              <p>{story.summary}</p>
              {published && <time dateTime={published}>{new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(published))}</time>}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt={story.title} className="article-cover" />
          </div>
        </header>
        <div className="container article-layout">
          <div className="prose article-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
              img: ({ src, alt }) => typeof src === "string" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={alt || "게시글 이미지"} />
              ) : null,
              a: ({ href, children }) => <a href={href} rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}>{children}</a>,
            }}>{story.content}</ReactMarkdown>
          </div>
        </div>
      </article>
      <CTA />
    </>
  );
}
