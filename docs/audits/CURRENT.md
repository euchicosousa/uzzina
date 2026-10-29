# UZZINA — estado atual

Atualizado em 29/10/2026. Contratos: [AGENTS](../../AGENTS.md). Operação: [README](../../README.md). Ideias futuras: [TODO](../../TODO.md), sem implementação automática.

## Publicação confirmada em29/10

Push realizado pelo proprietário. Git confirma `main` e `origin/main` em `c1d18b86dd4074342de6bf371588e57c0bdd9fac`. Antes desta atualização documental, checkout limpo e sem commits pendentes de envio.

Vercel confirmou o mesmo SHA no deploy `dpl_99LPVHqzaaqxJ4m5UQ4LF4JSa8Mg`: estado READY, target production e alias `uzzina.cnvt.com.br`. O domínio `/app` respondeu HTTP200. Isso confirma publicação/resposta pública; uso autenticado e conferência visual não foram repetidos.

| Entrega | Estado vigente |
|---|---|
| Duas ações: abas/lado a lado | Implementada, aprovada e incluída na versão publicada. |
| Busca: filtros, arquivadas, criar ação e comandos | Implementada, aprovada e incluída na versão publicada. |
| Falha de carregamento e AppBar | Correções aprovadas e incluídas na versão publicada. |
| Página Hoje e Minha Conta | Layout/rolagem aprovados e incluídos na versão publicada. |
| Visualização inicial de Hoje | Frontend e SQL publicados; aprovado pelo proprietário em29/10. Concluído. |
| Notificações | Publicada e aprovada pelo proprietário em29/10. Ticket encerrado; eventual necessidade futura terá novo ticket. |
| Ajuda | Publicada e aprovada pelo proprietário em29/10. Concluída. |
| Modal de datas e revisão do calendário | Aprovados e publicados. |
| Limpeza | Dez capturas removidas; roteiros salvam novas capturas fora do projeto; documentação consolidada e publicada. |

A migration de `defaultTodayView` foi aplicada à produção em28/10, versão remota `20261028205047`, com catálogo/validação/permissões verificados: [manifest](../../supabase/rollouts/today-view-preference-manifest.json) e [evidência](../../supabase/rollouts/today-view-preference-production-verification.json). Publicação do frontend confirmada agora, sem reaplicar SQL.

Verificação anterior ao push:528 testes, format/lint/typecheck/build,7 verificações serverless e regressão do launcher aprovados. Limpeza dos roteiros verificada por sintaxe Node, format/lint/typecheck e referências. Operação e limites: [preparação e confirmação do deploy](2026-10-29-deploy-preparation.md).

## Limpeza revisada em29/10

Removidas dez capturas temporárias de Minha Conta/Hoje e do modal de datas; referências aos PNGs retiradas dos relatórios, mantendo o resultado das verificações. Três roteiros de navegador agora geram capturas em diretórios temporários do sistema, fora do projeto; `.gitignore` impede versionar novamente pastas de evidências descartáveis. Testes reutilizáveis/fixtures, favicons do produto, envs e migrations preservados. Detalhes e verificações no relatório de preparação.

## Commit local em29/10

Proprietário solicitou versionar todas as alterações restantes: limpeza das capturas, saída temporária dos roteiros, consolidação documental e proposta existente de Planejamento. A proposta continua em revisão, sem autorizar implementação. Format/lint/typecheck, sintaxe dos roteiros, referências locais e diff aprovados na revisão anterior, sem alterações funcionais posteriores. Sem push, deploy ou SQL nesta rodada.

## Aceite do proprietário em29/10

Visualização inicial de Hoje, Ajuda e Notificações aprovadas explicitamente. As três entregas já estão em produção no deploy Ready acima. Tickets encerrados, sem exigir acompanhamento adicional para conclusão. Notificações foi aceita no estado atual; o proprietário abrirá outro ticket se surgir necessidade. Este aceite não equivale a certificar cenários técnicos não executados. Publicação desta atualização documental autorizada, sem mudança funcional ou SQL.

