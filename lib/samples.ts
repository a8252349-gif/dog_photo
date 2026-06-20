export type SamplePair = {
  id: string;
  name: string;
  species: "dog" | "cat";
  before: string;
  after: string;
  background: string;
};

export const DOG_SAMPLE_PAIRS: SamplePair[] = [
  {
    id: "white-puppy",
    name: "흰색 아기 강아지",
    species: "dog",
    before: "/before-dog-white.webp",
    after: "/after-dog-white.webp",
    background: "스카이 블루",
  },
  {
    id: "pomeranian",
    name: "크림 포메라니안",
    species: "dog",
    before: "/before-dog-pomeranian.webp",
    after: "/after-dog-pomeranian.webp",
    background: "라벤더",
  },
  {
    id: "yorkie",
    name: "요크셔테리어",
    species: "dog",
    before: "/before-dog-yorkie.webp",
    after: "/after-dog-yorkie.webp",
    background: "웜 베이지",
  },
];

export const CAT_SAMPLE_PAIRS: SamplePair[] = [
  {
    id: "ginger-cat",
    name: "크림 장모 고양이",
    species: "cat",
    before: "/before-cat-ginger.webp",
    after: "/after-cat-ginger.webp",
    background: "세이지 그린",
  },
  {
    id: "tabby-cat",
    name: "줄무늬 고양이",
    species: "cat",
    before: "/before-cat-tabby.webp",
    after: "/after-cat-tabby.webp",
    background: "크림 베이지",
  },
  {
    id: "tuxedo-cat",
    name: "턱시도 고양이",
    species: "cat",
    before: "/before-cat-tuxedo.webp",
    after: "/after-cat-tuxedo.webp",
    background: "버터 옐로우",
  },
];

export const SAMPLE_PAIRS: SamplePair[] = [
  ...DOG_SAMPLE_PAIRS,
  ...CAT_SAMPLE_PAIRS,
];
