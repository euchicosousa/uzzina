# Diagnóstico: legenda do hospital cita a Agência CNVT

Data: 29/10/2026. Escopo autorizado: investigação para discussão e posterior ticket. Sem correção ou criação de ticket nesta rodada.

## Evidência do proprietário

Captura `Captura de Tela 2026-10-29 às 16.17.41.png`: cabeçalho/avatar e rodapé da legenda identificam Hospital Dr. Thomaz Corrêa; o corpo contém “A Agência CNVT reconhece e agradece a todos os ginecologistas”.

Sequência esclarecida pelo proprietário: duplicou a ação da agência, alterou o parceiro para hospital e salvou na semana anterior; somente hoje gerou a legenda. Portanto, o relato envolve uma geração posterior à troca salva, não apenas a exibição imediata de uma legenda copiada. A captura não revela título, descrições, contexto cadastrado, payload nem resposta original do provedor.

## Achado principal confirmado

Em `api/ai.ts`, ramo `ai-caption`, a mensagem de sistema fixa a identidade: “Você escreve legendas para a Agência CNVT.” A mensagem seguinte contém o contexto recebido do parceiro. Logo, mesmo com contexto exclusivamente hospitalar, o servidor inclui a agência no pedido ao modelo. A duplicação não é necessária para esse conflito de identidade.

Probe executado contra o handler real, com autenticação, quota e OpenAI simulados na fronteira externa: pedido com contexto do Hospital Dr. Thomaz Corrêa, título Dia do Ginecologista e direção sem referência à agência. Status 200; contexto hospitalar presente no pedido capturado; a asserção de ausência de Agência CNVT falhou duas vezes. Resultado: 0 pass / 1 fail esperado, três asserções. Isso comprova a instrução indevida no pedido; não reproduz a frase exata gerada por um modelo real e não prova sozinho a causalidade da resposta histórica.

Comando usado: `bun test tests/caption-diagnostic-temporary.test.ts -t 'diagnostic: hospital'`. O probe foi derivado do harness de `tests/ai.test.ts`, apenas capturando o argumento de `chat.completions.create` e acrescentando o cenário acima. Arquivo temporário removido após o ensaio. Uma tentativa inicial fora do checkout não interceptou o SDK de Supabase por resolução de módulos e retornou 401 no host fictício fake.test; não foi contada como reprodução. A execução no checkout usou mocks corretamente e nenhuma chamada real ao banco/provedor.

## Outros caminhos verificados

1. **Parceiro desatualizado no hook:** não reproduzido no cenário controlado. `ActionFormDrawer` deriva `currentPartners` de `RawAction.partners`; `useActionAI` usa o contexto do primeiro parceiro atual. Probe real do hook montou agência, trocou via rerender para hospital e gerou legenda: contexto hospitalar enviado e rodapé HTC persistido. Resultado: 3 pass / 0 fail, incluindo os dois testes existentes. Comando: `bun test tests/caption-hook-diagnostic-temporary.test.tsx`; arquivo temporário removido. Não certifica dados persistidos dessa ação nem todos os cenários concorrentes.
2. **Material herdado da ação original:** `duplicateActionClient` em `app/lib/supabase.mutations.ts` copia todos os campos, exceto ID/timestamps, e acrescenta “(Cópia)” ao título. Preserva descrição, descrição de conteúdo, estratégias e legenda. Trocar parceiro em `ActionFormFooter` envia parceiros/cor e preserva os textos. `useActionAI` inclui as duas descrições no pedido da legenda; o probe confirmou que uma descrição fictícia citando a agência continua sendo enviada depois da troca para hospital. É um segundo caminho possível de influência, sem confirmação de que as descrições reais dessa ação contêm a agência. A legenda anterior e as estratégias não são enviadas diretamente pelo ramo `ai-caption`.
3. **Rodapé correto:** `useActionAI` concatena a resposta do modelo com `instagram_caption_tail` do parceiro atual. O modelo produz o corpo; o frontend acrescenta o rodapé. Assim, o rodapé HTC não garante identidade correta no corpo. `InstagramTab` exibe o texto armazenado e só usa o rodapé como fallback quando a legenda está vazia.

## Alcance e direção para discussão posterior

O problema confirmado é de identidade editorial na geração, potencialmente presente em qualquer parceiro, inclusive ações não duplicadas. Outros prompts da mesma API também apresentam o papel como ligado à Agência CNVT (`ai-strategy`, `ai-content`, `ai-hooks`); isso merece revisão dirigida no futuro, sem afirmar que todos produzem a mesma falha.

