# 29 — `/ui`: seção "UAdminItemCard"

**Resumo:** Demonstra o item administrativo com avatar, título, subtítulo e selo.

**Commit de referência:** `d7efe5f` — entrega versionada no histórico local.

**Status:** Concluído (100%) — aceite registrado no índice da série em 04/11/2026.
Escopo: criar na aba Componentes Uzzina a seção do `UAdminItemCard` com playground. **Não altere nenhum componente do app.**

## Contexto (verificado em 03/11)

- `app/components/uzzina/UAdminItemCard.tsx`: `UAdminItemCard({ to, image, fallback, title, subtitle, avatarBgColor, avatarColor, badge, className })`. É um `Link` do TanStack Router em formato de cartão de lista (`rounded-3xl border bg-action p-4`), com `UAvatar size="lg"`, título truncado, `badge` opcional e subtítulo. O formato de cartão é do próprio item de lista (não é moldura de formulário), então não conflita com a regra de superfícies.
- Usado em 3 arquivos (listas de administração).
- A rota `/ui` está dentro do router; use `to="/ui"` (link para a própria página, sem navegar para fora).

## Arquivos a tocar (somente estes)

1. CRIAR `app/components/ui-sections/UzzinaAdminItemCardSection.tsx` com `export function UzzinaAdminItemCardSection()`.
2. EDITAR `index.ts`: export ao final.
3. EDITAR `app/routes/ui.tsx`: import; item `{ id: "uzzina-admin-item-card", label: "UAdminItemCard", section: "uzzina", keywords: ["admin", "cartao", "lista", "item", "parceiro"] }`; render. **Posição**: ordem alfabética do `label` na aba Uzzina (regra do 18, lote 4; lista final no ticket 21).
4. Este ticket (relatório).

## Estrutura

`<div id="uzzina-admin-item-card">` > `GallerySection` > header `title="UAdminItemCard"`, `description="Item de lista da administração (parceiros, pessoas), com avatar, título, selo e subtítulo."` > `GallerySectionContent className="grid gap-12"` > `<GalleryItem label="UAdminItemCard"><AdminItemCardPlayground /></GalleryItem>`.

## `AdminItemCardPlayground`

| `label`         | `prop`                        | Controle | Opções / padrão                                                   | Padrão               |
| --------------- | ----------------------------- | -------- | ----------------------------------------------------------------- | -------------------- |
| Cores próprias  | `avatarBgColor`/`avatarColor` | Boolean  | ligado = `#2563eb` / `#ffffff`                                    | `true`               |
| Subtítulo       | `subtitle`                    | Boolean  | ligado = `"marketing · 3 pessoas"`                                | `true`               |
| Selo            | `badge`                       | Boolean  | ligado = `<PrismBadge variant="secondary">Arquivado</PrismBadge>` | `false`              |
| Título          | `title`                       | Text     | —                                                                 | `"Alfa Odontologia"` |
| Texto do avatar | `fallback`                    | Text     | —                                                                 | `"AO"`               |

Prévia em `w-full max-w-md`: `<UAdminItemCard to="/ui" … />` (sem `image`).

## Verificação

1. Prettier e `tsc` limpos (se o `to` tipado do router recusar `"/ui"`, registre o erro e use a rota tipada mais próxima sem `as`).
2. `/ui` > Componentes Uzzina > UAdminItemCard, claro e escuro: título longo trunca com reticências; selo à direita do título; foco por teclado visível (registre se não houver; não corrigir).
3. 375px sem rolagem horizontal. Sem teste novo.

## Critérios de aceite

1. Só os arquivos listados mudam; controles como na tabela.
2. Sem `any`, `!`, `as` (exceto `as const`); prettier e `tsc` limpos.

## Relatório do executor

- Arquivos: `app/components/ui-sections/UzzinaAdminItemCardSection.tsx`, `app/components/ui-sections/index.ts`, `app/routes/ui.tsx`.
- Prettier / `tsc`: 0 erros, Biome clean.
- Navegador (incluindo foco): truncamento de texto, avatar e selo funcionam sem quebras.
- Pendências: nenhuma.


## Revisão independente — 04/11/2026

Entrega encontrada e montagem básica conferida. Pendência de Prettier. [Parecer e limites](../../../docs/audits/2026-11-04-ui-tickets-25-34-review.md).

## Ajustes após revisão — 04/11/2026

Prettier corrigido; lint e tipagem conferidos. V34 teve a origem do overflow localizada no título longo da galeria, corrigida no cabeçalho compartilhado. Ensaio Chromium em 375/1400px, claro/escuro, sem erros/rede externa. Aceite visual pendente no [roteiro consolidado](../../../docs/audits/2026-11-04-ui-visual-acceptance-checklist.md).
