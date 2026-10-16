# 01: Calendário do parceiro dinâmico com limite opcional

**What to build:** o calendário do parceiro abre com altura conforme as ações e permite ativar “Limitar altura dos dias”. Poucos itens ocupam pouco espaço; dias cheios passam a rolar apenas quando o limite está ativado. A última ação e a última semana permanecem acessíveis, com ou sem feed lateral.

**Blocked by:** None (can start immediately).

**Status:** complete — implementado, aprovado pelo proprietário e publicado em16/10; deploy de código Ready.

- [x] Linha, Bloco e Conteúdo iniciam com altura automática, sem reservar 288/384 px e sem esconder ações após o quinto item.
- [x] Um único controle “Limitar altura dos dias” funciona nos três modos. Trocar o modo preserva a escolha de altura durante a montagem da tela; não adicionar persistência ou SQL.
- [x] A política compartilhada tem padrão automático e admite uma escolha inicial explícita pela tela, sem novo sistema de configuração. A separação mínima entre tamanho e truncamento ocorre junto desta entrega, sem refatoração ampla.
- [x] Cada semana se ajusta ao dia mais alto, preservando alinhamento dos sete dias. Semanas com menos conteúdo podem ser menores, sem equalizar o mês inteiro.
- [x] Com limite, cada dia cresce até o teto acordado; poucos itens não forçam a altura máxima. Referência proposta: 384 px, respeitando espaço útil de janela baixa. Registrar o teto efetivamente validado.
- [x] Cabeçalho do dia, criação e comemorações permanecem acessíveis. As duas listas do modo Conteúdo compartilham uma única área de rolagem de ações; imagens não ficam inacessíveis após carregar.
- [x] A navegação vertical do painel alcança a última semana; rolagem horizontal mobile e feed independente continuam funcionando. Sem cortar conteúdo silenciosamente.
- [x] Antes da correção, reproduzir o defeito pertinente no componente real e incluir regressão que falhe no comportamento anterior. Testar menu, mais de cinco ações, preservação de modo/limite e ausência de regressões em outros consumidores da lista compartilhada.
- [x] Verificar geometria e rolagem no navegador com dias vazios/cheios, títulos longos, imagens, comemorações, janela baixa e celular; verificar teclado, seleção e arraste com lista rolada, preservando horário e comportamento de salvamento.
- [x] Atualizar demonstração existente de opções na galeria, contratos documentados e estado atual. Executar testes pertinentes, format, lint, typecheck e build. Distinguir código local de publicação; deploy não faz parte deste ticket.

## Resultado

Verificação e limites registrados em `docs/audits/2026-10-16-calendar-height-study.md`: suíte geral com379 testes, verificações de código/build aprovadas e navegador com componentes reais/HTTP controlado. Sem SQL. Código publicado pelo commit `2d4add5`, deploy `dpl_6M2QW5dxu34RoFyHUUCU1pTKERdk` Ready; domínio /app respondeu HTTP200.
