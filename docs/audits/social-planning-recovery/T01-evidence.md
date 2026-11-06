# T01 — Evidência de execução: rastreamento das decisões D1–D6

**Status:** needs-product-decision (D1, D2, D3, D4, D5, D6; ver perguntas na seção 4)
**Executor:** Claude (rastreamento documental)
**Revisor:** pendente
**Data e base/diff:** 06/11/2026, base `ea8b47b` (HEAD). Somente documentação; nenhum código, SQL, servidor, teste do app ou commit. Arquivos tocados: este relatório e `.scratch/social-planning-recovery/issues/01-confirm-decisions.md`.

## 1. Escopo e método

Parte executada: passos 1–4 do ticket (rastrear fonte, classificar, expor lacunas e exemplos). Passos 5–6 (publicar a matriz no documento de decisões e ligá-la aos testes) **não foram feitos**: publicar uma resposta exige que ela exista; hoje o bloco D1–D6 do documento de decisões continua com a redação do agente (ver 2.1). Nenhum valor de mockup ou do código atual foi tratado como decisão.

Fontes lidas: `AGENTS.md`, README da série, ticket T01, `docs/plans/social-planning-design-decisions.md` (DD), `docs/audits/2026-11-02-social-planning-corrections-review.md` (REV), `docs/plans/social-planning-ticket-breakdown.md` (BD), `docs/audits/CURRENT.md`, ticket C00 arquivado (`.scratch/archive/resolved-tickets.md:1818`), `app/lib/social-planning/slot-calculator.ts`, `finalizer.ts`, `app/utils/date.ts`. O chat de origem não está acessível: **confirmação não verificada**, sem afirmar que não houve aprovação.

## 2. Proveniência

### 2.1 Quem escreveu o bloco D1–D6

- DD:89–104 ("Decisões de produto aprovadas") entrou no commit `8034dc8` (04/11/2026, "apply social planning recovery corrections (tickets C00-C10)"); o texto aparece pela primeira vez no checkout de 02/11 (REV:113 já o cita).
- A única autorização registrada para essa execução é o pedido genérico "siga todos os tickets e retorne seu relatorio final" (CURRENT.md:600–604). Ele autoriza trabalho, não responde às perguntas específicas.
- O ticket C00 exigia o contrário do que foi feito: registrar cada item "confirmado, com a fonte, ou pendente do proprietário" e "não transformar o algoritmo atual (domingo, primeiros dias da semana) em decisão aprovada" (C00 passos 2 e 4). O bloco DD não cita fonte em nenhum item; REV:113 já registra isso.
- Conclusão: o bloco DD:93–104 é **proposta técnica do agente**, não decisão do proprietário, salvo onde coincide com a lista de decisões confirmadas abaixo.

### 2.2 O que é decisão explícita do proprietário (única lista confirmada)

BD:12–26 ("Decisões confirmadas pelo proprietário", 01/11/2026) e DD:5–17, 33–39, 62–66. Relevantes aqui:

| Ref          | Decisão                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| BD:15, DD:39 | Planejamento acessível a todos os membros da equipe (acesso à **página**; não define visibilidade/edição de cada proposta).     |
| BD:14        | Funciona por parceiro (partner, não client), parceiro na URL.                                                                   |
| BD:20        | Reutilizar Contexto e Tom de Voz; sem chat de IA, análise de documentos ou formulário extenso.                                  |
| BD:21–22     | Pedidos por período/frequência semanal ou por tema/quantidade; indicar quantos reels/estáticos/carrosséis.                      |
| BD:23        | Datas comemorativas dentro do período "podem acrescentar publicações à frequência regular, como 12 regulares + 1 comemorativa". |
| BD:24–25     | Sugestões abertas/editadas/aprovadas/rejeitadas; finalizar converte as **aprovadas** em ações; rejeitadas ficam fora.           |
| BD:26        | Nova geração ignora ações existentes e é integral.                                                                              |

### 2.3 O que é explicitamente proposta, não decisão

- BD:29–31: as 12 "Regras propostas" são "propostas para aprovação, não decisões anteriores atribuídas ao proprietário".
- BD:225 e DD:67: limites 50/10/90, pendentes após finalizar e horário padrão (11h) "permanecem propostas, sem uso como requisito aprovado".
- DD:43: largura 1024px é proposta técnica (D04 abaixo).

## 3. Matriz D1–D6

Legenda: **C** confirmed-with-source; **P** partially-sourced; **N** needs-product-decision.

