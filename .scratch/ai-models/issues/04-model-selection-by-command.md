# IA-M04 — Escolher modelos por comando e salvar padrões pessoais

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Sol, para integrar dois provedores, seleção e padrões por comando.
- **Anthropic** — Claude Sonnet 5.5, para integrar dois provedores, seleção e padrões por comando.
- **Google** — Gemini 4 Argon, para integrar dois provedores, seleção e padrões por comando. Disponibilidade depende do plano do Antigravity.

**Entrega.** Seletor ao lado da ação de gerar. Demonstrar com um comando e ampliar para estratégias, conteúdo e legenda conforme a compatibilidade de cada modelo.

**Bloqueado por.** [IA-M01](01-model-catalog-selection-and-metering.md) para integração e [IA-M03](03-monthly-ai-allowance.md) para habilitar o seletor em produção. O redesenho de Minha Conta em IA-M02 é independente.

## Escolha, preferência e execução

- Grupo Prism com ação de gerar e controle separado para abrir o seletor. Usar gatilho compacto com símbolo do provedor e anel do nível editorial, com nome completo no tooltip e no rótulo acessível. Agrupar opções pelo provedor e mostrar os nomes completos e níveis no menu. Abrir o seletor não dispara geração. Avaliar foco, teclado, truncamento e alvos no celular.
- O anel segue a geometria do indicador de fase e usa cinco faixas editoriais cadastradas por modelo. A extensão de 20/40/60/80/100 corresponde aos cinco degraus visuais. A cor e o comprimento são redundantes. As faixas são escolhas do produto, separadas de preço e de avaliações de capacidade.
- Precedência proposta: escolha para esta geração, preferência pessoal do comando, padrão do sistema para o comando. Começar com Luna nos três padrões para continuidade e permitir configurar cada padrão separadamente. Preferência ausente, antiga ou indisponível usa o padrão válido e mostra qual será usado. Se o modelo escolhido falhar após o disparo, informar a falha e deixar uma nova escolha explícita.
- Guardar os padrões pessoais por comando nas preferências existentes da pessoa. Uma ação explícita de salvar como padrão distingue experimento pontual de preferência persistente. Validar a estrutura no servidor, preservar o merge dos demais campos e oferecer voltar ao padrão do sistema. Aproveitar a persistência autenticada do Supabase. Só ampliar seu contrato se o campo atual exigir.
- Validar a seleção no servidor e resolver o provedor e modelo efetivos antes de reservar quota. Usar OpenAI e Claude por seus contratos de API próprios, com adaptadores para manter a resposta já esperada pelo app. Na estratégia durável, congelar modelo e versão de tarifa na operação aceita. Uma retomada de salvamento conserva resultado e medição. Verificar IDs válidos, credenciais no servidor, erros por provedor e a mesma identidade editorial da marca.

## Aceite

- Validar acesso, formato e medição para cada combinação habilitada de modelo e comando. Exercitar os dois provedores antes de liberar suas opções.
- Conferir padrão inicial, troca pontual, padrões de duas pessoas, restauração e modelo desativado. Validar teclado e layout estreito.
- Conferir percentual e número de chamadas após trocar de modelo, inclusive com estratégia em andamento e retomada de salvamento.

## Primeiro recorte visual — 05/11/2026

