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

    logger.debug("Upload signature generated", { eventId, folder });

    return {
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
    };
  } catch (error) {
    logger.error("Failed to generate upload signature", { eventId }, error as Error);
    throw error;
  }
}

export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info("Image deleted", { publicId, result });
    return result;
  } catch (error) {
    logger.error("Failed to delete image", { publicId }, error as Error);
    throw error;
  }
}

export function getThumbnailUrl(url: string, width = 300) {
  return url.replace("/upload/", `/upload/w_${width},h_${width},c_fill,f_auto/`);
}
