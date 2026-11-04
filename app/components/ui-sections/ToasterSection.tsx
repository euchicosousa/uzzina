import { useState } from "react";
import { PrismButton, toast } from "~/components/prism";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";
import {
  PropsPlayground,
  PlaygroundSelect,
  PlaygroundBoolean,
  PlaygroundText,
} from "./PropsPlayground";

const TOAST_TYPES = [
  "message",
  "success",
  "info",
  "warning",
  "error",
  "loading",
] as const;
type ToastType = (typeof TOAST_TYPES)[number];

const TOAST_TYPE_LABELS: Record<ToastType, string> = {
  message: "message (Neutro)",
  success: "success",
  info: "info",
  warning: "warning",
  error: "error",
  loading: "loading",
};

function ToasterPlayground() {
  const [type, setType] = useState<ToastType>("success");
  const [hasAction, setHasAction] = useState(false);
  const [title, setTitle] = useState("Alterações salvas.");
  const [description, setDescription] = useState("");

  const handleTriggerToast = () => {
    let toastId: string | number;
    const actionConfig = hasAction ? (
      <PrismButton
        className="ml-auto shrink-0"
        size="sm"
        variant="outline"
        onPress={() => toast.dismiss(toastId)}
      >
        Desfazer
      </PrismButton>
    ) : undefined;

    const options = {
      description: description.trim() !== "" ? description : undefined,
      action: actionConfig,
    };

    if (type === "message") {
      toastId = toast.message(title, options);
    } else {
      toastId = toast[type](title, options);
    }
  };

  return (
    <PropsPlayground
      caption={`toast.${type}("${title}")`}
      preview={
        <PrismButton onClick={handleTriggerToast} variant="outline">
          Disparar toast
        </PrismButton>
      }
      title="Toaster"
    >
      <PlaygroundSelect
        label="Tipo"
        onChange={setType}
        optionLabels={TOAST_TYPE_LABELS}
        options={TOAST_TYPES}
        prop="função de toast"
        value={type}
      />
      <PlaygroundBoolean
        label="Com ação"
        onChange={setHasAction}
        prop="action"
        value={hasAction}
      />
      <PlaygroundText
        label="Título"
        onChange={setTitle}
        prop="1º argumento"
        value={title}
      />
      <PlaygroundText
        label="Descrição"
        onChange={setDescription}
        placeholder="Opcional..."
        prop="description"
        value={description}
      />
    </PropsPlayground>
  );
}

export function ToasterSection() {
  return (
    <div id="prism-toaster">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Notificações flutuantes (Toasts) acionadas por eventos ou ações da aplicação."
          title="Toaster"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Toaster">
            <ToasterPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
