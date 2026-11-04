# Recuperação do Planejamento — série T01–T11

**Pedido de 02/11/2026:** novos tickets mais detalhados, com testes estritos e exigentes, após a revisão reprovar a conclusão integral da série C00–C10. Tracker: arquivos locais. Nesta rodada, somente documentação; nenhuma implementação/teste de app, SQL ou publicação.

## Leia antes de executar qualquer ticket

- Começar por CURRENT e AGENTS; conferir Git, preservar alterações externas e reler o arquivo antes de editar. Um escritor por checkout.
- Ler este README, o ticket atribuído, os contratos referenciados e os bloqueios. Trabalhar um ticket por contexto; não “resolver toda a feature” por iniciativa.
- A referência é o [parecer de 02/11](../../docs/audits/2026-11-02-social-planning-corrections-review.md), com reproduções R1–R11. [Decisões de produto](../../docs/plans/social-planning-design-decisions.md) precisam de rastreabilidade T01.
- Séries [original](../social-planning/README.md) e [C00–C10](../social-planning-corrections/README.md) são histórico. Seus status completed não liberam dependências desta série.
- T01 resolve decisões por ponto: D1 libera persistência; D2–D4 cálculo; D5 conversão; D6 IA. Uma lacuna não bloqueia trabalhos independentes.
- Preservar página interna, Header/AppBar, Mesa limpa, desktop, Prism, acessos para membros e parceiro na URL. Não alterar o app inteiro, portal, estratégias09, quota ou design global para encaixar Planejamento.
- Nova geração explícita é integral e independente. Retry técnico da mesma geração/finalização não duplica resultados. Revisar/mover/aprovar sugestão nunca cria ação.
- Somente evidência permite conclusão. Não basta adicionar campo, comentário, arquivo SQL, import não usado, checkboxes ou testes que não passam pelo código ativo.

## Regra de status e prova

Todos começam **ready-for-agent**, com bloqueios declarados. Isso não significa dependências concluídas nem autorização automática para executar/publicar.

Estados durante execução:

- `in-progress`: alteração em andamento.
- `needs-product-decision`: resposta indispensável sem fonte; indicar exatamente Dn.
- `implemented-unverified`: código preparado, mas algum teste/evidência obrigatório não foi executado.
- `verification-failed`: pelo menos um critério obrigatório falhou; listar o ID.
- `verified-controlled`: todos os testes exigidos passaram no ambiente controlado e diff foi conferido.
- `completed`: todos os testes e critérios obrigatórios passaram, com evidências revisadas. Se o ticket exige decisão de produto ou aceite visual e ela/ele estiver pendente, não usar completed. Não significa produção aplicada/publicada.

Para cada ticket, entregar evidência em `docs/audits/social-planning-recovery/TNN-evidence.md`:

1. Commit/base e identificação do diff testado; arquivos/símbolos tocados.
2. Requisito e ID de cada teste, comando exato, ambiente e resultado real. Não escrever só “PASS”.
3. Fixtures de atores/parceiros e contagens/IDs/versões antes/depois, sem tokens ou dados privados.
4. O que foi real e o que foi substituído; resultados de falha, retry e concorrência.
5. Pelo menos um teste de regressão correspondente ao defeito: demonstrar que detecta a versão defeituosa/reprodução anterior, por execução controlada ou evidência histórica reproduzível. Não afrouxar expectativa para caber no bug.
6. Pendências e separação entre código, SQL preparado/aplicado, provedor, visual e deploy.

## Política dos testes exigentes

Usar o [modelo de evidência](EVIDENCE_TEMPLATE.md). Os arquivos de teste abaixo são **destinos propostos a criar pelo executor**, não testes já existentes ou executados. Não afirmar que passaram nesta rodada. Para testes de banco, T02 prepara somente o suporte isolado necessário e documenta como disponibilizá-lo; os demais reutilizam esse suporte, sem copiar o schema.

| Ticket | Destino proposto e execução mínima                                                                                                                                |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T01    | Conferência D01–D04 documentada; sem teste que apenas repita texto.                                                                                               |
| T02    | `bun test tests/social-planning-recovery/02-persistence.integration.test.ts` — banco isolado real.                                                                |
| T03    | `bun test tests/social-planning-recovery/03-normalized-input.test.ts tests/social-planning-recovery/03-generation-input.test.tsx` — cálculo e handler real da UI. |
| T04    | `bun test tests/social-planning-recovery/04-workspace.test.tsx`                                                                                                   |
| T05    | `bun test tests/social-planning-recovery/05-editor.test.tsx`                                                                                                      |
| T06    | `bun test tests/social-planning-recovery/06-calendar.test.tsx` + roteiro de navegador K05/K07.                                                                    |
| T07    | `bun test tests/social-planning-recovery/07-theme-ai.integration.test.ts` — handler/model/banco reais, provedor HTTP controlado.                                  |
| T08    | `bun test tests/social-planning-recovery/08-period-ai.integration.test.ts` — mesma fronteira de T07.                                                              |
| T09    | `bun test tests/social-planning-recovery/09-finalization.integration.test.ts` — banco isolado e conexões independentes.                                           |
| T10    | `bun test tests/social-planning-recovery/10-finalization-ui.test.tsx tests/social-planning-recovery/10-finalization-flow.integration.test.ts`                     |
| T11    | Reexecutar os casos indicados no ticket sobre a integração final; registrar comandos e resultados reais, além do roteiro visual.                                  |

