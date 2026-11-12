# IA-M08 — Pesquisa de modelos para ler arquivos

Pesquisa de 12/11/2026 que apoia o ticket [IA-M08](../../.scratch/ai-models/issues/08-file-transcription-and-interpretation.md). Preços e pontuações vêm em parte de sites de terceiros e de rodadas únicas e preliminares de benchmark; conferir na página oficial antes de mudar o catálogo. Decisão do proprietário: usar apenas modelos que não exigem conta nova (Luna e Terra, da OpenAI); o restante fica como referência para o [IA-M09](../../.scratch/ai-models/issues/09-single-ai-account-and-billing-study.md).

## Sugestão original de modelos (anterior à decisão)

Preços e nomes mudam; os valores abaixo vieram de pesquisa em 12/11/2026, parte em fontes de terceiros, e precisam ser conferidos na página oficial antes de entrar no catálogo.

| Tarefa                                  | Recomendado                                           | Alternativa                    | Motivo                                                                                                                                                                                                                       |
| --------------------------------------- | ----------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Transcrição de imagem e PDF             | **Claude Haiku 5.5** (já no catálogo)                 | GPT-6 Luna (já no catálogo)    | Tarefa de leitura literal: modelo leve basta e o custo por carrossel fica em centavos. Os dois provedores aceitam imagem e PDF por endereço. Decidir entre eles com um teste lado a lado em 3 carrosséis reais (ver Aceite). |
| Interpretação                           | **Claude Sonnet 5.5** (já no catálogo)                | GPT-6.1 Terra (já no catálogo) | Exige leitura de intenção, tom e estrutura; vale o nível intermediário.                                                                                                                                                      |
| Transcrição de áudio e da fala de vídeo | Ver a tabela "Modelos de transcrição de áudio" abaixo |                                | Cobrança por tempo de áudio. Não é um modelo de texto: entra como chamada separada.                                                                                                                                          |
| Leitura visual de vídeo (etapa 3)       | Gemini Flash                                          | —                              | Único dos três que recebe vídeo inteiro. Exige provedor novo.                                                                                                                                                                |

### Modelos de transcrição de áudio (pesquisa de 12/11/2026)

Todos abaixo aparecem no catálogo de transcrição do OpenRouter; o preço é o listado lá, convertido para hora de áudio. Valores vindos de resultado de busca, a conferir na página de cada modelo.

| Modelo                         | Preço por hora de áudio  | Sem OpenRouter?                            | Observação                                                                                                                                                                           |
| ------------------------------ | ------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ElevenLabs Scribe v2**       | cerca de US$ 0,22        | Só com conta nova na ElevenLabs            | Melhor resultado em português nas comparações encontradas (3,0% de erro por palavra em comparativo da Gladia, feito por um concorrente e com áudio lido, não com áudio de WhatsApp). |
| **OpenAI GPT Transcribe**      | cerca de US$ 0,27        | **Sim, com a chave que a UZZINA já tem**   | Modelo atual da OpenAI para arquivo gravado. Não achei comparação independente em português.                                                                                         |
| Deepgram Nova-3 (multilíngue)  | cerca de US$ 0,31        | Conta nova                                 | Marca tempo por palavra e separa quem fala; mais do que este ticket precisa.                                                                                                         |
| Meta Muse Voice Transcribe 1.0 | cerca de US$ 0,18        | Não verificado                             | Sem dado de qualidade em português.                                                                                                                                                  |
| xAI Grok STT 2.0               | cerca de US$ 0,10        | Conta nova                                 | Barato, com separação de quem fala; sem dado em português.                                                                                                                           |
| Microsoft MAI-Transcribe 2     | US$ 0,10                 | Conta nova (Azure)                         | Sem dado em português.                                                                                                                                                               |
| OpenAI Whisper Large V3 Turbo  | cerca de US$ 0,01        | Não (modelo aberto, servido por terceiros) | O mais barato; geração anterior, erra mais em áudio ruidoso e pode inventar trechos em silêncio.                                                                                     |
| Google Gemini 3.5 Transcribe   | por token, não por tempo | Conta nova (Google)                        | Custo menos previsível.                                                                                                                                                              |

