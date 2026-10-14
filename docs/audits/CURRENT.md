# UZZINA — estado atual

Atualizado em14/10/2026. Contratos: [AGENTS](../../AGENTS.md). Operação: [README](../../README.md). Ideias futuras: [TODO](../../TODO.md), sem implementação automática.

## Pendências reais

Ticket01 de foco da gaveta aceito pelo proprietário após teste nos dados reais no Mac. Ticket02 de toolbar e ocultação do aviso inferior preparados e verificados localmente; publicação em andamento. Sinalização dos demais controles e estabilização futura permanecem no ticket03, ainda não executado. Foto circular e seleção exclusiva por Shift já estavam incluídas na versão de produção anterior. Ideias futuras permanecem no TODO/docs/plans e dependem de uma nova decisão de escopo.

## Encerrados e decisões

- [Avaliação do Tab e foco na gaveta](2026-10-14-drawer-keyboard-focus.md): percurso observado no aplicativo publicado; falta de sinalização clara confirmada em comandos e seletores. Título configurado com autofocus; abertura sem clique posterior ainda não certificada. Avaliação concluída, sem implementação nesta rodada.
  Plano revisado pelo proprietário: título → descrição → parceiros → fase → categoria → cor → Criar/Atualizar; controles auxiliares e formatação fora do percurso principal. Data terá foco sublinhado. Estudo de React Aria recomenda FocusScope/useFocusManager com captura local e filtro dos destinos, preservando Tab dos overlays. Demais aparências e acesso auxiliar permanecem para definição; sem implementação. A terceira seção do relatório substitui o percurso anterior.
  Skill to-tickets aplicada: divisão aceita ao iniciar ticket01; tickets publicados localmente em .scratch/keyboard-focus/issues — [gaveta](../../.scratch/keyboard-focus/issues/01-action-drawer-focus.md), [toolbar](../../.scratch/keyboard-focus/issues/02-react-aria-editor-toolbar.md) e [estabilização futura](../../.scratch/keyboard-focus/issues/03-keyboard-stabilization.md). Ticket01 publicado com sequência principal, Alt+F10 para todos os controles, sublinhado da data e restauração de foco. Proprietário confirmou o fluxo do ticket01; ticket02 autorizado e implementado localmente. Sinalização dos demais controles permanece no ticket03.

- [Foto circular de Minha Conta](2026-10-13-profile-avatar.md): prioridade explícita para curva circular sobre o squircle do botão, padding removido e avatar preenchendo a área.

- [Seleção exclusiva por Shift](2026-10-11-shift-selection.md): PrismCommand captura o modificador antes do clique simulado pelo React Aria; PrismCommandItem fornece `{ shiftKey }` ao onAction. Cinco seletores deixaram de consultar `window.event`. Shift+Enter/Shift+clique, opções selecionadas/não selecionadas, alternância comum, sprint e escolhas especiais verificados nos componentes reais em jsdom.
- Uso do site, telefone, cores do cabeçalho e zoom/gaveta aprovados pelo proprietário. Teste físico do zoom realizado no aplicativo local pelo endereço de rede do Mac, com o ajuste de16px. Não há reorganização da gaveta solicitada.
- PostgreSQL de produção atualizado pelo proprietário e confirmado por consulta independente em10/10 às15:30UTC:17.11, mesma versão do staging. RLS, ausência de grants anônimos de tabela, policy de ações e proteções/triggers de timestamp preservados. Conferência de catálogo não equivale a testar todos os fluxos após upgrade.
- Proteção contra senhas vazadas retirada das pendências por decisão do proprietário: plano gratuito, recurso exige Pro ou superior. Configuração permanece desativada; nenhuma contratação feita.
- Defaults de supabase_admin retirados das pendências operacionais: prevenção opcional para objetos futuros, sem exposição atual identificada nas tabelas da aplicação. Nenhuma alteração nesse papel autorizada ou executada.
- Staging: correção de triggers aplicada, remoto `20261010143013`, quatro chamadas diretas recusadas, triggers preservados; Auth legado ausente, sem recriação. Produção: correções de policy de ações e triggers aplicadas em09/10. Vínculo Vercel, IA/portal e cores resolvidos. KI externo de banco atualizado.
- Limpeza: página técnica de teste, seus arquivos HTML/TSX e script removidos a pedido do proprietário. Relatório mobile condensado na revisão existente; correção e evidências de banco preservadas. Nenhum arquivo de ambiente, backup ou migration removido.

## Verificação e limites

