import Link from "next/link";
import { BeforeAfterGallery } from "@/components/BeforeAfterGallery";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTA } from "@/components/CTA";
import { createMetadata } from "@/lib/metadata";
import { DOG_SAMPLE_PAIRS } from "@/lib/samples";

export const metadata = createMetadata({
  title: "강아지 증명사진 제작",
  description:
    "정면 사진이 아니어도 최대 3장의 강아지 사진을 비교해 귀, 주둥이, 털 무늬를 살린 정면 증명사진을 제작합니다.",
  path: "/dog-id-photo",
});

export default function DogPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <Breadcrumbs items={[{ label: "강아지 증명사진" }]} />
          <span className="eyebrow">DOG ID PHOTO</span>
          <h1>
            강아지의 귀와 표정,
            <br />
            익숙한 얼굴을 그대로.
          </h1>
          <p>
            포메라니안의 털결, 요크셔테리어의 얼굴 무늬, 아기 강아지의 자연스러운 표정처럼 품종보다
            개체를 구분하는 특징을 우선합니다.
          </p>
        </div>
      </section>
      <section className="content-section">
        <div className="shell content-grid">
          <aside className="side-nav">
            <a href="#samples">전후 샘플</a>
            <a href="#identity">닮은 얼굴</a>
            <a href="#photos">사진 선택</a>
            <a href="#tear">눈물 자국</a>
            <a href="#result">결과 구성</a>
          </aside>
          <article className="prose">
            <h2 id="samples">강아지 증멍사진 제작 전후</h2>
            <BeforeAfterGallery samples={DOG_SAMPLE_PAIRS} compact />

            <h2 id="identity">같은 품종이 아니라, 같은 강아지처럼 보여야 합니다.</h2>
            <p>
              얼굴형, 주둥이 길이, 양쪽 귀의 높이, 털의 방향과 흰 무늬 위치를 함께 비교합니다. 눈을
              키우거나 털을 과장해 귀엽게 만드는 보정은 최소화합니다.
            </p>
            <h2 id="photos">정면 사진이 없어도 세 장이면 보완할 수 있어요.</h2>
            <p>
              첫 번째에는 얼굴이 가장 잘 나온 사진을, 두 번째와 세 번째에는 반대쪽 얼굴과 귀 모양이
              보이는 사진을 올려주세요. 현재 모습과 가장 가까운 사진을 첫 번째로 두는 것이 좋습니다.
            </p>
            <h2 id="tear">눈물 자국은 기본적으로 자연스럽게 정리합니다.</h2>
            <p>
              눈 주변 털의 질감과 얼굴 윤곽을 유지하면서 갈색 자국과 눈곱만 완화합니다. 원래 모습을
              그대로 남기고 싶다면 원본존중형을 선택할 수 있습니다.
            </p>
            <h2 id="result">디지털, 인화, 5×7 우드 액자 중 필요한 구성을 고르세요.</h2>
            <p>
              완성 파일은 상반신 중심의 5:7 세로 비율로 제공됩니다. <Link href="/products">상품 구성</Link>과{" "}
              <Link href="/guide/background-colors">배경색 안내</Link>에서 자세한 내용을 확인할 수 있습니다.
            </p>
          </article>
        </div>
      </section>
      <CTA />
    </>
  );
}
