# 17: Validar experiência real e relatar limites

**What to build:** O app é demonstrado em navegador desktop/mobile com jornadas rastreáveis e nenhuma pendência disfarçada de aprovação.

**Blocked by:** 01–16 para os fluxos correspondentes; banco conforme07/08/14

**Status:** homologação local ampliada em07/10/2026; banco, produção, WebKit/aparelho e acessibilidade integral ainda pendentes.

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
- [x] Cada Nxx tem resultado observado ou pendência concreta.
- [x] Mobile/foco/gestos não são declarados validados por jsdom.
- [x] Relatório separa código,banco,navegador,produção e não encerra pendências.

## Resultado do executor
Código/testes locais: passam conforme fechamento abaixo. Banco: não executado. Navegador: Chromium com HTTP controlado; jornadas e limites abaixo. Produção: não implantada nesta rodada.



## Evidência parcial de N04 — 06/10/2026
O ticket04 já exercitou a tela real em Chromium, 390×844 e 1440×844, com HTTP controlado: recuperação da leitura, criação/edição com rascunho preservado em falha, exclusão confirmada e remoção de anexo confirmada. Script: scripts/check-portal-actions-browser.cjs. Relatório: docs/audits/2026-10-06-fechamento-ticket-04.md.

N04 permanece aberto para integração com banco/cookie reais, upload Cloudinary real, persistência após recarga, acesso cruzado e ausência de notas internas no tráfego real. Não registrar a resposta controlada como comprovação de persistência física. O handler real tem testes separados de autorização com SDK de banco controlado.

## Consolidação desta rodada — 07/10/2026
16 está verificado localmente; não encerrar17 enquanto suas jornadas restantes e banco/produção necessários permanecerem pendentes. Jornadas abaixo são **parciais**, com HTTP controlado salvo indicação explícita. Nenhuma gravação ou geração paga real.

| Jornada | Evidência observada / limite restante |
|---|---|
| N01 HTML | portal-browser existente; exploração completa/parser/arquivos ainda não certificada |
| N02 sessão | portal-browser e handlers; cookie HttpOnly/revogação no servidor/banco reais pendentes |
| N03 calendário | calendar-period-browser: mês/semana e viradas literalizadas; troca de parceiro e serviços reais pendentes |
| N04 cliente | portal-actions-browser existente; acesso/upload/persistência físicos pendentes conforme evidência anterior |
| N05 revisão | código/handler com testes; jornada gerar/copiar/abrir link passou no17; banco real pendente |
| N06 administração | operations-browser: guard/lista arquivada reais; APIs e RLS têm evidências separadas, banco não homologado |
| N07 edição | drawer-save-browser e código09; múltiplos cenários registrados; conflito físico duas sessões/banco pendente |
| N08 editor móvel | gaveta em390 com toque emulado; teclado/aparelho/Cloudinary reais pendentes |
| N09 cache | action-cache-browser existente; backend físico pendente |
| N10 lote | bulk-actions-browser existente; confirmação parcial, recuperação e recorte vazio controlados |
| N11 DND | drag-concurrency-browser: mouse e toque emulado; aparelho físico pendente, Kanban móvel desabilitado como antes |
| N12 identidade | identity-cache/portal-browser existentes; troca e respostas antigas controladas; produção pendente |
| N13 IA | ai-browser: sucesso/erro/recuperação; quota PostgreSQL e provedor reais pendentes |
| N14 preferências | preferences-browser1440/390 e controlador real; RPC/grants/merge concorrente PostgreSQL pendentes |
| N15 acessibilidade | teclado na busca/sininho e toque em preferências; compactos e atalhos de card verificados no16; percurso Tab/foco/WebKit/aparelho ainda pendentes |
| N16 conteúdo/busca/notificações | operations-browser passou busca/sininho; action-controls-browser passou stories/post/reels/carousel e rótulos de estratégia na gaveta; integração física pendente |

Chromium utilizado; viewport/toque emulado não significa aparelho físico ou Safari/WebKit aprovado. Consulte CURRENT e cada script/ticket para execução exata. Relatório histórico de05/10 recebe referência ao estado vigente; matriz52 permanece mapa de achados, não certificado de encerramento. Faltam jornadas restantes, integrações físicas e auditoria final do mapa52.

