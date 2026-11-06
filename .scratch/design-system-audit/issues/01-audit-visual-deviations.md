# DS01 — Corrigir desvios visuais já inventariados

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Terra, para inventariar desvios visuais e cruzar achados com o V44.
- **Anthropic** — Claude Haiku 5.5, para inventariar desvios visuais e cruzar achados com o V44.
- **Google** — Gemini 3.8 Flash, para inventariar desvios visuais e cruzar achados com o V44.

**Entrega** — Inventário verificável de estilos fora do design system da UZZINA, com propostas de padronização e encaminhamento por achado. Usar o [V44](../../visual-controls/issues/44-audit-custom-components-for-prism.md) como referência para equivalentes de componentes e evitar duplicar seus achados.

**Bloqueios** — Nenhum.

**Status** — Em execução. [Inventário inicial e revisão independente do V44](../../../docs/audits/2026-11-05-ds01-visual-deviations.md). Cobertura por rota e comparação visual pendentes.

- [ ] Cobrir cores, padrões de componentes e estados, tipografia, dimensões, espaçamento, bordas, raios, sombras e foco. Registrar tela/componente, estilo atual, referência Prism ou token aplicável e evidência verificável.
- [ ] Começar pelas classes amber do feriado no calendário. Comparar com as cores semânticas e paletas do sistema em claro/escuro, considerando significado e contraste além de proximidade visual. Cruzar com o [CAL01](../../calendar-celebrations/issues/01-calendar-celebration-markers.md).
- [ ] Classificar cada caso como substituição por equivalente existente, lacuna que merece proposta de padrão ou exceção justificada. Registrar prioridade e escopo da troca.
- [ ] Propor tickets de implementação agrupados por mudança verificável, identificando quais achados cabem em tickets existentes e quais justificam novos tickets ou a substituição de um ticket sobreposto.

## Execução unificada com V44

O V44 é a referência de controles e contratos. Este ticket executa as correções já identificadas e a [segunda etapa DS02](02-route-coverage-and-visual-review.md) cobre a matriz de rotas e o aceite visual.

- [x] Remover os dois componentes legados, mantendo o comportamento de conversão de cores nos fluxos de lote.
- [x] Usar variantes semânticas nos badges de Leads, manter texto clicável nos checkboxes de Data/Hora com o rótulo Prism e retirar a classe solta da AppBar.
- [x] Padronizar botões dos banners e fechamento da gaveta, controles de editar/excluir comentário e ações de audiência/cancelar/enviar; itens de menção usam geometria Prism padrão. Formatação e `bun run typecheck` passaram. Proprietário conferiu o botão Fechar e o percurso de teclado da gaveta.
- [ ] Prosseguir pelos lotes de controles, formulários, gaveta e editor do V44, preservando contratos de foco e teclado. Tratar a apresentação de datas no CAL01 e coordenar o recorte de Planejamento com a série existente.
- [ ] Encaminhar as diferenças renderizadas ao DS02. A padronização é o padrão de execução. Uma inadequação visual documentada pode fundamentar novo token, variante ou exceção.

## Revisão dos lotes A–C antes do lote D — 05/11

Base da revisão estática: `cf533cb` até o checkout local, incluindo o commit `3e648fe`. Cobertura de navegador permanece no DS02.

- [x] **C · Identidade do formulário.** Proprietário aceitou o lote. A instância agora usa a identidade da rota para reiniciar campos ao trocar de pessoa ou criar uma nova.
- [x] **A · Anexos do portal.** Removidas as miniaturas externas. Sem anexos, botão Adicionar arquivos com +. Com anexos, Gerenciar arquivos abre o diálogo compartilhado com Instagram e o botão + mantém nome acessível. Proprietário conferiu e aprovou.
- [x] **B · Geometria aceita.** Proprietário confirmou as colunas em xs e sm. Células lg requerem um diálogo que comporte o calendário.
- [x] **B · Seletor de cor em lote.** Proprietário conferiu e aprovou a composição atual.
- [ ] **A–C · Aceite renderizado.** Conferir notificações no sino e na página, seletor mobile da Ajuda, calendário do portal, formulários Admin/Auth e Minha Conta. Incluir fluxo de teclado e estados com dados controlados.

