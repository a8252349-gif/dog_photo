export type TearOption = "clean" | "preserve";
export type FulfillmentType = "digital" | "print" | "frame";
export type CaptionMode = "none" | "name" | "name-line";
export type CaptionDirection = "horizontal" | "vertical";
export type CaptionWeight = 400 | 500 | 600 | 700;
export type CaptionFontKey =
  | "noto-sans"
  | "ibm-plex"
  | "gowun-dodum"
  | "noto-serif"
  | "nanum-myeongjo"
  | "inter";

export type BackgroundKey =
  | "butter-yellow"
  | "cream"
  | "warm-beige"
  | "soft-pink"
  | "sage-green"
  | "sky-blue"
  | "lavender";

export type CouponInfo = {
  ok: boolean;
  status: string;
  message: string;
  code?: string;
  productOrderId?: string;
  productOption?: string;
  fulfillmentType?: FulfillmentType;
  optionLocked?: boolean;
};

export type Story = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  seoTitle: string;
  seoDescription: string;
  status: "draft" | "published";
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};
