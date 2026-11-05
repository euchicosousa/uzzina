# IA-M01 — Medir gerações com tokens reais e tarifas por modelo

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Sol, para conferir cálculo por categoria e conciliação com o uso reportado.
- **Anthropic** — Claude Sonnet 5.5, para conferir cálculo por categoria e conciliação com o uso reportado.
- **Google** — Gemini 4 Argon, para conferir cálculo por categoria e conciliação com o uso reportado. Disponibilidade depende do plano do Antigravity.

**Entrega.** Uma geração do Luna no fluxo atual registra os tokens reportados pela API, a tarifa vigente e o custo calculado. A equipe consegue conferir uma chamada de ponta a ponta antes de ampliar a cobertura.

**Bloqueado por.** Nenhum ticket. Reutilizar a medição do IA01 e validar os modelos antes de habilitá-los.

## Cadastro inicial de referência

Preços públicos em USD por milhão de tokens, consultados em 05/11/2026. A tabela usa processamento padrão e contexto na faixa base.

| Modelo | ID da API direta | Entrada | Saída |
|---|---|---:|---:|
| GPT-6 Luna | gpt-6-luna | 0,10 | 0,50 |
| GPT-6.1 Terra | gpt-6.1-terra | 1,00 | 5,00 |
| GPT-6.1 Sol | gpt-6.1-sol | 2,00 | 10,00 |
| GPT-6 Astra | gpt-6-astra | 10,00 | 50,00 |
| Claude Haiku 5.5 | claude-haiku-5-5 | 0,10 | 0,50 |
| Claude Sonnet 5.5 | claude-sonnet-5-5 | 2,00 | 10,00 |
| Claude Opus 5.5 | claude-opus-5-5 | 4,00 | 20,00 |

Haiku 5.5 usa US$ 0,50 de entrada e US$ 2,50 de saída quando o prompt ultrapassa 100 mil tokens. Cada provedor tem tarifas próprias de cache, contexto e modo de execução. Começar com Standard e limites de entrada dentro da faixa base, ou cadastrar e validar a faixa superior antes de aceitá-la. A disponibilidade no catálogo público precisa ser confirmada com a conta da agência antes de habilitar um modelo.

Fontes oficiais: [OpenAI modelos e preços base](https://developers.openai.com/api/docs/models), [OpenAI modos e cache](https://developers.openai.com/api/docs/pricing), [Anthropic catálogo e IDs](https://platform.claude.com/docs/en/models/overview), [Haiku 5.5 faixas e cache](https://platform.claude.com/docs/en/models/haiku-5-5/overview#pricing), [Sonnet 5.5](https://platform.claude.com/docs/en/models/sonnet-5-5/overview), [Opus 5.5](https://platform.claude.com/docs/en/models/opus-5-5/overview).

## Registro e aceite

- Manter o catálogo inicial TypeScript no servidor com nome, provedor, ID, capacidades, tarifas por categoria e faixa, fonte e vigência. Os valores do catálogo são tarifas publicadas. O uso vem do retorno de cada chamada.
- Calcular o custo em USD pela soma de tokens faturáveis por categoria × tarifa por milhão ÷ 1.000.000. Tratar separadamente entrada sem cache, leitura e gravação de cache quando aplicáveis. Raciocínio já incluído na saída não é somado duas vezes. Validar tarifas adicionais quando um comando usar ferramentas faturáveis.
- Persistir com precisão decimal adequada o uso reportado, o custo calculado, a versão da tarifa, o modelo, o comando e a identidade da chamada. Arredondar na apresentação após agregar. Uso ausente fica pendente de conciliação e nunca vira custo zero por padrão.
- Contar chamadas de geração distintas ao provedor uma vez por execução. Repetir apenas a gravação não duplica consumo. Nova chamada que efetivamente consome tokens entra no total, inclusive quando a resposta é incompleta.
- Preservar o histórico da política antiga. Só converter registros com modelo, tokens e tarifa recuperáveis. Validar uma geração do Luna de ponta a ponta e conferir cache, tarifa por faixa, uso incompleto e reprocessamento com dados controlados.


## Execução de 05/11/2026

Código e migration preparados. O catálogo executável começa pelo GPT-6 Luna, único modelo dos comandos atuais. A tabela acima continua como referência para os demais modelos. Standard usa US$ 0,10 por milhão de tokens de entrada sem cache, US$ 0,01 de leitura, US$ 0,125 de gravação e US$ 0,50 de saída. Acima de 272 mil tokens de entrada, o dobro das tarifas de entrada e cache e 1,5× da saída se aplicam à chamada inteira. A versão e as tarifas ficam gravadas com cada custo calculado. A geração fixa o modo Standard, preserva a quota técnica e mantém o histórico ponderado. [Ficha oficial do GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna) · [Uso em Chat Completions](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/retrieve)

Conferência controlada com testes do servidor e banco isolado. A migration preservou registros históricos existentes e os testes confirmaram precisão decimal, idempotência por chamada e custo pendente em uso incompleto. Falta aplicar a migration no ambiente autorizado, publicar API e worker e conferir uma geração do Luna por ID, tokens e tarifa. A validação real do provedor e a disponibilidade dos outros modelos na conta continuam pendentes.

## Próximo passo após o aceite da implementação local — 05/11/2026

A implementação local foi aceita. Hoje, a API e o worker usam o SDK oficial `openai@6.45.0` com Chat Completions e `OPENAI_API_KEY`. A integração direta atual cobre o Luna. Para o planejamento, interpretamos “cloud” como Claude e “OpenAI 2” como o pedido de uma biblioteca que atenda OpenAI e Anthropic.

**Direção escolhida.** Usar o AI SDK da Vercel (`ai`), com os adaptadores diretos `@ai-sdk/openai` e `@ai-sdk/anthropic`. Para a primeira migração, selecionar explicitamente Chat Completions no adaptador OpenAI, preservando o contrato usado pelo Luna. O AI Gateway é uma opção de roteamento separada. Ele aceita o SDK atual em uma URL compatível, mas seu uso para medição dependeria de confirmar os campos de uso, o modelo atendido e a conciliação de custo nessa rota. [Adaptador OpenAI](https://ai-sdk.dev/providers/ai-sdk-providers/openai) · [Adaptador Anthropic](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic) · [AI Gateway](https://vercel.com/docs/ai-gateway/sdks-and-apis)

1. Adaptar a chamada compartilhada no servidor com o Luna como único modelo habilitado. Conferir a paridade na API e no worker, incluindo saída estruturada, ID da resposta, tokens, cache, faixa e modalidade de tarifa. Se a biblioteca não expuser algum campo necessário no uso normalizado, verificar os metadados ou o retorno bruto. Manter custo pendente quando os dados forem insuficientes. Conferir também a política de retries para contabilizar cada chamada efetiva.
2. Após a paridade controlada, aplicar a migration no ambiente autorizado, publicar e conciliar uma geração real do Luna com o registro de uso e a tarifa. Esse é o aceite operacional do IA-M01.
3. Na preparação do IA-M04, confirmar acesso a Claude na conta da agência e validar um modelo por chamada controlada. Conferir leitura e gravação de cache, faixa e tarifa antes de liberar a seleção, que continua condicionada ao IA-M03.

Esta revisão atualiza o plano. A troca da biblioteca e as verificações com o provedor ficam para a próxima execução.

[Pesquisa de SDKs e opções de roteamento](../../../docs/audits/2026-11-05-ai-provider-sdk.md)
