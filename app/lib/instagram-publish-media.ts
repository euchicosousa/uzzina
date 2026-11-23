export type InstagramPublishFormat = "feed" | "video" | "reel" | "stories";

export function getInstagramPublishMediaKind(
  url: string,
): "image" | "video" | null {
  if (/\.(jpe?g|png)(?:[?#]|$)/i.test(url)) return "image";
  if (/\.(mp4|mov)(?:\?|$)/i.test(url)) return "video";
  return null;
}

export function instagramPublishMediaError(
  format: InstagramPublishFormat,
  files: string[],
): string | null {
  if (files.length === 0) return "Selecione pelo menos um arquivo.";
  if (files.length > 20) return "Selecione no máximo 20 arquivos por envio.";
  const kinds = files.map(getInstagramPublishMediaKind);
  if (
    kinds.some((kind) => kind === null) ||
    files.some((file) => !file.startsWith("https://"))
  )
    return "Este arquivo não é compatível com a publicação no Instagram.";
  if (format === "feed" && kinds.length === 1 && kinds[0] !== "image")
    return "Escolha uma imagem ou use Vídeo no feed para publicar um vídeo isolado.";
  if (
    (format === "video" || format === "reel") &&
    (kinds.length !== 1 || kinds[0] !== "video")
  )
    return "Escolha um único vídeo para este formato.";
  return null;
}
