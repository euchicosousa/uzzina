import { useState } from "react";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListIcon,
  LayoutGridIcon,
  StarIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
} from "lucide-react";
import {
  PrismButton,
  PrismToggle,
  PrismToggleGroup,
  PrismToggleGroupItem,
} from "~/components/prism";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";

const TOGGLE_SIZES: { size: "xs" | "sm" | "default" | "lg"; label: string }[] =
  [
    { size: "xs", label: "xs · h-6 / 24px" },
    { size: "sm", label: "sm · h-8 / 32px" },
    { size: "default", label: "default · h-10 / 40px" },
    { size: "lg", label: "lg · h-12 / 48px" },
  ];

const ATTACHED_SIZES: {
  size: "sm" | "default" | "lg";
  label: string;
  radiusLabel: string;
}[] = [
  { size: "sm", label: "sm · h-8 / 32px", radiusLabel: "squircle xl" },
  {
    size: "default",
    label: "default · h-10 / 40px",
    radiusLabel: "squircle 2xl",
  },
  { size: "lg", label: "lg · h-12 / 48px", radiusLabel: "squircle 3xl" },
];

export function ToggleSection() {
  const [isStarred, setIsStarred] = useState(false);

  // Estados do Modelo Separado
  const [separateFormatting, setSeparateFormatting] = useState<string[]>([
    "bold",
  ]);
  const [separateViewMode, setSeparateViewMode] = useState<string>("grid");

  // Estados do Modelo Conectado (attached)
  const [attachedFormatting, setAttachedFormatting] = useState<string[]>([
    "bold",
  ]);
  const [attachedViewMode, setAttachedViewMode] = useState<string>("grid");
  const [attachedAlign, setAttachedAlign] = useState<string>("left");

  // Estados para tamanhos do modelo conectado
  const [sizeViews, setSizeViews] = useState<Record<string, string>>({
    sm: "grid",
    default: "grid",
    lg: "grid",
  });
  const [sizeFormats, setSizeFormats] = useState<Record<string, string[]>>({
    sm: ["bold"],
    default: ["bold"],
    lg: ["bold"],
  });

  return (
    <div id="prism-toggle">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Botões de alternância individual (Toggle) e grupos de seleção (ToggleGroup) com alinhamento visual rigoroso aos botões. Suporta modelo separado (botões individuais com gap) e modelo conectado (attached com cantos squircle proporcionais)."
          title="Toggle & ToggleGroup"
        />
        <GallerySectionContent className="grid gap-6">
          {/* 1. Toggle Individual */}
          <GalleryItem label="Toggle Individual (Simples & Ícone)">
            <div className="flex flex-wrap items-center gap-4">
              <PrismToggle
                aria-label="Favoritar"
                isSelected={isStarred}
                onChange={setIsStarred}
              >
                {isStarred ? (
                  <StarIcon className="size-5 fill-amber-500 text-amber-500" />
                ) : (
                  <StarIcon className="size-5" />
                )}
                <span>{isStarred ? "Favoritado" : "Favoritar"}</span>
              </PrismToggle>

              <PrismToggle variant="outline">Modo Rascunho</PrismToggle>
            </div>
          </GalleryItem>

          {/* 2. Modelo Separado (Padrão) */}
          <GalleryItem label="Modelo Separado (Botões Individuais com Espaçamento · gap-2)">
            <div className="flex flex-wrap items-center gap-8">
              {/* Seleção Múltipla */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">
                  Seleção múltipla (Formatação)
                </span>
                <PrismToggleGroup
                  onSelectionChange={(keys) =>
                    setSeparateFormatting(Array.from(keys as Set<string>))
                  }
                  selectedKeys={separateFormatting}
                  selectionMode="multiple"
                >
                  <PrismToggleGroupItem aria-label="Negrito" id="bold">
                    <BoldIcon className="size-4" />
                  </PrismToggleGroupItem>
                  <PrismToggleGroupItem aria-label="Itálico" id="italic">
                    <ItalicIcon className="size-4" />
                  </PrismToggleGroupItem>
                  <PrismToggleGroupItem aria-label="Sublinhado" id="underline">
                    <UnderlineIcon className="size-4" />
                  </PrismToggleGroupItem>
                </PrismToggleGroup>
              </div>

              {/* Seleção Única */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">
                  Seleção única (Modo de exibição)
                </span>
                <PrismToggleGroup
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys as Set<string>)[0];
                    if (selected) setSeparateViewMode(selected);
                  }}
                  selectedKeys={[separateViewMode]}
                  selectionMode="single"
                  variant="outline"
                >
                  <PrismToggleGroupItem aria-label="Lista" id="list">
                    <ListIcon className="size-4" />
                    <span>Lista</span>
                  </PrismToggleGroupItem>
                  <PrismToggleGroupItem aria-label="Grade" id="grid">
                    <LayoutGridIcon className="size-4" />
                    <span>Grade</span>
                  </PrismToggleGroupItem>
                </PrismToggleGroup>
              </div>
            </div>
          </GalleryItem>

          {/* 3. Modelo Conectado (attached) */}
          <GalleryItem label="Modelo Conectado (attached · Segmented Control com bordas compartilhadas)">
            <div className="flex flex-wrap items-center gap-8">
              {/* Seleção Única - attached */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">
                  Seleção única · Lista / Grade (variant outline)
                </span>
                <PrismToggleGroup
                  attached
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys as Set<string>)[0];
                    if (selected) setAttachedViewMode(selected);
                  }}
                  selectedKeys={[attachedViewMode]}
                  selectionMode="single"
                  variant="outline"
                >
                  <PrismToggleGroupItem aria-label="Lista" id="list">
                    <ListIcon className="size-4" />
                    <span>Lista</span>
                  </PrismToggleGroupItem>
                  <PrismToggleGroupItem aria-label="Grade" id="grid">
                    <LayoutGridIcon className="size-4" />
                    <span>Grade</span>
                  </PrismToggleGroupItem>
                </PrismToggleGroup>
              </div>

              {/* Seleção Múltipla - attached */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">
                  Seleção múltipla · Formatação (variant outline)
                </span>
                <PrismToggleGroup
                  attached
                  onSelectionChange={(keys) =>
                    setAttachedFormatting(Array.from(keys as Set<string>))
                  }
                  selectedKeys={attachedFormatting}
                  selectionMode="multiple"
                  variant="outline"
                >
                  <PrismToggleGroupItem aria-label="Negrito" id="bold">
                    <BoldIcon className="size-4" />
                  </PrismToggleGroupItem>
                  <PrismToggleGroupItem aria-label="Itálico" id="italic">
                    <ItalicIcon className="size-4" />
                  </PrismToggleGroupItem>
                  <PrismToggleGroupItem aria-label="Sublinhado" id="underline">
                    <UnderlineIcon className="size-4" />
                  </PrismToggleGroupItem>
                </PrismToggleGroup>
              </div>

              {/* Seleção Única - Alinhamento (3 itens com intermediário) */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">
                  Seleção única · Alinhamento (3 itens conectados)
                </span>
                <PrismToggleGroup
                  attached
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys as Set<string>)[0];
                    if (selected) setAttachedAlign(selected);
                  }}
                  selectedKeys={[attachedAlign]}
                  selectionMode="single"
                  variant="outline"
                >
                  <PrismToggleGroupItem
                    aria-label="Alinhar à esquerda"
                    id="left"
                  >
                    <AlignLeftIcon className="size-4" />
                  </PrismToggleGroupItem>
                  <PrismToggleGroupItem aria-label="Centralizar" id="center">
                    <AlignCenterIcon className="size-4" />
                  </PrismToggleGroupItem>
                  <PrismToggleGroupItem
                    aria-label="Alinhar à direita"
                    id="right"
                  >
                    <AlignRightIcon className="size-4" />
                  </PrismToggleGroupItem>
                </PrismToggleGroup>
              </div>
            </div>
          </GalleryItem>

          {/* 4. Modelo Conectado nos tamanhos sm, default e lg */}
          <GalleryItem label="Modelo Conectado (attached) · Tamanhos sm, default e lg com raio squircle proporcional">
            <div className="grid gap-4">
              {ATTACHED_SIZES.map(({ size, label, radiusLabel }) => (
                <div className="flex flex-wrap items-center gap-4" key={size}>
                  <div className="flex w-52 flex-col">
                    <span className="text-xs font-medium text-foreground">
                      {label}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Bordas: {radiusLabel}
                    </span>
                  </div>

                  {/* Seleção única no tamanho */}
                  <PrismToggleGroup
                    attached
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys as Set<string>)[0];
                      if (selected) {
                        setSizeViews((prev) => ({ ...prev, [size]: selected }));
                      }
                    }}
                    selectedKeys={[sizeViews[size] || "grid"]}
                    selectionMode="single"
                    size={size}
                    variant="outline"
                  >
                    <PrismToggleGroupItem aria-label="Lista" id="list">
                      <ListIcon className="size-4" />
                      <span>Lista</span>
                    </PrismToggleGroupItem>
                    <PrismToggleGroupItem aria-label="Grade" id="grid">
                      <LayoutGridIcon className="size-4" />
                      <span>Grade</span>
                    </PrismToggleGroupItem>
                  </PrismToggleGroup>

                  {/* Seleção múltipla no tamanho */}
                  <PrismToggleGroup
                    attached
                    onSelectionChange={(keys) => {
                      setSizeFormats((prev) => ({
                        ...prev,
                        [size]: Array.from(keys as Set<string>),
                      }));
                    }}
                    selectedKeys={sizeFormats[size] || ["bold"]}
                    selectionMode="multiple"
                    size={size}
                    variant="outline"
                  >
                    <PrismToggleGroupItem aria-label="Negrito" id="bold">
                      <BoldIcon className="size-4" />
                    </PrismToggleGroupItem>
                    <PrismToggleGroupItem aria-label="Itálico" id="italic">
                      <ItalicIcon className="size-4" />
                    </PrismToggleGroupItem>
                    <PrismToggleGroupItem
                      aria-label="Sublinhado"
                      id="underline"
                    >
                      <UnderlineIcon className="size-4" />
                    </PrismToggleGroupItem>
                  </PrismToggleGroup>
                </div>
              ))}
            </div>
          </GalleryItem>

          {/* 5. Comparativo de Alinhamento de Tamanhos */}
          <GalleryItem label="Comparativo de Tamanhos · PrismButton, Toggle individual, ToggleGroup separado e ToggleGroup conectado">
            <div className="grid gap-3">
              {TOGGLE_SIZES.map(({ size, label }) => (
                <div className="flex flex-wrap items-center gap-4" key={size}>
                  <span className="w-44 text-xs text-muted-foreground">
                    {label}
                  </span>
                  <PrismButton size={size} variant="outline">
                    Botão
                  </PrismButton>
                  <PrismToggle
                    aria-label={`Negrito ${size}`}
                    size={size}
                    variant="outline"
                  >
                    <BoldIcon />
                  </PrismToggle>
                  {/* Modelo Separado */}
                  <PrismToggleGroup
                    defaultSelectedKeys={["bold"]}
                    selectionMode="multiple"
                    size={size}
                    variant="outline"
                  >
                    <PrismToggleGroupItem aria-label="Negrito" id="bold">
                      <BoldIcon />
                    </PrismToggleGroupItem>
                    <PrismToggleGroupItem aria-label="Itálico" id="italic">
                      <ItalicIcon />
                    </PrismToggleGroupItem>
                  </PrismToggleGroup>
                  {/* Modelo Conectado */}
                  <PrismToggleGroup
                    attached
                    defaultSelectedKeys={["bold"]}
                    selectionMode="multiple"
                    size={size}
                    variant="outline"
                  >
                    <PrismToggleGroupItem
                      aria-label="Negrito conectado"
                      id="bold"
                    >
                      <BoldIcon />
                    </PrismToggleGroupItem>
                    <PrismToggleGroupItem
                      aria-label="Itálico conectado"
                      id="italic"
                    >
                      <ItalicIcon />
                    </PrismToggleGroupItem>
                  </PrismToggleGroup>
                </div>
              ))}
            </div>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
