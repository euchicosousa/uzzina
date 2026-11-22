import { useState } from "react";
import {
  SunIcon,
  MoonIcon,
  CheckIcon,
  CircleCheckIcon,
  CircleXIcon,
  InfoIcon,
  TriangleAlertIcon,
  Trash2Icon,
  SlidersHorizontalIcon,
  CopyIcon,
  SendIcon,
  XIcon,
  CalendarIcon,
  ClockIcon,
  AlertCircleIcon,
  PlusIcon,
} from "lucide-react";
import { useAppThemeContext, Theme } from "~/hooks/useAppTheme";
import { PALLETE } from "~/lib/palettes";
import { PHASES } from "~/lib/CONSTANTS";
import {
  PrismButton,
  PrismInput,
  PrismCheckbox,
  PrismAlert,
  PrismAlertTitle,
  PrismAlertDescription,
  PrismToggleGroup,
  PrismToggleGroupItem,
  PrismBadge,
  PrismTabs,
  PrismTabList,
  PrismTab,
  PrismTabPanel,
  PrismKbd,
  PrismPopover,
  PrismPopoverTrigger,
  PrismPopoverHeader,
  PrismPopoverTitle,
  PrismPopoverDescription,
} from "~/components/prism";
import { UPhaseIcon } from "~/components/uzzina/UPhaseIcon";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
} from "./GalleryHelperComponents";
import { cn } from "~/lib/utils";

const SEMANTIC_FEEDBACK = [
  {
    variant: "info" as const,
    label: "Informação",
    status: "Atualização disponível",
    description: "Há uma nova versão de estratégia para consultar.",
    color: "text-info-foreground",
    icon: InfoIcon,
  },
  {
    variant: "success" as const,
    label: "Sucesso",
    status: "Alterações salvas",
    description: "As alterações da ação foram salvas no servidor.",
    color: "text-success-foreground",
    icon: CircleCheckIcon,
  },
  {
    variant: "warning" as const,
    label: "Alerta",
    status: "Atenção necessária",
    description: "Revise os prazos de publicação antes de aprovar.",
    color: "text-warning-foreground",
    icon: TriangleAlertIcon,
  },
  {
    variant: "error" as const,
    label: "Erro",
    status: "Falha ao salvar",
    description: "Ocorreu uma inconsistência de conexão ao salvar.",
    color: "text-error-foreground",
    icon: CircleXIcon,
  },
] as const;

function SemanticCategory({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 py-8 first:pt-4 last:pb-4">
      <div className="flex flex-col gap-1.5">
        <h4 className="text-base font-semibold text-foreground">{title}</h4>
        <p className="text-sm text-secondary-foreground">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {children}
      </div>
    </div>
  );
}

function SemanticSwatch({
  name,
  cssClass,
  note,
  preview,
}: {
  name: string;
  cssClass: string;
  note: string;
  preview: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0">{preview}</div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold text-foreground">
          {name}
        </span>
        <code className="font-mono text-xs break-all text-secondary-foreground">
          {cssClass}
        </code>
        <span className="mt-1 text-xs leading-snug text-secondary-foreground/80">
          {note}
        </span>
      </div>
    </div>
  );
}

