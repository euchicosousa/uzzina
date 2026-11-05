# 01: Mostrar o uso de IA em Minha Conta

**What to build:** oferecer uma visualização pequena e discreta do uso de IA dentro de Minha Conta, para entender quanto da referência disponível foi utilizado no período. Registrar consumo real das gerações e apresentar o percentual autorizado, sem expor preços ou custos do provedor. Basear o desenho na especificação existente de consumo por agência, sem presumir que o contador técnico atual já mede esse consumo.

**Blocked by:** nenhuma dependência dos tickets de busca, datas comemorativas, Ajuda ou Notificações. Antes de implementar, resolver as definições de produto e verificar o vínculo autorizado de agência/membros descritos abaixo.

**Status:** Código corrigido e banco aplicado em 05/11/2026; aguarda publicação da API/worker e validação de nova geração real. Visual já aprovado.

## Owner decisions — 2026-11-01

- **Público autorizado:** Todos os membros internos ativos da agência em `public.people` visualizam o consumo da agência em Minha Conta.
- **Formato de exibição:** Percentual relativo de 0% a 100% com base em franquia mensal interna da agência (referência padrão: 1.000 unidades/mês), sem expor tarifas ou custos do fornecedor OpenAI.
- **Período e fuso:** Mês civil no fuso de Fortaleza (`America/Fortaleza`), exibido como ex.: "Novembro de 2026".
- **Localização:** Bloco compacto e somente de leitura ao final da coluna de Preferências em `/app/profile`, antes do `AppBarSpacer`. Preserva o formulário e salvamento do perfil.

## Context and scope

Solicitado inicialmente em27/10/2026 como registro de ideia; em28/10 o proprietário pediu criar este ticket para execução posterior. Não há autorização de implementação nesta rodada.

A direção documentada é acompanhar consumo relativo por agência, compartilhado pelos membros, com ponderação interna para múltiplos modelos. A primeira entrega deve ser pequena: período, percentual utilizado e indicação de atualização ou medição incompleta. Detalhamento por usuário, função ou modelo pode ficar para depois. Acompanhar uso não significa criar cobrança, assinatura ou novo bloqueio de geração.

O registro técnico atual contabiliza tentativas por usuário/dia e sustenta a reserva de quota antes da geração. Não fornece sozinho tokens, preços, modelos e atribuição por agência. Preservar esse contrato e não converter tentativas em percentual de consumo sem uma definição explícita.

## Definitions required before implementation

- Confirmar escopo por agência, vínculo autorizado dos membros e quem pode visualizar o uso.
- Definir período e fuso de renovação; período mensal ainda é proposta.
- Definir referência em unidades, fator interno de conversão e regra para mudanças durante o período; nenhum valor foi escolhido.
- Confirmar provedor, modelos e identificadores técnicos realmente habilitados; nomes de apresentação não são automaticamente identificadores da API.
- Definir quem administra preços internos e suas versões. Administrador da agência não recebe automaticamente acesso aos custos do provedor.
- Localização decidida: Minha Conta. Definir somente o posicionamento interno mais simples e a apresentação mínima, sem nova página ou painel extenso.

## Owner decisions — 2026-10-29

- Exibir dentro de Minha Conta, de forma discreta; não destacar em navegação global, cabeçalho ou página independente. A baixa frequência de uso da IA não justifica superfície de destaque.
- Minha Conta é apenas o local de consulta: isso não altera automaticamente o escopo de agência para consumo individual nem define quem pode ler os dados.
- Preparar o ticket para execução em outro chat; não iniciar implementação, novas chamadas de IA ou SQL nesta rodada.
- Reutilizar este ticket existente. Uma única entrega vertical é suficiente: geração medida → registro autorizado → agregado → informação em Minha Conta → testes. Não separar banco, API e interface em tickets horizontais nem criar duplicata.

## Standalone handoff

O tracker local existente é o destino autorizado. Ticket independente de Planejamento de redes sociais, sem outro ticket bloqueador. Antes de implementar, resolver as definições de produto listadas acima, incluindo vínculo real da agência: o app não pode presumir que partner ou client representa agência. Se o vínculo necessário não existir, registrar a dependência concreta e propor o menor ajuste antes de criar infraestrutura nova. Não usar uma agência fixa nem confiar no navegador para atribuição.

