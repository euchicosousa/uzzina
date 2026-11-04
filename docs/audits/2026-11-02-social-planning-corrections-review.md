# Revisão das correções do Planejamento — 02/11/2026

## Escopo e conclusão

Revisado o estado local das correções C00–C10, sobre HEAD `ad0c0eda89188a367574d35c94aec792325a6084`. As correções ainda não estão commitadas. Foram lidos somente Planejamento, testes/contratos diretamente relacionados, migration preparada e documentação da série. Alterações simultâneas do Prism e da galeria não são objeto de aceite deste parecer.

**A série não está concluída.** Há melhorias reais, mas C01, C05, C07 e C09 ainda não entregam seus requisitos centrais; os demais têm conclusão parcial ou verificação insuficiente. Não foram feitas correções funcionais nesta revisão.

## Achados

### R1 — P1: Finalização continua sem atomicidade ou idempotência entre abas — C09

Referência: `app/lib/social-planning/finalizer.ts:56–103`.

O loop ainda faz INSERTs independentes no navegador. O teste de `created_action_id` verifica somente o objeto recebido, sem restrição única ou transação no banco. Duas abas que abriram a mesma versão não conhecem as alterações uma da outra.

Reproduções com o finalizador real e somente `createActionClient` substituído:

- A/B/C aprovadas, falha em B: duas ações criadas (A/C), plano continua draft. Melhorou o status, mas não há rollback do conjunto como exigido.
- Duas chamadas simultâneas com cópias independentes: `A,A,B,B,C,C`.
- Primeira aba finaliza e depois outra usa sua cópia antiga: `A,B,C,A,B,C`.

Correção necessária: executar conversão e vínculos em transação autorizada, com unicidade durável por sugestão, versão esperada e reconciliação de resposta perdida. Não considerar o campo local uma garantia de idempotência. Ainda faltam atualização canônica do cache de ações, resumo de confirmação, continuidade da sessão e bloqueio por estado finalizado na UI.

### R2 — P1: Falha ao gravar vínculos ainda é anunciada como sucesso — C01/C09

Referência: `app/lib/social-planning/finalizer.ts:105–112`.

O finalizador ignora o `SavePlanResult`. Na reprodução, três ações foram criadas, o armazenamento recusou a gravação, a função retornou `createdCount:3,errorCount:0` e o plano persistido continuou draft, sem os vínculos. Reabrir/repetir pode duplicar tudo. O mesmo objeto em memória ficou finalized, divergindo do persistido.

Correção necessária: confirmação da conversão e dos vínculos deve ser uma única confirmação canônica no servidor/banco. Enquanto não existir, não anunciar sucesso durável ao ignorar uma falha de gravação.

### R3 — P1: Geração continua sendo template local, sem IA — C05

Referências: `app/lib/social-planning/generator.ts:288` e `app/routes/app/planejamento.tsx:285`.

O gerador continua síncrono, usa os nove `EDITORIAL_ANGLES` e apenas interpola textos. Não há chamada de IA do Planejamento no servidor, reserva de quota, validação de resultado do provedor nem operação durável. O direcionamento longo continua reduzido em `resolveTopic`. Corrigir o campo para `voice` foi útil, mas não implementa C05.

Correção necessária: executar o ticket C05 original, incluindo contrato, autenticação, dados editoriais canônicos, quota, resultado estruturado, persistência e retry técnico. Não tratar testes do template como teste de integração com IA.

### R4 — P1: Persistência canônica não foi conectada e ainda cria cópia sem autor — C01

Referências: `app/lib/social-planning/storage.ts:173`, `app/lib/social-planning/generator.ts:381–394`, `app/routes/app/planejamento.tsx:310–311`.

O app continua usando somente localStorage. Não existe model/API do Planejamento conectado à tabela preparada; outro navegador não recupera a proposta e o compartilhamento descrito em D1 não funciona. A regra de acesso não é implementada por uma chave local.

Além disso, o gerador salva antes de a rota atribuir `user_id`. Depois a rota salva novamente com identidade: a reprodução deixou `uzzina_social_plans_default_brand` e `uzzina_social_plans_user-A_brand` com o mesmo plano. `getSocialPlan(id)` sem escopo encontra a cópia sem dono; os helpers ainda enumeram outras chaves quando recebem escopo incompleto. A rota passou a listar pelo usuário/parceiro, o que melhora a exposição anterior na lista, mas não resolve a persistência/autorização nem elimina os atalhos sem escopo.

