import crypto from "node:crypto";
import type { FulfillmentType } from "@/lib/types";

export type OrderTokenPayload = {
  code: string;
  phone: string;
  orderId: string;
  petName: string;
  fulfillmentType: FulfillmentType;
  iat: number;
  exp: number;
};

function secret() {
  return process.env.ORDER_TOKEN_SECRET || "development-only-change-this-secret";
}

export function signOrderToken(payload: OrderTokenPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifyOrderToken(token: string): OrderTokenPayload {
  const [body, signature] = token.split(".");
  if (!body || !signature) throw new Error("제작 세션 정보가 올바르지 않습니다.");
  const expected = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error("제작 세션 인증에 실패했습니다.");
  }
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as OrderTokenPayload;
  if (!payload.exp || payload.exp < Date.now()) throw new Error("제작 세션이 만료되었습니다.");
  return payload;
}
