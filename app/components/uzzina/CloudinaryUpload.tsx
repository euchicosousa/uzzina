import { useEffect, useRef } from "react";

// Tipagem mínima do Cloudinary Upload Widget global
declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: object,
        callback: (
          error: unknown,
          result: {
            event: string;
            info: {
              secure_url: string;
              public_id: string;
              // Coordenadas do crop selecionado pelo usuário: [[x, y, w, h]]
              coordinates?: { custom?: number[][] };
            };
          },
        ) => void,
      ) => { open: () => void };
    };
  }
}

interface CloudinaryUploadProps {
  /** Cloud name do Cloudinary (público, vem do loader) */
  cloudName: string;
  /** Upload preset sem assinatura configurado no Cloudinary */
  uploadPreset: string;
  /** Pasta de destino no Cloudinary */
  folder?: string;
  /**
   * Se true, força crop 1:1 (ideal para avatares).
   * Se false ou omitido, não força crop — respeita a proporção original da imagem.
   */
  square?: boolean;
  /** Largura máxima do output em pixels (padrão: 800) */
  outputWidth?: number;
  /** Callback chamado com a URL final após upload bem-sucedido */
  onUpload: (url: string) => void;
  /** Conteúdo clicável que abre o widget (avatar, botão, etc.) */
  children: React.ReactNode;
  /** Classes extras para o wrapper clicável */
  className?: string;
}

/**
 * Componente reutilizável que envolve o Cloudinary Upload Widget.
 *
 * Uso (avatar — crop quadrado):
 * ```tsx
 * <CloudinaryUpload cloudName={cloudName} uploadPreset={uploadPreset}
 *   folder="uzzina/people" square onUpload={(url) => setImageUrl(url)}>
 *   <UAvatar image={imageUrl} fallback="?" size="xxl" />
 * </CloudinaryUpload>
 * ```
 *
 * Uso (imagem livre — sem crop forçado):
 * ```tsx
 * <CloudinaryUpload cloudName={cloudName} uploadPreset={uploadPreset}
 *   folder="uzzina/actions" onUpload={(url) => setImageUrl(url)}>
 *   <img src={imageUrl} />
 * </CloudinaryUpload>
 * ```
 */
export function CloudinaryUpload({
  cloudName,
  uploadPreset,
  folder = "uzzina",
  square = false,
  outputWidth = 800,
  onUpload,
  children,
  className,
}: CloudinaryUploadProps) {
  const widgetRef = useRef<{ open: () => void } | null>(null);

  // Carrega o script do Cloudinary Upload Widget uma vez (via id único)
  useEffect(() => {
    if (document.getElementById("cloudinary-widget-script")) return;
    const script = document.createElement("script");
    script.id = "cloudinary-widget-script";
    script.src = "https://upload-widget.cloudinary.com/latest/global/all.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  function openWidget() {
    if (!uploadPreset) {
      console.error("CloudinaryUpload: uploadPreset não configurado.");
      return;
    }
    if (!window.cloudinary) {
      console.warn("CloudinaryUpload: script ainda carregando.");
      return;
    }

    // Reutiliza o widget já criado (evita múltiplas instâncias)
    if (widgetRef.current) {
      widgetRef.current.open();
      return;
    }

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        folder,
        // Crop 1:1 apenas quando square=true
        cropping: square,
        croppingAspectRatio: square ? 1 : undefined,
        showSkipCropButton: false,
        croppingShowDimensions: square,
        multiple: false,
        maxFileSize: 5_000_000, // 5MB
        sources: ["local", "url", "camera"],
        styles: {
          palette: {
            window: "hsl(var(--card))",
            windowBorder: "hsl(var(--border))",
            tabIcon: "hsl(var(--primary))",
            menuIcons: "hsl(var(--muted-foreground))",
            textDark: "hsl(var(--foreground))",
            textLight: "hsl(var(--background))",
            link: "hsl(var(--primary))",
            action: "hsl(var(--primary))",
            inactiveTabIcon: "hsl(var(--muted-foreground))",
            error: "hsl(var(--destructive))",
            inProgress: "hsl(var(--primary))",
            complete: "hsl(var(--primary))",
            sourceBg: "hsl(var(--background))",
          },
        },
      },
      (error, result) => {
        if (!error && result.event === "success") {
          const { public_id, coordinates } = result.info;

          let finalUrl: string;

          if (square) {
            const crop = coordinates?.custom?.[0]; // [x, y, width, height]
            if (crop) {
              // Aplica o crop exato que o usuário selecionou
              const [x, y, w, h] = crop;
              finalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/x_${x},y_${y},w_${w},h_${h},c_crop/w_${outputWidth},f_auto,q_auto/${public_id}`;
            } else {
              // Fallback: crop automático centrado
              finalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,ar_1:1,w_${outputWidth},f_auto,q_auto/${public_id}`;
            }
          } else {
            // Sem crop forçado — apenas otimiza e redimensiona preservando proporção
            finalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_${outputWidth},f_auto,q_auto/${public_id}`;
          }

          onUpload(finalUrl);
        }
      },
    );

    widgetRef.current.open();
  }

  return (
    <button type="button" onClick={openWidget} className={className}>
      {children}
    </button>
  );
}
