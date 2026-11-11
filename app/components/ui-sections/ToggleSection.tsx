import { useId, useState } from "react";
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ArchiveIcon,
  BoldIcon,
} from "lucide-react";
import {
  PrismToggle,
  PrismToggleGroup,
  PrismToggleGroupItem,
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
  PlaygroundRadio,
  PlaygroundBoolean,
  PlaygroundNumber,
  PlaygroundText,
} from "./PropsPlayground";

const TOGGLE_VARIANTS = ["default", "ghost", "secondary", "outline"] as const;

const TOGGLE_SIZES = [
  "xs",
  "sm",
  "default",
  "lg",
  "icon-xs",
  "icon-sm",
  "icon",
  "icon-lg",
] as const;

type ToggleVariant = (typeof TOGGLE_VARIANTS)[number];
type ToggleSize = (typeof TOGGLE_SIZES)[number];

const TOGGLE_CONTENTS = ["icon", "text", "icon-text"] as const;
type ToggleContent = (typeof TOGGLE_CONTENTS)[number];

const TOGGLE_CONTENT_LABELS: Record<ToggleContent, string> = {
  icon: "Ícone",
  text: "Texto",
  "icon-text": "Texto + ícone",
};

const SELECTION_MODES = ["single", "multiple"] as const;
type SelectionMode = (typeof SELECTION_MODES)[number];

const SELECTION_MODE_LABELS: Record<SelectionMode, string> = {
  single: "Única",
  multiple: "Múltipla",
};

const ORIENTATIONS = ["horizontal", "vertical"] as const;
type Orientation = (typeof ORIENTATIONS)[number];

function TogglePlayground() {
  const [variant, setVariant] = useState<ToggleVariant>("default");
  const [size, setSize] = useState<ToggleSize>("default");
  const [content, setContent] = useState<ToggleContent>("icon-text");
  const [isSelected, setIsSelected] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  let childrenNode: React.ReactNode;
  if (content === "icon") {
    childrenNode = <BoldIcon />;
  } else if (content === "text") {
    childrenNode = "Negrito";
  } else {
    childrenNode = (
      <>
        <span>Negrito</span>
        <BoldIcon />
      </>
    );
  }

  return (
    <PropsPlayground
      caption={`variant="${variant}" · size="${size}" · ${isSelected ? "selected" : "unselected"}`}
      preview={
        <PrismToggle
          aria-label={content === "icon" ? "Negrito" : undefined}
          isDisabled={isDisabled}
          isSelected={isSelected}
          onChange={setIsSelected}
          size={size}
          variant={variant}
        >
          {childrenNode}
        </PrismToggle>
      }
      title="Toggle"
    >
      <PlaygroundRadio
        label="Variante"
        onChange={setVariant}
        options={TOGGLE_VARIANTS}
        prop="variant"
        value={variant}
      />
      <PlaygroundSelect
        label="Tamanho"
        onChange={setSize}
        options={TOGGLE_SIZES}
        prop="size"
        value={size}
      />
      <PlaygroundRadio
        label="Conteúdo"
        onChange={setContent}
        optionLabels={TOGGLE_CONTENT_LABELS}
        options={TOGGLE_CONTENTS}
        prop="children"
        value={content}
      />
      <PlaygroundBoolean
        label="Selecionado"
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
    </PropsPlayground>
  );
}

const ALIGN_ITEMS = [
  { id: "left", label: "Esquerda", icon: AlignLeftIcon },
  { id: "center", label: "Centro", icon: AlignCenterIcon },
  { id: "right", label: "Direita", icon: AlignRightIcon },
  { id: "justify", label: "Justificar", icon: AlignJustifyIcon },
] as const;

