# Revisão do planejamento — 01/11/2026

## Escopo e conclusão

Revisado o commit `ad0c0eda89188a367574d35c94aec792325a6084`, contra seu pai `b310cb3`, que declara implementar os tickets 00–07. Mudanças posteriores de outros agentes, inclusive a nova auditoria de design, estão fora deste parecer. A implementação estava autorizada em outros chats, conforme CURRENT; esta revisão não questiona essa autorização.

A interface avançou, mas os tickets funcionais não devem ser considerados concluídos: geração real por IA, isolamento dos dados e finalização recuperável ainda não estão entregues. Nenhuma correção funcional foi feita nesta revisão.

## Achados prioritários

### 1. P1 — Finalização repetida duplica ações e falhas parciais viram sucesso

Em `app/lib/social-planning/finalizer.ts:37–71`, cada sugestão faz um INSERT independente. Não existe vínculo persistido sugestão→ação, proteção de repetição ou transação; mesmo com erros, o plano recebe `finalized`. A página ignora `errorCount` e mostra sucesso em `app/routes/app/planejamento.tsx:287–294`. O botão também não recebe o estado finalizado em `PlanningSuggestionsList.tsx`.

Reprodução offline com o finalizador real e somente a escrita remota substituída: A/B/C aprovadas, B falha, A/C são criadas e o plano fica finalizado. Repetir cria A/B/C novamente, duplicando A/C. É necessário distinguir uma nova geração independente (deve produzir tudo novamente) de uma repetição da finalização do mesmo plano (não deve duplicar).

### 2. P1 — Dados locais não estão isolados por identidade nem por autorização do parceiro

`app/lib/social-planning/storage.ts:3` usa a chave global `uzzina_social_plans`. `listSocialPlans(undefined)` retorna todos os planos (`31–46`), sem identidade ou interseção com os parceiros autorizados. A página chama essa função sem parceiro selecionado (`app/routes/app/planejamento.tsx:154–158`) e permite abrir os planos retornados (`772–786`).

No mesmo navegador, entrar com outra conta preserva os planos da conta anterior e os expõe nessa lista, inclusive de parceiros fora do novo escopo. O armazenamento também é exclusivamente local: outro dispositivo não recebe os planejamentos e apagar os dados do navegador os remove. A reprodução offline confirmou a listagem sem escopo; não foi feita troca de contas reais.

### 3. P1 — O gerador não usa IA

`app/lib/social-planning/generator.ts:287` é uma função síncrona de templates executada no navegador. Os títulos e briefings são montados a partir de nove ângulos fixos; não existe chamada ao servidor/provedor, análise de contexto ou reserva de quota. A reprodução com 12 conteúdos produziu nove títulos únicos; repetir a mesma entrada produziu os mesmos títulos.

Além disso, `app/routes/app/planejamento.tsx:195–198` e `228–231` leem `voice_tone` mediante cast, enquanto o campo do parceiro é `voice`. O tom de voz real não chega ao gerador. É uma base demonstrativa de interface, não a entrega funcional de geração de propostas por IA.

### 4. P1 — Criação de ações não atende ao contrato de membros comuns

O payload em `app/lib/social-planning/finalizer.ts:47–57` omite responsáveis. O schema de criação (`app/utils/validation.ts:125`) completa com `[]`; `createActionClient` envia esse resultado ao banco. A política versionada em `supabase/migrations/20261006030000_database_authorization.sql:60–62` exige, para não administradores, o usuário entre os responsáveis e vínculo com parceiro ativo.

Assim, o payload é incompatível com esse contrato: membros recebem falhas de criação, que o finalizador ainda converte em plano finalizado; administradores criam ações sem responsáveis. Esta conclusão é de código/contrato versionado, sem nova leitura ou escrita de produção nesta revisão. Reutilizar o fluxo canônico de rascunho/criação e conferir continuidade da sessão antes de cada escrita.

### 5. P2 — Calendário próprio não cumpre o calendário aprovado

`app/components/planning/PlanningCalendarView.tsx` implementa outra grade de sete colunas, sem reutilizar o calendário existente, seus ajustes laterais e seu comportamento de rolagem. Também não há implementação de arrastar uma sugestão entre datas. Isso diverge da decisão explícita de usar o mesmo calendário do app; não depende das novas regras de design posteriores.

Ao reabrir um plano, a página apenas troca `currentPlan` (`app/routes/app/planejamento.tsx:783–785`), mas envia ao calendário as datas atuais do formulário (`751–755`). Um plano de novembro aberto com o formulário em dezembro pode parecer vazio no calendário, embora sua lista tenha sugestões. O período exibido deve acompanhar o plano aberto.

### 6. P2 — Contagem e datas podem contrariar a configuração

- Sem nenhum slot válido, `generator.ts:303–307` inventa uma quantidade baseada em duas semanas. A página não bloqueia essa entrada: a reprodução gerou seis sugestões sem data para zero slots.
- O filtro `app/routes/app/planejamento.tsx:127–144` aceita uma comemoração pelo mês mesmo fora do intervalo/ano. `mergeCommemorativeSlots` não valida novamente o período. A reprodução acrescentou uma comemoração de novembro de 2025 a slots de novembro de 2026.
- `distributeFormats` altera silenciosamente quantidades manuais para preencher o total. Na reprodução, pedir quatro reels e nenhum outro formato para seis posições retornou cinco reels e um carrossel. Validar ou explicitar o ajuste antes de gerar.

### 7. P2 — Falha de persistência é ocultada

`app/lib/social-planning/storage.ts:78–102` retorna normalmente se o armazenamento não estiver disponível ou se `setItem` falhar. A interface continua exibindo a versão como salva. A reprodução com falha controlada de quota confirmou retorno sem erro e ausência do plano. É preciso comunicar falha e preservar um estado recuperável, sem sinalizar salvamento concluído.

## Verificação e limites

Leitura do commit, contratos de criação e documentos de planejamento; execuções offline dos módulos reais de cálculo, geração, armazenamento e finalização. Nos ensaios, localStorage foi substituído por memória e a única chamada de criação remota do finalizador foi substituída por uma função controlada. Nenhuma escrita real, chamada paga de IA, SQL, publicação ou deploy. Não foi feita validação visual no navegador, benchmark ou execução ampla de testes; uma suíte verde não resolveria as divergências funcionais encontradas.

Pontos aproveitáveis: separação entre proposta e ação, controles de período/tema, slider e seleção de dias, edição/aprovação/rejeição e primitivas de interface já fornecem uma base para continuar. A nova geração também recebe um novo identificador, coerente com não descontar ações existentes. Isso não comprova persistência compartilhada ou segurança da finalização.

Ordem sugerida: corrigir isolamento e finalização (incluindo membros comuns); implementar geração real e persistência autorizada; então corrigir calendário, período e quantidades. Reavaliar o aceite dos tickets 01–07 com essas evidências. Não alterar automaticamente os tickets nem iniciar essas correções com base neste parecer.
