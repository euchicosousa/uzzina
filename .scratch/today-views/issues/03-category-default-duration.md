# HOJE-03 — Duração padrão da ação por categoria

**Status.** Aberto em 16/11/2026 a pedido do proprietário, a partir do [HOJE-02](02-hour-view.md). Levantamento feito (código e contagem no banco de produção, só leitura). Nenhum arquivo do app foi alterado. Tabela aprovada em 16/11. Falta uma resposta (seção "O que o proprietário precisa decidir"). Ordem de execução decidida: HOJE-01, **HOJE-03**, HOJE-02.

**Independência.** Não depende do HOJE-01 nem do HOJE-02 e não mexe nos mesmos arquivos da visualização. Faz mais sentido estar pronto antes de a Linha do tempo entrar em uso, porque é o que dá o tamanho inicial de cada barra.

## O que a pessoa vê hoje

Nada na tela: a duração de uma ação não aparece nem pode ser mudada em lugar nenhum. Por baixo, toda ação nova nasce com **10 minutos**, seja Post Estático, Reels ou Reunião, e trocar a categoria não muda a duração.

## O que o proprietário pediu

Cada categoria tem uma duração padrão. A ação nasce com a duração da sua categoria e, ao trocar a categoria, a duração acompanha. A duração não é editável na gaveta; só na visualização Linha do tempo (HOJE-02).

## O que o levantamento encontrou

- **Não existe essa relação no app.** A lista de categorias (`app/lib/CONSTANTS.ts`) não tem duração, e a criação (`app/utils/factory.ts`) usa 10 fixo.
- **Os dados mostram que ela já existiu** (duração mais comum por categoria no banco, em 16/11), e serviram de ponto de partida para a tabela abaixo, ajustada pelo proprietário.

## Tabela aprovada pelo proprietário em 16/11/2026

| Categoria     | Duração padrão | Hoje no banco (mais comum) |
| ------------- | -------------- | -------------------------- |
| Post Estático | 10 min         | 10 min                     |
| Carrossel     | 20 min         | 10 min                     |
| Reels         | 30 min         | 20 min                     |
| Stories       | 5 min          | 5 min                      |
| Tarefa        | 5 min          | 5 min                      |
| Financeiro    | 5 min          | 5 min                      |
| Gravação      | 120 min        | 60 min                     |
| Reunião       | 60 min         | 60 min                     |
| Design        | 30 min         | 30 min                     |
| Tech/Coding   | 30 min         | 30 min                     |
| Social Media  | 15 min         | 15 min                     |
| Tráfego Pago  | 15 min         | 15 min                     |
| Impresso      | 30 min         | 5 min (1 ação)             |

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

## O que o proprietário precisa decidir

1. **Trocar a categoria de uma ação cuja duração já foi ajustada à mão na Linha do tempo:** manter o ajuste (recomendado; a duração só acompanha a categoria quando ainda estava no padrão da anterior) ou sempre voltar ao padrão da nova categoria.

## Critérios de conclusão

- [ ] Ação nova nasce com a duração da categoria.
- [ ] Trocar a categoria pelos três caminhos aplica a regra decidida.
- [ ] Ações existentes intactas; sem migration.
- [ ] Roteiro curto de validação. `bun run dev` usa o banco de produção: criar ou trocar categoria altera dados reais; o teste fica com o proprietário.

## Modelos sugeridos

- **Claude Code — Sonnet 5.5.** Mudança pequena, mas espalhada por três caminhos de troca de categoria; precisa achar todos.
- **Claude Code — Haiku 5.5.** Suficiente se o levantamento dos pontos de troca for entregue pronto no pedido.
- **Codex — GPT-6 Luna.** Alternativa leve de mesmo porte; conferir a disponibilidade no plano.
