export type PostType = "empty" | "image" | "video" | "carousel";

export function detectPostType(files: string[]): PostType {
  if (files.length === 0) return "empty";
  const first = files[0];
  const isVideo =
    first.includes("/video/upload/") ||
    /\.(mp4|mov|webm|avi|mkv)(\?|$)/i.test(first);
  if (isVideo) return "video";
  if (files.length === 1) return "image";
  return "carousel";
}

/** Detecta se uma URL é de imagem (Cloudinary image ou extensão comum). */
export function isImageUrl(url: string): boolean {
  return (
    url.includes("/image/upload/") ||
    /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?|$)/i.test(url)
  );
}
