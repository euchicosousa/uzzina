# T07: Gerar proposta por tema com IA real e recuperação durável

## Modelos sugeridos

- **OpenAI** — GPT-6 Astra, para validar execução durável, quota e recuperação da geração por tema.
- **Anthropic** — Claude Opus 5.5, para validar execução durável, quota e recuperação da geração por tema.
- **Google** — Gemini 4 Argon, para validar execução durável, quota e recuperação da geração por tema. Disponibilidade depende do plano do Antigravity.

**Status:** ready-for-agent
**Blocked by:** T02 e T01/D6. Independente do calendário e da finalização.
**Origem:** R3; C05, modo tema.
**Prioridade:** P1
**Regra de conclusão:** todos os critérios e testes deste ticket são obrigatórios. Sem evidência, usar implemented-unverified; com falha, verification-failed. Ler a regra completa no README.
**Instrução:** não iniciar integração dependente antes de verificar os bloqueios. Caminhos e símbolos estão no mapa de referências desta série.

**What to build:** Solicitar cinco ideias sobre um tema chama o provedor pelo servidor e salva proposta contextual autorizada; falha ao gravar depois de gerar permite recuperar o resultado sem gerar de novo.

## Executar nesta ordem

1. Tirar EDITORIAL_ANGLES e resolveTopic truncado do caminho de produção. Fixtures de teste não podem ser fallback do usuário.
2. Implementar operação específica de Planejamento: autenticação, autorização atual ao parceiro e leitura canônica de nome/Contexto/voice. Integrar planning_instructions somente conforme contrato atual, sem recriar campo.
3. Validar D6 e partner_name antes da quota persistente. Não confiar no contexto, nome ou identidade enviados pelo browser. Não modificar os fluxos permanentes de estratégias09.
4. Chamar adaptador real do provedor no servidor, com direcionamento integral e saída estruturada. Validar formato, conteúdo mínimo e quantidade antes de aceitar.
5. Definir identidade de operação e repositório durável: capturada → geração em curso → resultado retido → proposta confirmada; falha/resultado incerto não autoriza repetir chamada indiscriminadamente. Mapear esses estados aos mecanismos existentes sem impor um framework novo.
6. Reter resultado aceito antes de uma escrita recuperável da proposta. Retry do mesmo pedido técnico reutiliza resultado/identidade; nova solicitação explícita gera operação/proposta novas.
7. UI usa estados reais de geração/salvamento/erro/retry. Não apagar proposta anterior nem apresentar templates em falha.
8. Nome/segredos ficam no servidor; imports e handler funcionam no adaptador local e pacote serverless. Quota/instrumentação seguem contratos atuais.

## Testes obrigatórios

No teste integrado, substituir somente o provedor por servidor HTTP controlado; manter handler/model/persistência reais em ambiente isolado. Testes unitários adicionais podem usar mocks, rotulados como tal.

| ID  | Cenário                                                               | Resultado                                                                                            |
| --- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| A01 | Pedir cinco conteúdos por tema pela fronteira usada na UI             | Uma chamada ao provedor de teste; cinco sugestões validadas persistidas; reabrir não chama provedor. |
| A02 | Browser envia nome/contexto falsos; direction longo                   | Servidor usa marca autorizada e envia direction integral; nenhum truncamento.                        |
| A03 | Não autenticado/parceiro alheio/nome inválido/entrada inválida        | Negado antes de provedor; contador de quota/reserva segue validação prévia, sem consumo indevido.    |
| A04 | Limite esgotado ou serviço de quota falha                             | Erro vigente 429/503, zero chamada ao provedor e zero templates.                                     |
| A05 | JSON inválido, campo ausente, formato desconhecido ou contagem errada | Sem proposta utilizável; erro explícito; resultado anterior preservado.                              |
| A06 | Provedor retorna; persistência da proposta falha; retry               | Resultado retido; total de chamadas continua um; uma proposta canônica ao final.                     |
| A07 | Resposta HTTP perdida depois da aceitação                             | Reconciliar a mesma operação; sem duplicação de proposta/geração/quota.                              |
| A08 | Duplo envio mesmo operationId vs nova solicitação                     | Mesmo ID retorna uma operação; nova solicitação retorna ID novo e total integral.                    |
| A09 | Troca de sessão/parceiro/saída durante conclusão                      | Resultado antigo não aparece no novo contexto; trabalho aceito não é perdido/reaberto sozinho.       |
| A10 | Empacotar handler para Node e executar verificação de runtime         | Imports resolvem; nenhuma credencial ou chamada de provedor no bundle do browser.                    |

## Acceptance criteria

- [ ] A01–A10 passam; evidência informa contagem de chamadas, operação, quota e registros.
- [ ] Código chama o adaptador real do provedor; stub substitui apenas essa fronteira no teste.
- [ ] Sem resultado de templates em produção ou fallback de quota local.
- [ ] Testes não gastam IA real por rotina; qualidade editorial real permanece aceite separado.

**Reprova automaticamente:** trocar só voice_tone por voice; testar generateSocialPlan síncrono e declarar IA integrada; guardar operação exclusivamente em memória/localStorage.

## Entrega obrigatória

- Relatório T07-evidence.md no formato do README, com cada ID de teste e evidência.
- Alterações formatadas e verificações pertinentes, sem escrever “concluído” com critério pendente.
- CURRENT atualizado apenas com fatos observados. Não alterar status de outros tickets, SQL remoto ou deploy por inferência.
