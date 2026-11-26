import { ImageOffIcon } from "lucide-react";
import { useState, type ComponentPropsWithoutRef } from "react";

type UImageProps = Omit<
  ComponentPropsWithoutRef<"img">,
  "alt" | "children" | "src"
> & {
  src: string;
  alt: string;
  fallback?: "message" | "icon";
  fallbackId?: string;
};

export function UImage(props: UImageProps) {
  return <ImageSource key={props.src} {...props} />;
}

function ImageSource({
  fallback = "message",
  fallbackId,
  onError,
  ...image
}: UImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        aria-label="Imagem indisponível"
        className="flex h-full w-full flex-col items-center justify-center gap-2 bg-card text-secondary-foreground"
        role="img"
      >
        <ImageOffIcon
          aria-hidden="true"
          className={`text-foreground opacity-20 ${fallback === "icon" ? "size-6" : "size-8"}`}
        />
        <span
          className={
            fallback === "icon" ? "sr-only" : "px-2 text-center text-base"
          }
          id={fallbackId}
        >
          Imagem indisponível
        </span>
      </span>
    );
  }

  return (
    <img
      {...image}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
}
