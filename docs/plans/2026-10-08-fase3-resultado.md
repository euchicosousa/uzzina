# UZZINA — Fase 3: resultado para conferência

Data: 08/10/2026. Plano: [fase3-execucao](2026-10-08-fase3-execucao.md). Origem: seção 4 do [diagnóstico](2026-10-08-diagnostico-geral.md).
Estado: **tudo no checkout, sem commit, push, deploy ou SQL.** Nenhum dado de produção foi gravado.

## Verificação final

| Verificação | Resultado |
|---|---|
| `bun run typecheck` | passou |
| `bun run lint` (Biome, 292 arquivos) | passou |
| `bun test` | 290 testes / 881 assertions, 0 falhas (base: 267) |
| `bun run build` | passou; aviso conhecido de chunks > 500 kB permanece |
| `node scripts/check-serverless-runtime.cjs` | 7 handlers empacotados pelo builder Vercel e importados no Node nativo (antes: 4). Sem `--staging-caption`, não toca serviços externos |
| Navegador local (dados de produção, somente leitura) | perfil: painel de tema personalizado renderiza e a derivação claro→escuro funciona; "Nova Ação": gaveta abre como rascunho e fecha sem gravar; console sem erros |

Limites: o navegador usou o `.env` de produção sem gravar nada; isso não certifica o banco nem o deploy publicado. Os testes novos de comportamento controlam apenas a fronteira externa (Supabase/IA).

## O que foi feito, por item

| Item | Resultado | Arquivos principais |
|---|---|---|
| 3.1 | `HOOKS` (~2.080 linhas, sem uso) movido sem apagar | `app/data/hooks-library.ts` (novo) |
| 3.2 | `PALLETE` (~770 linhas) em módulo próprio; 5 importadores e `scripts/check-preferences-browser.cjs` ajustados. `CONSTANTS.ts`: 3.113 → 262 linhas | `app/lib/palettes.ts` |
| 3.3 | Um único `createActionDraft` + `resolveDraftPartners`; os 6 pontos (AppBar, ⌘⌥A em `app.tsx`, PartnersBoard, CategoriesBoard, PartnerCalendarBoard, HomeCalendarView) usam essas funções; o único cast fica dentro da factory | `app/utils/factory.ts`, `tests/action-draft.test.ts` |
| 3.4 | Gaveta detecta rascunho por ausência de `id` (antes: `created_at`) e usa `isDefaultActionColor` no lugar dos literais `#666666`/`#666` | `ActionFormDrawer.tsx`, `app/utils/uzzina-utils.ts` |
| 3.5 (parcial) | As 11 chamadas `.from()` de componentes/rotas migraram para `app/models/` (`actions.ts` novo; `partners.ts`, `people.ts` ampliados). Nenhum `.from("` resta em `components/`, `routes/`, `hooks/`, `contexts/` | `app/models/*`, Header, GlobalSearchCommand, ObservationsTab, profile, `admin/partners`, `admin/partner/$slug`, `admin/user/$userId` |
| 3.6 | `helpers.tsx` → `app/utils/index.ts` (barrel `~/utils`); `uzzina-utils.ts` → `app/utils/`; 35 importadores ajustados. `cn` permanece em `~/lib/utils` (exigência do AGENTS) | `app/utils/*` |
| 3.7 (parcial) | Gaveta: lógica de IA extraída em `useActionAI` (891 → 766 linhas). Perfil: 8 estados + 8 handlers + 8 inputs ocultos viraram um módulo puro e um componente (970 → 477 linhas). `useAppTheme`: `applyPaletteVars` extraído (509 → 341 linhas) | `useActionAI.ts`, `app/lib/custom-theme.ts`, `profile/CustomThemePanel.tsx`, `app/lib/palette-vars.ts` |
| 3.8 | `server/supabase-admin.ts` (`getServiceConfig`, `createServiceClient`) e `server/auth.ts` (`extractBearerToken`) usados por `client-accounts`, `review-links`, `review`, `dash-data`, `dash-auth`, `dash-action`. Mensagens e status HTTP de cada handler preservados | `server/*`, `api/*`, `tests/server-helpers.test.ts`, `scripts/check-serverless-runtime.cjs` |
| 3.9 | **Não aplicado** (ver divergências) | — |
| 3.10 | Análise sem alteração de código | ver abaixo |

## Divergências em relação ao diagnóstico (o Opus deve conferir)

