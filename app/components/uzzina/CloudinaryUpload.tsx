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
              resource_type?: string;
              format?: string;
              coordinates?: { custom?: number[][] };
            };
          },
        ) => void,
      ) => { open: () => void; destroy: () => void };
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
   * onUpload é chamado individualmente para cada arquivo.
   */
  multiple?: boolean;
  /** Largura máxima do output (padrão: 800px, ignorado para não-imagem) */
  outputWidth?: number;
  /** Chamado após cada upload com a URL final e metadados do arquivo */
  onUpload: (
    url: string,
    meta: { resourceType: string; format: string },
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
  const widgetRef = useRef<{ open: () => void; destroy: () => void } | null>(
    null,
  );

  // Mantém sempre a referência mais recente do onUpload.
  // Isso resolve o problema de closure estale quando o widget é criado uma vez
  // mas o conteúdo de onUpload muda entre renders (ex: workFiles atualiza).
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

  function openWidget() {
    if (!uploadPreset) {
      console.error("CloudinaryUpload: uploadPreset não configurado.");
      return;
    }
    if (!window.cloudinary) {
      console.warn("CloudinaryUpload: script ainda carregando.");
      return;
    }

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
          const {
            secure_url,
            public_id,
            coordinates,
            resource_type = "image",
            format = "",
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
            // Para todos os outros casos (work_files, content_files, etc.),
            // usa a secure_url diretamente — ela já é a URL correta fornecida pelo Cloudinary
            finalUrl = secure_url;
          }

          // Usa ref para garantir que o onUpload mais recente seja chamado,
          // mesmo que o widget tenha sido criado em um render anterior
          onUploadRef.current(finalUrl, {
            resourceType: resource_type,
            format,
          });
        }
        // Destrói o widget ao fechar para garantir sessão limpa na próxima abertura.
        // Sem isso, o widget cached re-emite eventos `success` de sessões anteriores.
        if (!error && result.event === "close") {
          widgetRef.current?.destroy();
          widgetRef.current = null;
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
