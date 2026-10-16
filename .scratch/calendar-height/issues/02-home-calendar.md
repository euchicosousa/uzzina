# 02: Home com altura adequada ao resumo semanal e ao mês

**What to build:** a Home mensal abre dinâmica; o resumo semanal abre com limite máximo ativado para não ocupar a página inteira em semanas cheias. Em ambos, o usuário pode ligar ou desligar “Limitar altura dos dias”. Os padrões são proposta para aprovação nesta divisão.

**Blocked by:** 01 — Calendário do parceiro dinâmico com limite opcional.

**Status:** complete — implementado, aprovado pelo proprietário e publicado em16/10; deploy de código Ready.

- [x] Semana inicia limitada e mês inicia automático, reutilizando a mesma política e o mesmo controle do calendário do parceiro.
- [x] Manter uma escolha de altura independente por período durante a montagem da Home: ao retornar à semana/mês, preservar o que o usuário escolheu naquele período. Sem persistência adicional ou efeito que sobrescreva a escolha a cada renderização.
- [x] Semana vazia ou com poucos itens continua baixa; semana cheia cresce até o teto e permite chegar à última ação de cada dia.
- [x] Mês não mantém truncamento em cinco ações nem altura fixa por causa do antigo modo compacto. Os sete dias permanecem alinhados em cada semana.
- [x] Remover o teto externo conflitante de 50vh ou substituí-lo pela política compartilhada, sem sobrepor limites que recortem cabeçalho, ações ou comemorações.
- [x] Página continua alcançando as seções seguintes e a última semana; não criar uma rolagem vertical do calendário inteiro além da página e da lista limitada do dia.
- [x] Preservar ordenação, criação, seleção e arraste; não incluir mudança da preferência global de Linha/Bloco/Conteúdo neste ticket.
- [x] Incluir testes nos componentes reais para defaults, alternância entre períodos, escolha do usuário e acesso a mais de cinco ações. Reproduzir antes da correção qualquer recorte tratado neste ticket.
- [x] Conferir no navegador Home semana/mês, poucos/muitos itens, comemorações, janela baixa e celular; registrar última ação acessível e navegação até as outras seções. Executar testes pertinentes, format, lint, typecheck e build; atualizar documentação. Sem deploy neste ticket.

## Resultado

Verificação e limites registrados em `docs/audits/2026-10-16-calendar-height-study.md`: suíte geral com379 testes, verificações de código/build aprovadas e navegador com componentes reais/HTTP controlado. Sem SQL. Código publicado pelo commit `2d4add5`, deploy `dpl_6M2QW5dxu34RoFyHUUCU1pTKERdk` Ready; domínio /app respondeu HTTP200.
