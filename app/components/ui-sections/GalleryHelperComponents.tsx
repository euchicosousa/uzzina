import type React from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "~/lib/utils";

export interface GallerySectionProps {
  children: React.ReactNode;
  className?: string;
}

export function GallerySection({ children, className }: GallerySectionProps) {
  return (
    <section
      className={cn(
        "w-full max-w-full min-w-0 space-y-6 border-b px-8 py-12",
        className,
      )}
    >
      {children}
    </section>
  );
}

export interface GallerySectionHeaderProps {
  title: string;
  description: string;
  approved?: boolean;
}

export function GallerySectionHeader({
  title,
  description,
  approved,
}: GallerySectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="flex items-center gap-2">
        <span>{title}</span>
        {approved && (
          <span
            className="inline-flex size-5 items-center justify-center rounded-full bg-green-400 text-green-950 shadow-xs ring-2 ring-green-400/50"
            title="Aprovado"
          >
            <CheckIcon className="size-3.5 stroke-[3]" />
          </span>
        )}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export interface GallerySectionContentProps {
  children: React.ReactNode;
  className?: string;
}

export function GallerySectionContent({
  children,
  className,
}: GallerySectionContentProps) {
  return (
    <div
      className={cn(
        "w-full max-w-full min-w-0",
        className || "flex flex-wrap gap-8",
      )}
    >
      {children}
    </div>
  );
}

export interface GalleryItemProps {
  children: React.ReactNode;
  label: string;
  className?: string;
}

export function GalleryItem({
  children,
  label,
  className = "",
}: GalleryItemProps) {
  return (
    <div className={cn("flex max-w-full min-w-0 flex-col gap-4", className)}>
      <span className="text-xs font-semibold text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

export interface SidebarAnchorLinkProps {
  targetId: string;
  label: string;
  active?: boolean;
  approved?: boolean;
}

export function SidebarAnchorLink({
  targetId,
  label,
  active,
  approved,
}: SidebarAnchorLinkProps) {
  return (
    <a
      className={`flex items-center justify-between border-l py-2 pr-2 pl-4 text-muted-foreground transition-colors hover:text-foreground ${active ? "border-foreground font-medium text-foreground" : ""}`}
      href={`#${targetId}`}
      onClick={(e) => {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }}
    >
      <span>{label}</span>
      {approved && (
        <span
          className="inline-flex size-4 items-center justify-center rounded-full bg-green-400 text-green-950 shadow-2xs ring-1 ring-green-400/60"
          title="Aprovado"
        >
          <CheckIcon className="size-2.5 stroke-[3]" />
        </span>
      )}
    </a>
  );
}

export interface SidebarTabButtonProps {
  isActive: boolean;
  onClick: () => void;
  label: string;
  activeIcon: React.ReactNode;
  inactiveIcon: React.ReactNode;
}

export function SidebarTabButton({
  isActive,
  onClick,
  label,
  activeIcon,
  inactiveIcon,
}: SidebarTabButtonProps) {
  return (
    <button
      className={`flex shrink-0 cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold tracking-tight transition-all hover:bg-card ${isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
      onClick={onClick}
      type="button"
    >
      {isActive ? activeIcon : inactiveIcon}
      {label}
    </button>
  );
}
