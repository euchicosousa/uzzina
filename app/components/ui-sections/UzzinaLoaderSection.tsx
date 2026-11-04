import { useState } from "react";
import { ULoader, type ULoaderSize } from "~/components/uzzina/ULoader";
import { PrismButton } from "~/components/prism";
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
import { cn } from "~/lib/utils";

const LOADER_SIZES = ["xs", "sm", "md", "lg", "xl", "2xl"] as const;

const SIZE_PX: Record<ULoaderSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  default: 20,
  lg: 24,
  xl: 32,
  "2xl": 48,
};

const COLOR_OPTIONS = [
  "muted",
  "primary",
  "destructive",
  "foreground",
] as const;
type ColorOption = (typeof COLOR_OPTIONS)[number];

const COLOR_CLASSES: Record<ColorOption, string> = {
  muted: "text-muted-foreground",
  primary: "text-primary",
  destructive: "text-destructive",
  foreground: "text-foreground",
};

export function LoaderPlayground() {
  const [size, setSize] = useState<(typeof LOADER_SIZES)[number]>("md");
  const [inheritColor, setInheritColor] = useState(false);
  const [contextColor, setContextColor] = useState<ColorOption>("muted");
  const [label, setLabel] = useState("");

  return (
    <PropsPlayground
      caption={`${size} · ${SIZE_PX[size]}px${inheritColor ? ` · inherit (${contextColor})` : ""}${label ? ` · label: "${label}"` : ""}`}
      preview={
        <div
          className={cn(
            "flex items-center justify-center p-4",
            inheritColor ? COLOR_CLASSES[contextColor] : undefined,
          )}
        >
          <ULoader
            inheritColor={inheritColor}
            label={label || undefined}
            size={size}
          />
        </div>
      }
      title="ULoader"
    >
      <PlaygroundSelect
        label="Tamanho"
        onChange={setSize}
        options={LOADER_SIZES}
        prop="size"
        value={size}
      />
      <PlaygroundBoolean
        label="Cor herdada (inheritColor)"
        onChange={setInheritColor}
        prop="inheritColor"
        value={inheritColor}
      />
      {inheritColor && (
        <PlaygroundSelect
          label="Cor do contexto pai"
          onChange={setContextColor}
          options={COLOR_OPTIONS}
          prop="contextColor"
          value={contextColor}
        />
      )}
      <PlaygroundText
        label="Acessibilidade (label/aria-label)"
        onChange={setLabel}
        prop="label"
        value={label}
      />
    </PropsPlayground>
  );
}

export function UzzinaLoaderSection() {
  return (
    <div id="uzzina-loader">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Indicador de carregamento giratório padronizado nos tamanhos da escala Uzzina e com suporte a cor contextual."
          title="ULoader"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Playground">
            <LoaderPlayground />
          </GalleryItem>

          <GalleryItem label="Escala de tamanhos (12px a 48px)">
            <div className="flex flex-wrap items-end gap-8 rounded-2xl border bg-card/30 p-6">
              {LOADER_SIZES.map((sz) => (
                <div
                  key={sz}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <div className="flex size-14 items-center justify-center">
                    <ULoader size={sz} />
                  </div>
                  <span className="text-xs font-semibold text-foreground">
                    {sz}
                  </span>
                  <span className="text-2xs text-muted-foreground">
                    {SIZE_PX[sz]}px
                  </span>
                </div>
              ))}
            </div>
          </GalleryItem>

          <GalleryItem label="Cores contextuais em botões e ações">
            <div className="flex flex-wrap items-center gap-4">
              <PrismButton isDisabled size="default" variant="default">
                <ULoader inheritColor size="default" />
                Salvando...
              </PrismButton>

              <PrismButton isDisabled size="sm" variant="secondary">
                <ULoader inheritColor size="sm" />
                Atualizando...
              </PrismButton>

              <PrismButton isDisabled size="sm" variant="destructive">
                <ULoader inheritColor size="sm" />
                Excluindo...
              </PrismButton>

              <PrismButton
                aria-label="Carregando ação"
                isDisabled
                size="icon-sm"
                variant="secondary"
              >
                <ULoader inheritColor size="sm" />
              </PrismButton>
            </div>
          </GalleryItem>

          <GalleryItem label="Contextos de toast e carregamentos de página">
            <div className="grid w-full gap-6 md:grid-cols-3">
              <div className="flex flex-col gap-2 rounded-2xl border bg-card p-4 shadow-xs">
                <span className="text-2xs font-semibold text-muted-foreground uppercase">
                  Toast (Sonner)
                </span>
                <div className="flex items-center gap-2.5 text-sm font-medium text-card-foreground">
                  <ULoader className="text-primary" size="default" />
                  <span>Enviando dados da ação...</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-card/40 p-6 text-center">
                <span className="text-2xs font-semibold text-muted-foreground uppercase">
                  Página completa (48px)
                </span>
                <ULoader className="text-primary" size="2xl" />
                <p className="animate-pulse text-xs font-medium text-muted-foreground">
                  Carregando parceiros...
                </p>
              </div>

              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-card/40 p-6 text-center">
                <span className="text-2xs font-semibold text-muted-foreground uppercase">
                  Revisão pública (40px)
                </span>
                <ULoader className="size-10 text-foreground" />
                <p className="text-xs text-muted-foreground">
                  Carregando revisão...
                </p>
              </div>
            </div>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