export function TokensColorsSection() {
  const { theme, setTheme, primaryColorId, setPrimaryColorId } =
    useAppThemeContext();
  const [activeTab, setActiveTab] = useState("essential");

  return (
    <div id="tokens-colors">
      <GallerySection>
        {/* Cabeçalho Limpo + Seletor de Tema e Cores em Swatches Círculos */}
        <div
          className="flex flex-col gap-6 border-b pb-6"
          id="tokens-colors-palettes"
        >
          <GallerySectionHeader
            description="Organização das camadas de superfície, marca, ring de foco e feedbacks com alternância dinâmica de modo e paletas OKLCH."
            title="Cores Semânticas OKLCH"
          />

          <div className="flex flex-wrap items-center justify-between gap-6">
            {/* Seletor Compacto Light / Dark */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-secondary-foreground uppercase">
                Modo:
              </span>
              <PrismToggleGroup
                aria-label="Modo de Tema"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as Theme;
                  if (selected) setTheme(selected);
                }}
                selectedKeys={[theme]}
                size="sm"
              >
                <PrismToggleGroupItem id={Theme.LIGHT}>
                  <SunIcon className="size-4" /> Claro
                </PrismToggleGroupItem>
                <PrismToggleGroupItem id={Theme.DARK}>
                  <MoonIcon className="size-4" /> Escuro
                </PrismToggleGroupItem>
              </PrismToggleGroup>
            </div>

            {/* Seletor de Círculos / Bolinhas de Paletas OKLCH */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-secondary-foreground uppercase">
                Paleta:
              </span>
              <div className="flex flex-wrap items-center gap-4">
                {PALLETE.map((item) => {
                  const isSelected = primaryColorId === item.id;
                  const isDark = theme === Theme.DARK;
                  const p = isDark ? item.dark.primary : item.light.primary;
                  const bgStyle = `oklch(${p.l} ${p.c} ${p.h})`;
                  return (
                    <button
                      key={item.id}
                      className={cn(
                        "relative flex size-5 items-center justify-center rounded-full border border-black/10 transition-transform hover:scale-110 focus:outline-none dark:border-white/20",
                        isSelected &&
                          "scale-105 ring-2 ring-primary ring-offset-2 ring-offset-background",
                      )}
                      onClick={() => setPrimaryColorId(item.id)}
                      style={{
                        backgroundColor: bgStyle,
                      }}
                      title={item.label}
                      type="button"
                    >
                      {isSelected && (
                        <CheckIcon
                          className={cn(
                            "size-3.5 stroke-3",
                            p.l > 0.6 ? "text-black" : "text-white",
                          )}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 1. Categorias Divididas de Amostras de Cores Semânticas */}
        <div id="tokens-colors-semantics">
          <GallerySectionContent className="flex flex-col divide-y divide-border">
            {/* Categoria 1 — Superfícies, Estrutura e Texto Neutro */}
            <SemanticCategory
              description="Superfícies base do app e tons neutros de texto. Todos os neutros derivam de background (cor pai) por um delta fixo de luminosidade OKLCH, o mesmo para todas as paletas (DS28)."
              title="Superfícies, Estrutura e Texto Neutro"
            >
              <SemanticSwatch
                cssClass="bg-background"
                name="Background"
                note="Superfície base da página (definida pela paleta)"
                preview={
                  <div className="size-11 rounded-xl border border-border bg-background shadow-xs squircle" />
                }
              />
              <SemanticSwatch
                cssClass="text-foreground / bg-foreground"
                name="Foreground"
                note="Texto e ícones principais (definido pela paleta)"
                preview={
                  <div className="flex size-11 items-center justify-center rounded-xl bg-foreground text-xs font-bold text-background shadow-xs squircle">
                    Aa
                  </div>
                }
              />
              <SemanticSwatch
                cssClass="bg-card"
                name="Card"
                note="Fundo fixo que informa ou sinaliza e não é clicável (nota, selo, atalho, avatar vazio, item do acordeão). Derivada de background pelo ajuste da paleta (L −0,02 claro, +0,05 escuro)"
                preview={
                  <div className="size-11 rounded-xl border border-border bg-card shadow-xs squircle" />
                }
              />
              <SemanticSwatch
                cssClass="bg-popover"
                name="Popover"
                note="Derivada de background pelo ajuste da paleta (L +0,02 claro, −0,03 escuro)"
                preview={
                  <div className="size-11 rounded-xl border border-border bg-popover shadow-xs squircle" />
                }
              />
              <SemanticSwatch
                cssClass="bg-input"
                name="Input"
                note="Campos e trilho de progresso ou controle deslizante. Derivada de background pelo ajuste da paleta (L −0,04 claro, −0,06 escuro)"
                preview={
                  <div className="size-11 rounded-xl border border-border bg-input shadow-xs squircle" />
                }
              />
              <SemanticSwatch
                cssClass="border-border / bg-border"
                name="Border"
                note="Derivada de background pelo ajuste da paleta (L −0,09 claro, +0,15 escuro)"
                preview={
                  <div className="flex size-11 items-center justify-center rounded-xl border-2 border-border bg-background shadow-xs squircle">
                    <div className="size-4.5 rounded-md bg-border squircle" />
                  </div>
                }
              />
              <SemanticSwatch
                cssClass="bg-secondary"
                name="Secondary"
                note="Só para o que é clicável (botão, item de menu ou lista, aba). Derivada de background pelo ajuste da paleta (L −0,06 claro, +0,12 escuro); hover em bg-secondary-hover (L −0,08 claro, +0,15 escuro)"
                preview={
                  <div className="size-11 rounded-xl border border-border bg-secondary shadow-xs squircle" />
                }
              />
              <SemanticSwatch
                cssClass="text-secondary-foreground"
                name="Secondary Foreground"
                note="Derivada de background (L −0,512 claro, +0,549 escuro)"
                preview={
                  <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-secondary text-xs font-bold text-secondary-foreground shadow-xs squircle">
                    Aa
                  </div>
                }
              />
              <SemanticSwatch
                cssClass="bg-overlay"
                name="Overlay"
                note="Fundo escurecido de diálogos/gaveta (--shadow-color a 30%)"
                preview={
                  <div className="size-11 rounded-xl border border-border bg-overlay shadow-xs squircle" />
                }
              />
            </SemanticCategory>

            {/* Categoria 2 — Item da Ação e Versões (action) */}
            <SemanticCategory
              description="Superfície do item da Ação, relevo de borda superior, contorno e versões de repouso e hover. Em paletas planas (--action-relief: 0), o anel e a borda superior ficam transparentes."
              title="Item da Ação e Versões (Action)"
            >
              <SemanticSwatch
                cssClass="bg-action"
                name="Action"
                note="Superfície base do item da Ação (background L +0,02 claro, +0,10 escuro, pelo ajuste da paleta)"
                preview={
                  <div className="size-11 rounded-xl border border-border/40 bg-action shadow-action ring ring-action-ring squircle" />
                }
              />
              <SemanticSwatch
                cssClass="bg-action-hover"
                name="Action Hover"
                note="Versão no hover (background L +0,10 claro, +0,20 escuro, pelo ajuste da paleta)"
                preview={
                  <div className="size-11 rounded-xl border border-border/40 bg-action-hover shadow-action-hover ring ring-action-ring squircle" />
                }
              />
              <SemanticSwatch
                cssClass="ring-action-ring"
                name="Action Ring"
                note="Contorno do item da Ação (--shadow-color a 5% no claro e 20% no escuro; desligado em paletas planas)"
                preview={
                  <div className="flex size-11 items-center justify-center rounded-xl bg-action ring-2 ring-action-ring squircle">
                    <div className="size-4.5 rounded-md bg-action-ring squircle" />
                  </div>
                }
              />
              <SemanticSwatch
                cssClass="border-action-top-border"
                name="Action Top Border"
                note="Filete superior de relevo (#ffffff no claro, white/10 no escuro; transparente em paletas planas)"
                preview={
                  <div className="size-11 rounded-xl border-x border-t-2 border-b border-border/20 border-t-action-top-border bg-action shadow-action squircle" />
                }
              />
            </SemanticCategory>

            {/* Categoria 3 — Marca, Destaque e Foco */}
            <SemanticCategory
              description="Cor principal e destaque guiados pela paleta ativa; o anel de foco (ring) segue o accent da paleta."
              title="Marca, Destaque e Foco"
            >
              <SemanticSwatch
                cssClass="bg-primary"
                name="Primary"
                note="Cor principal de ação e marca (OKLCH da paleta)"
                preview={
                  <div className="size-11 rounded-xl bg-primary shadow-xs squircle" />
                }
              />
              <SemanticSwatch
                cssClass="text-primary-foreground"
                name="Primary Foreground"
                note="Texto e ícone sobre bg-primary (definido pela paleta)"
                preview={
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-xs squircle">
                    Aa
                  </div>
                }
              />
              <SemanticSwatch
                cssClass="bg-accent"
                name="Accent"
                note="Cor de destaque da paleta (hoje uma cópia da primary); o anel de foco usa ela"
                preview={
                  <div className="size-11 rounded-xl bg-accent shadow-xs squircle" />
                }
              />
              <SemanticSwatch
                cssClass="ring-ring / border-ring / bg-ring"
                name="Ring"
                note="Cor do anel de foco (segue o accent da paleta; aplicada com ring-3 ring-ring-halo e border-ring/60)"
                preview={
                  <div className="flex size-11 items-center justify-center rounded-xl border border-ring/60 bg-background shadow-xs ring-3 ring-ring-halo squircle">
                    <div className="size-4 rounded bg-ring/40 squircle" />
                  </div>
                }
              />
            </SemanticCategory>

            {/* Categoria 4 — Feedbacks Semânticos */}
            <SemanticCategory
              description="Famílias de feedback com 3 papéis cada: cor base/borda, texto foreground e fundo opaco background misturado sobre --card (7% no claro — 13% no erro — e 14% no escuro). Inclui a família Success Strong fixa em verde esmeralda para confirmação/aprovação."
              title="Feedbacks Semânticos e Verde Firme"
            >
              <SemanticSwatch
                cssClass="bg-error / border-error / text-error"
                name="Error"
                note="Cor base e borda de erro (oklch 0.8 calc(c*1.1) h=16 claro / 0.86 escuro)"
                preview={
                  <div className="size-11 rounded-xl bg-error shadow-xs squircle" />
                }
              />
              <SemanticSwatch
                cssClass="text-error-foreground"
                name="Error Foreground"
                note="Texto e ícones de erro com contraste refinado (oklch 0.6 claro / cor base no escuro)"
                preview={
                  <div className="flex size-11 items-center justify-center rounded-xl border border-error/30 bg-error-background text-xs font-bold text-error-foreground squircle">
                    Aa
                  </div>
                }
              />
              <SemanticSwatch
                cssClass="bg-error-background"
                name="Error Background"
                note="Fundo 100% opaco misturado sobre --card (13% claro / 14% escuro)"
                preview={
                  <div className="size-11 rounded-xl border border-error/30 bg-error-background shadow-xs squircle" />
                }
              />

              <SemanticSwatch
                cssClass="bg-success / border-success / text-success"
                name="Success"
                note="Cor base de sucesso na família Emerald (oklch 0.508 claro / 0.65 escuro)"
                preview={
                  <div className="size-11 rounded-xl bg-success shadow-xs squircle" />
                }
              />
              <SemanticSwatch
                cssClass="text-success-foreground"
                name="Success Foreground"
                note="Texto e ícones de sucesso com contraste refinado (oklch 0.42 claro / cor base no escuro)"
                preview={
                  <div className="flex size-11 items-center justify-center rounded-xl border border-success/30 bg-success-background text-xs font-bold text-success-foreground squircle">
                    Aa
                  </div>
                }
              />
              <SemanticSwatch
                cssClass="bg-success-background"
                name="Success Background"
                note="Fundo 100% opaco misturado sobre --card (7% claro / 14% escuro)"
                preview={
                  <div className="size-11 rounded-xl border border-success/30 bg-success-background shadow-xs squircle" />
                }
              />

              <SemanticSwatch
                cssClass="bg-success-strong"
                name="Success Strong"
                note="Verde esmeralda sólido para ações afirmativas e aprovação (emerald-600 fixo)"
                preview={
                  <div className="size-11 rounded-xl bg-success-strong shadow-xs squircle" />
                }
              />
              <SemanticSwatch
                cssClass="bg-success-strong-hover"
                name="Success Strong Hover"
                note="Versão hover do verde forte (emerald-700 fixo)"
                preview={
                  <div className="size-11 rounded-xl bg-success-strong-hover shadow-xs squircle" />
                }
              />
              <SemanticSwatch
                cssClass="text-success-strong-foreground"
                name="Success Strong Foreground"
                note="Texto branco puro sobre o verde esmeralda sólido"
                preview={
                  <div className="flex size-11 items-center justify-center rounded-xl bg-success-strong text-xs font-bold text-success-strong-foreground shadow-xs squircle">
                    Aa
                  </div>
                }
              />

              <SemanticSwatch
                cssClass="bg-warning / border-warning / text-warning"
                name="Warning"
                note="Cor base de aviso e atenção (oklch h=70 claro / h=90 escuro)"
                preview={
                  <div className="size-11 rounded-xl bg-warning shadow-xs squircle" />
                }
              />
              <SemanticSwatch
                cssClass="text-warning-foreground"
                name="Warning Foreground"
                note="Texto de aviso para contraste sobre superfícies claras (oklch 0.5 claro / cor base no escuro)"
                preview={
                  <div className="flex size-11 items-center justify-center rounded-xl border border-warning/30 bg-warning-background text-xs font-bold text-warning-foreground squircle">
                    Aa
                  </div>
                }
              />
              <SemanticSwatch
                cssClass="bg-warning-background"
                name="Warning Background"
                note="Fundo 100% opaco misturado sobre --card (7% claro / 14% escuro)"
                preview={
                  <div className="size-11 rounded-xl border border-warning/30 bg-warning-background shadow-xs squircle" />
                }
              />

              <SemanticSwatch
                cssClass="bg-info / border-info / text-info"
                name="Info"
                note="Cor base de informação e suporte (oklch h=250)"
                preview={
                  <div className="size-11 rounded-xl bg-info shadow-xs squircle" />
                }
              />
              <SemanticSwatch
                cssClass="text-info-foreground"
                name="Info Foreground"
                note="Texto de informação legível e equilibrado (oklch 0.5 claro / cor base no escuro)"
                preview={
                  <div className="flex size-11 items-center justify-center rounded-xl border border-info/30 bg-info-background text-xs font-bold text-info-foreground squircle">
                    Aa
                  </div>
                }
              />
              <SemanticSwatch
                cssClass="bg-info-background"
                name="Info Background"
                note="Fundo 100% opaco misturado sobre --card (7% claro / 14% escuro)"
                preview={
                  <div className="size-11 rounded-xl border border-info/30 bg-info-background shadow-xs squircle" />
                }
              />
            </SemanticCategory>

            {/* Categoria 5 — Prioridades (Hoje) */}
            <SemanticCategory
              description="Cores dos níveis de prioridade do quadro Hoje (Board e Listas). Definidas em OKLCH com luminosidade ajustada para alta legibilidade tanto no tema claro quanto no escuro."
              title="Prioridades (Hoje)"
            >
              <SemanticSwatch
                cssClass="bg-priority-low / text-priority-low"
                name="Prioridade Baixa"
                note="Verde OKLCH (0.70 0.17 150 claro / 0.75 0.16 150 escuro)"
                preview={
                  <div className="size-11 rounded-xl bg-priority-low shadow-xs squircle" />
                }
              />
              <SemanticSwatch
                cssClass="bg-priority-medium / text-priority-medium"
                name="Prioridade Média"
                note="Amarelo OKLCH (0.82 0.16 90 claro / 0.85 0.15 95 escuro)"
                preview={
                  <div className="size-11 rounded-xl bg-priority-medium shadow-xs squircle" />
                }
              />
              <SemanticSwatch
                cssClass="bg-priority-high / text-priority-high"
                name="Prioridade Alta"
                note="Vermelho OKLCH (0.65 0.22 25 claro / 0.70 0.20 25 escuro)"
                preview={
                  <div className="size-11 rounded-xl bg-priority-high shadow-xs squircle" />
                }
              />
            </SemanticCategory>
          </GallerySectionContent>
        </div>

        {/* 2. Demonstração dos Componentes Vivos sobre bg-background (Canvas Real) */}
        <div
          className="flex flex-col gap-10 pt-10"
          id="tokens-colors-real-world"
        >
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold text-foreground">
              Aplicação no Mundo Real (Componentes Vivos do Workflow)
            </h3>
            <p className="text-sm text-secondary-foreground">
              Amostras funcionais integradas diretamente sobre o fundo da página
              para inspeção de contraste, anel de foco (ring), relevo e
              superfícies dinâmicas em todas as 10 paletas.
            </p>
          </div>

          <div className="flex flex-col divide-y divide-border">
            {/* SHOWCASE 1: Itens Reais de Ação do Workflow */}
            <div className="flex flex-col gap-6 py-8 first:pt-0 last:pb-0">
              <div className="flex flex-col gap-1.5">
                <h4 className="text-base font-semibold text-foreground">
                  1. Itens das Ações do Workflow (Relevo, Status e Cores de
                  Fase)
                </h4>
                <p className="text-sm text-secondary-foreground">
                  Réplicas fiéis da estrutura do{" "}
                  <code className="font-mono text-xs">ActionItem</code> em
                  variantes bloco e linha. Demonstra o relevo tátil com{" "}
                  <code className="font-mono text-xs">
                    border-t border-action-top-border
                  </code>
                  ,{" "}
                  <code className="font-mono text-xs">
                    ring ring-action-ring
                  </code>{" "}
                  e transição para hover, além do estado atrasado (
                  <code className="font-mono text-xs">late-surface</code>) e da
                  tintura dinâmica de fase suave (
                  <code className="font-mono text-xs">phase-surface</code>) e
                  viva (<code className="font-mono text-xs">phase-vivid</code>).
                </p>
              </div>

              {/* Sub-grupo 1.1: Repouso e Hover */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold text-secondary-foreground uppercase">
                  Repouso e Hover (Superfície bg-action e relevo shadow-action)
                </span>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Bloco padrão */}
                  <div className="group/card relative flex cursor-pointer flex-col gap-2 rounded-2xl border-t border-action-top-border bg-action p-3 shadow-action ring ring-action-ring transition-[color,background-color,border-color,box-shadow] duration-300 squircle hover:z-10 hover:bg-action-hover hover:shadow-action-hover">
                    <div className="flex items-start justify-between gap-2">
                      <span className="line-clamp-1 text-sm font-semibold text-foreground">
                        Campanha Dia dos Pais — Reels 01
                      </span>
                      <UPhaseIcon phase={PHASES.doing} size="sm" />
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1 text-xs text-secondary-foreground">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-medium text-foreground">
                          Studio Alpha
                        </span>
                        <span>·</span>
                        <span>Instagram Reels</span>
                      </div>
                      <div className="action-date flex shrink-0 items-center gap-1 text-xs">
                        <CalendarIcon className="size-3.5" />
                        <span>Amanhã, 14:00</span>
                      </div>
                    </div>
                  </div>

                  {/* Linha padrão */}
                  <div className="group/card relative flex cursor-pointer items-center justify-between gap-3 rounded-xl border-t border-action-top-border bg-action px-3 py-2.5 shadow-action ring ring-action-ring transition-[color,background-color,border-color,box-shadow] duration-300 squircle hover:z-10 hover:bg-action-hover hover:shadow-action-hover">
                    <div className="flex min-w-0 items-center gap-2">
                      <UPhaseIcon phase={PHASES.do} size="dot" />
                      <span className="truncate text-xs font-semibold text-foreground">
                        Revisão do roteiro institucional
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs text-secondary-foreground">
                      <span className="font-medium text-foreground">
                        Studio Alpha
                      </span>
                      <div className="action-date flex items-center gap-1">
                        <ClockIcon className="size-3.5" />
                        <span>15:30</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-grupo 1.2: Atrasado */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold text-secondary-foreground uppercase">
                  Ação Atrasada (late-surface, bg-error-background/80 e
                  ring-error/30)
                </span>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Bloco atrasado */}
                  <div className="group/card relative flex cursor-pointer flex-col gap-2 rounded-2xl border-t border-action-top-border bg-error-background/80 p-3 text-error-foreground shadow-action ring ring-error/30 transition-[color,background-color,border-color,box-shadow] duration-300 late-surface squircle hover:z-10 hover:bg-error-background hover:shadow-action-hover">
                    <div className="flex items-start justify-between gap-2">
                      <span className="line-clamp-1 text-sm font-semibold">
                        Carrossel de Tendências de Outono
                      </span>
                      <AlertCircleIcon className="size-4 shrink-0 text-error-foreground" />
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                      <div className="flex items-center gap-1.5 truncate opacity-90">
                        <span className="font-medium">Beta Clinic</span>
                        <span>·</span>
                        <span>Instagram Carrossel</span>
                      </div>
                      <div className="action-date flex shrink-0 items-center gap-1 text-xs font-medium">
                        <ClockIcon className="size-3.5" />
                        <span>Venceu há 2 dias</span>
                      </div>
                    </div>
                  </div>

                  {/* Linha atrasada */}
                  <div className="group/card relative flex cursor-pointer items-center justify-between gap-3 rounded-xl border-t border-action-top-border bg-error-background/80 px-3 py-2.5 text-error-foreground shadow-action ring ring-error/30 transition-[color,background-color,border-color,box-shadow] duration-300 late-surface squircle hover:z-10 hover:bg-error-background hover:shadow-action-hover">
                    <div className="flex min-w-0 items-center gap-2">
                      <AlertCircleIcon className="size-4 shrink-0 text-error-foreground" />
                      <span className="truncate text-xs font-semibold">
                        Relatório de métricas mensais
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs">
                      <span className="font-medium opacity-90">
                        Beta Clinic
                      </span>
                      <div className="action-date flex items-center gap-1 font-medium">
                        <ClockIcon className="size-3.5" />
                        <span>Atrasado</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-grupo 1.3: Tintura de Fase Suave e Viva */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold text-secondary-foreground uppercase">
                  Cores de Fase (phase-surface suave e phase-vivid cheia)
                </span>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Fase Suave */}
                  <div
                    className="group/card relative flex cursor-pointer flex-col gap-2 rounded-2xl border-t border-action-top-border bg-action p-3 shadow-action ring ring-action-ring transition-[color,background-color,border-color,box-shadow] duration-300 phase-surface squircle hover:z-10 hover:bg-action-hover hover:shadow-action-hover"
                    style={
                      { "--phase-color": "#ec4899" } as React.CSSProperties
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="line-clamp-1 text-sm font-semibold text-foreground">
                        Produção de vídeo institucional
                      </span>
                      <UPhaseIcon phase={PHASES.doing} size="sm" />
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1 text-xs text-secondary-foreground">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-medium text-foreground">
                          Gamma Corp
                        </span>
                        <span>·</span>
                        <span>Fase Fazendo (Suave)</span>
                      </div>
                      <div className="action-date flex shrink-0 items-center gap-1 text-xs">
                        <CalendarIcon className="size-3.5" />
                        <span>Quinta, 10:00</span>
                      </div>
                    </div>
                  </div>

                  {/* Fase Viva */}
                  <div
                    className="group/card relative flex cursor-pointer flex-col gap-2 rounded-2xl border-t border-action-top-border phase-vivid bg-action p-3 shadow-action ring ring-action-ring transition-[color,background-color,border-color,box-shadow] duration-300 squircle hover:z-10 hover:bg-action-hover hover:shadow-action-hover"
                    style={
                      { "--phase-color": "#f97316" } as React.CSSProperties
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="line-clamp-1 text-sm font-semibold text-foreground">
                        Disparo de e-mail marketing
                      </span>
                      <UPhaseIcon phase={PHASES.do} size="sm" />
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1 text-xs text-secondary-foreground">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-medium text-foreground">
                          Delta Store
                        </span>
                        <span>·</span>
                        <span>Fase Fazer (Viva)</span>
                      </div>
                      <div className="action-date flex shrink-0 items-center gap-1 text-xs">
                        <CalendarIcon className="size-3.5" />
                        <span>Hoje, 17:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SHOWCASE 2: Variantes Completas de Botões Prism (DS05: Ícone à Direita) */}
            <div className="flex flex-col gap-6 py-8 first:pt-0 last:pb-0">
              <div className="flex flex-col gap-1.5">
                <h4 className="text-base font-semibold text-foreground">
                  2. Variantes de Botões Prism (Ordem Semântica do Ícone à
                  Direita)
                </h4>
                <p className="text-sm text-secondary-foreground">
                  Botões de ação e criação respeitando a convenção DS05: verbos,
                  disparos e adição usam ícone à direita (como{" "}
                  <code className="font-mono text-xs">PlusIcon</code> em Nova
                  ação), combinando os tokens de primary, secondary, outline,
                  ghost, error e o verde sólido{" "}
                  <code className="font-mono text-xs">bg-success-strong</code>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <PrismButton variant="default">
                  Nova ação <PlusIcon className="size-4" />
                </PrismButton>
                <PrismButton variant="default">
                  Salvar ação <CheckIcon className="size-4" />
                </PrismButton>
                <PrismButton variant="secondary">
                  Filtrar lista <SlidersHorizontalIcon className="size-4" />
                </PrismButton>
                <PrismButton variant="outline">
                  Duplicar <CopyIcon className="size-4" />
                </PrismButton>
                <PrismButton variant="ghost">
                  Mais opções <SlidersHorizontalIcon className="size-4" />
                </PrismButton>
                <PrismButton variant="error">
                  Excluir permanentemente <Trash2Icon className="size-4" />
                </PrismButton>
                <PrismButton variant="ghost-error">
                  Remover <XIcon className="size-4" />
                </PrismButton>
                <PrismButton variant="success">
                  Publicar agora <SendIcon className="size-4" />
                </PrismButton>
              </div>
            </div>

            {/* SHOWCASE 3: Controles de Formulário e Anel de Foco */}
            <div className="flex flex-col gap-6 py-8 first:pt-0 last:pb-0">
              <div className="flex flex-col gap-1.5">
                <h4 className="text-base font-semibold text-foreground">
                  3. Controles de Formulário e Anel de Foco Dinâmico
                </h4>
                <p className="text-sm text-secondary-foreground">
                  Superfície <code className="font-mono text-xs">bg-input</code>{" "}
                  exclusiva de campos de formulário, anel de foco dinâmico{" "}
                  <code className="font-mono text-xs">ring-ring-halo</code>{" "}
                  guiado pela paleta e validação com{" "}
                  <code className="font-mono text-xs">aria-invalid</code> e
                  texto em{" "}
                  <code className="font-mono text-xs">
                    text-error-foreground
                  </code>
                  .
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Campo Repouso */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs font-medium text-foreground"
                    htmlFor="token-idle-input"
                  >
                    Campo em repouso
                  </label>
                  <PrismInput
                    id="token-idle-input"
                    placeholder="Digite o título da ação..."
                  />
                  <span className="text-[11px] text-secondary-foreground">
                    Usa <code className="font-mono">bg-input</code> restrito a
                    formulários.
                  </span>
                </div>

                {/* Keyboard focus */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs font-medium text-foreground"
                    htmlFor="token-focused-input"
                  >
                    Campo para testar o foco
                  </label>
                  <PrismInput
                    id="token-focused-input"
                    readOnly
                    value="Use Tab para destacar o campo"
                  />
                  <span className="text-[11px] text-secondary-foreground">
                    Controlado por <code className="font-mono">--ring</code> via
                    paleta.
                  </span>
                </div>

                {/* Campo com Erro de Validação */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs font-medium text-error-foreground"
                    htmlFor="token-invalid-input"
                  >
                    Validação com erro
                  </label>
                  <PrismInput
                    aria-describedby="token-invalid-input-error"
                    aria-invalid="true"
                    id="token-invalid-input"
                    readOnly
                    value="Data de publicação inválida"
                  />
                  <span
                    className="text-[11px] font-medium text-error-foreground"
                    id="token-invalid-input-error"
                  >
                    A data informada já está no passado.
                  </span>
                </div>
              </div>

              {/* Linha com Checkbox e Alternadores */}
              <div className="flex flex-wrap items-center justify-between gap-6 border-t border-border/40 pt-4">
                <div className="flex items-center gap-6">
                  <PrismCheckbox defaultSelected>
                    Notificar responsáveis por e-mail
                  </PrismCheckbox>
                  <PrismCheckbox>Marcar como confidencial</PrismCheckbox>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-secondary-foreground">
                    Visualização:
                  </span>
                  <PrismToggleGroup
                    aria-label="Tipo de visualização"
                    defaultSelectedKeys={["list"]}
                    size="sm"
                  >
                    <PrismToggleGroupItem id="list">Lista</PrismToggleGroupItem>
                    <PrismToggleGroupItem id="calendar">
                      Calendário
                    </PrismToggleGroupItem>
                    <PrismToggleGroupItem id="kanban">
                      Kanban
                    </PrismToggleGroupItem>
                  </PrismToggleGroup>
                </div>
              </div>
            </div>

            {/* SHOWCASE 4: Navegação em Abas & Painel Flutuante (Popover) */}
            <div className="flex flex-col gap-6 py-8 first:pt-0 last:pb-0">
              <div className="flex flex-col gap-1.5">
                <h4 className="text-base font-semibold text-foreground">
                  4. Navegação em Abas e Superfícies Flutuantes
                </h4>
                <p className="text-sm text-secondary-foreground">
                  Abas interativas com hover em{" "}
                  <code className="font-mono text-xs">bg-secondary</code> e
                  painel flutuante PrismPopover em{" "}
                  <code className="font-mono text-xs">bg-popover</code> com
                  atalhos de teclado PrismKbd.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Abas Interativas */}
                <div className="flex flex-col gap-3">
                  <PrismTabs
                    defaultSelectedKey={activeTab}
                    onSelectionChange={(k) => setActiveTab(String(k))}
                  >
                    <PrismTabList aria-label="Abas da Gaveta">
                      <PrismTab id="essential">Essencial</PrismTab>
                      <PrismTab id="instagram">Instagram</PrismTab>
                      <PrismTab id="observations">Observações</PrismTab>
                    </PrismTabList>
                    <div className="mt-3 text-xs leading-relaxed text-secondary-foreground">
                      <PrismTabPanel id="essential">
                        As abas utilizam hover em{" "}
                        <code className="font-mono">bg-secondary</code> e
                        seleção ativa integrada diretamente sobre o fundo.
                      </PrismTabPanel>
                      <PrismTabPanel id="instagram">
                        Painel de mídias, carrossel e cópia de legenda para o
                        Instagram.
                      </PrismTabPanel>
                      <PrismTabPanel id="observations">
                        Alinhado às abas Essencial, Instagram e Observações da
                        gaveta de ação.
                      </PrismTabPanel>
                    </div>
                  </PrismTabs>
                </div>

                {/* Painel Flutuante com popover Prism vivo */}
                <div className="flex items-center">
                  <PrismPopoverTrigger>
                    <PrismButton variant="outline">Abrir popover</PrismButton>
                    <PrismPopover size="lg">
                      <PrismPopoverHeader>
                        <PrismPopoverTitle>Painel flutuante</PrismPopoverTitle>
                        <PrismPopoverDescription>
                          Popover Prism usando bg-popover e secondary
                          foreground.
                        </PrismPopoverDescription>
                      </PrismPopoverHeader>
                      <div className="flex items-center gap-2 text-xs text-secondary-foreground">
                        Atalhos: <PrismKbd>⌘↵</PrismKbd> Aprovar{" "}
                        <PrismKbd>Esc</PrismKbd> Fechar
                      </div>
                    </PrismPopover>
                  </PrismPopoverTrigger>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Feedbacks Semânticos com Badges e Alertas */}
        <div className="flex flex-col gap-6 pt-10" id="tokens-colors-feedback">
          <div className="flex flex-col gap-1">
            <h4 className="text-base font-semibold text-foreground">
              Feedbacks Semânticos (Fundos Opacos a 7% no Claro e 14% no Escuro)
            </h4>
            <p className="text-sm text-secondary-foreground">
              Combinação de PrismBadge, PrismAlert e texto nas 4 famílias
              semânticas (Erro, Sucesso, Aviso e Informação) com fundos 100%
              opacos misturados sobre{" "}
              <code className="font-mono text-xs">--card</code> (13% no erro
              claro) e verde esmeralda sólido para confirmações afirmativas.
            </p>
          </div>

          <GallerySectionContent className="grid gap-6 md:grid-cols-2">
            {SEMANTIC_FEEDBACK.map(
              ({ variant, label, status, description, color, icon: Icon }) => (
                <div key={variant} className="flex flex-col gap-3">
                  <h5 className="text-xs font-semibold text-secondary-foreground uppercase">
                    {label}
                  </h5>
                  <PrismBadge variant={variant}>{label}</PrismBadge>
                  <PrismAlert aria-label={label} role="group" variant={variant}>
                    <PrismAlertTitle>{status}</PrismAlertTitle>
                    <PrismAlertDescription>{description}</PrismAlertDescription>
                  </PrismAlert>
                  <div
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium",
                      color,
                    )}
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    {status}
                  </div>
                </div>
              ),
            )}

            {/* Sucesso Forte (Confirmação Firme & Botões Afirmativos) */}
            <div className="flex flex-col gap-3">
              <h5 className="text-xs font-semibold text-secondary-foreground uppercase">
                Sucesso Firme (Verde Esmeralda Sólido)
              </h5>
              <div className="flex items-center gap-2">
                <PrismButton size="sm" variant="success">
                  Aprovar e Publicar <SendIcon className="size-3.5" />
                </PrismButton>
                <span className="inline-flex items-center rounded-full bg-success-strong px-2.5 py-0.5 text-xs font-semibold text-success-strong-foreground">
                  Aprovado
                </span>
              </div>
              <PrismAlert
                aria-label="Ação confirmada"
                role="group"
                variant="success"
              >
                <PrismAlertTitle>Publicação confirmada</PrismAlertTitle>
                <PrismAlertDescription>
                  Ação afirmativa disparada com o token fixo verde esmeralda (
                  <code className="font-mono text-xs">bg-success-strong</code>
                  ), mantendo consistência entre os modos claro e escuro.
                </PrismAlertDescription>
              </PrismAlert>
              <div className="flex items-center gap-2 text-sm font-medium text-success-strong">
                <CircleCheckIcon
                  aria-hidden="true"
                  className="size-4 shrink-0"
                />
                Confirmação em emerald-600 permanente
              </div>
            </div>
          </GallerySectionContent>
        </div>
      </GallerySection>
    </div>
  );
}
