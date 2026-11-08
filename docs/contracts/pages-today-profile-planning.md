# Contratos: páginas (Hoje, Minha Conta, Planejamento, Ajuda), AppBar, calendários e preferências

> Movido de `AGENTS.md` em 07/11/2026 (ticket DOC-01), sem reescrever as regras. O `AGENTS.md` aponta para este documento. Ao mudar um contrato desta área, atualize-o aqui.

Leia antes de mexer em Hoje/Home, Minha Conta, Planejamento, Ajuda, datas comemorativas (administração), AppBar/Header, altura de calendários ou preferências do usuário (tema, Hoje, menu do cabeçalho).

## Planejamento

- Planejamento (`/app/planejamento`) herda Header/AppBar; busca, menu comum e botão da página operacional navegam com guardas de saída. `?partner=slug` só seleciona parceiro disponível em `AppContext`; sem parceiro, oferece escolha, sem seleção automática. Campos/geração seguem desativados e a prévia continua vazia, sem IA, consulta nova ou calendário funcional. Duas colunas rolam separadamente com `AppBarSpacer`; abaixo de `lg`, aviso simples. Portal `/dash` mantém identidade, seletor flexível e saída em uma linha, com saudação e texto de sair compactados visualmente no telefone. Regras futuras em [decisões do Planejamento](../plans/social-planning-design-decisions.md).

## Minha Conta

- Minha Conta (`/app/profile`) limita sua altura ao contêiner rolável por `useFillScrollViewport`, também reutilizado pela página Hoje. As duas colunas vão até o fim da janela, com rolagem independente e `AppBarSpacer` somente no final de cada região; Preferências não tem borda, arredondamento ou fundo de cartão. No desktop, as regiões começam diretamente na divisória do cabeçalho, sem gap externo: ela é o corte visível durante a rolagem; não reservar faixa externa ou padding inferior na página. AppBar flutua sobre o conteúdo. Salvar Alterações fica no cabeçalho ao lado de Minha Conta, ligado pelo atributo `form` ao formulário único; não há texto auxiliar no cabeçalho nem rodapé de salvar na coluna direita. Abaixo de `lg`, o espaçamento é local e escolhas/rótulos podem quebrar linha sem corte; o seletor de seção alterna áreas montadas sem perder valores. Validação nativa revela a seção pessoal antes de focar um campo inválido. O salvamento da conta continua manual; tema pode ser aplicado/gravado localmente antes de confirmar, enquanto menu do perfil e comandos de tema da busca persistem automaticamente na conta pelo controlador existente.

## AppBar e Header

- AppBar fica sempre visível em `/app`, oculta apenas com ação aberta na gaveta; não reintroduzir ocultação por hover/timer nem faixa fixa abaixo dela. O conteúdo passa sob a barra e cada área rolável termina com `AppBarSpacer` (`app/components/layout/AppBarSpacer.tsx`), altura `--app-bar-space` de98px em `app/tailwind.css` (barra de66px com16px abaixo e acima). Páginas que rolam inteiras colocam o espaço como último elemento; páginas `page-height` o colocam no fim de cada coluna com rolagem própria (feed do parceiro, lista/detalhe de leads, datas comemorativas). Calendário só reserva com `layoutOptions.reserveAppBarSpace`, ligado apenas no parceiro, como linha após a última semana; Home usa o rodapé e Hoje standalone reserva dentro da altura medida. Novas páginas/colunas roláveis da equipe seguem a mesma regra; portal `/dash` não tem AppBar.

Header global alinha logo/menu às bordas internas das linhas laterais do app, com margens responsivas e compensação da largura real da barra de rolagem do contêiner. Recebe a referência do scroller existente; alinhamento não altera o padding dos títulos/corpos de Hoje/Home.

## Hoje e Home

- Página Hoje e bloco Hoje da Home são componentes separados: `TodayPageView` (`/app/today`) e `HomeTodayView`, que compartilham somente as partes de `TodayViewParts` (filtro do dia, título, seletor de visualização e quadros). A Home mantém altura natural e Kanban de30vh, sem opções da página dedicada. A página mede a altura útil do contêiner rolável e acompanha resize; título, data e seletor ficam fixos, acima de uma divisória; no desktop o nome da visualização fica entre título e controles e não se repete no conteúdo. Parceiros/Categorias/Feed rolam numa única região "Ações do dia" que termina com `AppBarSpacer` e volta ao topo ao trocar dia/visualização; Kanban mantém cabeçalhos de fase fixos e rolagem por coluna, com a reserva da AppBar dentro da altura. O título da página usa uma única string completa da data selecionada (Hoje e ano quando aplicáveis), com ellipsis visual em uma linha e texto completo acessível; cabeçalho quebra entre título e controles quando falta largura. Abaixo de `lg`, Hoje e HomeToday reduzem apenas seus próprios gutters/gaps; HomeToday opta pelo espaçamento compacto de `HomeViewWrapper`, preservando os demais blocos. Novidades da página Hoje não precisam ser espelhadas na Home.

