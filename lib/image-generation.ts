import OpenAI, { toFile } from "openai";
import sharp from "sharp";
import { BACKGROUNDS } from "@/lib/backgrounds";
import { finalizePetImageToFiveBySeven } from "@/lib/finalize-pet-image";
import { buildPetIdPhotoPrompt } from "@/lib/pet-prompt";
import type { BackgroundKey, TearOption } from "@/lib/types";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
export const PET_PROMPT_VERSION = "bust-v4-upright-head-neck-2026-06-20";

const GPT_IMAGE_2_PRICING_USD_PER_MILLION = {
  imageInput: 8,
  textInput: 5,
  imageOutput: 30,
} as const;


function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function errorStatus(error: unknown) {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = Number((error as { status?: unknown }).status);
    return Number.isFinite(status) ? status : null;
  }
  return null;
}

function retryAfterMs(error: unknown, attempt: number) {
  if (typeof error === "object" && error !== null && "headers" in error) {
    const headers = (error as { headers?: { get?: (name: string) => string | null } }).headers;
    const retryAfter = headers?.get?.("retry-after");
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds > 0) {
      return Math.min(seconds * 1000, 60_000);
    }
  }

  const base = 2_000 * 2 ** attempt;
  const jitter = Math.floor(Math.random() * 1_000);
  return Math.min(base + jitter, 30_000);
}

async function callImageEditWithRetry<T>(operation: () => Promise<T>) {
  const maxRetries = Math.max(0, Number.parseInt(process.env.OPENAI_MAX_RETRIES || "3", 10) || 3);
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const status = errorStatus(error);
      const retryable = status === 429 || (status !== null && status >= 500);

      if (!retryable || attempt >= maxRetries) {
        throw error;
      }

      const delayMs = retryAfterMs(error, attempt);
      console.warn("[GPT Image 재시도]", {
        attempt: attempt + 1,
        maxRetries,
        status,
        delayMs,
      });
      await sleep(delayMs);
    }
  }

  throw lastError;
}

type ImageUsage = {
  input_tokens?: number;
  input_tokens_details?: {
    image_tokens?: number;
    text_tokens?: number;
  };
  output_tokens?: number;
  total_tokens?: number;
};

export type GenerationUsageSummary = {
  imageInputTokens: number;
  textInputTokens: number;
  outputTokens: number;
  totalTokens: number;
  imageInputCostUsd: number;
  textInputCostUsd: number;
  imageOutputCostUsd: number;
  totalCostUsd: number;
};

async function validateFiles(images: File[]) {
  if (images.length < 1 || images.length > 3) {
    throw new Error("사진은 1장 이상 3장 이하로 올려주세요.");
  }

  const buffers: Array<{ file: File; buffer: Buffer }> = [];
  for (const file of images) {
    if (!allowedTypes.has(file.type)) {
      throw new Error("JPG, PNG, WEBP 사진만 사용할 수 있습니다.");
    }
    if (file.size > 15 * 1024 * 1024) {
      throw new Error("사진 한 장의 용량은 15MB 이하여야 합니다.");
    }
    buffers.push({ file, buffer: Buffer.from(await file.arrayBuffer()) });
  }

  return buffers;
}

function getImageQuality(): "low" | "medium" | "high" | "auto" {
  const quality = process.env.OPENAI_IMAGE_QUALITY || "high";
  if (["low", "medium", "high", "auto"].includes(quality)) {
    return quality as "low" | "medium" | "high" | "auto";
  }
  return "high";
}

function getImageSize(): "1024x1024" | "1536x1024" | "1024x1536" | "auto" {
  const size = process.env.OPENAI_IMAGE_SIZE || "1024x1536";
  if (["1024x1024", "1536x1024", "1024x1536", "auto"].includes(size)) {
    return size as "1024x1024" | "1536x1024" | "1024x1536" | "auto";
  }
  return "1024x1536";
}

function calculateUsageCost(usage?: ImageUsage): GenerationUsageSummary | null {
  if (!usage) return null;

  const imageInputTokens = usage.input_tokens_details?.image_tokens ?? 0;
  const textInputTokens = usage.input_tokens_details?.text_tokens ?? 0;
  const outputTokens = usage.output_tokens ?? 0;
  const totalTokens =
    usage.total_tokens ?? imageInputTokens + textInputTokens + outputTokens;

  const imageInputCostUsd =
    (imageInputTokens / 1_000_000) * GPT_IMAGE_2_PRICING_USD_PER_MILLION.imageInput;
  const textInputCostUsd =
    (textInputTokens / 1_000_000) * GPT_IMAGE_2_PRICING_USD_PER_MILLION.textInput;
  const imageOutputCostUsd =
    (outputTokens / 1_000_000) * GPT_IMAGE_2_PRICING_USD_PER_MILLION.imageOutput;

  return {
    imageInputTokens,
    textInputTokens,
    outputTokens,
    totalTokens,
    imageInputCostUsd,
    textInputCostUsd,
    imageOutputCostUsd,
    totalCostUsd: imageInputCostUsd + textInputCostUsd + imageOutputCostUsd,
  };
}

