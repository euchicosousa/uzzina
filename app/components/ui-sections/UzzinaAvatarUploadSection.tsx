import { useState } from "react";
import { UAvatarUpload } from "~/components/uzzina/UAvatarUpload";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";
import {
  PropsPlayground,
  PlaygroundBoolean,
  PlaygroundText,
} from "./PropsPlayground";

// Sample image used only by the gallery; the widget never opens without credentials.
const SAMPLE_IMAGE = "https://i.pravatar.cc/200?img=12";

export function AvatarUploadPlayground() {
  const [hasImage, setHasImage] = useState(false);
  const [fallback, setFallback] = useState("CN");
  const [lastUrl, setLastUrl] = useState<string | null>(null);

  return (
    <PropsPlayground
      caption={`${hasImage ? "com imagem" : "sem imagem"} · fallback: "${fallback}"${lastUrl ? " · upload recebido" : ""}`}
      preview={
        <div className="flex items-center justify-center p-4">
          <UAvatarUpload
            aria-label="Alterar foto"
            cloudName=""
            fallback={fallback || "?"}
            folder="uzzina/gallery"
            image={hasImage ? SAMPLE_IMAGE : null}
            onUpload={setLastUrl}
            uploadPreset=""
          />
        </div>
      }
      title="UAvatarUpload"
    >
      <PlaygroundBoolean
        label="Com imagem"
        onChange={setHasImage}
        prop="image"
        value={hasImage}
      />
      <PlaygroundText
        label="Texto de reserva (fallback)"
        onChange={setFallback}
        prop="fallback"
        value={fallback}
      />
    </PropsPlayground>
  );
}

export function UzzinaAvatarUploadSection() {
  return (
    <div id="uzzina-avatar-upload">
      <GallerySection>
        <GallerySectionHeader
          description="Círculo de 96px que abre o envio de imagem (Cloudinary) com recorte quadrado. O véu com ícone aparece ao passar o mouse e no foco por teclado. Sem credenciais configuradas, o clique apenas registra aviso no console."
          title="UAvatarUpload"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Playground">
            <AvatarUploadPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
