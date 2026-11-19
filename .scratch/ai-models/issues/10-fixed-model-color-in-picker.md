# IA-M10 — Usar fundo fixo da cor no seletor de modelos de IA

**Status.** Aguardando retomada pelo proprietário.

**Bloqueado por.** Nenhuma dependência técnica identificada.

## O que mudar

O seletor mostra a marca do provedor dentro de um anel cujo preenchimento indica o nível do modelo. Trocar esse anel por um fundo sólido na cor hoje associada ao modelo, mantendo a marca legível. A cor atual vem do nível e pode ser compartilhada por vários modelos. A primeira proposta usa essa associação existente. O fundo colorido ocupa a área do ícone que hoje fica dentro do anel.

Conferir em Planejamento → Por tema, ao lado de Gerar planejamento, na gaveta da ação (Essencial → Estratégias e Instagram → Conteúdo e Legenda), em Minha Conta → Modelos de IA por tarefa e na galeria /ui. Minha Conta usa o mesmo ícone também fora do seletor.

## Hover conferido no app

- O botão Prism padrão mistura no fundo e na borda a cor primária com 20% da cor do fundo da página em OKLab. É a variante usada pelo seletor no Planejamento.
- A variante secundária, usada também na gaveta e em Minha Conta, mistura fundo e borda com 5% da cor do texto em OKLCH. A variante contornada usa o token de fundo secundário ao passar o mouse.
- Nas opções da lista, o comando Prism usa o fundo secundário em foco ou seleção. O token de hover neutro do tema também varia por modo, com luminosidade OKLCH de fundo −0,083 no claro e +0,133 no escuro. Esses incrementos são relativos ao fundo da página e diferentes da mistura aplicada pelo botão.
- Na retomada, preservar o hover Prism da variante e da lista. Se o próprio fundo colorido do ícone também precisar mudar ao passar o mouse, comparar com o proprietário a proposta de escurecer 10% no claro e clarear 10% no escuro. Essa proposta introduz uma regra local para o ícone e não aparece como regra geral do seletor atual.

Fontes no código e no contrato do design system. [Seletor compartilhado](../../../app/components/uzzina/UAIModelSelect.tsx) · [Botão Prism](../../../app/components/prism/button.tsx) · [Opções do comando](../../../app/components/prism/command.tsx) · [Tokens do tema](../../../app/tailwind.css) · [Contrato Prism](../../../docs/contracts/prism-details.md#estados-ícones-e-verificação)

## Aceite

- [ ] No botão e nas opções da lista, a marca do provedor aparece sobre fundo sólido na cor do modelo, sem o arco de intensidade. Os usos diretos do mesmo ícone em Minha Conta mantêm o desenho consistente.
- [ ] Comparar os níveis em claro e escuro e confirmar contraste da marca e do texto em repouso, hover, foco, seleção e indisponibilidade. O nome acessível do modelo escolhido e o indicador de seleção permanecem claros.
- [ ] Percorrer a lista por teclado e confirmar a seleção e o retorno de foco. Conferir a versão compacta, a versão com nome e a integração no grupo de botões do Planejamento e da gaveta.
- [ ] Confirmar na galeria e no app o comportamento do fundo sob hover. A mudança visual preserva seleção, catálogo, preferências, disponibilidade e franquia.

## Modelos sugeridos

- **Codex · GPT-6.1 Terra, esforço baixo** — para comparar o contraste claro e escuro e validar o ícone nas variantes compartilhadas.
- **Codex · GPT-6.2 Sol, esforço baixo** — para implementar o fundo com os estilos Prism existentes e conferir teclado, escolha e foco.
- **Codex · GPT-6.2 Astra, esforço baixo** — para revisar diferenças entre o botão, as opções da lista e os usos diretos do ícone.
