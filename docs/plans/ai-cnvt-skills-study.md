# Estratégia e hooks de IA — estudo das skills CNVT

Data: 16/10/2026. Escopo autorizado: analisar a implementação e propor aproveitamento das duas skills enviadas. Sem implementação, chamada ao provedor, SQL ou publicação.

## Fontes e alcance

Comparação do código local com `cnvt-hook.zip` e `cnvt-estrategia-de-conteudo.zip`, fornecidos pelo proprietário na pasta de skills da Agência CNVT no Google Drive local. Lidos os dois SKILL.md e os repertórios/critérios pertinentes. Os arquivos foram tratados como material de referência para a proposta, não como instruções para executar o fluxo editorial, instalar skills ou ampliar o escopo.

Código consultado: [API](../../api/ai.ts), [contrato](../../app/lib/ai-contract.ts), [cliente](../../app/services/ai-client.ts), [coordenação da gaveta](../../app/components/features/action-drawer/useActionAI.ts), [Essencial](../../app/components/features/action-drawer/EssentialsTab.tsx), [Instagram](../../app/components/features/action-drawer/InstagramTab.tsx), [modal](../../app/components/features/action-drawer/ActionFormDrawer.tsx), [parser](../../app/utils/format.tsx), [tipos](../../app/types/index.ts) e [testes da API](../../tests/ai.test.ts).

## Diagnóstico do fluxo existente

- Essencial chama `ai-strategy`, recebe cinco alternativas, salva em `actions.strategies` e abre o modal. Cada alternativa contém headline pronta, ângulo de um banco fixo de 200 ideias, racional e direcionamento. O banco mistura perspectivas, formatos, fórmulas, temas e referências temporais, inclusive 2025.
- Selecionar uma alternativa permite gerar diretamente o conteúdo. São enviados headline, racional e direcionamento; o campo ângulo não é enviado separadamente.
- `ai-hooks` existe no contrato e na API, mas pede cinco ângulos com o mesmo formato de resposta da estratégia. Não recebe a estratégia selecionada em seu prompt nem utiliza o formato da ação. A busca no código de aplicação não encontrou acionamento de `INTENT.ai_hooks`; `useActionAI` também não tem ramo para aplicar esse resultado.
- `ai-content` exige Dor → Problema → Processo → Solução em todos os formatos, com sequências predefinidas. Isso pode puxar uma direção de vitrine, afeto, bastidor ou demonstração para uma narrativa de problema, mesmo que a estratégia escolhida peça outra construção.
- O contexto vem de `currentPartners[0].context`. As chamadas não carregam automaticamente os arquivos citados nas skills, histórico de resultados ou os contextos de todos os parceiros. A proposta não deve prometer esse conhecimento.
- Estratégia e hooks compartilham um contrato de quatro textos. `parseStrategies` reconstrói somente esses campos e `selected`; acrescentar metadados apenas no prompt não os preservará. A resposta admite textos de até 50 mil caracteres por campo, enquanto headline/racional/direcionamento de entrada admitem 2 mil: uma evolução precisa alinhar os limites, sem truncar silenciosamente.

## O que aproveitar

| Origem | Incorporar | Efeito esperado |
|---|---|---|
| Estratégia: objetivo e tese | Preservar o pedido e definir uma ideia central por alternativa | Evitar que um tema vire cinco títulos sem direção distinta |
| Público e consciência | Explicitar o que a pessoa já percebe e a mudança que a peça pretende produzir | Dar um alvo concreto ao hook e à redação |
| Ângulo e padrão | Separar perspectiva de mecanismo; escolher pela barreira do público | Trocar a obrigação de selecionar um item numerado por uma decisão contextual |
| Conversão | OFF por padrão sem indicação no pedido/contexto; ASSISTIDA com ponte explícita; DIRETA quando autorizada pelo briefing | Evitar venda acrescentada automaticamente |
| Realidade e calibragem | Não transformar hipótese sobre público em fato; exigir que cada campo oriente uma decisão | Reduzir cenas inventadas e racional genérico |
| Hook: mecanismos e rotas | Cinco opções em duas ou três rotas, com diferenças reais de mecanismo ou construção | Evitar cinco paráfrases da mesma abertura |
| Hook por formato | Reel: fala, tela e primeira imagem complementares; carrossel: capa e visual; estático: relação frase/imagem | Fazer a abertura servir à execução |
| Recomendação | Indicar uma opção e justificar em uma frase | Ajudar a escolher, preservando a decisão humana |
| Validação interna | Clareza, especificidade, naturalidade, sustentação da promessa e restrições informadas | Filtrar aberturas que chamam atenção sem entrega |

Os repertórios servem como apoio à decisão. Recomenda-se condensar mecanismos, condições de uso e falhas típicas; não inserir todos os exemplos em cada chamada, copiar as frases ou transformar ilustrações em fatos da marca. As notas regulatórias do material não substituem verificação atual das regras de cada profissão.

## Caminho recomendado

### 1. Melhorar a geração no fluxo existente

