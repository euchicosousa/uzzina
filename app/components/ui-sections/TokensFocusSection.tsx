import * as React from "react";
import { CalendarIcon } from "lucide-react";
import {
  PrismButton,
  PrismInput,
  PrismTextarea,
  PrismSelect,
  PrismSelectTrigger,
  PrismSelectValue,
  PrismSelectContent,
  PrismSelectItem,
  PrismToggle,
  PrismSlider,
  PrismSliderTrack,
  PrismSliderThumb,
  PrismSliderFill,
  PrismCombobox,
  PrismComboboxInput,
  PrismComboboxContent,
  PrismComboboxList,
  PrismComboboxItem,
  PrismCheckbox,
  PrismRadio,
  PrismRadioGroup,
  PrismCalendar,
  PrismColorArea,
  PrismColorSlider,
  PrismTimeField,
  PrismMenu,
  PrismMenuContent,
  PrismMenuItem,
  PrismCommand,
  PrismCommandInput,
  PrismCommandList,
  PrismCommandItem,
  PrismTabs,
  PrismTabList,
  PrismTab,
  PrismAccordion,
  PrismAccordionItem,
  PrismAccordionTrigger,
  PrismAccordionContent,
} from "~/components/prism";
import { UComboboxTrigger } from "~/components/uzzina/UComboboxTrigger";
import { RichTextEditor } from "~/components/features/RichTextEditor";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
} from "./GalleryHelperComponents";

