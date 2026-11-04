# C03: Restringir comemorações ao período e separar extras

**Status:** completed

**Blocked by:** Nenhum. Entregue em 02/11/2026.

**Prioridade:** P2

**Instrução de execução:** ler o README desta série; executar apenas este recorte, preservar mudanças externas e respeitar os bloqueios acima.
**What to build:** Considerar datas comemorativas inclui somente ocorrências válidas do intervalo selecionado e mostra extras separadamente da quantidade regular.

## Problema e pontos de entrada

A rota aceita qualquer registro do mesmo mês, inclusive outro ano ou fora de um intervalo curto. `mergeCommemorativeSlots` aceita IDs/datas sem validar limites. Ler `periodCelebrations` na rota, `slot-calculator.ts` e o model de comemorações existente.

## Passos obrigatórios

1. Remover o fallback por número do mês. Filtrar ocorrências pelo intervalo completo inclusivo, com ano e data válidos. Ordenar por data completa, não só dia do mês.
2. Conferir o contrato real do cadastro: data concreta ou regra recorrente. Se for concreta, não mudar seu ano automaticamente. Se existir recorrência suportada, resolver a ocorrência pelo mecanismo existente e registrar a data efetiva.
3. Alterar o merge para receber/validar o intervalo canônico. Um ID selecionado que saiu do período não pode inserir data externa.
4. Ao mudar intervalo ou desligar “considerar datas”, impedir que seleção antiga continue produzindo extras invisíveis. Atualizar seleção/resumo de forma explícita.
5. Manter IDs de origem e distinção regular/extra, inclusive quando há colisão. Aplicar somente D4 para coincidências e múltiplas datas no mesmo dia.
6. Mostrar “N regulares + M extras = T sugestões”. Regular não é reduzido para acomodar extras.
7. Entregar a C04 a quantidade regular e a quantidade extra separadas, com os mesmos dados que irão para C05.
8. Não implementar consulta de feriados nova nem mexer em seleção de feriados do parceiro.

## Casos verificáveis

Período 10–20/11/2026 exclui 01/11/2026, 30/11/2026 e novembro/2025; inclui os limites. Intervalo dezembro–janeiro respeita ano. Data inválida/ID removido não gera sugestão. Desligar o botão remove efeito dos extras. Colisões seguem D4, sem perder o total regular.

## Acceptance criteria

- [x] Nenhuma comemoração externa ao intervalo entra pelo filtro nem pelo merge.
- [x] Uma seleção antiga não injeta extras ocultos.
- [x] Datas não mudam de ano sem regra de recorrência existente.
- [x] Resumo, pedido e resultado distinguem regulares e extras.
- [x] Nenhuma alteração nos calendários ou cadastros de outras páginas.
