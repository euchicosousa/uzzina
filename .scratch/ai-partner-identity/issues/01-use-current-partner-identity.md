# 01: Gerar conteúdo de IA com a identidade do parceiro atual

**What to build:** ao gerar estratégias, aberturas, conteúdo ou legenda de uma ação, usar explicitamente a marca do parceiro atual como autora do conteúdo. Um hospital continua falando como hospital, inclusive após duplicar uma ação da agência, trocar o parceiro, salvar e reabrir dias depois. A identidade da agência que opera a UZZINA não deve ser imposta como marca publicadora pelos comandos de IA.

**Blocked by:** None (can start immediately). Independente dos tickets de Safari, geração em segundo plano, Planejamento e uso de IA. Coordenar arquivos compartilhados com um executor por vez, sem criar dependência funcional artificial.

**Status:** ready-for-agent — owner authorized ticket creation 2026-10-29; implementation not started

## Origem e evidência

O proprietário duplicou uma ação da agência, trocou o parceiro para Hospital Dr. Thomaz Corrêa e salvou na semana anterior. Em29/10 gerou uma legenda que dizia “A Agência CNVT reconhece e agradece”, embora cabeçalho e rodapé identificassem o hospital. Conferiu os insumos: nada mencionava a agência; o contexto apenas informava que o hospital tinha mais de70 anos.

A investigação capturou os pedidos do handler real, com autenticação, quota e provedor simulados: os quatro comandos acrescentam Agência CNVT na mensagem de sistema mesmo com insumos exclusivamente hospitalares. O pedido não recebe o nome do parceiro explicitamente; depende do contexto livre. O rodapé é acrescentado separadamente pelo frontend, o que explica sua identidade correta sem garantir a do corpo gerado.

Confirmado: identidade fixa da agência entra nos quatro pedidos. Não confirmado: requisição/resposta histórica e causalidade exata da frase do print. Preservação de descrições na duplicação existe, mas o proprietário descartou menções herdadas neste incidente. A correção não depende de alterar o ato de duplicar.

## Critérios de aceite

- [ ] Estratégias, aberturas, conteúdo e legenda recebem explicitamente a identidade do parceiro atual, mesmo quando seu contexto é breve, vazio ou não contém o nome da marca. Nome e contexto são informações distintas; não exigir que o usuário repita o nome no campo de contexto.
- [ ] A mensagem de sistema dos quatro comandos define a marca do parceiro como autora e não impõe a CNVT como destinatária/autora de conteúdo de outras marcas. Remover a ambiguidade também nos papéis de estrategista e redator, preservando as orientações editoriais existentes.
- [ ] A identidade corresponde ao parceiro atual da ação, sem reutilizar o parceiro original da duplicação ou dados de outra ação aberta. Preservar a regra atual de primeiro parceiro para geração e rodapé quando houver múltiplos; não inventar nova seleção ou combinar marcas silenciosamente.
- [ ] Se a identidade do parceiro não puder ser resolvida, não assumir CNVT nem gerar como uma marca inventada. Apresentar falha acionável e preservar os textos existentes; não enviar uma geração sem identidade definida nem consumir quota nesse caso detectável antes do envio.
- [ ] O cenário original funciona: duplicar agência → trocar para hospital → salvar → fechar/reabrir → gerar legenda. O pedido identifica o hospital, não impõe a agência, e o resultado aplicado/persistido conserva o rodapé hospitalar existente.
- [ ] Uma ação nova do hospital, sem duplicação, usa a mesma identidade correta nos quatro comandos. As ações principal e secundária usam os próprios parceiros de forma independente.
- [ ] CNVT continua permitida quando ela própria é o parceiro da ação ou quando uma menção legítima for solicitada no briefing. Não implementar proibição genérica da palavra, substituição automática de nomes na saída ou limpeza de textos já salvos.
- [ ] Preservar título, descrições, estratégia selecionada, voz/contexto disponíveis, formato e direção de conversão do fluxo atual. Não apagar material herdado ao trocar parceiro, reescrever conteúdo manual silenciosamente ou refazer a arquitetura editorial.
- [ ] O contrato de entrada valida os campos necessários de identidade de ponta a ponta, com limites coerentes e rejeição de tipos inválidos. Preservar autenticação, membro ativo, quota persistente, contratos de saída e tratamento de falhas; identidade editorial enviada não concede acesso a dados nem autoriza mutações.
- [ ] A confirmação da geração continua aplicada e persistida pelo fluxo existente, preservando guardas de sessão e edição. Não incluir execução em segundo plano, nova política de concorrência de gerações ou novo cadastro de marca neste ticket.

## Execução e verificação

Uma entrega vertical: seleção atual do parceiro → identidade explícita no pedido validado → instruções coerentes ao provedor → resposta aplicada e salva na ação → testes. Eventual extração pequena para compartilhar a composição de identidade deve fazer parte desta entrega, sem refatoração ampla ou tickets separados por camada.

- [ ] Preparar regressão no código real antes da correção: com contexto “O hospital tem mais de70 anos.” e textos sem agência, capturar o pedido do provedor e exigir identidade hospitalar explícita e ausência de autoria CNVT imposta pelo sistema. Deve falhar no comportamento atual e passar nos quatro comandos após a correção.
- [ ] Testar seleção/troca de parceiro e reabertura com dados persistidos controlados, incluindo ação nova, duplicada, contexto vazio, múltiplos parceiros e CNVT como parceiro legítimo. Exercitar o fluxo real da gaveta; não copiar funções da implementação para o teste.
- [ ] Testar separação das ações principal/secundária, preservação do rodapé, aplicação/persistência da resposta e rejeição de identidade ausente/inválida sem sobrescrever texto. Controlar banco e provedor na fronteira externa, sem fixtures de escrita em produção.
- [ ] Separar evidência determinística do pedido de avaliação editorial da saída. Respostas simuladas não provam que um modelo real nunca mencionará marca alheia. Uma eventual geração real requer registro próprio de condições/resultado e não é necessária para testar a composição do prompt.
- [ ] Executar testes pertinentes, format, lint, typecheck, build e verificação de runtime serverless exigida para alterações de API/contrato. Sem CI, conferir o pacote serverless antes de eventual push; registrar separadamente código preparado, testes locais e publicação Ready.

## Limites

Não alterar schema, permissões, dados existentes, política de duplicação ou estratégia editorial por proximidade. Não depende de novo fluxo para preencher contexto, de revisão de qualidade de todos os prompts ou de novos controles na interface. Preparar o ticket não inicia implementação, commit, push ou deploy.