function FocusFamily({
  id,
  title,
  rule,
  classes,
  usedBy,
  children,
}: {
  id: string;
  title: string;
  rule: string;
  classes: string;
  usedBy: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 py-8 first:pt-0 last:pb-0" id={id}>
      <div className="flex flex-col gap-2">
        <h4 className="text-base font-semibold">{title}</h4>
        <p className="text-sm text-muted-foreground">{rule}</p>
        <code className="block text-xs break-words text-muted-foreground">
          {classes}
        </code>
        <ul className="list-disc pl-5 text-xs text-muted-foreground">
          {usedBy.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap items-start gap-x-10 gap-y-8">
        {children}
      </div>
    </div>
  );
}

function Example({
  label,
  source,
  hint = "Tab para ver o foco",
  children,
}: {
  label: string;
  source: string; // "Prism real" | "App real" | "Réplica de <arquivo>"
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex max-w-full min-w-0 flex-col gap-2">
      <span className="text-xs font-semibold text-muted-foreground uppercase">
        {label} · {source}
      </span>
      {children}
      <span className="text-xs text-muted-foreground">{hint}</span>
    </div>
  );
}

function RichTextEditorFocusExample() {
  const [content, setContent] = React.useState("<p>Texto de exemplo</p>");
  return (
    <div className="w-80 max-w-full">
      <RichTextEditor
        compactToolbar
        content={content}
        handleChange={setContent}
        placeholder="Escreva algo..."
      />
    </div>
  );
}

export function TokensFocusSection() {
  return (
    <div id="tokens-focus">
      <GallerySection>
        <GallerySectionHeader
          description="Formas de foco usadas no app hoje, agrupadas por família. Use Tab (e Shift+Tab, setas) para ver cada foco. Vitrine de referência; nada aqui altera os componentes."
          title="Foco"
        />
        <GallerySectionContent className="flex flex-col divide-y">
          {/* 1. Anel externo (padrão) */}
          <FocusFamily
            id="focus-outer"
            title="Anel externo (padrão)"
            rule="Todo foco por anel: 3px, ring-ring a 30%, com borda border-ring a 60% quando o elemento tem borda. Destrutivo usa a mesma lógica toda em vermelho. É o padrão do PrismButton."
            classes="outline-none focus-visible:border-ring/60 focus-visible:ring-3 focus-visible:ring-ring/30 (também focus-within: e data-[focus-visible]:; destrutivo: focus-visible:border-destructive/60 focus-visible:ring-destructive/30)"
            usedBy={[
              "Prism: button, input, textarea, select, toggle, checkbox, radio-group, calendar (dia), color-field, time-field, date-range-picker, input-group, combobox, badge (borda border-ring/60 + anel)",
              "Prism: slider, color-area e color-slider (thumb: só anel ring-3 ring-ring/30 em data-[focus-visible])",
              "Prism: button e badge destrutivos (border-destructive/60 + ring-destructive/30)",
              "features/ComboboxTrigger.tsx (ghost icon-lg no rodapé da gaveta: anel padrão do PrismButton)",
              "features/action-drawer/ActionDatePicker.tsx (data da gaveta: ghost sm com anel padrão do PrismButton)",
              "features/PartnersCombobox.tsx e busca global (filtro de parceiros: foco padrão do Prism)",
              "features/media/ContentReorderDialog.tsx (alça e remover) e WorkFileThumbnail.tsx (remover e link da miniatura)",
              "features/ActionItem.tsx (cartão: focus-within:outline-1 outline-ring/45 + ring-4 ring-ring/30, exceção aprovada)",
              "routes/app/admin/partner/$slug.tsx (editores de texto: focus-within)",
            ]}
          >
            <Example label="Botão" source="Prism real">
              <PrismButton>Botão</PrismButton>
            </Example>
            <Example label="Input" source="Prism real">
              <PrismInput
                aria-label="Exemplo de input"
                className="w-56"
                placeholder="Digite aqui"
              />
            </Example>
            <Example label="Textarea" source="Prism real">
              <PrismTextarea
                aria-label="Exemplo de textarea"
                className="w-56"
                placeholder="Digite aqui"
              />
            </Example>
            <Example label="Select" source="Prism real">
              <PrismSelect
                aria-label="Exemplo de select"
                className="w-56"
                defaultSelectedKey="a"
              >
                <PrismSelectTrigger>
                  <PrismSelectValue />
                </PrismSelectTrigger>
                <PrismSelectContent>
                  <PrismSelectItem id="a">Opção A</PrismSelectItem>
                  <PrismSelectItem id="b">Opção B</PrismSelectItem>
                </PrismSelectContent>
              </PrismSelect>
            </Example>
            <Example label="Toggle" source="Prism real">
              <PrismToggle variant="outline">Alternar</PrismToggle>
            </Example>
            <Example label="Slider (thumb)" source="Prism real">
              <PrismSlider
                aria-label="Exemplo de slider"
                className="w-56"
                defaultValue={3}
                maxValue={7}
                minValue={1}
              >
                <PrismSliderTrack>
                  <PrismSliderFill />
                  <PrismSliderThumb />
                </PrismSliderTrack>
              </PrismSlider>
            </Example>
            <Example label="Checkbox" source="Prism real">
              <PrismCheckbox>Marcar</PrismCheckbox>
            </Example>
            <Example label="Radio" source="Prism real">
              <PrismRadioGroup aria-label="Exemplo de radio" defaultValue="a">
                <PrismRadio value="a">Opção A</PrismRadio>
                <PrismRadio value="b">Opção B</PrismRadio>
              </PrismRadioGroup>
            </Example>
            <Example label="Calendário (dia)" source="Prism real">
              <PrismCalendar aria-label="Exemplo de calendário" />
            </Example>
            <Example label="Color area (thumb)" source="Prism real">
              <PrismColorArea defaultValue="#FF5733" />
            </Example>
            <Example label="Color slider (thumb)" source="Prism real">
              <PrismColorSlider defaultValue="#FF5733" />
            </Example>
            <Example label="Campo de hora (focus-within)" source="Prism real">
              <PrismTimeField aria-label="Exemplo de hora" />
            </Example>
            <Example label="Combobox (focus-within)" source="Prism real">
              <PrismCombobox aria-label="Exemplo de combobox">
                <PrismComboboxInput placeholder="Buscar fruta..." />
                <PrismComboboxContent>
                  <PrismComboboxList>
                    <PrismComboboxItem id="maca">Maçã</PrismComboboxItem>
                    <PrismComboboxItem id="pera">Pera</PrismComboboxItem>
                  </PrismComboboxList>
                </PrismComboboxContent>
              </PrismCombobox>
            </Example>
            <Example
              label="Alça de reordenar"
              source="Réplica de features/media/ContentReorderDialog.tsx"
            >
              <button
                aria-label="Réplica da alça"
                className="flex size-8 cursor-grab touch-none items-center justify-center rounded bg-black/70 text-white outline-none squircle focus-visible:ring-3 focus-visible:ring-ring/30 active:cursor-grabbing"
                type="button"
              >
                ⠿
              </button>
            </Example>
            <Example
              label="Remover anexo"
              source="Réplica de features/media/ContentReorderDialog.tsx"
            >
              <button
                aria-label="Réplica remover"
                className="flex size-8 items-center justify-center rounded bg-destructive text-white outline-none squircle focus-visible:ring-3 focus-visible:ring-ring/30"
                type="button"
              >
                ×
              </button>
            </Example>
            <Example
              label="Miniatura de anexo"
              source="Réplica de features/media/WorkFileThumbnail.tsx"
            >
              <a
                className="block size-20 rounded-2xl border border-transparent bg-secondary outline-none squircle focus-visible:border-ring/60 focus-visible:ring-3 focus-visible:ring-ring/30"
                href="#tokens-focus"
              >
                Arquivo
              </a>
            </Example>
            <Example
              label="Editor de texto (focus-within)"
              source="Réplica de routes/app/admin/partner/$slug.tsx"
            >
              <div className="min-h-25 w-72 overflow-hidden rounded-2xl border border-transparent bg-input text-base transition-[color,box-shadow] squircle focus-within:border-ring/60 focus-within:ring-3 focus-within:ring-ring/30 md:text-sm">
                <textarea
                  aria-label="Réplica do editor admin"
                  className="h-full min-h-25 w-full resize-none bg-transparent p-3 outline-none"
                  placeholder="Clique ou Tab aqui"
                />
              </div>
            </Example>
            <Example
              label="Cartão de ação (focus-within)"
              source="Réplica de features/ActionItem.tsx"
            >
              <div className="w-72 rounded-2xl border-t border-action-top-border bg-card p-3 text-sm shadow-action ring ring-action-ring transition-[color,background-color,border-color,box-shadow,padding] duration-500 focus-within:outline-3 focus-within:outline-ring/30 hover:shadow-action-hover motion-reduce:transition-none">
                <input
                  aria-label="Réplica do cartão de ação"
                  className="w-full bg-transparent outline-none"
                  placeholder="Clique ou Tab aqui"
                />
              </div>
            </Example>

            <p className="w-full text-xs font-semibold text-muted-foreground uppercase">
              Estados: destrutivo, sucesso e erro
            </p>

            <Example label="Botão destrutivo" source="Prism real">
              <PrismButton variant="destructive">Excluir</PrismButton>
            </Example>
            <Example label="Botão sucesso" source="Prism real">
              <PrismButton variant="success">Confirmar</PrismButton>
            </Example>
            <Example label="Input inválido" source="Prism real">
              <PrismInput
                aria-invalid
                aria-label="Input inválido"
                className="w-56"
                defaultValue="valor inválido"
              />
            </Example>
            <Example
              label="Campo de cor com erro"
              source="Exemplo de foco do seletor de cores"
            >
              <PrismInput
                aria-label="Campo de cor inválido"
                className="h-8 w-32 bg-destructive/5 font-mono tracking-wider text-destructive uppercase ring-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                defaultValue="#ZZZZZZ"
              />
            </Example>
            <Example
              label="Gatilho do rodapé (ComboboxTrigger ghost icon-lg)"
              source="App real (variant ghost, size icon-lg, anel padrão)"
            >
              <UComboboxTrigger
                aria-label="Exemplo de gatilho do rodapé"
                size="icon-lg"
                variant="ghost"
              >
                <CalendarIcon />
              </UComboboxTrigger>
            </Example>
          </FocusFamily>

          {/* 2. Anel por dentro (ring-inset) */}
          <FocusFamily
            id="focus-inset"
            title="Anel por dentro (ring-inset)"
            rule="Mesmo anel de 3px a 30%, desenhado para dentro. Usado onde um contêiner com overflow cortaria o anel externo. Regiões roláveis com filhos focáveis (Kanban, perfil, célula do dia) e o carrossel do Instagram deixaram de receber foco (03/11/2026); resta a coluna de campos do comparador de conflito, que não tem filhos focáveis e exige tabIndex no Safari."
            classes="outline-none focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:ring-inset"
            usedBy={[
              "features/action-drawer/conflict-comparison.tsx (coluna de campos, lista só de texto)",
            ]}
          >
            <Example
              label="Região rolável sem filhos focáveis"
              source="Réplica de features/action-drawer/conflict-comparison.tsx"
            >
              <div
                className="h-24 w-72 overflow-y-auto overscroll-contain px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:ring-inset"
                tabIndex={0}
              >
                Lista de campos alterados, somente texto. Role com o teclado
                depois de focar a região.
              </div>
            </Example>
          </FocusFamily>

          {/* 3. Foco por fundo */}
          <FocusFamily
            id="focus-background"
            title="Foco por fundo"
            rule="Exceção aprovada: o foco muda a cor de fundo (e a barra/linha do item), sem anel. Vale para itens de lista/menu/select/command/combobox (bg-secondary/50), abas, barra do RichTextEditor e botão Fechar da gaveta (bg-input)."
            classes="focus-visible:bg-secondary/50 | data-focused:bg-secondary/50 | data-[focus-visible]:bg-input | focus-visible:bg-input | focus:bg-destructive/10 | focus:bg-primary"
            usedBy={[
              "Prism: dropdown-menu, select, combobox, command (itens: secondary/50)",
              "Prism: tabs (underline e drawer: bg-input; drawer selecionada com foco também bg-input)",
              "Prism: time-field (segmento: bg-primary)",
              "features/RichTextEditor.tsx (barra: bg-input)",
              "features/action-drawer/ActionFormDrawer.tsx (botão Fechar: bg-input)",
              "layout/Header.tsx (Sair: bg-destructive/10)",
              "features/HelpPage.tsx e routes/app/notifications.tsx (linhas: bg-secondary/50)",
            ]}
          >
            <Example
              hint="Abra com Enter e use as setas"
              label="Menu: item e item destrutivo"
              source="Prism real"
            >
              <PrismMenu>
                <PrismButton variant="outline">Abrir Menu</PrismButton>
                <PrismMenuContent className="w-56" placement="bottom start">
                  <PrismMenuItem id="item-1">Item comum</PrismMenuItem>
                  <PrismMenuItem id="item-2">Outro item</PrismMenuItem>
                  <PrismMenuItem
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    id="sair"
                  >
                    Sair
                  </PrismMenuItem>
                </PrismMenuContent>
              </PrismMenu>
            </Example>

            <Example
              hint="Abra com Enter e use as setas"
              label="Item de select"
              source="Prism real"
            >
              <PrismSelect
                aria-label="Exemplo de select com itens"
                className="w-56"
                defaultSelectedKey="a"
              >
                <PrismSelectTrigger>
                  <PrismSelectValue />
                </PrismSelectTrigger>
                <PrismSelectContent>
                  <PrismSelectItem id="a">Opção A</PrismSelectItem>
                  <PrismSelectItem id="b">Opção B</PrismSelectItem>
                </PrismSelectContent>
              </PrismSelect>
            </Example>

            <Example
              hint="Digite e use as setas"
              label="Item de combobox"
              source="Prism real"
            >
              <PrismCombobox aria-label="Combobox com itens">
                <PrismComboboxInput placeholder="Buscar fruta..." />
                <PrismComboboxContent>
                  <PrismComboboxList>
                    <PrismComboboxItem id="maca">Maçã</PrismComboboxItem>
                    <PrismComboboxItem id="pera">Pera</PrismComboboxItem>
                  </PrismComboboxList>
                </PrismComboboxContent>
              </PrismCombobox>
            </Example>

            <Example
              hint="Digite e use as setas"
              label="Item de command"
              source="Prism real"
            >
              <PrismCommand className="w-64 border">
                <PrismCommandInput placeholder="Digite um comando..." />
                <PrismCommandList>
                  <PrismCommandItem id="cmd-1">Comando A</PrismCommandItem>
                  <PrismCommandItem id="cmd-2">Comando B</PrismCommandItem>
                </PrismCommandList>
              </PrismCommand>
            </Example>

            <Example label="Abas underline" source="Prism real">
              <PrismTabs defaultSelectedKey="a" variant="underline">
                <PrismTabList aria-label="Abas underline">
                  <PrismTab id="a">Primeira</PrismTab>
                  <PrismTab id="b">Segunda</PrismTab>
                </PrismTabList>
              </PrismTabs>
            </Example>

            <Example label="Abas drawer" source="Prism real">
              <PrismTabs defaultSelectedKey="a" variant="drawer">
                <PrismTabList aria-label="Abas drawer">
                  <PrismTab id="a">Primeira</PrismTab>
                  <PrismTab id="b">Segunda</PrismTab>
                </PrismTabList>
              </PrismTabs>
            </Example>

            <Example
              hint="Tab entra nos segmentos"
              label="Segmento de hora"
              source="Prism real"
            >
              <PrismTimeField aria-label="Exemplo de hora com segmentos" />
            </Example>

            <Example
              hint="Alt+Shift+F10 ou Tab até a barra"
              label="Barra do editor"
              source="App real"
            >
              <RichTextEditorFocusExample />
            </Example>

            <Example
              label="Botão Fechar da gaveta (bg-input)"
              source="Réplica de features/action-drawer/ActionFormDrawer.tsx"
            >
              <button
                aria-label="Réplica fechar"
                className="flex cursor-pointer items-center justify-center border-b px-3 py-3 text-sm font-medium outline-none focus-visible:bg-input sm:p-5"
                type="button"
              >
                Fechar
              </button>
            </Example>

            <Example
              label="Linha de ajuda / notificação (secondary/50)"
              source="Réplica de features/HelpPage.tsx"
            >
              <button
                className="w-56 rounded-md px-2 py-1.5 text-left text-sm outline-none squircle hover:bg-secondary/50 focus-visible:bg-secondary/50"
                type="button"
              >
                Linha de lista
              </button>
            </Example>
          </FocusFamily>

          {/* 4. Sem anel de propósito */}
          <FocusFamily
            id="focus-none"
            title="Sem anel de propósito"
            rule="Exceção aprovada: o próprio campo se apresenta como edição (fundo/cursor) ou o anel fica no contêiner. Foco discreto: sublinhado (links e gatilhos de texto), fundo ou nenhum."
            classes="ring-0 | focus:ring-0 focus:outline-none | outline-none hover:underline focus-visible:underline | sem classe de foco"
            usedBy={[
              "features/ActionItemTitleInput.tsx (título inline: fundo muda para bg-muted)",
              "features/ActionComments/CommentInput.tsx (comentário)",
              "features/home/HomeCalendarView.tsx e HomeTodayView.tsx (link do dia: sublinhado, sem anel)",
              "Prism: accordion (gatilho: hover:underline focus-visible:underline)",
              "Prism: button variante unstyled e input-group (o anel fica no grupo)",
            ]}
          >
            <Example
              label="Título inline"
              source="Réplica de features/ActionItemTitleInput.tsx"
            >
              <input
                aria-label="Réplica do título inline"
                className="w-56 rounded-md border-0 bg-muted/80 px-1.5 py-0.5 text-sm text-foreground ring-0 transition-colors outline-none squircle focus:bg-muted focus:ring-0 focus:outline-none"
                defaultValue="Título da ação"
              />
            </Example>
            <Example label="Comentário" source="Prism real">
              <PrismTextarea
                aria-label="Exemplo de comentário"
                className="min-h-20 w-56 rounded-none border-0 p-0 text-sm shadow-none focus:border-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                placeholder="Escreva um comentário"
              />
            </Example>
            <Example
              label="Link do dia (Home)"
              source="Réplica de features/home/HomeCalendarView.tsx"
            >
              <a
                className="block rounded-sm underline-offset-4 outline-none squircle hover:underline focus-visible:underline"
                href="#tokens-focus"
              >
                Link do dia
              </a>
            </Example>
            <Example label="Accordion" source="Prism real">
              <PrismAccordion className="w-72">
                <PrismAccordionItem id="a">
                  <PrismAccordionTrigger>
                    Gatilho de accordion
                  </PrismAccordionTrigger>
                  <PrismAccordionContent>Conteúdo.</PrismAccordionContent>
                </PrismAccordionItem>
              </PrismAccordion>
            </Example>
            <Example label="Botão unstyled" source="Prism real">
              <PrismButton variant="unstyled">Unstyled</PrismButton>
            </Example>
          </FocusFamily>

          {/* 5. Não é foco: estados de seleção */}
          <FocusFamily
            id="focus-selection"
            title="Não é foco: estados de seleção"
            rule="Anel primary indica item selecionado, arrastado ou escolhido. Não é indicador de foco do teclado; aparece mesmo sem foco. Mostrado aqui só para não ser confundido com foco."
            classes="ring-2 ring-primary (+ ring-offset-1) | bg-primary text-primary-foreground (dia alvo)"
            usedBy={[
              "features/ColorListEditor.tsx (item arrastado)",
              "features/ActionItem.tsx (selecionado / sprint)",
              "planning/PlanningCalendarView.tsx (dia alvo do arraste: bg-primary, não é anel)",
            ]}
          >
            <Example
              hint="Estado estático: não é foco"
              label="Cartão selecionado"
              source="Réplica de features/ActionItem.tsx"
            >
              <div className="w-56 rounded-2xl border bg-card p-3 text-sm ring-2 ring-primary">
                Ação selecionada
              </div>
            </Example>
            <Example
              hint="Estado estático: não é foco"
              label="Dia alvo do arraste (drop target)"
              source="Réplica de planning/PlanningCalendarView.tsx"
            >
              <div className="w-24 rounded-2xl bg-primary p-3 text-center text-sm text-primary-foreground squircle">
                12
              </div>
            </Example>
          </FocusFamily>

          {/* 6. Fallback global */}
          <FocusFamily
            id="focus-global"
            title="Fallback global (outline)"
            rule="Todo elemento que não define o próprio foco e não usa outline-none ganha um anel único: outline sólido de 3px, offset 0, na cor outline-ring a 30% (sem folga branca)."
            classes=":focus-visible { outline-style: solid; outline-width: 3px; outline-offset: 0 } + * { @apply outline-ring/30 } (app/tailwind.css)"
            usedBy={["app/tailwind.css (camada base, todos os elementos)"]}
          >
            <Example
              label="Elemento sem estilo de foco"
              source="Réplica de app/tailwind.css"
            >
              <button
                className="rounded-xl bg-secondary px-3 py-2 text-sm"
                type="button"
              >
                Sem estilo próprio
              </button>
            </Example>
          </FocusFamily>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
