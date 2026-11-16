# HOJE-03 — Duração padrão da ação por categoria

**Status.** Aberto em 16/11/2026 a pedido do proprietário, a partir do [HOJE-02](02-hour-view.md). Levantamento feito (código e contagem no banco de produção, só leitura). Nenhum arquivo do app foi alterado. Tabela aprovada em 16/11. Respondido pelo proprietário em 16/11/2026 (seção "Decisões do proprietário, 16/11/2026").

**Implementado localmente (16/11/2026), não commitado.** Regra aprovada pelo proprietário: a duração acompanha a categoria só quando a ação ainda estava no padrão da anterior (ou sem duração); ajuste manual é mantido. Ações existentes não mudam (sem migração); ajuste manual não altera o padrão da categoria. Arquivos: `app/lib/CONSTANTS.ts`, `app/utils/factory.ts`, `app/utils/format.tsx`, `app/lib/supabase.mutations.ts`, `app/hooks/useActionMutations.tsx`, `app/components/features/action-drawer/ActionFormFooter.tsx`, `app/components/features/BulkActionMenu.tsx`, `app/components/uzzina/UCategoriesCombobox.tsx`, `app/components/ui-sections/UzzinaCategoriesComboboxSection.tsx`. Ordem de execução decidida: HOJE-01, **HOJE-03**, HOJE-02.

**Independência.** Não depende do HOJE-01 nem do HOJE-02 e não mexe nos mesmos arquivos da visualização. Faz mais sentido estar pronto antes de a Linha do tempo entrar em uso, porque é o que dá o tamanho inicial de cada barra.

## O que a pessoa vê hoje

Nada na tela: a duração de uma ação não aparece nem pode ser mudada em lugar nenhum. Por baixo, toda ação nova nasce com **10 minutos**, seja Post Estático, Reels ou Reunião, e trocar a categoria não muda a duração.

## O que o proprietário pediu

Cada categoria tem uma duração padrão. A ação nasce com a duração da sua categoria e, ao trocar a categoria, a duração acompanha. A duração não é editável na gaveta; só na visualização Linha do tempo (HOJE-02).

## O que o levantamento encontrou

- **Não existe essa relação no app.** A lista de categorias (`app/lib/CONSTANTS.ts`) não tem duração, e a criação (`app/utils/factory.ts`) usa 10 fixo.
- **Os dados mostram que ela já existiu** (duração mais comum por categoria no banco, em 16/11), e serviram de ponto de partida para a tabela abaixo, ajustada pelo proprietário.

## Tabela aplicada em `CATEGORIES` (`app/lib/CONSTANTS.ts`, atualizada em 16/11/2026)

| Categoria     | Duração padrão (`defaultTime`) | Hoje no banco (mais comum) |
| ------------- | ------------------------------ | -------------------------- |
| Post Estático | 30 min                         | 10 min                     |
| Carrossel     | 50 min                         | 10 min                     |
| Reels         | 40 min                         | 20 min                     |
| Stories       | 20 min                         | 5 min                      |
| Tarefa        | 10 min                         | 5 min                      |
| Financeiro    | 10 min                         | 5 min                      |
| Gravação      | 120 min                        | 60 min                     |
| Reunião       | 60 min                         | 60 min                     |
| Design        | 70 min                         | 30 min                     |
| Tech/Coding   | 90 min                         | 30 min                     |
| Social Media  | 40 min                         | 15 min                     |
| Tráfego Pago  | 30 min                         | 15 min                     |
| Impresso      | 30 min                         | 5 min (1 ação)             |

Impresso fica com 30 porque costuma envolver trabalho de design.

## Proposta

- Acrescentar a duração padrão a cada categoria, na própria lista de categorias, com a tabela aprovada acima.
- **Criar ação:** nasce com a duração da categoria inicial (Post Estático, 10 min).
- **Trocar a categoria** (gaveta, atalho de teclado ou menu em lote): a duração passa a ser a da nova categoria **somente se a ação ainda estava com a duração padrão da categoria anterior**. Se alguém já ajustou a duração na Linha do tempo, o ajuste é mantido.
- **Ações existentes não são alteradas.** Nenhuma mudança no banco.

