# KEYBOARD-FOCUS-04 — Comparação visual dos estados de foco

**Status (22/11/2026): implementado na main local, aguardando conferência visual no app.** A galeria conserva as amostras anteriores para comparação com o anel primário de 3 px e offset zero.

**Onde conferir.** Abra `docs/audits/focus-state-gallery.html` em um navegador desktop. No topo, selecione uma das dez paletas e o modo claro/escuro. Em cada card, compare **Atual** (esquerda) com **Proposta** (direita).

**O que este ticket entrega.** Um levantamento dos tipos de foco do app, com matriz prática **Antes × Depois** e amostras comparativas. Abre em `docs/audits/focus-state-gallery.html`; escolha paleta e modo e compare cada painel. Foco por fundo ou sublinhado passa ao mesmo ring; seleção, arraste, hover e estados semânticos ficam identificados como não foco.

## Implementação aprovada

O proprietário conferiu a galeria e escolheu espessura 3 px e offset zero. O app local recebe um contorno único no foco visível, com seletores globais que encaminham o indicador ao alvo visual composto. A conferência visual do app e a publicação continuam pendentes.

## Escopo atual

- Preservar cada amostra atual como está e identificá-la como **Atual**.
- Ao lado, duplicar a amostra como **Proposta**, aplicando visualmente em todos os tipos `ring-3 ring-primary ring-offset-0`; o padrão é a decisão registrada do proprietário.
- O ring usa a cor primária da paleta selecionada. A configuração escolhida encosta o anel no controle. Selecione paleta e modo para conferir todas as cores relevantes sem matriz extensa.
- Logo abaixo do índice, manter toggles para o offset `1`, `2` e `0` (sem offset) e a espessura `2`, `3` e `4` px. Iniciar em `0` e `3`; as opções atualizam ao vivo todas as amostras da Proposta, mantendo a coluna Atual intacta e mostrando as classes equivalentes.
- Incluir no levantamento os tipos encontrados na galeria `/ui` e nos usos do app: ring normal/semântico, ring interno, grupos `focus-within`, foco por fundo, abas e segmento de hora, sublinhado, ausência de indicador local, controles sobre imagem e fallback global.
- Marcar como inalterados os estados que não são foco: seleção, arraste, hover, dia-alvo e conteúdo semântico persistente.
- Organizar cards em grade ampla para monitor ultrawide 21:9, mantendo comparação Atual | Proposta lado a lado. Em telas comuns, quebrar os cards e, em telas estreitas, empilhar os dois lados sem rolagem horizontal.
- Manter a página autônoma, sem login, rede externa ou acesso/escrita no banco.
- Documentar de quais componentes/rotas vêm as amostras e os limites da réplica HTML.

## Fora do escopo

- Alterar paletas ou a ordem de navegação por teclado.
- Corrigir os tratamentos atuais ou aprovar a proposta em nome do proprietário.
- Publicar a página ou certificar contraste/WCAG.

## Critérios de conferência

- [x] Os padrões e referências do inventário permanecem identificados.
- [x] Matriz completa resume antes/depois por tipo de foco e lista pontos de referência no código.
- [x] Cada card mostra o tratamento atual preservado ao lado da mesma amostra com a proposta uniforme.
- [x] Foco por fundo ou sublinhado aparece como ring na proposta; estados de seleção/arraste/hover estão separados como não foco.
- [x] Seletor acessível às 10 paletas e aos modos claro/escuro; resumo mostra primária, anel e fundo do tema ativo.
- [x] Toggles independentes alteram em tempo real a espessura do ring (`2`, `3`, `4`) e o offset (`1`, `2`, `0`/sem offset) em todas as propostas, sem modificar as amostras atuais.
- [x] Grade otimizada para largura ultrawide e responsiva em larguras comuns, sem exigir rolagem horizontal.
- [x] HTML/script locais, sem dependências externas.
- [x] O app local recebeu a implementação aprovada.
- [x] O proprietário conferiu visualmente a proposta e autorizou a implementação com offset zero.
- [ ] Conferir o app após a mudança.

## Modelos sugeridos

- Codex — GPT-6.2 Sol. Para atualizar a matriz HTML e as réplicas sem alterar o app.
- Luna — Gemini 3 Flash (se disponível no plano). Para revisar a cobertura das famílias de foco e a leitura objetiva do antes/depois.
- Codex — GPT-6.2 Astra. Para revisar os casos compostos, estados semânticos e exceções em que o ring pode ser cortado.
