import { Link } from "@tanstack/react-router";
import { UAvatar } from "./UAvatar";
import { cn } from "cnfast";
interface AdminItemCardProps {
  to: string;
  image?: string | null;
  fallback: string;
  title: string;
  subtitle?: React.ReactNode;
  avatarBgColor?: string;
  avatarColor?: string;
  badge?: React.ReactNode;
  className?: string;
}
export function UAdminItemCard({
  to,
  image,
  fallback,
  title,
  subtitle,
  avatarBgColor,
  avatarColor,
  badge,
  className,
}: AdminItemCardProps) {
  return (
    <Link
      className={cn(
        "flex items-center gap-4 rounded-3xl border bg-action p-4 shadow-xs squircle hover:shadow-black/20",
        "z-0 border-t border-white ring ring-black/5 transition duration-500 hover:z-10 hover:bg-action-hover hover:shadow-lg",
        "min-w-0 flex-1 dark:border-white/20 dark:shadow-black/80",
        className,
      )}
      to={to}
    >
      <UAvatar
        backgroundColor={avatarBgColor}
        color={avatarColor}
        fallback={fallback}
        image={image ?? undefined}
        size="lg"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="flex-1 truncate font-medium">{title}</div>
          {badge}
        </div>
        {subtitle && (
          <div className="truncate text-xs opacity-50">{subtitle}</div>
        )}
      </div>
    </Link>
  );
}
