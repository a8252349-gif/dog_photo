import { SolapiMessageService } from "solapi";
import { SITE } from "@/lib/site";

export type SolapiSendResult = {
  ok: boolean;
  provider: "solapi";
  status: "sent" | "skipped" | "failed";
  groupId?: string;
  messageId?: string;
  statusCode?: string;
  error?: string;
};

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function getClient() {
  const apiKey = process.env.SOLAPI_API_KEY?.trim();
  const apiSecret = process.env.SOLAPI_API_SECRET?.trim();
  const sender = normalizePhone(process.env.SOLAPI_SENDER_NUMBER || "");

  if (!apiKey || !apiSecret || !sender) return null;

  return {
    sender,
    service: new SolapiMessageService(apiKey, apiSecret),
  };
}

async function sendTextMessage(input: {
  to: string;
  text: string;
  subject?: string;
}): Promise<SolapiSendResult> {
  const client = getClient();
  const to = normalizePhone(input.to);

  if (!client) {
    return {
      ok: false,
      provider: "solapi",
      status: "skipped",
      error: "SOLAPI 환경변수가 설정되지 않았습니다.",
    };
  }

  if (to.length < 10 || to.length > 11) {
    return {
      ok: false,
      provider: "solapi",
      status: "failed",
      error: "수신 휴대전화 번호 형식이 올바르지 않습니다.",
    };
  }

  try {
    const response = await client.service.send({
      to,
      from: client.sender,
      text: input.text,
      subject: input.subject,
      autoTypeDetect: true,
    });

    const message = response.messageList?.[0];

    return {
      ok: true,
      provider: "solapi",
      status: "sent",
      groupId: response.groupInfo.groupId,
      messageId: message?.messageId,
      statusCode: message?.statusCode,
    };
  } catch (error) {
    return {
      ok: false,
      provider: "solapi",
      status: "failed",
      error:
        error instanceof Error
          ? error.message
          : "SOLAPI 문자 발송 중 알 수 없는 오류가 발생했습니다.",
    };
  }
}

export async function sendCouponIssuedMessage(input: {
  phone: string;
  code: string;
  productOption: string;
}) {
  const text = [
    `[${SITE.name}] 이용권이 발급되었습니다.`,
    `이용권 코드: ${input.code}`,
    `상품 구성: ${input.productOption || "디지털 파일"}`,
    `제작하기: ${SITE.url}/make`,
    "스마트스토어 주문 시 입력한 휴대전화 번호와 함께 이용해주세요.",
  ].join("\n");

  return sendTextMessage({
    to: input.phone,
    subject: `${SITE.name} 이용권 발급`,
    text,
  });
}

export async function sendResultReadyMessage(input: {
  phone: string;
  petName?: string;
  resultUrl: string;
  expiresAt?: string;
  fulfillmentLabel?: string;
}) {
  const expiry = input.expiresAt
    ? new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(input.expiresAt))
    : "문자 수신 후 7일";

  const name = input.petName?.trim()
    ? `${input.petName.trim()}의 증멍사진`
    : "반려동물 증멍사진";

  const lines = [
    `[${SITE.name}] ${name} 제작이 완료되었습니다.`,
    `완성사진: ${input.resultUrl}`,
    `다운로드 기한: ${expiry}`,
  ];

  if (input.fulfillmentLabel && input.fulfillmentLabel !== "디지털 파일") {
    lines.push(
      `${input.fulfillmentLabel} 상품은 스마트스토어 주문 정보에 따라 별도로 준비됩니다.`,
    );
  }

  return sendTextMessage({
    to: input.phone,
    subject: `${SITE.name} 제작 완료`,
    text: lines.join("\n"),
  });
}

export async function sendSolapiTestMessage(phone: string) {
  return sendTextMessage({
    to: phone,
    subject: `${SITE.name} 연동 테스트`,
    text: `[${SITE.name}] SOLAPI 문자 연동이 정상적으로 설정되었습니다.`,
  });
}
