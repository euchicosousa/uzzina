import { useState } from "react";
import { UPhaseIcon } from "~/components/uzzina/UPhaseIcon";
import { PHASES } from "~/lib/CONSTANTS";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";
import {
  PropsPlayground,
  PlaygroundSelect,
  PlaygroundRadio,
} from "./PropsPlayground";

const PHASE_SLUGS = [
  "idea",
  "do",
  "doing",
  "review",
  "done",
  "finished",
] as const satisfies readonly (keyof typeof PHASES)[];
type PhaseSlug = (typeof PHASE_SLUGS)[number];

const PHASE_LABELS: Record<PhaseSlug, string> = {
  idea: PHASES.idea.title,
  do: PHASES.do.title,
  doing: PHASES.doing.title,
  review: PHASES.review.title,
  done: PHASES.done.title,
  finished: PHASES.finished.title,
};

const PHASE_ICON_SIZES = ["xs", "sm", "md", "lg", "xl", "2xl", "dot"] as const;
type PhaseIconSize = (typeof PHASE_ICON_SIZES)[number];

const SIZE_PX: Record<PhaseIconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  "2xl": 48,
  dot: 8,
};

const VARIANTS = ["progress", "icon"] as const;
type Variant = (typeof VARIANTS)[number];

const VARIANT_LABELS: Record<Variant, string> = {
  progress: "Progresso",
  icon: "Temático",
};

export function PhaseIconPlayground() {
  const [phase, setPhase] = useState<PhaseSlug>("doing");
  const [size, setSize] = useState<PhaseIconSize>("lg");
  const [variant, setVariant] = useState<Variant>("progress");

  return (
    <div className="flex flex-col gap-6">
      <PropsPlayground
        caption={`${PHASES[phase].title} · ${size} · ${SIZE_PX[size]}px`}
        preview={
          <UPhaseIcon phase={PHASES[phase]} size={size} variant={variant} />
        }
        title="UPhaseIcon"
      >
        <PlaygroundSelect
          label="Fase"
          onChange={setPhase}
          optionLabels={PHASE_LABELS}
          options={PHASE_SLUGS}
          prop="phase"
          value={phase}
        />
        <PlaygroundSelect
          label="Tamanho"
          onChange={setSize}
          options={PHASE_ICON_SIZES}
          prop="size"
          value={size}
        />
        <PlaygroundRadio
          label="Variante"
          onChange={setVariant}
          optionLabels={VARIANT_LABELS}
          options={VARIANTS}
          prop="variant"
          value={variant}
        />
      </PropsPlayground>

      {/* Compare all six phases at the md size */}
      <div className="flex flex-wrap items-center justify-center gap-6 border-t pt-6">
        {PHASE_SLUGS.map((slug) => (
          <div className="flex flex-col items-center gap-1.5" key={slug}>
            <UPhaseIcon phase={PHASES[slug]} size="md" variant="progress" />
            <span className="text-xs text-muted-foreground">
              {PHASES[slug].title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UzzinaPhaseIconSection() {
  return (
    <div id="uzzina-phase-icon">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Indicador de fase da ação: progresso ou ícone temático, nos tamanhos da escala Uzzina."
          title="UPhaseIcon"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="UPhaseIcon">
            <PhaseIconPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
