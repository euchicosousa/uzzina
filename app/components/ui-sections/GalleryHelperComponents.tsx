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
        <span className="min-w-0 wrap-anywhere">{title}</span>
        {approved && (
          <span
            className="inline-flex size-5 items-center justify-center rounded-full bg-success-strong text-success-strong-foreground shadow-xs ring-2 ring-success-strong/50"
            title="Aprovado"
          >
            <CheckIcon className="stroke3 size-3.5" />
          </span>
        )}
      </h3>
      <p className="text-sm text-secondary-foreground">{description}</p>
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
  id?: string;
}

export function GalleryItem({
  children,
  label,
  className = "",
  id,
}: GalleryItemProps) {
  return (
    <div
      className={cn("flex max-w-full min-w-0 flex-col gap-4", className)}
      id={id}
    >
      <span className="text-xs font-semibold text-secondary-foreground uppercase">
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
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function SidebarAnchorLink({
  targetId,
  label,
  active,
  approved,
  onClick,
}: SidebarAnchorLinkProps) {
  return (
    <a
      className={cn(
        "flex w-full max-w-full min-w-0 items-center justify-between overflow-hidden border-l py-2 pr-2 pl-4 text-secondary-foreground transition-colors outline-none hover:bg-secondary hover:text-foreground focus:ring-0 focus:outline-none focus-visible:bg-secondary focus-visible:ring-0 focus-visible:outline-none",
        active
          ? "border-foreground font-medium text-foreground"
          : "border-border/40",
      )}
      href={`#${targetId}`}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) {
          onClick(e);
          return;
        }
        const element = document.getElementById(targetId);
        if (!element) return;
        const scrollParent = element.closest("main");
        if (scrollParent) {
          const parentRect = scrollParent.getBoundingClientRect();
          const elemRect = element.getBoundingClientRect();
          const targetTop =
            elemRect.top - parentRect.top + scrollParent.scrollTop - 64;
          scrollParent.scrollTo({
            top: Math.max(0, targetTop),
            behavior: "smooth",
          });
        }
      }}
    >
      <span className="mr-2 min-w-0 flex-1 truncate" title={label}>
        {label}
      </span>
      {approved && (
        <span
          className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-success-strong text-success-strong-foreground shadow-2xs ring-1 ring-success-strong/60"
          title="Aprovado"
        >
          <CheckIcon className="size-2.5 stroke-3" />
        </span>
      )}
    </a>
  );
}

export interface SidebarSubsectionLinkProps {
  targetId: string;
  label: string;
  active?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function SidebarSubsectionLink({
  targetId,
  label,
  active,
  onClick,
}: SidebarSubsectionLinkProps) {
  return (
    <a
      className={cn(
        "flex w-full max-w-full min-w-0 items-center overflow-hidden border-l py-1.5 pr-2 pl-7 text-xs font-normal transition-colors outline-none hover:bg-secondary hover:text-foreground focus:ring-0 focus:outline-none focus-visible:bg-secondary focus-visible:ring-0 focus-visible:outline-none",
        active
          ? "border-border/40 bg-secondary text-foreground"
          : "border-border/40 text-secondary-foreground",
      )}
      href={`#${targetId}`}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) {
          onClick(e);
          return;
        }
        const element = document.getElementById(targetId);
        if (!element) return;
        const scrollParent = element.closest("main");
        if (scrollParent) {
          const parentRect = scrollParent.getBoundingClientRect();
          const elemRect = element.getBoundingClientRect();
          const targetTop =
            elemRect.top - parentRect.top + scrollParent.scrollTop - 72;
          scrollParent.scrollTo({
            top: Math.max(0, targetTop),
            behavior: "smooth",
          });
        }
      }}
    >
      <span className="min-w-0 flex-1 truncate" title={label}>
        {label}
      </span>
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
      className={`flex shrink-0 cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold tracking-tight transition-all hover:bg-card ${isActive ? "bg-secondary text-foreground" : "text-secondary-foreground hover:text-foreground"} squircle`}
      onClick={onClick}
      type="button"
    >
      {isActive ? activeIcon : inactiveIcon}
      {label}
    </button>
  );
}