Também listados lá, sem preço confirmado: GPT-4o Transcribe, GPT-4o Mini Transcribe, Whisper (whisper-1), Mistral Voxtral e Fish Audio Transcribe.

**Recomendação.** O custo não decide: 10 horas de áudio por mês custam de US$ 0,10 a US$ 3 em qualquer um. Decide a fidelidade em português falado, com sotaque, ruído e gíria.

- **Para começar sem depender do OpenRouter:** GPT Transcribe, pela chave atual.
- **Se o OpenRouter for adotado (IA-M09):** testar Scribe v2 contra GPT Transcribe e ficar com o que errar menos.
- **Teste de decisão:** 3 áudios reais da agência (um de WhatsApp com ruído, um vídeo de cliente falando, uma reunião curta), transcritos pelos dois e conferidos pelo proprietário.

### Modelos de leitura de imagem e PDF: custo e qualidade (pesquisa de 12/11/2026)

**Custo.** Cenário usado: um carrossel de 10 slides, transcrição literal. Entrada de cerca de 16 mil tokens (a imagem de cada slide vale 1.300 a 1.600 tokens, mais o texto do comando) e saída de cerca de 4 mil (400 por slide). Preços por milhão de tokens: os de GPT-6, Haiku e Sonnet/Opus são os que já estão no catálogo da UZZINA (`server/ai-model-catalog.ts`); os do Gemini vêm de sites de terceiros. Reais a R$ 5,50 por dólar, só para ter ideia.

| Modelo                                  | Entrada / saída (US$ por milhão) | 1 carrossel, só transcrição | Transcrição e interpretação (uma chamada) | 1.000 carrosséis (transcrição) |
| --------------------------------------- | -------------------------------- | --------------------------- | ----------------------------------------- | ------------------------------ |
| GPT-6 Luna                              | 0,10 / 0,50                      | US$ 0,0035 (R$ 0,02)        | US$ 0,0039                                | US$ 3,50                       |
| **Claude Haiku 5.5**                    | 0,10 / 0,50                      | US$ 0,0036 (R$ 0,02)        | US$ 0,0040                                | US$ 3,60                       |
| Gemini 3.8 Flash (até 31/12)            | 0,75 / 3,75                      | US$ 0,025 (R$ 0,14)         | US$ 0,027                                 | US$ 25                         |
| Gemini 3.8 Flash (depois de 01/01/2027) | 1,50 / 7,50                      | US$ 0,050 (R$ 0,28)         | US$ 0,055                                 | US$ 50                         |
| GPT-6.1 Terra                           | 1,00 / 5,00                      | US$ 0,035 (R$ 0,19)         | US$ 0,039                                 | US$ 35                         |
| Claude Sonnet 5.5                       | 2,00 / 10,00                     | US$ 0,073 (R$ 0,40)         | US$ 0,079                                 | US$ 73                         |
| GPT-6.1 Sol                             | 2,00 / 10,00                     | US$ 0,071 (R$ 0,39)         | US$ 0,077                                 | US$ 71                         |
| Claude Opus 5.5                         | 4,00 / 20,00                     | US$ 0,146 (R$ 0,80)         | US$ 0,158                                 | US$ 146                        |

Se transcrição e interpretação forem duas chamadas separadas (a interpretação reenvia as imagens), o custo da segunda soma quase o mesmo valor da primeira: ainda centavos. Um PDF de 10 páginas custa parecido com um carrossel de 10 slides (cada página vira cerca de 1.600 a 2.000 tokens, mais o texto do arquivo).

**Qualidade em leitura de texto na imagem (OCR).** Só achei comparativos públicos pequenos, e nenhum deles com carrossel de rede social em português:

