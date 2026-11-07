# Contratos: banco, ambientes e implantação

> Movido de `AGENTS.md` em 07/11/2026 (ticket DOC-01), sem reescrever as regras. O `AGENTS.md` aponta para este documento. Ao mudar um contrato desta área, atualize-o aqui.

Leia antes de mexer em migrations, RPCs, permissões, triggers, tabelas, `bun run dev`, ambientes ou publicação.

## Ambientes e desenvolvimento local

- Imports relativos de valores nas APIs usam o caminho `.js` emitido pelo build de funções ESM. Confira o pacote com `bun run test:serverless`: Bun/Vite e testes com mocks não certificam a resolução pelo Node publicado.

- Por decisão do proprietário em27/10/2026, `bun run dev` inicia Vite via Node no modo `production`, em `http://127.0.0.1:5176`, e usa banco/contas reais de produção com `.env.production.local`. APP_ORIGIN não é requisito de acesso ao portal; as variáveis de publicação vivem no painel da Vercel (a cópia local `.env.vercel-production.local` foi removida em 05/11/2026). Staging fica fora do fluxo habitual, com projeto/arquivos históricos preservados. Launcher local verifica porta antes de iniciar o Vite, evitando que uma inicialização rejeitada invalide dependências do servidor ativo. Cache `.cache/vite` pertence ao checkout, sem compartilhamento pelo node_modules. `bun run test:dev-imports` verifica a regressão com Vite/HTTP e cache/porta temporários. Scripts explícitos de staging continuam destinados apenas a ele; verificações automáticas do app usam HTTP controlado, sem redirecionar fixtures de escrita para produção.

- Preview do app no painel do Claude: `.claude/launch.json` `uzzina-dev` executa `scripts/dev-server.cjs` (127.0.0.1:5176, banco de produção); a sessão de login fica por origem, então só leia (não salve, crie ou arraste dados reais) ao verificar.

## Banco

- `get_app_bootstrap(UUID)` retorna JSONB. A migration de compatibilidade remove somente o trigger legado conhecido que escrevia em profiles ausente; administração cria Auth antes de preencher people.

- Controle de concorrência usa um único trigger/versão UTC em updated_at timestamp sem timezone; preserve a data de execução e a compatibilidade com moddatetime legado.

- Funções de trigger `handle_actions_updated_at`, `handle_new_user` e `update_updated_at` têm `search_path` vazio e não permitem EXECUTE direto por PUBLIC/anon/authenticated. Preserve os triggers existentes; não reabra essas funções como RPCs. Defaults de aplicação pertencem a `postgres`; defaults de `supabase_admin` são gerenciados pela plataforma e não devem ser alterados por contorno de permissões.

- Contratos de autorização: datas comemorativas com escrita administrativa; notificações pelo destinatário ativo autorizado à ação, UPDATE apenas de read_at e menção/autoria/escopo verificados pelo servidor/banco.

- Feriados: `celebrations.is_holiday` é boolean obrigatório, default false; registros antigos não são classificados automaticamente. Campo aplicado em produção em01/11; relação `partner_holidays` e RPC de seleção estão somente preparadas, sem aplicação remota. Antes de continuar banco ou integrar a UI, consulte [estado e contrato de feriados](../audits/2026-11-01-holiday-schema.md).

- Instruções reutilizáveis de Planejamento pertencem à marca: `partners.planning_instructions text` opcional (`NULL` = ausente), sob RLS/grants atuais do parceiro. Campo aplicado em produção em01/11; integração de tipos/models/UI/gerador está pendente no [ticket08](../../.scratch/social-planning/issues/08-brand-planning-instructions.md). [Aplicação e verificação](../audits/2026-11-01-partner-planning-instructions.md).

- As migrations incrementam o catálogo existente; não constituem sozinhas um schema inicial completo. SQL versionado não confirma aplicação. Consulte CURRENT e o manifest do rollout antes de publicar ou alterar permissões.

- Catálogo de produção verificado em31/10/2026: PostgreSQL17.11; staging cloud também usa17. Registros anteriores de produção15 são históricos. `supabase/config.toml` major15 configura o ambiente local, não os serviços cloud. Bootstrap/manifest em supabase/staging são exclusivos do staging; versões remotas diferem dos nomes locais.
