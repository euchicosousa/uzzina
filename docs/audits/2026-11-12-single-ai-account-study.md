# IA-M09 — Conta e pagamento únicos de IA: OpenRouter, AI Gateway da Vercel ou direto

Relatório de estudo, 12/11/2026. **Nada foi alterado** em código, chaves, banco ou configuração, e **nenhuma chamada real** foi feita ao OpenRouter, ao Gateway ou aos provedores. Tudo abaixo vem de leitura do código da UZZINA e de pesquisa documental; onde a fonte é de terceiros ou ficou sem confirmação, está dito.

## Resumo para decidir

- **O OpenRouter não cobra margem por chamada**, mas cobra **5,5% (mínimo US$ 0,80) em cada compra de créditos**. Em compras pequenas isso pesa muito (US$ 5 → 16%). Mais o IOF brasileiro (3,5% em operações de câmbio, segundo fontes de 2025) que vale para qualquer pagamento internacional, inclusive os diretos de hoje.
- **O AI Gateway da Vercel** informa zero margem sobre os tokens (documentação da própria Vercel) e fica na conta que a UZZINA já usa. Não achei fonte oficial clara sobre taxa de compra de créditos: **conferir antes de decidir**.
- **O maior custo de mudar é interno, não de taxa:** hoje o gasto é calculado pela UZZINA com tarifa oficial por modelo e o banco guarda o custo em nano-dólares. Com intermediário, existe um segundo número (o que ele cobrou) e é preciso decidir qual vale para a franquia.
- **Recomendação:** não migrar tudo. Se o objetivo é **uma fatura só**, o caminho de menor risco é testar o **AI Gateway da Vercel num único comando** (a legenda). O OpenRouter só se justifica se o proprietário quiser especificamente o catálogo dele (Scribe v2 de transcrição e modelos de terceiros) e aceitar a taxa de 5,5%. Detalhes e o teste que falta na seção 7.

## 1. Como a UZZINA chama IA hoje (lido no código)

- [server/ai-generation.ts](../../server/ai-generation.ts): duas rotas. Modelos Claude vão por `@ai-sdk/anthropic` com `ANTHROPIC_API_KEY`; modelos GPT vão por `@ai-sdk/openai` com `OPENAI_API_KEY` e `baseURL` fixo da OpenAI. Os dois guardam o corpo bruto da resposta para tirar `usage`, `id`, `model` e `service_tier`.
- OpenAI usa saída estruturada (`jsonText`), nível de serviço `default` e cache de prompt de 30 minutos. Claude **não usa modo JSON**: o texto é limpo de cercas de código (`unfence`).
- [server/ai-model-catalog.ts](../../server/ai-model-catalog.ts): sete modelos (GPT-6 Luna, 6.1 Terra, 6.1 Sol, 6 Astra; Claude Haiku, Sonnet e Opus 5.5), cada um com tarifas por faixa de tamanho de entrada (curta/longa), leitura e gravação de cache e saída, mais a taxa de reserva da franquia.
- [server/ai-usage.ts](../../server/ai-usage.ts): o custo é calculado pelo **modelo que respondeu** (campo `model` da resposta); se faltar campo, o custo fica **pendente**. A reserva de franquia é feita antes da geração (`reserve_ai_monthly`) com as taxas do banco (`public.ai_models`).
- Contrato: [docs/contracts/ai-and-strategies.md](../contracts/ai-and-strategies.md). O estudo anterior de SDK/Gateway é [2026-11-05-ai-provider-sdk.md](2026-11-05-ai-provider-sdk.md).

## 2. Custo real (pergunta 1)

| Item                  | OpenRouter                                                                                         | AI Gateway (Vercel)                                                       | Direto (hoje)                              |
| --------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------ |
| Margem sobre tokens   | Nenhuma declarada (repasse do preço do provedor)                                                   | Zero, inclusive com chave própria (docs Vercel, plano pago)               | Nenhuma                                    |
| Taxa ao colocar saldo | 5,5% com mínimo de US$ 0,80 (Business 8%, cripto 5%), segundo resumos de terceiros que citam o FAQ | Não confirmada; terceiros divergem (de "sem taxa" a ~3% de processamento) | Nenhuma, mas cada provedor cobra no cartão |
| Câmbio/IOF Brasil     | Pagamento internacional: IOF de 3,5% e a política do emissor do cartão                             | Cobrança dentro da fatura Vercel: depende de como a conta é paga hoje     | Igual ao OpenRouter, em duas faturas       |
| Validade do saldo     | Termos reservam direito de expirar créditos em 365 dias (fonte de terceiros)                       | Não verificado                                                            | Depende de cada provedor                   |
| Chave própria (BYOK)  | Existe; franquia grátis divergente entre fontes (US$ 25 mil/mês ou 1 milhão de pedidos), depois 5% | Existe no plano pago, sem margem                                          | —                                          |

**Comparação com o gasto real dos últimos meses: não feita.** Não tenho acesso às faturas da OpenAI e da Anthropic. A UZZINA guarda `cost_nanos` por chamada em `ai_usage`; o proprietário (ou um ticket de leitura do banco, só consulta) pode somar os últimos meses para aplicar os 5,5%. Regra prática: com gasto mensal baixo, a taxa mínima de US$ 0,80 domina; carregar saldo em poucas compras maiores reduz o efeito.