Correção necessária: cumprir C01 com fronteira canônica autorizada; exigir identidade/escopo nos consumidores e remover o salvamento antecipado. Não importar registros sem autoria automaticamente.

### R5 — P1: Migration preparada usa colunas/tipos incompatíveis e políticas incompletas — C01

Referência: `supabase/migrations/20261102120000_social_plans.sql:33–37`, repetido nas demais policies.

As policies usam `pe.role = 'admin'`; o contrato versionado do projeto tem `people.admin boolean`, sem `role`. Também comparam `people.user_id uuid` a `auth.uid()::text` e `partners.users_ids uuid[]` a `text[]` sem conversão compatível. Conferência: `supabase/staging/bootstrap.sql:145–181`, `types/database.ts:541` e helpers de autorização vigentes. Contra esse catálogo a migration não é aplicável como escrita. Não houve execução remota para afirmar o estado atual de produção.

Mesmo corrigida a sintaxe, leitura/inserção não exigem explicitamente membro ativo/parceiro não arquivado; UPDATE/CHECK validam só autoria/admin e não revalidam o parceiro de destino, permitindo mover uma proposta para outro parceiro por payload, sujeito às demais restrições do catálogo. Não há mecanismo de versão/updated_at controlado pelo banco nem conversão transacional neste arquivo.

Correção necessária: verificar catálogo real antes de aplicar, usar contratos atuais de membro/admin ativo e parceiro operacional, proteger origem/destino da atualização e preparar versão canônica. Não aplicar esta migration sem corrigir e verificar esses pontos. SQL preparado não equivale a persistência entregue.

### R6 — P2: Extras tornam a composição manual válida impossível de gerar — C03/C04

Referência: `app/routes/app/planejamento.tsx:277–282`.

A validação manual usa o total regular, mas `distributeFormats` recebe `slots.length`, já incluindo extras. Reprodução: um slot regular, um reel solicitado e uma comemoração extra; a validação retorna true, mas o distribuidor recebe total dois e lança erro. A configuração apresentada como válida não gera.

Correção necessária: distribuir regulares separadamente dos extras e preservar essa distinção na entrada/resultado. O resumo atual soma IDs de comemorações, embora o merge combine registros na mesma data e não acrescente conteúdo em coincidência regular; pode anunciar um total diferente do resultado. Segundo a D4 agora registrada, extras não devem consumir os regulares; confirmar a fonte dessa decisão e fazer o cálculo único refletir a política.

### R7 — P2: Calendário ainda é uma implementação paralela — C07

Referência: `app/components/planning/PlanningCalendarView.tsx:75–99`.

Foram adicionados overflow horizontal e arraste HTML5, mas o componente continua desenhando sua própria grade/cabeçalho. Não compõe `Calendar`, `CalendarWithDnd` ou os ajustes laterais existentes. “Segundo a estrutura do app” não satisfaz o requisito explícito de reutilizar o mesmo calendário.

Correção necessária: executar a integração prevista em C07, preservando a fronteira de sugestões e sem mutações de ações. O arraste local e edição de data são avanços aproveitáveis, mas não comprovam o calendário contratado.

### R8 — P2: Formulário ainda controla o período da proposta aberta — C06

Referência: `app/routes/app/planejamento.tsx:956–960`.

`handleOpenPlan` passou a restaurar vários campos, mas a visualização continua recebendo `startDate/endDate` do formulário de nova geração. Depois de abrir novembro, mudar a configuração para dezembro oculta as sugestões de novembro na grade, sem gerar uma proposta nova. A visualização precisa usar a configuração capturada no plano aberto. Campos ausentes na reabertura também conservam valores da proposta anterior, em vez de validar a entrada incompleta.

Correção necessária: separar configuração em edição da entrada do resultado aberto, conforme C06, e aplicar guarda ao trocar parceiro/proposta quando houver edição pendente.

### R9 — P2: Editor fecha e descarta o texto mesmo quando salvar falha — C08

Referência: `app/components/planning/PlanningSuggestionEditor.tsx:77–94`.

`onSave` retorna void e `onClose()` é chamado incondicionalmente. Quando `updatePlanSuggestion` falha, a página informa erro, mas o diálogo já desmontou e perdeu o rascunho. Escape/clique externo/fechar também não verificam alterações.

Correção necessária: retorno explícito/assíncrono de salvamento, fechar somente após confirmação, conservar valores em falha/conflito e aplicar a guarda de descarte. PrismDialog, nome acessível e identidade por key corrigem parte do ticket, não o seu fluxo de salvamento.

