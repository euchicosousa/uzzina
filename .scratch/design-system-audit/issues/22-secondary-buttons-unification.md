# DS22 — Unificar os botões secundários de adicionar dentro das seções

**Status.** **Encerrado com aceite do proprietário em 16/11/2026; commitado (sem push).** Estudo entregue em 16/11/2026 ([relatório completo](../../../docs/audits/2026-11-16-ds22-secondary-buttons-study.md)). **Decidido e implementado localmente em 16/11/2026, sem commit; falta o aceite visual.**

## O que a pessoa vê hoje

Na página de edição de um parceiro (**Admin → Parceiros → abrir um parceiro**), dois botões de "adicionar item" ficam um logo acima do outro e parecem diferentes:

1. **Adicionar Cor** (em **Cores da Marca**): botão com contorno fino e fundo transparente, com o sinal de + à direita.
2. **Novo tópico** (na seção **Tópicos**, logo abaixo): botão com fundo cinza, com o sinal de + à direita.

Os dois têm o mesmo tamanho. A única diferença visível é o estilo do botão (contorno contra fundo cinza).

Outros botões de "adicionar" dentro de seções têm estilos diferentes:

- Na gaveta de ação, aba **ESSENCIAL**, "Adicionar arquivo" aparece como texto sublinhado, sem fundo.
- Na aba **INSTAGRAM**, "Adicionar conteúdo" e no diálogo de reordenar conteúdo, "Adicionar", aparecem menores que os outros.
- No planejamento, "Novo / Trocar proposta" tem contorno, como "Adicionar Cor".
- Os três botões de IA da gaveta (**Criar** / **Recriar estratégias** e **Gerar legenda**) são cinza, sem ícone.

## O que o levantamento encontrou

Foram revisados os botões de `app/routes/` e `app/components/` (exceto a galeria `/ui`). Resumo (detalhes e arquivos no relatório):

- **10 botões de texto** para adicionar ou gerar dentro de seção: 4 cinza tamanho médio, 2 com contorno tamanho médio, 3 cinza tamanho pequeno (upload), 1 texto sublinhado.
- **4 botões só com ícone** para adicionar ou criar (um deles no calendário e dois nos quadros, aparecem ao passar o mouse).
- A galeria `/ui` não documenta uma variante padrão para "adicionar dentro de seção"; só a regra do sinal de + à direita, que o padrão já segue.

## Proposta

**Recomendação principal: botão cinza (`secondary`), tamanho médio (`sm`), sinal de + à direita do texto.**

Antes → depois, nos 6 botões que mudariam:

| Botão                                  | Antes            | Depois      |
| -------------------------------------- | ---------------- | ----------- |
| Adicionar Cor (Cores da Marca)         | contorno         | cinza       |
| Novo / Trocar proposta (Planejamento)  | contorno         | cinza       |
| Adicionar arquivo (gaveta, ESSENCIAL)  | texto sublinhado | cinza       |
| Adicionar conteúdo (gaveta, INSTAGRAM) | cinza pequeno    | cinza médio |
| Adicionar (reordenar conteúdo)         | cinza pequeno    | cinza médio |
| Adicionar arquivos (portal `/dash`)    | cinza pequeno    | cinza médio |

Não muda: **Novo tópico** (já é cinza médio), botão de enviar de **Adicionar data**, botões de criar ação no calendário e nos quadros, e os três botões de IA.

**Alternativa (evidência próxima):** contorno médio (`outline`), com o mesmo sinal de +. Muda 5 botões, inclusive o Novo tópico, em vez de 6.

## O que o proprietário precisa decidir

1. Qual estilo adotar para "adicionar item dentro de seção": **cinza médio** (recomendado) ou **contorno médio**.
2. Se os botões de upload (adicionar conteúdo, adicionar arquivos, adicionar) podem passar de pequenos para médios.
3. Se os três botões de IA (criar/recriar estratégias e gerar legenda) devem ganhar um ícone de faísca à direita, como o "Gerar planejamento" já tem. Essa decisão é separada da unificação.

**O que olhar antes de aprovar:** abrir **Admin → Parceiros → um parceiro**, rolar até **Cores da Marca** e **Tópicos**, e comparar os dois botões de adicionar. Depois, na gaveta de uma ação de Instagram, comparar "Adicionar conteúdo" com o botão de estratégias.

## Onde está

- Estudo e levantamento: `docs/audits/2026-11-16-ds22-secondary-buttons-study.md` (no repositório, sem alteração no app).
- Código: nenhum arquivo do app foi alterado. A mudança prevista toca 6 arquivos, listados no relatório.
- Ainda falta: a decisão do proprietário, a implementação e a validação visual no app.

## Decisão do proprietário (16/11/2026) e implementação

O padrão dos botões de adicionar dentro das seções é **fundo cinza (`secondary`), tamanho pequeno (`sm`)**, considerando o contexto de cada tela:

- **Mudam para `secondary` `sm`:** "Adicionar Cor" (Admin → Parceiro → Cores da Marca, `UPaletteEditor.tsx`) e "Novo / Trocar proposta" (Planejamento, `planejamento.tsx`). Antes: contorno (`outline`).
- **Ficam como estão:**
  - "Adicionar arquivo" no portal do cliente, com cara de link, para casar com o elemento de cima;
  - "Adicionar conteúdo" e "Adicionar arquivos" (`secondary` `xs`), pelo contexto em que aparecem;
  - os quatro que já eram `secondary` `sm` (Novo tópico, Criar/Recriar estratégias, Recriar estratégias, Gerar legenda).
- **Fora deste ticket:** os botões de IA sem ícone, apontados no estudo.

Verificação: typecheck sem erros. Aceite visual pendente: Admin → Parceiro (Adicionar Cor ao lado de Novo tópico) e Planejamento com uma proposta aberta.

## Modelos sugeridos

- **Claude Code — Haiku 5.5.** Opção mais leve e suficiente: a mudança é mecânica (trocar `variant` e `size` em 6 pontos já mapeados no relatório, sem lógica nova). Confira a disponibilidade no plano.
- **Claude Code — Sonnet 5.5.** Opção de equilíbrio se o proprietário escolher a alternativa com contorno e quiser revisar também os textos de IA e o ícone de faísca em uma passada só.
- **Codex — GPT-6 Luna.** Alternativa leve para aplicar as mesmas trocas de `variant` e `size`, com conferência de diff no fim. Confirme a disponibilidade na ferramenta antes de usar.