[Protótipo do seletor](../prototype/model-picker.html) compara arco por nível e anel inteiro. Faixas propostas: azul 1 para Luna e Haiku, amarelo 2 para Terra, laranja 3 para Sol e Sonnet, vermelho 4 para Opus, roxo 5 para Astra. A classificação é revisável no catálogo. O símbolo do provedor e o anel são elementos separados. Os SVGs do protótipo vieram do pacote Lobe Icons 1.102.0. Conferir os arquivos oficiais e suas regras de uso antes de incorporar os símbolos ao produto. [OpenAI](https://openai.com/brand/) · [Anthropic](https://www.anthropic.com/legal)

Próximo recorte funcional: validar IDs, acesso, saída e medição de um Claude com legenda e integrar sua reserva mensal com a tarifa correspondente. Depois ligar o seletor à geração real de legenda, com Luna como padrão inicial. Opções do protótipo são referências visuais.

## Playground na galeria — 05/11/2026

A seção UAIModelSelect em /ui usa PrismButtonGroup, botão primário “Gerar legenda” e seletor pesquisável com PrismCommand. O painel lateral controla modelo, variante, estado desativado e texto da ação. O ícone tem dois símbolos monocromáticos (OpenAI e Claude), com preenchimento currentColor, e o arco mantém a cor e a extensão do nível. Modelos são dados de demonstração. Typecheck e diff passaram. Aceite visual e de teclado pelo proprietário pendente antes da integração na gaveta.

## Adaptador Claude para legenda — 06/11/2026

Preparado localmente, sem publicar nem aplicar SQL. O catálogo ganhou Haiku 5.5, Sonnet 5.5 e Opus 5.5 com tarifas padrão da documentação oficial lida em 06/11 (gravação de cache de 5 minutos; Haiku muda a chamada inteira acima de 100 mil tokens de entrada). `@ai-sdk/anthropic@4.0.97` foi adicionado. A API aceita `model` opcional, valida modelo e comando antes de reservar quota e recusa sem trocar de modelo; os Claude só atendem legenda. O uso da Anthropic é convertido para prompt total e gravado com provedor `anthropic`, ID da mensagem e tarifa por faixa; campo ausente deixa o custo pendente e resposta truncada continua contabilizada.

Acesso confirmado com a chave da agência: os três modelos aparecem na lista e responderam a uma chamada mínima (17 tokens de entrada, 4 de saída, sem cache, camada standard).

A reserva mensal era calculada por tarifa do Luna e subestimaria o Claude. A migration local `20261106120000_ai_model_aware_reservation.sql` torna `reserve_ai_monthly` ciente do modelo (padrão Luna, chamadas de 4 argumentos intactas). A API só envia `p_model` fora do padrão, então o deploy do código não depende dela.

Verificação: typecheck, 127 testes focados, nove verificações serverless e um ensaio com respostas HTTP controladas (custo de US$ 0,000505 confere à mão; cache ausente fica pendente; truncamento com custo; comando e modelo inválidos rejeitados). Não houve chamada paga nesta rodada.

Pendente: aprovação para aplicar a migration; chamada real de legenda por cada Claude com reserva e conciliação (exige `ANTHROPIC_API_KEY` na Vercel); amostras de saída e ajuste do teto de legenda por modelo; teste do SQL em PostgreSQL isolado; seletor ligado à geração; preferências por comando; estratégia durável com modelo congelado.

### Verificação isolada da migration — 06/11/2026

PostgreSQL nativo isolado confirmou a migration IA-M04: Luna com quatro argumentos, trigger de estratégias, valores de reserva dos três Claude, recusa de modelo inválido, permissão de reserva restrita ao servidor e disputa de saldo com duas conexões. Sem alteração de produção nesta conferência.

### Publicação do adaptador de legenda — 06/11/2026

Chave Anthropic confirmada pelo nome no ambiente Production. Com autorização, migration `ai_model_aware_reservation` aplicada como `20261106031549`. Catálogo confirmou argumento padrão e execução restrita ao servidor. Pacote isolado da publicação IA-M03 com delta de API IA-M04, incluindo retirada de hooks, passou no build, typecheck e nove verificações serverless. Deploy `dpl_CudSy81SynGE1ACxuai6Nb4rUVhx` Ready em `uzzina.cnvt.com.br`. Perfil HTTP 200, API e worker 405 em GET, operações 401 sem sessão. Pendente conciliar legenda real por modelo Claude pela API autenticada e ligar o seletor, preferências e estratégia durável.

### Seletor de legenda local — 06/11/2026

Ligado à aba Instagram → Legenda no checkout. Luna padrão inicial; escolha temporária por ação aberta e controles bloqueados enquanto a geração roda. Verificação de tipos e 15 testes do fluxo, incluindo encaminhamento de model. Aguardando uso autenticado dos três Claude para conciliar custo e reserva.

### Seleção nos três comandos preparada — 06/11/2026

Gaveta lista Luna, Haiku, Sonnet e Opus em legenda, conteúdo e criação/recriação de estratégias. A API de conteúdo usa o modelo enviado. Na estratégia durável, a aceitação persiste o modelo e reserva pelo mesmo modelo na transação, o retry de aceitação mantém a escolha original, e o worker usa o modelo retornado pela fila. O worker legado só pode obter trabalhos Luna. A tabela de tarifas continua no catálogo do servidor; snapshot de tarifa por operação e padrões pessoais permanecem pendentes.

PostgreSQL nativo isolado confirmou reserva pelo Opus, idempotência mesmo com reenvio de outro modelo, exclusão no worker legado e entrega do modelo correto no claim novo. Passaram 118 testes focados, typecheck e nove verificações serverless. Migration `20261106130000_strategy_model_selection.sql` e deploy da API/worker pendentes antes do teste autenticado dos três comandos.

### Publicação de conteúdo e estratégias por modelo — 06/11/2026

Migration `strategy_model_selection` aplicada com autorização como `20261106035709`. Aceitação e claim por modelo confirmados como funções restritas ao servidor. Pacote isolado do deploy anterior com delta da API/worker passou no build, typecheck e nove serverless. Deploy `dpl_F5u3NfEMsZQ2W5CsSAcYcXwTwmc9` Ready e promovido no domínio de produção. API/worker 405 em GET, operações 401 sem sessão. Worker atualizou heartbeat às 00h58min27s de Fortaleza e banco retornou ready=true. Seletor da gaveta segue no checkout local. Pendente repetir Sonnet pela sessão autenticada, conferir estado final e conciliar a reserva e o custo.

### Terra, Sol e Astra preparados — 06/11/2026

Os três modelos passaram na consulta autenticada de catálogo da OpenAI. Adicionados aos três comandos com tarifas Standard por faixa, gravação em cache de 30 minutos e reserva pelo teto da faixa superior. O ensaio PostgreSQL confirmou a aceitação e reserva do Astra e a exclusão pelo worker legado. Falta aplicar `20261106140000_openai_model_selection.sql`, publicar a API/worker e conciliar chamadas reais antes do aceite.

Em correção separada, Gerar conteúdo atualiza a versão do editor montado ao receber o HTML e mantém a geração ocupada até terminar a gravação. Regressão verificada em teste do fluxo de IA. Conferência visual no app local pendente.

### Publicação do catálogo OpenAI ampliado — 06/11/2026

Migration `openai_model_selection` aplicada como `20261106041724`. Reserva restrita ao servidor. Build isolado, typecheck e nove verificações serverless passaram. Deploy `dpl_55Gfq8H6ism92KJqCxgusxxMtvCP` Ready no domínio de produção. API/worker 405 em GET, operações 401 sem sessão e heartbeat às 01h18min29s em Fortaleza, com fila pronta. Seletor e atualização do editor seguem no app local. Pendente geração autenticada e conciliação por modelo.

### Padrões pessoais e modelo de escrita — 06/11/2026

Proprietário aprovou a UI. Há dois padrões pessoais em Minha Conta: Criar estratégia e Gerar legenda, com Luna como padrão inicial. Alterações na gaveta entram na persistência autenticada; alterações em Minha Conta seguem Salvar Alterações. Conteúdo herda o padrão de estratégia até receber uma escolha temporária para a ação aberta. O diálogo Usar esta estratégia e a subaba Conteúdo compartilham essa escolha.

Migration `20261106150000_ai_model_preferences.sql` preparada e testada em PostgreSQL nativo isolado com duas pessoas, validação de IDs e preservação dos demais campos. Typecheck e 52 testes focados passaram. Pendente aplicar a migration, conferir persistência autenticada e publicar a interface. A franquia visível indica conciliação de custo; o vínculo da versão de tarifa na aceitação da fila continua separado.

### Decisão final do proprietário sobre padrões pessoais — 06/11/2026

O proprietário aprovou o que já testou e pediu apenas o registro desta revisão. O backend e a reserva por modelo já estão publicados. A UI foi aprovada. O checkout tem os dois padrões descritos acima e uma escolha temporária de modelo de escrita. A migration desses dois padrões foi verificada em banco isolado e segue pendente de aplicação.

Para uma execução posterior:

- Oferecer em Minha Conta três padrões pessoais independentes: Criar estratégia, Gerar conteúdo e Gerar legenda. Cada um começa em Luna na ausência de uma escolha válida.
- Permitir trocar o modelo diretamente no seletor de cada comando. A escolha explícita passa a ser o padrão pessoal daquele comando para os usos seguintes e deve aparecer em Minha Conta. A escolha feita em Minha Conta também vale na gaveta.
- O seletor ao lado de Usar esta estratégia altera o padrão de Gerar conteúdo. Criar uma estratégia com um modelo deixa o padrão de conteúdo independente. Selecionar um modelo apenas configura o comando. A geração começa ao acionar seu botão.
- Verificar a persistência entre ações e sessões e a independência dos três campos.

A decisão substitui a proposta de Conteúdo herdar Estratégia. Nesta rodada, somente documentação foi alterada.

### Três padrões pessoais independentes — 06/11/2026

Implementado conforme a decisão final, só no checkout. Minha Conta oferece Criar estratégia, Gerar conteúdo e Gerar legenda, cada um iniciando em Luna. Trocar o modelo no seletor da gaveta de qualquer um dos três grava `defaultStrategyModel`, `defaultContentModel` ou `defaultCaptionModel` na persistência autenticada; o seletor ao lado de Usar esta estratégia altera só o padrão de conteúdo, e criar uma estratégia não mexe nele. A herança de Conteúdo a partir de Estratégia foi removida. A migration `20261106150000_ai_model_preferences.sql`, ainda não aplicada, passou a aceitar também `defaultContentModel`; o teste em PostgreSQL isolado dela precisa ser repetido com a terceira chave. Typecheck e 53 testes focados passaram. Pendente: aplicar a migration, publicar, conferir persistência entre ações e sessões e a independência dos três campos.

### Migração de preferências em produção — 06/11/2026

A migration local `20261106150000_ai_model_preferences.sql` já incluía Estratégia, Conteúdo e Legenda quando o proprietário autorizou a aplicação. Aplicada como `20261106044334_ai_model_preferences`. Confirmado em produção que a RPC aceita as três chaves sob papel autenticado, em transação revertida, e permanece indisponível para anon. Nenhuma preferência de teste ficou gravada. Esta rodada tratou somente do banco.

### Gerar conteúdo não seguia a nova estratégia — 06/11/2026

Relato do proprietário: com texto já no campo Conteúdo, tanto pelo diálogo quanto pela subaba, o resultado parecia não mudar; só funcionava depois de apagar o texto. A atualização do editor foi descartada como causa: um teste com a gaveta real mostra o editor trocando o texto antigo pelo novo. A causa provável é o prompt: `useActionAI` enviava o conteúdo atual como "DESCRIÇÃO DO CONTEÚDO" dentro do briefing, e o modelo o reproduzia. Gerar conteúdo agora envia só a descrição da ação; a legenda continua recebendo o conteúdo. Dois testes novos passaram. Falta confirmar com uma geração real em uma ação que já tem conteúdo. A suíte `drawer-component` tem 14 falhas de layout em painel estreito e foco, as mesmas sem esta mudança.