Nome de arquivo pode ser ajustado por convenção real do projeto, mantendo IDs e cobertura; justificar no relatório e atualizar o comando. Não criar um script que imprime PASS sem executar casos. Testes de banco devem **falhar com mensagem de configuração**, em vez de passar/pular silenciosamente quando a instância isolada não estiver disponível.

- Usar Bun e Testing Library existentes; preferir arquivos de teste específicos por ticket. Os IDs das tabelas devem aparecer nos testes/evidência. Não instalar outra suíte inteira sem necessidade concreta.
- Verificar efeitos reais, não strings de fonte ou snapshots de JSX. Exigir valores/datas/formatos/IDs/versões e ausência de escritas indevidas, além de mensagens.
- Testes de banco usam instância descartável/local isolada e políticas/migrations reais. Endpoint/identidade de teste explícitos, guardas que rejeitam produção e limpeza limitada às fixtures isoladas. Não herdar .env.production.local.
- Falta de banco isolado não autoriza usar produção, pular teste ou substituí-lo por mock. Registrar implementado-não-verificado, com instrução reproduzível para executar a prova.
- Admin/service-role pode preparar fixtures no ambiente isolado; requisições de membros/anônimo usam suas permissões reais. RLS não é certificada testando só service-role.
- Concorrência: conexões/clientes independentes e inspeção final do banco; Promise.all sobre uma função mockada não comprova unicidade/locks.
- Falha injetada deve ocorrer no ponto pertinente: segundo INSERT/vínculo para rollback, resposta perdida depois do commit para reconciliação, persistência depois de provedor para retry sem gerar novamente.
- Só o provedor externo pode ser substituído no fluxo integrado de IA. Manter handler, validação, operação, model e banco reais nesse ensaio. Unitários mockados continuam úteis, mas não certificam a cadeia inteira.
- Testes não são a aprovação visual. Registrar navegador, largura e roteiro; ausência de ferramenta/aceite permanece pendência.
- Se alterar APIs/dependências de funções: cumprir test:serverless e verificar novos handlers. Typecheck/lint/formatação são necessários conforme mudança, mas não substituem comportamento. Build ao publicar.
- Não executar testes do app nesta rodada documental.

## Índice

| Ticket                                                                                                    | Entrega                                           | Bloqueios                                                                          |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [T01 — Rastrear decisões e fechar o contrato de aceite](issues/01-confirm-decisions.md)                   | C00; decisões D1–D6 e evidência de aprovação.     | Nenhum.                                                                            |
| [T02 — Salvar e editar propostas no banco com autorização e versão](issues/02-canonical-storage.md)       | R4, R5 e R11; C01.                                | T01/D1 e D6 confirmadas. Pode inventariar catálogo antes.                          |
| [T03 — Unificar datas, frequência, formatos e extras sem divergências](issues/03-normalized-input.md)     | R6 e R10; C02–C04.                                | T01/D2–D4. Independente de T02 para cálculo puro.                                  |
| [T04 — Separar configuração nova da proposta aberta e proteger transições](issues/04-workspace-state.md)  | R8; limpeza de contexto e respostas antigas.      | T02. T01/D6 para validar entrada persistida.                                       |
| [T05 — Conservar edição até confirmação e garantir teclado do diálogo](issues/05-editor-confirmation.md)  | R9; C08.                                          | T02 e T04 para salvamento e guardas; foco pode ser preparado antes.                |
| [T06 — Substituir grade paralela pelo calendário real com movimento seguro](issues/06-shared-calendar.md) | R7; C07.                                          | T02 e T04; T05 para usar editor com salvamento protegido.                          |
| [T07 — Gerar proposta por tema com IA real e recuperação durável](issues/07-real-theme-ai.md)             | R3; C05, modo tema.                               | T02 e T01/D6. Independente do calendário e da finalização.                         |
| [T08 — Gerar período por IA respeitando slots e formatos confirmados](issues/08-real-period-ai.md)        | R3/R6; integração tema/período, regulares/extras. | T03 e T07.                                                                         |
| [T09 — Converter aprovadas em uma transação idempotente real](issues/09-transactional-finalization.md)    | R1/R2; núcleo C09.                                | T02 e T01/D5. Pode usar propostas canônicas controladas; não espera IA/calendário. |
| [T10 — Confirmar, reconciliar e atualizar a Mesa após finalização](issues/10-finalization-ui.md)          | Conclusão de C09: resumo, falhas, sessão e cache. | T04 e T09; T05 para guarda de edição.                                              |
| [T11 — Auditar a série por evidências e impedir conclusão falsa](issues/11-independent-acceptance.md)     | C10; todos os achados R1–R11.                     | T02–T10 verificados e decisões usadas confirmadas em T01.                          |

