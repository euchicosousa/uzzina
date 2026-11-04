# 27 — `/ui`: seção "UPreferenceSwitch"

Status: A fazer — executor: Gemini. **Depende da aprovação do 17** (usa `PropsPlayground`).
Escopo: criar na aba Componentes Uzzina a seção do `UPreferenceSwitch` com playground. **Não altere nenhum componente do app.**

## Contexto (verificado em 03/11)

- `app/components/uzzina/UPreferenceSwitch.tsx`: `UPreferenceSwitch({ id, label, description, checked, onCheckedChange, className })`. Linha com rótulo (`PrismLabel`), descrição e um `PrismToggle` `outline` `sm` com texto "Ativo"/"Inativo".
- **Atenção (registrar no relatório, não corrigir):** o componente desenha uma caixa própria (`rounded-2xl border p-4`, `bg-card/25` ou `bg-primary/5`), o que conflita com a regra de superfícies do AGENTS.md. A seção mostra o componente como ele é; a decisão fica com o proprietário.
- Usado em 1 arquivo do app.

## Arquivos a tocar (somente estes)

1. CRIAR `app/components/ui-sections/UzzinaPreferenceSwitchSection.tsx` com `export function UzzinaPreferenceSwitchSection()`.
2. EDITAR `index.ts`: export ao final.
3. EDITAR `app/routes/ui.tsx`: import; item `{ id: "uzzina-preference-switch", label: "UPreferenceSwitch", section: "uzzina", keywords: ["preferencia", "switch", "alternar", "ativo", "inativo"] }`; render. **Posição**: ordem alfabética do `label` na aba Uzzina (regra do 18, lote 4; lista final no ticket 21).
4. Este ticket (relatório).

## Estrutura

`<div id="uzzina-preference-switch">` > `GallerySection` > header `title="UPreferenceSwitch"`, `description="Linha de preferência com rótulo, descrição e alternador Ativo/Inativo."` > `GallerySectionContent className="grid gap-12"` > `<GalleryItem label="UPreferenceSwitch"><PreferenceSwitchPlayground /></GalleryItem>`.

## `PreferenceSwitchPlayground`

| `label`   | `prop`        | Controle | Padrão                                  |
| --------- | ------------- | -------- | --------------------------------------- |
| Ativo     | `checked`     | Boolean  | `false`                                 |
| Rótulo    | `label`       | Text     | `"Notificações por e-mail"`             |
| Descrição | `description` | Text     | `"Receber um resumo diário das ações."` |

Prévia em `w-full max-w-md`: `<UPreferenceSwitch checked={checked} description={description} id={id} label={label} onCheckedChange={setChecked} />` com `id = useId()`.

## Verificação

1. Prettier e `tsc` limpos.
2. `/ui` > Componentes Uzzina > UPreferenceSwitch, claro e escuro: alternar pelo componente e pelo controle mantém os dois em sincronia; textos longos quebram sem estourar.
3. 375px sem rolagem horizontal. Sem teste novo.

## Critérios de aceite

1. Só os arquivos listados mudam; controles como na tabela; nenhuma caixa adicional da galeria.
2. Sem `any`, `!`, `as` (exceto `as const`); prettier e `tsc` limpos.
3. Relatório registra o conflito da caixa própria com a regra de superfícies.

## Relatório do executor

- Arquivos:
- Prettier / `tsc`:
- Navegador:
- Conflito com a regra de superfícies (observação):
