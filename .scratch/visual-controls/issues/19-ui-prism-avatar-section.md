# 19 — `/ui`: seção "Avatar" (`PrismAvatar`)

**Resumo:** Demonstra Avatar e AvatarGroup do Prism com imagem, fallback, selo e agrupamento.

**Commit de referência:** `d7efe5f` — entrega versionada no histórico local.

**Status:** Concluído (100%) — revisado e encerrado em 04/11/2026.
Escopo: criar a seção do `PrismAvatar` (família `PrismAvatar*`), que não existe no `/ui`, com playground de propriedades. **Não altere nenhum componente do app.**

## Contexto (verificado em 03/11)

- `app/components/prism/avatar.tsx`, exportado em `~/components/prism`: `PrismAvatar` (`size`: `sm` 24px, `default` 32px, `lg` 40px), `PrismAvatarImage` (`<img>`; esconde-se com `data-state="error"` e mostra o fallback), `PrismAvatarFallback`, `PrismAvatarBadge` (bolinha `bg-primary` no canto; ícone só em `default`/`lg`), `PrismAvatarGroup` (sobreposição `-space-x-2`), `PrismAvatarGroupCount` ("+N").
- No app, `PrismAvatar` é usado só por dentro de `UAvatar` (`app/components/uzzina/UAvatar.tsx`, seção Uzzina do ticket 18). Esta seção mostra o primitivo.
- Auxiliar: `app/components/ui-sections/PropsPlayground.tsx` (ticket 17): `PropsPlayground`, `PlaygroundSelect`, `PlaygroundRadio`, `PlaygroundBoolean`, `PlaygroundNumber`, `PlaygroundText`. Estado é do consumidor (`useState` por controle).

## Arquivos a tocar (somente estes)

1. CRIAR `app/components/ui-sections/AvatarSection.tsx` com `export function AvatarSection()`.
2. EDITAR `app/components/ui-sections/index.ts`: `export * from "./AvatarSection";` logo após `./AlertSection`.
3. EDITAR `app/routes/ui.tsx`:
   - Incluir `AvatarSection` no import de `~/components/ui-sections`.
   - `SIDEBAR_ITEMS`, grupo `components`, logo após `prism-alert`: `{ id: "prism-avatar", label: "Avatar", section: "components", keywords: ["avatar", "imagem", "foto", "grupo", "badge"] }` (sem `approved`).
   - Render no bloco de componentes, entre `<AlertSection />` e `<BadgeSection />`.
4. EDITAR `AGENTS.md` §5: na frase "as22 seções Prism seguem ordem alfabética", troque o número pela contagem real de itens `section: "components"` em `SIDEBAR_ITEMS` depois da mudança.
5. Este ticket (relatório).

Antes: `git status --short app/components/ui-sections/ app/routes/ui.tsx AGENTS.md` e preserve alterações alheias.

## Estrutura

```tsx
<div id="prism-avatar">
  <GallerySection>
    <GallerySectionHeader
      description="Avatar circular do Prism com imagem, fallback, selo e grupo. No app aparece por meio de UAvatar."
      title="Avatar"
    />
    <GallerySectionContent className="grid gap-12">
      <GalleryItem label="Avatar">
        <AvatarPlayground />
      </GalleryItem>
      <GalleryItem label="AvatarGroup">
        <AvatarGroupPlayground />
      </GalleryItem>
    </GallerySectionContent>
  </GallerySection>
</div>
```

## Dados

Imagem local, sem rede (o `dev` usa produção; não carregue URLs externas):

```ts
const AVATAR_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='#7c3aed'/><circle cx='32' cy='26' r='12' fill='#ffffff'/><rect x='14' y='42' width='36' height='22' rx='11' fill='#ffffff'/></svg>";
const AVATAR_IMAGE = `data:image/svg+xml,${encodeURIComponent(AVATAR_SVG)}`;
const BROKEN_IMAGE = "data:image/png;base64,invalid";
```

## `AvatarPlayground`

