# 28 — `/ui`: seção "UAvatarSelector"

**Resumo:** Demonstra seleção por avatares, presets, subtítulo e limite mínimo de seleção.

**Commit de referência:** `d7efe5f` — entrega versionada no histórico local.

**Status:** Concluído (100%) — aceite registrado no índice da série em 04/11/2026.
Escopo: criar na aba Componentes Uzzina a seção do `UAvatarSelector` com playground. **Não altere nenhum componente do app.**

## Contexto (verificado em 03/11)

- `app/components/uzzina/UAvatarSelector.tsx`: `UAvatarSelector({ options, initialSelectedIds = [], name, onChange, minSelected })`. Grade responsiva (`grid-cols-2` → `lg:grid-cols-5`) de botões com `UAvatar size="lg"`, título e subtítulo; selecionado ganha `bg-action` e `aria-pressed`. Estado interno (lê `initialSelectedIds` só na montagem). Ao tentar ficar abaixo de `minSelected`, mostra `toast.warning` (o `PrismToaster` está montado em `app/routes/__root.tsx`). Cria `<input type="hidden" name={name}>` para formulários.
- `AvatarSelectorOption`: `{ id, fallback, image?, backgroundColor?, color?, title, subtitle? }` (exportado do mesmo arquivo).
- Usado em 2 arquivos (cadastros de administração).

## Arquivos a tocar (somente estes)

1. CRIAR `app/components/ui-sections/UzzinaAvatarSelectorSection.tsx` com `export function UzzinaAvatarSelectorSection()`.
2. EDITAR `index.ts`: export ao final.
3. EDITAR `app/routes/ui.tsx`: import; item `{ id: "uzzina-avatar-selector", label: "UAvatarSelector", section: "uzzina", keywords: ["avatar", "selecao", "pessoas", "parceiros", "grade"] }`; render. **Posição**: ordem alfabética do `label` na aba Uzzina (regra do 18, lote 4; lista final no ticket 21).
4. Este ticket (relatório).

## Dados

8 opções locais (`AvatarSelectorOption[]`), sem imagem: `alfa` "Alfa Odontologia" `AO` `#2563eb`; `beta` "Beta Studio" `BS` `#7c3aed`; `gama` "Gama Clínica" `GC` `#059669`; `delta` "Delta Foods" `DF` `#ea580c`; `epsilon` "Épsilon Moda" `EM` `#db2777`; `zeta` "Zeta Tech" `ZT` `#0f172a`; `eta` "Eta Café" `EC` `#a16207`; `teta` "Teta Saúde" `TS` `#0891b2`. Todas com `color: "#ffffff"` e `subtitle: "marketing"`.

## Estrutura

`<div id="uzzina-avatar-selector">` > `GallerySection` > header `title="UAvatarSelector"`, `description="Grade de seleção múltipla por avatar, ligada a formulário por inputs ocultos."` > `GallerySectionContent className="grid gap-12"` > `<GalleryItem label="UAvatarSelector"><AvatarSelectorPlayground /></GalleryItem>`.

## `AvatarSelectorPlayground`

| `label`               | `prop`               | Controle | Opções / faixa                             | Padrão |
| --------------------- | -------------------- | -------- | ------------------------------------------ | ------ |
| Selecionados iniciais | `initialSelectedIds` | Radio    | `none` "Nenhum", `one` "Um", `all` "Todos" | `one`  |
| Subtítulo             | `subtitle`           | Boolean  | desligado remove `subtitle` das opções     | `true` |
| Quantidade de opções  | `options`            | Number   | 2–8                                        | `5`    |
| Mínimo selecionado    | `minSelected`        | Number   | 0–2 (0 = `undefined`)                      | `0`    |

- Remonta por ``key={`${count}-${preset}-${minSelected}-${withSubtitle}`}`` (estado interno do componente).
- `name="gallery-avatar-selector"`; `onChange` grava os ids em estado local; `caption`: `` `Selecionados: ${ids.join(", ") || "nenhum"}` `` (antes da primeira mudança, os iniciais).
- Prévia `w-full`, `previewClassName="items-start"`.

## Verificação

1. Prettier e `tsc` limpos.
2. `/ui` > Componentes Uzzina > UAvatarSelector, claro e escuro: clicar seleciona/desseleciona; com mínimo 1 e um selecionado, tentar desmarcar mostra o aviso (toast) e mantém; a grade quebra colunas por largura.
3. 375px: 2 colunas, sem rolagem horizontal. Sem teste novo.

## Critérios de aceite

1. Só os arquivos listados mudam; controles como na tabela; sem caixas da galeria.
2. Sem `any`, `!`, `as` (exceto `as const`); prettier e `tsc` limpos.

## Relatório do executor

- Arquivos: `app/components/ui-sections/UzzinaAvatarSelectorSection.tsx`, `app/components/ui-sections/index.ts`, `app/routes/ui.tsx`.
- Prettier / `tsc`: 0 erros, Biome clean.
- Navegador: seleção e desseleção funcionam com feedback via toast e remount por chave de playground.
- Pendências: nenhuma.


## Revisão independente — 04/11/2026

Entrega encontrada e montagem básica conferida. Pendência de Prettier. [Parecer e limites](../../../docs/audits/2026-11-04-ui-tickets-25-34-review.md).

## Ajustes após revisão — 04/11/2026

Prettier corrigido; lint e tipagem conferidos. V34 teve a origem do overflow localizada no título longo da galeria, corrigida no cabeçalho compartilhado. Ensaio Chromium em 375/1400px, claro/escuro, sem erros/rede externa. Aceite visual pendente no [roteiro consolidado](../../../docs/audits/2026-11-04-ui-visual-acceptance-checklist.md).