- [x] **D · Barra do editor.** Padronização concluída, com aceite visual e 14 testes de teclado aprovados.

## Lote: usos diretos nas rotas — 06/11/2026

Seção 4 de `docs/plans/visual-controls-where.md`. Excluídos: `profile.tsx` e `planejamento.tsx`.

**Corrigidos agora**

- `app/routes/dash.tsx:243`: `PrismSelectTrigger` `rounded-xl border-none ... squircle` → override de raio/borda removido (raio do primitivo).
- `app/routes/login.tsx:117`: `PrismInputGroup className="squircle"` → removido (o primitivo já aplica `squircle`).
- `app/routes/app/admin/partner/$slug.tsx:409-410` e `app/routes/app/admin/client/$userId.tsx:192-193`: overlay de upload `bg-black/40` + `text-white` → `bg-foreground/40` + `text-background`.
- `app/routes/dash/review.$slug.tsx:211`: selo de categoria `rounded-md ... squircle` → `rounded-full` (pílula, como o Badge).
- `app/routes/dash/review.$slug.tsx:256`: destaque `mark` `yellow-200/60` + `dark:yellow-700/40` → `bg-warning-background`.

**Já corrigidos antes**

- `notifications.tsx:148-149`: arquivo agora é só redirecionamento (6 linhas).
- `celebrations.tsx:250/260`: linha `rounded-xl squircle` (item interno, conforme regra); selo feriado sem `amber`.
- `partner/$slug.tsx:385/418` e `client/$userId.tsx:176/202`: o gatilho usa `CloudinaryUpload` (Prism); `no-squircle` + `rounded-full` é exceção permitida.
- `partner/$slug.tsx:499/535`: moldura do editor já `rounded-2xl ... squircle`.
- `dash/action/$id.tsx:351/368`: pílula e selo já usam `PrismBadge`.
- Spinners `size-12 rounded-full border-4`: não restam em rotas (só comentário em `app.tsx:263`); usam `ULoader`.

**Deixados**

- `dash/action/$id.tsx:392`: `rounded-xl border bg-card p-4 squircle` ao redor da descrição renderizada. É conteúdo de leitura, não bloco de formulário, e não há primitivo equivalente; decidir se vira texto direto sobre o fundo.
- Seção `profile.tsx` (linhas 86/96/263/297/302/351/661/682/702) e `planejamento.tsx`: fora do escopo do lote.

**Roteiro de conferência visual (pt-BR)**

- `/login`: campo de senha com cantos arredondados normais, foco com anel.
- `/dash`: seletor de parceiro no cabeçalho com raio igual aos outros campos e fundo `bg-input`.
- `/app/admin/partner/<slug>` e `/app/admin/client/<id>`: passar o mouse sobre o avatar; o véu escuro e o ícone de upload devem ficar legíveis no tema claro e escuro.
- `/dash/review/<slug>?r=token`: selo da categoria em pílula; texto destacado (mark) em tom de aviso legível nos dois temas.

Verificação: Prettier, `tsc --noEmit` e `tests/icon-control-names.test.tsx` (11 pass).

## Lote: componentes de calendário, Home, admin, Ajuda e portal — 06/11/2026

Os caminhos em `visual-controls-where.md` estão desatualizados: CalendarToolbar e ViewOptions viraram `uzzina/UCalendarToolbar.tsx` e `uzzina/UViewOptions.tsx`, PartnerCelebrationsSelector virou `uzzina/UPartnerCelebrationsSelector.tsx`, e ColorListEditor não existe mais.

- **Já corrigidos antes:** UCalendarToolbar, CalendarDayCell (botão + é `PrismButton icon-xs rounded-full`, feriado usa `PrismBadge`), UViewOptions (`w-56` é a largura padrão do menu), TodayViewParts e o `rounded-xl squircle` do ActionItem.
- **Corrigidos agora:**
  - AdminUserForm: o véu do avatar passa a usar `bg-foreground/40 text-background`, igual aos uploads de parceiro e cliente, e o botão de enviar perde o raio redundante.
  - HelpPage: o link lateral usa `rounded-md` → `rounded-xl squircle`.
  - ClientCalendar: os itens usam `rounded-md`/`rounded-lg` → `rounded-xl squircle`.
