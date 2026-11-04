# V35 — estudo do flicker de seleção — 04/11/2026

Estudo somente leitura executado por subagente leve (Luna) a pedido do proprietário. A etapa de animação de expansão foi retirada do ticket. Preservar a rolagem suave do painel direito.

O código usa listener de scroll, não IntersectionObserver. Cliques atualizam activeAnchor/expandedItemId e iniciam scrollTo smooth. Durante o movimento, o listener volta a selecionar o primeiro destino quando scrollTop é menor que 80. Também só considera os filhos do grupo expandido; ao atravessar um pai, muda expandedItemId, recria o listener e altera o conjunto de destinos. Esse fluxo é compatível com o salto Button → Button filho → pai e com a oscilação ButtonGroup → Button → ButtonGroup descritos pelo proprietário.

Referências em app/routes/ui.tsx, handlers de clique/hash e efeito de scroll (aproximadamente 607–789 na base estudada). A análise é estática, sem reprodução de navegador nesta rodada.

Proposta mínima para implementação posterior: registrar um destino de rolagem programática para cliques/hash e preservá-lo até chegada ou interrupção pelo usuário; manter uma lista estável de destinos independente da expansão visual; usar scroll-spy para rolagem manual e atualizar seleção/expansão juntas. Tratar destino no topo sem selecionar automaticamente um item diferente, interrupções e prefers-reduced-motion. Verificar um clique em Button e ButtonGroup, cliques rápidos sucessivos, deep link, rolagem manual e movimento reduzido. Não introduzir animação de submenu.

Correção funcional ainda pendente.

## Correção e verificação — 04/11/2026

Implementação feita por subagente leve em app/routes/ui.tsx e revisada pelo coordenador. Intenção de navegação versionada unifica clique/hash e dispara também na mesma categoria. Scroll-spy usa conjunto estável com todos os filhos e não sobrescreve a seleção programática enquanto a rolagem ocorre. Wheel, touch, pointer ou teclas de navegação liberam o acompanhamento manual. Sem timeouts para adivinhar fim da animação, e rolagem instantânea quando movimento reduzido está ativo.

Prettier, Biome, typecheck e diff aprovados. Chromium com página real da galeria em montagem isolada verificou Button, ButtonGroup, cliques repetidos/rápidos, link direto ao filho, movimento reduzido e scroll manual. Registro de mudanças do DOM durante o clique no filho continha somente a seleção ButtonGroup, sem salto para Button. Depois de wheel, o destino ativo mudou para Calendar conforme o conteúdo visível. Zero pageerror. Log /tmp/uzzina-v35-fixed-browser.log. Nenhuma chamada de escrita ao banco ou publicação.

Etapa futura de animação de expansão removida por decisão do proprietário. Correção pronta localmente, aguardando seu aceite visual. A análise estática inicial acima fica como histórico anterior à implementação.

## Primeiro clique: causa reproduzida no roteador real — 04/11/2026

O proprietário confirmou que o primeiro clique continuava sem rolar. A falha foi reproduzida diretamente no Comet aberto em `127.0.0.1:5176/ui`: ResponsiblesCombobox → pai UAvatar selecionava/expandia, mantendo o conteúdo anterior. A gravação enviada não pôde ser lida por restrição do macOS; a evidência desta rodada é a reprodução direta na página, não a leitura do vídeo.

O ensaio anterior usava `createMemoryHistory`, que não observa `window.history.replaceState`; por isso ocultava o conflito. Ao trocar para histórico de navegador e `scrollRestoration: true`, `/tmp/uzzina-v35-realhistory.cjs` falhou com timeout de 5000ms no destino UAvatar. Instrumentação isolada registrou `main.scrollTo({top:7369,behavior:"smooth"})` seguido, cerca de 3ms depois, por `scrollIntoView(true)` disparado pelo TanStack Router. O conteúdo permaneceu em `scrollTop=4161`. O segundo comando cancelava a animação do primeiro; no clique repetido com hash igual não ocorria uma nova transição de URL.

Correção em `app/routes/ui.tsx`: usar `useNavigate` para atualizar o hash, com `replace: true`, `resetScroll: false` e `hashScrollIntoView: false`. Aplicado aos pais, filhos e links diretos/aliases. A galeria continua responsável pela posição, expansão imediata, primeiro filho e movimento reduzido. Nenhuma opção global do roteador foi alterada.

Regressão permanente: `scripts/check-ui-sidebar-browser.cjs` com `tests/fixtures/ui-sidebar-browser.tsx`, usando a galeria real, histórico de navegador, restauração e StrictMode. Mede posição real do destino em vez de somente seleção. Rede externa e APIs bloqueadas; servidor isolado sem envs de produção. O roteiro cobre PhaseCombobox → pai UAvatar → UAvatarGroup, troca rápida, link direto Calendar → Button → ButtonGroup, com movimento normal e reduzido.

Na página real do Comet, após a alteração, um único clique no pai UAvatar a partir de ResponsiblesCombobox abriu o submenu e posicionou UAvatar abaixo do cabeçalho. O ticket permanece aguardando aceite final do proprietário, sem commit/publicação nesta rodada.