## O que fazer

1. Acrescentar o campo de duração padrão (minutos) em `CATEGORIES` (`app/lib/CONSTANTS.ts`) e um utilitário único que devolve a nova duração ao trocar de categoria.
2. Usar a duração da categoria em `createActionDraft` (`app/utils/factory.ts`).
3. Aplicar a regra de troca em todos os pontos que mudam a categoria: gaveta, atalhos no cartão e menu em lote. Conferir duplicação de ação (mantém a duração da original).
4. Atualizar `docs/contracts/action-drawer.md` e `CURRENT.md`.

## Decisões do proprietário, 16/11/2026

1. **Trocar a categoria de uma ação cuja duração já foi ajustada à mão na Linha do tempo:** decidido manter o ajuste (regra implementada).
2. **Quadro Categorias ("Categorias" em Hoje): somente leitura.** Não arrasta e não troca a categoria de uma ação. Verificado no código: `app/components/layout/CategoriesBoard.tsx` usa `ActionContainer` sem `isDraggable` e o botão de cada coluna só cria um rascunho na categoria. Nada foi alterado ali.
3. **Troca de categoria acontece na gaveta** (`ActionFormDrawer` / seletor de categoria do rodapé em `ActionFormFooter.tsx`), tanto ao criar (rascunho, sem id) quanto ao editar. A duração segue `getTimeForCategoryChange`. No rascunho, a mudança atualiza `time` no estado local e a criação envia esse estado, então a ação nasce com a duração da nova categoria.
4. **Sem atalhos de teclado para trocar categoria.** Nenhum foi criado.
5. **Menu em lote** (`BulkActionMenu.tsx`): também troca a categoria (esquecido na decisão inicial, confirmado pelo proprietário em 16/11). Mantido exatamente como implementado, aplicando a mesma regra de duração; o item não foi removido.

**Caminhos que trocam a categoria:** (a) gaveta, ao criar e ao editar; (b) menu em lote. O quadro Categorias não troca categoria. 6. **Duração visível no seletor (`showTime`) e limpeza do rodapé (decisão final em 16/11/2026):** `UCategoriesCombobox` mantém a prop opcional `showTime` (padrão `false`), usada no rodapé da gaveta e na galeria `/ui`. Cada categoria mostra a duração padrão logo ao lado do nome (`text-xs text-secondary-foreground tabular-nums`), oculta por padrão (`opacity-0`) e visível instantaneamente em hover, foco ou quando selecionada. No rodapé da gaveta (`ActionFormFooter.tsx`), o antigo botão `ID` (e seu diálogo) foi removido a pedido do proprietário.

**Estado:** implementado localmente, não commitado; ajustado e conferido pelo proprietário no app (16/11/2026).

**Verificação feita:** `tsc --noEmit` e Prettier nos arquivos alterados. Sem testes novos; `bun run dev` usa o banco de produção (validação de criar/trocar categoria em dados reais fica com o proprietário).

## Critérios de conclusão

- [ ] Ação nova nasce com a duração da categoria.
- [ ] Trocar a categoria pelos três caminhos aplica a regra decidida.
- [ ] Ações existentes intactas; sem migration.
- [ ] Roteiro curto de validação. `bun run dev` usa o banco de produção: criar ou trocar categoria altera dados reais; o teste fica com o proprietário.

## Modelos sugeridos

- **Claude Code — Sonnet 5.5.** Mudança pequena, mas espalhada por três caminhos de troca de categoria; precisa achar todos.
- **Claude Code — Haiku 5.5.** Suficiente se o levantamento dos pontos de troca for entregue pronto no pedido.
- **Codex — GPT-6 Luna.** Alternativa leve de mesmo porte; conferir a disponibilidade no plano.