- **Lacunas para o proprietário:**
  - `border-white` / `dark:border-white/10` no topo do ActionItem: não existe token de realce.
  - `min-w-375` em `ClientCalendar.tsx:129`: no Tailwind 4 isso equivale a cerca de 1500px. Conferir se é intencional no portal.
- **Verificação:** typecheck, `icon-control-names` e `view-options` (21 pass). Nada foi conferido no navegador.

Roteiro: passar o mouse no avatar em `/app/admin/user/novo` e nos logos de parceiro e cliente; abrir a navegação lateral de `/app/help`; olhar os cartões das visões semana e mês em `/dash`.

## Lote: cabeçalho, busca, observações e mídia — 06/11/2026

- **GlobalSearchCommand:** os cinco grupos de itens (parceiros, ações, Criar ação, comandos e admin) perderam o `h-10` forçado e voltam aos 32px do `PrismCommandItem`.
- **Header:** o sino perdeu o `rounded-full` e segue o raio de `icon-sm`. Ficam como estão o avatar do perfil, que é redondo de propósito, e as amostras de paleta (`rounded-[9px]`, sem token equivalente).
- **AppBar** e **CommentInput:** já estavam corrigidos.
- **CommentItem:** o balão passa de `rounded-lg ring-black/5` para `rounded-2xl` com a borda padrão de container.
- **ContentReorderDialog:** a miniatura e o aviso vão para `rounded-xl`. A alça e o X ganham `bg-background/80` para ficarem legíveis sobre fotos.
- **InstagramPreview:** o fundo `bg-black/5` vira `bg-muted`. As setas viram `PrismButton icon-xs` e os pontos viram `PrismButton unstyled`, os dois com anel de foco. Os véus pretos e brancos ficam como exceção justificada, porque imitam o Instagram sobre qualquer foto. Lacuna: os pontos têm 6px e não existe primitivo de indicador.
- **Testes:** typecheck limpo; `icon-control-names` e `field-accessible-names` passam. `global-search-partners` tem 9 falhas e há mais 1 em navegação ("AI processing blocks leaving…"), que já existiam antes deste lote e não foram investigadas. Nada foi conferido no navegador.

Roteiro: abrir a busca e conferir a altura dos itens e o Shift+Enter; olhar o sino; abrir as Observações; abrir Gerenciar conteúdo com fotos claras e escuras; navegar com Tab nas setas e nos pontos do carrossel do Instagram.

## Lote: componentes internos da gaveta — 06/11/2026

- **EssentialsTab:** o esqueleto da descrição perdeu o `rounded-2xl` redundante, porque `PrismSkeleton` já aplica raio e squircle.
- **ActionFormDrawer:** não restam botões nativos. O `#666666` encontrado é um dado de cor usado na lógica, não estilo.
- **Mantidos de propósito:**
  - InstagramTab: `<textarea>` nativa sem equivalente Prism, com foco de exceção aprovada.
  - ConflictComparison: a coluna é um item interno `rounded-xl squircle`, e a exceção de `tabIndex` foi preservada.
- **Fora do escopo:** UActionDatePicker, em `uzzina/`, não estava entre os arquivos permitidos.
- **Testes:** gaveta, IA, estratégias e nomes de controle deram 138 pass e 14 fail, com e sem a mudança. As 14 falhas são as já conhecidas do `drawer-component`.

O rodapé, os combobox e o RichTextEditor ficaram de fora por dependerem de decisão do proprietário.

## UPreferenceSwitch sem caixa — 06/11/2026

`UPreferenceSwitch` perdeu a moldura (`rounded-2xl border p-4` e fundo por estado), conforme a regra de superfícies; o estado fica só no botão Ativo/Inativo. Conferido em Minha Conta no app real. Typecheck passou e os testes de perfil e Hoje deram 16/0.
