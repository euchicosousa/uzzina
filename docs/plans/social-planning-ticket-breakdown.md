# Planejamento de redes sociais — proposta de tickets

Preparada em 28/10/2026 com a skill To Tickets, a partir da conversa com o proprietário e da inspeção do código atual. **Estado: divisão para revisão; tickets ainda não publicados, implementação não iniciada.**

Destino: tracker local já usado no projeto, um arquivo por ticket em `.scratch/social-planning/issues/`, após aprovação desta divisão. A publicação dos tickets não inicia sua execução nem autoriza SQL remoto, chamadas reais de IA, commits ou deploy.

## Decisões confirmadas pelo proprietário

- Planejamento exclusivo de redes sociais, por cliente comercial da agência: **partner**, e não conta externa **client**.
- Planejamento acessível a todos os membros da equipe, não somente administradores: comando na busca global, item no menu superior e botão com ícone ao lado do nome do parceiro na página dele.
- Página de Planejamento funciona por parceiro e mantém sua identidade na URL. Entradas com parceiro conhecido já o selecionam; sem parceiro definido, a página oferece seleção entre os parceiros disponíveis ao usuário.
- Reutilizar Contexto e Tom de Voz existentes. Sem análise de documentos/prints, chat de IA ou guia/formulário extenso de preenchimento neste escopo.
- Pedidos por período/frequência semanal ou por tema/quantidade. Exemplo: cinco conteúdos sobre histeroscopia e ultrassom.
- Possibilidade de indicar quantos reels, estáticos e carrosséis.
- Controle para considerar datas comemorativas dentro do período. Elas podem acrescentar publicações à frequência regular, como 12 regulares + 1 comemorativa.
- Proposta com sugestões que possam ser abertas, editadas, aprovadas ou rejeitadas. Visualização em calendário com mudança de data.
- Finalizar o planejamento transforma as sugestões aprovadas em ações; rejeitadas ficam fora da programação resultante.
- **Uma nova geração ignora ações existentes e gera integralmente o novo pedido.** Se uma proposta de 12 teve nove aprovadas, pedir outras 12 no mesmo período gera outras 12, sem preencher apenas lacunas ou descontar as nove ações.
- Tickets devem ter entregas verificáveis próprias, dependências reais e fronteiras que permitam dois agentes trabalharem em tickets distintos quando possível.

## Regras propostas para fechar a divisão

As regras abaixo tornam os tickets executáveis sem decisões ocultas. São **propostas para aprovação**, não decisões anteriores atribuídas ao proprietário.