Complemento16: navegador com toque emulado390/360 detectou e confirmou correção do rodapé da gaveta; controles não encolhem. N08/N15/N16 recebem essa evidência limitada; não equivale a teclado/aparelho físico ou WebKit certificado.249 testes de código passam; scripts de navegador são registrados separadamente.

## Fechamento desta execução —07/10/2026

HEAD inicial/final: `0f8c637ee7da38d25b0b54a8cb290ff47984ae01`. Checkout já continha mudanças01–16; preservadas. Nenhum commit/deploy/write de produção ou chamada paga feito.

### Defeito comprovado e correção mínima
`scripts/check-review-browser.cjs` exercitou seleção real de cinco ações → Compartilhar para Revisão → clipboard real → contexto novo sem cookies. Antes da correção, a revisão exigia autenticação do portal. `app/routes/dash.tsx` agora reconhece o match confirmado `/dash/review/$slug` e permite somente esse documento sem sessão. A limpeza do cache ocorre antes de montar o filho (`reviewReady`): a primeira tentativa sem essa espera cancelava a consulta e prendia a tela em Carregando revisão. Login e ação protegida continuam exigindo sessão; a autorização pública permanece inteiramente em `/api/review`.

Não foi criada rota, camada ou framework novo. AGENTS e conhecimento de arquitetura foram atualizados.

### Evidência nova observada
- **N05/N01:** script review em Chromium1440/390/360: falha503 na geração conserva seleção; retry envia exatamente parceiro/IDs selecionados e Bearer; clipboard recebe URL com token sem IDs; documento abre sem usuário/cookies; HTML malicioso é sanitizado no DOM e não executa; IDs extras não são usados para buscar; slug adulterado e resposta404 mostram recusa;503 é distinguido; links legados/sem token explicam impossibilidade. Abrir ação protegida a partir desse contexto retorna ao login. Expiração/revogação são cobertas nos handlers reais por `tests/review-links.test.ts`, com banco controlado; os404 do navegador comprovam **tratamento da recusa**, não enforcement físico.
- **N15:** menu real abre por Enter, Escape restaura o trigger após transição. `check-operations-browser.cjs` ampliado passou1440/390: busca abre por teclado;12 Tabs mantêm foco no diálogo; Escape retorna ao botão; sininho cabe na viewport e restaura foco. Isso não prova ciclo Tab de todos os overlays/gaveta nem equivalência em Safari.
- **N02/N12:** `check-portal-browser.cjs`390 reexecutado após mudar o layout: login, logout falho/sucesso, identidadeA→B e recuperação de bootstrap/calendário passaram. HTTP controlado.
- **N06:** operations1440/390: card de usuário arquivado disponível ao admin; membro vê Acesso Restrito. No mobile o nome não é necessariamente visível no card estreito; o teste usa o link renderizado de edição, sem forçar clique ou alterar UI.
- N03/N04/N07–N14/N16: evidências anteriores permanecem válidas no seu alcance; não reexecutadas sem motivo. A tabela de consolidação lista os limites.
- Matriz52 recebeu **uma linha atual por achado**, mantendo baseline e propostas de produto. Não é nova inspeção integral de52 superfícies.

Validação final: `bun test`249 passam/0 falham,739 asserções/20 arquivos(12,40s); `bun run typecheck`, `bun run lint`, `bun run build` passam. Lint269 arquivos sem avisos. Build mantém aviso de chunks>500kB. `git diff --check` passa.

Reprodução: usar servidor local (`PORTAL_TEST_URL=http://127.0.0.1:5178` nesta rodada), `PLAYWRIGHT_MODULE` e `PLAYWRIGHT_EXECUTABLE` do Chromium instalado; executar `node scripts/check-review-browser.cjs` com `REVIEW_TEST_WIDTH=1440`,390,360; operations usa `OPERATIONS_TEST_WIDTH=1440` ou390; portal usa `PORTAL_TEST_WIDTH=390`. HTTP externo é controlado e dados são descartáveis.

