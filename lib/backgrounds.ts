import type { BackgroundKey } from "@/lib/types";

export const BACKGROUNDS: Record<
  BackgroundKey,
  { label: string; hex: string; description: string }
> = {
  "butter-yellow": {
    label: "버터 옐로우",
    hex: "#F4D86A",
    description: "검정·갈색 털이 또렷하게 살아나는 밝고 유쾌한 색",
  },
  cream: {
    label: "크림 아이보리",
    hex: "#F2E7D5",
    description: "어떤 털색에도 무난한 따뜻하고 차분한 색",
  },
  "warm-beige": {
    label: "웜 베이지",
    hex: "#CDB79E",
    description: "포근하고 클래식한 스튜디오 분위기의 색",
  },
  "soft-pink": {
    label: "소프트 핑크",
    hex: "#E9C8CC",
    description: "부드럽고 사랑스러운 인상을 만드는 저채도 핑크",
  },
  "sage-green": {
    label: "세이지 그린",
    hex: "#B8C9B2",
    description: "흰 털과 크림 털에 은은한 대비를 주는 색",
  },
  "sky-blue": {
    label: "스카이 블루",
    hex: "#BFD9EA",
    description: "깨끗하고 시원한 증명사진 느낌의 밝은 블루",
  },
  lavender: {
    label: "라벤더",
    hex: "#D7CDE8",
    description: "회색·흰색 털과 잘 어울리는 차분한 보라색",
  },
};

export const BACKGROUND_ENTRIES = Object.entries(BACKGROUNDS) as Array<
  [BackgroundKey, (typeof BACKGROUNDS)[BackgroundKey]]
>;