1. **Entrega editorial:** cada sugestão traz título provisório, formato, objetivo e briefing/abordagem. Uma análise curta explica a distribuição. Roteiro completo, texto de carrossel e legenda continuam no fluxo atual de produção da ação, depois da conversão.
2. **Geração independente:** cada comando explícito de gerar produz um novo planejamento salvo, com identidade própria. Não substitui uma proposta anterior nem altera suas decisões. Repetir uma tentativa técnica da mesma solicitação não publica duas cópias; pedir novamente é uma solicitação nova.
3. **Base mínima:** Contexto ou pedido precisa dizer ao menos o que o negócio/tema trata. Tom de Voz pode estar vazio. O app usa validação e aviso pontual de informação insuficiente; não abre conversa. Informações opcionais ausentes são indicadas sem inventar ofertas, pessoas, metas ou atributos da marca. Guardar a base efetivamente usada, sem mudar os campos do cliente.
4. **Por tema:** quantidade inteira de sugestões; data pode começar ausente. É possível datar cada item na revisão. Sem período, não consultar comemorações nem inventar um período.
5. **Por período:** intervalo inclusivo, frequência de um a sete conteúdos por semana e dias da semana correspondentes. O app propõe dias distribuídos; a pessoa pode ajustá-los antes de gerar. A contagem é o número real de ocorrências desses dias dentro do intervalo, inclusive em semanas incompletas; exibir a contagem antes do envio. Semana visual acompanha o calendário existente. Não calcular mês como quatro semanas fixas.
6. **Formatos:** distribuição exata opcional entre estático, carrossel e reels, somando a quantidade regular. Sem distribuição, a IA escolhe. Extras comemorativos recebem formato próprio e não diminuem os números regulares. Alterar a quantidade/período exige revisar uma distribuição que deixou de somar, sem ajuste silencioso.
7. **Comemorações:** controle começa desligado. Ligado, considerar somente registros de data completa existentes no intervalo, sem projetar recorrência anual nem pesquisar a internet. A IA pode propor extras pertinentes e explicar sua relação com o cliente; o resultado separa regulares, extras e total. Não é obrigatório produzir uma publicação para cada registro. A referência de origem é preservada e registros ignorados não viram ações. Exibir claramente quando não houver extras pertinentes.
8. **Revisão persistida:** salvar alterações de briefing, formato, data e decisão explicitamente, com confirmação canônica. Pendentes e rejeitadas ficam guardadas no histórico do planejamento; apenas aprovadas são convertidas. Rejeitadas não aparecem como programação ativa, mas podem ser consultadas durante a revisão. Uma nova geração não as reutiliza automaticamente.
9. **Finalização:** mostrar quantas aprovadas serão criadas e quantas pendentes/rejeitadas ficarão de fora. Exigir data de todas as aprovadas. Usar horário explícito comum, inicialmente 11h no fuso operacional apresentado, ajustável antes de confirmar; nunca mover implicitamente para hoje ou para agora +10 minutos. Finalização bem-sucedida fecha a revisão dessa proposta; novas ideias pedem um novo planejamento. O histórico conserva os vínculos para consultar as ações resultantes, respeitando autorização atual.
10. **Conversão segura:** uma sugestão aprovada da mesma proposta gera no máximo uma ação, inclusive com clique duplo, duas abas, resposta perdida e nova tentativa. A nova proposta tem outras sugestões e pode criar outras ações para as mesmas datas/temas. Não deduplicar por título, data ou período.
11. **Escopo de equipe:** planejamento compartilhado entre membros ativos autorizados ao parceiro e administradores; sem acesso pelo portal/revisão pública. Alterar Contexto/Tom continua seguindo a administração já existente. Revogação/arquivamento são conferidos novamente antes de gerar, revisar ou finalizar. Não criar modelo de agência nem permissões adicionais neste trabalho.
12. **Limites iniciais propostos:** até 50 sugestões regulares por pedido, até 10 extras e período de até 90 dias. Validar o total antes de chamar o provedor; excesso pede reduzir o pedido, sem truncar silenciosamente. Confirmar viabilidade de resposta/tempo na primeira entrega e registrar qualquer necessidade de revisar estes tetos antes de ampliar o escopo.

## Divisão proposta

Cada ticket inclui persistência, autorização, interface e verificação das partes que modifica. Não há ticket separado de banco/API/testes nem refatoração ampla prévia. Extrações pequenas necessárias ficam na entrega que as utiliza.

### 01 — Gerar e reabrir uma proposta por tema

**Blocked by:** None (can start immediately, após aprovação da divisão e autorização para executar).

**What to build:** Abrir Planejamento pela busca global, pelo menu superior ou pelo botão ao lado do nome do parceiro; selecionar um parceiro quando necessário, informar tema/direcionamento e quantidade, gerar uma proposta usando a base existente, visualizar a análise e a lista, sair e reabrir o resultado salvo.