### Pendências concretas, sem repetir correções01–16
1. **Banco de teste:** não há PostgreSQL/psql/docker disponíveis nesta sessão. Primeiro executar `scripts/inspect-db-security.sql` em ambiente autorizado e devolver inventário sanitizado de schema/RPC/policies/grants/triggers. O conjunto de migrations não é baseline completo do schema. Comparar compatibilidade, aplicar em cópia descartável e executar `scripts/test-database-matrix.sql` com ROLLBACK. Confirmar também revisão expirada/revogada, sessões/senhas, CAS, quota14 e merge15 fisicamente. Não aplicar às cegas em produção.
2. **Acessibilidade restante:** ciclo Tab/Shift+Tab, entrada/retorno de foco na gaveta, calendário, popovers e diálogos aninhados; labels dos demais ícones; escolha de audiência da equipe. O teste novo certifica somente busca, menu de lote e sininho.
3. **Safari/telefone:** só Chromium está instalado; nenhuma instalação de engine extra foi feita. Executar390/360 em WebKit e telefone: teclado virtual/editor, seleção, rolagem, datas, toque, overlay e upload Cloudinary real. Capturar modelo/SO/navegador, passos e resultado; print quando houver corte e vídeo para gesto/foco.
4. **Integração/produção:** em staging compatível, confirmar cookie real HttpOnly/Secure/revogação, reload após saves, duas sessões conflitantes, parceiro arquivado, upload e regras RLS. Verificar Vercel/env no ambiente de implantação; não inferir isso de scripts locais. Geração paga só se autorizada para esse teste.

O pacote técnico local avançou;17 **não está totalmente homologado**. Não criar tickets novos para refazer a mesma lógica; a próxima entrega deve atacar uma destas lacunas com ambiente/evidência apropriados.

## Inventário recebido — passo1,07/10/2026

Catálogo real enviado pelo proprietário analisado; ver docs/audits/2026-10-07-inventario-banco-atual.md. PostgreSQL15.1; contratos novos ausentes. Descobertas incompatibilidades do SQL local (bootstrapJSONB, trigger auth→profiles ausente, moddatetime legado, fixtures com campos obrigatórios faltantes) e permissões não cobertas para notificações/leads/celebrations. Inspeção concluída; matriz/banco/staging continuam pendentes. Não pedir a mesma coleta nem aplicar o pacote atual em produção.

## Passo2 local executado —07/10/2026

Pacote SQL corrigido; baseline exportado reconstruído em PostgreSQL15.1 real com9 migrations e matriz/locks de duas conexões aprovados. Resultado/limites em docs/audits/2026-10-07-passo-2-banco-de-teste.md. Não repetir inventário/localSQL como pendência não executada: falta staging Supabase integrado, leads externos e plataforma/produção. A instância local não tem GoTrue/PostgREST, e políticas de leads foram preservadas para não quebrar /Users/euchicosousa/vercel/lead.

## Complemento de07/10 — ajustes visuais e staging

Menu com padding inferior; confirmação de conflito em PrismDialog. Teste da gaveta real cobre cancelamento, novo conflito e recuperação. Duas abas no navegador com Supabase staging passaram em cancelar/reabrir/confirmar; fixture restaurada. Proprietário confirmou conflitos, arrastes/reload e celular. Evidências e limites em docs/audits/2026-10-07-staging-supabase.md, seção Ajustes visuais e validação pelo proprietário. Não equivale à homologação integral móvel/produção.

## Complemento — comparação/IA no staging em07/10

Comparação agrupada por versão, valores formatados, textos longos e scroll independente verificados em1440/390. IA503 reproduzido e configuração privada corrigida no staging; API real gerou legenda com200. UI de geração pendente após renovar sessão, produção/Vercel não certificadas.256 testes passam; tipagem/lint/build passam. Detalhes, arquivos e limites em docs/audits/2026-10-07-staging-supabase.md, seção Comparação por versão e diagnóstico da IA.


## Integração real concluída — passo 1,07/10/2026

Resultado em `docs/audits/2026-10-07-passo-1-homologacao-staging.md`. IA/API estrita comprovou incremento persistido de quota e geração200; interface gerou, salvou e reabriu legenda real. Portal/revisão/contas/pessoas/Auth/lote/CAS passaram na matriz descrita, após correção do handler local create-user e Content que exigia contexto privado no portal. Opção de revisão sem parceiro desabilitada. Dados descartáveis removidos e fixtures restauradas.267 testes/0 falhas; tipagem/lint/build passam. Substitui pendências históricas desses fluxos no staging; produção, leads, Safari/telefone/upload e demais limites continuam pendentes. Não declara ticket17 integralmente homologado.
