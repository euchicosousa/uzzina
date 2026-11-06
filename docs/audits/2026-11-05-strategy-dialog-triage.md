# Estratégias na gaveta — proposta de tickets

Relato e capturas do proprietário de 05/11/2026. Os dois trabalhos são independentes do IA-M03. A investigação foi estática e acompanhada de leitura do registro de produção. As duas gerações de estratégias do ensaio ficaram em `succeeded` com custo conciliado. As capturas mostram os sintomas do diálogo mesmo com a operação concluída.

## EST-01 — Mostrar progresso e resultado no diálogo aberto

**Bloqueado por** nenhum ticket.

- [x] Durante criação ou recriação, exibir o Loader existente e o status alinhado ao cabeçalho e à lista. Reservar a instrução de escolha para quando houver opções utilizáveis. Se houver resultado anterior durante recriação, distingui-lo do resultado em andamento.
- [x] Remover “Conferir andamento” e “Conferir estratégias salvas”. O primeiro força uma consulta de status e o segundo fecha o diálogo e consulta a versão remota. A observação já existente deve atualizar o diálogo aberto, mantendo sinalização visível até o desfecho. Fechar voluntariamente mantém a operação durável.
- [x] Erros e conflitos mostram estado e ação de recuperação coerentes. Ação explícita do usuário que inicia leitura, geração ou gravação mostra progresso e desfecho. Chegada de resultados preserva o diálogo fechado e o controle de versão.
- [x] Uma única área de rolagem dentro do diálogo, inclusive com item expandido em janela baixa e no celular. O diálogo e o conteúdo hoje disputam a rolagem.
- [x] Demonstrar criação sem opções, recriação com opções anteriores, sucesso, falha e fechamento voluntário.

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Sol, para conciliar estado remoto, foco e layout.
- **Anthropic** — Claude Sonnet 5.5, para conferir transições e comportamento do diálogo.
- **Google** — Gemini 4 Argon, para conferir estados e rolagem. Disponibilidade depende do plano.

## EST-02 — Permitir trocar a estratégia selecionada após salvar

**Bloqueado por** nenhum ticket. Coordenar a ordem de edição com EST-01 porque ambos tocam o mesmo diálogo.

- [ ] Selecionar uma opção, aguardar o salvamento e conseguir trocar para outra sem fechar o diálogo. A seleção é exclusiva e a troca preserva a atualização de título prevista.
- [ ] Mostrar progresso enquanto a seleção estiver sendo persistida. Reabilitar as opções depois de confirmação. Falha e conflito ficam visíveis, com recuperação e preservação da guarda de concorrência.
- [ ] “Usar esta estratégia” funciona com a opção confirmada e sinaliza a geração de conteúdo. Trocar seleção sozinha segue o comportamento atual de atualização da ação.
- [ ] Investigar as condições de bloqueio e o descompasso entre prévia e versão canônica. As capturas confirmam os controles bloqueados, mas a causa exata da persistência do bloqueio exige reprodução.

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Sol, para rastrear confirmação da gravação e destravar a troca.
- **Anthropic** — Claude Sonnet 5.5, para investigar versão canônica e estado local.
- **Google** — Gemini 4 Argon, para reproduzir a seleção e conferir recuperação. Disponibilidade depende do plano.