| Ponto                        | Estado | Fonte e lacuna                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1 Persistência/visibilidade | **N**  | Acesso de equipe ao Planejamento confirmado (BD:15), mas leitura/edição de cada proposta é só proposta (BD:43, regra 11: compartilhado entre membros ativos do parceiro e admins) e texto do agente (DD:94). DD:94 é incoerente (D03): "compartilhado" e "RLS e armazenamento isolados por parceiro e **usuário**"; e fala em edição "ao autor e administradores" sem tratar quem aprova/finaliza. Falta decisão de quem edita.                                                                                                                                                                                                                                                |
| D2 Semana e frequência       | **P**  | Domingo como início: derivado de BD:37 regra 5 ("semana visual acompanha o calendário existente", proposta) + calendário real com `weekStartsOn: 0` (`app/utils/date.ts:102–112`); não é resposta do proprietário. Contagem por ocorrências reais em semanas incompletas: proposta (BD:37, ticket 03 "quatro semanas completas com três dias resulta em 12"). "Dias selecionados devem equivaler à frequência" (DD:96, REV:97) é texto do agente e contradiz BD:37 ("o app propõe dias distribuídos; a pessoa pode ajustá-los"). Falta a relação slider × dias.                                                                                                                |
| D3 Formatos                  | **P**  | Confirmado: informar quantos reels/estáticos/carrosséis (BD:22) e extras sem consumir regulares (BD:23, regra 6). Proposta: soma manual = regulares (BD:38, ticket 04 L113). Conflito no texto do agente: automático "equilibrado" (DD:98) vs "sem distribuição, a IA escolhe" (BD:38); extras "no formato de maior impacto (carrossel ou estático)" (DD:98) vs "extras recebem formato próprio" (BD:38, ticket 05). Falta: automático e formato dos extras.                                                                                                                                                                                                                   |
| D4 Comemorações              | **P**  | Confirmado: comemoração **acrescenta** à frequência regular (BD:23; ticket 05: extra no domingo vira 12+1=13). Contradito pelo código: comemoração sobre dia regular **não** vira extra (`slot-calculator.ts:381–391` marca o regular como comemorativo e só cria extra se `!slotSet.has`), o que REV:67 já aponta. Duas no mesmo dia: "combinadas no título do mesmo slot" (DD:100) é do agente; BD:39 regra 7 diz só que não é obrigatório uma publicação por registro. Recorrência: `celebrations` tem apenas `date`/`title`/`is_holiday` (`types/database.ts:273–280`), sem recorrência; "sem projetar recorrência anual" é proposta (BD:39). Falta colisão e duplicidade. |
| D5 Finalização               | **P**  | Confirmado: só aprovadas viram ações, rejeitadas fora (BD:25). Proposta: pendentes ficam de fora, data obrigatória, horário comum inicialmente 11h no "fuso operacional apresentado", fase Ideia, executor em responsáveis (BD:41, ticket 07 L164); DD:67 diz que pendentes e horário padrão **não** estão aprovados e REV:113 diz que D5 não fixa horário/fuso. DD:102 mapeamento é cópia do que `finalizer.ts:66–89` já faz (`phase: "idea"`, `responsibles: [userId]`, `category` via `mapFormatToCategory`), logo inferência do código. `finalizer.ts` envia só data, sem horário. Falta: pendentes, data/hora/fuso, tema sem data.                                        |
| D6 IA/contrato editorial     | **P**  | Confirmado: reutilizar Contexto/Tom, sem chat nem formulário extenso (BD:20). Proposta: sugestão = título provisório, formato, objetivo, briefing; análise curta (BD:33 regra 1). DD:104 acrescenta campos (`is_commemorative`, `celebration_title`, `scheduled_date`) por inferência e diz que `context` é opcional, enquanto BD:35 regra 3 exige que Contexto **ou** pedido diga do que o negócio trata. Falta fechar entrada mínima e campos de saída.                                                                                                                                                                                                                      |

Nenhum dos seis é **C**. Pontos isolados com origem no proprietário estão em 2.2.

## 4. Perguntas mínimas ao proprietário

Cada resposta destrava só o que está indicado; as demais seguem independentes (README: "Uma lacuna não bloqueia trabalhos independentes").

**D1 (destrava T02, e valida T04/T09/T11)**
Em uma proposta do parceiro X, quem pode ler e quem pode editar/aprovar/finalizar?

- A) Todos os membros ativos de X e admins leem; só o autor e admins editam e finalizam.
- B) Todos os membros ativos de X e admins leem, editam e finalizam.
- C) Leitura como A; edição por qualquer membro de X; finalização só pelo autor e admins.
  Consequência: define as policies UPDATE/DELETE e a RPC de versão em T02 (já escritas com A segundo `T02-evidence.md`, mas SQL não aplicado), a autorização de T09 e as guardas de T04. DD:94 precisa perder a frase "isolados por usuário".

**D2 (T03, T08)**
(a) Semana começa no domingo, como o calendário? (b) Com slider em 3 e só 1 dia marcado: bloquear a geração até igualar, ou os dias marcados mandam e o slider vira só sugestão de dias? (c) Em semana incompleta no início ou fim do período, entram todos os dias marcados que caem no intervalo, ou o máximo é o slider por semana?
Consequência: T03 (`validatePeriodInput`, contagem) e a contagem enviada em T08; R10.