A primeira entrega cobre os fluxos de geração já existentes e modelos efetivamente habilitados, medindo os dados retornados pelo provedor; não inclui seletor de modelos ou expansão de IA. Nenhuma tarifa, referência ou percentual é inventado para preencher as decisões ausentes. Confirmar contratos e tarifas oficiais somente na implementação.

## Acceptance criteria

- [ ] Resolver e registrar as definições acima com o proprietário antes de criar schema, métricas ou interface; não inventar regras para preencher lacunas.
- [ ] Entregar um fluxo completo de medição até a visualização: dados reais retornados pelo provedor, atribuição autorizada, agregado por período e apresentação do uso.
- [ ] Mostrar período, percentual e estado de atualização/incompletude; distinguir carregamento, nenhum uso registrado, erro e medição incompleta. Não mostrar ausência de dados como consumo zero conhecido.
- [ ] Preservar o contador técnico e a reserva de quota atuais. Diferenciar tentativa, geração bem-sucedida e consumo medido; não alterar limites nem adicionar bloqueio ao atingir100% sem decisão separada.
- [ ] Medir tokens de entrada/saída/cache conforme o contrato do endpoint efetivamente usado, sem estimar pelo texto exibido, duplicar categorias de tokens ou contar a mesma chamada novamente em retries.
- [ ] Versionar preços e conversão internamente, sem recalcular silenciosamente o histórico; modelo sem preço ou resposta sem uso fica com medição incompleta, nunca zero presumido. Conferir tarifas oficiais somente quando implementar.
- [ ] Expor à sessão do aplicativo somente os campos autorizados. Preços, fatores financeiros e custos do provedor não aparecem na tela nem nas respostas de rede disponíveis ao usuário.
- [ ] Validar identidade, agência e permissões no servidor/banco, sem confiar no escopo enviado pelo navegador; preservar isolamento de sessão/cache. Não armazenar prompts/conteúdo apenas para medir uso.
- [ ] Falha no acompanhamento não transforma geração válida em erro; permitir observação/reconciliação sem enfraquecer a reserva técnica de quota existente.
- [ ] Exibir um bloco compacto e somente de leitura em Minha Conta, usando Prism/temas existentes, sem destaque no cabeçalho/AppBar/busca e sem criar página de métricas. Conferir desktop/mobile, foco e estados da visualização.
- [ ] Preservar o formulário único de Minha Conta, botão Salvar Alterações, rascunhos de preferências, troca de seções no celular, rolagens e AppBarSpacer. Consultar uso não submete formulário, altera preferências ou depende de salvar o perfil.
- [ ] Buscar somente quando Minha Conta e a identidade autorizada precisarem dos dados; models/serviço próprios, chaves de cache com identidade/audiência e descarte de respostas antigas após reset de sessão. Não acessar tabelas diretamente pela rota.
- [ ] Testar implementação real de registro/cálculo/agregação/consulta, duplicidade, falha, dados incompletos e autorização; relatar separadamente testes controlados, banco real, provedor e navegador.

## Verification and limits

Ao executar, conferir a especificação e o estado atual da IA antes de escolher a menor entrega. Se as definições exigirem mais de uma entrega independente, propor a divisão antes de implementar. Preparar migrations e permissões somente após decisão de escopo, sem aplicação cega em produção. Testes com provedor real ou escrita de dados exigem ambiente e autorização apropriados; não gerar consumo real para validar este registro. Seguir verificações do repositório e atualizar CURRENT, contratos e KIs aplicáveis. Nenhum código, SQL, cota ou configuração foi alterado na criação deste ticket.

## Diagnóstico do contador sem atualização — 05/11/2026

Proprietário aprovou o visual e relatou uso real sem mudança no consumo. Leitura de catálogo no projeto de produção confirmou: public.ai_usage existe (reserva técnica), mas public.ai_generation_logs, public.log_ai_generation e public.get_agency_ai_usage não existem. A migration de medição está somente preparada. A interface chama get_agency_ai_usage e o model transforma o erro em null; por isso não mostra consumo mesmo após gerar.

