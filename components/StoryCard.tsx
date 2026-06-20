import Link from "next/link";
import type { Story } from "@/lib/types";

function date(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : new Intl.DateTimeFormat("ko-KR").format(parsed);
}

export function StoryCard({ story }: { story: Story }) {
  return (
    <article className="story-card">
      <Link href={`/story/${story.slug}`} className="story-card__image" aria-label={story.title}>
        {/* 게시판 이미지는 외부 도메인도 허용하기 위해 일반 img를 사용합니다. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={story.coverImage || "/after-dog-pomeranian.webp"} alt="" loading="lazy" />
      </Link>
      <div className="story-card__body">
        <time dateTime={story.publishedAt}>{date(story.publishedAt)}</time>
        <h3><Link href={`/story/${story.slug}`}>{story.title}</Link></h3>
        <p>{story.summary}</p>
        <Link href={`/story/${story.slug}`} className="text-link">자세히 읽기 →</Link>
      </div>
    </article>
  );
}
