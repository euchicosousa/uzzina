# CAL01 — Investigar a apresentação das datas comemorativas no calendário

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Terra, para comparar feriados e vínculos nos estados visuais do calendário.
- **Anthropic** — Claude Haiku 5.5, para comparar feriados e vínculos nos estados visuais do calendário.
- **Google** — Gemini 3.8 Flash, para comparar feriados e vínculos nos estados visuais do calendário.

**Entrega** — Comparativo visual para decidir como representar feriado e vínculo com o parceiro no calendário. Hoje, a célula usa bolinha para todas as datas e classes amber diretas para diferenciar feriados.

**Bloqueios** — Nenhum.

**Status** — ready-for-agent para investigação e proposta.

- [ ] Mostrar lado a lado as quatro combinações: data comum geral, feriado geral, data comum vinculada ao parceiro e feriado vinculado ao parceiro.
- [ ] Comparar dois caminhos para feriado: círculo vazado para data comum e preenchido para feriado, ou título sem bolinha e com sublinhado apenas para feriado.
- [ ] Avaliar PrismBadge transparente para datas gerais e fundo secundário para as vinculadas. Se o fundo for reservado a feriados, demonstrar outro marcador independente para o vínculo. Conferir variantes reais do Prism e distinguir os estados sem depender só de cor.
- [ ] Conferir tema claro/escuro, títulos longos em células estreitas e identificação acessível dos estados. Mapear onde a célula é compartilhada e como identificar o vínculo com o parceiro em contexto.
- [ ] Recomendar uma composição com justificativa e critérios de aceite para eventual implementação.