## 3. Franquia e registro de custo (pergunta 2)

Hoje: tarifa oficial no servidor e no banco → custo calculado por chamada → franquia. Com intermediário há três desenhos:

1. **Manter o cálculo próprio** (tarifa oficial × tokens) e tratar a taxa de compra como custo à parte. Menor mudança; o número da UZZINA ficaria abaixo do que realmente se paga (falta a taxa). Serve se a taxa for tratada como despesa de administração.
2. **Usar o custo que o intermediário informa por chamada.** O OpenRouter devolve o valor cobrado na resposta e em `GET /api/v1/generation?id=…`; o campo de custo do provedor de origem só aparece em chamadas com chave própria (documentação do OpenRouter; nomes exatos dos campos não conferidos na página oficial). Exige mudar `recordAIUsage` e a regra de "custo pendente" para um valor vindo de fora.
3. **Os dois com conciliação** (o mais seguro, e o que o estudo de 05/11 já sugeria para o Gateway): guardar `cost_nanos` calculado e `cost_reported_nanos` informado, e alarmar divergência acima de um limite.

O que teria de mudar em qualquer um dos caminhos com intermediário: `generateAI` (cliente e `baseURL`), `anthropicUsage`/leitura de `usage` (o formato de uso muda), o identificador do modelo (prefixo `openai/…`, `anthropic/…`), `ai_models` (coluna do identificador externo), as tarifas (o preço no intermediário pode diferir por provedor de origem), `reserve_ai_monthly` (sem mudança se a reserva continuar usando taxas próprias) e o teste de alinhamento do catálogo.

## 4. Compatibilidade (pergunta 3)

- **Cache de prompt:** o OpenRouter documenta cache para Claude por marcadores `cache_control` por bloco (até 4) e também automático, este só quando a rota é direto na Anthropic. A UZZINA hoje depende do cache automático da OpenAI (30 min) e do cache da Anthropic; o relato de que marcadores se perdem na conversão para o formato OpenAI-compatível (issue de terceiros, não documentação) pede **teste real** antes de confiar na economia de cache.
- **Saída estruturada:** os três comandos JSON usam `jsonText`/JSON mode no GPT; para Claude já é texto sem modo JSON. A documentação do OpenRouter cobre estrutura no endpoint Messages; **não achei confirmação de `response_format` com `json_schema` repassado a Claude** pelo caminho de chat. Como Claude já roda sem JSON mode aqui, o risco real está nos modelos GPT passando pelo intermediário (precisa de teste).
- **Raciocínio e nível de serviço:** `serviceTier: default` e a leitura de `service_tier` para precificar não têm garantia de atravessar um intermediário; o Gateway/OpenRouter podem escolher outro provedor de origem (Bedrock, Vertex, Azure) com tarifa e retenção diferentes.
- **Os sete modelos existem lá com os mesmos nomes?** **Não verificado.** Os modelos são da família 5.5/6.x e minha busca não retornou as páginas de catálogo do OpenRouter para eles. A UZZINA falha de forma segura quando o modelo não existe (`AI_MODEL_UNAVAILABLE`), mas é uma checagem obrigatória antes de qualquer teste.

## 5. Arquivos e transcrição (pergunta 4)

- O OpenRouter tem endpoint próprio de transcrição (`/api/v1/audio/transcriptions`). Segundo a documentação, ele recebe **o áudio em base64 no corpo**, não um endereço. Isso muda o desenho do IA-M08: o servidor da UZZINA teria de **baixar o arquivo do Cloudinary e reenviá-lo embutido**. O limite de 4,5 MB da Vercel vale para o corpo que _chega_ na função, então o upload do navegador não passa por ela; o reenvio é de saída, mas passa a depender de memória, tempo máximo da função e do tamanho aceito pelo OpenRouter, **que não encontrei documentado** (nem a duração máxima por arquivo).
- Cobrança: Whisper por tempo de áudio; modelos novos por token; GPT Transcribe listado a ~US$ 0,0045/min. Preços de mirrors divergem entre si; só vale o que estiver em openrouter.ai e na API de modelos (`output_modalities=transcription`).
- Imagem e PDF: o IA-M08 já recomenda Claude Haiku e GPT-6 Luna pelos provedores atuais por endereço de arquivo. Isso **não depende do OpenRouter**.
- ElevenLabs Scribe v2 "sem conta nova" é a única vantagem concreta de transcrição que só o OpenRouter oferece. Disponibilidade e preço atuais **não confirmados** nesta pesquisa.

## 6. Confiabilidade e dados (pergunta 5)