| Modelo           | Roboflow Vision Evals, OCR (pontos, rodada única preliminar) | Arena, ranking de OCR |
| ---------------- | ------------------------------------------------------------ | --------------------- |
| Gemini 3.8 Flash | **72,8**                                                     | 2º lugar (1316)       |
| Claude Haiku 5.5 | 61,2                                                         | sem dado achado       |
| GPT-6 Luna       | 59,8 (62,5 com mais esforço, a quase 3x do custo)            | 67º lugar (1251)      |
| GPT-6.1 Terra    | 81,9 em outro ranking do mesmo site, de outubro              | sem dado achado       |

**Leitura da tabela.**

- Luna e Haiku custam o mesmo (cerca de 2 centavos de real por carrossel) e ficam empatados em qualidade. Por esse comparativo, o Haiku tem pequena vantagem.
- O Gemini 3.8 Flash lê melhor que os dois, mas custa 7 vezes mais (e dobra de preço em janeiro). Ainda é cerca de 14 centavos de real por carrossel, então o custo não é o obstáculo: o obstáculo é que exige conta no Google, ou o OpenRouter (mais um motivo para o [IA-M09](../../.scratch/ai-models/issues/09-single-ai-account-and-billing-study.md)).
- O Terra custa 10 vezes o Luna e lê melhor; é a opção "intermediária" sem provedor novo.
- Sonnet, Sol e Opus não se justificam para transcrição literal. Fazem sentido, no máximo, na interpretação.

**Família Gemini 4 (Argon e Carbon), acrescentada em 12/11.**

| Modelo                           | Entrada / saída (US$ por milhão) | 1 carrossel, transcrição                                    | OCR, Roboflow (rodada única preliminar) |
| -------------------------------- | -------------------------------- | ----------------------------------------------------------- | --------------------------------------- |
| Gemini 4 Argon, até 30/11        | 2,00 / 10,00                     | cerca de R$ 0,37                                            | **85,7** (alta dedicação: 80,0)         |
| Gemini 4 Argon, de 01/12         | 4,00 / 20,00                     | cerca de R$ 0,73                                            | idem                                    |
| Gemini 4 Carbon, até 30/11       | 2,00 / 10,00                     | cerca de R$ 0,37, mas pode gastar mais tokens de raciocínio | **sem dado de OCR achado**              |
| Gemini 4 Carbon, de 01/12        | 4,00 / 20,00                     | cerca de R$ 0,73                                            | idem                                    |
| GPT-6.1 Sol (catálogo da UZZINA) | 2,00 / 10,00                     | R$ 0,39                                                     | 75,8                                    |

- O proprietário viu em vídeos que o Carbon não está tão caro e briga com o Sol: **confere**. Pelo preço de tabela, Argon e Carbon custam o mesmo que o Sol (US$ 2 / US$ 10), mas **só até 30/11 segundo a maioria das fontes**; depois dobram para US$ 4 / US$ 20. Uma fonte diz que o fim da promoção do Carbon não foi publicado.
- **Disponibilidade do Carbon:** relatos de abertura na API paga em 10/11/2026; fontes antigas diziam que era restrito. Não consegui confirmar na página do Google. Conferir antes de planejar.
- **Custo real do Carbon pode ser maior que o do Argon:** no índice de agentes, o Carbon gastou cerca de 205 milhões de tokens contra 113 milhões do Argon (raciocínio é cobrado como saída). Para leitura de imagem não há medida; é preciso medir.
- **Qualidade:** o Argon lidera o OCR do Roboflow (85,7 contra 75,8 do Sol). **Não há nenhum número de OCR ou visão do Carbon**: ele aparece à frente do Argon em notas gerais e de agentes, o que não prova leitura melhor de texto em imagem.
- Conclusão: para transcrição, **Argon é o candidato forte** da família Gemini 4 (melhor OCR achado, mesmo preço do Sol). O Carbon só entra no teste se alguém publicar OCR dele ou se medirmos nós mesmos. Custo de ler carrossel continua pequeno em qualquer um (R$ 0,37 a R$ 0,73), mas é 15 a 35 vezes o do Haiku/Luna.

