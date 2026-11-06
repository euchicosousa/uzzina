# IA-M05 — Contornar a espera da geração (reestudo)

Data: 06/11/2026. Base: `main` local após `e1ca905`. Estudo apenas; nenhuma mudança de código nesta entrega.

## Pergunta corrigida pelo proprietário

A demora é normal e vai continuar: modelos mais baratos respondem mais rápido e os mais caros demoram. O objetivo não é reduzir a latência, é **contornar a espera**, ou seja, o que fazer para que ela atrapalhe menos. **Sem streaming.** O estudo anterior ([2026-11-06-ia-m05-ai-latency.md](2026-11-06-ia-m05-ai-latency.md)) respondeu outra pergunta e fica como referência técnica.

## O que a espera faz hoje

Tudo abaixo vem da leitura do código.

- **Legenda e conteúdo são síncronos e prendem a ação.** Enquanto `isAIProcessing` estiver ativo, a guarda de saída da gaveta (`ActionFormDrawer.tsx`, `prepareLeave`) recusa trocar ou fechar a ação e mostra "Aguarde a geração terminar antes de trocar ou fechar a ação." Os controles de estratégia ficam desabilitados (`isDisabled={strategyControlsBlocked || isAIProcessing}`). A pessoa fica parada olhando o loader. O teste `tests/notifications-navigation.test.tsx` ("AI processing blocks leaving…") protege esse comportamento.
- **Estratégias já são duráveis.** A geração roda no worker. Depois da aceitação no servidor, fechar o diálogo, a gaveta ou trocar de página não perde nada (contrato Estratégias09 no AGENTS.md). A espera só prende até a aceitação.
- **Já existem duas gavetas.** `useActionPanels` permite uma ação secundária, mas a guarda de saída bloqueia a troca enquanto a geração estiver ativa.
- **O seletor de modelo não diz qual é rápido.** `UAIModelSelect` mostra nome e provedor, mas não a expectativa de tempo.

## Opções para contornar, sem streaming

| #   | Opção                                                                                                                                                                                                     | O que muda para quem usa                  | Esforço e risco                                                                                                                                                               |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | **Liberar a pessoa durante legenda e conteúdo.** A requisição continua viva e o resultado entra no campo quando chegar, mesmo que a pessoa tenha mudado de aba ou aberto outra ação na gaveta secundária. | Dá para seguir trabalhando em outra coisa | Médio. A guarda de saída deixa de bloquear por `isAIProcessing` e passa a bloquear só o fechamento da própria ação. O resultado entra pelo coordenador, respeitando a versão. |
| B   | **Aviso de conclusão.** Um toast "Legenda pronta · Ver ação" quando a pessoa está em outro lugar, e um indicador na aba do navegador.                                                                     | Não precisa ficar olhando                 | Baixo. Depende de A ou do fluxo de estratégias, que já é durável.                                                                                                             |
| C   | **Expectativa no seletor.** Um selo "rápido / equilibrado / demorado" por modelo, ou uma frase "Astra costuma levar mais", vindo do catálogo.                                                             | A pessoa escolhe sabendo o custo em tempo | Baixo. É dado estático no catálogo, sem medição real.                                                                                                                         |
| D   | **Progresso que informa.** Texto por etapa ("Enviando… / Gerando com Astra… / Salvando…") e tempo decorrido no lugar do loader mudo.                                                                      | A espera parece controlada                | Baixo. Usa os estados que o hook já conhece.                                                                                                                                  |
| E   | **Tornar legenda e conteúdo duráveis como as estratégias.** O worker grava o resultado, e a pessoa pode fechar a ação e voltar depois.                                                                    | Fechar a ação não perde nada              | Alto. Precisa de fila, migration, worker, quota e conflito de versão. Fica como evolução futura.                                                                              |
| F   | **Usar o modelo rápido por padrão** e deixar o caro como escolha consciente.                                                                                                                              | Menos espera no dia a dia                 | Já existe: os padrões pessoais são Luna.                                                                                                                                      |

## Recomendação

A combinação de menor esforço e maior efeito é **A + B + C**, em recortes separados:

1. **C**, expectativa no seletor: dado estático e sem risco.
2. **A**, liberar a navegação durante legenda e conteúdo: é o que tira o bloqueio de fato. Exige um ticket próprio com critérios de versão e de guarda.
3. **B**, aviso de conclusão, junto com A.

D é um complemento barato. E fica registrado para o futuro.

## Os logs de tempo adicionados em `8a9f035`

O commit `8a9f035` (`server/ai-timing.ts`, `api/ai.ts`, `server/strategy-operations.ts`) mede a duração de cada etapa. Para **contornar** a espera eles não são necessários: as opções A–D não dependem de medição. Serviriam no máximo para calibrar os textos da opção C, que podem ser estáticos. **Recomendação: reverter**, a critério do proprietário. Os logs estão só no checkout local e nunca foram publicados.

## Limites

Estudo por leitura de código. Nada foi medido nem gerado. Os fluxos descritos devem ser confirmados no app antes de abrir os tickets de implementação.
