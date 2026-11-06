import { useId, useState } from "react";
import { ArchiveIcon } from "lucide-react";
import { PrismToggle } from "~/components/prism";
import {
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";
import {
  PlaygroundBoolean,
  PlaygroundRadio,
  PlaygroundText,
  PropsPlayground,
} from "./PropsPlayground";

const TOGGLE_VARIANTS = ["outline", "default", "secondary", "ghost"] as const;
type ToggleVariant = (typeof TOGGLE_VARIANTS)[number];

export function ToggleInputPlayground() {
  const [variant, setVariant] = useState<ToggleVariant>("outline");
  const [isSelected, setIsSelected] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [showIcon, setShowIcon] = useState(true);
  const [text, setText] = useState("Arquivado");
  const id = useId();

  return (
    <PropsPlayground
      caption={`PrismToggle · variant="${variant}" · ${isSelected ? "marcado (FormData: archived=on)" : "desmarcado (FormData: vazio)"}${isDisabled ? " · desabilitado" : ""}`}
      preview={
        <form
          className="flex flex-col items-center gap-2"
          onSubmit={(e) => e.preventDefault()}
        >
          {isSelected && <input name="archived" type="hidden" value="on" />}
          <PrismToggle
            id={id}
            isDisabled={isDisabled}
            isSelected={isSelected}
            onChange={setIsSelected}
            variant={variant}
          >
            {text}
            {showIcon && <ArchiveIcon className="size-4" />}
          </PrismToggle>
          <span className="font-mono text-xs text-muted-foreground">
            {isSelected ? 'FormData: { archived: "on" }' : "FormData: {}"}
          </span>
        </form>
      }
      title="PrismToggle (Formulário)"
    >
      <PlaygroundRadio
        label="Variante"
        onChange={setVariant}
        options={TOGGLE_VARIANTS}
        prop="variant"
        value={variant}
      />
      <PlaygroundBoolean
        label="Marcado"
        onChange={setIsSelected}
        prop="isSelected"
        value={isSelected}
      />
      <PlaygroundBoolean
        label="Desabilitado"
        onChange={setIsDisabled}
        prop="isDisabled"
        value={isDisabled}
      />
      <PlaygroundBoolean
        label="Ícone"
        onChange={setShowIcon}
        prop="children"
        value={showIcon}
      />
      <PlaygroundText
        label="Texto"
        onChange={setText}
        prop="children"
        value={text}
      />
    </PropsPlayground>
  );
}

export function UzzinaToggleInputSection() {
  return (
    <div id="uzzina-toggle-input">
      <GallerySection>
        <GallerySectionHeader
          description="Alternador PrismToggle integrado a formulário com campo oculto condicional para envio de FormData nativo (padrão adotado no cadastro de parceiro para o campo Arquivado, substituindo o antigo wrapper UToggleInput)."
          title="UToggleInput (Migrado para PrismToggle)"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="PrismToggle no Formulário">
            <ToggleInputPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
