# Planejamento de redes sociais — proposta de tickets

Atualização posterior em01/11: proprietário pediu somente registrar o [ticket00 — alinhar interface ao mockup](../../.scratch/social-planning/issues/00-align-page-with-approved-mockup.md), para execução por outro agente. Inclui Por período/Por tema, slider semanal, dias e Direcionamento com componentes reais. São agora oito tickets,00–07; sequência começa `00 → 01`, sem renumerar os existentes. Nenhuma implementação desta correção visual foi iniciada. O ticket01 individual depende de00; detalhes históricos abaixo permanecem como registro anterior.
Avanço limitado em01/11: casca visual e acessos de navegação/seleção preparados em `/app/planejamento`. Busca, menu comum e botão contextual no parceiro usam as guardas vigentes; o slug é limitado aos parceiros disponíveis. Página limpa em duas colunas, sem cartões decorativos; geração desativada e prévia vazia. `/dash` teve somente o cabeçalho alinhado em uma linha. [Escopo e limites entregues](social-planning-design-decisions.md#acessos-e-estrutura-limpa-preparados--0111). Ticket01 continua incompleto: sem geração, dados, persistência, sugestões ou calendário funcional; demais tickets não iniciados.

Mockup solicitado em01/11/2026 para avaliar o fluxo: [alternativas e limites](social-planning-mockup.md). Proprietário escolheu a **Mesa de planejamento**, configuração à esquerda e visualização à direita, para computador/telas amplas, sem adaptação mobile nesta versão. [Decisões de interface e componentes](social-planning-design-decisions.md) prevalecem sobre o estudo anterior; não representam aceite de todas as regras abaixo nem início de implementação.

Preparada em 28/10/2026 e ajustada após revisão do proprietário em01/11. **Estado: oito tickets publicados no tracker local,00–07** ([índice](../../.scratch/social-planning/README.md)); não são issues externas nem autorização de execução. A casca de página/acessos/seleção já foi preparada;00 corrige a fidelidade visual antes de01, que segue incompleto; os demais ainda não foram executados.

Destino dos arquivos individuais: `.scratch/social-planning/issues/`. A publicação local não inicia sua execução nem autoriza SQL remoto, chamadas reais de IA, commits ou deploy.

## Decisões confirmadas pelo proprietário

- Planejamento exclusivo de redes sociais, por cliente comercial da agência: **partner**, e não conta externa **client**.
- Planejamento acessível a todos os membros da equipe, não somente administradores: comando na busca global, item no menu superior e botão com ícone ao lado do nome do parceiro na página dele.
- Página de Planejamento funciona por parceiro e mantém sua identidade na URL. Entradas com parceiro conhecido já o selecionam; sem parceiro definido, a página oferece seleção entre os parceiros disponíveis ao usuário.
- Interface única: Mesa de planejamento, com configuração/criação e visualização/revisão lado a lado. Exclusiva de computador/telas amplas; tablet apenas com espaço para a mesma composição. Mobile fora do escopo, sem empilhar colunas ou criar versão compacta. Largura mínima numérica ainda não definida pelo proprietário.
- Planejamento é outra página interna de `/app`, usando exatamente o layout e o cabeçalho global existentes. A Mesa ocupa somente seu conteúdo; não criar um shell ou topo exclusivo. O calendário é o existente no app, preservando controles/ajustes laterais e rolagens vertical e horizontal.
- Reutilizar componentes do app e o Prism. Lacuna concreta pode ser suprida por fonte externa/CDN, incorporando e adaptando o componente ao Prism e à galeria, sem adotar um design system paralelo nem instalar dependências nesta preparação.
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

## Divisão aprovada e publicada

Cada ticket inclui persistência, autorização, interface e verificação das partes que modifica. Não há ticket separado de banco/API/testes nem refatoração ampla prévia. Extrações pequenas necessárias ficam na entrega que as utiliza.

### 01 — Gerar e reabrir uma proposta por tema

**Blocked by:** 00 — Alinhar a interface ao mockup aprovado; início também condicionado às definições pendentes P1.

**What to build:** Abrir Planejamento pela busca global, pelo menu superior ou pelo botão ao lado do nome do parceiro; selecionar um parceiro quando necessário, informar tema/direcionamento e quantidade, gerar uma proposta usando a base existente, visualizar a análise e a lista, sair e reabrir o resultado salvo.

- [ ] Comando Planejamento no grupo comum da busca global e item Planejamento no menu superior, disponíveis para membros comuns e administradores. Não condicionar esses acessos a permissão administrativa, nem colocá-los apenas no grupo Admin. Preservar navegação com guardas das ações abertas; bloqueio mantém a tela/busca/rascunhos existentes. Comando é navegação, não abre ação secundária por Shift nem gera proposta ao ativar.
- [ ] Botão com ícone de planejamento imediatamente ao lado do nome do parceiro na página operacional dele, com nome acessível/tooltip Planejamento, foco visível e uso por teclado. Leva à mesma página de Planejamento com aquele parceiro na URL; não depende de ser administrador. Preservar o layout existente da página do parceiro; esse acesso não implica suporte mobile ao workspace.
- [ ] A página usa exclusivamente a Mesa de planejamento: configuração à esquerda, visualização à direita; sem seletor Etapas/Mesa no produto. Definir e documentar largura mínima com base nos componentes reais. Abaixo dela, somente aviso para usar tela mais ampla; redimensionar não apaga rascunhos nem repete operações. Não implementar layout mobile ou empilhamento de colunas. O botão contextual da página do parceiro continua respeitando o layout existente dessa página; não exige adaptar o workspace ao telefone.
- [ ] Montar somente o conteúdo de uma página interna no layout atual do app. Preservar o cabeçalho global, logo/busca/menu, AppBar, contêineres e padrões de margens/rolagem existentes, acrescentando apenas os acessos solicitados. Título e seletor de parceiro são controles locais da página, não uma nova barra superior. O aviso de largura ocupa só a área de conteúdo.
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
- [ ] Verificar os três acessos com membro comum e administrador, contexto com/sem parceiro, seleção/URL, link direto/recarga/Voltar, parceiro inacessível, zero parceiros e resposta antiga após troca. Conferência visual pelo proprietário em largura suportada e teclado; abaixo do limite, conferir apenas aviso/preservação de estado. Automatizar os caminhos de escopo/sessão pelo risco concreto, sem exigir uma matriz mobile. Nenhum acesso apenas navega para cadastro administrativo ou grava ações/propostas ao abrir.
- [ ] Controles usam componentes Prism/Uzzina existentes. Se faltar um primitivo, incorporar/adaptar ao Prism somente a implementação necessária, documentando fonte externa/CDN e adicionando exemplo à galeria. Não transplantar CSS/controles HTML do mockup para produção nem executar componentes remotos em substituição aos do app.

**Fronteira:** dono do núcleo da feature, do conteúdo da página dentro do layout atual do app, dos três acessos, seletor/escopo pela URL, contrato e armazenamento iniciais. Integrar busca/menu/página de parceiro nesta primeira entrega, sem redesenhar cabeçalho/shell e preservando alterações externas nesses componentes. Não implementar revisão completa, calendário ou conversão antecipadamente. Ao encerrar, documentar comandos e revisões que as extensões vão consumir.

### 02 — Revisar sugestões e salvar decisões

**Blocked by:** 01 — Gerar e reabrir uma proposta por tema.

**What to build:** Abrir uma sugestão, editar seus campos, datá-la e marcar pendente/aprovada/rejeitada, retomando a revisão posteriormente com tudo preservado.

- [ ] Editor próprio da sugestão com título, briefing/objetivo, formato e data opcional; não abrir a gaveta de uma ação fictícia nem gravar ações ao revisar.
- [ ] Aprovar, rejeitar e voltar a pendente são persistidos; contadores/lista refletem apenas confirmação. Falha conserva edição e oferece nova tentativa.
- [ ] Estado rejeitado pode ser ocultado da programação e consultado por filtro; rejeitar não exclui definitivamente o item. Data ausente fica visível como Sem data.
- [ ] Comando de mudança de data reutilizável pelo calendário posterior, com validação de intervalo quando o planejamento tiver período. Não depende do ticket03 para editar data de uma proposta temática.
- [ ] Revisão de versão impede sobrescrita silenciosa por outra aba. Troca de proposta/identidade e respostas antigas não alteram o detalhe seguinte. Formulário preserva foco/edição e indica mudanças não salvas ao sair.
- [ ] Guardas e servidor/banco recusam alteração de propostas já finalizadas e escopo revogado. Não usar estado de aprovação como fase da ação.
- [ ] Verificações pertinentes ao risco cobrem salvar/reabrir, decisão reversível, data válida/inválida, falha/retry, conflito, pendentes/rejeitadas e sessão. Roteiro curto ao proprietário confere editor, foco, teclado e temas dentro da Mesa em largura suportada; sem versão compacta/mobile.

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

**What to build:** Alternar lista/calendário da mesma proposta usando o calendário existente no app, com seus controles/ajustes laterais e rolagens vertical e horizontal; mudar datas por arraste ou editor, mantendo a revisão persistida e sem tocar em ações reais.

- [ ] Usar identidade/decisão/data das sugestões, nunca IDs falsos ou casts para ação. Lista e calendário mostram o mesmo resultado confirmado.
- [ ] Abrir item usa o editor de02; aprovadas/pendentes distinguíveis, rejeitadas fora da programação ativa com acesso por filtro/lista, itens sem data em área identificada.
- [ ] Movimento persiste apenas a sugestão. Falha desfaz somente o preview daquela operação; conflito não restaura snapshot completo sobre edições posteriores. Troca de sessão cancela efeitos locais antigos.
- [ ] Data pode ser alterada por teclado/formulário, sem depender do arraste. Preservar briefing, formato e decisão. Se o planejamento tiver período, bloquear destino externo, inclusive dias extras visíveis nas bordas do mês.
- [ ] Reutilizar o calendário existente do app, incluindo controles, ajustes laterais, dimensionamento e rolagens vertical/horizontal no espaço da coluna direita. Não substituir pela grade do mockup, comprimir a grade para caber à força ou criar um calendário paralelo. Se houver acoplamento às ações, adaptar a fronteira de dados/eventos ou extrair somente o compartilhamento necessário, preservando os consumidores atuais; não criar um motor genérico nem invocar mutações de ações reais.
- [ ] Ao ajustar lateralmente o calendário ou percorrer seu conteúdo nos dois eixos, preservar edição/decisões/datas e o cabeçalho/layout globais do app. Conferência visual do proprietário inclui alcançar as extremidades da grade e os controles existentes, sem clipping e sem trocar a rolagem do calendário por expansão descontrolada da página.
- [ ] Funciona com propostas temáticas datadas, portanto não depende de03 nem05. Ao integrar03/05, conferir intervalo e extras nos mesmos comandos.
- [ ] Verificar alternância, movimento/salvar/reabrir, erro/retry/conflito, itens sem data, teclado, limite de intervalo e temas dentro da Mesa em largura suportada. Automatizar somente o necessário ao risco dos movimentos/persistência e ausência de POST/PATCH em ações; preservar calendários existentes afetados. Sem calendário mobile, gestos de telefone ou substituição das colunas por abas.

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
00 → 01 ──┬── 02 ──┬── 06
          │        └── 07
          ├── 03 ────── 05
          └── 04
```

Exemplo com dois executores, sem transformar a ordem sugerida em bloqueio artificial:

| Etapa              | Executor A | Executor B                          |
| ------------------ | ---------- | ----------------------------------- |
| Interface          | 00         | Sem escrita; pode revisar contratos |
| Base               | 01         | Sem escrita; pode revisar contratos |
| Primeira fronteira | 02         | 03                                  |
| Segunda fronteira  | 04         | 06                                  |
| Terceira fronteira | 05         | 07                                  |

- **Um escritor por checkout.** Paralelismo exige branches/worktrees separados e base comum contendo os bloqueadores integrados. Estar na mesma sessão/chat não permite dois executores editarem a mesma pasta.
- Contrato/revisão/operações centrais estabilizados em01; cada extensão usa pontos existentes e acrescenta módulo/controlador próprio, sem reescrever o núcleo em paralelo. Mudança necessária nesse contrato é coordenada antes de ambos prosseguirem.
- Busca global, menu superior e botão da página do parceiro pertencem somente a01; os demais tickets entram na página de Planejamento existente, sem abrir frentes paralelas nesses pontos compartilhados. Todas as extensões respeitam parceiro autorizado na URL e descartam resultados anteriores ao mudar de parceiro.
- Banco/migrations, tipos gerados, árvore de rotas, documentação compartilhada e manifestos exigem integração serial por um responsável; não aplicar SQL remoto em paralelo. Verificar novamente o catálogo/histórico parcial antes de qualquer rollout.
- Migrations de02 e03, se necessárias, devem ser aditivas e não substituir mutuamente a mesma função/tabela de forma incompatível. A rota/entrada pública criada em01 é preservada.04 estende configuração,05 estende geração,06 consome revisão e07 consome conversão.
- Após integrar um par, rodar verificações do diff integrado e casos cruzados. Cada ticket testa sua própria entrega; o calendário não serve como justificativa para adiar testes de revisão, nem a finalização para adiar autorização/persistência da proposta.
- Dependências satisfeitas tornam um ticket elegível, não iniciado automaticamente. Não implementar este plano ou tarefas adjacentes sem autorização de execução.

## Verificação exigida em cada entrega futura

- Testes no código real proporcionais ao comportamento; conferência de HTTP controlado, persistência/autorização SQL e qualidade real de IA são evidências distintas.
- Formatar arquivos alterados; lint/typecheck e automação conforme risco concreto e AGENTS vigente. Build ao publicar e teste serverless antes de push que alcance APIs/imports/dependências. Nova API também entra na verificação de empacotamento, preservando os casos anteriores. Aparência é validada pelo proprietário por roteiro curto, sem suite automática por rotina nem aceite visual inferido de suite verde.
- A interface de todos os tickets segue a Mesa de planejamento dentro do layout atual do app, com seu cabeçalho global e componentes Prism/Uzzina. Calendário existente, ajustes laterais e rolagens nos dois eixos são obrigatórios. Desktop/telas amplas são o alvo; abaixo do limite conferir somente aviso e preservação de estado. Não criar versão mobile, empilhamento, atalhos gestuais ou tratamento de teclado virtual nesta feature.
- Não usar dev habitual, ligado à produção, para fixtures reais de escrita. Banco descartável e HTTP/provedor controlados para automação; uso real de banco/provedor só com escopo autorizado.
- Autorização efetiva, revisão de versão, geração de sessão, falhas/retry e limites de payload/quantidade pertencem a cada caminho que os introduz. Testar HTML/texto gerado sanitizado e sem interpretar conteúdo da marca como comandos privilegiados.
- Atualizar CURRENT e contratos/KIs pertinentes quando houver implementação de models/tabelas/fluxos, além de galeria se criar componentes Prism/Uzzina. SQL preparado, SQL aplicado, frontend local e deploy Ready registrados separadamente.

## Contexto técnico inspecionado

### Estado implementado no shell — 01/11

Os acessos e a seleção de parceiro descritos no ticket01 estão preparados na interface. A busca/menu preservam o parceiro disponível quando acionados dentro do contexto desse parceiro; seleção da página escreve o slug na URL, sem usar o filtro de busca. O botão contextual chama a guarda de saída da gaveta. A página não consulta parceiros, porque usa somente `AppContext`; slug indisponível deixa a seleção em branco. Geração, IA, banco, calendário existente e persistência continuam fora da implementação atual. O cabeçalho `/dash` mudou apenas visualmente.

- Parceiro já armazena Contexto e Tom de Voz. Administração atual conserva seu fluxo de edição; não precisa de um novo cadastro de ofertas para este recorte.
- Busca já separa comandos comuns e administrativos, e navegação com ações abertas tem guardas. Menu superior também possui seção administrativa; Planejamento deve ficar no acesso comum em ambos. Botão contextual é na página operacional do parceiro, não em sua edição administrativa.
- IA atual aceita quatro intenções e respostas fechadas; planejamento requer resposta própria variável. A autorização de um parceiro específico e leitura server-side da base devem fazer parte do novo caminho.
- Criação atual de ação faz um INSERT novo a cada chamada, sem vínculo com sugestões. A finalização não pode depender apenas de botão desabilitado ou memória do navegador.
- Calendário/arraste existentes usam ações e mutações reais; reutilizar diretamente uma sugestão como ação produziria risco de gravação antecipada. Por isso a extração, se necessária, fica dentro de06.
- Comemorações existentes têm data completa, sem contrato de repetição anual.
- Nenhum schema/fluxo de Planejamento foi encontrado ou implementado nesta inspeção. Nenhuma necessidade concreta de refatoração prévia ampla foi identificada.

## Revisão concluída e definições pendentes

A divisão inicial de sete entregas recebeu depois o ticket00 visual, solicitado explicitamente pelo proprietário. Publicar os arquivos locais não converte as regras propostas em decisões nem libera execução. Os tickets identificam somente as definições que bloqueiam seus recortes, incluindo profundidade/campos, compartilhamento, contagem em semanas incompletas, distribuição, extras, tratamento de pendentes e data/horário. Valores 50/10/90 e 11h permanecem propostas, sem uso como requisito aprovado.

## Publicação documental

Índice e oito arquivos individuais (00–07) publicados em `.scratch/social-planning/`; divisão e pendências atualizadas neste documento. A página shell, acessos e seleção pela URL já existem conforme o registro acima, mas a fidelidade dos controles ao mockup será tratada em00. Esta rodada foi somente documental: sem código, testes/build, banco/IA, SQL, commit ou deploy. Tickets status `needs-product-decision` aguardam definições descritas individualmente; nenhuma execução é inferida.