### Como escolher entre Luna e Terra (sem conta nova)

Os dois usam a chave da OpenAI que a UZZINA já tem (o Haiku, com a chave da Anthropic, também). A diferença de custo é de centavos (R$ 0,02 contra R$ 0,19 por carrossel de 10 slides); o que muda é a qualidade da leitura (OCR: Luna 59,8 contra Terra 81,9 no Roboflow, números preliminares).

1. **Fixo por função (mais simples e previsível).** Transcrição com Luna, interpretação com Terra. O servidor define; a pessoa não escolhe.
2. **Escolha da pessoa por leitura.** No diálogo "Ler com IA", uma opção "Leitura cuidadosa" liga o Terra. Padrão desligado (Luna). Quem sabe que o material é difícil (letra pequena, arte carregada, foto de papel) liga.
3. **Automático por tipo de arquivo.** Regras do servidor, por exemplo PDF com texto digital no Luna e imagem no Terra. Funciona para o que dá para saber de fora do arquivo (tipo, tamanho, número de páginas); não detecta "arte difícil".
4. **Automático por tentativa e escalada.** Lê com Luna e, se o resultado falhar em verificações simples (vazio, curto demais para a quantidade de imagens, formato quebrado), repete com Terra. Só pega falhas visíveis: um erro de leitura que parece texto normal passa sem aviso.

Recomendação: **1 mais 2**. O custo não justifica regra automática, e as regras 3 e 4 são código a manter para economizar centavos, com risco de falha silenciosa. Só vale a pena automatizar se o teste lado a lado mostrar que o Luna erra pouco. Se o Luna perder feio, o mais simples é usar o Terra sempre (R$ 0,19 por carrossel; US$ 35 por mil carrosséis).

Como seria feito: um novo tipo de comando "ler arquivos" no contrato de IA e no catálogo de modelos, com um modelo por tarefa definido no servidor; a "Leitura cuidadosa" é só um parâmetro que o servidor valida. Reserva de franquia e registro de custo seguem o modelo que respondeu, como hoje.

**Ressalvas.** Os preços do catálogo da UZZINA coincidem com a tabela de preços da OpenAI encontrada na pesquisa (Luna a US$ 0,10 e Terra a US$ 1,00 de entrada). O número de tokens por imagem é estimativa: a regra do Claude é documentada (cerca de largura × altura ÷ 750, com limite), a do GPT-6 e a do Gemini 3.8 não foram confirmadas. O custo exato só se sabe medindo no teste lado a lado, que passa a incluir o Gemini 3.8 Flash como terceiro participante.

**Recomendação revisada.** Transcrição de imagem e PDF: testar **Haiku 5.5 × Luna** (custo igual, sem provedor novo) e, se o proprietário quiser a melhor leitura, incluir o **Gemini 3.8 Flash** (ou o **Gemini 4 Argon**, melhor OCR achado) no teste, a depender do IA-M09. Interpretação: **Sonnet 5.5**, porque o custo extra são centavos e o ganho é de leitura de intenção e tom.

O modelo desta função fica **fixo por tarefa no servidor**, sem seletor na tela na primeira versão. Depois, se fizer sentido, entra em Minha Conta → "Modelos padrão de IA" como as outras tarefas.

## OpenRouter: viabilidade (resumo; o estudo completo é o IA-M09)

**O que é:** uma conta e uma chave que dão acesso a modelos de várias empresas (OpenAI, Anthropic, Google e outras), com pagamento único por créditos.

**A favor:**

- Uma fatura e uma chave em vez de duas ou três.
- Abre o Gemini (vídeo inteiro, etapa 3) sem contratar o Google à parte.
- Tecnicamente cabe: o servidor já usa uma camada (AI SDK) que troca de provedor por configuração.

