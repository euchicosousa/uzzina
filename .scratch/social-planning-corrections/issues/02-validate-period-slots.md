# C02: Bloquear períodos inválidos e eliminar conteúdos sem slot

**Status:** completed

**Blocked by:** Nenhum. Entregue em 02/11/2026.

**Prioridade:** P2

**Instrução de execução:** ler o README desta série; executar apenas este recorte, preservar mudanças externas e respeitar os bloqueios acima.
**What to build:** No modo Por período, o total mostrado e gerado corresponde exatamente às posições válidas confirmadas. Entrada inválida é explicada antes de gerar.

## Pontos de entrada

`app/lib/social-planning/slot-calculator.ts: calculatePeriodSlots`, `generator.ts: generateSocialPlan`; formulário e `handleGenerate` da rota de Planejamento. Não editar calendário global.

## Passos obrigatórios

1. Validar datas reais e formato de data civil, início menor/igual ao fim, frequência inteira positiva dentro dos limites já aprovados e IDs de dias válidos.
2. Remover a conversão de “zero slots” em seis conteúdos sem data. No modo período, zero slots é estado inválido para gerar, com motivo visível.
3. Não confundir modo tema sem data com período inválido. A quantidade do tema continua separada.
4. Exibir quantidade regular calculada antes de enviar. Mesma função de cálculo alimenta resumo e pedido; não duplicar algoritmo no JSX.
5. Relacionar slider/dias pelas decisões D2. Antes dessa resposta, conservar somente o comportamento definido e sinalizar casos ambíguos; não escolher semana civil, proporcionalidade ou dias adicionais por conta própria.
6. Fazer o handler validar novamente, mesmo se o botão estiver desabilitado. C05 deverá reutilizar essa validação no servidor; exportar contrato puro sem dependência de UI.
7. Datas civis não devem mudar de dia por conversão implícita UTC/local.
8. Mudança de configuração não altera a proposta já aberta: o resultado permanece ligado à entrada capturada no disparo. C06 cuida da reabertura completa.

## Casos verificáveis

- Início posterior ao fim, data impossível, nenhum dia selecionado e intervalo sem ocorrência dos dias: nenhuma geração e mensagem específica.
- Um único dia válido no intervalo: uma posição, sem preenchimento artificial.
- Com D2 definida: semana completa, incompleta, virada de mês/ano e quantidade de dias diferente do slider.
- Solicitar novamente mesmo período mantém o total inteiro; não consulta ações existentes.

## Acceptance criteria

- [x] Nunca há geração por período com zero slots nem fallback para tema.
- [x] Nenhuma posição calculada fica fora do intervalo inclusivo.
- [x] Quantidade regular do resumo é a mesma do pedido.
- [x] Configuração inválida não chama IA nem reserva quota.
- [x] Slider e dias aprovados permanecem na interface.
- [x] Regra de semana só muda após D2 estar registrada.

**Não fazer:** definir limites arbitrários, preencher datas faltantes com hoje, descontar ações existentes ou alterar Hoje/Home.
