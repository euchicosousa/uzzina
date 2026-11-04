import { useState } from "react";
import { AlertTriangleIcon, CheckCircle2Icon, InfoIcon } from "lucide-react";
import {
  PrismAlert,
  PrismAlertAction,
  PrismAlertDescription,
  PrismAlertTitle,
  PrismButton,
} from "~/components/prism";
import {
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";
import {
  PropsPlayground,
  PlaygroundSelect,
  PlaygroundBoolean,
  PlaygroundText,
} from "./PropsPlayground";

const ALERT_VARIANTS = [
  "default",
  "error",
  "success",
  "warning",
  "info",
] as const;

type AlertVariant = (typeof ALERT_VARIANTS)[number];

function AlertPlayground() {
  const [variant, setVariant] = useState<AlertVariant>("default");
  const [showIcon, setShowIcon] = useState(true);
  const [showAction, setShowAction] = useState(false);
  const [title, setTitle] = useState("Título do aviso");
  const [description, setDescription] = useState("Descrição curta do aviso.");

  let IconComponent = InfoIcon;
  if (variant === "error" || variant === "warning") {
    IconComponent = AlertTriangleIcon;
  } else if (variant === "success") {
    IconComponent = CheckCircle2Icon;
  }

  return (
    <PropsPlayground
      caption={`variant="${variant}"`}
      preview={
        <div className="w-full max-w-xl">
          <PrismAlert variant={variant}>
            {showIcon && <IconComponent />}
            <PrismAlertTitle>{title}</PrismAlertTitle>
            <PrismAlertDescription>{description}</PrismAlertDescription>
            {showAction && (
              <PrismAlertAction>
                <PrismButton size="sm" variant="outline">
                  Ver
                </PrismButton>
              </PrismAlertAction>
            )}
          </PrismAlert>
        </div>
      }
      title="Alert"
    >
      <PlaygroundSelect
        label="Variante"
        onChange={setVariant}
        options={ALERT_VARIANTS}
        prop="variant"
        value={variant}
      />
      <PlaygroundBoolean
        label="Ícone"
        onChange={setShowIcon}
        prop="svg"
        value={showIcon}
      />
      <PlaygroundBoolean
        label="Ação"
        onChange={setShowAction}
        prop="PrismAlertAction"
        value={showAction}
      />
      <PlaygroundText
        label="Título"
        onChange={setTitle}
        prop="PrismAlertTitle"
        value={title}
      />
      <PlaygroundText
        label="Descrição"
        onChange={setDescription}
        prop="PrismAlertDescription"
        value={description}
      />
    </PropsPlayground>
  );
}

export function AlertSection() {
  return (
    <div id="prism-alert">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Componentes de notificação semântica utilizando a paleta de cores corrigida no OKLCH."
          title="Alert"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Alert">
            <AlertPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
