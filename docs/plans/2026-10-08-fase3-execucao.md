# UZZINA — Fase 3: plano de execução

Data: 08/10/2026. Origem: seção 4 de [diagnostico-geral](2026-10-08-diagnostico-geral.md). Autorizado pelo proprietário (somente a Fase 3). Sem mudança de comportamento; nada de commit/push/deploy/SQL.

## Regras

- Uma etapa por vez; após cada uma: `bun run typecheck`, `bun run lint`, `bun test` (baseline: 267 testes passando). Build ao final e quando a etapa tocar `api/`.
- Quando a etapa tocar regra (3.3, 3.4, 3.8), escrever o teste antes e vê-lo falhar contra o código real.
- Preservar contratos do AGENTS: Sprint, agrupamentos, `done`/`finished`, coordenador de salvamento/conflitos, `resetQuerySession`.
- Atualizar AGENTS (estrutura/helpers) e CURRENT; registrar tudo em `2026-10-08-fase3-resultado.md` para conferência do Opus.

## Etapas (ordem de risco crescente)

| Etapa | Ação | Verificação específica |
|---|---|---|
| A. 3.1 | Mover `HOOKS` (sem uso) para `app/data/hooks-library.ts`, sem apagar o conteúdo | grep sem importadores; build |
| B. 3.2 | Mover `PALLETE` para `app/lib/palettes.ts`; atualizar importadores (Header, TokensColorsSection, useAppTheme, profile, script de preferências) | testes de preferências/tema |
| C. 3.9 | Remover plugins prettier sem uso e `prettier.config.js` se só os referenciar; verificar extensões Tiptap antes de qualquer remoção | `bun install`, lint, build |
| D. 3.3 + 3.4 | `createActionDraft` único em `app/utils/factory.ts` (tipado, único cast), `resolveDraftPartners` para a regra "parceiro da rota ou filtro único"; trocar os 6 pontos; gaveta passa a detectar rascunho por ausência de `id` e usa `DEFAULT_ACTION_COLOR` | testes novos de factory; testes da gaveta |
| E. 3.6 | Mover `uzzina-utils.ts` e o barrel `helpers.tsx` para `app/utils/`; `cn` permanece em `~/lib/utils` (exigência do AGENTS); atualizar importadores e AGENTS | typecheck, test:serverless |
| F. 3.5 | Mover as 11 chamadas `.from()` de componentes/rotas para `app/models/` (actions, partners, people); avaliar mover `supabase.queries/mutations` para models sem alterar chaves de cache | testes de cache/ações |
| G. 3.8 | `server/supabase-admin.ts` e `server/auth.ts` (imports `.js`) usados pelos handlers; manter respostas e códigos HTTP idênticos | `bun run test:serverless`, testes de API |
| H. 3.7 | Extrair `useActionAI` da gaveta; dividir `profile.tsx` por seção; avaliar `admin/partner/$slug.tsx` e `useAppTheme.ts` | testes da gaveta; typecheck |
| I. 3.10 | Medir o bundle (visualizer pontual, sem adicionar dependência permanente) e registrar causa; só aplicar lazy se for ganho claro e seguro | build |
| J. Fechamento | Suíte completa + build + `test:serverless`; atualizar AGENTS, CURRENT e criar o documento de resultado | — |

## Fora do escopo

Fases 1, 2 e 4; visual; qualquer SQL; deploy.
