import { UploadIcon } from "lucide-react";
import { CloudinaryUpload } from "~/components/features/media/CloudinaryUpload";
import { UAvatar } from "~/components/uzzina/UAvatar";

export interface UAvatarUploadProps {
  /** Current image URL; the fallback is shown when empty. */
  image?: string | null;
  /** Text shown inside the avatar when there is no image. */
  fallback: string;
  /** Accessible name of the button, specific to each screen. */
  "aria-label": string;
  cloudName: string;
  uploadPreset: string;
  /** Cloudinary folder that receives the uploaded file. */
  folder: string;
  /** Called with the final cropped URL after each upload. */
  onUpload: (url: string) => void;
  /** Width of the cropped output in pixels. */
  outputWidth?: number;
}

/**
 * Round 96px avatar that opens the Cloudinary widget (square crop).
 * A themed veil with an upload icon shows on hover and keyboard focus.
 */
export function UAvatarUpload({
  image,
  fallback,
  "aria-label": ariaLabel,
  cloudName,
  uploadPreset,
  folder,
  onUpload,
  outputWidth = 400,
}: UAvatarUploadProps) {
  return (
    <CloudinaryUpload
      aria-label={ariaLabel}
      className="relative size-24 shrink-0 overflow-hidden p-0"
      cloudName={cloudName}
      isRounded
      folder={folder}
      onUpload={(url) => onUpload(url)}
      outputWidth={outputWidth}
      square
      uploadPreset={uploadPreset}
      variant="ghost"
    >
      <UAvatar
        key={image ?? "empty"}
        fallback={fallback}
        image={image}
        size="2xl"
      />
      <span className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/40 text-background opacity-0 transition group-hover/button:opacity-100 group-focus-visible/button:opacity-100">
        <UploadIcon className="size-6 opacity-100" />
      </span>
    </CloudinaryUpload>
  );
}
