import { useState } from "react";
import { DownloadIcon, ExternalLinkIcon, XIcon } from "lucide-react";
import { buttonVariants, PrismButton } from "~/components/prism";
import { cn } from "~/lib/utils";
import {
  FileNameLabel,
  fileNameFromUrl,
  getFileExtension,
} from "./FileNameLabel";
import { isImageUrl } from "./InstagramHelpers";

export function getFilePreviewDetails(url: string) {
  const name = fileNameFromUrl(url);
  const extension = getFileExtension(name);
  const isPdf = extension?.toLowerCase() === "pdf";
  const isAudio = /\.(aac|flac|m4a|mp3|oga|ogg|opus|wav|wma)$/i.test(name);
  const canShowVideo =
    /\.(3gp|avi|m4v|mkv|mov|mp4|mpeg|mpg|ogv|webm|wmv)$/i.test(name) ||
    (url.includes("/video/upload/") && !isAudio);
  const canShowImage = !isPdf && (isImageUrl(url) || isImageUrl(name));
  return {
    name,
    extension,
    type: canShowVideo ? "video" : canShowImage ? "image" : null,
  };
}

export function getCloudinaryVideoPosterUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (
    parsed.protocol !== "https:" ||
    parsed.hostname !== "res.cloudinary.com"
  ) {
    return null;
  }
  const marker = "/video/upload/";
  const markerIndex = parsed.pathname.indexOf(marker);
  if (markerIndex === -1) return null;
  if (getFilePreviewDetails(url).type !== "video") return null;

  const prefix = parsed.pathname.slice(0, markerIndex + marker.length);
  const rest = parsed.pathname.slice(markerIndex + marker.length);
  if (!rest) return null;

  const jpgRest = /\.[a-z0-9]+$/i.test(rest)
    ? rest.replace(/\.[a-z0-9]+$/i, ".jpg")
    : `${rest}.jpg`;

  const firstSegment = jpgRest.split("/")[0] ?? "";
  const hasTransformation =
    firstSegment.length > 0 &&
    !/^v\d+$/.test(firstSegment) &&
    (firstSegment.includes(",") || /^(?:c|f|h|q|so|w)_/.test(firstSegment));

  const nextPath = hasTransformation
    ? `${prefix}${jpgRest}`
    : `${prefix}so_0,c_fill,w_320,h_320,q_auto,f_jpg/${jpgRest}`;

  return `${parsed.origin}${nextPath}`;
}

export function getFileDownloadUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  if (
    parsed.protocol !== "https:" ||
    parsed.hostname !== "res.cloudinary.com"
  ) {
    return url;
  }
  const match = /\/(image|video|raw)\/upload\//.exec(parsed.pathname);
  if (!match || match.index === undefined) return url;
  const splitAt = match.index + match[0].length;
  const prefix = parsed.pathname.slice(0, splitAt);
  const rest = parsed.pathname.slice(splitAt);
  if (!rest) return url;
  const firstSegment = rest.split("/")[0] ?? "";
  if (
    firstSegment
      .split(",")
      .some(
        (part) => part === "fl_attachment" || part.startsWith("fl_attachment:"),
      )
  ) {
    return url;
  }
  const safeName = getFilePreviewDetails(url)
    .name.replace(/\.[^.]+$/, "")
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const attachment = safeName ? `fl_attachment:${safeName}` : "fl_attachment";
  return `${parsed.origin}${prefix}${attachment}/${rest}${parsed.search}${parsed.hash}`;
}

export function FilePreviewPanel({
  id,
  url,
  onClose,
}: {
  id: string;
  url: string;
  onClose: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const { name, type } = getFilePreviewDetails(url);
  const posterUrl = type === "video" ? getCloudinaryVideoPosterUrl(url) : null;
  const downloadUrl = getFileDownloadUrl(url);
  const downloadLink = (
    <a
      aria-label="Baixar arquivo"
      className={cn(
        buttonVariants({ size: "icon-xs", variant: "link" }),
        "absolute top-2 right-2 z-10 bg-transparent image-icon hover:bg-transparent hover:no-underline",
      )}
      download={name}
      href={downloadUrl}
      rel="noopener noreferrer"
      title="Baixar arquivo"
    >
      <DownloadIcon />
    </a>
  );

  return (
    <aside
      id={id}
      aria-label="Prévia do arquivo"
      className="grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] border-l"
    >
      <div className="flex min-w-0 items-center justify-between gap-2 border-b px-4 py-3">
        <FileNameLabel name={name} className="flex-1 text-sm font-medium" />
        <PrismButton
          aria-label="Fechar prévia"
          className="shrink-0"
          onPress={onClose}
          size="icon-xs"
          variant="ghost"
        >
          <XIcon />
        </PrismButton>
      </div>
      <div className="min-h-0 overflow-y-auto overscroll-contain p-4">
        {failed || !type ? (
          <div className="flex min-h-full flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-secondary-foreground">
              Não foi possível visualizar este arquivo.
            </p>
            <a
              className="inline-flex items-center gap-1.5 text-sm underline underline-offset-4"
              href={url}
              rel="noopener noreferrer"
              target="_blank"
            >
              Abrir original
              <ExternalLinkIcon className="size-4" />
            </a>
          </div>
        ) : type === "video" ? (
          <div className="relative h-full w-full">
            {downloadLink}
            <video
              aria-label={name}
              className="h-full w-full object-contain"
              controls
              onError={() => setFailed(true)}
              playsInline
              poster={posterUrl ?? undefined}
              preload="metadata"
              src={url}
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="relative inline-flex max-h-full max-w-full">
              {downloadLink}
              <img
                alt={name}
                className="max-h-full max-w-full object-contain"
                onError={() => setFailed(true)}
                src={url}
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