Há um segundo problema: o worker permanente em runStrategyWorker chama generateStrategies sem callback onUsage. Mesmo instalar a migration atual não mediria as estratégias desse fluxo. api/ai.ts possui log_ai_generation, mas não verifica o error retornado pelo RPC, apenas exceções lançadas, permitindo falha silenciosa. O fator de conversão interno também precisa de contrato rastreável, não deve ser deduzido da reserva de tentativas.

Próximos passos: completar a medição durável/autorizada em todos os fluxos reais, confirmar contrato de unidades/modelos, aplicar somente o schema revisado, distinguir falha de consulta de mês sem uso e verificar uma geração autorizada sem duplicar consumo em retries. Não executar geração paga por rotina nem aplicar migrations cegamente. Sem SQL de escrita, nova geração ou alteração do fluxo de estratégias nesta investigação. Aceite visual não encerra o problema funcional.

## Correção implementada e banco aplicado — 05/11/2026

Subagente implementou medição compartilhada na API e worker, com tokens reais, ausência de usage como incompleto, evento UUID estável para retry, erro de RPC tratado sem invalidar geração e identidade da estratégia derivada da operação/lease no banco. Resultado retido não gera nem mede de novo. Mantida a convenção já existente `(entrada + 2 × saída) / 1000`, com versão weighted_tokens_v1 e referência mensal de 1000 unidades; não são preços do provedor nem nova quota. Quota diária continua inalterada.

Minha Conta valida a resposta e distingue erro, período parcialmente medido e eventos incompletos; reconsulta ao abrir e invalida após uso. Estratégias invalidam o agregado em generated/succeeded/failed/conflict/uncertain uma vez por operação/estado; onComplete continua só em succeeded. Gerações anteriores ao início da medição não foram inventadas/reconstruídas.

### Registro de aplicação e verificação

- Fonte revisada: supabase/migrations/20261101230000_ai_agency_usage.sql; SHA256 `41c26f85c37ecb9a845ec0e777cb9c7863570b7b51376b61d01d1c6f489a9d03`. A migration antes somente preparada foi corrigida, sem reaplicar o histórico inteiro.
- Aplicada pelo coordenador no projeto de produção em 05/11 como migration remota `20261105035937_ai_agency_usage_metering` (versão remota diferente do nome do arquivo local).
- Catálogo confirmou ai_usage_metering/ai_generation_logs com RLS, record_ai_generation service-only e get_agency_ai_usage disponível ao autenticado. Leitura detalhada e execução do logger não são concedidas ao cliente; agregado não é concedido a anon.
- Consulta REAL da RPC com role authenticated e identidade de membro ativo retornou Novembro de 2026, referência 1000, zero eventos registrados e partial_period=true; início real da medição 2026-11-05T03:59:37.342177Z. Não foi criada geração fictícia.
- Guardas SQL reais passaram sem inserir logs: authenticated não lê tabela nem executa logger; consulta sem identidade recusada; anon não executa agregado; service_role com evento inválido recusado antes de escrita.
- Advisors: alertas de [RLS sem policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) nas tabelas service-only e de [agregado SECURITY DEFINER acessível ao autenticado](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) são intencionais neste contrato, com auth.uid/people.visible, search_path vazio e grants conferidos. Não abrir permissões das tabelas para silenciar alertas. Avisos preexistentes não foram alterados.
- Testes: 144 focados (API/worker, helper/model e hooks), 9 endpoints serverless; Prettier/Biome/typecheck aprovados. Script PostgreSQL isolado preparado, mas não executou por runtimes locais incompletos (postgres.bki/PGlite ausentes). Não declarar teste isolado de escrita/idempotência SQL: a evidência remota desta rodada é instalação, consulta autorizada e guardas sem fixtures.

### Pendência real

Publicar o backend/API/worker corrigidos e confirmar incremento com uma geração normal autorizada. Instalar SQL não publica código; o worker remoto anterior ainda não passa pelo logger novo. Nenhum push/deploy ou geração paga foi executado nesta rodada. Manter o ticket ativo até essa conferência; código e schema preparados não equivalem ao fluxo inteiro certificado em produção.

## Commit autorizado — 05/11/2026

Proprietário solicitou commit da correção e dos registros desta rodada. Código/schema/testes integram o commit desta atualização; SQL remoto já aplicado conforme evidência acima. Publicação de API/worker e confirmação de incremento continuam pendentes. Sem push/deploy.
