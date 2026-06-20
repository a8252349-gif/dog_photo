import {
  sendCouponIssuedMessage,
  sendResultReadyMessage,
  type SolapiSendResult,
} from "@/lib/solapi";

async function callLegacyWebhook(payload: Record<string, unknown>) {
  const url = process.env.RESULT_NOTIFICATION_WEBHOOK_URL;
  if (!url) return;

  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-webhook-secret": process.env.RESULT_NOTIFICATION_WEBHOOK_SECRET || "",
    },
    body: JSON.stringify(payload),
  }).catch((error) =>
    console.error("Result notification webhook failed", error),
  );
}

export async function notifyCouponIssued(input: {
  phone: string;
  code: string;
  productOption: string;
}): Promise<SolapiSendResult> {
  return sendCouponIssuedMessage(input);
}

export async function notifyResult(input: {
  orderId: string;
  phone: string;
  petName?: string;
  fulfillmentType: string;
  fulfillmentLabel: string;
  resultUrl: string;
  expiresAt?: string;
  siteName: string;
}): Promise<SolapiSendResult> {
  const result = await sendResultReadyMessage({
    phone: input.phone,
    petName: input.petName,
    resultUrl: input.resultUrl,
    expiresAt: input.expiresAt,
    fulfillmentLabel: input.fulfillmentLabel,
  });

  await callLegacyWebhook({
    event: "pet-photo.completed",
    ...input,
    solapi: result,
  });

  return result;
}
