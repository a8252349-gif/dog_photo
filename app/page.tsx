import Link from "next/link";
import { BeforeAfter } from "@/components/BeforeAfter";
import { BeforeAfterGallery } from "@/components/BeforeAfterGallery";
import { CTA } from "@/components/CTA";
import { JsonLd } from "@/components/JsonLd";
import { ProductCards } from "@/components/ProductCards";
import { StoryCard } from "@/components/StoryCard";
import { BACKGROUND_ENTRIES } from "@/lib/backgrounds";
import { SITE, absoluteUrl, formatPrice } from "@/lib/site";
import { getPublishedStories } from "@/lib/story-service";
import { SAMPLE_PAIRS } from "@/lib/samples";

export const revalidate = 300;

export default async function HomePage() {
  const stories = await getPublishedStories(3);
  const externalStore = /^https?:\/\//.test(SITE.smartStoreUrl);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: `${SITE.name} 반려동물 증명사진 제작 이용권`,
          description: SITE.description,
          image: [absoluteUrl("/after-dog-pomeranian.webp"), absoluteUrl("/after-dog-white.webp"), absoluteUrl("/after-cat-ginger.webp"), absoluteUrl("/after-cat-tabby.webp")],
          brand: { "@type": "Brand", name: SITE.name },
          category: "반려동물 사진 제작 서비스",
          offers: {
            "@type": "Offer",
            url: SITE.smartStoreUrl,
            priceCurrency: "KRW",
            price: SITE.basePrice,
            availability: "https://schema.org/InStock",
          },
        }}
      />

      <section className="hero">
        <div className="shell hero__grid">
          <div className="hero__copy">
            <span className="eyebrow">PET ID PORTRAIT</span>
            <h1>우리 아이 그대로,<br /><em>단정한 한 장의 증명사진으로.</em></h1>
            <p>강아지와 고양이 사진을 최대 3장까지 비교해 얼굴형, 귀 모양, 털 무늬와 비대칭 특징을 살려 정면 증명사진으로 제작합니다.</p>
            <div className="hero__badges">
              <span>실제 개체 특징 우선</span>
              <span>눈물 자국 정리 선택</span>
              <span>배경색 7종</span>
              <span>문구 웹 후처리</span>
            </div>
            <div className="button-row">
              <a className="button" href={SITE.smartStoreUrl} target={externalStore ? "_blank" : undefined} rel={externalStore ? "noreferrer" : undefined}>스마트스토어에서 구매</a>
              <Link className="button button--secondary" href="/make">쿠폰으로 제작하기</Link>
            </div>
            <p className="hero__price">디지털 파일 기본가 <strong>{formatPrice()}원</strong> · 인화와 액자는 스마트스토어 옵션</p>
          </div>
          <BeforeAfter />
        </div>
      </section>

      <section className="trust-strip">
        <div className="shell trust-strip__grid">
          <div><strong>1~3장</strong><span>같은 반려동물 사진 비교</span></div>
          <div><strong>5:7</strong><span>2500×3500px 상반신 결과</span></div>
          <div><strong>7일</strong><span>결과 링크 기본 보관</span></div>
          <div><strong>1회용</strong><span>스마트스토어 쿠폰 연동</span></div>
        </div>
      </section>

      <section className="section section--ivory section--before-after">
        <div className="shell">
          <div className="section-heading section-heading--split">
            <div>
              <span className="eyebrow">REAL RESULTS</span>
              <h2>휴대전화 원본에서<br />단정한 증멍사진으로.</h2>
            </div>
            <p>강아지와 고양이의 얼굴형, 눈 색, 귀 모양과 털 무늬를 살리면서 정면 상반신 구도로 정리합니다.</p>
          </div>
          <BeforeAfterGallery samples={SAMPLE_PAIRS} />
        </div>
      </section>

      <section className="section section--ivory">
        <div className="shell">
          <div className="section-heading">
            <span className="eyebrow">IDENTITY FIRST</span>
            <h2>예쁘게 바꾸기보다,<br />주인이 알아보는 얼굴을 지킵니다.</h2>
            <p>같은 품종의 더 귀여운 동물을 새로 만드는 것이 아니라, 업로드한 반려동물의 고유한 얼굴을 정면으로 재구성하는 데 초점을 맞췄습니다.</p>
          </div>
          <div className="feature-grid">
            <article><span>01</span><h3>첫 사진을 주 기준으로</h3><p>첫 번째 사진의 얼굴과 표정을 가장 중요하게 반영하고 나머지 사진은 귀, 무늬, 반대쪽 얼굴을 보완하는 데 사용합니다.</p></article>
            <article><span>02</span><h3>좌우 무늬를 뒤집지 않게</h3><p>비대칭 털 무늬, 점, 흰 털, 귀의 접힘처럼 개체를 구분하는 특징의 실제 위치를 유지하도록 지시합니다.</p></article>
            <article><span>03</span><h3>과한 미용 보정 없이</h3><p>눈을 키우거나 주둥이를 줄이고 털을 과도하게 풍성하게 만드는 대신, 눈물 자국만 선택적으로 정리합니다.</p></article>
            <article><span>04</span><h3>문구는 생성 후 선명하게</h3><p>이름과 한 줄 문구는 AI에게 맡기지 않고 웹 캔버스에서 직접 렌더링해 한글 깨짐을 줄였습니다.</p></article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading section-heading--split">
            <div><span className="eyebrow">PRODUCT OPTIONS</span><h2>필요한 형태만 선택하세요.</h2></div>
            <p>기본 디지털 파일에 인화 또는 인화+액자 옵션을 더할 수 있습니다. 배송 정보는 스마트스토어 주문을 기준으로 처리합니다.</p>
          </div>
          <ProductCards />
          <div className="centered-link"><Link href="/products" className="text-link">상품 구성 자세히 보기 →</Link></div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="shell">
          <div className="section-heading section-heading--light">
            <span className="eyebrow eyebrow--light">7 BACKGROUNDS</span>
            <h2>털색과 분위기에 맞는<br />일곱 가지 단색 배경</h2>
            <p>배경은 무늬나 그라데이션 없이 균일하게 만들고, 반려동물의 윤곽과 털 질감이 먼저 보이도록 구성합니다.</p>
          </div>
          <div className="palette-grid">
            {BACKGROUND_ENTRIES.map(([key, item]) => (
              <Link href={`/guide/background-colors#${key}`} key={key} className="palette-card">
                <span style={{ background: item.hex }} />
                <strong>{item.label}</strong>
                <small>{item.hex}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--beige">
        <div className="shell">
          <div className="section-heading"><span className="eyebrow">HOW IT WORKS</span><h2>구매부터 완성까지</h2></div>
          <ol className="process-list">
            <li><span>01</span><div><h3>스마트스토어에서 상품 구매</h3><p>디지털, 인화, 인화+액자 중 필요한 옵션을 선택합니다.</p></div></li>
            <li><span>02</span><div><h3>문자로 쿠폰코드 확인</h3><p>결제 확인 후 주문별 1회용 쿠폰을 발급합니다.</p></div></li>
            <li><span>03</span><div><h3>사진과 제작 옵션 선택</h3><p>같은 반려동물 사진 1~3장, 눈가 보정, 배경색을 고릅니다.</p></div></li>
            <li><span>04</span><div><h3>문구 확인 후 최종 저장</h3><p>완성 사진에 이름이나 한 줄 문구를 웹에서 선명하게 넣고 접수합니다.</p></div></li>
          </ol>
        </div>
      </section>

      {stories.length > 0 && (
        <section className="section">
          <div className="shell">
            <div className="section-heading section-heading--split"><div><span className="eyebrow">PET PHOTO GUIDE</span><h2>증멍사진 이야기</h2></div><Link href="/story" className="text-link">전체 글 보기 →</Link></div>
            <div className="story-grid">{stories.map((story) => <StoryCard key={story.id} story={story} />)}</div>
          </div>
        </section>
      )}

      <CTA />
    </>
  );
}