- [ ] Comando Planejamento no grupo comum da busca global e item Planejamento no menu superior, disponíveis para membros comuns e administradores. Não condicionar esses acessos a permissão administrativa, nem colocá-los apenas no grupo Admin. Preservar navegação com guardas das ações abertas; bloqueio mantém a tela/busca/rascunhos existentes. Comando é navegação, não abre ação secundária por Shift nem gera proposta ao ativar.
- [ ] Botão com ícone de planejamento imediatamente ao lado do nome do parceiro na página operacional dele, com nome acessível/tooltip Planejamento, foco visível e uso por teclado. Leva à mesma página de Planejamento com aquele parceiro na URL; não depende de ser administrador. Preservar legibilidade e acesso aos controles em tela estreita.
- [ ] Página própria de Planejamento usa o parceiro da URL como fonte do escopo. Abertura pela busca/menu no contexto de um parceiro preserva esse parceiro autorizado na URL; fora desse contexto, abre sem seleção e apresenta seletor. Não inferir parceiro a partir do filtro exclusivo da busca nem selecionar arbitrariamente o primeiro disponível.
- [ ] Sem parceiro selecionado, permitir escolher entre parceiros operacionais autorizados e atualizar a URL antes de carregar base/propostas ou gerar. Sem parceiros disponíveis, mostrar estado vazio; parceiro inválido/arquivado/inacessível na URL não carrega dados nem faz fallback silencioso para outro. Seletor oferece correção quando houver opções autorizadas.
- [ ] Trocar parceiro atualiza a URL e mostra somente sua base/propostas; recarregar, colar link e Voltar/Avançar preservam o escopo. Resolver propostas pelo vínculo real com o parceiro, recusando combinações forjadas de IDs/URL. Troca durante edição não descarta rascunho sem a guarda aplicável e respostas tardias do parceiro anterior não aparecem no seguinte.
- [ ] Área do parceiro não mistura sugestões com ações operacionais. Lista de propostas daquele parceiro e detalhe persistido com estados vazio, carregando e erro/retry. Menu, busca e botão convergem para a mesma página, sem três fluxos ou estados concorrentes.
- [ ] IA retorna exatamente a quantidade pedida de sugestões válidas, cada uma com identidade estável, título, formato e briefing/objetivo. Datas inicialmente opcionais e decisão inicial pendente. Quantidade variável não reutiliza a resposta fixa de cinco estratégias.
- [ ] Contrato próprio do planejamento preserva os quatro fluxos atuais de IA e aceita extensões de configuração pelos tickets seguintes. Estabilizar identidade, revisão, campos de data/formato/decisão/origem, estado de finalização e confirmação canônica antes de liberar trabalho paralelo; não preparar implementações fictícias das extensões.
- [ ] Servidor resolve parceiro autorizado e Contexto/Tom vigentes; não confia em identidade, base ou escopo enviados pelo navegador. Aplica quota persistente e os erros atuais de indisponibilidade/limite. Pedido inválido é recusado antes do provedor.
- [ ] Proposta e sugestões são publicadas juntas após resultado validado. Resposta inválida/incompleta não cria uma proposta utilizável vazia; falha não apaga pedidos anteriores. Repetição técnica não cria duas publicações da mesma solicitação. Não exigir fila/worker novo sem evidência de necessidade.
- [ ] Nova solicitação com mesmo tema/período gera quantidade integral e identidade nova; nenhuma consulta a ações/propostas anteriores serve para completar, descontar, evitar temas ou preencher lacunas.
- [ ] Proteção no banco/API para leitura e escrita, parceiro arquivado/inacessível, membro inativo e cliente externo; isolamento de cache/sessão. Persistência efetiva e autorização exercidas em banco descartável/autorizado, não apenas por mocks HTTP ou inspeção de SQL.
- [ ] Demonstração com provedor controlado cobre geração, salvar/reabrir, duas gerações iguais independentes, resultado inválido, falha de persistência, nova tentativa e troca de sessão. Registra limites editoriais sem alegar qualidade de geração real não realizada.
- [ ] Testes reais cobrem os três acessos com membro comum e administrador, contexto com/sem parceiro, seleção/URL, link direto/recarga/Voltar, parceiro inacessível, zero parceiros e resposta antiga após troca. Conferência de navegador controlado em desktop/mobile e teclado; nenhum acesso apenas navega para cadastro administrativo ou grava ações/propostas ao abrir.

**Fronteira:** dono do núcleo da feature, dos três acessos, seletor/escopo pela URL, contrato e armazenamento iniciais. Integrar busca/menu/página de parceiro nesta primeira entrega, preservando alterações externas nesses componentes. Não implementar revisão completa, calendário ou conversão antecipadamente. Ao encerrar, documentar comandos e revisões que as extensões vão consumir.

### 02 — Revisar sugestões e salvar decisões

**Blocked by:** 01 — Gerar e reabrir uma proposta por tema.

