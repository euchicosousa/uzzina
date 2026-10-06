# 17: Validar experiência real e relatar limites

**What to build:** O app é demonstrado em navegador desktop/mobile com jornadas rastreáveis e nenhuma pendência disfarçada de aprovação.

**Blocked by:** 01–16 para os fluxos correspondentes; banco conforme07/08/14

**Status:** ready-for-agent (respeitar bloqueadores; pacote local)

## Execução prescrita
Executor: usuário/Codex com acesso ao navegador e ambiente de teste. O agente sem navegador prepara dados e checklist; não marca jornadas aprovadas.
1. Ambiente de teste com adminA,membroA,membroB,clienteA/clienteB e parceiros distintos, açõesHoje/amanhã/atrasada/Feito/Concluído, nota interna e comentário público. Usar dados descartáveis. Não criar/apagar ações reais da agência para demonstrar.
2. Desktop1440×900; mobile390×844 e360×800. Chromium e ao menos Safari/WebKit para cookie/touch/editor, registrando engine real. Emulação de viewport não prova teclado/gesto no aparelho: registrar pendente se só emulado.
3. Executar N01–N16 abaixo, registrar passo, esperado, observado, navegador e evidência. Reprovar quando há erro; prints comprovam aparência, não segurança/RLS.
4. Conferir logs de rede/console e recarga após saves. Comparar estado confirmado retornado/persistido; UI momentânea não basta.
5. Atualizar docs/audits/2026-10-05-retorno-da-implementacao.md: retirar100%, separar estados por ticket e mapa original01–52. Suíte atual é contagem verificada, sem transformar casos retirados em testes passados.
6. Rodar suíte/typecheck/lint/build ao fechar. Produção/Vercel/env/policies reais só entram como validados se forem inspecionados nesse ambiente.

## Testes e alcance
N01 — HTML malicioso: links da auditoria e eventos não executam; conteúdo rico legítimo permanece.
N02 — Login/logout/expiração/troca de senha: ID local sozinho não entra; cookie real é HttpOnly; sessão anterior é revogada.
N03 — Calendário: mês e semana completos, mudança de parceiro e navegação avançada sem dados fora do escopo.
N04 — Cliente: ação alheia por URL/API é recusada; nota interna é ausente; anexar, comentar e editar própria mensagem persiste; mensagem alheia é bloqueada.
N05 — Revisão: gerar, copiar e abrir link; slug adulterado, expiração e revogação são recusados; sem IDs extras.
N06 — Administração: membro comum em URL direta e chamada API é bloqueado; admin opera; arquivados são listados; comprovação de RLS em banco é separada.
N07 — Edição: criar por blur e botão, editar durante criação, rede lenta/offline, Escape/X/clique externo, recarga e conflito em duas sessões.
N08 — Editor mobile: teclado, rolagem interna, seleção, upload e fechamento sem cortar controles nem perder foco/conteúdo.
N09 — Cache: criar, duplicar, mover e concluir sem duplicar ou contaminar Hoje, atrasados e outro período.
N10 — Lote: filtro vazio, troca de contexto, Cmd+A em input, duas de cinco confirmadas e falhas recuperáveis.
N11 — DND: pointer no desktop e toque; cancelar e dois arrastes com rede lenta; card não some nem retorna por resposta antiga.
N12 — Identidade: A → logout → B, inclusive voltar no navegador, sem cards/notas/avatar de A; bootstrap atrasado é ignorado.
N13 — IA: geração com upstream falso em teste, erro e cota sem perder insumo; nenhuma chamada paga necessária.
N14 — Preferências: tema e paleta rápidos, latência, falha e recarga; escolhas persistidas.
N15 — Acessibilidade: teclado Tab/Enter/Escape, nomes acessíveis, foco retorna do overlay, popover dentro da viewport e navegação inferior por toque.
N16 — Stories/feed/busca/notificações: abas e estratégias corretas, busca rápida, não encontrado e erro; sininho vazio e data inválida.
BANCO/POLICIES não são marcados aprovados por estes passos sem a matriz07.

## Acceptance criteria
- [ ] Cada Nxx tem resultado observado ou pendência concreta.
- [ ] Mobile/foco/gestos não são declarados validados por jsdom.
- [ ] Relatório separa código,banco,navegador,produção e não encerra pendências.

## Resultado do executor
Código: pendente. Teste local: pendente. Banco: verificar alcance acima. Navegador: pendente conforme17. Produção: não implantado.



## Evidência parcial de N04 — 06/10/2026
O ticket04 já exercitou a tela real em Chromium, 390×844 e 1440×844, com HTTP controlado: recuperação da leitura, criação/edição com rascunho preservado em falha, exclusão confirmada e remoção de anexo confirmada. Script: scripts/check-portal-actions-browser.cjs. Relatório: docs/audits/2026-10-06-fechamento-ticket-04.md.

N04 permanece aberto para integração com banco/cookie reais, upload Cloudinary real, persistência após recarga, acesso cruzado e ausência de notas internas no tráfego real. Não registrar a resposta controlada como comprovação de persistência física. O handler real tem testes separados de autorização com SDK de banco controlado.
