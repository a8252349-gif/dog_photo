import Image from "next/image";

export function BeforeAfter() {
  return (
    <div className="sample-pair" aria-label="포메라니안 증멍사진 제작 전후 예시">
      <figure className="sample-pair__large">
        <Image
          src="/after-dog-pomeranian.webp"
          alt="라벤더 배경으로 완성된 포메라니안 증멍사진"
          width={1000}
          height={1400}
          priority
        />
        <figcaption>제작 후 · 정면 상반신 증멍사진</figcaption>
      </figure>
      <figure className="sample-pair__small">
        <Image
          src="/before-dog-pomeranian.webp"
          alt="포메라니안 증멍사진 제작 전 원본"
          width={900}
          height={1125}
        />
        <figcaption>제작 전 · 휴대전화 원본</figcaption>
      </figure>
    </div>
  );
}
