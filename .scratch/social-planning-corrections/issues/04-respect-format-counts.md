# C04: Respeitar quantidades manuais de formatos sem ajustes ocultos

**Status:** completed

**Blocked by:** Nenhum. Entregue em 02/11/2026.

**Prioridade:** P2

**Instrução de execução:** ler o README desta série; executar apenas este recorte, preservar mudanças externas e respeitar os bloqueios acima.
**What to build:** Quantidades de reels, estáticos e carrosséis informadas pelo usuário são respeitadas ou rejeitadas com explicação. O app não corta nem completa silenciosamente o pedido.

## Pontos de entrada

`distributeFormats` em `app/lib/social-planning/slot-calculator.ts`; campos e cálculo de formatos na rota; contrato do gerador.

## Passos obrigatórios

1. Remover os caminhos que truncam quantidades e preenchem o restante em ciclo sem consentimento.
2. Validar números inteiros não negativos, valores finitos e limites aprovados. Não converter entrada inválida em zero silenciosamente.
3. Comparar composição ao total regular segundo D3. Quando a configuração não for resolvida pela regra aprovada, apresentar divergência antes da geração e conservar os números digitados. Não inventar uma regra para acomodar o pedido.
4. Ao mudar período, frequência ou quantidade por tema, sinalizar que a composição precisa ser revista se perder validade. Não reajustar os campos sozinho.
5. Aplicar distribuição automática somente segundo D3; mostrar seu modo no resumo. Extras recebem regra própria de D3/D4 e não consomem a distribuição regular.
6. Persistir a composição completa na entrada do plano: modo, contagens solicitadas/confirmadas e contabilidade de extras. C01 fornece fronteira; combinar integração serialmente se ainda em andamento.
7. Fornecer contrato puro de validação à C05. Depois, o resultado da IA também precisa ser conferido: divergência não se corrige trocando rótulos silenciosamente.

## Casos verificáveis

Total seis com quatro reels e zero outros deve sinalizar divergência conforme D3, nunca virar cinco reels/um carrossel. Total três com quatro reels não pode descartar um sem aviso. Entrada negativa, decimal ou inválida não gera. Regular seis e dois extras conserva as quantidades regulares confirmadas.

## Acceptance criteria

- [x] Pedido manual não sofre truncamento ou preenchimento oculto.
- [x] Divergência aparece antes de chamar o provedor.
- [x] Mudança de total não apaga nem reequilibra contagens digitadas.
- [x] Modos por tema e por período usam a mesma regra validada.
- [x] Entrada persistida permite reconstruir exatamente o pedido.
- [x] Testes pequenos verificam contagens reais, não apenas repetem strings da UI.

**Não fazer:** ampliar catálogo de formatos, decidir percentuais arbitrários ou redesenhar os controles.