Ticket02 em14/10: toolbar principal/contextual migrada para React Aria, foco dos comandos visível, setas/Enter/Espaço e retorno ao texto preservados. Aviso Alt+F10 oculto sem ocupar espaço; atalho mantido.374 testes/1120 assertions, format/lint/typecheck/build passaram. Editor real conferido isoladamente no navegador em claro/escuro, incluindo paleta padrão real, atalhos, menu contextual e390px com quebra em duas linhas. Sem validação autenticada completa, banco/provedor ou migração de outros campos. Publicação Ready será registrada após confirmação.

Publicação do ticket01 autorizada pelo proprietário em14/10, com teste visual posterior nos dados reais por ele. Commit de código `ac170df7bfcc983317dd639c42367d380cf37621` enviado para main; deploy de produção `dpl_AefHT1xWqjpNhCM9QDU26J6TKwBC` confirmado READY e associado a `uzzina.cnvt.com.br`. O domínio público respondeu HTTP200 em /app. Isso verifica publicação e resposta HTTP, não o uso autenticado/visual. Proprietário confirmou em seguida que o foco funciona normalmente; nenhuma alteração de banco.

Implementação do ticket01 em14/10:363 testes/1060 assertions, incluindo13 novos casos nos componentes reais. Regressão reproduzida antes da correção: Tab do título não chegava à descrição. Foco inicial/retorno, sequência inversa/com e sem cor, rascunho, calendário/horário, popover de parceiros, lista/tabela sem edição por Tab, outras abas e ausência de ciclo verificados em jsdom. Format/lint/typecheck/build e7 verificações serverless passaram. Aviso conhecido de chunks permanece. Conferência visual local não executada: revisão automática do navegador falhou por limite de uso; ensaio temporário removido. Sem push/deploy, SQL ou validação de banco/provedor. A confirmação posterior do proprietário encerrou o fluxo do ticket01; cobertura integral de temas/viewports e indicadores restantes permanece no trabalho futuro.

Rodada de14/10: inspeção do código e navegação física com Tab no Comet/macOS, em produção, sem edição de conteúdo. Referências locais e diff de documentação conferidos. Sem testes/build ou publicação; somente documentação modificada. A sequência completa, o foco inicial sem interferência e outros temas/viewports não foram certificados.

Rodada de13/10: format/lint/typecheck/build e diff check passaram. Bloco real de upload de Minha Conta, com componentes e CSS reais, conferido isoladamente no navegador: botão80×80px, curva circular e padding zero após o ajuste; antes tinha superellipse(1.5) e padding lateral12px. Sem teste de upload, banco ou fluxo autenticado completo; sem push/deploy. Aviso conhecido de chunks permanece.

Rodada de11/10:350 testes/989 assertions, format/lint/typecheck/build e diff check passaram;39 testes novos cobrem a seleção por Shift. Código preparado no checkout, sem push/deploy ou reteste em navegador físico. Aviso conhecido de chunks permanece. A publicação descrita abaixo antecede este ajuste.

Correção publicada pelo commit `808912b`: Vercel confirmou Ready no deploy `dpl_FwJdZxd3a8sTSnu79UMAkWagpheB`, vinculado a `uzzina.cnvt.com.br`. No site publicado, o campo pequeno da galeria /ui foi conferido com16px no viewport390px e14px em1280px; isso verifica o CSS publicado em Chromium, enquanto o reteste físico anterior foi local.

311 testes/945 assertions, format/lint/typecheck/build e7 verificações serverless passaram após limpeza. Teste de tipografia reproduziu14px antes e16px depois no celular; desktop preservado. Aviso conhecido de chunks permanece.

Produção não possui histórico de migrations; não executar db push/repair/reset cegamente. Objetos atuais da aplicação pertencem a postgres, com RLS/permissões restritas. Backups privados permanecem em Documents/UZZINA-backups; ensaio de dados públicos não equivale a restore integral de Auth/mídia.

## Referências

- [Release de produção](../../supabase/rollouts/uzzina-release-manifest.json) e [correção de ações](../../supabase/rollouts/action-read-fix-manifest.json).
- [Segurança, confirmação do upgrade e tipografia mobile](2026-10-09-production-policy-and-security.md).
- [Evidência de produção, incluindo pós-upgrade](../../supabase/rollouts/trigger-function-hardening-production-verification.json).
- [Manifest de staging](../../supabase/staging/applied-manifest.json) e [verificação de triggers](../../supabase/staging/trigger-function-hardening-verification.json).
- KI externo: `/Users/euchicosousa/.gemini/antigravity-ide/knowledge/uzzina-database/artifacts/database.md`.
