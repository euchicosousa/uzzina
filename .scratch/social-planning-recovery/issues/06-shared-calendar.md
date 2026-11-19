# T06: Substituir grade paralela pelo calendário real com movimento seguro

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Sol, para integrar calendário compartilhado e proteger movimentações.
- **Anthropic** — Claude Sonnet 5.5, para integrar calendário compartilhado e proteger movimentações.
- **Google** — Gemini 4 Argon, para integrar calendário compartilhado e proteger movimentações. Disponibilidade depende do plano do Antigravity.

**Status:** accepted (encerrado em 19/11). O proprietário aprovou o calendário compartilhado e a lista na revisão das sugestões, com edição e arraste de data gravando na proposta com a versão esperada. Sem publicação.
**Blocked by:** A prévia pode ser estudada imediatamente. Para integrar a prévia, usar o cálculo de T03 e a composição de T12. A revisão com escrita depende de T02/T04 e do editor protegido de T05.
**Origem:** R7; C07.
**Prioridade:** P2
**Regra de conclusão:** todos os critérios e testes deste ticket são obrigatórios. Sem evidência, usar implemented-unverified; com falha, verification-failed. Ler a regra completa no README.
**Instrução:** não iniciar integração dependente antes de verificar os bloqueios. Caminhos e símbolos estão no mapa de referências desta série.

**What to build:** Antes de gerar, a coluna direita mostra o período e os formatos no calendário ou a distribuição por formato na lista de quantidade fechada. Na revisão, mapa e movimentos usam apenas as sugestões da proposta.

## Executar nesta ordem

1. Identificar Calendar/CalendarWithDnd e consumidores operacionais. Registrar que componente será composto e quais acoplamentos a ações precisam ser separados.
2. Reutilizar a implementação real. Extrair apenas uma fronteira de dados/eventos necessária quando houver acoplamento. Copiar JSX/estilo para nova grade não conta como reutilização.
3. Remover do caminho ativo a grade independente de PlanningCalendarView. Compor a apresentação do calendário com dados de prévia ou de sugestões. Não consultar ações existentes, falsificar sugestão como Action nem chamar handlers de ações.
4. Conectar seleção/edição T05 e movimento à escrita versionada T02. Identidade da sugestão permanece estável.
5. Preview é específico da operação. Falha desfaz somente esse preview; resposta antiga não restaura snapshot sobre edição mais recente.
6. Preservar controles/ajustes laterais, alturas e ambos os eixos na coluna direita; esquerda rola independentemente.
7. Alternativa por teclado/formulário permite definir data. Regras de limite seguem contrato, não uma proibição inventada.
8. Conferir apenas os consumidores compartilhados realmente tocados (parceiro/Home), sem redesenho.

## Testes obrigatórios

| ID  | Cenário                                                          | Resultado                                                                                           |
| --- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| K01 | Abrir lista e calendário da mesma proposta                       | Mesmos IDs, datas, formatos e decisões canônicas.                                                   |
| K02 | Arrastar sugestão e recarregar em outro cliente                  | Nova data persistida na mesma sugestão; zero escrita em ações.                                      |
| K03 | Mover com falha/confirmação tardia e editar outro item           | Só preview afetado é revertido; edição posterior do outro item permanece.                           |
| K04 | Editar data por teclado                                          | Mesmo resultado de K02 sem depender de arraste.                                                     |
| K05 | Ajustar lateral e rolar dois eixos em viewport suportado         | Grade alcançável, controles operantes; coluna esquerda e documento não absorvem movimento indevido. |
| K06 | Alternar visualização durante operação e receber resposta antiga | Mesma proposta/versão; nenhuma abertura ou edição de ação.                                          |
| K07 | Consumidor existente tocado pela extração                        | Recursos de calendário, arraste de ações e reserva AppBar preservados.                              |

## Acceptance criteria

- [ ] K01–K04/K06 têm testes comportamentais; K05/K07 têm roteiro real de navegador e evidência.
- [ ] Diff demonstra composição do calendário existente, não uma réplica visual.
- [ ] Conferir zero leitura e zero escrita no fluxo de ações ao configurar, mostrar a prévia ou mover sugestões. Confirmar o antes/depois de período, frequência e formatos na mesma coluna direita.
- [ ] Proprietário recebe roteiro visual; sem navegador disponível, registrar verificação pendente.

**Reprova automaticamente:** import do calendário não utilizado; grid copiado; apenas overflow e HTML5 drag chamados de integração concluída.

## Entrega obrigatória

- Relatório T06-evidence.md no formato do README, com cada ID de teste e evidência.
- Alterações formatadas e verificações pertinentes, sem escrever “concluído” com critério pendente.
- CURRENT atualizado apenas com fatos observados. Não alterar status de outros tickets, SQL remoto ou deploy por inferência.
