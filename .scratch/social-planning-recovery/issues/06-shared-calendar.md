# T06: Substituir grade paralela pelo calendário real com movimento seguro

**Status:** ready-for-agent
**Blocked by:** T02 e T04; T05 para usar editor com salvamento protegido.
**Origem:** R7; C07.
**Prioridade:** P2
**Regra de conclusão:** todos os critérios e testes deste ticket são obrigatórios. Sem evidência, usar implemented-unverified; com falha, verification-failed. Ler a regra completa no README.
**Instrução:** não iniciar integração dependente antes de verificar os bloqueios. Caminhos e símbolos estão no mapa de referências desta série.

**What to build:** Planejamento usa o mesmo núcleo de calendário do app, incluindo ajustes laterais e rolagem, enquanto movimento afeta exclusivamente sugestões.

## Executar nesta ordem

1. Identificar Calendar/CalendarWithDnd e consumidores operacionais. Registrar que componente será composto e quais acoplamentos a ações precisam ser separados.
2. Reutilizar a implementação real. Extrair apenas uma fronteira de dados/eventos necessária quando houver acoplamento. Copiar JSX/estilo para nova grade não conta como reutilização.
3. Remover do caminho ativo a grade independente de PlanningCalendarView. Não falsificar sugestão como Action nem chamar handlers de ações.
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
- [ ] Espionar fronteira/HTTP de ações confirma zero mutações nas operações de sugestões.
- [ ] Proprietário recebe roteiro visual; sem navegador disponível, registrar verificação pendente.

**Reprova automaticamente:** import do calendário não utilizado; grid copiado; apenas overflow e HTML5 drag chamados de integração concluída.

## Entrega obrigatória

- Relatório T06-evidence.md no formato do README, com cada ID de teste e evidência.
- Alterações formatadas e verificações pertinentes, sem escrever “concluído” com critério pendente.
- CURRENT atualizado apenas com fatos observados. Não alterar status de outros tickets, SQL remoto ou deploy por inferência.
