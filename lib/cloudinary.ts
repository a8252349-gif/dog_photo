import { v2 as cloudinary } from "cloudinary";

function isConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

function configure() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadBuffer(
  buffer: Buffer,
  options: { publicId: string; folder?: string; resourceType?: "image" | "auto" },
) {
  if (!isConfigured()) return null;
  configure();
  const folder = options.folder || process.env.CLOUDINARY_FOLDER || "pet-id-photo";
  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: options.publicId,
        resource_type: options.resourceType || "image",
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) reject(error || new Error("Cloudinary 업로드에 실패했습니다."));
        else resolve({ secure_url: result.secure_url, public_id: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

export function cloudinaryConfigured() {
  return isConfigured();
}