**What to build:** Abrir uma sugestão, editar seus campos, datá-la e marcar pendente/aprovada/rejeitada, retomando a revisão posteriormente com tudo preservado.

- [ ] Editor próprio da sugestão com título, briefing/objetivo, formato e data opcional; não abrir a gaveta de uma ação fictícia nem gravar ações ao revisar.
- [ ] Aprovar, rejeitar e voltar a pendente são persistidos; contadores/lista refletem apenas confirmação. Falha conserva edição e oferece nova tentativa.
- [ ] Estado rejeitado pode ser ocultado da programação e consultado por filtro; rejeitar não exclui definitivamente o item. Data ausente fica visível como Sem data.
- [ ] Comando de mudança de data reutilizável pelo calendário posterior, com validação de intervalo quando o planejamento tiver período. Não depende do ticket03 para editar data de uma proposta temática.
- [ ] Revisão de versão impede sobrescrita silenciosa por outra aba. Troca de proposta/identidade e respostas antigas não alteram o detalhe seguinte. Formulário preserva foco/edição e indica mudanças não salvas ao sair.
- [ ] Guardas e servidor/banco recusam alteração de propostas já finalizadas e escopo revogado. Não usar estado de aprovação como fase da ação.
- [ ] Testes reais cobrem salvar/reabrir, decisão reversível, data válida/inválida, falha/retry, conflito, pendentes/rejeitadas e sessão. Navegador controlado verifica foco, teclado, temas e tela estreita.

**Fronteira:** editor, comandos de revisão e apresentação da decisão. Não altera geração/configuração nem cria ações. Entregar comando público de alteração de data para06 e leitura canônica das decisões para07.

### 03 — Gerar planejamento por período e frequência

**Blocked by:** 01 — Gerar e reabrir uma proposta por tema.

**What to build:** Escolher intervalo, frequência e dias da semana, conferir a quantidade calculada e gerar a proposta já distribuída nas datas, mantendo o modo por tema.

- [ ] Intervalo inclusivo com datas reais; frequência/dias coerentes e total calculado antes de gerar. Slider, se adotado, tem alternativa acessível para teclado.
- [ ] Semanas incompletas, virada de mês/ano e ano bissexto seguem ocorrências reais; exemplo de quatro semanas completas com três dias resulta em12 itens.
- [ ] Aplicação calcula slots e contagem; IA preenche conteúdo sem inventar/remover slots. Datas são dias civis e não mudam de dia por conversão UTC.
- [ ] Configuração e datas persistem e reaparecem na lista/detalhe. Grade visual futura pode incluir dias externos, mas eles não entram no pedido.
- [ ] Repetir novo planejamento para intervalo já usado continua gerando todos os slots, sem consultar ações existentes nem descontar aprovadas de qualquer proposta anterior.
- [ ] Testes reais cobrem cálculo, fronteiras, saída incompatível do provedor, nova geração integral e reabertura. Interfaces inválidas não consomem chamada de IA nem persistem configuração incompleta.

**Fronteira:** configuração e geração por período, cálculo determinístico de slots. Não modifica editor/revisão, calendário ou finalização. Pode andar junto de02 ou04, após01.

### 04 — Escolher a quantidade de cada formato

**Blocked by:** 01 — Gerar e reabrir uma proposta por tema.

**What to build:** Pedir, por exemplo, dois reels, dois carrosséis e um estático; receber exatamente essa composição, ou deixar a escolha de formatos automática.

- [ ] Distribuição opcional usa os formatos reais de rede social; zero é permitido por formato e valores são inteiros não negativos. Composição informada precisa somar a quantidade regular; ausência significa automática.
- [ ] Validação antes da chamada e após resposta; saída divergente não é anunciada como válida. Preservar pedido em falha e não corrigir contagens silenciosamente.
- [ ] Escolha e resultado persistem e aparecem ao reabrir. Modo por tema funciona isoladamente; quando03 for integrado, aplica o mesmo contrato ao total de slots sem reimplementar frequência.
- [ ] Comemorações futuras têm orçamento extra separado, sem consumir a composição regular. Edição manual posterior de formato não regenera nem redistribui outros itens; composição solicitada continua registrada como origem, e contadores da revisão refletem o resultado editado.
- [ ] Testes reais de soma, automático, zeros, inválidos e resposta divergente; integração com03 conferida quando os dois estiverem presentes.