| `label` | `prop`                | Controle | Opções                                                     | Padrão    |
| ------- | --------------------- | -------- | ---------------------------------------------------------- | --------- |
| Tamanho | `size`                | Radio    | `sm`, `default`, `lg`                                      | `default` |
| Imagem  | `PrismAvatarImage`    | Radio    | `none` "Sem imagem", `valid` "Válida", `broken` "Quebrada" | `none`    |
| Selo    | `PrismAvatarBadge`    | Boolean  | —                                                          | `false`   |
| Texto   | `PrismAvatarFallback` | Text     | —                                                          | `"UZ"`    |

Prévia: `<PrismAvatar size={size}>` com `PrismAvatarImage alt="Avatar de exemplo" key={image} src={…}` quando `image !== "none"`, `<PrismAvatarFallback>{text}</PrismAvatarFallback>` e, se "Selo", `<PrismAvatarBadge><CheckIcon /></PrismAvatarBadge>`. `caption`: `` `${size} · ${SIZE_PX[size]}px` `` com `SIZE_PX = { sm: 24, default: 32, lg: 40 }`.

## `AvatarGroupPlayground`

| `label`                | `prop`                  | Controle | Faixa                 | Padrão    |
| ---------------------- | ----------------------- | -------- | --------------------- | --------- |
| Tamanho                | `size` (em cada avatar) | Radio    | `sm`, `default`, `lg` | `default` |
| Contador extra         | `PrismAvatarGroupCount` | Boolean  | mostra "+3"           | `true`    |
| Quantidade de avatares | —                       | Number   | 2–6                   | `4`       |

Fallbacks em ordem: `AO`, `BS`, `GC`, `DF`, `EL`, `FM`. `PrismAvatarGroupCount` com texto `+3`.

## Verificação

1. `bunx prettier --write` nos arquivos tocados; `bunx tsc --noEmit` sem erros novos.
2. `/ui` > Componentes de UI > Avatar (barra lateral entre Alert e Badge), claro e escuro: imagem válida aparece; "Quebrada" mostra o fallback; selo no canto; grupo sobrepõe e o contador acompanha o tamanho. Network sem requisições externas.
3. 375px sem rolagem horizontal da página. Sem teste novo.

## Critérios de aceite

1. Só os arquivos listados mudam; nenhum componente do app.
2. Controles, opções e padrões exatamente como nas tabelas; sem caixas em volta.
3. Sem `any`, `!`, `as` (exceto `as const`); prettier e `tsc` limpos.
4. Contagem de seções Prism atualizada no AGENTS.md.

## Relatório do executor

- Arquivos:
  - `app/components/ui-sections/AvatarSection.tsx` (criado com `AvatarPlayground` e `AvatarGroupPlayground`)
  - `app/components/ui-sections/index.ts` (export de `AvatarSection` adicionado após `AlertSection`)
  - `app/routes/ui.tsx` (import adicionado, `prism-avatar` inserido entre `prism-alert` e `prism-badge` no `SIDEBAR_ITEMS` e na renderização)
  - `AGENTS.md` (contagem de seções Prism atualizada para 24)
- Prettier / `tsc`:
  - Prettier: 100% formatado sem pendências.
  - `tsc --noEmit`: 0 erros.
- Navegador (claro, escuro, 375px):
  - Barra lateral com âncora `prism-avatar` funcionando entre Alert e Badge.
  - Imagem válida inline em SVG via data URL (sem chamadas de rede); opção "Quebrada" cai corretamente no fallback de texto.
  - Selo `PrismAvatarBadge` com ícone `CheckIcon`.
  - Grupo de avatares com sobreposição `-space-x-2` e contador `+3` dinâmico.
  - Totalmente responsivo em 375px sem rolagem horizontal indesejada.
- Pendências: Nenhuma.

## Encerramento após revisão independente — 04/11/2026

Pendências corrigidas por subagente e conferidas pelo coordenador. Prettier, Biome (zero erros/avisos) e typecheck aprovados. Ensaio controlado das seis seções no Chromium sem erros de página nem solicitações externas, em 375/1400px e temas claro/escuro. Evidências e limites em [revisão V19–V34](../../../docs/audits/2026-11-04-ui-tickets-19-34-review.md). Conclusão local, sem publicação.
