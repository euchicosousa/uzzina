import { z } from "zod";

export const MAX_INSTAGRAM_FILES = 20;
export const MAX_IMAGE_BYTES = 10_000_000;
export const MAX_VIDEO_BYTES = 50_000_000;

export function normalizeInstagramReference(value: string) {
  const input = value.trim();
  if (
    !/^https:\/\/(?:www\.)?instagram\.com\//i.test(input) ||
    input.length > 2048
  )
    return null;
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }
  if (/^\/stories\//i.test(url.pathname)) return null;
  const match =
    /^\/(?:[a-zA-Z0-9._]{1,30}\/)?(p|reels?)\/([\w-]{1,32})\/?$/.exec(
      url.pathname,
    );
  if (!match) return null;
  const kind = match[1] === "p" ? "p" : "reel";
  return `https://www.instagram.com/${kind}/${match[2]}/`;
}

export const InstagramReferenceKind = z.enum(["image", "video"]);
export type InstagramReferenceKind = z.infer<typeof InstagramReferenceKind>;

export function isInstagramCloudinaryFile(
  url: string,
  cloudName: string,
  kind: InstagramReferenceKind,
) {
  try {
    const parsed = new URL(url);
    return (
      parsed.origin === "https://res.cloudinary.com" &&
      !parsed.username &&
      !parsed.password &&
      !parsed.search &&
      !parsed.hash &&
      parsed.pathname.startsWith(`/${cloudName}/${kind}/upload/`) &&
      parsed.href === url
    );
  } catch {
    return false;
  }
}