1. **3.9 — plugins prettier mantidos.** O diagnóstico diz que o projeto usa Biome, mas `.vscode/settings.json` define o Prettier como formatador padrão com `prettier.config.js` carregando `prettier-plugin-tailwindcss` e `prettier-plugin-jsx-attr-sort`. Remover quebraria a ordenação de classes no editor. Pacote `prettier` não é dependência do projeto (vem da extensão). `@tiptap/extension-link` e `extension-bubble-menu` mantidos: `starter-kit` depende do link e `RichTextEditor` importa `@tiptap/react/menus` (BubbleMenu). Decisão do proprietário: manter ou migrar a formatação para Biome.
2. **3.5 — `supabase.queries.ts` / `supabase.mutations.ts` não foram movidos.** São a camada de cliente com sessão e conflito (`ActionConflictError`, bulk, duplicação), ligada a 3 testes, 2 scripts e ~20 importadores; mover não remove duplicação real e arrisca o contrato de salvamento. Duplicação residual conhecida: `fetchPartnerBySlug`/`fetchPeople` (queries) × `getPartnerBySlug`/`getPersonByUserId` (models). `profile.tsx` ainda chama `supabase.rpc("update_my_preferences")` direto (RPC, não `.from()`).
3. **3.7 — `admin/partner/$slug.tsx` (603 linhas) não foi dividido**: é majoritariamente JSX de formulário com auto-save acoplado; sem divisão limpa que dispense mudar comportamento. Fica para tarefa própria.
4. **3.10 — sem alteração.** Medição por sourcemap (descartada): chunk `index` = 944 kB, dominado por react-aria (~1.070 kB de fonte), react-dom (~520), react-stately (~340), app (~340), react-aria-components (~300) e zod (~265, usado por `ai-contract`, `validation`, `dash`/leads/partner). O editor (`RichTextEditor`, 504 kB) **já é carregado sob demanda** (`lazy` em `EssentialsTab` e no admin) e a gaveta também. Nenhum ganho seguro e pequeno; reduzir exigiria dividir por rota o que depende de react-aria.

## Mudanças de comportamento intencionais ou colaterais

- Gaveta: rascunho com `created_at` preenchido e sem `id` agora recebe parceiro do filtro/cor do parceiro (antes era tratado como ação existente). Teste novo falha com a regra antiga.
- `isDefaultActionColor` normaliza a cor; um valor inválido também é tratado como padrão (antes só `#666666`/`#666`/vazio).
- `getAllPartners` agora ordena por `title` (a tela de admin já ordenava; nenhum outro uso).
- Perfil: os 8 `<input type="hidden" name="custom_*">` foram removidos; nada os lia (o envio usa o estado). Salvar continua gravando `customTheme` apenas quando o índice é −1 e as 8 cores estão preenchidas.

## Testes novos e honestidade sobre "falhar antes"

- Falhou antes e passou depois contra o código real: regra de rascunho por `id` (`tests/drawer-component.test.tsx`); módulos de `custom-theme` (falhou por módulo ausente, depois passou).
- Extrações sem mudança de comportamento (testes escritos depois, passam antes e depois por construção): `tests/action-draft.test.ts` (`createActionDraft`, `resolveDraftPartners`, `isDefaultActionColor`), `tests/action-ai.test.tsx` (hook real, só `callAI` controlado), `tests/palette-vars.test.ts` (DOM real), `tests/server-helpers.test.ts`.

## Observações fora do escopo (não alteradas)

- Em "Nova Ação" a gaveta mostra "Criada há cerca de 3 horas" num rascunho recém-aberto: o carimbo local `format(new Date(), "yyyy-MM-dd HH:mm:ss")` é interpretado como UTC na exibição (fuso −3). Já ocorria antes (carimbo existente na gaveta). Candidato a correção própria.
- Foi aberta uma gaveta de rascunho no app local contra produção; nada foi salvo.

## Pendências e arquivos de documentação

- AGENTS atualizado (estrutura, rascunho de ação, `.from()` em models, helpers de servidor). KI de arquitetura (`~/.gemini/.../architecture.md`) recebeu as linhas de `lib/`, `utils/` e `data/`. Galeria `/ui`: nenhum componente Prism/Uzzina novo (`CustomThemePanel` é de feature).
- Para o Opus: conferir (a) se o diff de `api/*.ts` mantém mensagens/códigos HTTP, (b) se a lista de `.from()` residual está de fato vazia fora de `app/models` e `lib/supabase.*`, (c) a decisão 3.9, (d) se vale tarefa para 3.7 restante e para o item "Criada há …".
- Nada foi commitado. O checkout já tinha `CURRENT.md` modificado, `.claude/` e o diagnóstico não rastreados antes desta fase; as correções de imports `.js` da Fase 1 estão no commit `2cc7c45`.
