import { PrismBadge } from "~/components/prism";
import { cn } from "~/lib/utils";

export function fileNameFromUrl(url: string): string {
  const source = url.startsWith("blob:") ? (url.split("#/")[1] ?? url) : url;
  const raw = source.split("?")[0].split("#")[0].split("/").pop() ?? source;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function getFileExtension(name: string) {
  return /\.([a-z\d]{1,10})$/i.exec(name)?.[1];
}

export function FileNameLabel({
  name,
  prefix,
  extension,
  className,
}: {
  name: string;
  prefix?: string;
  extension?: string;
  className?: string;
}) {
  const type = extension || getFileExtension(name);
  return (
    <span className={cn("flex min-w-0 items-center gap-2", className)}>
      <span className="min-w-0 truncate" title={name}>
        {prefix}
        {name}
      </span>
      <PrismBadge className="shrink-0">
        {type?.toUpperCase() ?? "Arquivo"}
      </PrismBadge>
    </span>
  );
}
