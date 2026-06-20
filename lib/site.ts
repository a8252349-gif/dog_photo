import type { FulfillmentType } from "@/lib/types";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const basePrice = Number(process.env.NEXT_PUBLIC_BASE_PRICE || 2000);

export const SITE = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "증멍사진",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "강아지와 고양이 사진 1~3장으로 실제 모습을 닮은 반려동물 증명사진을 제작합니다.",
  url: siteUrl,
  smartStoreUrl: process.env.NEXT_PUBLIC_SMARTSTORE_URL || "/products",
  basePrice,
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@example.com",
  contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "010-0000-0000",
  businessName: process.env.NEXT_PUBLIC_BUSINESS_NAME || "상호명",
  businessNumber: process.env.NEXT_PUBLIC_BUSINESS_NUMBER || "000-00-00000",
  ownerName: process.env.NEXT_PUBLIC_OWNER_NAME || "대표자명",
  address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || "사업장 주소",
  resultRetentionDays: 7,
} as const;

export const PRICE_OPTIONS = {
  baseDigital: 2000,
  smartphoneWallpaper: 800,
  digitalFourCut: 1200,
  digitalCalendar: 1200,
  decorationBundle: 1900,
  idPhotoEight: 2500,
  print4x6: 1500,
  print5x7: 2000,
  fourCutPrint: 2000,
  calendarPrint: 2500,
  woodFrame5x7Total: 14000,
  woodFrame5x7Option: 12000,
  shipping: 3000,
} as const;

export const PRODUCT_OPTIONS: Record<
  FulfillmentType,
  {
    label: string;
    shortLabel: string;
    description: string;
    priceLabel: string;
  }
> = {
  digital: {
    label: "디지털 파일",
    shortLabel: "디지털",
    description: "5:7 고해상도 JPG 1장을 온라인으로 제공합니다.",
    priceLabel: "2,000원",
  },
  print: {
    label: "디지털 파일 + 인화",
    shortLabel: "인화",
    description: "증명사진 8장 또는 선택한 규격의 인화 1장을 함께 배송합니다.",
    priceLabel: "3,500원부터",
  },
  frame: {
    label: "디지털 파일 + 5×7 우드 액자",
    shortLabel: "5×7 우드 액자",
    description: "5×7 인화 1장을 우드 액자에 넣어 배송합니다.",
    priceLabel: "14,000원",
  },
};

export function absoluteUrl(path = "") {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function formatPrice(value = SITE.basePrice) {
  return new Intl.NumberFormat("ko-KR").format(value);
}
