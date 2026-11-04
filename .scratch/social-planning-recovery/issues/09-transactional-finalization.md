# T09: Converter aprovadas em uma transação idempotente real

**Status:** ready-for-agent
**Blocked by:** T02 e T01/D5. Pode usar propostas canônicas controladas; não espera IA/calendário.
**Origem:** R1/R2; núcleo C09.
**Prioridade:** P1
**Regra de conclusão:** todos os critérios e testes deste ticket são obrigatórios. Sem evidência, usar implemented-unverified; com falha, verification-failed. Ler a regra completa no README.
**Instrução:** não iniciar integração dependente antes de verificar os bloqueios. Caminhos e símbolos estão no mapa de referências desta série.

**What to build:** Finalizar cria todas as ações elegíveis e seus vínculos uma única vez, ou não cria nenhuma. Duas abas e respostas perdidas não mudam essa garantia.

## Executar nesta ordem

1. Remover o loop de createActionClient do navegador como mecanismo de conversão. UI envia identidade da proposta, operação/versão esperada e somente dados aprovados necessários, não uma lista autoritativa de ações.
2. Implementar transação no banco via fronteira servidor/RPC autorizada. Na mesma transação: validar ator/parceiro/versão/estado; obter sugestões canônicas aprovadas; criar ações; gravar vínculo exclusivo por sugestão; confirmar plano/operação.
3. Criar constraint única durável que impeça duas ações originadas da mesma sugestão. Serializar concorrência por locks/condições adequadas. Documentar ordem/resultado das chamadas concorrentes; botão disabled não é garantia.
4. Aplicar D5 e defaults canônicos de criação. Responsáveis garantem criação por membro comum sem ampliar RLS; dono/ator são derivados no servidor. Não reintroduzir hoje/10h/11h implícitos.
5. Revalidar todos os dados antes de escrever e garantir rollback real se a segunda ação falhar. Não compensar criando e depois apagando.
6. Retry, aba antiga e resposta perdida consultam resultado canônico associado. Se já finalizado legitimamente, retornar vínculos existentes sem nova escrita. Versão desatualizada antes da conversão dá conflito.
7. Vínculo permanece identificável mesmo se ação for excluída ou ficar inacessível; não recriar e não vazar seus dados. Política de exclusão não deve apagar a chave de idempotência sem deixar proteção equivalente.
8. UI mínima usa a nova operação e só anuncia sucesso após confirmação de ações+vínculos. Erro de vínculo/commit não retorna sucesso.
9. Devolver ações/vínculos canônicos no escopo autorizado para T10. Não introduzir sincronização bidirecional posterior entre proposta e ação.

## Testes obrigatórios de banco real isolado

Não substituir finalização, transação, constraints ou INSERT de ações por mocks. Injetar a falha no banco/limite controlado mantendo execução real. Usar pelo menos duas conexões independentes para concorrência.

| ID  | Cenário                                                                    | Resultado exato                                                                                             |
| --- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| F01 | A/B/C aprovadas e elegíveis                                                | Três ações, três vínculos, plano confirmado; campos/defaults/datas iguais a D5.                             |
| F02 | Falha na segunda ação ou na gravação do segundo vínculo                    | Zero novas ações, zero novos vínculos, plano não finalizado; estado preexistente inalterado.                |
| F03 | Repetir F01 com mesmo pedido e cópia antiga de outra aba                   | Mesmos IDs; contagens continuam três/três.                                                                  |
| F04 | Dez requisições simultâneas de pelo menos duas conexões                    | Exatamente três ações e três vínculos no total; resultados canônicos ou conflito recuperável coerente.      |
| F05 | Commit ocorre, resposta se perde e cliente repete                          | Reconsulta encontra resultado; nenhuma quarta ação e nenhum vínculo extra.                                  |
| F06 | Membro autorizado, admin ativo, membro alheio/inativo e parceiro arquivado | Permitidos funcionam; negados deixam zero novas linhas. Testar permissões reais, não service-role genérico. |
| F07 | Payload altera parceiro, autor, aprovadas, responsáveis ou versão          | Servidor ignora/rejeita autoridade indevida; estado canônico decide; zero escrita parcial.                  |
| F08 | Rejeitadas/pendentes e aprovadas sem data válida                           | Exatamente o resultado D5, sem criação antecipada nem horário inventado.                                    |
| F09 | Excluir ação resultante ou retirar acesso, repetir finalização             | Nenhuma recriação; sem exposição de conteúdo agora inacessível.                                             |
| F10 | Nova proposta para mesmo período/títulos                                   | Pode gerar seu novo conjunto; unicidade não é por título/período.                                           |
| F11 | Falha/timeout antes do commit vs depois do commit                          | Reconciliação distingue resultados; nunca afirma sucesso sem confirmação nem repete INSERT às cegas.        |

## Acceptance criteria

- [ ] F01–F11 passam e incluem SELECTs finais de contagem/IDs/estado no banco isolado.
- [ ] Evidência diferencia rollback, execução concorrente e commit com resposta perdida.
- [ ] Não existe caminho alternativo da UI que volte ao loop antigo.
- [ ] Membros funcionam sem modificação permissiva nas regras gerais de ações.
- [ ] Versionamento, constraints e política de exclusão mantêm idempotência fora da memória do browser.

**Reprova automaticamente:** created_action_id apenas em JSON local; salvar vínculos depois dos INSERTs; testes concorrentes com mock de criação; aceitar parcial como atomicidade; flags só de frontend.

## Entrega obrigatória

- Relatório T09-evidence.md no formato do README, com cada ID de teste e evidência.
- Alterações formatadas e verificações pertinentes, sem escrever “concluído” com critério pendente.
- CURRENT atualizado apenas com fatos observados. Não alterar status de outros tickets, SQL remoto ou deploy por inferência.
