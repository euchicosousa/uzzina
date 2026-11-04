# 21 — `/ui`: seção "ComboboxTrigger"

Status: A fazer — executor: Gemini. **Depende da aprovação do 17** (usa `PropsPlayground`).
Escopo: criar na aba Componentes Uzzina a seção do `ComboboxTrigger` (gatilho comum a todos os comboboxes), que hoje só aparece dentro de outras seções. **Não altere nenhum componente do app.**

## Contexto (verificado em 03/11)

`app/components/features/ComboboxTrigger.tsx`:

- `ComboboxTrigger` (React Aria `Button` com `buttonVariants`): `variant` (padrão `ghost`), `size` (padrão `sm`), `disabled` (alias de `isDisabled`), `className`, `title`, `tabIndex`, `children`. Tamanhos `icon-*` viram `w-auto` com largura mínima (cabe mais de um avatar).
- Helpers exportados (use-os; não copie a lógica):
  - `getTriggerAvatarSize(size)` → `"xs"` (16px) para `xs`, `sm`, `icon-xs`, `icon-sm`; `"md"` (32px) para `lg`, `icon-lg`; `"sm"` (24px) para os demais.
  - `getTriggerContentSizeClass(size)` → `size-3` (`xs`), `size-4` (`sm`, `icon-sm`, `icon-xs`), `size-5` (demais).
  - `getTriggerAvatarPadding(size)` → `pl-2` (`xs`), `pl-3` (`sm`), `pl-4` (`default`, `lg`), `undefined` (ícone).
- `UAvatar` de `~/components/uzzina/UAvatar` (`size` `xs`/`sm`/`md`…, `fallback`, `backgroundColor`, `color`).
- Auxiliar: `PropsPlayground.tsx` (ticket 17).

## Arquivos a tocar (somente estes)

1. CRIAR `app/components/ui-sections/UzzinaComboboxTriggerSection.tsx` com `export function UzzinaComboboxTriggerSection()`.
2. EDITAR `index.ts`: acrescentar `export * from "./UzzinaComboboxTriggerSection";` ao final.
3. EDITAR `app/routes/ui.tsx`: import; item `{ id: "uzzina-combobox-trigger", label: "ComboboxTrigger", section: "uzzina", keywords: ["gatilho", "trigger", "combobox", "botao", "avatar"] }`; render.
   - **Posição**: aba Uzzina em ordem alfabética do `label` (sem acento, sem diferenciar maiúsculas; regra do ticket 18, lote 4). Insira o item e a seção na posição alfabética entre os existentes. Ordem final de referência: ActionColorDropdown, ActionDatePicker, CalendarToolbar, CategoriesCombobox, ColorListEditor, ComboboxTrigger, Icons, PartnerCelebrationsSelector, PartnersCombobox, PhaseCombobox, PhaseIcon, ResponsiblesCombobox, RichTextEditor, SprintCombobox, UAdminItemCard, UAvatar e UAvatarGroup, UAvatarSelector, ULoader, UPreferenceSwitch, UToggleInput, ViewOptionsComponent.
4. Este ticket (relatório).

## Estrutura

`<div id="uzzina-combobox-trigger">` > `GallerySection` > header `title="ComboboxTrigger"`, `description="Gatilho comum dos comboboxes: usa variante e tamanho do botão Prism; avatares, ícones e amostras seguem os helpers de tamanho."` > `GallerySectionContent className="grid gap-12"` > `<GalleryItem label="ComboboxTrigger"><ComboboxTriggerPlayground /></GalleryItem>`.

## `ComboboxTriggerPlayground`

| `label`      | `prop`     | Controle | Opções                                                                                                                                    | Padrão        |
| ------------ | ---------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Variante     | `variant`  | Select   | `ghost`, `outline`, `secondary`, `link`, `default`                                                                                        | `ghost`       |
| Tamanho      | `size`     | Select   | `xs`, `sm`, `default`, `lg`, `icon-xs`, `icon-sm`, `icon`, `icon-lg`                                                                      | `sm`          |
| Conteúdo     | `children` | Select   | `text` "Texto", `icon` "Ícone", `icon-text` "Ícone + texto", `avatar` "Avatar", `avatar-text` "Avatar + texto", `swatch` "Amostra de cor" | `avatar-text` |
| Desabilitado | `disabled` | Boolean  | —                                                                                                                                         | `false`       |
| Texto        | `children` | Text     | —                                                                                                                                         | `"Parceiros"` |

Prévia (`ComboboxTrigger` com `aria-label={text}`, `onPress` vazio):

- Ícone: `<TagIcon className={getTriggerContentSizeClass(size)} />`.
- Avatar: `<UAvatar backgroundColor="#2563eb" color="#ffffff" fallback="AO" size={getTriggerAvatarSize(size)} />`; com texto, passe `className={getTriggerAvatarPadding(size)}` ao gatilho.
- Amostra: `<span className={cn("rounded-full", getTriggerContentSizeClass(size))} style={{ backgroundColor: "#7c3aed" }} />`.
- Texto: `<span>{text}</span>`. Em tamanhos `icon-*` não renderize o texto (só a parte gráfica; `text` sozinho vira o ícone).

`caption`: `` `${variant} / ${size} · avatar ${AVATAR_PX[getTriggerAvatarSize(size)]}px · conteúdo ${CONTENT_PX}px · ${getTriggerAvatarPadding(size) ?? "sem padding extra"}` `` com `AVATAR_PX = { xs: 16, sm: 24, md: 32 } as const` e `CONTENT_PX` derivado por `switch` em `getTriggerContentSizeClass(size)` (`size-3` 12, `size-4` 16, `size-5` 20).

## Verificação

1. Prettier e `tsc` limpos.
2. `/ui` > Componentes Uzzina > ComboboxTrigger, claro e escuro: cada combinação renderiza; legenda bate com o inspetor (largura real do avatar e do conteúdo) em `sm` e `lg`; foco com o anel padrão do botão.
3. 375px sem rolagem horizontal da página. Sem teste novo.

## Critérios de aceite

1. Só os arquivos listados mudam; helpers reais importados (nenhuma cópia do mapeamento).
2. Controles exatamente como na tabela; sem caixas.
3. Sem `any`, `!`, `as` (exceto `as const`); prettier e `tsc` limpos.

## Relatório do executor

- Arquivos:
- Prettier / `tsc`:
- Navegador e conferência de tamanhos no inspetor:
- Pendências:
