# 13 — Comboboxes: variant/size do botão e conteúdo

**Resumo:** Unifica variantes e tamanhos dos comboboxes com o botão Prism.

**Commit de referência:** `b5b5f33` — entrega versionada no histórico local.

## Regra

- Comboboxes e `ComboboxTrigger` recebem `variant`/`size` do botão Prism; padrão `ghost` + `sm`. Sem variantes próprias.
- O conteúdo (avatar, ícone, marcador, amostra de cor) segue o ícone do botão: `xs` `size-3`; `sm` `size-4`; `default`/`lg` `size-5`.
- Sem `overflow-hidden`, cor ou tamanho avulsos no gatilho.

## Onde aparece

| Componente                   | Onde ver no app                                                                 | variant / size                          | Conteúdo atual                                                            | Estado                   |
| ---------------------------- | ------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------- | ------------------------ |
| `PartnersCombobox`           | Rodapé da gaveta de ação (abrir qualquer ação)                                  | `ghost` / `icon-lg` ou `lg`             | Avatares `md` (32px)                                                      | OK                       |
| `PartnersCombobox`           | Busca global (`⌘K`), rodapé: filtro de parceiros                                | `ghost` / `sm`                          | Avatares `xs` (16px)                                                      | OK                       |
| `PhaseCombobox`              | Rodapé da gaveta                                                                | `ghost` / `icon-lg`                     | `PhaseIcon` progress                                                      | OK                       |
| `PhaseCombobox` (multi)      | `/app/partner/$slug`, opções de visualização, filtro de fase                    | `ghost` / `sm` (padrão)                 | `FilterIcon` sem seleção; marcadores `size-4` (segue o botão) com seleção | OK                       |
| `CategoriesCombobox`         | Rodapé da gaveta                                                                | `ghost` / `icon-lg`                     | Ícone da categoria (herda do botão)                                       | OK                       |
| `CategoriesCombobox` (multi) | `/app/partner/$slug`, opções de visualização, filtro de categoria               | `ghost` / `sm`                          | Ícones das categorias (herdam do botão)                                   | OK                       |
| `ActionColorDropdown`        | Rodapé da gaveta (categorias de mídia social)                                   | `ghost` / `icon-lg`                     | Amostra `size-5`                                                          | OK                       |
| `SprintCombobox`             | Rodapé da gaveta (ação já salva)                                                | `ghost` / `icon-lg`                     | `ZapIcon` ou avatares `md` (32px)                                         | OK                       |
| `ResponsiblesCombobox`       | Gaveta, aba Essencial, linha de Responsáveis                                    | `link` / `sm`                           | Avatares `xs` (16px) + nomes                                              | OK                       |
| `/ui`                        | `#uzzina-categories-combobox`, `#uzzina-phase-combobox`, `#uzzina-view-options` | combinações ghost/link `sm` e `icon-lg` | Mesmos componentes acima                                                  | Acompanha os itens acima |

## Decisões

1. Avatares seguem o `size` do botão: `xs`/`sm`/`icon-xs`/`icon-sm` usam `UAvatar xs` (16px); `default`/`icon` usam `sm` (24px); `lg`/`icon-lg` usam `md` (32px). Vale para Parceiros, Sprint e Responsáveis (`getTriggerAvatarSize` em `ComboboxTrigger`).
2. Amostras de cor, marcadores e `PhaseIcon` seguem o ícone do botão: `xs` `size-3`, `sm` `size-4`, `default`/`lg` `size-5` (`getTriggerContentSizeClass`, `getTriggerPhaseIconSize`); sem `avatarClassName` nem `size-*` avulsos.
3. Gatilhos com avatar no início recebem `pl-2`/`pl-3`/`pl-4` (`xs`/`sm`/`default` e `lg`) via `getTriggerAvatarPadding`; `FilterIcon` do filtro de fase permanece.

## Status

Concluído (03/11).
