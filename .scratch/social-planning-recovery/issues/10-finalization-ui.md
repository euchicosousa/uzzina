# T10: Confirmar, reconciliar e atualizar a Mesa após finalização

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Sol, para reconciliar a finalização com o estado da Mesa.
- **Anthropic** — Claude Sonnet 5.5, para reconciliar a finalização com o estado da Mesa.
- **Google** — Gemini 4 Argon, para reconciliar a finalização com o estado da Mesa. Disponibilidade depende do plano do Antigravity.

**Status:** ready-for-agent. Atualizado em 21/11: em andamento. Feito: diálogo de confirmação antes de Finalizar (resumo, datas e horas, bloqueio sem data). Decisão do proprietário em 21/11: resultado incerto fica como está (mensagem de erro com orientação de tentar de novo; o banco impede duplicar), sem reconciliação automática. Falta: o proprietário conferir o diálogo na tela e aceitar o ticket; testes U01–U08 e T10-evidence.md só se ele pedir.
**Blocked by:** T04 e T09; T05 para guarda de edição.
**Origem:** Conclusão de C09: resumo, falhas, sessão e cache.
**Prioridade:** P2
**Regra de conclusão:** todos os critérios e testes deste ticket são obrigatórios. Sem evidência, usar implemented-unverified; com falha, verification-failed. Ler a regra completa no README.
**Instrução:** não iniciar integração dependente antes de verificar os bloqueios. Caminhos e símbolos estão no mapa de referências desta série.

**What to build:** A pessoa confere o que será criado, confirma uma vez e vê estado verdadeiro. Falha/timeout oferece reconciliação segura, sem perder edição nem repetir operação.

## Executar nesta ordem

1. Exibir resumo com parceiro e contagens aprovadas/pendentes/rejeitadas. Mostrar de forma explícita como serão datadas as aprovadas sem data conforme D5, antes de confirmar.
2. Conectar operação canônica T09 e distinguir confirmando, confirmado, erro, conflito e resultado ainda incerto. Não transformar erro em banner verde de sucesso.
3. Com resultado incerto, consultar a mesma operação antes de disponibilizar retry de escrita. Troca de parceiro ou fechar UI não inicia outra conversão.
4. Finalizado não exibe comando de nova conversão. Reabrir mostra o resultado da própria finalização registrado na proposta, sem consultar nem listar ações dos clientes.
5. Atualizar proposta e sinalizar a atualização das telas operacionais após confirmação canônica; a Mesa não busca nem exibe ações. Nunca adotar resposta em sessão nova. Preservar guardas de saída/edição.
6. Garantir um comando acessível de finalização independente da visualização ativa, sem criar segunda operação concorrente por lista/calendário.
7. Não marcar sugestões pendentes como rejeitadas/finalizadas se D5 não permitir; não remover dados para maquiar sucesso parcial.

## Testes obrigatórios

| ID  | Cenário                                            | Resultado                                                                                                                        |
| --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| U01 | Confirmar resumo e depois cancelar                 | Zero requisição de conversão antes da confirmação final.                                                                         |
| U02 | Dados obrigatórios incompletos                     | Resumo mostra data e hora aprovadas para cada criação. Quando faltar dado exigido por D5, apresenta o motivo e bloqueia escrita. |
| U03 | Duplo clique/Enter repetido enquanto pendente      | Uma operação lógica; UI permanece coerente; T09 continua a garantia final.                                                       |
| U04 | Timeout após commit e reconciliação                | Mostra resultado já existente sem reenviar geração/conversão nova.                                                               |
| U05 | Erro confirmado/conflito                           | Sem sucesso falso; proposta/edições preservadas; retry usa o contrato correto.                                                   |
| U06 | Logout A→B ou trocar parceiro durante resposta     | UI/cache de B não recebe ações/proposta de A.                                                                                    |
| U07 | Sucesso e reabrir/alternar calendário              | Estado finalizado verdadeiro e ação de reconversão indisponível; IDs existentes preservados.                                     |
| U08 | Cache conhecido/desconhecido e consumidor de ações | Ação canônica aparece no escopo adequado após confirmação; falha não insere ação fantasma.                                       |

## Acceptance criteria

- [ ] U01–U08 exercitam a página/handlers reais com HTTP controlado.
- [ ] Pelo menos um fluxo UI → servidor → banco isolado confirma criação e reabertura.
- [ ] Aparência tem roteiro curto para proprietário, além da automação.
- [ ] Não há mensagem “sucesso” baseada somente em createdCount sem confirmação durável.

## Entrega obrigatória

- Relatório T10-evidence.md no formato do README, com cada ID de teste e evidência.
- Alterações formatadas e verificações pertinentes, sem escrever “concluído” com critério pendente.
- CURRENT atualizado apenas com fatos observados. Não alterar status de outros tickets, SQL remoto ou deploy por inferência.