**Contra, para o que a UZZINA tem hoje:**

- A franquia mensal e o registro de custo da UZZINA calculam o gasto por modelo com as tarifas oficiais de cada empresa. Passando pelo OpenRouter, o valor real cobrado é o dele (preço do modelo mais a taxa cobrada na compra de créditos, a confirmar na página oficial). Todo o cálculo de custo precisaria ser revisto e reconciliado.
- Correção de 12/11: o OpenRouter tem um catálogo próprio de modelos de transcrição de áudio (tabela acima). O que ficou sem confirmar é se esse serviço aceita o endereço do arquivo ou exige o arquivo embutido na requisição, o que esbarraria no limite de tamanho das funções da Vercel. Fica como pergunta do IA-M09.
- Mais um intermediário entre a UZZINA e o modelo: mais um ponto de falha e de política de dados para avaliar.
- Em 05/11/2026 já foi estudada uma alternativa parecida, o AI Gateway da Vercel (mesma ideia de chave e fatura únicas, dentro da conta que a UZZINA já usa). Os dois deveriam ser comparados juntos.

**Recomendação:** não misturar. Esta função **não precisa** do OpenRouter: as etapas 1 e 2 funcionam com as chaves atuais. A troca de "como pagamos e chamamos os modelos" mexe em todos os comandos de IA e na franquia, e merece um ticket de estudo próprio (OpenRouter × AI Gateway da Vercel × continuar direto), a abrir se o proprietário quiser.

## Fontes

- [OpenRouter — entradas multimodais](https://openrouter.ai/docs/guides/overview/multimodal/overview) · [OpenRouter — PDFs](https://openrouter.ai/docs/guides/overview/multimodal/pdfs)
- [Preços de transcrição da OpenAI (terceiros)](https://www.developersdigest.tech/models/speech/openai) · [gpt-transcribe (terceiros)](https://spokenly.app/blog/gpt-transcribe)
- [Preços do Gemini (terceiros)](https://www.morphllm.com/gemini-api-pricing)
- [Preços Gemini 4 Carbon](https://www.eesel.ai/blog/gemini-4-carbon-pricing) · [Carbon × Argon](https://apidog.com/blog/gemini-4-carbon-vs-argon/) · [Argon × GPT-6.1 Sol (Roboflow)](https://playground.roboflow.com/models/compare/gemini-4-argon-vs-gpt-6-1-sol) · [Carbon disponível (AI Weekly)](https://aiweekly.co/alerts/google-ships-gemini-4-carbon-to-paid-api-and-ai-ultra-tops-cursorbench-and)
- [Haiku 5.5 × Luna (Latent Space)](https://latent.space/p/ainews-claude-haiku-55-better-than/) · [Haiku 5.5 × Gemini 3.8 Flash](https://emergent.sh/learn/claude-haiku-5-5-vs-gemini-3-8-flash) · [Roboflow — Luna](https://playground.roboflow.com/models/openai/gpt-6-luna) · [Arena — ranking de OCR](https://arena.ai/leaderboard/chat/vision/ocr) · [Tokens de imagem do Claude](https://platform.claude.com/docs/en/build-with-claude/vision) · [PDFs no Claude](https://platform.claude.com/docs/en/build-with-claude/pdf-support) · [Preços Gemini](https://www.morphllm.com/gemini-api-pricing)
- [OpenRouter — modelos de transcrição](https://openrouter.ai/collections/speech-to-text-models) · [Comparativo da Gladia](https://www.gladia.io/competitors/benchmarks) · [OCR — Roboflow](https://playground.roboflow.com/ranking/ocr)
- [Limites das funções da Vercel](https://vercel.com/docs/functions/limitations)
- [Estudo anterior de SDK e Gateway](2026-11-05-ai-provider-sdk.md)