- **Roteamento e queda:** OpenRouter e Gateway oferecem fallback entre provedores de origem. Histórico de indisponibilidade **não foi pesquisado em fonte primária** (página de status); fica como item do teste.
- **Dados dos clientes da agência:** o OpenRouter diz que **não guarda prompts a menos que o usuário ative o registro**; o filtro ZDR (zero retenção) restringe o roteamento a provedores que não guardam dados, mas não vale para plugins/ferramentas opcionais como busca na web, e o OpenRouter **não verifica o contrato do provedor de origem** (o acordo de processamento de dados diz isso). Hoje a UZZINA tem relação direta com dois provedores; com intermediário passa a ter um terceiro na cadeia (e o provedor de origem pode mudar por rota). Para conteúdo de clientes, ligar ZDR por requisição seria obrigatório.
- **Limites de uso:** não levantei os limites por conta do OpenRouter/Gateway.

## 7. Comparação lado a lado (pergunta 6)

| Critério                                   | OpenRouter                                               | AI Gateway Vercel                                                  | Direto com cada empresa          |
| ------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------- |
| Faturas                                    | 1 (mais as do Cloudinary/Supabase/Vercel)                | 1, dentro da Vercel que já existe                                  | 2 (3 se entrar Google)           |
| Taxa extra provável                        | 5,5% (mín. US$ 0,80) nas compras de crédito              | A confirmar; margem zero declarada                                 | Nenhuma                          |
| Transcrição de áudio no mesmo lugar        | Sim (catálogo próprio, base64)                           | Não confirmei                                                      | GPT Transcribe pela chave OpenAI |
| Modelos de terceiros (Google, ElevenLabs…) | Sim                                                      | Sim (catálogo próprio)                                             | Conta nova por empresa           |
| Custo por chamada informado                | Sim                                                      | Sim (ID da geração e REST)                                         | Calculado por nós                |
| Mudança no código                          | Média: cliente, ID de modelo, uso, custo, catálogo       | Média/baixa: já existe cliente OpenAI-compatível e estudo de 05/11 | Nenhuma                          |
| Dado do cliente                            | Terceiro na cadeia; ZDR por requisição                   | Terceiro na cadeia (a mesma Vercel); retenção a confirmar          | Dois contratos diretos           |
| Risco                                      | Médio (taxa, rota variável, compatibilidade não testada) | Baixo/médio (compatibilidade não testada)                          | Baixo                            |
| Voltar atrás                               | Barato se migrado por comando (interruptor por modelo)   | Barato (idem)                                                      | —                                |

**Caminho de volta (pergunta 7):** como `generateAI` já escolhe a rota pelo provedor do modelo, dá para migrar **um comando de cada vez**: um modelo ou comando passa pela nova rota e os demais continuam diretos. Reverter é trocar a rota daquele modelo e manter a coluna nova do banco sem uso. O que não volta é o saldo já carregado (e a taxa paga).

## 8. Recomendação

1. **Hoje, nada a migrar.** A UZZINA funciona com duas faturas e o custo é exato por modelo. Uma terceira conta (Google) não está decidida.
2. **Se a dor é "faturas demais":** testar o **AI Gateway da Vercel** num comando de baixo risco (legenda, que usa menos contexto), com chamada controlada, comparando modelo real, tokens, cache, custo informado × calculado e ID. Isso reaproveita a conta Vercel e o estudo de 05/11.
3. **Se o interesse é transcrição de áudio de melhor qualidade** (Scribe v2): primeiro começar o IA-M08 com GPT Transcribe pela chave atual, e só então comparar com o OpenRouter num teste com 3 áudios reais. Não é razão suficiente, sozinha, para migrar todos os comandos.
4. **Antes de qualquer teste real:** (a) conferir que os sete modelos existem no intermediário; (b) conferir a taxa de crédito do Gateway; (c) ligar retenção zero; (d) somar o gasto real dos últimos meses a partir de `ai_usage`. Teste com chamada real exige autorização do proprietário.

## 9. Fontes e o que foi conferido

Lido no código: arquivos da seção 1. Pesquisa de 12/11/2026 (várias fontes são resumos de terceiros e foram marcadas):

- OpenRouter: [FAQ](https://openrouter.ai/docs/faq.mdx), [transcrição](https://openrouter.ai/docs/guides/overview/multimodal/stt), [cache de prompt](https://openrouter.ai/docs/guides/features/prompt-caching), [contabilidade de uso](https://openrouter.ai/docs/guides/administration/usage-accounting), [retenção zero](https://openrouter.ai/docs/features/zdr), [acordo de dados](https://openrouter.ai/assets/data-processing-agreement.pdf).
- Taxas (terceiros): [resumo do FAQ](https://dupple.com/learn/openrouter-pricing), [guia](https://amnic.com/blogs/openrouter-pricing).
- Vercel: [uso e preços do AI Gateway](https://vercel.com/docs/ai-gateway/usage-and-pricing), [FAQ](https://vercel.com/docs/ai-gateway/faq).
- IOF em operações internacionais (terceiros): [PagBrasil](https://www.pagbrasil.com/blog/pix/understanding-iof-tax-on-financial-operations-on-international-pix-payments/).

**Não testado:** nenhuma chamada real; página oficial de preços do OpenRouter não lida integralmente (taxas vieram de resumos); nomes dos sete modelos no OpenRouter/Gateway; limites de tamanho e duração do áudio; histórico de quedas; limites de uso; custo real dos últimos meses.
