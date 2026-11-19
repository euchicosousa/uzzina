# T03: Unificar datas, frequência, formatos e extras sem divergências

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Sol, para normalizar datas, frequência e formatos sem divergência.
- **Anthropic** — Claude Sonnet 5.5, para normalizar datas, frequência e formatos sem divergência.
- **Google** — Gemini 4 Argon, para normalizar datas, frequência e formatos sem divergência. Disponibilidade depende do plano do Antigravity.

**Status:** ready-for-agent. Atualizado em 19/11: a prévia foi aprovada pelo proprietário e a geração usa o mesmo cálculo. Seguem abertas as regras de arredondamento da semana parcial, sobras, durações dos atalhos e extras (D2/D3).
**Blocked by:** T01/D2–D4. Independente de T02 para cálculo puro.
**Origem:** R6 e R10; C02–C04.
**Prioridade:** P2
**Regra de conclusão:** todos os critérios e testes deste ticket são obrigatórios. Sem evidência, usar implemented-unverified; com falha, verification-failed. Ler a regra completa no README.
**Instrução:** não iniciar integração dependente antes de verificar os bloqueios. Caminhos e símbolos estão no mapa de referências desta série.

**What to build:** Resumo, validação, pedido ao servidor e resultado usam uma única configuração normalizada, com quantidades regulares e extras separadas.

## Executar nesta ordem

1. Substituir validação de data baseada só em NaN por validação civil estrita. Impedir normalização de 30/02 para março; não alterar parseU global sem necessidade.
2. Distribuir a frequência pelos dias preferidos, mantendo independência entre quantidade e número de dias. A semana começa no domingo. Até 60 dias inclusivos. A prévia lateral usa o mesmo cálculo, no calendário ou na lista de quantidade fechada. Fechar distribuição de sobras, semanas parciais e total fixo dentro de um período em D2.
3. Resolver ocorrências de comemorações pelo contrato real do cadastro, com intervalo completo. IDs inválidos/fora do período não entram.
4. Manter identidade do slot regular e extra mesmo se ambos caírem no mesmo dia. Aplicar D4 para colisão e agrupamento, sem reduzir regulares.
5. Normalizar o total regular e a composição inteira de formatos. O ajuste interativo das preferências usa essa base no T12. Extras usam a regra confirmada em D3/D4 e têm contagem própria.
6. Usar um único cálculo para prévia, resumo, validação e disparo. Zero consultas a ações existentes. O servidor revalida a entrada antes de gerar.
7. Desligar comemorações ou mudar intervalo elimina seu efeito no pedido, não só sua aparência. Não apagar configurações sem mensagem.
8. Validar também o modo tema: quantidade inteira positiva dentro do limite aprovado, composição consistente. Não inventar limites de produto.

## Testes obrigatórios

| ID  | Entrada/ação                                                     | Resultado                                                                                                             |
| --- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| N01 | 2026-02-30; 2026-13-01; data textual malformada                  | Inválidas, sem normalização e sem exceção de render.                                                                  |
| N02 | 29/02 em 2028 e em 2026                                          | Primeira válida, segunda inválida.                                                                                    |
| N03 | Início>fim; zero ocorrência; dias vazios                         | Inválido, zero chamada de geração.                                                                                    |
| N04 | Frequência 7 com segunda, quarta e sexta                            | A frequência não seleciona dias automaticamente. A semana completa mostra 3/2/2, conforme a regra de sobras aprovada. |
| N05 | Intervalo 10–20/11/2026 com datas 09,10,20,21 e novembro/2025    | Somente limites/datas internas do ano correto elegíveis.                                                              |
| N06 | Um regular, manual 1 reel, um extra em outro dia                 | Configuração válida, total 2; composição regular continua 1 reel e extra tem formato próprio.                         |
| N07 | Extra no mesmo dia regular; duas comemorações no mesmo dia       | IDs, soma e rótulos exatamente iguais ao exemplo D4, sem resumo inflado.                                              |
| N08 | Composição inválida ou soma diferente do total regular | Erro explícito. Quantidades inteiras válidas preservam o total exato após normalização.                                                          |
| N09 | Alterar período ou desligar comemorações                         | Pedido/resumo sem extras obsoletos.                                                                                   |
| N10 | Mesmas datas em UTC e America/Fortaleza                          | Mesmas datas civis e contagens, inclusive virada de mês/ano.                                                          |
| N11 | UI configurada no cenário N06 e clicar gerar                     | Handler recebe o mesmo total/slots/formato do resumo; não basta testar funções isoladas.                              |
| N12 | Repetir pedido válido no mesmo período                           | Total integral idêntico, sem consultar ações existentes.                                                              |

## Acceptance criteria

- [ ] N01–N12 passam; tabela da evidência mostra quantidades reais obtidas.
- [ ] Um caso de integração reproduz e elimina o erro “manual válido + extra lança exceção”.
- [ ] Datas inválidas não alcançam IA/quota.
- [ ] Valores do mockup não foram usados para resolver D2–D4 sem fonte.

**Reprova automaticamente:** testes só de length sem comparar datas/formatos; soma por IDs de comemoração diferente dos slots efetivos; dois algoritmos de cálculo divergentes.

## Entrega obrigatória

- Relatório T03-evidence.md no formato do README, com cada ID de teste e evidência.
- Alterações formatadas e verificações pertinentes, sem escrever “concluído” com critério pendente.
- CURRENT atualizado apenas com fatos observados. Não alterar status de outros tickets, SQL remoto ou deploy por inferência.

## Evidência do DS02 — 06/11

Em Chromium local com HTTP controlado, abrir Planejamento com e sem parceiro em 390 e 1440 px, atrasando uma resposta válida de celebrações em 1,2 s, reproduziu `Maximum update depth exceeded`. Conferir a referência vazia recriada durante a consulta e o efeito que atualiza a seleção mesmo vazia. Reproduzir com resposta pendente e confirmar que o formulário continua utilizável após a chegada da resposta. [Relatório DS02](../../../docs/audits/2026-11-05-ds02-route-review.md).