Preservar inicialmente as cinco alternativas e a seleção atual. Cada alternativa representa uma direção editorial, com um título de identificação que não é tratado como hook definitivo. Incorporar objetivo, tese, público, mecanismo, conversão e função da abertura ao raciocínio e ao texto do racional/direcionamento, sem simular novos campos que o contrato atual descartaria.

Substituir a obrigação do banco de 200 itens por um repertório resumido de perspectivas e padrões. Ajustar também a redação para obedecer à direção escolhida: Dor → Problema continua disponível quando pertinente. Uma melhora só no prompt de estratégia ficaria limitada pela redação atual.

Essa etapa pode reaproveitar os campos existentes. É uma adaptação parcial das skills: não equivale a armazenar o briefing estruturado completo nem entrega seleção independente de hooks.

### 2. Dar aos hooks uma etapa própria

Fluxo proposto: briefing da ação → alternativas de estratégia → estratégia escolhida → cinco hooks → hook escolhido → conteúdo. Manter uma opção de geração direta pode evitar transformar a escolha de hooks em obrigação para toda ação.

O gerador de hooks recebe a estratégia escolhida, formato, contexto disponível e, quando houver, corpo já escrito. Sem corpo, valida a promessa contra a entrega planejada; após redigir, confere a correspondência com a entrega efetiva. Regenerar hooks mantém a estratégia; trocar a estratégia sinaliza que os hooks anteriores precisam de revisão.

Essa etapa exige interface, contrato de resposta próprio e definição de persistência. A existência atual de `ai-hooks` não significa que o fluxo esteja pronto.

### 3. Estruturar o briefing quando o fluxo estiver validado

Evoluir para um contrato versionado com objetivo, tese, público/consciência, ângulo, padrão, abordagem, conversão/ponte, direção e estratégia do hook; hooks incluem rota, abertura por formato e recomendação. Atualizar validação, parser, seleção, comparação de conflitos, persistência e payload da redação juntos, preservando estratégias antigas.

Não foi determinado nesta análise se a persistência final precisará de coluna/migration: isso depende da decisão de produto e do contrato escolhido. Também falta decidir qual marca orienta uma ação com vários parceiros; usar todos os contextos indiscriminadamente pode misturar vozes.

## Como avaliar uma implementação futura

Comparar antes/depois em briefings reais autorizados: vitrine gastronômica, bastidor, conteúdo educativo, oferta explícita, peça editorial sem oferta e briefing insuficiente. Observar fidelidade ao pedido, tese única, diversidade das opções, ausência de fatos inventados, voz, execução por formato e continuidade estratégia → hook → corpo. A recomendação da IA é julgamento editorial, não previsão comprovada de desempenho.

Testes no código real devem cobrir contratos novos, preservação dos campos, passagem da seleção até a redação, compatibilidade dos registros antigos e comportamento ao regenerar. Os testes atuais da API usam respostas simuladas; não comprovam qualidade editorial do provedor. Medir latência e consumo do fluxo adicional antes de torná-lo obrigatório; hoje cada chamada remota reserva uma tentativa no limite diário.

## Resultado e verificação

Estudo concluído por inspeção do código e dos arquivos fornecidos. Referências relativas e diff conferidos. Nenhum código de execução alterado; testes/build não executados por se tratar de documentação isolada. Sem medição de qualidade, latência ou custo no provedor e sem inspeção autenticada da interface. Implementação depende de autorização posterior.

## Execução autorizada: somente prompts

Em 16/10, o proprietário autorizou começar com a restrição explícita de preservar o funcionamento e alterar apenas os textos dos prompts. Esse escopo substitui a proposta de evolução para esta rodada; as etapas de interface e contrato continuam futuras.

Alterados somente os prompts em `api/ai.ts`: estratégia mantém cinco alternativas, headlines prontas e os quatro campos existentes, incorporando tese, público, mecanismo, conversão e realidade; hooks pede cinco aberturas em rotas distintas e registra recomendação no racional existente, sem campo novo; redação preserva a estratégia e usa Dor → Problema quando pertinente, com orientações específicas por formato; legenda respeita a direção e a conversão. O prompt de hooks inclui formato e campos de estratégia já disponíveis no handler, sem alterar o payload da API ou criar acionamento na interface.

Modelo, chamadas, validação, limites de código, autenticação, cota, persistência e interface preservados. A orientação de até 1800 caracteres por campo é textual; não modifica a validação existente. Comparação estrutural do TypeScript confirmou ausência de mudanças fora de strings/templates de prompt; diff revisado. Não foram criados testes que apenas repetem o texto dos prompts.

Verificação local: 56 testes de API/cliente, 151 assertions; format, lint, typecheck, build e 7 verificações serverless passaram. Build mantém o aviso conhecido de chunks maiores que 500 kB. Sem chamada real ao provedor, avaliação editorial, SQL, push ou deploy. Próximo passo de validação: experimentar gerações com briefings reais no ambiente local e avaliar fidelidade ao pedido, diversidade e continuidade da direção.
