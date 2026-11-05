# T11: Auditar a série por evidências e impedir conclusão falsa

## Modelos sugeridos

- **OpenAI** — GPT-6 Astra, para auditar evidências e critérios de aceite de toda a série.
- **Anthropic** — Claude Opus 5.5, para auditar evidências e critérios de aceite de toda a série.
- **Google** — Gemini 4 Argon, para auditar evidências e critérios de aceite de toda a série. Disponibilidade depende do plano do Antigravity.

**Status:** ready-for-agent
**Blocked by:** T02–T10 verificados e decisões usadas confirmadas em T01.
**Origem:** C10; todos os achados R1–R11.
**Prioridade:** P2
**Regra de conclusão:** todos os critérios e testes deste ticket são obrigatórios. Sem evidência, usar implemented-unverified; com falha, verification-failed. Ler a regra completa no README.
**Instrução:** não iniciar integração dependente antes de verificar os bloqueios. Caminhos e símbolos estão no mapa de referências desta série.

**What to build:** Um parecer final reproduzível, por requisito, que autoriza tecnicamente o aceite sem usar status do próprio executor como prova.

## Executar nesta ordem

1. Conferir baseline, diff final e evidências individuais. Revisor não deve apenas copiar o relatório de quem implementou; reler caminhos ativos e reproduzir os casos críticos.
2. Montar matriz R1–R11 → ticket novo → teste → comando → resultado → limite. Nenhum achado desaparece por renumeração.
3. Executar novamente P03/P06, N06/N11, E02, A06, B01, F02/F04/F05 e U06 sobre a integração final, não sobre branches incompatíveis.
4. Fazer um fluxo completo por tema e outro por período: configurar → gerar no provedor controlado → persistir → editar/decidir → reabrir em outro cliente → mover → confirmar → repetir sem duplicar.
5. Validar com o proprietário o roteiro desktop: Header/AppBar, duas rolagens, slider/dias/direcionamento, seleção/URL de parceiro, busca/menu/atalho para membro, calendário existente/ajustes e teclado. Abaixo do limite só aviso/preservação, sem implementação mobile.
6. Rodar typecheck e verificações de runtime/serverless pertinentes ao diff. Build quando for publicar. Se surgiram endpoints novos, verificar também seu empacotamento; nove checks antigos não certificam handler novo.
7. Atualizar CURRENT com conclusão parcial ou total verdadeira. Citar código preparado, banco isolado, SQL aplicado remotamente, provedor controlado/real, Ready e aceite visual como dimensões separadas.
8. Se qualquer teste obrigatório não executar, falhar ou tiver mock indevido, registrar implementado-não-verificado ou falhou; não usar completed. Não remover/afrouxar teste para fechar o ticket.
9. Registrar o que foi aprovado e por quem. Não fechar/modificar tickets ancestrais automaticamente nem publicar produção por inferência.

## Testes e evidências obrigatórios

- Reexecuções do passo 3 com saídas finais de contagem/IDs/versão.
- Dois fluxos completos mantendo somente provedor externo controlado e banco isolado real.
- Revisão de código confirmando ausência de templates ativos, storage como fonte canônica, grade paralela e loop de INSERTs no browser.
- Lista de regressões compartilhadas realmente tocadas e resultado de sua verificação dirigida.
- Roteiro visual executado ou explicitamente pendente; nenhum PASS genérico.

## Acceptance criteria

- [ ] Todos os requisitos têm evidência rastreável ou pendência que impede conclusão.
- [ ] Cenários críticos foram reproduzidos sobre o código final integrado.
- [ ] Status de banco/provedor/visual/publicação não são confundidos.
- [ ] Parecer independente não depende dos checkboxes do executor.
- [ ] Qualquer divergência retorna ao ticket responsável com cenário e resultado observado.

**Reprova automaticamente:** “25 testes passaram, logo C00–C10 completos”; SQL não aplicado tomado como persistência; suite de mocks tomada como autorização/atomicidade; declarar Ready sem consultar deploy.

## Entrega obrigatória

- Relatório T11-evidence.md no formato do README, com cada ID de teste e evidência.
- Alterações formatadas e verificações pertinentes, sem escrever “concluído” com critério pendente.
- CURRENT atualizado apenas com fatos observados. Não alterar status de outros tickets, SQL remoto ou deploy por inferência.
