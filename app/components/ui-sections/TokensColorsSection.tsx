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
  SparklesIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react";
import { useAppThemeContext, Theme } from "~/hooks/useAppTheme";
import { PALLETE } from "~/lib/palettes";
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
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
} from "./GalleryHelperComponents";
import { cn } from "cnfast";

const SEMANTIC_FEEDBACK = [
  {
    variant: "info",
    label: "Informação",
    status: "Atualização disponível",
    description: "Há uma nova versão de estratégia para consultar.",
    color: "text-info-foreground",
    icon: InfoIcon,
  },
  {
    variant: "success",
    label: "Sucesso",
    status: "Alterações salvas",
    description: "As alterações da ação foram salvas no servidor.",
    color: "text-success",
    icon: CircleCheckIcon,
  },
  {
    variant: "warning",
    label: "Alerta",
    status: "Atenção necessária",
    description: "Revise os prazos de publicação antes de aprovar.",
    color: "text-warning-foreground",
    icon: TriangleAlertIcon,
  },
  {
    variant: "error",
    label: "Erro",
    status: "Falha ao salvar",
    description: "Ocorreu uma inconsistência de conexão ao salvar.",
    color: "text-error-foreground",
    icon: CircleXIcon,
  },
] as const;

// 1. Definição das Camadas Semânticas de Cores do Sistema
const COLOR_SWATCHES = [
  // Camada 1: Superfícies e Estrutura
  {
    name: "Background",
    bg: "bg-background",
    fg: "text-foreground",
    group: "Superfícies",
  },
  {
    name: "Card",
    bg: "bg-card",
    fg: "text-foreground",
    group: "Superfícies",
  },
  {
    name: "Popover",
    bg: "bg-popover",
    fg: "text-foreground",
    group: "Superfícies",
  },
  {
    name: "Input",
    bg: "bg-input",
    fg: "text-foreground",
    group: "Superfícies",
  },
  {
    name: "Secondary",
    bg: "bg-secondary",
    fg: "text-secondary-foreground",
    group: "Superfícies",
  },
  // Camada 2: Marca, Destaque, Foco & Workflow
  {
    name: "Primary",
    bg: "bg-primary",
    fg: "text-primary-foreground",
    group: "Marca & Ações",
  },
  {
    name: "Accent",
    bg: "bg-accent",
    fg: "text-foreground",
    group: "Marca & Ações",
  },
  {
    name: "Ring",
    bg: "bg-ring",
    fg: "text-foreground",
    group: "Marca & Ações",
  },
  {
    name: "Border",
    bg: "bg-border",
    fg: "text-foreground",
    group: "Marca & Ações",
  },
  {
    name: "Action",
    bg: "bg-action",
    fg: "text-foreground",
    group: "Marca & Ações",
  },
  // Camada 3: Status e Feedbacks
  {
    name: "Error",
    bg: "bg-error-background",
    fg: "text-error-foreground",
    group: "Status & Feedback",
  },
  {
    name: "Success",
    bg: "bg-success-background",
    fg: "text-success",
    group: "Status & Feedback",
  },
  {
    name: "Warning",
    bg: "bg-warning-background",
    fg: "text-warning-foreground",
    group: "Status & Feedback",
  },
  {
    name: "Info",
    bg: "bg-info-background",
    fg: "text-info-foreground",
    group: "Status & Feedback",
  },
  {
    name: "Success Strong",
    bg: "bg-success-strong",
    fg: "text-success-strong-foreground",
    group: "Status & Feedback",
  },
];