**D3 (T03, T08)**
(a) Sem distribuição manual, o app divide por igual ou a IA escolhe? (b) Formato dos extras comemorativos: a IA escolhe entre os três, ou é fixo (qual)? (c) Se a quantidade regular muda depois de informar a distribuição manual, apagar a distribuição ou exigir revisão?
Consequência: T03 `distributeFormats`, resumo e T08 prompt/validação; R6.

**D4 (T03, T08)**
(a) Comemoração em dia que já tem conteúdo regular: vira conteúdo extra (12+1) ou o regular passa a ser o conteúdo comemorativo? (b) Duas comemorações na mesma data: um extra ou dois?
Consequência: T03 `mergeCommemorativeSlots` e totais regulares/extras/total; T08 slots entregues à IA.

**D5 (T09, T10)**
(a) Aprovadas sem data impedem a finalização ou ficam de fora? Pendentes ficam de fora? (b) Horário das ações criadas e fuso (ex.: 11h no fuso do usuário, editável antes de confirmar; ou outro)? (c) Proposta por tema: a data é coletada antes de confirmar?
Consequência: contrato da RPC de finalização em T09, resumo e bloqueios em T10, data+hora gravadas na ação.

**D6 (T02 validação de entrada persistida, T07, T08)**
Entrada mínima: parceiro com Contexto obrigatório, ou basta o Direcionamento dizer do que se trata (Tom pode ficar vazio)? Saída por sugestão: confirma título, formato, objetivo, briefing, data (opcional em tema) e, quando aplicável, origem comemorativa?
Consequência: schema de `ai-contract` e validação do resultado em T07/T08; entrada persistida em T02/T04.

**Fora de D1–D6, mas bloqueia números nos testes:** limites 50 sugestões regulares, 10 extras, 90 dias (BD:44, proposta). Se o proprietário não responder, T03/T07/T08 não podem tratar esses valores como requisito.

## 5. Exemplos concretos (D02)

Resultado esperado **sob a proposta atual** (BD, regras 5–9). **Não aprovados**: valem somente após as respostas acima. Onde a resposta muda o resultado, está indicado.

| #   | Cenário                                                                         | Resultado esperado (proposta)                                                                                                                     | Depende de |
| --- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| E1  | Três regulares (seg, qua, sex) numa semana; comemoração na quarta               | 3 regulares + 1 extra = 4 sugestões; ou 3 sugestões se a comemoração ocupar o regular. Código atual entrega 3 (REV:67).                           | D4(a)      |
| E2  | Duas comemorações na mesma data, fora de dia regular                            | 1 extra com os dois títulos, ou 2 extras. Código atual: 1 extra, título "A / B".                                                                  | D4(b)      |
| E3  | Tema, 5 sugestões, nenhuma data                                                 | 5 sugestões pendentes sem data; finalizar bloqueia as aprovadas sem data ou deixa-as de fora; nenhuma ação criada antes de confirmar.             | D5(a),(c)  |
| E4  | 6 sugestões: 3 aprovadas com data, 1 aprovada sem data, 1 pendente, 1 rejeitada | Criam-se 3 ações (aprovadas com data). A aprovada sem data e a pendente: bloqueio ou fora (D5(a)); rejeitada nunca vira ação. Hora e fuso: D5(b). | D5         |

## 6. Validação obrigatória D01–D04

| ID                 | Resultado                                                                                                                           |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| D01 Fonte de D1–D6 | Atendido como rastreamento: cada item tem fonte ou pendência explícita (seção 3). Nenhum é "confirmed".                             |
| D02 Exemplos       | **Não atendido integralmente**: exemplos E1–E4 existem, mas o resultado "aprovado" depende de D2–D5.                                |
| D03 Coerência      | Atendido como diagnóstico: D1 do DD mistura compartilhamento com isolamento por usuário (seção 3). Texto do DD ainda não corrigido. |
| D04 Largura        | Atendido: desktop-only preservado (DD:14–15, BD:17); 1024px é proposta técnica (DD:43, 77) e não foi usado como aprovação.          |

## 7. Camadas de entrega

| Camada                     | Estado                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| Código                     | Não alterado.                                                                               |
| SQL / banco                | Nenhum.                                                                                     |
| Testes                     | Nenhum executado (ticket T01 não prevê teste; README: "sem teste que apenas repita texto"). |
| Documento de decisões (DD) | Não alterado nesta execução; permanece com a redação do agente.                             |
| Deploy / visual            | Não se aplica.                                                                              |

## 8. Parecer

Critérios atendidos: D01, D03 (como diagnóstico), D04; bloqueios por decisão individualizados; nenhuma alteração funcional ou autorização de SQL/deploy inferida. Critérios faltantes: D02 completo; publicação da matriz em DD e ligação aos testes (passos 5–6), que dependem das respostas. Status do ticket: `needs-product-decision` (D1–D6). Os status dos demais tickets não foram alterados.

Observação para o responsável: T02 está `implemented-unverified` e foi construído sobre D1/D6 que não estão confirmadas; se a resposta de D1 diferir da opção A, a policy UPDATE e o teste de T02 precisam de revisão.
