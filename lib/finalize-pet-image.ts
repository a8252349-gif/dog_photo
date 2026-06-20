import sharp from "sharp";

export const FINAL_IMAGE_WIDTH = 2500;
export const FINAL_IMAGE_HEIGHT = 3500;
const TARGET_RATIO = FINAL_IMAGE_WIDTH / FINAL_IMAGE_HEIGHT;

/**
 * Converts the native generated portrait into an exact 5:7 file by cropping
 * existing pixels only. It never pads, extends, outpaints, or adds side bars.
 */
export async function finalizePetImageToFiveBySeven(
  input: Buffer,
  backgroundHex: string,
): Promise<Buffer> {
  const normalized = sharp(input).rotate().flatten({ background: backgroundHex });
  const metadata = await normalized.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("생성 이미지의 크기를 확인하지 못했습니다.");
  }

  const sourceWidth = metadata.width;
  const sourceHeight = metadata.height;
  const sourceRatio = sourceWidth / sourceHeight;

  let width = sourceWidth;
  let height = sourceHeight;
  let left = 0;
  let top = 0;

  if (sourceRatio < TARGET_RATIO) {
    // Typical GPT portrait output is 2:3 and slightly narrower than 5:7.
    // Crop only a small amount from the top and bottom. Never add side pixels.
    height = Math.max(1, Math.round(sourceWidth / TARGET_RATIO));
    top = Math.max(0, Math.floor((sourceHeight - height) / 2));
  } else if (sourceRatio > TARGET_RATIO) {
    // Defensive path for an unexpectedly wider source.
    width = Math.max(1, Math.round(sourceHeight * TARGET_RATIO));
    left = Math.max(0, Math.floor((sourceWidth - width) / 2));
  }

  return normalized
    .extract({ left, top, width, height })
    .resize(FINAL_IMAGE_WIDTH, FINAL_IMAGE_HEIGHT, {
      fit: "fill",
      withoutEnlargement: false,
    })
    .jpeg({
      quality: 95,
      chromaSubsampling: "4:4:4",
      mozjpeg: true,
    })
    .toBuffer();
}
