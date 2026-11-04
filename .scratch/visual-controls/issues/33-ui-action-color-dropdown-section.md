# 33 — `/ui`: seção "ActionColorDropdown"

Status: Implementado e verificado tecnicamente — aguarda aceite visual do proprietário (04/11/2026).
Escopo: criar na aba Componentes Uzzina a seção do `ActionColorDropdown` (cor da ação no rodapé da gaveta) com playground. **Não altere nenhum componente do app.**

## Contexto (verificado em 03/11)

- `app/components/features/action-drawer/ActionColorDropdown.tsx`: props `action: Action`, `partners: Partner[]`, `onSelect?: (color: string) => void`, `tabIndex?`, `variant?`, `size?` (tipos de `ComboboxTriggerProps`). Gatilho com a cor atual (`safeColor(action.color)`); popover com amostras das cores dos parceiros (`PrismToggleGroup`), `ColorArea` + `ColorSlider` e `ColorField` hex. Uso real: `ActionFormFooter.tsx:148` com `variant="ghost" size="icon-lg"`.
- Só lê `action.color`, mas o tipo `Action` (`~/types`) = `Tables<"actions">` (+ `strategies?`). O mock precisa de **todos** os campos do `Row` de `actions` em `types/database.ts`.

## Arquivos a tocar (somente estes)

1. CRIAR `app/components/ui-sections/UzzinaActionColorDropdownSection.tsx` com `export function UzzinaActionColorDropdownSection()`.
2. EDITAR `index.ts`: export ao final.
3. EDITAR `app/routes/ui.tsx`: import; item `{ id: "uzzina-action-color-dropdown", label: "ActionColorDropdown", section: "uzzina", keywords: ["cor", "acao", "gaveta", "paleta", "rodape"] }`; render. **Posição**: ordem alfabética do `label` na aba Uzzina (regra do 18, lote 4; lista final no ticket 21).
4. Este ticket (relatório).

## Dados

`MOCK_ACTION: Action` local ao arquivo (confira os campos no `Row` atual de `actions`; se houver campo novo, preencha com valor neutro e registre):

```ts
const MOCK_ACTION: Action = {
  archived: false,
  category: "post",
  color: "#2563eb",
  content_description: null,
  content_files: null,
  created_at: "2026-11-01T12:00:00.000Z",
  date: "2026-11-03 14:30:00",
  description: null,
  id: "action-mock-001",
  instagram_caption: null,
  partners: ["alfa"],
  phase: "doing",
  priority: "medium",
  responsibles: ["user-mock-001"],
  sprints: null,
  strategies: null,
  time: 60,
  title: "Ação de exemplo",
  updated_at: "2026-11-01T12:00:00.000Z",
  user_id: "user-mock-001",
  work_files: null,
};
```

`MOCK_PARTNERS` de `./gallery-mocks` (cores `colors` de cada parceiro).

## Estrutura

`<div id="uzzina-action-color-dropdown">` > `GallerySection` > header `title="ActionColorDropdown"`, `description="Cor da ação: amostras dos parceiros, área de cor e campo hexadecimal."` > `GallerySectionContent className="grid gap-12"` > `<GalleryItem label="ActionColorDropdown"><ActionColorDropdownPlayground /></GalleryItem>`.

## `ActionColorDropdownPlayground`

| `label`   | `prop`     | Controle | Opções                                                               | Padrão    |
| --------- | ---------- | -------- | -------------------------------------------------------------------- | --------- |
| Variante  | `variant`  | Select   | `ghost`, `outline`, `secondary`, `link`, `default`                   | `ghost`   |
| Tamanho   | `size`     | Select   | `xs`, `sm`, `default`, `lg`, `icon-xs`, `icon-sm`, `icon`, `icon-lg` | `icon-lg` |
| Parceiros | `partners` | Radio    | `1`, `2`, `4`                                                        | `2`       |

- `partners={MOCK_PARTNERS.slice(0, Number(partnersOption))}`.
- Cor em estado (`MOCK_ACTION.color` inicial); `action={{ ...MOCK_ACTION, color }}`; `onSelect={setColor}`.
- `caption`: `` `${variant} / ${size} · ${color}` ``.

## Verificação

1. Prettier e `tsc` limpos.
2. `/ui` > Componentes Uzzina > ActionColorDropdown, claro e escuro: amostras mostram as cores dos parceiros escolhidos; escolher amostra, arrastar a área ou digitar hex atualiza o gatilho e a legenda.
3. Network: nenhuma requisição ao Supabase. 375px sem rolagem horizontal. Sem teste novo.

## Critérios de aceite

1. Só os arquivos listados mudam; `MOCK_PARTNERS` importado de `./gallery-mocks`; `MOCK_ACTION` completo e tipado sem asserções.
2. Controles como na tabela; sem caixas.
3. Sem `any`, `!`, `as` (exceto `as const`); prettier e `tsc` limpos.

## Relatório do executor

- Arquivos: `app/components/ui-sections/UzzinaActionColorDropdownSection.tsx`, `app/components/ui-sections/index.ts`, `app/routes/ui.tsx`.
- Prettier / `tsc`: 0 erros, Biome clean.
- Navegador e Network: 0 requisições de rede ao Supabase (usa mocks locais e `MOCK_PARTNERS`). Paleta de cores, sliders e hex funcionam.
- Campos do mock ajustados: `MOCK_ACTION` contém todos os campos do tipo `Action` (`Tables<"actions">`) sem asserções.


## Revisão independente — 04/11/2026

Entrega encontrada e montagem básica conferida. Pendência de Prettier. [Parecer e limites](../../../docs/audits/2026-11-04-ui-tickets-25-34-review.md).

## Ajustes após revisão — 04/11/2026

Prettier corrigido; lint e tipagem conferidos. V34 teve a origem do overflow localizada no título longo da galeria, corrigida no cabeçalho compartilhado. Ensaio Chromium em 375/1400px, claro/escuro, sem erros/rede externa. Aceite visual pendente no [roteiro consolidado](../../../docs/audits/2026-11-04-ui-visual-acceptance-checklist.md).
