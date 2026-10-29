# UZZINA — estado atual

Atualizado em 29/10/2026. Contratos: [AGENTS](../../AGENTS.md). Operação: [README](../../README.md). Ideias futuras: [TODO](../../TODO.md), sem implementação automática.

## Preparação para publicação

O proprietário solicitou preparar todas as entregas pendentes para deploy e limpar arquivos desnecessários. Preparação local concluída:528 testes, format/lint/typecheck/build,7 verificações serverless e regressão do launcher aprovados. Nenhum push, deploy ou SQL executado nesta rodada.

Conferência inicial do Git: `main`, quatro commits à frente da referência local `origin/main` (`1125131`). `git fetch origin` confirmou essa referência em29/10; ela não certifica publicação. Mudanças externas encontradas: proposta de Planejamento e seus dois registros no CURRENT preservados. Capturas temporárias do modal removidas na revisão de limpeza solicitada pelo proprietário.

| Entrega | Estado confirmado no checkout |
|---|---|
| Notificações | Commit `4dbb90c`: página completa, histórico progressivo, leitura individual/todas, ação indisponível e trecho sem HTML; cache compartilhado com o sino. |
| Ajuda | Commit `311d102`: índice desktop/seletor mobile, instruções dos fluxos atuais, administração restrita e rolagem própria. |
| Modal de datas comemorativas | Commit `7a20122`: criar/editar pelo modal, calendário pt-BR, guardas de sessão e cache canônico. |
| Revisão do calendário/modal | Commit `d5cb55a`: erro no título, Enter sem avançar mês, ordem de Tab visual e apresentação aprovada pelo proprietário. |

Esses quatro commits formam o lote funcional ainda ausente da referência local `origin/main`. Duas ações, busca/comandos, correção de carregamento, AppBar, página Hoje, Minha Conta e preferência inicial de Hoje já são ancestrais de `origin/main`; não devem ser descritos como código ainda sem push. Deploy Ready desses ancestrais não foi conferido nesta rodada.

A migration de `defaultTodayView` já foi aplicada à produção em 28/10, versão remota `20261028205047`, com catálogo/validação/permissões verificados. Não reaplicar: [manifest](../../supabase/rollouts/today-view-preference-manifest.json) e [evidência](../../supabase/rollouts/today-view-preference-production-verification.json). O manifest ainda não confirma deploy do frontend.

Verificação final, inventário da limpeza e limites: [preparação do deploy](2026-10-29-deploy-preparation.md). Verificações locais aprovadas; Notificações ainda tem validação visual/real pendente, conforme os limites desse documento. Publicação só fica confirmada após verificar a nova versão Ready e o domínio.

## Limpeza revisada em29/10

Removidas dez capturas temporárias de Minha Conta/Hoje e do modal de datas; referências aos PNGs retiradas dos relatórios, mantendo o resultado das verificações. Três roteiros de navegador agora geram capturas em diretórios temporários do sistema, fora do projeto; `.gitignore` impede versionar novamente pastas de evidências descartáveis. Testes reutilizáveis/fixtures, favicons do produto, envs e migrations preservados. Detalhes e verificações no relatório de preparação.

## Commit local em29/10

Proprietário solicitou versionar todas as alterações restantes: limpeza das capturas, saída temporária dos roteiros, consolidação documental e proposta existente de Planejamento. A proposta continua em revisão, sem autorizar implementação. Format/lint/typecheck, sintaxe dos roteiros, referências locais e diff aprovados na revisão anterior, sem alterações funcionais posteriores. Sem push, deploy ou SQL nesta rodada.

## Pendências reais

- Publicar o lote preparado e conferir a versão Ready. Preparar para deploy não significa publicar.
- Notificações: implementação e testes automatizados existentes; conferência visual desktop/mobile/temas e existência/entrega de notificações reais ainda não certificadas. Não marcar dados reais como lidos em ensaios automáticos.
- Ajuda: navegador com HTTP controlado já verificou desktop/mobile claro/escuro, foco, âncoras e rolagem; avaliação final do proprietário e uso autenticado após publicação continuam pendentes.
- Preferência inicial de Hoje: implementação/testes e SQL concluídos; avaliação do proprietário e confirmação da publicação do frontend permanecem sem registro conclusivo.
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
