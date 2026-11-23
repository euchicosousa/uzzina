# KEYBOARD-FOCUS-04 — Comparação visual dos estados de foco

**Status (22/11/2026): correção commitada e enviada a `main` em `710672b`; app publicado ainda não conferido.** A captura mostra o item “Minha Conta” com contorno de teclado e fundo secondary ao mesmo tempo. O foco de teclado agora suprime o fundo hover no mesmo alvo, inclusive com o ponteiro parado sobre ele. O encerramento anterior fica registrado como histórico, não como aceite vigente.

**Onde conferir.** Abra `docs/audits/focus-state-gallery.html` em um navegador desktop. No topo, selecione uma das dez paletas e o modo claro/escuro. Em cada card, compare **Atual** (esquerda) com **Proposta** (direita).

**O que este ticket entrega.** Um levantamento que separa foco visível por teclado de hover, seleção/checagem, estado aberto e foco de gerenciamento React Aria. A galeria `docs/audits/focus-state-gallery.html` compara **Atual × Proposta** por paleta e modo; apenas as amostras de foco por teclado recebem o contorno uniforme. Outros estados mantêm seus próprios indicadores.

## Histórico da implementação anterior

O proprietário conferiu a galeria e escolheu espessura 3 px e offset zero. O app local recebeu um contorno único no foco visível, com seletores globais que encaminham o indicador ao alvo visual composto. Em 22/11, o proprietário confirmou o resultado e pediu o encerramento. Depois, relatou que o ticket deu um problema grave e pediu para reabri-lo, especialmente para conferir o HTML. A causa e os sintomas concretos ainda precisam ser descritos e reproduzidos.

## Retomada da conferência

- **Estudo estático concluído em 22/11:** o CSS global condiciona o contorno a `:focus-visible`/`[data-focus-visible]`. Menus Prism mantêm fundo de hover (`data-hovered:bg-secondary`) e recebem ring no foco de teclado; Tabs mantêm hover e seleção, mas perderam o antigo fundo adicional de `data-focus-visible`; no menu do Header, o item “Sair” perdeu o fundo vermelho de `focus` e conserva texto de erro e hover. O código não mostra ring causado apenas por hover ou seleção.
- **Evidência nova:** a captura do menu do Header mostra que hover e foco de teclado podem coexistir no mesmo item; embora o ring seja de teclado, o fundo secondary de hover também aparece. O defeito é essa combinação visual, não o contorno de teclado.
- A lacuna está na classificação e demonstração: o HTML usa amostras estáticas e dá ring a exemplos marcados por classe como “focados”, sem separar foco de teclado, foco de gerenciamento React Aria, hover, selecionado e aberto. A tabela anterior também agrupava esses casos como foco, sem distinguir a origem.
- A galeria `docs/audits/focus-state-gallery.html` foi atualizada após o estudo: matriz separa foco de teclado, hover, seleção/checagem e aberto; amostras estáticas do menu do Header e da PrismTab comparam repouso, hover, Tab e seleção quando aplicável. Essa página não executa React Aria e não certifica comportamento real; a próxima etapa é a conferência visual do proprietário.
- A aprovação anterior não cobre esta apresentação revisada. O proprietário autorizou corrigir e publicar a distinção; a leitura do código não encontrou lacuna adicional no app: foco de teclado já recebe ring em `b5d25a25`, enquanto hover e seleção permanecem separados. Portanto esta correção atualiza a galeria e os registros; o comportamento no app publicado ainda depende de conferência no navegador.

## Escopo original (em revisão)

- Preservar cada amostra atual como está e identificá-la como **Atual**.
- Ao lado, duplicar a amostra como **Proposta**, aplicando visualmente em todos os tipos `ring-3 ring-primary ring-offset-0`; o padrão é a decisão registrada do proprietário.
- O ring usa a cor primária da paleta selecionada. A configuração escolhida encosta o anel no controle. Selecione paleta e modo para conferir todas as cores relevantes sem matriz extensa.
- Logo abaixo do índice, manter toggles para o offset `1`, `2` e `0` (sem offset) e a espessura `2`, `3` e `4` px. Iniciar em `0` e `3`; as opções atualizam ao vivo todas as amostras da Proposta, mantendo a coluna Atual intacta e mostrando as classes equivalentes.
- Incluir no levantamento os tipos encontrados na galeria `/ui` e nos usos do app: ring normal/semântico, ring interno, grupos `focus-within`, foco por fundo, abas e segmento de hora, sublinhado, ausência de indicador local, controles sobre imagem e fallback global.
- Marcar como inalterados os estados que não são foco: seleção, arraste, hover, dia-alvo e conteúdo semântico persistente.
- Organizar cards em grade ampla para monitor ultrawide 21:9, mantendo comparação Atual | Proposta lado a lado. Em telas comuns, quebrar os cards e, em telas estreitas, empilhar os dois lados sem rolagem horizontal.
- Manter a página autônoma, sem login, rede externa ou acesso/escrita no banco.
- Documentar de quais componentes/rotas vêm as amostras e os limites da réplica HTML.

## Escopo da retomada

- Distinguir foco visível de teclado (`:focus-visible`/`data-focus-visible`) de hover, seleção/checagem e estado aberto; registrar também foco de gerenciamento quando o componente o expuser sem indicar modalidade de teclado.
- Só desenhar o ring de teclado nas amostras que representam foco por Tab/setas. Quando o foco visível estiver ativo, suspender o fundo de hover no mesmo item, ainda que o ponteiro permaneça sobre ele; manter seleção e estado aberto como estados independentes.
- Revisar especialmente o item de menu “Sair” do Header e a `PrismTab`, sem generalizar uma amostra estática de “foco” para todos os estados.
- Galeria revisada em `b28efb4`. Após a captura, foi preparada correção de código para que foco visível prevaleça sobre hover no mesmo alvo. Conferência do app publicado ainda pendente.

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
- [x] Histórico: o proprietário conferiu visualmente a proposta e autorizou a implementação com offset zero.
- [x] Histórico: confirmação e pedido de encerramento recebidos do proprietário em 22/11.
- [ ] Conferir o comportamento real no app publicado após a correção da apresentação HTML.
- [x] Registrar o relato e avaliar a diferença entre a galeria, o código e o estado publicado.
- [x] Reauditoria estática registrada; galeria atualizada para separar foco por teclado, hover e seleção/checagem.
- [x] Foco visível de teclado prevalece ao hover no mesmo alvo; build Vite e `git diff --check` passaram.

## Modelos sugeridos

- Codex — GPT-6.2 Sol. Para atualizar a matriz HTML e as réplicas sem alterar o app.
- Luna — Gemini 3 Flash (se disponível no plano). Para revisar a cobertura das famílias de foco e a leitura objetiva do antes/depois.
- Codex — GPT-6.2 Astra. Para revisar os casos compostos, estados semânticos e exceções em que o ring pode ser cortado.