Para o futuro ticket, a geração deve distinguir a agência que opera o sistema da marca que assina o conteúdo, usar a identidade atual do parceiro explicitamente e impedir que instruções fixas atribuam a autoria à CNVT. Atualmente o hook envia contexto/categoria, sem campos explícitos de nome/slug do parceiro nem `voice` separado; o nome só chega se estiver no próprio contexto ou nos textos. A decisão sobre o que fazer com material herdado ao trocar parceiro precisa preservar edição manual: não se recomenda apagar ou substituir texto silenciosamente nem fazer simples substituição de nomes na resposta. Menções legítimas à agência, quando solicitadas, precisam continuar possíveis.

Futuras regressões pertinentes: pedido hospitalar sem marca alheia imposta pelo sistema; geração após troca salva/reabertura; descrições herdadas com marca anterior; ação nova sem duplicação; agência como parceiro legítimo; rodapé correspondente ao mesmo parceiro. Regressão de prompt é determinística; qualidade da saída exige avaliação editorial própria.

## Verificação e limites

- `bun test tests/ai.test.ts`: 45 pass, 0 fail.
- `bun test tests/action-ai.test.tsx`: 2 pass, 0 fail.
- Probe de identidade do handler: falha esperada reproduzida duas vezes.
- Probe adicional do hook: passa, contexto/rodapé atual e descrição herdada confirmados.
- Não houve geração paga, escrita/leitura dos dados reais da ação, SQL, build, commit, push ou deploy. Não foi inspecionado o bundle publicado nem a requisição histórica.
- Testes existentes não cobrem a identidade imposta pelo prompt; passarem não contradiz o achado.
- Somente este relatório e uma entrada em CURRENT foram adicionados nesta rodada; alterações externas preexistentes foram preservadas. Referências locais e diff documental conferidos. Format/lint/typecheck/build não se aplicam à alteração final exclusivamente documental.

## Complemento: verificação dos quatro comandos e esclarecimento do proprietário

O proprietário conferiu os insumos e informou que nenhum texto mencionava a agência; o contexto era breve, apenas sobre o hospital ter mais de 70 anos. Essa confirmação substitui a hipótese de textos herdados como explicação deste caso. A preservação de descrições na duplicação continua sendo comportamento técnico observado, mas não é evidência de contaminação neste incidente.

Verificação dirigida de todos os quatro intents aceitos por `app/lib/ai-contract.ts`:

| Comando | Referência fixa na mensagem de sistema | Local |
| --- | --- | --- |
| Estratégias (`ai-strategy`) | “Você é o Estrategista de Conteúdo da Agência CNVT.” | `api/ai.ts:193` |
| Conteúdo (`ai-content`) | “Você é o Redator-Chefe e Especialista de Conteúdo da Agência CNVT.” | `api/ai.ts:244` |
| Aberturas (`ai-hooks`) | “Você cria hooks para a Agência CNVT.” | `api/ai.ts:341` |
| Legenda (`ai-caption`) | “Você escreve legendas para a Agência CNVT.” | `api/ai.ts:369` |

Ensaio no handler real, usando o harness existente de autenticação/quota/provedor simulados: os quatro comandos receberam título e descrição sem agência, com `partner_context` igual a “O hospital tem mais de 70 anos.”. Capturado o pedido na fronteira OpenAI: em todos, contexto hospitalar e referência fixa a Agência CNVT coexistem, com status 200. Comando `bun test tests/caption-identity-verification-temporary.test.ts -t 'diagnostic: fixed agency'`: **4 pass, 0 fail, 20 asserções**. O ensaio confirma presença indevida, por isso aqui passar é evidência do problema, não de correção. Arquivo temporário removido. Uma primeira versão do probe usou matcher composto que alterou a referência capturada no Bun e falhou na asserção seguinte; a versão válida serializou antes das asserções, sem mudar código do aplicativo.

O fluxo ativo da gaveta tem uma chamada central a `callAI` em `useActionAI`. Ele envia contexto livre do parceiro e categoria, sem acrescentar nome/título/slug do parceiro como identidade explícita. `callAI` valida e encaminha o payload para `/api/ai`; o handler não busca o cadastro do parceiro para completar essa identidade. Assim, um contexto como “mais de 70 anos” não fornece por si só o nome Hospital Dr. Thomaz Corrêa. Já a identidade CNVT é incluída independentemente do parceiro, diretamente nos comandos do servidor.

Conclusão atualizada: a referência à agência nasce comprovadamente dos prompts do sistema, sem precisar de texto herdado, vínculo comercial ou duplicação. É a explicação mais forte para o relato; atribuir a frase exata historicamente ao modelo ainda exigiria a requisição/resposta daquela geração. O alcance do futuro ticket deve considerar a definição de identidade nos quatro comandos, sem presumir que os quatro já produziram o mesmo erro editorial.

Somente documentação alterada; sem correção, ticket, geração paga, banco, build ou publicação. Referências e diff conferidos.
