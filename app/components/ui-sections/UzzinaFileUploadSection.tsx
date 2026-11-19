import { useEffect, useRef, useState } from "react";
import { PlusIcon } from "lucide-react";
import { PrismButton } from "~/components/prism";
import { FileManagerDialog } from "~/components/features/media/FileManagerDialog";
import type { FileUploadTransport } from "~/components/features/media/useDirectFileUploads";
import sampleImage from "./file-manager-samples/imagem-exemplo.jpg?url&no-inline";
import sampleText from "./file-manager-samples/arquivo-exemplo.txt?url&no-inline";
import sampleVideo from "./file-manager-samples/video-vertical.mp4?url&no-inline";
import {
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";

function FileUploadExample({ workFiles = false }: { workFiles?: boolean }) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState(() =>
    workFiles
      ? [sampleImage, sampleVideo, sampleText]
      : [sampleImage, sampleVideo],
  );
  const objectUrls = useRef(new Set<string>());

  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, []);

  const simulateUpload: FileUploadTransport = (file, signal, onProgress) =>
    new Promise((resolve, reject) => {
      let progress = 0;
      const abort = () => {
        window.clearInterval(timer);
        reject(signal.reason);
      };
      const timer = window.setInterval(() => {
        progress += 10;
        onProgress(progress);
        if (progress < 100) return;
        window.clearInterval(timer);
        signal.removeEventListener("abort", abort);
        const url = URL.createObjectURL(file);
        objectUrls.current.add(url);
        resolve(`${url}#/${encodeURIComponent(file.name)}`);
      }, 150);
      signal.addEventListener("abort", abort, { once: true });
    });

  return (
    <>
      <PrismButton className="self-start" onPress={() => setOpen(true)}>
        {workFiles ? "Adicionar arquivo" : "Adicionar mídia"}
        <PlusIcon />
      </PrismButton>
      <FileManagerDialog
        cloudName=""
        directUpload
        files={files}
        onChange={setFiles}
        onOpenChange={setOpen}
        open={open}
        uploadPreset=""
        uploadTransport={simulateUpload}
        workFiles={workFiles}
      />
    </>
  );
}

export function UzzinaFileUploadSection() {
  return (
    <div id="uzzina-file-upload">
      <GallerySection>
        <GallerySectionHeader
          description="Clique nos arquivos de exemplo para testar a prévia em desktop ou adicione arquivos para experimentar o envio simulado."
          title="Upload de arquivos"
        />
        <GallerySectionContent className="grid gap-8 sm:grid-cols-2">
          <GalleryItem label="Arquivos de trabalho · Essencial">
            <FileUploadExample workFiles />
          </GalleryItem>
          <GalleryItem label="Imagens e vídeos · Instagram">
            <FileUploadExample />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
