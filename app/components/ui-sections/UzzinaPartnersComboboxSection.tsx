import { Fragment, useState } from "react";
import { PartnersCombobox } from "~/components/features/PartnersCombobox";
import type { ComboboxTriggerProps } from "~/components/features/ComboboxTrigger";
import { AppContext, type AppContextType } from "~/contexts/AppContext";
import type { Action, Partner, Person } from "~/types";
import {
  GallerySection,
  GallerySectionHeader,
} from "./GalleryHelperComponents";

const MOCK_PARTNERS: Partner[] = [
  {
    archived: false,
    colors: ["#2563eb", "#ffffff"],
    context: null,
    created_at: "2026-01-01T00:00:00.000Z",
    id: "partner-alfa-001",
    image: null,
    instagram_caption_tail: null,
    short: "AO",
    slug: "alfa",
    sow: "marketing",
    title: "Alfa Odontologia",
    users_ids: ["person-mock-001"],
    voice: null,
  },
  {
    archived: false,
    colors: ["#7c3aed", "#ffffff"],
    context: null,
    created_at: "2026-01-01T00:00:00.000Z",
    id: "partner-beta-002",
    image: null,
    instagram_caption_tail: null,
    short: "BS",
    slug: "beta",
    sow: "marketing",
    title: "Beta Studio",
    users_ids: ["person-mock-001"],
    voice: null,
  },
  {
    archived: false,
    colors: ["#059669", "#ffffff"],
    context: null,
    created_at: "2026-01-01T00:00:00.000Z",
    id: "partner-gama-003",
    image: null,
    instagram_caption_tail: null,
    short: "GC",
    slug: "gama",
    sow: "marketing",
    title: "Gama Clínica",
    users_ids: ["person-mock-001"],
    voice: null,
  },
  {
    archived: false,
    colors: ["#ea580c", "#ffffff"],
    context: null,
    created_at: "2026-01-01T00:00:00.000Z",
    id: "partner-delta-004",
    image: null,
    instagram_caption_tail: null,
    short: "DF",
    slug: "delta",
    sow: "marketing",
    title: "Delta Foods",
    users_ids: ["person-mock-001"],
    voice: null,
  },
];

const MOCK_PERSON: Person = {
  admin: true,
  areas: ["design", "marketing"],
  created_at: "2026-01-01T00:00:00.000Z",
  email: "contato@uzzina.local",
  id: "person-mock-001",
  image: null,
  initials: "UZ",
  name: "Usuário",
  preferences: null,
  short: "UZ",
  surname: "Uzzina",
  user_id: "user-mock-001",
  visible: true,
};

const NOOP_ACTION = (_action: Action | null) => {};
const NOOP_PARTNER_FILTERS: React.Dispatch<
  React.SetStateAction<string[]>
> = () => {};

const MOCK_APP_CONTEXT: AppContextType = {
  person: MOCK_PERSON,
  partners: MOCK_PARTNERS,
  cloudName: "",
  uploadPreset: "",
  setPrimaryAction: NOOP_ACTION,
  partnerFilters: [],
  setPartnerFilters: NOOP_PARTNER_FILTERS,
};

type ButtonSize = NonNullable<ComboboxTriggerProps["size"]>;
type ButtonVariant = NonNullable<ComboboxTriggerProps["variant"]>;

// Mirrors PartnersCombobox footerAvatarSize + UAvatar size classes
function avatarPx(size?: ComboboxTriggerProps["size"]): number {
  return size === "default" ||
    size === "lg" ||
    size === "icon" ||
    size === "icon-lg"
    ? 32
    : 24;
}

function iconPx(size?: ComboboxTriggerProps["size"]): number {
  if (size === "xs") return 12;
  if (size === "sm" || size === "icon-xs" || size === "icon-sm") return 16;
  return 20;
}

interface MatrixCellProps {
  initialSelection: string[];
  variant?: ComboboxTriggerProps["variant"];
  size?: ComboboxTriggerProps["size"];
  showText?: boolean;
  allowAll?: boolean;
  disabled?: boolean;
}

