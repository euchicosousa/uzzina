# C05: Gerar propostas reais por IA com contexto e tom corretos

**Status:** completed — integração com voice e context canônicos do parceiro, sem geração de ações e com erros recuperáveis na UI

**Blocked by:** C01, C02, C03 e C04; C00/D6. Os contratos de entrada/saída precisam estar estáveis antes da integração.

**Prioridade:** P1

**Instrução de execução:** ler o README desta série; executar apenas este recorte, preservar mudanças externas e respeitar os bloqueios acima.
**What to build:** Gerar usa IA real no servidor, com dados autorizados atuais da marca e configuração validada, e devolve uma proposta salva que pode ser reaberta sem nova geração.

## Problema e pontos de entrada

`generator.ts` usa nove templates síncronos. A rota lê `voice_tone`, mas o parceiro possui `voice`. Ler os contratos e handlers atuais de IA, quota, autenticação e estratégias09 antes de integrar. Não reutilizar automaticamente a operação de estratégia como se fosse planejamento.

## Passos obrigatórios

1. Remover o gerador de templates do fluxo de produção. Pode permanecer apenas como fixture explícita de teste, nunca como fallback ao usuário.
2. Criar/integrar operação específica de Planejamento usando serviços existentes. O navegador envia parceiro e configuração, não credenciais nem autoridade editorial.
3. Servidor autentica, verifica membro/parceiro ativo autorizado e lê nome, Contexto e `voice` canônicos. Verificar o ticket original 08 e a integração vigente de `planning_instructions`; incluir somente o que estiver disponível e autorizado, sem criar outro cadastro.
4. Validar `partner_name` e entrada D6 antes da reserva persistente de quota. Respeitar erros/quota e instrumentação vigentes; falha não ativa contador em memória nem templates.
5. Capturar configuração no disparo. Enviar direcionamento completo, sem truncar em cinquenta caracteres. Transmitir slots/formatos/regulares/extras já validados; revalidá-los no servidor.
6. Solicitar saída estruturada com os campos D6, validar tipos, quantidade, formatos e datas. IDs das sugestões e parceiro autorizado são controlados pela aplicação; texto do modelo não concede identidade/autorização.
7. Resultado inválido não vira proposta válida nem cria ações. Explicar erro sem destruir proposta anterior. Contexto insuficiente pede correção objetiva dos dados mínimos, sem transformar a página em chat.
8. Usar identidade estável de operação para retry técnico. Resultado aceito deve ser retido de modo que falha no salvamento não exija nova chamada paga. Repetição do mesmo pedido técnico não publica duplicatas.
9. Nova geração explícita cria operação/proposta novas e integrais, mesmo no mesmo período. Não buscar nem descontar ações reais.
10. UI diferencia gerando, salvando, concluído, erro, retry de escrita e resultado inválido. Sessão/parceiro antigos não recebem o resultado; não cancelar trabalho durável já aceito só por fechar a interface.
11. Documentar o ciclo de operação e integração com C01. Preservar estratégias09 sem flags, alterações no seu worker ou generalizações desnecessárias.

## Verificação necessária

Provedor/HTTP controlados: autenticação negativa, parceiro alheio, `voice` recebida, direção longa integral, nome inválido sem quota, limite/indisponibilidade, JSON inválido, contagem/formato/data divergentes, timeout/resultado retido, retry de gravação sem segunda geração e troca de sessão. Qualidade editorial real requer avaliação separada; mocks não a certificam.

## Acceptance criteria

- [ ] Há chamada real ao provedor via servidor no fluxo preparado.
- [ ] Nome/Contexto/Tom vêm da marca autorizada, sem cast para campo inexistente.
- [ ] Templates não aparecem como resultado de IA em falhas.
- [ ] Resultado validado é persistido e reabre sem regenerar.
- [ ] Retry técnico e nova geração explícita são operações distintas.
- [ ] Nenhuma ação nasce nesta etapa.
- [ ] Verificações de APIs e build ao publicar seguem AGENTS; relatório separa preparado/testado/publicado.

**Não fazer:** pagar chamadas para testes por rotina, colocar segredos no browser, criar chat, upload de documentos ou alterar quota e estratégias existentes.
