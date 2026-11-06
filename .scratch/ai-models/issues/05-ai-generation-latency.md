# IA-M05 — Criar indicador de progresso simulado

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Terra, para especificar os estados visuais do indicador.
- **Anthropic** — Claude Haiku 5.5, para detalhar a barra simulada e seu aceite.
- **Google** — Gemini 3.8 Flash, para propor o indicador sobre o fluxo existente.

## Entrega aprovada em 06/11

Criar componente UZZINA e demonstrar todas as props em Componentes Uzzina de /ui. Sugerir onde usar em legenda, conteúdo e estratégia. A integração será decidida depois. Todos os fluxos de IA continuam sem streaming.

- `mode` alterna barra e círculo SVG inspirado no PhaseIcon. Barra com trilho e preenchimento de 1 px, preenchimento na cor primária e largura sempre total. Círculo com arco na cor primária. `size` só atua no círculo e fica desativado no playground em modo barra.
- Cinco alvos crescentes. Exemplo: 20% em 1 s, 50% em 3 s, 85% em 6 s, 94% em 12 s e 97% em 18 s. Os alvos podem variar preservando 50% em 3 s, um terceiro alvo abaixo de 90% e duas transições posteriores com durações distintas. O último alvo fica abaixo de 99% e aguarda.
- Completar a barra só com sucesso real, inclusive se a resposta chegar cedo. Em falha, parar e mostrar o estado correspondente. Demonstrar espera, conclusão, falha e reinício. O preenchimento é simulado e o rótulo não anuncia percentagem real. Respeitar Reduzir movimento.

**Status.** Encerrado em 06/11/2026 com aceite do proprietário pela segunda vez (componente, linha das abas e barra de progresso). Componente `UAIProgressBar` criado com curva base de 30s (até 90%) e incremento de 1%/s até 99%, salto para 100% no retorno real com transição suave, variantes linha (hoje `h-0.5`, `bg-input`, sem rounded) e círculo, integrado no modal de estratégias com toast de conclusão, playground e testes automatizados 4/4.

## Histórico

Os logs de diagnóstico de `8a9f035` foram revertidos em `0cbe014`. [Reestudo anterior](../../../docs/audits/2026-11-06-ia-m05-contornar-espera.md).
