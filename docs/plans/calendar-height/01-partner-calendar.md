# 01: Calendário do parceiro dinâmico com limite opcional

**What to build:** o calendário do parceiro abre com altura conforme as ações e permite ativar “Limitar altura dos dias”. Poucos itens ocupam pouco espaço; dias cheios passam a rolar apenas quando o limite está ativado. A última ação e a última semana permanecem acessíveis, com ou sem feed lateral.

**Blocked by:** None (can start immediately).

**Status:** approved — escopo publicado no rastreador local.

- [ ] Linha, Bloco e Conteúdo iniciam com altura automática, sem reservar 288/384 px e sem esconder ações após o quinto item.
- [ ] Um único controle “Limitar altura dos dias” funciona nos três modos. Trocar o modo preserva a escolha de altura durante a montagem da tela; não adicionar persistência ou SQL.
- [ ] A política compartilhada tem padrão automático e admite uma escolha inicial explícita pela tela, sem novo sistema de configuração. A separação mínima entre tamanho e truncamento ocorre junto desta entrega, sem refatoração ampla.
- [ ] Cada semana se ajusta ao dia mais alto, preservando alinhamento dos sete dias. Semanas com menos conteúdo podem ser menores, sem equalizar o mês inteiro.
- [ ] Com limite, cada dia cresce até o teto acordado; poucos itens não forçam a altura máxima. Referência proposta: 384 px, respeitando espaço útil de janela baixa. Registrar o teto efetivamente validado.
- [ ] Cabeçalho do dia, criação e comemorações permanecem acessíveis. As duas listas do modo Conteúdo compartilham uma única área de rolagem de ações; imagens não ficam inacessíveis após carregar.
- [ ] A navegação vertical do painel alcança a última semana; rolagem horizontal mobile e feed independente continuam funcionando. Sem cortar conteúdo silenciosamente.
- [ ] Antes da correção, reproduzir o defeito pertinente no componente real e incluir regressão que falhe no comportamento anterior. Testar menu, mais de cinco ações, preservação de modo/limite e ausência de regressões em outros consumidores da lista compartilhada.
- [ ] Verificar geometria e rolagem no navegador com dias vazios/cheios, títulos longos, imagens, comemorações, janela baixa e celular; verificar teclado, seleção e arraste com lista rolada, preservando horário e comportamento de salvamento.
- [ ] Atualizar demonstração existente de opções na galeria, contratos documentados e estado atual. Executar testes pertinentes, format, lint, typecheck e build. Distinguir código local de publicação; deploy não faz parte deste ticket.