**Fronteira:** controle opcional de distribuição e validação dessa parte do pedido/resultado. Não redefine contrato central nem implementa agendamento. Pode andar junto de02 ou03, após01.

### 05 — Considerar datas comemorativas como extras

**Blocked by:** 03 — Gerar planejamento por período e frequência.

**What to build:** Habilitar Considerar datas comemorativas para acrescentar oportunidades pertinentes do período, preservando a quantidade regular.

- [ ] Controle desligado por padrão; quando desligado, nenhum item comemorativo é acrescentado. Sem período, indicar que é necessário defini-lo.
- [ ] Consulta autorizada usa somente datas completas cadastradas dentro do intervalo inclusivo. Não anualizar registros nem criar datas de outra fonte. Falha na consulta não é apresentada como catálogo vazio ou ignorada silenciosamente.
- [ ] IA recebe apenas candidatos autorizados; extras têm data/origem verificáveis, formato e justificativa de pertinência. IDs/datas externos à lista são recusados; não produzir dois extras para o mesmo registro na mesma proposta.
- [ ] Regulares continuam com quantidade e distribuição solicitadas. Resumo separa regulares/extras/total; um extra no domingo pode resultar em12+1=13. Um extra não é removido só porque existe uma ação real na data.
- [ ] Sem datas ou sem extras pertinentes, concluir normalmente com a quantidade regular e explicação curta. Limite de extras é visível; não truncar resultados sem informação.
- [ ] Datas/origem usadas ficam preservadas na proposta; mudanças posteriores no catálogo não alteram silenciosamente o que foi aprovado.
- [ ] Testes reais cobrem desligado, limites do intervalo/ano, pertinência, candidatos inválidos, falha de catálogo, contagens e combinação com distribuição de formatos quando04 estiver integrado.

**Fronteira:** leitura do catálogo e extensão comemorativa da geração. Não altera CRUD de datas comemorativas nem depende do ticket futuro do modal de cadastro. Pode andar junto de06 ou07 após seus bloqueadores próprios.

### 06 — Revisar pelo calendário e mover sugestões

**Blocked by:** 02 — Revisar sugestões e salvar decisões.

**What to build:** Alternar lista/calendário da mesma proposta e mudar datas por arraste ou editor, mantendo a revisão persistida e sem tocar em ações reais.

- [ ] Usar identidade/decisão/data das sugestões, nunca IDs falsos ou casts para ação. Lista e calendário mostram o mesmo resultado confirmado.
- [ ] Abrir item usa o editor de02; aprovadas/pendentes distinguíveis, rejeitadas fora da programação ativa com acesso por filtro/lista, itens sem data em área identificada.
- [ ] Movimento persiste apenas a sugestão. Falha desfaz somente o preview daquela operação; conflito não restaura snapshot completo sobre edições posteriores. Troca de sessão cancela efeitos locais antigos.
- [ ] Data pode ser alterada por teclado/formulário, sem depender do arraste. Preservar briefing, formato e decisão. Se o planejamento tiver período, bloquear destino externo, inclusive dias extras visíveis nas bordas do mês.
- [ ] Reaproveitar apresentação/primitivos do calendário existente; extração pequena apenas se necessária. Não invocar mutações de ações reais e não refatorar todos os calendários para criar um motor genérico.
- [ ] Funciona com propostas temáticas datadas, portanto não depende de03 nem05. Ao integrar03/05, conferir intervalo e extras nos mesmos comandos.
- [ ] Testes reais de alternância, movimento/salvar/reabrir, erro/retry/conflito, itens sem data, teclado, limite de intervalo, temas e mobile. Verificar ausência de POST/PATCH em ações e regressões dos calendários existentes afetados.

**Fronteira:** visualização/arraste de sugestões. Não gera conteúdo nem finaliza. Pode andar junto de03,04,05 ou07 nos checkouts separados, respeitados os bloqueadores.

