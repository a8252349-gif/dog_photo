import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StoryCard } from "@/components/StoryCard";
import { getPublishedStories } from "@/lib/story-service";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "반려동물 사진 이야기와 제작 가이드",
  description: "강아지·고양이 증명사진 원본 선택, 배경색, 인화와 액자 이용 방법을 안내합니다.",
  path: "/story",
});

export default async function StoryPage() {
  const stories = await getPublishedStories();
  return (
    <>
      <header className="page-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: "홈", href: "/" }, { label: "이야기" }]} />
          <span className="eyebrow">PET PHOTO JOURNAL</span>
          <h1>반려동물 사진 이야기</h1>
          <p>우리 아이와 더 닮은 사진을 만들기 위한 촬영 팁과 제작 안내를 차곡차곡 정리합니다.</p>
        </div>
      </header>
      <section className="content-section">
        <div className="container">
          <div className="story-grid">
            {stories.map((story) => <StoryCard key={story.id || story.slug} story={story} />)}
          </div>
        </div>
      </section>
    </>
  );
}
