# CAL01 — apresentação de datas no calendário

[Comparativo local](../../.scratch/calendar-celebrations/comparativo-cal01.html): duas composições e as quatro combinações, com controles de tema e largura. É uma maquete HTML independente, com dados fictícios e aproximação das cores e dimensões; não renderiza o componente real do app.

## Situação e alcance

`CalendarDayCell` recebe `Celebration[]`, mostra ponto em todas as datas e usa amber direto em feriados; o título completo aparece no atributo `title`, que não é uma alternativa acessível confiável para todos os modos de entrada. `CalendarActions` e `CalendarWithDnd` a compartilham entre `HomeCalendarView` e `PartnerCalendarBoard`. O calendário do portal é separado e não herda essa célula. No parceiro, o slug identifica o contexto, mas o array atual não contém vínculo: `getPartnerHolidayIds` é usado na administração, não no calendário. Na Home, sem parceiro único, não há contexto inequívoco para atribuir um vínculo. Uma implementação precisa obter IDs autorizados para o parceiro atual, distinguir carregamento/erro de ausência de vínculo e não inferir vínculo global pela seleção administrativa. A migration local `20261101215117_partner_holiday_associations.sql` restringe `partner_holidays` a `is_holiday=true` por chave estrangeira e a RPC valida essa condição. Portanto, data comum vinculada é apenas hipótese visual: não pode ser representada pelo contrato preparado sem uma mudança de dados autorizada. O seletor lista datas comuns, mas isso não prova persistência desse vínculo. Não foi verificado o catálogo remoto nesta investigação.

## Comparação e recomendação

Recomendo **A: círculo vazado para data comum, preenchido para feriado; fundo secundário e símbolo de vínculo para a data vinculada**. Forma diferencia feriado sem depender da cor; símbolo diferencia vínculo mesmo quando o fundo é pouco perceptível. Sublinhado (B) economiza um marcador, mas pode parecer link e perder clareza sob truncamento. O símbolo da maquete é ilustrativo: na implementação escolher um ícone de vínculo legível e consistente, não necessariamente a seta mostrada.

`PrismBadge` possui variantes `ghost` e `secondary`; não há variante chamada transparente. `ghost` tem fundo transparente em repouso, mas inclui hover; `secondary` usa tokens semânticos. A base tem altura 20px, padding horizontal 8px, `shrink-0`, `overflow-hidden` e `whitespace-nowrap`: aplicar largura máxima/min-width e truncamento ao texto interno para não estourar a célula. Verificar se o hover de `ghost` faz sentido num elemento não interativo; não chamar a aproximação da maquete de Prism real. `warning` existe, mas reservar o fundo para vínculo evita atribuir dois significados à mesma superfície.

A maquete permite examinar claro/escuro e células estreitas; não comprova contraste em todas as paletas personalizadas. Título completo e estado precisam estar disponíveis sem hover, inclusive para teclado/toque e leitores de tela; rótulo acessível deve expressar “data comemorativa” ou “feriado” e, quando conhecido, “vinculada ao parceiro [nome]”. Ícones decorativos devem ficar ocultos da árvore acessível. Não transformar texto em controle sem comportamento real.

## Critérios para implementação futura

- Mostrar as quatro combinações com sinais independentes de feriado e vínculo; sem cor como única distinção.
- No parceiro, usar vínculo autorizado do parceiro em contexto; na Home definir explicitamente o comportamento sem parceiro único. Carregamento e falha não devem ser exibidos como ausência confirmada.
- Respeitar largura da célula, preservar marcadores e disponibilizar título completo em mouse, teclado, toque e leitor de tela; verificar múltiplas datas no mesmo dia.
- Conferir as variantes reais do Prism em temas claro/escuro e paletas disponíveis, contraste, foco e rolagem; manter limites de altura existentes.
- Conferir Home mensal/semanal e calendário do parceiro, com e sem vínculo; validar visualmente com o proprietário antes de decidir a composição.

Investigação estática e maquete local; sem mudanças no app, acesso ao banco, teste de leitor de tela ou validação visual pelo proprietário.
