# 02: Home com altura adequada ao resumo semanal e ao mês

**What to build:** a Home mensal abre dinâmica; o resumo semanal abre com limite máximo ativado para não ocupar a página inteira em semanas cheias. Em ambos, o usuário pode ligar ou desligar “Limitar altura dos dias”. Os padrões foram aprovados junto da divisão.

**Blocked by:** 01 — Calendário do parceiro dinâmico com limite opcional.

**Status:** approved — escopo publicado no rastreador local.

- [ ] Semana inicia limitada e mês inicia automático, reutilizando a mesma política e o mesmo controle do calendário do parceiro.
- [ ] Manter uma escolha de altura independente por período durante a montagem da Home: ao retornar à semana/mês, preservar o que o usuário escolheu naquele período. Sem persistência adicional ou efeito que sobrescreva a escolha a cada renderização.
- [ ] Semana vazia ou com poucos itens continua baixa; semana cheia cresce até o teto e permite chegar à última ação de cada dia.
- [ ] Mês não mantém truncamento em cinco ações nem altura fixa por causa do antigo modo compacto. Os sete dias permanecem alinhados em cada semana.
- [ ] Remover o teto externo conflitante de 50vh ou substituí-lo pela política compartilhada, sem sobrepor limites que recortem cabeçalho, ações ou comemorações.
- [ ] Página continua alcançando as seções seguintes e a última semana; não criar uma rolagem vertical do calendário inteiro além da página e da lista limitada do dia.
- [ ] Preservar ordenação, criação, seleção e arraste; não incluir mudança da preferência global de Linha/Bloco/Conteúdo neste ticket.
- [ ] Incluir testes nos componentes reais para defaults, alternância entre períodos, escolha do usuário e acesso a mais de cinco ações. Reproduzir antes da correção qualquer recorte tratado neste ticket.
- [ ] Conferir no navegador Home semana/mês, poucos/muitos itens, comemorações, janela baixa e celular; registrar última ação acessível e navegação até as outras seções. Executar testes pertinentes, format, lint, typecheck e build; atualizar documentação. Sem deploy neste ticket.
