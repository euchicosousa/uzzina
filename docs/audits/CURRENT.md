# UZZINA — estado atual

Atualizado em10/10/2026. Contratos: [AGENTS](../../AGENTS.md). Operação: [README](../../README.md). Ideias futuras: [TODO](../../TODO.md), sem implementação automática.

## Pendências reais

Nenhuma pendência operacional desta rodada. Ideias futuras permanecem no TODO/docs/plans e dependem de uma nova decisão de escopo.

## Encerrados e decisões

- Uso do site, telefone, cores do cabeçalho e zoom/gaveta aprovados pelo proprietário. Teste físico do zoom realizado no aplicativo local pelo endereço de rede do Mac, com o ajuste de16px. Não há reorganização da gaveta solicitada.
- PostgreSQL de produção atualizado pelo proprietário e confirmado por consulta independente em10/10 às15:30UTC:17.11, mesma versão do staging. RLS, ausência de grants anônimos de tabela, policy de ações e proteções/triggers de timestamp preservados. Conferência de catálogo não equivale a testar todos os fluxos após upgrade.
- Proteção contra senhas vazadas retirada das pendências por decisão do proprietário: plano gratuito, recurso exige Pro ou superior. Configuração permanece desativada; nenhuma contratação feita.
- Defaults de supabase_admin retirados das pendências operacionais: prevenção opcional para objetos futuros, sem exposição atual identificada nas tabelas da aplicação. Nenhuma alteração nesse papel autorizada ou executada.
- Staging: correção de triggers aplicada, remoto `20261010143013`, quatro chamadas diretas recusadas, triggers preservados; Auth legado ausente, sem recriação. Produção: correções de policy de ações e triggers aplicadas em09/10. Vínculo Vercel, IA/portal e cores resolvidos. KI externo de banco atualizado.
- Limpeza: página técnica de teste, seus arquivos HTML/TSX e script removidos a pedido do proprietário. Relatório mobile condensado na revisão existente; correção e evidências de banco preservadas. Nenhum arquivo de ambiente, backup ou migration removido.

## Verificação e limites

Correção publicada pelo commit `808912b`: Vercel confirmou Ready no deploy `dpl_FwJdZxd3a8sTSnu79UMAkWagpheB`, vinculado a `uzzina.cnvt.com.br`. No site publicado, o campo pequeno da galeria /ui foi conferido com16px no viewport390px e14px em1280px; isso verifica o CSS publicado em Chromium, enquanto o reteste físico anterior foi local.

311 testes/945 assertions, format/lint/typecheck/build e7 verificações serverless passaram após limpeza. Teste de tipografia reproduziu14px antes e16px depois no celular; desktop preservado. Aviso conhecido de chunks permanece.

Produção não possui histórico de migrations; não executar db push/repair/reset cegamente. Objetos atuais da aplicação pertencem a postgres, com RLS/permissões restritas. Backups privados permanecem em Documents/UZZINA-backups; ensaio de dados públicos não equivale a restore integral de Auth/mídia.

## Referências

- [Release de produção](../../supabase/rollouts/uzzina-release-manifest.json) e [correção de ações](../../supabase/rollouts/action-read-fix-manifest.json).
- [Segurança, confirmação do upgrade e tipografia mobile](2026-10-09-production-policy-and-security.md).
- [Evidência de produção, incluindo pós-upgrade](../../supabase/rollouts/trigger-function-hardening-production-verification.json).
- [Manifest de staging](../../supabase/staging/applied-manifest.json) e [verificação de triggers](../../supabase/staging/trigger-function-hardening-verification.json).
- KI externo: `/Users/euchicosousa/.gemini/antigravity-ide/knowledge/uzzina-database/artifacts/database.md`.