### 07 — Finalizar aprovadas em ações com repetição segura

**Blocked by:** 02 — Revisar sugestões e salvar decisões.

**What to build:** Conferir o resumo, escolher horário e finalizar; somente aprovadas viram ações normais, com rastreabilidade e nova tentativa segura.

- [ ] Resumo informa aprovadas/pendentes/rejeitadas, horário/fuso e campos faltantes. Sem aprovadas ou com aprovada sem data, não inicia conversão e informa como corrigir. Não depende do calendário para datar/revisar.
- [ ] Criação e associação às sugestões acontecem atomicamente sob versão esperada da proposta. Revalidar identidade, parceiro, autorização, decisões e campos no banco/servidor; não confiar na lista de aprovadas enviada pelo navegador.
- [ ] Uma única ação por sugestão, garantida por vínculo persistente e transação, inclusive com duas abas/duplo clique/resposta perdida. Nova tentativa de finalização já concluída retorna o resultado correspondente, sem criar novamente, inclusive após edições normais posteriores nas ações. Nova geração possui IDs novos e pode criar outras ações no mesmo período.
- [ ] Falha antes do commit não deixa ações órfãs ou proposta parcialmente concluída. Confirmar resultado ambíguo antes de anunciar erro ou reexecutar; não usar loop de INSERTs independentes como finalização.
- [ ] Título vira título, briefing/objetivo vira descrição, formato vira categoria e dia/horário explícitos viram data de execução. Fase inicial é Ideia, não Feito/Concluído. Defaults de prioridade/cor/duração seguem a fábrica vigente; parceiro é o da proposta e executor autenticado integra responsáveis, preservando retorno canônico e sem ampliar permissões. Conteúdo final/legenda não são inventados no mapeamento.
- [ ] Proposta finalizada fica em consulta; pendentes/rejeitadas preservadas no histórico, sem ações. Ações resultantes seguem edição normal sem sincronização bidirecional implícita. Exclusão/inacessibilidade posterior de ação não recria sua sugestão em retry nem expõe seu conteúdo.
- [ ] Cache recebe apenas ações canônicas confirmadas em escopos conhecidos; invalidar os demais. Resultado antigo não entra em outra sessão. Abrir ação resultante usa o caminho comum vigente da gaveta, com suas guardas.
- [ ] Banco real descartável verifica atomicidade, concorrência, idempotência e negativas de autorização. UI/model/API reais cobrem resumo, bloqueios, confirmação perdida, retry, conflito, cache e nova geração independente. Não certificar SQL com mocks nem usar fixtures de escrita em produção.

**Fronteira:** único ticket que cria ações a partir da proposta; dono da associação/transação de conversão. Não modifica cálculos de frequência, prompts ou componentes do calendário. Pode andar junto de06,03/04 ou05 após02.

## Ordem e execução paralela

Dependências funcionais:

```text
01 ──┬── 02 ──┬── 06
     │        └── 07
     ├── 03 ────── 05
     └── 04
```

Exemplo com dois executores, sem transformar a ordem sugerida em bloqueio artificial:

| Etapa | Executor A | Executor B |
| --- | --- | --- |
| Base | 01 | Sem escrita; pode revisar contratos |
| Primeira fronteira | 02 | 03 |
| Segunda fronteira | 04 | 06 |
| Terceira fronteira | 05 | 07 |

