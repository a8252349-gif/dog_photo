import Link from "next/link";
import { BeforeAfterGallery } from "@/components/BeforeAfterGallery";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTA } from "@/components/CTA";
import { createMetadata } from "@/lib/metadata";
import { CAT_SAMPLE_PAIRS } from "@/lib/samples";

export const metadata = createMetadata({
  title: "고양이 증명사진 제작",
  description:
    "고양이의 눈 색, 얼굴 무늬, 수염과 귀 모양을 유지한 정면 반려동물 증명사진을 제작합니다.",
  path: "/cat-id-photo",
});

export default function CatPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <Breadcrumbs items={[{ label: "고양이 증명사진" }]} />
          <span className="eyebrow">CAT ID PHOTO</span>
          <h1>
            눈 색과 얼굴 무늬까지,
            <br />
            고양이다운 정면 사진.
          </h1>
          <p>
            고양이는 좌우 얼굴 무늬와 눈 색, 귀의 방향, 수염 자리만 달라져도 인상이 크게 바뀝니다.
            여러 각도의 사진을 함께 비교해 자연스럽게 정면을 구성합니다.
          </p>
        </div>
      </section>
      <section className="content-section">
        <div className="shell content-grid">
          <aside className="side-nav">
            <a href="#samples">전후 샘플</a>
            <a href="#features">고양이 특징</a>
            <a href="#upload">업로드 방법</a>
            <a href="#expression">표정</a>
            <a href="#background">배경</a>
          </aside>
          <article className="prose">
            <h2 id="samples">고양이 증멍사진 제작 전후</h2>
            <BeforeAfterGallery samples={CAT_SAMPLE_PAIRS} compact />

            <h2 id="features">얼굴 무늬의 좌우 위치를 지킵니다.</h2>
            <p>
              턱 아래 흰 털, 코 옆 점, 이마의 줄무늬처럼 고양이를 알아보게 만드는 요소를 반대로
              뒤집거나 평균화하지 않도록 제작 프롬프트에 명확히 반영했습니다.
            </p>
            <h2 id="upload">첫 사진은 눈과 코가 선명한 사진으로</h2>
            <p>
              정면을 바라보는 사진이 가장 좋지만 완벽한 정면이 아니어도 괜찮습니다. 첫 사진은 얼굴이
              크고 선명한 사진, 보조 사진은 귀와 옆얼굴이 보이는 사진으로 구성해주세요.
            </p>
            <h2 id="expression">억지로 웃는 표정을 만들지 않습니다.</h2>
            <p>
              고양이의 자연스러운 입 모양과 눈매를 유지합니다. 눈을 지나치게 동그랗게 키우거나 어린
              고양이처럼 바꾸지 않습니다.
            </p>
            <h2 id="background">흰 털에는 약한 색 대비가 좋습니다.</h2>
            <p>
              흰색이나 크림색 털은 세이지 그린, 소프트 핑크, 라벤더처럼 밝고 채도가 낮은 배경에서 경계가
              자연스럽게 보입니다. <Link href="/guide/background-colors">배경색 7종 비교</Link>를 참고해주세요.
            </p>
          </article>
        </div>
      </section>
      <CTA />
    </>
  );
}
