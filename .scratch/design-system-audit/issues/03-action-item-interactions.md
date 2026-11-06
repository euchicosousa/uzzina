# DS03 — Investigar as interações dos itens de ação

**Vínculo** — Subticket do [DS01](01-audit-visual-deviations.md).

**Bloqueios** — Nenhum.

**Status** — investigação entregue; correções propostas para decisão do proprietário

## Modelos sugeridos

Disponibilidade conforme conta e ferramenta.

- **OpenAI** — GPT-6.1 Sol, para rastrear eventos e estados entre seleção, edição e arraste.
- **Anthropic** — Claude Haiku 5.5, para inventariar variantes e conferir os percursos de teclado.
- **Google** — Gemini 3.8 Flash, para comparar interações e evidências por variante.

## Entrega

- [ ] Começar pelo item em linha. Mapear abertura da ação, arraste, edição do título com o PrismButton unstyled e seleção em lote. Identificar quem recebe clique, foco, Enter e Espaço e onde eventos são interrompidos.
- [ ] Percorrer as demais variantes e seus consumidores, documentando diferenças de layout e interações. Conferir seleção visual e semântica em todas, inclusive seleção por outro ponto da tela e limpeza em lote.
- [ ] Verificar com ponteiro e teclado que editar, arrastar e selecionar atuam nos alvos esperados. Propor simplificações que preservem os contratos observados e encaminhar correções separadamente.

## Execução — 06/11/2026

Relatório: [2026-11-06-ds03-action-item-interactions](../../../docs/audits/2026-11-06-ds03-action-item-interactions.md). Investigação por leitura de código, sem alterar o app nem reproduzir no navegador.

- Em modo seleção, o clique no título edita em vez de selecionar (o botão do título consome o evento).
- No Sprint, Space/Enter dentro do input de título podem iniciar arraste por teclado; o título (botão React Aria) também não funciona como alça de arraste e há três tab stops aninhados por item.
- Propostas de tickets DS03-A a DS03-F (seleção, arraste vs edição, alça/largura, semântica, toque, limpeza), a decidir pelo proprietário.
