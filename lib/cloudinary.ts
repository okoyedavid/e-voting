import "server-only";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_KEY;
  const apiSecret = process.env.CLOUDINARY_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new Error("Cloudinary is not configured");
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
}

function hasValidSignature(buffer: Buffer, mimeType: string) {
  if (mimeType === "image/jpeg") return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === "image/webp") return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}

export function validateImageFile(file: File, buffer: Buffer) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) throw new Error("Only JPEG, PNG and WebP images are supported");
  if (file.size < 1 || file.size > MAX_IMAGE_BYTES) throw new Error("Images must be smaller than 5 MB");
  if (!hasValidSignature(buffer, file.type)) throw new Error("The file content does not match its image type");
}

export async function uploadCloudinaryImage(buffer: Buffer, folder: string) {
  configureCloudinary();
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        unique_filename: true,
        overwrite: false,
        transformation: [{ width: 2400, height: 2400, crop: "limit" }],
      },
      (error, result) => error || !result ? reject(error ?? new Error("Cloudinary returned no upload result")) : resolve(result),
    );
    stream.end(buffer);
  });
}

export async function deleteCloudinaryImage(publicId: string) {
  configureCloudinary();
  const result = await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
  if (result.result !== "ok" && result.result !== "not found") throw new Error("Cloudinary could not remove the previous image");
}
