import type React from "react";

export interface GallerySectionProps {
  children: React.ReactNode;
}

export function GallerySection({ children }: GallerySectionProps) {
  return (
    <section className="space-y-6 px-8 py-12 border-b">{children}</section>
  );
}

export interface GallerySectionHeaderProps {
  title: string;
  description: string;
}

export function GallerySectionHeader({
  title,
  description,
}: GallerySectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3>{title}</h3>
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
  return <div className={className || "flex flex-wrap gap-8"}>{children}</div>;
}

export interface GalleryItemProps {
  children: React.ReactNode;
  label: string;
  className?: string;
}

export function GalleryItem({ children, label, className = "" }: GalleryItemProps) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
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
}

export function SidebarAnchorLink({
  targetId,
  label,
  active,
}: SidebarAnchorLinkProps) {
  return (
    <a
      className={`text-muted-foreground hover:text-foreground py-2 pl-4 transition-colors border-l ${active ? "border-foreground" : ""}`}
      href={`#${targetId}`}
      onClick={(e) => {
        e.preventDefault();
        document.getElementById(targetId)?.scrollIntoView({
          behavior: "smooth",
        });
      }}
    >
      {label}
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
      className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold tracking-tight transition-all rounded-xl cursor-pointer shrink-0 hover:bg-card ${isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
      onClick={onClick}
      type="button"
    >
      {isActive ? activeIcon : inactiveIcon}
      {label}
    </button>
  );
}