function logUsage({
  usage,
  referenceImageCount,
  model,
  size,
  quality,
}: {
  usage: GenerationUsageSummary | null;
  referenceImageCount: number;
  model: string;
  size: string;
  quality: string;
}) {
  if ((process.env.AI_LOG_USAGE || "true").toLowerCase() === "false") return;

  if (!usage) {
    console.info("[GPT Image 사용량] 응답에 usage 정보가 포함되지 않았습니다.", {
      model,
      size,
      quality,
      referenceImageCount,
    });
    return;
  }

  console.info("[GPT Image 사용량]", {
    model,
    size,
    quality,
    referenceImageCount,
    imageInputTokens: usage.imageInputTokens,
    textInputTokens: usage.textInputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
    imageInputCostUsd: usage.imageInputCostUsd.toFixed(6),
    textInputCostUsd: usage.textInputCostUsd.toFixed(6),
    imageOutputCostUsd: usage.imageOutputCostUsd.toFixed(6),
    totalCostUsd: usage.totalCostUsd.toFixed(6),
  });
}

export async function generatePetPortrait(input: {
  images: File[];
  backgroundKey: BackgroundKey;
  tearOption: TearOption;
}) {
  const sources = await validateFiles(input.images);
  const backgroundHex = BACKGROUNDS[input.backgroundKey].hex;
  const aiMode =
    process.env.AI_MODE || (process.env.OPENAI_API_KEY ? "openai" : "demo");

  if (aiMode === "demo") {
    const rawDemo = await sharp(sources[0].buffer)
      .rotate()
      .resize(1024, 1536, {
        fit: "cover",
        position: "attention",
      })
      .jpeg({ quality: 92, mozjpeg: true })
      .toBuffer();

    const buffer = await finalizePetImageToFiveBySeven(rawDemo, backgroundHex);
    return { buffer, usage: null as GenerationUsageSummary | null };
  }

  if (aiMode !== "openai") {
    throw new Error("AI_MODE는 demo 또는 openai로 설정해주세요.");
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("서버 환경변수 OPENAI_API_KEY가 설정되지 않았습니다.");
  }

  const openai = new OpenAI({ apiKey });
  const sourceFiles = await Promise.all(
    sources.map((source, index) =>
      toFile(
        source.buffer,
        source.file.name || `pet-reference-${index + 1}.jpg`,
        { type: source.file.type },
      ),
    ),
  );

  const model = process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-2";
  const size = getImageSize();
  const quality = getImageQuality();

  try {
    const response = await callImageEditWithRetry(() =>
      openai.images.edit({
        model,
        image: sourceFiles,
        prompt: buildPetIdPhotoPrompt(input),
        size,
        quality,
        output_format: "png",
      }),
    );

    const usage = calculateUsageCost(
      (response as unknown as { usage?: ImageUsage }).usage,
    );

    logUsage({
      usage,
      referenceImageCount: sources.length,
      model,
      size,
      quality,
    });

    const base64 = response.data?.[0]?.b64_json;
    if (!base64) {
      throw new Error("OpenAI에서 이미지 데이터를 반환하지 않았습니다.");
    }

    const rawGeneratedImage = Buffer.from(base64, "base64");

    // 중요: 좌우 배경을 덧붙이거나 contain 패딩을 만들지 않습니다.
    // GPT Image가 만든 전체 캔버스에서 위아래만 소량 중앙 크롭해
    // 5:7(2500x3500)로 변환하므로 좌우는 생성된 배경 그대로 유지됩니다.
    const buffer = await finalizePetImageToFiveBySeven(
      rawGeneratedImage,
      backgroundHex,
    );

    const finalMetadata = await sharp(buffer).metadata();
    if (finalMetadata.width !== 2500 || finalMetadata.height !== 3500) {
      throw new Error(`최종 이미지 규격 오류: ${finalMetadata.width}x${finalMetadata.height}`);
    }

    console.info("[증멍사진 생성 버전]", {
      promptVersion: PET_PROMPT_VERSION,
      finalSize: `${finalMetadata.width}x${finalMetadata.height}`,
      framing: "strict-bust-max-60-percent-background-forward",
    });

    return { buffer, usage };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 OpenAI 오류";
    throw new Error(`AI 이미지 제작에 실패했습니다: ${message}`);
  }
}
