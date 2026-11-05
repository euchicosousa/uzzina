# DS03 — Investigar as interações dos itens de ação

**Vínculo** — Subticket do [DS01](01-audit-visual-deviations.md).

**Bloqueios** — Nenhum.

**Status** — Pronto para investigação.

## Modelos sugeridos

Disponibilidade conforme conta e ferramenta.

- **OpenAI** — GPT-6.1 Sol, para rastrear eventos e estados entre seleção, edição e arraste.
- **Anthropic** — Claude Haiku 5.5, para inventariar variantes e conferir os percursos de teclado.
- **Google** — Gemini 3.8 Flash, para comparar interações e evidências por variante.

## Entrega

- [ ] Começar pelo item em linha. Mapear abertura da ação, arraste, edição do título com o PrismButton unstyled e seleção em lote. Identificar quem recebe clique, foco, Enter e Espaço e onde eventos são interrompidos.
- [ ] Percorrer as demais variantes e seus consumidores, documentando diferenças de layout e interações. Conferir seleção visual e semântica em todas, inclusive seleção por outro ponto da tela e limpeza em lote.
- [ ] Verificar com ponteiro e teclado que editar, arrastar e selecionar atuam nos alvos esperados. Propor simplificações que preservem os contratos observados e encaminhar correções separadamente.
