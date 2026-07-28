import { useEffect, useRef } from "react";
import { PrismButton } from "../prism";

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
              resource_type?: string;
              format?: string;
              original_filename?: string;
              coordinates?: {
                custom?: number[][];
              };
            };
          },
        ) => void,
      ) => {
        open: () => void;
        destroy: () => void;
      };
    };
  }
}
interface CloudinaryUploadProps {
  cloudName: string;
  uploadPreset: string;
  folder?: string;
  /**
   * Se true, força crop 1:1 (ideal para avatares).
   * Se false ou omitido, respeita a proporção original.
   */
  square?: boolean;
  /**
   * Tipo de recurso aceito pelo widget.
   * "image" (padrão) | "video" | "auto" (qualquer arquivo)
   */
  resourceType?: "image" | "video" | "auto";
  /**
   * Se true, permite selecionar múltiplos arquivos por sessão.
   * onUpload é chamado individualmente para cada arquivo concluído.
   */
  multiple?: boolean;
  /** Largura máxima do output (padrão: 800px, ignorado para não-imagem) */
  outputWidth?: number;
  /** Chamado após cada upload com a URL final e metadados do arquivo */
  onUpload: (
    url: string,
    meta: {
      resourceType: string;
      format: string;
      originalFilename?: string;
    },
  ) => void;
  children: React.ReactNode;
  className?: string;
}
export function CloudinaryUpload({
  cloudName,
  uploadPreset,
  folder = "uzzina",
  square = false,
  resourceType = "image",
  multiple = false,
  outputWidth = 800,
  onUpload,
  children,
  className,
}: CloudinaryUploadProps) {
  const widgetRef = useRef<{
    open: () => void;
    destroy: () => void;
  } | null>(null);

  // Mantém sempre a referência mais recente do onUpload para evitar closures stale.
  // O widget é criado uma única vez — sem este ref o callback ficaria preso
  // à versão do onUpload capturada no render de criação.
  const onUploadRef = useRef(onUpload);
  useEffect(() => {
    onUploadRef.current = onUpload;
  });

  // Carrega o script do widget uma única vez por página
  useEffect(() => {
    if (document.getElementById("cloudinary-widget-script")) return;
    const script = document.createElement("script");
    script.id = "cloudinary-widget-script";
    script.src = "https://upload-widget.cloudinary.com/latest/global/all.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // Destrói o widget ao desmontar o componente
  useEffect(() => {
    return () => {
      widgetRef.current?.destroy();
      widgetRef.current = null;
    };
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

    // Reutiliza o widget já existente.
    // IMPORTANTE: Não destruir o widget no evento `close` — em uploads múltiplos
    // o evento `close` pode chegar ANTES de todos os eventos `success`, o que
    // causava que apenas o último arquivo enviado fosse registrado.
    if (widgetRef.current) {
      widgetRef.current.open();
      return;
    }
    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        folder,
        resourceType,
        cropping: square && resourceType !== "auto",
        croppingAspectRatio: square ? 1 : undefined,
        showSkipCropButton: false,
        croppingShowDimensions: square,
        multiple,
        maxFileSize: 50_000_000,
        sources: ["local", "url", "camera"],
        styles: {
          palette: (() => {
            const isDark = document.documentElement.classList.contains("dark");
            return isDark
              ? {
                  window: "#09090b",
                  sourceBg: "#18181b",
                  windowBorder: "#27272a",
                  tabIcon: "#fafafa",
                  inactiveTabIcon: "#a1a1aa",
                  menuIcons: "#a1a1aa",
                  link: "#fafafa",
                  action: "#fafafa",
                  inProgress: "#fafafa",
                  complete: "#22c55e",
                  error: "#ef4444",
                  textDark: "#fafafa",
                  textLight: "#09090b",
                }
              : {
                  window: "#ffffff",
                  sourceBg: "#f4f4f5",
                  windowBorder: "#e4e4e7",
                  tabIcon: "#18181b",
                  inactiveTabIcon: "#71717a",
                  menuIcons: "#71717a",
                  link: "#18181b",
                  action: "#18181b",
                  inProgress: "#18181b",
                  complete: "#22c55e",
                  error: "#ef4444",
                  textDark: "#09090b",
                  textLight: "#ffffff",
                };
          })(),
        },
      },
      (error, result) => {
        if (!error && result.event === "success") {
          const {
            secure_url,
            public_id,
            coordinates,
            resource_type = "image",
            format = "",
            original_filename = "",
          } = result.info;
          let finalUrl: string;
          if (square && resource_type === "image") {
            // Crop 1:1 manual usando coordenadas selecionadas pelo usuário (avatar)
            const ext = format ? `.${format}` : "";
            const crop = coordinates?.custom?.[0];
            if (crop) {
              const [x, y, w, h] = crop;
              finalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/x_${x},y_${y},w_${w},h_${h},c_crop/w_${outputWidth},q_auto/${public_id}${ext}`;
            } else {
              finalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,ar_1:1,w_${outputWidth},q_auto/${public_id}${ext}`;
            }
          } else {
            // Para todos os outros casos usa a secure_url diretamente
            finalUrl = secure_url;
          }
          onUploadRef.current(finalUrl, {
            resourceType: resource_type,
            format,
            originalFilename: original_filename,
          });
        }
      },
    );
    widgetRef.current.open();
  }
  return (
    <PrismButton className={className} onClick={openWidget} type="button" variant={"secondary"} size={"xs"}>
      {children}
    </PrismButton>
  );
}
