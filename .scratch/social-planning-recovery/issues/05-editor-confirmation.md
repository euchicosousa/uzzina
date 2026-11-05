# T05: Conservar edição até confirmação e garantir teclado do diálogo

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Sol, para validar confirmação, retry e foco no diálogo.
- **Anthropic** — Claude Sonnet 5.5, para validar confirmação, retry e foco no diálogo.
- **Google** — Gemini 4 Argon, para validar confirmação, retry e foco no diálogo. Disponibilidade depende do plano do Antigravity.

**Status:** ready-for-agent
**Blocked by:** T02 e T04 para salvamento e guardas; foco pode ser preparado antes.
**Origem:** R9; C08.
**Prioridade:** P2
**Regra de conclusão:** todos os critérios e testes deste ticket são obrigatórios. Sem evidência, usar implemented-unverified; com falha, verification-failed. Ler a regra completa no README.
**Instrução:** não iniciar integração dependente antes de verificar os bloqueios. Caminhos e símbolos estão no mapa de referências desta série.

**What to build:** Salvar só fecha o editor depois da confirmação canônica. Falha, conflito, Escape e clique externo não apagam texto sem decisão.

## Executar nesta ordem

1. Manter PrismDialog e controles atuais; mudar o contrato onSave para resultado explícito/assíncrono. Não fazer onClose incondicional após callback void.
2. Conservar rascunho por identidade de sugestão e versão base; resposta remota não reseta texto local automaticamente.
3. Enviar somente campos editáveis validados e versão esperada; identidade/autoria/parceiro não pertencem ao patch.
4. Enquanto salva, bloquear submissão duplicada. Sucesso adota versão canônica e fecha; erro mantém diálogo, valores e mensagem; conflito pede revisão, sem sobregravar.
5. Fechar/X/Escape/clique externo com alterações passa pela guarda. Escape consumido por seletor interno fecha primeiro o seletor, sem perder a edição.
6. Foco inicial, Tab/Shift+Tab, retorno ao disparador e nome do diálogo/fechar seguem Prism/React Aria. Não criar captura global de teclado.

## Testes obrigatórios

| ID  | Cenário                                                   | Resultado                                                                           |
| --- | --------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| E01 | Salvar com promise de escrita ainda pendente              | Diálogo aberto, valores intactos e apenas uma chamada após duplo clique.            |
| E02 | Escrita falha; repetir com sucesso                        | Falha mantém título/briefing/data; retry envia os mesmos valores; só sucesso fecha. |
| E03 | Versão alterada por outro cliente                         | Conflito visível; nenhuma sobrescrita automática ou perda do rascunho.              |
| E04 | Escape/X/clique externo com alterações; cancelar descarte | Texto e diálogo preservados. Confirmar descarte fecha sem salvar.                   |
| E05 | Select aberto e Escape                                    | Fecha select; editor continua aberto e texto conservado.                            |
| E06 | Tab/Shift+Tab e fechamento                                | Foco contido e depois restaurado no disparador; nomes acessíveis em pt-BR.          |
| E07 | Abrir A e depois B; receber atualização de A atrasada     | B mostra apenas seus valores; nada é substituído por A.                             |
| E08 | Editar, aprovar ou rejeitar sugestão                      | Contador de escritas em ações permanece zero.                                       |

## Acceptance criteria

- [ ] E01–E08 cobertos em integração do editor com mutação real controlada.
- [ ] Teste de falha verifica os valores no DOM após rejeitar a escrita, não só mensagem.
- [ ] Conflito/guarda são demonstrados, além de foco.
- [ ] Nenhuma alegação de aceite visual apenas por testes.

## Entrega obrigatória

- Relatório T05-evidence.md no formato do README, com cada ID de teste e evidência.
- Alterações formatadas e verificações pertinentes, sem escrever “concluído” com critério pendente.
- CURRENT atualizado apenas com fatos observados. Não alterar status de outros tickets, SQL remoto ou deploy por inferência.