### R10 — P2: Validação aceita data impossível e ignora a igualdade dias/frequência — C02

Referência: `app/lib/social-planning/slot-calculator.ts:67–108`.

`parseU` normaliza datas usando o construtor Date. Verificar só NaN aceita `2026-02-30`: a reprodução retornou válido e gerou slots de março. Também aceitou frequência três com apenas segunda-feira selecionada, gerando cinco posições em novembro, embora D2 agora diga que dias selecionados devem equivaler à frequência.

Correção necessária: validar data civil real sem normalização e aplicar a relação frequência/dias definida na decisão confirmada. A eliminação do fallback de seis conteúdos sem data está correta.

### R11 — P2: Controle de versão existe na assinatura, mas não nas escritas reais — C01

Referência: `app/lib/social-planning/storage.ts:214–229` e consumidores.

O conflito só é verificado quando `expectedVersion` é passado; nenhum consumidor atual o passa. Aprovar todas com objeto antigo ou salvar finalização pode sobrescrever edição de outra aba sem aviso. O número é incrementado a partir da versão do payload, não necessariamente da versão persistida. Mesmo um check local não fornece atomicidade entre abas.

Correção necessária: comparação e incremento no servidor/banco na mesma escrita, com consumidores enviando versão esperada e UI tratando conflito; não anunciar detecção de concorrência apenas por ter a opção na assinatura.

## Estado por ticket e limites de aceite

| Ticket | Parecer                                                                                                                                                                                              |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C00    | D1–D6 foram registradas, mas sem fonte específica de confirmação no novo bloco. D5 ainda não fixa horário/fuso. Conferir a aprovação no chat de origem; este parecer não afirma que ela não existiu. |
| C01    | Parcial local; persistência/autorização canônica não entregue; migration precisa correção.                                                                                                           |
| C02    | Parcial: bloqueia zero slots/formato inválido, mas aceita data impossível e divergência de frequência.                                                                                               |
| C03    | Parcial: filtro por intervalo melhorou; extras/resumo ainda divergem.                                                                                                                                |
| C04    | Parcial: não corta/completa manual silenciosamente; integração com extras quebra.                                                                                                                    |
| C05    | Requisito central de IA real não implementado.                                                                                                                                                       |
| C06    | Parcial: reabertura e limpeza de parceiro melhoraram, mas visualização segue o formulário.                                                                                                           |
| C07    | Parcial em arraste/overflow; requisito de reutilizar calendário não implementado.                                                                                                                    |
| C08    | Parcial em acessibilidade; perda de rascunho continua.                                                                                                                                               |
| C09    | Parcial em responsáveis/status/mensagens; atomicidade/idempotência durável não entregues.                                                                                                            |
| C10    | Evidência insuficiente para declarar conclusão integrada.                                                                                                                                            |

Os status `completed` dos tickets e a entrada de conclusão em CURRENT não devem ser usados como evidência de entrega. Foram preservados como registros do outro agente; este parecer documenta a divergência sem encerramento/reabertura automática de tickets.

## Verificação realizada

- `bun test tests/social-planning-generator.test.ts tests/social-planning-slots.test.ts`: **25 PASS, 0 FAIL**, reproduzido nesta revisão. Os arquivos não cobrem finalização, autorização real, provedor de IA, integração da rota/calendário ou falha de salvamento do diálogo; não certificam C10.
- Ensaio offline com módulos reais de cálculo, geração, persistência e finalização. localStorage substituído por memória e somente a escrita de ação substituída por função controlada. Reproduzidos concorrência, aba antiga, criação parcial, falha de persistência, cópia sem autor, extras/manuais e validações inválidas. Nenhum dado do banco real foi alterado.
- Inspeção textual da migration contra o catálogo/tipos versionados; não é teste de autorização remota nem confirmação do catálogo de produção.
- Sem navegador/aceite visual, chamadas pagas de IA, SQL remoto, commit, push ou deploy. Performance não foi medida; não foi encontrado gargalo prioritário comprovado neste recorte. Segurança e correção funcional reprovam o aceite; manutenção permanece parcial pela duplicação de calendário e pelo armazenamento desconectado.

## Próxima ação recomendada

Retomar C01/C05/C09 pelo critério central que falta, sem substituir transação por campo local ou IA por templates. Corrigir a integração C03/C04 e concluir C06–C08. Só então refazer C10 com cenários de falha/concorrência e evidências reais compatíveis com cada camada. Esta revisão não inicia essas implementações.
