import { Link } from "react-router";
import { UAvatar } from "./UAvatar";
import { cn } from "~/lib/utils";

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

export function AdminItemCard({
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
      to={to}
      className={cn(
        "bg-card/50 squircle flex items-center gap-4 rounded-3xl border p-4 shadow-xs hover:shadow-black/20",
        "transition duration-500 ring ring-black/5 border-t border-white z-0 hover:z-10 hover:shadow-lg hover:bg-action-hover",
        "dark:border-white/20 dark:shadow-black/80 min-w-0 flex-1",
        className,
      )}
    >
      <UAvatar
        fallback={fallback}
        image={image ?? undefined}
        backgroundColor={avatarBgColor}
        color={avatarColor}
        size="lg"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="flex-1 truncate font-medium">
            {title}
          </div>
          {badge}
        </div>
        {subtitle && (
          <div className="text-muted-foreground truncate text-xs">
            {subtitle}
          </div>
        )}
      </div>
    </Link>
  );
}