## Cobertura e sequência

| Achado revisado                        | Ticket responsável          |
| -------------------------------------- | --------------------------- |
| R1 duplicação/atomicidade              | T09 e T10                   |
| R2 sucesso sem vínculos persistidos    | T09 e T10                   |
| R3 templates sem IA/direção truncada   | T07 e T08                   |
| R4 storage local/cópia sem autor       | T02                         |
| R5 migration/autorização incompatíveis | T02                         |
| R6 manual + extra e resumo divergente  | T03 e T08                   |
| R7 grade paralela                      | T06                         |
| R8 calendário segue formulário mutável | T04                         |
| R9 perda de texto no editor            | T05                         |
| R10 data impossível/frequência         | T03                         |
| R11 versão sem compare-and-swap        | T02                         |
| Conclusão sem evidências               | T11 e regra comum de status |

Ordem recomendada:

1. T01 identifica decisões verificadas/pendentes.
2. T02 e T03 podem avançar independentemente após suas decisões, em checkouts isolados.
3. T04 após T02; T05 após T04; T06 após T05.
4. T07 após T02/D6; T08 após T03/T07.
5. T09 após T02/D5; não precisa esperar IA nem calendário. T10 após T04/T05/T09.
6. T11 somente após integração das entregas verificadas.

Paralelismo é dependência lógica, não permissão para dois escritores no checkout atual. T04/T05/T06/T07/T08/T09/T10 podem tocar a mesma rota/contratos; integrar serialmente. Alterações de migrations/models compartilhados também integram em série.

## Mapa de referências técnicas verificado em 02/11

Ler somente o recorte do ticket e dependências diretas. Se um arquivo mudou, localizar pelo símbolo; os requisitos não dependem de números de linha.

| Símbolo/contrato                                                  | Ponto de entrada                                                                                                          |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Estado e handlers da Mesa                                         | `app/routes/app/planejamento.tsx`                                                                                         |
| SocialPlan/PlanSuggestion                                         | `app/lib/social-planning/types.ts`                                                                                        |
| saveSocialPlan/getSocialPlan/listSocialPlans/updatePlanSuggestion | `app/lib/social-planning/storage.ts`                                                                                      |
| generateSocialPlan/EDITORIAL_ANGLES/resolveTopic                  | `app/lib/social-planning/generator.ts`                                                                                    |
| validatePeriodInput/distributeFormats/mergeCommemorativeSlots     | `app/lib/social-planning/slot-calculator.ts`                                                                              |
| finalizeSocialPlan                                                | `app/lib/social-planning/finalizer.ts`                                                                                    |
| Grade, lista e editor atuais                                      | `app/components/planning/`                                                                                                |
| Calendário compartilhado                                          | `app/components/features/Calendar.tsx`, `CalendarWithDnd.tsx`, `PartnerCalendarBoard.tsx`, `CalendarToolbar.tsx`          |
| Primitivos do diálogo e estados React Aria                        | `app/components/prism/dialog.tsx` e consumidores existentes                                                               |
| Criação/defaults/autorização de ações                             | `app/utils/factory.ts`, `app/utils/validation.ts`, `app/models/actions.ts`, `app/lib/supabase.mutations.ts`               |
| Schema preparado com defeitos                                     | `supabase/migrations/20261102120000_social_plans.sql`                                                                     |
| Catálogo versionado (não prova produção)                          | `types/database.ts`, `supabase/staging/bootstrap.sql`, helpers/migrations vigentes                                        |
| Auth, AI e operações duráveis                                     | `server/auth.ts`, `api/ai.ts`, `app/lib/ai-contract.ts`, módulos atuais de estratégias; ler sem alterar seu contrato      |
| Testes existentes insuficientes                                   | `tests/social-planning-generator.test.ts`, `tests/social-planning-slots.test.ts`                                          |
| Ferramentas e convenções de teste                                 | `package.json`, `tests/dom-setup.ts`, testes de autorização/operações existentes e `scripts/check-serverless-runtime.cjs` |

Esta série preserva os tickets ancestrais; não valida seus status. Execução completa só pode ser declarada por resultados, não pela existência destes arquivos.