function MatrixCell({
  initialSelection,
  variant = "ghost",
  size = "sm",
  showText,
  allowAll,
  disabled,
}: MatrixCellProps) {
  const [selected, setSelected] = useState<string[]>(initialSelection);
  const n = avatarPx(size);
  const m = iconPx(size);

  return (
    <div className="flex flex-col items-start gap-1.5 py-2">
      <PartnersCombobox
        allowAll={allowAll}
        disabled={disabled}
        onSelect={setSelected}
        selectedPartners={selected}
        showText={showText}
        size={size}
        variant={variant}
      />
      <div className="font-mono text-xs leading-tight text-muted-foreground">
        <div>
          {variant} / {size}
        </div>
        <div>
          avatar {n}px · ícone {m}px
        </div>
      </div>
    </div>
  );
}

const SIZES_TEXT_AND_ICON: ButtonSize[] = [
  "xs",
  "sm",
  "default",
  "lg",
  "icon-xs",
  "icon-sm",
  "icon",
  "icon-lg",
];

const SIZES_TEXT_ONLY: ButtonSize[] = ["xs", "sm", "default", "lg"];

const SIZES_ICON_ONLY: ButtonSize[] = ["icon-xs", "icon-sm", "icon", "icon-lg"];

const OTHER_VARIANTS: ButtonVariant[] = [
  "outline",
  "secondary",
  "link",
  "default",
];

const SELECTION_ROWS_ALL: { label: string; selection: string[] }[] = [
  { label: "0 selecionados", selection: [] },
  { label: "1 selecionado", selection: ["alfa"] },
  { label: "3 selecionados", selection: ["alfa", "beta", "gama"] },
];

const SELECTION_ROWS_ALLOW_ALL: { label: string; selection: string[] }[] = [
  { label: "0 selecionados", selection: [] },
  { label: "3 selecionados", selection: ["alfa", "beta", "gama"] },
];

