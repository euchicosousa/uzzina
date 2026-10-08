# Consumo de IA por agência — especificação futura

Data: 07/10/2026. Estado: backlog, sem autorização de implementação nesta rodada.

Este documento registra a direção de produto definida pelo proprietário. Não executar suas etapas junto à correção atual da IA. Não alterar código, variáveis de ambiente, migrations ou permissões com base apenas neste documento.

## 1. Objetivo e decisões

Medir o uso de IA com modelos diferentes e apresentar quanto da referência interna da agência foi utilizado. O usuário deve entender “já usamos 25%”, sem receber o valor gasto na API da OpenAI.

Decisões confirmadas:

- Manter `ai_usage`; não excluir a tabela existente.
- Preparar suporte a múltiplos modelos, com preços de tokens de entrada e saída.
- Usar os preços internamente para ponderar o consumo: modelos diferentes não devem consumir necessariamente a mesma quantidade de unidades.
- Mostrar consumo relativo, sem divulgar preços ou custos da API.
- Registrar a proposta para depois; não criar nem modificar cotas agora.

Direção recomendada: referência de consumo por **agência**, compartilhada pelos seus membros. O proprietário indicou preferência por esse escopo. Período mensal é uma proposta, ainda não uma decisão.

Luna e Sol são os nomes mencionados pelo proprietário. Não presumir que esses nomes sejam identificadores da API. Registrar separadamente nome de apresentação, provedor e identificador técnico efetivamente utilizado.

## 2. Experiência prevista

O administrador da agência poderá consultar, por exemplo:

> Uso de IA neste período: 25% da referência da agência.

Exibir período, percentual e indicação de atualização/incompletude quando necessária. Distribuição por função, modelo ou membro pode ser adicionada depois; não é requisito da primeira entrega.

O registro técnico de custos deve ficar restrito ao operador da plataforma com permissão específica. Ser administrador de uma agência não concede automaticamente acesso a preços ou gastos do provedor. Confirmar depois quem terá essa permissão e se colaboradores comuns também verão o percentual.

Ultrapassar 100% não implica bloqueio nesta proposta. A primeira versão é de acompanhamento. Qualquer limite obrigatório exige decisão separada do proprietário.

## 3. Como calcular

Cada geração recebe uma versão de preços válida no momento da chamada. Usar os dados de uso retornados pelo provedor, não estimativas baseadas no tamanho do texto exibido.

Quando as tarifas forem por milhão de tokens:

```
referência interna da chamada =
  (entrada sem cache × tarifa de entrada
   + entrada com cache × tarifa de cache
   + saída × tarifa de saída) / 1.000.000

unidades da chamada = referência interna × fator de conversão do período
percentual = unidades acumuladas / referência em unidades da agência × 100
```

Tokens de cache são uma parcela da entrada: subtraí-los da entrada total antes de calcular a parte sem cache. Se não houver tarifa diferenciada, aplicar a tarifa normal de entrada. Não somar novamente categorias de tokens que já estejam incluídas no total de saída, como raciocínio quando assim informado pelo provedor.

Exemplo fictício, sem preços reais: uma agência tem referência de 1.000 unidades; chamadas de dois modelos consumiram 30 e 70 unidades. Uso exibido: 10%.

O resultado financeiro interno é uma referência calculada, não uma certificação da fatura OpenAI. Guardar a versão de preços e de conversão usada: modificar tarifas futuras não pode recalcular silenciosamente o histórico. Fixar também a referência do período; mudanças durante o período precisam de regra explícita.

Modelo sem preço conhecido ou resposta sem dados de uso produz registro **incompleto**, nunca consumo zero presumido. Não inventar preços para Luna/Sol.

## 4. Dados necessários — desenho conceitual

Preparar somente os dados que sustentam o cálculo:

1. **Modelos e preços versionados:** provedor, identificador técnico, nome de apresentação, moeda, tarifas de entrada/saída/cache, unidade da tarifa e início de validade.
2. **Eventos de geração:** agência, usuário, finalidade, horário, modelo solicitado e modelo efetivamente retornado, identificador da chamada, uso de entrada/saída/cache, estado da geração, estado da medição e versão dos preços utilizada.
3. **Referência da agência por período:** início/fim, unidades disponíveis e versão do fator de conversão. O fator e valores financeiros são internos.

Nomes de tabelas e migrations serão definidos na implementação. Não criar uma arquitetura genérica de cobrança, planos ou assinaturas para atender este requisito.

`ai_usage` atualmente guarda tentativas por usuário/dia, com reserva antes da geração. Ela não fornece tokens, modelos, preços ou atribuição por agência. Preservá-la enquanto esse contrato existir; decidir depois se o acompanhamento exige um registro complementar. Não confundir tentativa, geração bem-sucedida e consumo faturável.

