import { v2 as cloudinary } from "cloudinary";
import logger from "./logger";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export function generateUploadSignature(eventId: string) {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `manunggal/events/${eventId}`;

  const paramsToSign = {
    timestamp,
    folder,
  };

  try {
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    logger.debug({ eventId, folder }, "Upload signature generated");

    return {
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
    };
  } catch (error) {
    logger.error({ eventId, err: error }, "Failed to generate upload signature");
    throw error;
  }
}

export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info({ publicId, result }, "Image deleted");
    return result;
  } catch (error) {
    logger.error({ publicId, err: error }, "Failed to delete image");
    throw error;
  }
}

export function getThumbnailUrl(url: string, width = 300) {
  return url.replace("/upload/", `/upload/w_${width},h_${width},c_fill,f_auto/`);
}
