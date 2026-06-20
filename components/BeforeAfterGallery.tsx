import Image from "next/image";
import type { SamplePair } from "@/lib/samples";

export function BeforeAfterGallery({
  samples,
  compact = false,
}: {
  samples: SamplePair[];
  compact?: boolean;
}) {
  return (
    <div className={`before-after-grid ${compact ? "before-after-grid--compact" : ""}`}>
      {samples.map((sample) => (
        <article className="before-after-card" key={sample.id}>
          <div className="before-after-card__images">
            <figure>
              <Image
                src={sample.before}
                alt={`${sample.name} 증멍사진 제작 전 원본`}
                width={900}
                height={1125}
              />
              <figcaption>제작 전</figcaption>
            </figure>
            <figure>
              <Image
                src={sample.after}
                alt={`${sample.name} ${sample.background} 배경 증멍사진 완성본`}
                width={1000}
                height={1400}
              />
              <figcaption>제작 후</figcaption>
            </figure>
          </div>
          <div className="before-after-card__caption">
            <strong>{sample.name}</strong>
            <span>{sample.background} 배경</span>
          </div>
        </article>
      ))}
    </div>
  );
}
