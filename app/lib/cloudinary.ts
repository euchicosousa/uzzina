import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/**
 * Faz upload de um arquivo para o Cloudinary.
 * @param file - Buffer ou string base64 ou URL pública
 * @param options - Opções extras do Cloudinary (folder, public_id, etc.)
 */
export async function uploadToCloudinary(
  file: string,
  options: {
    folder?: string;
    public_id?: string;
    transformation?: object[];
  } = {},
) {
  const result = await cloudinary.uploader.upload(file, {
    folder: options.folder ?? "uzzina",
    public_id: options.public_id,
    transformation: options.transformation,
    resource_type: "auto",
  });

  return result;
}

/**
 * Remove uma imagem do Cloudinary pelo public_id.
 */
export async function deleteFromCloudinary(public_id: string) {
  return cloudinary.uploader.destroy(public_id);
}

/**
 * Gera uma URL otimizada para uma imagem no Cloudinary.
 */
export function getCloudinaryUrl(
  public_id: string,
  options: { width?: number; height?: number; quality?: number } = {},
) {
  return cloudinary.url(public_id, {
    width: options.width,
    height: options.height,
    quality: options.quality ?? "auto",
    fetch_format: "auto",
    secure: true,
  });
}