- **Um escritor por checkout.** Paralelismo exige branches/worktrees separados e base comum contendo os bloqueadores integrados. Estar na mesma sessão/chat não permite dois executores editarem a mesma pasta.
- Contrato/revisão/operações centrais estabilizados em01; cada extensão usa pontos existentes e acrescenta módulo/controlador próprio, sem reescrever o núcleo em paralelo. Mudança necessária nesse contrato é coordenada antes de ambos prosseguirem.
- Busca global, menu superior e botão da página do parceiro pertencem somente a01; os demais tickets entram na página de Planejamento existente, sem abrir frentes paralelas nesses pontos compartilhados. Todas as extensões respeitam parceiro autorizado na URL e descartam resultados anteriores ao mudar de parceiro.
- Banco/migrations, tipos gerados, árvore de rotas, documentação compartilhada e manifestos exigem integração serial por um responsável; não aplicar SQL remoto em paralelo. Verificar novamente o catálogo/histórico parcial antes de qualquer rollout.
- Migrations de02 e03, se necessárias, devem ser aditivas e não substituir mutuamente a mesma função/tabela de forma incompatível. A rota/entrada pública criada em01 é preservada.04 estende configuração,05 estende geração,06 consome revisão e07 consome conversão.
- Após integrar um par, rodar verificações do diff integrado e casos cruzados. Cada ticket testa sua própria entrega; o calendário não serve como justificativa para adiar testes de revisão, nem a finalização para adiar autorização/persistência da proposta.
- Dependências satisfeitas tornam um ticket elegível, não iniciado automaticamente. Não implementar este plano ou tarefas adjacentes sem autorização de execução.

## Verificação exigida em cada entrega futura

- Testes no código real proporcionais ao comportamento; conferência de HTTP controlado, persistência/autorização SQL e qualidade real de IA são evidências distintas.
- Format, lint, typecheck e build conforme AGENTS; teste serverless antes de push que alcance APIs/imports/dependências. Nova API também entra na verificação de empacotamento, preservando os casos anteriores.
- Não usar dev habitual, ligado à produção, para fixtures reais de escrita. Banco descartável e HTTP/provedor controlados para automação; uso real de banco/provedor só com escopo autorizado.
- Autorização efetiva, revisão de versão, geração de sessão, falhas/retry e limites de payload/quantidade pertencem a cada caminho que os introduz. Testar HTML/texto gerado sanitizado e sem interpretar conteúdo da marca como comandos privilegiados.
- Atualizar CURRENT e contratos/KIs pertinentes quando houver implementação de models/tabelas/fluxos, além de galeria se criar componentes Prism/Uzzina. SQL preparado, SQL aplicado, frontend local e deploy Ready registrados separadamente.

## Contexto técnico inspecionado

- Parceiro já armazena Contexto e Tom de Voz. Administração atual conserva seu fluxo de edição; não precisa de um novo cadastro de ofertas para este recorte.
- Busca já separa comandos comuns e administrativos, e navegação com ações abertas tem guardas. Menu superior também possui seção administrativa; Planejamento deve ficar no acesso comum em ambos. Botão contextual é na página operacional do parceiro, não em sua edição administrativa.
- IA atual aceita quatro intenções e respostas fechadas; planejamento requer resposta própria variável. A autorização de um parceiro específico e leitura server-side da base devem fazer parte do novo caminho.
- Criação atual de ação faz um INSERT novo a cada chamada, sem vínculo com sugestões. A finalização não pode depender apenas de botão desabilitado ou memória do navegador.
- Calendário/arraste existentes usam ações e mutações reais; reutilizar diretamente uma sugestão como ação produziria risco de gravação antecipada. Por isso a extração, se necessária, fica dentro de06.
- Comemorações existentes têm data completa, sem contrato de repetição anual.
- Nenhum schema/fluxo de Planejamento foi encontrado ou implementado nesta inspeção. Nenhuma necessidade concreta de refatoração prévia ampla foi identificada.

## Revisão pedida pela skill

Antes de publicar um arquivo por ticket, confirmar: a granularidade está adequada; os bloqueadores são somente os necessários; algum ticket deve ser unido/dividido; as regras propostas acima representam o produto desejado. Principalmente profundidade do briefing, frequência/dias, comemorações extras, pendentes na finalização e data/horário para converter propostas temáticas.

## Resultado desta preparação

Inspeção estática do código e de contratos locais, com duas revisões auxiliares somente de leitura. Atualização posterior em28/10 incorporou pedido explícito de busca/menu para toda a equipe, botão junto ao nome do parceiro e escopo/seletor pela URL, concentrados em01 sem novos bloqueadores. Nenhuma alteração funcional, SQL, chamada real de IA, teste/build, commit ou publicação. Proposta documental preparada para revisão; depois da aprovação, publicar os sete arquivos individuais no tracker local com o template da skill, bloqueadores, critérios e fronteiras descritos aqui.
