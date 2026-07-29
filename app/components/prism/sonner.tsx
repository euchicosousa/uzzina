import { useAppThemeContext } from "~/hooks/useAppTheme";
import { Toaster as Sonner, toast, type ToasterProps } from "sonner";
import {
  CheckCircle2Icon,
  InfoIcon,
  AlertTriangleIcon,
  OctagonAlertIcon,
  Loader2Icon,
} from "lucide-react";
import { cn } from "cnfast";
const PrismToaster = ({ ...props }: ToasterProps) => {
  const { theme } = useAppThemeContext();
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CheckCircle2Icon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <AlertTriangleIcon className="size-5" />,
        error: <OctagonAlertIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--card-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "24px",
          // Mapeamento exato das variáveis OKLCH no tailwind.css (--color-*)
          "--success-bg": "var(--color-success-background)",
          "--success-text": "var(--color-success)",
          "--success-border": "var(--color-success)",
          "--error-bg": "var(--color-error-background)",
          "--error-text": "var(--color-error)",
          "--error-border": "var(--color-error)",
          "--warning-bg": "var(--color-warning-background)",
          "--warning-text": "var(--color-warning)",
          "--warning-border": "var(--color-warning)",
          "--info-bg": "var(--color-info-background)",
          "--info-text": "var(--color-info)",
          "--info-border": "var(--color-info)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: cn(
            "cn-toast squircle px-5! py-3.5! border-2!",
            "data-[type=default]:bg-card! data-[type=default]:text-card-foreground! data-[type=default]:border-border!",
            "data-[type=success]:bg-success-background! data-[type=success]:text-success! data-[type=success]:border-success!",
            "data-[type=error]:bg-error-background! data-[type=error]:text-error! data-[type=error]:border-error!",
            "data-[type=warning]:bg-warning-background! data-[type=warning]:text-warning! data-[type=warning]:border-warning!",
            "data-[type=info]:bg-info-background! data-[type=info]:text-info! data-[type=info]:border-info!",
            "shadow-[0_12px_24px_-6px_rgba(0,0,0,0.1)]!",
            "data-[type=success]:shadow-[0_12px_24px_-6px_oklch(from_var(--color-success)_l_c_h_/_30%)]!",
            "data-[type=error]:shadow-[0_12px_24px_-6px_oklch(from_var(--color-error)_l_c_h_/_30%)]!",
            "data-[type=warning]:shadow-[0_12px_24px_-6px_oklch(from_var(--color-warning)_l_c_h_/_30%)]!",
            "data-[type=info]:shadow-[0_12px_24px_-6px_oklch(from_var(--color-info)_l_c_h_/_30%)]!",
          ),
        },
      }}
      {...props}
    />
  );
};
export { PrismToaster, toast };
