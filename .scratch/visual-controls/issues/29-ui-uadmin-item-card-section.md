# 29 — `/ui`: seção "UAdminItemCard"

Status: A fazer — executor: Gemini. **Depende da aprovação do 17** (usa `PropsPlayground`).
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

- Arquivos:
- Prettier / `tsc`:
- Navegador (incluindo foco):
- Pendências:
