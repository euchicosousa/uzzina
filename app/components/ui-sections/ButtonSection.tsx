import type { ReactNode } from "react";
import {
  ChevronDownIcon,
  PlusIcon,
  SendIcon,
  SettingsIcon,
  SearchIcon,
  Share2Icon,
  Trash2Icon,
  CheckIcon,
  ExternalLinkIcon,
} from "lucide-react";
import {
  PrismButton,
  PrismButtonGroup,
  PrismButtonGroupSeparator,
  type PrismButtonVariantProps,
} from "~/components/prism";
import {
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";

type ButtonVariant = NonNullable<PrismButtonVariantProps["variant"]>;
type ButtonSize = NonNullable<PrismButtonVariantProps["size"]>;

const VARIANTS: { variant: ButtonVariant; label: string }[] = [
  { variant: "default", label: "default" },
  { variant: "secondary", label: "secondary" },
  { variant: "outline", label: "outline" },
  { variant: "ghost", label: "ghost" },
  { variant: "destructive", label: "destructive" },
  { variant: "success", label: "success" },
  { variant: "link", label: "link" },
];

const TEXT_SIZES: { size: ButtonSize; label: string }[] = [
  { size: "xs", label: "xs · h-6 / 24px" },
  { size: "sm", label: "sm · h-8 / 32px" },
  { size: "default", label: "default · h-10 / 40px" },
  { size: "lg", label: "lg · h-12 / 48px" },
];

const ICON_SIZES: { size: ButtonSize; label: string }[] = [
  { size: "icon-xs", label: "icon-xs · 24px" },
  { size: "icon-sm", label: "icon-sm · 32px" },
  { size: "icon", label: "icon · 40px" },
  { size: "icon-lg", label: "icon-lg · 48px" },
];

const VARIANT_ICONS: Record<
  ButtonVariant,
  React.ComponentType<{ className?: string }>
> = {
  default: PlusIcon,
  secondary: SettingsIcon,
  outline: SearchIcon,
  ghost: Share2Icon,
  destructive: Trash2Icon,
  success: CheckIcon,
  link: ExternalLinkIcon,
  unstyled: PlusIcon,
};

const GROUP_SIZES: {
  size: "sm" | "default" | "lg";
  iconSize: ButtonSize;
  label: string;
}[] = [
  { size: "sm", iconSize: "icon-sm", label: "sm · h-8 / 32px" },
  { size: "default", iconSize: "icon", label: "default · h-10 / 40px" },
  { size: "lg", iconSize: "icon-lg", label: "lg · h-12 / 48px" },
];

interface ButtonMatrixProps {
  columns: { size: ButtonSize; label: string }[];
  renderCell: (variant: ButtonVariant, size: ButtonSize) => ReactNode;
}

// Four fixed columns: one per size. Rows are variants; items-center keeps
// buttons of different heights on a shared centre line for comparison.
function ButtonMatrix({ columns, renderCell }: ButtonMatrixProps) {
  return (
    <div className="w-full min-w-0 overflow-x-auto pb-2">
      <div className="grid min-w-max grid-cols-[7rem_repeat(4,max-content)] items-center gap-x-6 gap-y-4">
        <span />
        {columns.map((column) => (
          <span className="text-xs text-muted-foreground" key={column.size}>
            {column.label}
          </span>
        ))}
        {VARIANTS.map(({ variant, label }) => (
          <div className="contents" key={variant}>
            <span className="text-xs font-medium text-foreground">{label}</span>
            {columns.map((column) => (
              <div key={`${variant}-${column.size}`}>
                {renderCell(variant, column.size)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ButtonSection() {
  return (
    <div id="prism-button">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Componente de botão baseado no React Aria Components com suporte a estados nativos e ícones do Tabler."
          title="Button"
        />
        <GallerySectionContent className="grid gap-6">
          <GalleryItem label="Texto · variants (linhas) × tamanhos (colunas)">
            <ButtonMatrix
              columns={TEXT_SIZES}
              renderCell={(variant, size) => (
                <PrismButton size={size} variant={variant}>
                  Texto
                </PrismButton>
              )}
            />
          </GalleryItem>

          <GalleryItem label="Com ícone inicial · data-icon=inline-start">
            <ButtonMatrix
              columns={TEXT_SIZES}
              renderCell={(variant, size) => (
                <PrismButton size={size} variant={variant}>
                  <SendIcon data-icon="inline-start" />
                  Enviar
                </PrismButton>
              )}
            />
          </GalleryItem>

          <GalleryItem label="Com ícone final · data-icon=inline-end">
            <ButtonMatrix
              columns={TEXT_SIZES}
              renderCell={(variant, size) => (
                <PrismButton size={size} variant={variant}>
                  Próximo
                  <ChevronDownIcon data-icon="inline-end" />
                </PrismButton>
              )}
            />
          </GalleryItem>

          <GalleryItem label="Somente ícone · variants (linhas) × tamanhos (colunas)">
            <ButtonMatrix
              columns={ICON_SIZES}
              renderCell={(variant, size) => {
                const IconComponent = VARIANT_ICONS[variant] || PlusIcon;
                return (
                  <PrismButton
                    aria-label={`Ação ${variant}`}
                    size={size}
                    variant={variant}
                  >
                    <IconComponent />
                  </PrismButton>
                );
              }}
            />
          </GalleryItem>

          <GalleryItem label="Estados desabilitados · tamanho default">
            <div className="flex flex-wrap items-end gap-6">
              {VARIANTS.map(({ variant, label }) => (
                <div className="flex flex-col items-start gap-2" key={variant}>
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <PrismButton isDisabled size="default" variant={variant}>
                    Desabilitado
                  </PrismButton>
                </div>
              ))}
            </div>
          </GalleryItem>

          <GalleryItem label="ButtonGroup (Botões Conectados) · sm, default, lg">
            <div className="flex flex-col gap-4">
              {GROUP_SIZES.map(({ size, iconSize, label }) => (
                <div className="flex flex-wrap items-center gap-4" key={size}>
                  <span className="w-40 text-xs text-muted-foreground">
                    {label}
                  </span>
                  <PrismButtonGroup size={size}>
                    <PrismButton size={size} variant="outline">
                      Anterior
                    </PrismButton>
                    <PrismButtonGroupSeparator />
                    <PrismButton size={size} variant="outline">
                      Próximo
                    </PrismButton>
                  </PrismButtonGroup>

                  <PrismButtonGroup size={size}>
                    <PrismButton size={size} variant="default">
                      Salvar
                    </PrismButton>
                    <PrismButtonGroupSeparator />
                    <PrismButton size={iconSize} variant="default">
                      <ChevronDownIcon />
                    </PrismButton>
                  </PrismButtonGroup>
                </div>
              ))}
            </div>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