- Foco em Hoje: a região “Ações do dia” mantém semântica/rolagem com `tabIndex=-1`, fora do Tab, e não recebe foco ao clicar diretamente no fundo. Os botões de criação de Parceiros/Categorias têm nomes contextuais e ficam visíveis durante foco; em repouso preservam a revelação por hover. Home reutiliza os controles de criação; regiões de rolagem de Kanban, Perfil e células de calendário com altura limitada, além do carrossel do Instagram, não são paradas de foco (sem tabIndex nem anel; decisão de 03/11/2026), pois seus controles internos continuam focáveis.

- Visualização inicial de Hoje: `defaultTodayView` em `UserPreferences` aceita `partners`/`kanban`/`categories`/`feed`, com fallback Parceiros. Minha Conta oferece rascunho salvo pelo botão; `HomeTodayView` e `TodayPageView` inicializam uma vez por montagem/identidade e mantêm trocas manuais temporárias durante datas/dados/resize. Não reutilizar `defaultViewVariant` dos clientes. A migration `20261028201902_today_view_preference.sql` ampliou a RPC em produção em28/10/2026 (remota `20261028205047`), com catálogo/validação/permissões verificados no manifest de Hoje. Aplicação de SQL não comprova publicação do frontend; histórico de migrations continua parcial.

## Calendários

- Calendários da equipe usam altura natural por semana; `ViewOptions.limitHeight` ativa teto de `min(24rem,60dvh)` por dia com uma área de rolagem que inclui ações e comemorações, mantendo cabeçalho fora dela. Linha/Bloco/Conteúdo não decidem altura nem truncam em cinco itens. Parceiro e Home mensal iniciam automáticos; Home semanal inicia limitada e preserva a escolha por período durante a montagem. `ActionContainer.scrollable=false` delega a rolagem à célula; demais consumidores preservam seu comportamento. Painel do parceiro rola entre semanas e feed rola separadamente. Portal mantém painel limitado à janela e dias naturais na grade rolável, sem menu de altura por dia. Essas escolhas de altura não são persistidas.

## Ajuda e datas comemorativas (administração)

Ajuda (`/app/help`, `HelpPage`): página de orientação sem consulta ao banco, com índice lateral (desktop) ou seletor (celular) e região de rolagem própria terminada em `AppBarSpacer`. Seção Administração só para `person.admin`. Rolagem por âncora move apenas essa região (não `scrollIntoView`, que também move o contêiner recortado); a região é `relative` para que elementos `sr-only` absolutos não ampliem o contêiner externo. Textos descrevem somente recursos existentes; atualize-os ao mudar atalhos ou fluxos.

Datas comemorativas (`/app/admin/celebrations`): abaixo de `md` (768px), formulário e lista seguem altura natural e rolam somente pelo contêiner do app; não manter `h-full` ou rolagem interna nas colunas. A partir de `md`, as colunas ficam lado a lado com rolagem independente e `AppBarSpacer` ao final de cada uma. A ida inicial ao mês/ano atual pertence somente à lista desktop, uma vez quando houver dados; montagem no celular não a consome nem rola a página. Resize desktop preserva a posição manual; não usar `scrollIntoView`.

## Preferências, temas e Cloudinary

- HeaderMenu usa `usePreferencePersistence`/`createPreferencePersistence`: debounce250ms, uma escrita em voo, último patch por campo, falha preservada e retry explícito. Atualização local aplica somente campos alterados pelo próprio controlador, preservando campos salvos por outro fluxo mesmo com resposta antiga. Perfil também usa `update_my_preferences(p_patch)`; preserve o merge autorizado por auth.uid() e campos desconhecidos existentes.

- Temas usam localStorage e `people.preferences`; perfil oferece preview antes de salvar. Preferência `light`/`dark`/`system` (`themePreference` em `useAppTheme`); `system` acompanha `prefers-color-scheme` em tempo real e `theme` é sempre o tema resolvido (claro/escuro). Perfil e menu do cabeçalho oferecem as três opções. O script síncrono de `index.html` aplica tema antes do React.
- A página inicial `/` e o portal `/dash` usam a paleta neutra Ônix, independentemente da paleta pessoal da equipe; o modo claro/escuro permanece compartilhado. Ao sair dessas rotas, a paleta pessoal volta a ser aplicada sem alterar a preferência salva. A escolha visual está pendente de aceite.

- Cloudinary usa cloud name/upload preset no widget. Mantenha o widget montado durante uploads múltiplos; close pode preceder os últimos eventos success. API secret não pertence a variáveis VITE_.