export function TokensColorsSection() {
  const { theme, setTheme, primaryColorIndex, setPrimaryColorIndex } =
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
                {PALLETE.map((item, idx) => {
                  const isSelected = primaryColorIndex === idx;
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
                      onClick={() => setPrimaryColorIndex(idx)}
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

        {/* 1. Grid Limpo de Amostras de Cores Semânticas */}
        <div id="tokens-colors-semantics">
          <GallerySectionContent className="grid grid-cols-2 gap-3 pt-6 sm:grid-cols-3 md:grid-cols-5">
            {COLOR_SWATCHES.map((swatch) => (
              <div key={swatch.name} className="flex items-center gap-3">
                <div
                  className={`size-7 shrink-0 rounded-lg border ${swatch.bg} squircle`}
                />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-xs font-semibold">
                    {swatch.name}
                  </span>
                  <code className="truncate font-mono text-[10px] text-secondary-foreground">
                    {swatch.bg}
                  </code>
                </div>
              </div>
            ))}
          </GallerySectionContent>
        </div>

        {/* 2. Demonstração dos Componentes Vivos sobre bg-background (Canvas Real) */}
        <div className="space-y-10 pt-10" id="tokens-colors-real-world">
          <div>
            <h4 className="text-xs font-bold tracking-wider text-secondary-foreground uppercase">
              Aplicação no Mundo Real (Componentes Vivos do Workflow)
            </h4>
            <p className="mt-1 text-xs text-secondary-foreground">
              Amostras funcionais integradas diretamente sobre o fundo da página
              para inspeção de contraste, anel de foco (ring), relevo e
              superfícies dinâmicas em todas as 11 paletas.
            </p>
          </div>

          {/* SHOWCASE 1: Cartões Reais de Ação do Workflow */}
          <div className="space-y-3">
            <span className="text-xs font-bold tracking-wide text-secondary-foreground uppercase">
              1. Cartões de Ação do Workflow (Relevo, Status e Tipografia
              Secundária)
            </span>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Card A: Ação No Prazo */}
              <div className="flex flex-col gap-3 rounded-2xl border border-action-top-border/40 bg-action p-4.5 shadow-action ring-1 ring-action-ring transition-shadow squircle hover:shadow-action-hover">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                      CS
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">
                        Campanha Dia dos Pais — Reels 01
                      </div>
                      <div className="text-[11px] text-secondary-foreground">
                        Studio Alpha · Instagram Feed
                      </div>
                    </div>
                  </div>
                  <PrismBadge variant="default">Aprovado</PrismBadge>
                </div>

                <div className="flex items-center justify-between border-t border-border/40 pt-3 text-xs text-secondary-foreground">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="size-3.5" /> Amanhã, 14:00
                  </span>
                  <div className="flex items-center gap-2">
                    <PrismButton size="sm" variant="ghost">
                      Ver detalhes
                    </PrismButton>
                    <PrismButton size="sm" variant="default">
                      Concluir <CheckIcon className="size-3.5" />
                    </PrismButton>
                  </div>
                </div>
              </div>

              {/* Card B: Ação Atrasada (Error Background + Ring Error) */}
              <div className="flex flex-col gap-3 rounded-2xl border border-action-top-border/40 bg-error-background p-4.5 text-error-foreground shadow-action ring ring-error transition-[color,background-color,box-shadow] squircle hover:bg-error-background hover:shadow-action-hover">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                      MB
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">
                        Carrossel de Tendências de Outono
                      </div>
                      <div className="text-[11px] text-secondary-foreground">
                        Beta Clinic · Instagram Carrossel
                      </div>
                    </div>
                  </div>
                  <span className="rounded-full bg-error-background px-2.5 py-0.5 text-[11px] font-bold text-error-foreground squircle">
                    Atrasado
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-border/40 pt-3 text-xs text-secondary-foreground">
                  <span className="flex items-center gap-1.5 text-error-foreground">
                    <ClockIcon className="size-3.5" /> Venceu há 2 dias
                  </span>
                  <div className="flex items-center gap-2">
                    <PrismButton size="sm" variant="ghost">
                      Reprogramar
                    </PrismButton>
                    <PrismButton size="sm" variant="ghost-error">
                      Excluir <Trash2Icon className="size-3.5" />
                    </PrismButton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SHOWCASE 2: Variantes Completas de Botões Prism (DS05: Ícone à Direita) */}
          <div className="space-y-3">
            <span className="text-xs font-bold tracking-wide text-secondary-foreground uppercase">
              2. Variantes Completas de Botões Prism (Ordem Ícone à Direita)
            </span>
            <div className="flex flex-wrap items-center gap-3">
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
                Opções <SlidersHorizontalIcon className="size-4" />
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

          {/* SHOWCASE 3: Controles de Formulário e Anel de Foco (Ring em Ação) */}
          <div className="space-y-4">
            <span className="text-xs font-bold tracking-wide text-secondary-foreground uppercase">
              3. Controles de Formulário & Anel de Foco Dinâmico (Ring da
              Paleta)
            </span>
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
                  id="token-invalid-input"
                  aria-invalid="true"
                  aria-describedby="token-invalid-input-error"
                  readOnly
                  value="Data de publicação inválida"
                />
                <span
                  id="token-invalid-input-error"
                  className="text-[11px] font-medium text-error-foreground"
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

          {/* SHOWCASE 4: Navegação em Abas & Superfície Flutuante (Popover) */}
          <div className="space-y-4">
            <span className="text-xs font-bold tracking-wide text-secondary-foreground uppercase">
              4. Navegação em Abas & Painel Flutuante (bg-popover & Atalhos
              PrismKbd)
            </span>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Abas Interativas */}
              <div className="space-y-3">
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
                      <code className="font-mono">bg-secondary</code> e seleção
                      ativa integrada sem cartão envolvente.
                    </PrismTabPanel>
                    <PrismTabPanel id="instagram">
                      Painel de mídias, carrossel e cópia de legenda para o
                      Instagram.
                    </PrismTabPanel>
                    <PrismTabPanel id="observations">
                      Alinhado às abas Essencial, Instagram e Observações da
                      gaveta.
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
                        Popover Prism usando bg-popover e secondary foreground.
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

          {/* SHOWCASE 5: Tira de Cronograma / Calendário com bg-secondary */}
          <div className="space-y-3">
            <span className="text-xs font-bold tracking-wide text-secondary-foreground uppercase">
              5. Tira de Calendário de Produção (Cabeçalhos em bg-secondary e
              Dia Ativo em Primary)
            </span>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              {[
                { day: "Seg", num: 11, active: false, posts: 2 },
                { day: "Ter", num: 12, active: true, posts: 4 },
                { day: "Qua", num: 13, active: false, posts: 1 },
                { day: "Qui", num: 14, active: false, posts: 3 },
                { day: "Sex", num: 15, active: false, posts: 0 },
              ].map((item) => (
                <div
                  key={item.day}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-border/40 bg-secondary p-2.5 transition-colors squircle hover:bg-secondary"
                >
                  <span className="text-[10px] font-bold text-secondary-foreground uppercase">
                    {item.day}
                  </span>
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                      item.active
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground",
                    )}
                  >
                    {item.num}
                  </span>
                  <span className="text-[10px] text-secondary-foreground">
                    {item.posts > 0 ? `${item.posts} posts` : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Feedbacks Semânticos com Badges e Alertas */}
        <div className="space-y-6 pt-10" id="tokens-colors-feedback">
          <h4 className="text-xs font-bold tracking-wider text-secondary-foreground uppercase">
            Feedbacks Semânticos (Translucidez a 12% & Verde Emerald)
          </h4>
          <GallerySectionContent className="grid gap-6 md:grid-cols-2">
            {SEMANTIC_FEEDBACK.map(
              ({ variant, label, status, description, color, icon: Icon }) => (
                <div key={variant} className="space-y-3">
                  <h5 className="text-xs font-bold text-secondary-foreground uppercase">
                    {label}
                  </h5>
                  <PrismBadge variant={variant}>{label}</PrismBadge>
                  <PrismAlert variant={variant} role="group" aria-label={label}>
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
          </GallerySectionContent>
        </div>
      </GallerySection>
    </div>
  );
}