## Pendências reais

- Qualidade editorial do novo prompt de estratégia: geração real após a alteração ainda sem avaliação registrada.
- Validação física em Safari/telefone, teclado virtual/zoom e levantamento geral de foco/teclado continuam futuros. Os ajustes específicos da gaveta/toolbar já foram resolvidos.

## Trabalho futuro, sem implementação autorizada

- Planejamento de redes sociais: [proposta de sete tickets](../plans/social-planning-ticket-breakdown.md), preparada em 28/10, aguarda revisão da divisão antes dos arquivos individuais. Inclui geração temática persistida, revisão, período/frequência, formatos, comemorações opt-in, calendário e finalização em ações. Contexto/Tom existentes; arquivos/chat fora do escopo. Nova geração pede quantidade integral; retry da finalização requer vínculo persistente para impedir duplicação.
- Acessos do Planejamento definidos pelo proprietário: busca global e menu superior para toda a equipe; botão junto ao nome do parceiro leva com parceiro na URL; sem parceiro, seletor do escopo disponível. Escopo, recarga, Voltar e descarte de respostas antigas constam da proposta; não implementados.
- [Uso de IA](../../.scratch/ai-usage/issues/01-ai-usage-visibility.md): definir agência, período/fuso, referência/conversão, permissões, modelos e localização. Preservar quota técnica; não expor custos do provedor.
- [Foco/teclado nas demais telas](../../.scratch/keyboard-focus/issues/03-keyboard-stabilization.md): escopo futuro.
- Melhorias decorrentes do [diagnóstico de atualização/duplicação](2026-10-17-action-update-duplicate-diagnosis.md) dependem de novo escopo; diagnóstico não autorizou correção nem remoção de registros.

## Ambiente e decisões preservadas

- `bun run dev` usa Node/Vite em modo production, `http://127.0.0.1:5176`, banco/contas reais e `.env.production.local`. `.env.vercel-production.local` preserva a origem pública. Testes automáticos devem controlar HTTP e nunca encaminhar fixtures de escrita para produção.
- Staging está fora do fluxo habitual; projeto e arquivos históricos preservados. Cache `.cache/vite` pertence ao checkout; não apagar o cache do servidor ativo.
- Histórico remoto de migrations é parcial. Não executar db push/repair/reset em lote; SQL versionado não comprova aplicação.
- Backups privados permanecem em Documents/UZZINA-backups. Nenhum env, backup ou migration foi removido nesta limpeza.
- Senhas vazadas: recurso Pro, fora das pendências por decisão do proprietário. Defaults de `supabase_admin`: sem alteração autorizada. Preservar RLS, grants e triggers vigentes conforme AGENTS.

## Referências e histórico

- [Histórico integral até 28/10, preservado antes da consolidação](2026-10-29-current-history.md). Entradas antigas registram o estado de cada rodada e podem ter sido superadas; este CURRENT define o status vigente.
- [Modal de data comemorativa](2026-10-28-create-celebration-dialog.md), [Minha Conta](2026-10-28-profile-preferences-scroll.md) e [preferência inicial de Hoje](2026-10-28-today-default-view.md).
- [Duas ações/busca](../plans/action-tabs-ticket-breakdown.md), [calendários](2026-10-16-calendar-height-study.md) e [ambiente local](2026-10-27-local-production-environment.md).
- [Release anterior](../../supabase/rollouts/uzzina-release-manifest.json), [correção de ações](../../supabase/rollouts/action-read-fix-manifest.json) e [segurança](2026-10-09-production-policy-and-security.md).
- [Verificação de triggers de produção](../../supabase/rollouts/trigger-function-hardening-production-verification.json), [manifest de staging](../../supabase/staging/applied-manifest.json) e [verificação de staging](../../supabase/staging/trigger-function-hardening-verification.json).