function ToggleGroupPlayground() {
  const [variant, setVariant] = useState<ToggleVariant>("outline");
  const [size, setSize] = useState<ToggleSize>("default");
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("single");
  const [orientation, setOrientation] = useState<Orientation>("horizontal");
  const [content, setContent] = useState<ToggleContent>("icon-text");
  const [attached, setAttached] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [spacing, setSpacing] = useState(2);
  const [count, setCount] = useState(3);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(["left"]);

  const handleSelectionModeChange = (mode: SelectionMode) => {
    setSelectionMode(mode);
    if (mode === "single" && selectedKeys.length > 1) {
      const first = selectedKeys[0];
      setSelectedKeys(first !== undefined ? [first] : ["left"]);
    }
  };

  const currentItems = ALIGN_ITEMS.slice(0, count);

  return (
    <PropsPlayground
      caption={`variant="${variant}" · size="${size}" · selectionMode="${selectionMode}" · [${selectedKeys.join(", ")}]`}
      preview={
        <PrismToggleGroup
          aria-label="Alinhamento de texto"
          attached={attached}
          isDisabled={isDisabled}
          onSelectionChange={(keys) => {
            const nextKeys = Array.from(keys, String);
            setSelectedKeys(nextKeys);
          }}
          orientation={orientation}
          selectedKeys={selectedKeys}
          selectionMode={selectionMode}
          size={size}
          spacing={spacing}
          variant={variant}
        >
          {currentItems.map((item) => {
            const Icon = item.icon;
            let itemChildren: React.ReactNode;
            if (content === "icon") {
              itemChildren = <Icon />;
            } else if (content === "text") {
              itemChildren = item.label;
            } else {
              itemChildren = (
                <>
                  <span>{item.label}</span>
                  <Icon />
                </>
              );
            }

            return (
              <PrismToggleGroupItem
                aria-label={content === "icon" ? item.label : undefined}
                id={item.id}
                key={item.id}
              >
                {itemChildren}
              </PrismToggleGroupItem>
            );
          })}
        </PrismToggleGroup>
      }
      title="ToggleGroup"
    >
      <PlaygroundRadio
        label="Variante"
        onChange={setVariant}
        options={TOGGLE_VARIANTS}
        prop="variant"
        value={variant}
      />
      <PlaygroundSelect
        label="Tamanho"
        onChange={setSize}
        options={TOGGLE_SIZES}
        prop="size"
        value={size}
      />
      <PlaygroundRadio
        label="Seleção"
        onChange={handleSelectionModeChange}
        optionLabels={SELECTION_MODE_LABELS}
        options={SELECTION_MODES}
        prop="selectionMode"
        value={selectionMode}
      />
      <PlaygroundRadio
        label="Orientação"
        onChange={setOrientation}
        options={ORIENTATIONS}
        prop="orientation"
        value={orientation}
      />
      <PlaygroundRadio
        label="Conteúdo"
        onChange={setContent}
        optionLabels={TOGGLE_CONTENT_LABELS}
        options={TOGGLE_CONTENTS}
        prop="children"
        value={content}
      />
      <PlaygroundBoolean
        label="Conectado"
        onChange={setAttached}
        prop="attached"
        value={attached}
      />
      <PlaygroundBoolean
        label="Desabilitado"
        onChange={setIsDisabled}
        prop="isDisabled"
        value={isDisabled}
      />
      <PlaygroundNumber
        isDisabled={attached}
        label="Espaçamento"
        max={4}
        min={0}
        onChange={setSpacing}
        prop="spacing"
        step={1}
        value={spacing}
      />
      <PlaygroundNumber
        label="Quantidade de itens"
        max={4}
        min={2}
        onChange={setCount}
        prop="count"
        step={1}
        value={count}
      />
    </PropsPlayground>
  );
}

function ToggleFormPlayground() {
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
          <span className="font-mono text-xs text-secondary-foreground">
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

export function ToggleSection() {
  return (
    <div id="prism-toggle">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Botões de alternância individual (Toggle) e grupos de seleção (ToggleGroup) com alinhamento visual rigoroso aos botões. Suporta modelo separado (botões individuais com gap) e modelo conectado (attached com cantos squircle proporcionais)."
          title="Toggle & ToggleGroup"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem id="prism-toggle-single" label="Toggle">
            <TogglePlayground />
          </GalleryItem>
          <GalleryItem id="prism-toggle-group" label="ToggleGroup">
            <ToggleGroupPlayground />
          </GalleryItem>
          <GalleryItem id="prism-toggle-form" label="Integração com Formulário (FormData)">
            <ToggleFormPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
