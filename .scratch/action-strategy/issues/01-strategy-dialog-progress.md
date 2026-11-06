# EST-01 — Progresso e resultado no diálogo aberto de estratégias

**Bloqueado por:** nenhum ticket.

## Contexto e diagnóstico
No diálogo de estratégias da gaveta (`ActionFormDrawer.tsx`), a interface apresentava dois botões de ação manual ("Conferir andamento" e "Conferir estratégias salvas") que forçavam consultas manuais ou fechavam a janela antes do término. Além disso, a instrução de seleção era exibida prematuramente antes da geração estar concluída e havia disputa de rolagem entre o diálogo e o conteúdo interno.

## Escopo
- [ ] Durante criação ou recriação, exibir o `ULoader` alinhado ao status ("Criando estratégias…", "Recriando estratégias…").
- [ ] Reservar a instrução de escolha do diálogo para quando houver de fato opções utilizáveis (`strategyOptions.length > 0`).
- [ ] Remover os botões manuais "Conferir andamento" e "Conferir estratégias salvas", tornando a atualização automática e contínua via observação do estado durável.
- [ ] Fechar voluntariamente pelo X / overlay mantém a operação durável em segundo plano sem perda de estado.
- [ ] Unificar a rolagem em uma única área dentro do diálogo, sem overflow aninhado concorrente em telas baixas e mobile.
- [ ] Exibir mensagens e ações de recuperação coerentes para estados de erro ou conflito de versão.

## Modelos sugeridos
- **OpenAI** — GPT-6.1 Sol: conciliação de estado remoto, layout de rolagem única e transições visuais.
- **Anthropic** — Claude Sonnet 5.5: verificação de acessibilidade do diálogo, aria-live e comportamento responsivo.
- **Google** — Gemini 4 Argon: validação rápida de estados reativos e limpeza de botões redundantes. Disponibilidade depende do plano.

