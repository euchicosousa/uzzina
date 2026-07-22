import { useState } from "react";
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconList,
  IconLayoutGrid,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import {
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

export function ToggleSection() {
  const [isStarred, setIsStarred] = useState(false);
  const [textFormatting, setTextFormatting] = useState<string[]>(["bold"]);
  const [viewMode, setViewMode] = useState<string>("grid");

  return (
    <div id="prism-toggle">
      <GallerySection>
        <GallerySectionHeader
          description="Botões de alternância individual (Toggle) e grupos de seleção (ToggleGroup)."
          title="PrismToggle & PrismToggleGroup"
        />
        <GallerySectionContent className="grid gap-6">
          <GalleryItem label="Toggle Individual (Simples & Ícone)">
            <div className="flex flex-wrap items-center gap-4">
              <PrismToggle
                aria-label="Favoritar"
                isSelected={isStarred}
                onChange={setIsStarred}
              >
                {isStarred ? (
                  <IconStarFilled className="size-5 text-amber-500" />
                ) : (
                  <IconStar className="size-5" />
                )}
                <span>{isStarred ? "Favoritado" : "Favoritar"}</span>
              </PrismToggle>

              <PrismToggle variant="outline">
                Modo Rascunho
              </PrismToggle>
            </div>
          </GalleryItem>

          <GalleryItem label="ToggleGroup (Seleção Múltipla / Formatação de Texto)">
            <PrismToggleGroup
              onSelectionChange={(keys) => setTextFormatting(Array.from(keys as Set<string>))}
              selectedKeys={textFormatting}
              selectionMode="multiple"
            >
              <PrismToggleGroupItem aria-label="Negrito" id="bold">
                <IconBold className="size-4" />
              </PrismToggleGroupItem>
              <PrismToggleGroupItem aria-label="Itálico" id="italic">
                <IconItalic className="size-4" />
              </PrismToggleGroupItem>
              <PrismToggleGroupItem aria-label="Sublinhado" id="underline">
                <IconUnderline className="size-4" />
              </PrismToggleGroupItem>
            </PrismToggleGroup>
          </GalleryItem>

          <GalleryItem label="ToggleGroup (Seleção Única / Modo de Exibição)">
            <PrismToggleGroup
              onSelectionChange={(keys) => {
                const selected = Array.from(keys as Set<string>)[0];
                if (selected) setViewMode(selected);
              }}
              selectedKeys={[viewMode]}
              selectionMode="single"
              variant="outline"
            >
              <PrismToggleGroupItem aria-label="Lista" id="list">
                <IconList className="size-4" />
                <span>Lista</span>
              </PrismToggleGroupItem>
              <PrismToggleGroupItem aria-label="Grade" id="grid">
                <IconLayoutGrid className="size-4" />
                <span>Grade</span>
              </PrismToggleGroupItem>
            </PrismToggleGroup>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
