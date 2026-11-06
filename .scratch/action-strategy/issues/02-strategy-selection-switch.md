# EST-02 — Permitir trocar a estratégia selecionada após salvar

**Bloqueado por:** nenhum ticket (coordenar edição com EST-01 pois ambos atuam no modal da gaveta).

## Contexto e diagnóstico
Ao gerar ou reabrir estratégias, a seleção de uma opção travava os controles de escolha indefinidamente caso o estado do coordenador ou do diálogo permanecesse bloqueado por `strategyControlsBlocked` ou `isDurablePreview`. O usuário ficava impedido de trocar de opção para outra estratégia sem fechar e recarregar a gaveta.

## Escopo
- [ ] Permitir selecionar uma opção, persistir a alteração no banco e conseguir trocar para outra opção assim que a gravação anterior for concluída.
- [ ] Exibir indicador visual de progresso claro enquanto a seleção estiver sendo persistida.
- [ ] Reabilitar as opções após confirmação ou cancelamento da gravação.
- [ ] Tratar falhas ou conflitos de concorrência com indicação visual compreensível e ação de recuperação sem desrespeitar o controle de versão.
- [ ] Garantir que "Usar esta estratégia" funcione de ponta a ponta com a opção confirmada, gerando o conteúdo e atualizando a ação.

## Modelos sugeridos
- **OpenAI** — GPT-6.1 Sol: rastreamento de confirmação de gravação e liberação reativa dos seletores.
- **Anthropic** — Claude Sonnet 5.5: investigação de versão canônica, controle de conflito e transições de estado.
- **Google** — Gemini 4 Argon: testes de troca e validação de concorrência. Disponibilidade depende do plano.

