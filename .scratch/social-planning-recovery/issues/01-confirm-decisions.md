# T01: Rastrear decisões e fechar o contrato de aceite

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Terra, para rastrear decisões existentes e consolidar o contrato de aceite.
- **Anthropic** — Claude Haiku 5.5, para rastrear decisões existentes e consolidar o contrato de aceite.
- **Google** — Gemini 3.8 Flash, para rastrear decisões existentes e consolidar o contrato de aceite.

**Status:** needs-product-decision (D1, D2, D3, D4, D5, D6; perguntas em [T01-evidence](../../../docs/audits/social-planning-recovery/T01-evidence.md#4-perguntas-mínimas-ao-proprietário))
**Blocked by:** Nenhum.
**Origem:** C00; decisões D1–D6 e evidência de aprovação.
**Prioridade:** P2
**Regra de conclusão:** todos os critérios e testes deste ticket são obrigatórios. Sem evidência, usar implemented-unverified; com falha, verification-failed. Ler a regra completa no README.
**Instrução:** não iniciar integração dependente antes de verificar os bloqueios. Caminhos e símbolos estão no mapa de referências desta série.

**What to build:** Um contrato de produto verificável para os próximos tickets, sem converter inferências do agente em aprovações do proprietário.

## Executar nesta ordem

1. Ler o bloco D1–D6 vigente e comparar com as decisões anteriores. Para cada decisão, indicar fonte, autor e data da confirmação. “Siga os tickets” autoriza trabalho, mas não demonstra a resposta específica a uma pergunta de produto.
2. Classificar cada decisão: confirmada por fonte, proposta técnica ou pendente. Se o chat de origem não estiver acessível, registrar “confirmação não verificada”; não alegar que não houve aprovação.
3. Resolver somente as lacunas que afetam execução: D1 leitura/edição por autor, membro e admin; D2 semana e relação frequência/dias; D3 soma manual/auto/extras; D4 colisão de comemoração com regular e várias no mesmo dia; D5 pendentes, data/hora/fuso, responsáveis e campos; D6 entrada/saída editorial mínima.
4. Registrar exemplos concretos: três regulares e uma comemoração no dia regular; duas comemorações na mesma data; tema sem data antes de finalizar; proposta com aprovadas e pendentes. Para cada um, indicar resultado esperado aprovado.
5. Manter o já definido: página interna, Mesa, desktop, Prism, mesmo calendário, ações só na finalização e nova geração integral.
6. Publicar a matriz D1–D6 em documento de decisões e ligar cada resposta ao teste dependente. Não implementar produto neste ticket.

## Validação obrigatória

| ID  | Checagem                        | Condição de aprovação                                                                                        |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| D01 | Fonte de D1–D6                  | Cada item possui referência verificável ou pendência explícita.                                              |
| D02 | Exemplos de colisão/finalização | Quantidades, elegibilidade e data/hora são inequívocas.                                                      |
| D03 | Coerência                       | Contrato não promete compartilhamento enquanto exige privacidade absoluta por autor; separar leitura/edição. |
| D04 | Largura                         | Desktop-only preservado; nenhum número ilustrativo vira aprovação.                                           |

## Acceptance criteria

- [ ] D01–D04 atendidos, com respostas e fonte.
- [ ] Se houver pergunta necessária, o status permanece needs-product-decision para esse ponto.
- [ ] Bloqueios por decisão são individuais: falta de D5 não impede T03 após D2–D4 confirmadas.
- [ ] Nenhuma alteração funcional ou autorização de deploy/SQL inferida.

## Entrega obrigatória

- Relatório T01-evidence.md no formato do README, com cada ID de teste e evidência.
- Alterações formatadas e verificações pertinentes, sem escrever “concluído” com critério pendente.
- CURRENT atualizado apenas com fatos observados. Não alterar status de outros tickets, SQL remoto ou deploy por inferência.

## Execução — 06/11/2026

Rastreamento feito sobre `ea8b47b`, somente documental. Relatório: [T01-evidence](../../../docs/audits/social-planning-recovery/T01-evidence.md).

- O bloco D1–D6 de `social-planning-design-decisions.md` foi escrito pelo agente que executou a série C00–C10 sob o pedido genérico "siga todos os tickets" (CURRENT.md, entrada de 02/11). Nenhum item cita fonte; tratado como proposta técnica. Chat de origem inacessível: confirmação não verificada.
- Nenhum de D1–D6 está confirmado por fonte. Todos permanecem abertos; D2–D4 e D6 têm pontos parcialmente confirmados pelo proprietário (BD "Decisões confirmadas"), listados no relatório.
- Perguntas mínimas ao proprietário no relatório, seção 4. Bloqueios individuais: D1 libera T02; D2–D4 liberam T03 e T08; D5 libera T09/T10; D6 libera T07/T08.
- D01 e D04 atendidos; D03 atendido como diagnóstico (D1 mistura compartilhamento e isolamento por usuário); D02 não atendido integralmente (exemplos dependem de D2–D5). Passos 5–6 (publicar a matriz e ligar aos testes) pendentes das respostas.
- Alerta: T02 (implemented-unverified) foi construído sobre D1/D6 não confirmadas.
- Nenhum código, SQL, teste, servidor ou commit.