Não armazenar prompts, legendas ou outros conteúdos apenas para medir uso. A identidade e a agência devem ser verificadas pelo servidor, a partir da sessão e do vínculo autorizado; nunca aceitar o escopo enviado pelo navegador como prova de acesso.

## 5. Ordem de implementação futura

Antes de iniciar, ler `docs/audits/CURRENT.md`, este documento e somente os arquivos do fluxo de IA necessário. Conferir o estado real do código; esta especificação não certifica a correção atual do Gemini.

1. **Resolver as decisões pendentes abaixo.** Não substituir respostas ausentes por novas regras de produto.
2. **Conferir agência e associação dos membros.** O acompanhamento por agência depende desse vínculo autorizado no servidor. Se ainda não existir, tratá-lo como dependência; não improvisar um identificador fixo ou confiar no navegador.
3. **Registrar uso retornado pela API.** Começar por observação, sem bloquear geração. Diferenciar sucesso, falha e medição incompleta; evitar duplicação pelo identificador da chamada.
4. **Cadastrar modelos e versões dos preços.** Restringir leitura e escrita ao operador autorizado. Usar o modelo retornado pelo provedor para a tarifação quando diferente do solicitado.
5. **Calcular o agregado por agência/período.** Expor ao aplicativo somente os campos autorizados, como período, percentual e estado da medição.
6. **Adicionar a visualização simples.** Usar o Prism existente, com estados de carregamento, vazio, erro e medição incompleta. Não criar novo painel de métricas completo.
7. **Entregar evidências e limitações.** Informar arquivos alterados, migrations exigidas, testes executados e o que ainda precisa ser conferido no navegador/provedor real.

Falha do registro de acompanhamento não deve transformar uma geração válida em erro. Registrar a falha de forma observável e permitir reconciliação quando possível. Isso é uma regra para o futuro acompanhamento; não autoriza remover agora a proteção ou o comportamento de quota existente.

## 6. Critérios de aceitação e testes futuros

Na implementação, escrever primeiro testes de comportamento para o cálculo e os contratos alterados. Não criar testes agora apenas por existir esta especificação.

### Verificação por código

- Dois modelos com tarifas diferentes consomem unidades proporcionalmente; entrada com cache não é contada duas vezes.
- Alterar preços preserva o cálculo das chamadas anteriores.
- Receber/processar novamente a mesma chamada não duplica consumo. Uma nova chamada ao provedor em um retry é registrada separadamente.
- Uma resposta com uso é contabilizada mesmo se o aplicativo depois rejeitar seu conteúdo. Timeout sem uso confirmado permanece incompleto.
- Falha de acompanhamento não elimina texto gerado válido; a incompletude pode ser identificada e reconciliada.
- A mesma pessoa em duas agências tem consumo corretamente atribuído e isolado. Consultas de outra agência são recusadas no servidor.
- Fronteiras do período usam o fuso e as regras escolhidas, com teste imediatamente antes/depois da renovação.
- Respostas disponíveis à agência não contêm preço, custo, fator financeiro, credenciais ou registros de outras agências. Ocultar valores somente na interface não atende ao requisito.
- Uso superior a 100% continua visível sem bloquear geração na versão de acompanhamento.

### Verificação real, separada das simulações

- **API/provedor real:** executar chamadas pequenas com modelos habilitados; conferir modelo retornado, uso registrado e ausência de duplicação. Exige configuração válida e autorização para o gasto dessas chamadas.
- **Banco real de teste:** conferir permissões com identidades de agências diferentes. Testes com respostas simuladas não certificam isolamento do banco.
- **Navegador:** gerar conteúdo, atualizar a visualização, trocar agência, testar erro de carregamento e conferir desktop/mobile. O usuário nunca vê valores financeiros, inclusive nas respostas de rede disponíveis à sua sessão.

Relatar cada camada separadamente. “Testes passaram” não significa que provedor, banco e navegador reais foram verificados.

## 7. Decisões pendentes para iniciar

- Confirmar escopo por agência, período e fuso da renovação.
- Definir referência em unidades e fator interno de conversão; nenhum valor foi definido nesta conversa.
- Definir quem vê o percentual e quem administra preços.
- Definir comportamento ao trocar referência no meio do período.
- Confirmar modelos e identificadores efetivamente habilitados na API.
- Definir se algum bloqueio será desejado posteriormente. Padrão desta proposta: acompanhamento sem bloqueio.

## Referências técnicas

- [OpenAI — resposta de Chat Completions e dados de uso](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create).
- [OpenAI — uso da organização](https://developers.openai.com/api/reference/resources/admin/subresources/organization/subresources/usage). Agregados do provedor podem ajudar na conferência, mas não substituem a atribuição de cada chamada à agência no UZZINA.

Conferir o contrato do endpoint realmente usado e as tarifas oficiais na data da implementação. Não copiar preços atuais para este documento de planejamento.
