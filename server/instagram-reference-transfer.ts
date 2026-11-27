import { createHash, randomUUID } from "node:crypto";
import {
  isInstagramCloudinaryFile,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  type InstagramReferenceKind,
} from "../app/lib/instagram-reference.js";
import type { CloudinaryAdminConfig } from "./cloudinary-admin.js";
import {
  isInstagramMediaOrigin,
  ReferenceImportError,
  type SourceItem,
} from "./instagram-reference-source.js";

const formats = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
} as const;
type MediaType = keyof typeof formats;

function detectedType(bytes: Buffer): MediaType | null {
  if (bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])))
    return "image/jpeg";
  if (
    bytes
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return "image/png";
  if (
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  )
    return "image/webp";
  if (bytes.toString("ascii", 4, 8) === "ftyp") return "video/mp4";
  return null;
}

export function referenceAssetIdentity(
  partnerId: string,
  actionId: string,
  shortcode: string,
  position: number,
) {
  const folder = `uzzina/work/${partnerId}/instagram`;
  return {
    folder,
    publicId: `${folder}/${actionId}-${shortcode}-${position + 1}`,
  };
}

type Identity = ReturnType<typeof referenceAssetIdentity>;
function confirmedUrl(
  body: unknown,
  cloudName: string,
  kind: InstagramReferenceKind,
  identity: Identity,
) {
  if (
    !body ||
    typeof body !== "object" ||
    !("public_id" in body) ||
    body.public_id !== identity.publicId ||
    !("resource_type" in body) ||
    body.resource_type !== kind ||
    !("secure_url" in body) ||
    typeof body.secure_url !== "string"
  )
    return null;
  if (!urlMatchesReferenceAsset(body.secure_url, cloudName, kind, identity))
    return null;
  return body.secure_url;
}

export function urlMatchesReferenceAsset(
  url: string,
  cloudName: string,
  kind: InstagramReferenceKind,
  identity: Identity,
) {
  if (!isInstagramCloudinaryFile(url, cloudName, kind)) return false;
  const delivery = url.slice(
    `https://res.cloudinary.com/${cloudName}/${kind}/upload/`.length,
  );
  const name = delivery
    .replace(/^v\d+\//, "")
    .replace(/\.(?:jpe?g|png|webp|mp4)$/, "");
  return name === identity.publicId;
}

export async function findReferenceAsset(
  config: CloudinaryAdminConfig,
  kind: InstagramReferenceKind,
  identity: Identity,
) {
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/resources/${kind}/upload/${encodeURIComponent(identity.publicId)}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString("base64")}`,
      },
      redirect: "error",
      signal: AbortSignal.timeout(8_000),
    },
  );
  if (response.status === 404) return null;
  if (response.ok) {
    const url = confirmedUrl(
      await response.json(),
      config.cloudName,
      kind,
      identity,
    );
    if (url) return url;
  }
  throw new ReferenceImportError(
    "Não foi possível verificar o envio anterior. Tente novamente.",
    502,
  );
}

export async function transferReferenceAsset(
  config: CloudinaryAdminConfig,
  item: SourceItem,
  identity: Identity,
) {
  if (!item.sourceUrl || !isInstagramMediaOrigin(item.sourceUrl))
    throw new ReferenceImportError(
      "Este item não tem um arquivo disponível no Instagram.",
      422,
    );
  const transfer = new AbortController();
  const signal = AbortSignal.any([
    transfer.signal,
    AbortSignal.timeout(45_000),
  ]);
  const origin = await fetch(item.sourceUrl, {
    headers: { "Accept-Encoding": "identity" },
    redirect: "manual",
    signal,
  });
  if (origin.status !== 200 || !origin.body) {
    await origin.body?.cancel().catch(() => undefined);
    const stale = [403, 404, 410].includes(origin.status);
    throw new ReferenceImportError(
      "Não foi possível baixar este item do Instagram.",
      502,
      stale ? "SOURCE_EXPIRED" : undefined,
    );
  }
  const max = item.kind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  const declaredLength = Number(origin.headers.get("content-length"));
  const encoding = origin.headers.get("content-encoding");
  const expectedLength =
    !encoding || encoding === "identity" ? declaredLength : 0;
  const declaredType = origin.headers
    .get("content-type")
    ?.split(";")[0]
    ?.trim()
    .toLowerCase();
  const limitError = new ReferenceImportError(
    `O arquivo excede ${max / 1_000_000} MB.`,
    413,
  );
  const typeError = new ReferenceImportError(
    "O arquivo não é uma imagem ou vídeo compatível.",
    422,
  );
  const reader = origin.body.getReader();
  let streamError: unknown;
  try {
    if (declaredLength > max) throw limitError;
    const initial: Uint8Array[] = [];
    let size = 0;
    while (size < 12) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > max) throw limitError;
      initial.push(value);
    }
    const prefix = Buffer.concat(
      initial.map((chunk) => Buffer.from(chunk.subarray(0, 12))),
      Math.min(size, 12),
    );
    const contentType = detectedType(prefix);
    if (
      !contentType?.startsWith(`${item.kind}/`) ||
      (declaredType &&
        declaredType !== "application/octet-stream" &&
        declaredType !== contentType)
    )
      throw typeError;

    const boundary = `uzzina-${randomUUID()}`;
    const params = {
      asset_folder: identity.folder,
      backup: "false",
      overwrite: "false",
      public_id: identity.publicId,
      timestamp: String(Math.floor(Date.now() / 1000)),
    };
    const fields = Object.entries(params); // Cloudinary signs alphabetically sorted parameters.
    const signature = createHash("sha256")
      .update(
        fields.map(([name, value]) => `${name}=${value}`).join("&") +
          config.apiSecret,
      )
      .digest("hex");
    const uploadFileName = `${identity.publicId.split("/").pop() || "instagram"}.${formats[contentType]}`;
    const header =
      [...fields, ["api_key", config.apiKey], ["signature", signature]]
        .map(
          ([name, value]) =>
            `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
        )
        .join("") +
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${uploadFileName}"\r\nContent-Type: ${contentType}\r\n\r\n`;

    async function* multipart() {
      try {
        yield Buffer.from(header);
        yield* initial;
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > max) throw limitError;
          yield value;
        }
        if (expectedLength > 0 && size !== expectedLength)
          throw new ReferenceImportError(
            "O download do arquivo veio incompleto. Tente novamente.",
            502,
          );
        yield Buffer.from(`\r\n--${boundary}--\r\n`);
      } catch (error) {
        streamError = error;
        throw error;
      }
    }
    const request: RequestInit & { duplex: "half" } = {
      method: "POST",
      body: multipart() as unknown as BodyInit,
      duplex: "half",
      headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
      redirect: "error",
      signal,
    };
    const uploaded = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/${item.kind}/upload`,
      request,
    );
    const url = uploaded.ok
      ? confirmedUrl(
          await uploaded.json(),
          config.cloudName,
          item.kind,
          identity,
        )
      : null;
    if (url) return url;
    throw new ReferenceImportError(
      "O Cloudinary não confirmou a cópia. Tente novamente.",
      502,
    );
  } catch (error) {
    throw streamError ?? error;
  } finally {
    transfer.abort();
    await reader.cancel().catch(() => undefined);
  }
}