export function UzzinaPartnersComboboxSection() {
  return (
    <AppContext.Provider value={MOCK_APP_CONTEXT}>
      <div id="uzzina-partners-combobox">
        <GallerySection>
          <GallerySectionHeader
            description="Matriz do seletor de parceiros por variante e tamanho do botão, com o tamanho do avatar e do ícone em cada célula. Vitrine para decidir o tamanho dos avatares; nada aqui altera o componente."
            title="PartnersCombobox"
          />
          <p className="text-sm text-muted-foreground">
            Referência do ícone do botão: xs 12px, sm e icon-xs/icon-sm 16px,
            default, lg e icon-lg 20px. Os avatares atuais são 24px (xs, sm) ou
            32px (default, lg).
          </p>

          <div className="flex flex-col divide-y divide-border">
            {/* Bloco A: Ghost — só avatares */}
            <div className="flex flex-col gap-4 py-8">
              <div className="text-sm font-medium">Ghost — só avatares</div>
              <div className="overflow-x-auto">
                <div
                  className="grid w-full min-w-max items-start gap-x-6 gap-y-4"
                  style={{
                    gridTemplateColumns:
                      "minmax(8rem, max-content) repeat(8, minmax(5rem, 1fr))",
                  }}
                >
                  <div />
                  {SIZES_TEXT_AND_ICON.map((size) => (
                    <div
                      key={size}
                      className="font-mono text-xs font-medium text-muted-foreground"
                    >
                      {size}
                    </div>
                  ))}
                  {SELECTION_ROWS_ALL.map((row) => (
                    <Fragment key={row.label}>
                      <div className="self-start pt-3 font-mono text-xs text-muted-foreground">
                        {row.label}
                      </div>
                      {SIZES_TEXT_AND_ICON.map((size) => (
                        <MatrixCell
                          key={`${row.label}-${size}`}
                          allowAll={false}
                          initialSelection={row.selection}
                          showText={false}
                          size={size}
                          variant="ghost"
                        />
                      ))}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Bloco B: Ghost — com nome */}
            <div className="flex flex-col gap-4 py-8">
              <div className="text-sm font-medium">Ghost — com nome</div>
              <div className="overflow-x-auto">
                <div
                  className="grid w-full min-w-max items-start gap-x-6 gap-y-4"
                  style={{
                    gridTemplateColumns:
                      "minmax(8rem, max-content) repeat(4, minmax(9rem, 1fr))",
                  }}
                >
                  <div />
                  {SIZES_TEXT_ONLY.map((size) => (
                    <div
                      key={size}
                      className="font-mono text-xs font-medium text-muted-foreground"
                    >
                      {size}
                    </div>
                  ))}
                  {SELECTION_ROWS_ALL.map((row) => (
                    <Fragment key={row.label}>
                      <div className="self-start pt-3 font-mono text-xs text-muted-foreground">
                        {row.label}
                      </div>
                      {SIZES_TEXT_ONLY.map((size) => (
                        <MatrixCell
                          key={`${row.label}-${size}`}
                          allowAll={false}
                          initialSelection={row.selection}
                          showText={true}
                          size={size}
                          variant="ghost"
                        />
                      ))}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Bloco C: Ghost — "Todos os parceiros" */}
            <div className="flex flex-col gap-4 py-8">
              <div className="text-sm font-medium">
                Ghost — "Todos os parceiros"
              </div>
              <div className="overflow-x-auto">
                <div
                  className="grid w-full min-w-max items-start gap-x-6 gap-y-4"
                  style={{
                    gridTemplateColumns:
                      "minmax(8rem, max-content) repeat(4, minmax(9rem, 1fr))",
                  }}
                >
                  <div />
                  {SIZES_TEXT_ONLY.map((size) => (
                    <div
                      key={size}
                      className="font-mono text-xs font-medium text-muted-foreground"
                    >
                      {size}
                    </div>
                  ))}
                  {SELECTION_ROWS_ALLOW_ALL.map((row) => (
                    <Fragment key={row.label}>
                      <div className="self-start pt-3 font-mono text-xs text-muted-foreground">
                        {row.label}
                      </div>
                      {SIZES_TEXT_ONLY.map((size) => (
                        <MatrixCell
                          key={`${row.label}-${size}`}
                          allowAll={true}
                          initialSelection={row.selection}
                          showText={true}
                          size={size}
                          variant="ghost"
                        />
                      ))}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Bloco D: Outras variantes (com nome, 1 selec.) */}
            <div className="flex flex-col gap-4 py-8">
              <div className="text-sm font-medium">
                Outras variantes (com nome, 1 selec.)
              </div>
              <div className="overflow-x-auto">
                <div
                  className="grid w-full min-w-max items-start gap-x-6 gap-y-4"
                  style={{
                    gridTemplateColumns:
                      "minmax(8rem, max-content) repeat(4, minmax(9rem, 1fr))",
                  }}
                >
                  <div />
                  {SIZES_TEXT_ONLY.map((size) => (
                    <div
                      key={size}
                      className="font-mono text-xs font-medium text-muted-foreground"
                    >
                      {size}
                    </div>
                  ))}
                  {OTHER_VARIANTS.map((variant) => (
                    <Fragment key={variant}>
                      <div className="self-start pt-3 font-mono text-xs text-muted-foreground">
                        {variant}
                      </div>
                      {SIZES_TEXT_ONLY.map((size) => (
                        <MatrixCell
                          key={`${variant}-${size}`}
                          allowAll={false}
                          initialSelection={["alfa"]}
                          showText={true}
                          size={size}
                          variant={variant}
                        />
                      ))}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Bloco E: Outras variantes (só avatares, 1 selec.) */}
            <div className="flex flex-col gap-4 py-8">
              <div className="text-sm font-medium">
                Outras variantes (só avatares, 1 selec.)
              </div>
              <div className="overflow-x-auto">
                <div
                  className="grid w-full min-w-max items-start gap-x-6 gap-y-4"
                  style={{
                    gridTemplateColumns:
                      "minmax(8rem, max-content) repeat(4, minmax(5rem, 1fr))",
                  }}
                >
                  <div />
                  {SIZES_ICON_ONLY.map((size) => (
                    <div
                      key={size}
                      className="font-mono text-xs font-medium text-muted-foreground"
                    >
                      {size}
                    </div>
                  ))}
                  {OTHER_VARIANTS.map((variant) => (
                    <Fragment key={variant}>
                      <div className="self-start pt-3 font-mono text-xs text-muted-foreground">
                        {variant}
                      </div>
                      {SIZES_ICON_ONLY.map((size) => (
                        <MatrixCell
                          key={`${variant}-${size}`}
                          allowAll={false}
                          initialSelection={["alfa"]}
                          showText={false}
                          size={size}
                          variant={variant}
                        />
                      ))}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Bloco F: Desabilitado */}
            <div className="flex flex-col gap-4 py-8">
              <div className="text-sm font-medium">Desabilitado</div>
              <MatrixCell
                allowAll={false}
                disabled={true}
                initialSelection={["alfa"]}
                showText={true}
                size="sm"
                variant="ghost"
              />
            </div>
          </div>
        </GallerySection>
      </div>
    </AppContext.Provider>
  );
}
