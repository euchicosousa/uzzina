# DS23: cores opacas calculadas pela superfície (estudo)

Data: 16/11/2026. Tipo: estudo. Nenhuma alteração no código do app. Ticket: [DS23](../../.scratch/design-system-audit/issues/23-opaque-surface-aware-colors.md). Demonstração: [ds23-superficies.html](../../.scratch/design-system-audit/ds23-superficies.html) (abrir em http://127.0.0.1:5176/.scratch/design-system-audit/ds23-superficies.html com o servidor de desenvolvimento rodando).

## Resumo para o proprietário

Hoje, o item que fica "destacado" no menu, o botão secundário e o texto secundário usam transparência. Isso faz o mesmo destaque virar uma cor diferente em cada lugar, e em cores como o cartão de ação colorido o texto secundário fica ilegível. A proposta é que cada superfície (página, cartão, menu, seção do admin, cartão de ação) declare a própria cor de fundo, e que o destaque seja uma mistura opaca dessa cor com o texto.

Achados principais:

- **O destaque é igual em todo lugar.** Medido na demonstração: o fundo de hover é o mesmo valor na página, no cartão, no menu, na seção do admin e no cartão de ação. Ele não se adapta à cor onde está.
- **O pior caso é o cartão de ação na fase viva.** O texto secundário tem contraste 2,9:1 no claro e 2,8:1 no escuro hoje (abaixo de 4,5:1, o mínimo para texto normal). Com a regra opaca simples, cai para 1,8:1. A regra por si não resolve esse caso.
- **Texto secundário no escuro já está abaixo do mínimo em cartões.** Com 65% de texto, o cartão escuro mede 3,96:1. Com 75%, 4,73:1.

## O que é hoje

Definido em `app/tailwind.css`:

- Claro: `--secondary` = texto a 5%, `color-mix(in srgb ...)`. Texto secundário = texto a 65%.
- Escuro: `--secondary` = texto a 10%, `color-mix(in oklch ...)`. Texto secundário = texto a 65%.

Essas variáveis são declaradas na raiz (`:root` e `.dark`). Por isso o valor é resolvido ali e herdado pronto. Dentro de um cartão de ação com `phase-surface` ou `phase-vivid`, `--foreground` muda, mas `--secondary` continua calculado com o texto da raiz. Foi isso que a medição confirmou.

## Inventário (busca em `app/`, 16/11)

| Token ou uso | Ocorrências | Observação |
| --- | --- | --- |
| `bg-secondary` | 110 | Hover de menus, botão secundário, alternância, faixa de seleção do calendário, aba de observações da gaveta |
| `text-secondary-foreground` | 338 | Texto de apoio, datas, legendas, rótulos |
| `(bg/text/border/ring)-foreground/NN` escrito à mão | 82 | Inclui variantes `hover:` e `placeholder:` |
| `bg-card` | 31 | Não há primitivo Prism de cartão; cada tela escreve a classe |
| `bg-popover` (sem transparência) | 24 | Containers do Prism |
| `bg-popover/NN` (translúcido) | 3 | `AppBar.tsx:85` (90%), `RichTextEditor.tsx:651` (95%), `DashboardMetrics.tsx:152` (80%) |

Obs.: a contagem anterior no ticket era ~132 e ~341; a diferença vem de outro critério de busca. Os números acima são os desta busca.

### Transparência que deve ficar

- Fundos de sobreposição e películas: `--color-overlay`, `UAvatarUpload` (`bg-foreground/40` sobre foto), `image-icon` (ícones brancos sobre imagem), películas de AppBar, balão do editor e métricas do início (`bg-popover/80-95` com desfoque). Essas peças existem para deixar ver o que está atrás.
- Sombras (todas usam `color-mix` na cor da paleta).
- Bordas sutis de containers flutuantes (`border-foreground/5` e `/10`): são contorno, não preenchimento.
- Esqueleto de carregamento (`bg-foreground/5`) e as linhas da linha do tempo (`bg-foreground/50`).

### Transparência escrita à mão que vale trocar

- Textos secundários escritos como `text-foreground/60` e `/80` em superfícies, por exemplo o trecho de notificação em `Header.tsx:493` e `:506`. Trocar pelo token de texto secundário da superfície.
- Placeholders `placeholder:text-foreground/40` em campos: como o campo é opaco (`bg-input`), podem continuar como estão (decisão D4).

## Superfícies que precisariam declarar `--surface`

| Superfície | Onde está | Cor de fundo atual | Observação |
| --- | --- | --- | --- |
| Página | `app/tailwind.css` (`--background`) | `--background` | Não precisa declarar: é a base |
| Cartão | `bg-card` em 31 pontos, ex.: `app/routes/app/planejamento.tsx:917` | `--card` | Sem primitivo Prism; criar uma classe ou declarar só nas telas que usam |
| Menu e família | `app/components/prism/popover.tsx:76`, `dropdown-menu.tsx:46,189`, `select.tsx:139`, `combobox.tsx:141`, `command.tsx:51`, `tooltip.tsx:33`, `dialog.tsx:125`, `sheet.tsx:76` | `--popover` | Declarar uma vez em cada primitivo |
| Seção colorida (admin) | `app/components/layout/Header.tsx:717` (grupo "Admin"), `app/components/features/admin/themes/` | `bg-secondary` sobre o menu | Caso citado pelo proprietário; a seção hoje não tem fundo próprio |
| Rodapé e cabeçalho de notificações | `Header.tsx:458` e `:514` | `bg-secondary` sobre o menu | Já está dentro de popover; herda se o popover declarar |
| Cartão de ação, fase suave | `app/tailwind.css` (`phase-surface`), `app/components/features/ActionItem.tsx:208`, variantes `ActionBlockVariant`, `ActionLineVariant`, `ActionTimelineVariant` | `--action` tingido | Precisa de tratamento próprio (ver riscos) |
| Cartão de ação, fase viva | `app/tailwind.css` (`phase-vivid`), mesmo ponto | `--vivid-fill` | Precisa de tratamento próprio; texto secundário falha |
| Gaveta e aba de observações | `app/components/features/action-drawer/ObservationsTab.tsx:192` (aba com `bg-secondary` inteiro), `ActionDrawerPanel.tsx`, `ActionFormDrawer.tsx` | `--background` ou `--popover` | Decidir qual é a superfície da aba |
| Calendário, faixa de seleção | `app/components/prism/calendar.tsx:82-85` | `bg-secondary` sobre a célula | Herda do popover ou da página |

## Regra proposta

Claro:

- `--secondary` = `color-mix(in oklab, var(--foreground) 5%, var(--surface))`
- `--secondary-foreground` = `color-mix(in oklab, var(--foreground) 65%, var(--surface))`

Escuro:

- `--secondary` = `color-mix(in oklab, var(--foreground) 10%, var(--surface))`
- `--secondary-foreground` = `color-mix(in oklab, var(--foreground) 75%, var(--surface))` (recomendado; ver D2)

Regras de uso:

1. Cada superfície declara `--surface` com a cor de fundo dela.
2. A mesma superfície redeclara `--secondary` e `--secondary-foreground` no próprio elemento. Isso é o que faz a mistura usar a cor certa. Declarar só `--surface` não basta: se as variáveis ficarem na raiz, o problema atual continua.
3. Uma superfície aninhada (menu dentro de cartão) redeclara as variáveis dela; os itens dentro herdam o valor certo.
4. Se uma superfície esquecer `--surface`, o padrão deve ser `var(--background)` na raiz, para degradar para a página e não quebrar.

Em `oklab` nos dois modos, o problema "srgb no claro e oklch no escuro" desaparece.

## Medições (Chrome, pelo navegador embutido)

Contraste do texto secundário sobre a superfície real, medido por amostragem de pixels:

| Superfície | Claro hoje | Claro proposta | Escuro hoje | Escuro proposta |
| --- | --- | --- | --- | --- |
| Página | 6,4:1 | 7,7:1 | 4,8:1 | 4,6:1 |
| Cartão | 6,2:1 | 7,5:1 | 4,1:1 | 4,0:1 |
| Menu | 6,4:1 | 7,7:1 | 5,3:1 | 5,1:1 |
| Seção colorida (admin) | 5,9:1 | 6,9:1 | 6,1:1 | 5,8:1 |
| Cartão de ação, fase suave | 6,3:1 | 4,2:1 | 3,1:1 | 2,6:1 |
| Cartão de ação, fase viva | 2,9:1 | 1,8:1 | 2,8:1 | 1,8:1 |

Testes de ajuste (sem alterar nada):

- Cartão escuro, texto a 70%, 75%, 80%: 4,31, 4,73, 5,12 (hoje 3,96).
- Página escura, texto a 70% e 75%: 5,08 e 5,64 (hoje 4,61).
- Fase suave clara, texto a 75%, 85%, 100%: 5,57, 7,32, 10,85.
- Fase suave escura, texto a 75%, 85%, 100%: 3,00, 3,40, 4,06 (ainda abaixo de 4,5).
- Fase viva com tinta escura (padrão da demonstração), texto a 85% ou 100%: 2,14 e 2,44. Com tinta clara (preferência "Texto na cor viva"), texto a 65% = 2,80 e 85% = 3,63.

## Riscos

1. **Cartões coloridos não resolvem só com a mistura.** A fase suave escura e a fase viva ficam abaixo de 4,5:1 mesmo com texto a 100%. Isso vem da cor escolhida, não da transparência. É preciso uma regra por paleta (tinta do cartão) e não só por superfície.
2. **Piora na fase suave com o texto a 65%.** Com o padrão de 65%, a fase suave clara cai de 6,3 para 4,2:1. Por isso o cartão precisa de percentual próprio, não o padrão.
3. **Esquecimento de `--surface`.** Sem o padrão na raiz, uma superfície nova pode ficar sem cor. Mitigação: padrão `var(--background)` e revisão na galeria `/ui`.
4. **Onze temas.** Os valores acompanham a paleta, mas o contraste precisa ser conferido em cada tema (a página DS21 já compara as cores; daria para acrescentar o contraste).
5. **Desempenho.** Duas variáveis a mais por superfície; número de elementos é pequeno. Risco baixo.
6. **Efeito visual.** Hover opaco não "vaza" o que está atrás em áreas com rolagem, cabeçalho fixo ou sobreposição. Isso é o objetivo, mas muda a sensação de algumas telas.
7. **Medição.** As porcentagens foram medidas no navegador embutido, em uma demonstração. Não são auditoria certificada do app, e o cartão de ação real pode ter tinta diferente conforme a preferência da conta.

## Demonstração

Arquivo: `.scratch/design-system-audit/ds23-superficies.html`. Usa o CSS real do app (`/app/tailwind.css`) em `.stage` claro e `.stage.dark`, com as mesmas peças nos dois lados (item em repouso e em foco, botão secundário, texto secundário, mais o contraste medido na tela). A coluna "Proposta" declara `--surface` e redeclara as duas variáveis em cada superfície. Verificado em 16/11: CSS carregou (aviso de falha oculto), as duas colunas aparecem no claro e no escuro, e o console não mostrou erros.

## Decisões do proprietário

- **D1. Adotar a regra opaca por superfície?** Recomendação: sim, em duas etapas. Primeiro menus, página, cartão e seção do admin (ganho claro, sem risco). Depois os cartões de ação, que dependem de D3.
- **D2. Texto secundário no escuro: 65% (hoje) ou 75%?** Recomendação: 75% no escuro e manter 65% no claro. Hoje o cartão escuro fica em 3,96:1; com 75% vai a 4,73:1.
- **D3. Cartões de ação coloridos.** Recomendação: a tinta do cartão (não a do texto da página) e um teste de contraste por paleta na página DS21 antes de aprovar. Para a fase viva, decidir se o texto sempre usa a tinta mais forte disponível, porque a regra de mistura não basta. Isso exige decisão própria, possivelmente com mudança de paleta.
- **D4. Transparências escritas à mão.** Recomendação: manter bordas sutis, sobreposições sobre foto, esqueleto, linhas e películas (AppBar, balão do editor, métricas). Trocar os textos `foreground/60` e `/80` em superfícies pelo token de texto secundário.
- **D5. Quando implementar.** Recomendação: depois de aceite visual do DS21 e do DS17, para não misturar mudanças em cartões de ação que ainda estão em revisão.

## Próximo passo

Nenhuma alteração no app. Se as decisões forem aprovadas, a implementação é uma mudança pequena em `app/tailwind.css` e nos containers do Prism, mais a declaração de `--surface` nas superfícies listadas, com conferência nos onze temas. O ticket sugere Sonnet 5.5 para essa etapa.
