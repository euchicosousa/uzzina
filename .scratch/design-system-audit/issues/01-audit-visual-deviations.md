# DS01 — Corrigir desvios visuais já inventariados

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Terra, para inventariar desvios visuais e cruzar achados com o V44.
- **Anthropic** — Claude Haiku 5.5, para inventariar desvios visuais e cruzar achados com o V44.
- **Google** — Gemini 3.8 Flash, para inventariar desvios visuais e cruzar achados com o V44.

**Entrega** — Inventário verificável de estilos fora do design system da UZZINA, com propostas de padronização e encaminhamento por achado. Usar o [V44](../../visual-controls/issues/44-audit-custom-components-for-prism.md) como referência para equivalentes de componentes e evitar duplicar seus achados.

**Bloqueios** — Nenhum.

**Status** — Em execução. [Inventário inicial e revisão independente do V44](../../../docs/audits/2026-11-05-ds01-visual-deviations.md). Cobertura por rota e comparação visual pendentes.

- [ ] Cobrir cores, padrões de componentes e estados, tipografia, dimensões, espaçamento, bordas, raios, sombras e foco. Registrar tela/componente, estilo atual, referência Prism ou token aplicável e evidência verificável.
- [ ] Começar pelas classes amber do feriado no calendário. Comparar com as cores semânticas e paletas do sistema em claro/escuro, considerando significado e contraste além de proximidade visual. Cruzar com o [CAL01](../../calendar-celebrations/issues/01-calendar-celebration-markers.md).
- [ ] Classificar cada caso como substituição por equivalente existente, lacuna que merece proposta de padrão ou exceção justificada. Registrar prioridade e escopo da troca.
- [ ] Propor tickets de implementação agrupados por mudança verificável, identificando quais achados cabem em tickets existentes e quais justificam novos tickets ou a substituição de um ticket sobreposto.

## Execução unificada com V44

O V44 é a referência de controles e contratos. Este ticket executa as correções já identificadas e a [segunda etapa DS02](02-route-coverage-and-visual-review.md) cobre a matriz de rotas e o aceite visual.

- [x] Remover os dois componentes legados, mantendo o comportamento de conversão de cores nos fluxos de lote.
- [x] Usar variantes semânticas nos badges de Leads, manter texto clicável nos checkboxes de Data/Hora com o rótulo Prism e retirar a classe solta da AppBar.
- [x] Padronizar botões dos banners e fechamento da gaveta, controles de editar/excluir comentário e ações de audiência/cancelar/enviar; itens de menção usam geometria Prism padrão. Formatação e `bun run typecheck` passaram. Proprietário conferiu o botão Fechar e o percurso de teclado da gaveta.
- [ ] Prosseguir pelos lotes de controles, formulários, gaveta e editor do V44, preservando contratos de foco e teclado. Tratar a apresentação de datas no CAL01 e coordenar o recorte de Planejamento com a série existente.
- [ ] Encaminhar as diferenças renderizadas ao DS02. A padronização é o padrão de execução. Uma inadequação visual documentada pode fundamentar novo token, variante ou exceção.

## Revisão dos lotes A–C antes do lote D — 05/11

Base da revisão estática: `cf533cb` até o checkout local, incluindo o commit `3e648fe`. Cobertura de navegador permanece no DS02.

- [x] **C · Identidade do formulário.** Proprietário aceitou o lote. A instância agora usa a identidade da rota para reiniciar campos ao trocar de pessoa ou criar uma nova.
- [x] **A · Anexos do portal.** Removidas as miniaturas externas. Sem anexos, botão Adicionar arquivos com +. Com anexos, Gerenciar arquivos abre o diálogo compartilhado com Instagram e o botão + mantém nome acessível. Conferência visual no DS02.
- [x] **B · Geometria aceita.** Proprietário confirmou as colunas em xs e sm. Células lg requerem um diálogo que comporte o calendário.
- [ ] **B · Dar destino ao seletor de cor em lote.** A mudança feita migra o import de `toHex`. Registrar se a composição atual permanece por contrato ou se cabe a troca pelo seletor Prism, preservando seleção e teclado.
- [ ] **A–C · Aceite renderizado.** Conferir notificações no sino e na página, seletor mobile da Ajuda, calendário do portal, formulários Admin/Auth e Minha Conta. Incluir fluxo de teclado e estados com dados controlados.

O lote D é isolado no editor e não depende dessas correções. Manter os achados A–C abertos até resolver e conferir.
