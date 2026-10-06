# Novo UZZINA — documento de transição

**Estado:** contexto histórico e técnico. As decisões de produto mais recentes estão em `DIRECAO-V1.md`, no projeto novo, e prevalecem sobre hipóteses deste documento.  
**Origem:** conversas de setembro de 2026 e auditoria do UZZINA atual.  
**Uso:** copie este arquivo para a raiz do novo projeto antes de iniciar o desenho. O projeto atual continua funcionando como referência; não se deve interpretar este documento como autorização para alterá-lo ou migrar dados.

## 1. Por que começar um projeto novo

O objetivo não é apenas corrigir defeitos do UZZINA atual. O problema central percebido pelo criador é que o produto organiza muitas informações, mas nem sempre ajuda a decidir o que fazer. A nova versão deve nascer de uma arquitetura mental diferente e pode reaproveitar ideias, dados, comportamentos e componentes do sistema atual **se eles servirem a esse novo modelo**. Não copiar a estrutura existente como ponto de partida obrigatório.

Manter o UZZINA atual operacional enquanto a nova versão é concebida e construída. Uma migração ou troca de produção só será decidida depois, com atenção especial à compatibilidade dos dados e à separação dos ambientes.

## 2. Evidência de uso que deve guiar o produto

- O criador usa um **caderno como controle pessoal diário**. Cada item mostra somente **nome do parceiro/cliente e título da ação**. Os itens são distribuídos em **grade**; cada dia recebe uma **cor diferente**. O caderno fica à vista durante o trabalho. Quando precisa do contexto, ele abre a ação no app, usa outra ferramenta ou produz o material. O ato de escrever o ajuda a pensar com clareza.
- A visualização **Hoje** do UZZINA nasceu desse caderno e é a que ele mais usa. Ele valoriza tanto a visão ampla da agência quanto a possibilidade de ver somente o essencial.
- A página do cliente/parceiro é usada principalmente para **planejamento concentrado naquele cliente**. Em vez de ser uma área principal separada, seu contexto pode ser obtido por filtro na área principal.
- **Todas as ações exibidas no Hoje do app entram no caderno**, que geralmente é mais completo. O criador escolhe a ordem de prioridade. A diferença entre os dois conjuntos está nos itens adicionais do caderno, ainda não caracterizados. Se uma ação não é feita, ela permanece atrasada. Não impor automaticamente um limite de itens nem uma curadoria manual antes de entender de onde vêm os itens adicionais e como a prioridade é escolhida.
- A aplicação serve também à equipe. O foco pessoal do criador não deve ser confundido com a visão de coordenação da agência nem copiado como obrigação para todos os papéis.
- A experiência rápida da SPA atual é um requisito percebido pelo criador. Uma implementação anterior com React Router 7 Framework Mode buscava dados novamente ao mudar de página e pareceu mais lenta. Não presumir que SSR ou outro framework resolverá isso sem medir o fluxo completo.

## 3. Histórico da hipótese de arquitetura mental

**Decisão posterior do usuário:** a primeira versão terá uma página principal única. A home abre em **Hoje**, direto e objetivo. Abas dão acesso às outras visualizações e um filtro de cliente altera o escopo sem exigir uma página própria de cliente. Ver `DIRECAO-V1.md`. A tabela abaixo registra o raciocínio anterior, não um conjunto obrigatório de três áreas.

Uma **área operacional principal única** pode substituir a separação atual entre home e página do cliente. O usuário começa pela intenção, não por uma lista de páginas:

| Visão/intenção | Pergunta principal | Densidade inicial |
| --- | --- | --- |
| Meu dia | O que preciso acompanhar ou fazer agora? | Mínima; parceiro + título da ação, detalhes ao abrir. |
| Operação | O que acontece na agência, quem está responsável e o que está parado? | Mais ampla; lista, quadro, filtros e pendências conforme a necessidade. |
| Planejamento | Como distribuir o trabalho no tempo? | Calendário por semana ou período mensal, com contexto de cliente. |

**Cliente/parceiro, responsável e período** são contextos/filtros que podem atravessar essas visões. Selecionar um cliente em Planejamento deve permitir o foco que hoje exige abrir sua página. Preservar URLs profundas para compartilhar ou retornar diretamente a uma combinação de visão, cliente e período, mesmo que visualmente exista apenas uma área principal.

Não assumir que três abas literais são a solução final. Validar com tarefas reais: executar o dia, descobrir um bloqueio da equipe, planejar um cliente, reagendar uma ação e recuperar algo antigo. O fluxo e a clareza importam mais que o formato de navegação.

**Conceitos a manter separados no modelo:** estado do trabalho, data/prazo, responsabilidade, contexto do cliente e foco pessoal. Uma ação pode estar atrasada, depender de outra pessoa e não ser algo que o usuário executará hoje. Não codificar essas dimensões em um único status.

### Regra de calendário

O criador planeja por **semanas completas**, inclusive quando o período atravessa os limites do mês. Mostrar dias do mês anterior/seguinte é intencional. Tornar isso compreensível na interface, por exemplo com título de período e distinção visual dos dias externos. A semana mencionada é de **domingo a sábado**; confirmar com o usuário se há situações em que ele também quer enxergar o domingo seguinte no mesmo bloco. Exemplo confirmado: 30/09/2026 é quarta-feira; essa semana termina sábado, 03/10; domingo, 04/10, começa a semana seguinte.

## 4. Direção tecnológica acordada

**Não trocar de framework só para parecer mais moderno.** A base preferida para começar é uma **SPA** com React, TypeScript, Vite, TanStack Router, TanStack Query, PostgreSQL/Supabase e Vercel. A SPA deve continuar rápida. SSR não é requisito de segurança; segurança depende de autorização, políticas do banco, validação e proteção de segredos.

- Carregar no contexto principal apenas identidade, permissões e dados pequenos reutilizados, como parceiros/clientes. Categorias e fases estáveis podem permanecer em constantes de código, com identificadores duráveis e migrações para alterações que afetem registros existentes.
- Buscar ações por contexto e período, com cache cujas chaves representem os parâmetros reais. Evitar refazer consultas sem necessidade ao alternar visões; evitar também baixar todo o histórico na entrada.
- Manter uma **camada de servidor** para administração, integrações, IA, segredos, autenticação de serviços e operações privilegiadas. Leituras diretas via Supabase podem permanecer apenas com grants e RLS verificáveis. Nunca confiar em filtro visual como autorização.
- Redesenhar o acesso de clientes. O fluxo customizado atual não deve ser copiado como base de segurança. Modelar identidades, sessões, papéis e acesso por cliente de forma explícita e testar tentativas de acesso cruzado.
- Versionar o esquema do banco e suas políticas com migrações. Criar ambientes de desenvolvimento/preview separados da produção. Não executar migrações incompatíveis contra o banco usado pelo app antigo durante a convivência das versões.
- Adicionar testes de alto valor: permissão de equipe/cliente, criação e edição, limpar um campo, falha de salvamento, filtros e período. Vitest para regras de domínio; Playwright para fluxos reais no navegador. Acrescentar CI para lint, tipos, testes e build, incluindo as funções de servidor na checagem de tipos.
- Registrar erros de cliente e servidor e falhas de sincronização, sem expor tokens ou dados sensíveis.

### Componentes e interações

- **Base UI com componentes shadcn/ui é a primeira candidata para componentes novos**, por simplicidade de composição. Preservar componentes React Aria existentes quando funcionam bem; comparar Base UI, React Aria e, se necessário, Radix em componentes difíceis antes de escolher. Não migrar a biblioteca inteira sem prova. O Prism pode permanecer como camada visual/padrões do UZZINA, menor e mais coerente.
- **dnd-kit continua a primeira escolha para calendário e quadros customizados.** Avaliar o DnD do React Aria para listas/tabelas simples, onde sua integração com coleções e teclado pode ajudar. Verificar acessibilidade por teclado em qualquer opção.
- **Tiptap continua candidato para briefing e conteúdo rico.** Ações rápidas, título e notas simples não devem exigir a interface do editor completo. Antes de trocar de editor, definir que tipos de texto o produto realmente precisa e quais recursos são usados.
- **Cloudinary continua como escolha prática de mídia** enquanto transformação, corte e widget forem úteis. Preferir upload direto do navegador com assinatura emitida por servidor autenticado. Não enviar o arquivo através de uma Vercel Function: o payload de funções tem limite documentado de 4,5 MB. Bunny pode ser avaliado novamente por controle/custo, mediante prova de upload direto seguro para imagens e vídeos reais; não voltar ao caminho que atravessava a função Vercel.

### Integrações futuras, sem antecipá-las no núcleo

1. **Instagram — leitura de métricas e relatórios:** conexão autorizada de contas profissionais, tokens protegidos, coleta no servidor, histórico e data da última sincronização. Validar permissões e métricas disponíveis com conta real antes de prometer relatórios.
2. **Programação de conteúdo:** distinguir planejamento no calendário de **publicação automática**. A segunda precisa de autorização da Meta, estados de publicação, tentativas após falha, prevenção de duplicidade e registro do resultado. Não acoplar publicação automática diretamente ao calendário desde o começo.

## 5. O que o repositório antigo oferece

Usar o UZZINA atual como **referência observável**, não como arquitetura a preservar. Examinar fluxos, exemplos de dados, componentes, regras e vocabulário. Componentes grandes de ação e calendário podem ser reaproveitados por partes ou documentar comportamentos que não podem se perder. Não importá-los em massa: isso traria para o projeto novo a mesma concentração de responsabilidades.

A auditoria original está em `docs/audits/2026-09-26-analise-uzzina.md` **neste repositório antigo**. Ela contém achados de segurança, salvamento, cache, UX e manutenção. É um inventário de riscos e evidências do sistema antigo, **não um backlog obrigatório para corrigir o antigo antes de começar**. Revalidar os achados relevantes ao projetar cada nova fronteira.

## 6. Perguntas abertas para a próxima conversa

1. Reconstruir um dia real: quais itens do caderno já apareciam no Hoje do app, de onde vieram os itens adicionais e como o criador escolheu a ordem de prioridade?
2. Quais decisões só o criador toma, quais a equipe toma sem ele e quais dependem de cliente?
3. Quando uma ação passa de ideia/pedido para compromisso? O que precisa estar definido nesse momento?
4. O que a visão Operação precisa mostrar para indicar bloqueio ou espera sem poluir Meu dia?
5. Ao filtrar um cliente, quais controles e informações precisam continuar visíveis? O filtro deve persistir ao trocar entre Meu dia, Operação e Planejamento?
6. Qual é a definição exata de “semana completa” no planejamento e o que deve acontecer na virada do mês?
7. Quais interações atuais são realmente indispensáveis: quadro, feed, arrastar no calendário, editor rico, upload, portal do cliente?
8. A nova versão usará outro banco de testes durante a construção? Como os dados reais serão migrados e verificados antes de qualquer troca de produção?

## 7. Primeira atividade no projeto novo — substituída pela direção V1

Construir uma primeira versão da home única descrita em `DIRECAO-V1.md` e avaliar o comportamento com uso real. A análise do caderno e os episódios abaixo são contexto opcional para ajustes; não são pré-requisitos para começar.

---

## 8. Instruções para quem conduzir o projeto novo

Você está ajudando a **descobrir e especificar um produto novo**, não recebendo uma tarefa para criar imediatamente um aplicativo. O dono do produto conhece profundamente a operação da agência, mas parte do conhecimento está implícita na rotina e no sistema atual. Sua primeira responsabilidade é tornar esse conhecimento explícito e ajudá-lo a escolher, com crítica honesta. Não responda apenas com perguntas genéricas, um framework de produtividade pronto ou uma lista de funcionalidades.

Trabalhe em português do Brasil. Em cada conversa, faça uma síntese curta do que foi confirmado, do que ainda é hipótese e de qual decisão precisa ser tomada em seguida. Faça perguntas concretas sobre episódios reais; duas ou três por vez bastam. Quando o usuário responder, avance com um modelo provisório e exemplos de comportamento do produto. Aponte conflitos e consequências sem tratar as preferências dele como defeitos ou presumir que um diagnóstico pessoal explique todos os problemas de UX. **O caderno é evidência do que funciona para ele, não um recurso que o app precisa eliminar.**

O repositório antigo pode ser lido em `/Users/euchicosousa/vercel/uzzina`. Antes de afirmar que uma função existe, não existe ou opera de certa maneira, verifique o código ou a interface, conforme a afirmação. Distingua rigorosamente observação, inferência e proposta. O documento de auditoria nesse repositório é uma fonte para perguntas e limites de confiança. Há conclusões daquela auditoria que foram refinadas na conversa: por exemplo, mostrar semanas completas que atravessam meses é **intencional**; o problema possível é o rótulo de métricas ou a interpretação de um período, não a presença dos dias externos no calendário.

Não avance sozinho para código, telas finais, migração de banco ou deploy enquanto a arquitetura mental estiver em discussão. Quando houver acordo explícito sobre um fluxo, registre-o em uma especificação curta com: objetivo da pessoa, entrada, decisão, resultado, exceções e permissões. Registre também o que foi deixado de fora. Não transformar toda sugestão em requisito.

### Como manter continuidade no novo repositório

Ao longo da discussão, crie ou atualize arquivos de trabalho no novo projeto, por exemplo:

| Arquivo | Conteúdo esperado |
| --- | --- |
| `docs/decisoes.md` | Decisões confirmadas, motivo, data e consequências. |
| `docs/hipoteses.md` | Ideias ainda não validadas, como avaliá-las e o que as refutaria. |
| `docs/rotinas-reais.md` | Casos reais narrados pelo usuário; preservar fatos sem convertê-los prematuramente em interface. |
| `docs/fluxos.md` | Passos do trabalho para criador, equipe e cliente; estados de erro e espera. |
| `docs/modelo-do-trabalho.md` | Definições de ação, conteúdo, compromisso, prazo, publicação, aprovação e responsabilidade quando forem decididas. |

Esses nomes são sugestões de organização, não autorização para preencher os arquivos com suposições. O agente deve confirmar com o usuário o significado de um conceito antes de registrá-lo como decisão.

## 9. Situação atual: mapa funcional para orientar a investigação

O app atual atende membros da agência em `/app` e clientes externos em `/dash`. O núcleo visível gira em torno de **ações** associadas a um ou mais parceiros/clientes. Há página inicial com seções de sprint, Hoje, calendário, parceiros e atrasos; quatro modos de mostrar Hoje; página de parceiro voltada a calendário e feed; gaveta de edição com campos essenciais, texto rico, mídia/Instagram e observações; ações de lote; portal de cliente; usuários, clientes e parceiros na administração; leads; IA auxiliar. A lista descreve o legado, **não o escopo obrigatório do novo produto**.

Alguns pontos específicos do legado são bons casos de investigação:

- A mesma ação aparece em várias visões e pode aparecer em mais de um grupo de parceiro. Isso pode ajudar em vistas contextuais, mas também aumentar a sensação de volume. Perguntar em que situações a repetição ajuda e em quais confunde.
- A data da ação atualmente participa de planejamento, prazo, atraso, calendário e comunicação de publicação. Descobrir quais dessas datas são de fato distintas na operação antes de decidir o novo modelo.
- As fases atuais incluem Ideia, Fazer, Fazendo, Análise, Feito e Concluído. Descobrir o que cada passagem significa para cada tipo de trabalho; não presumir que todo trabalho precise das mesmas fases.
- “Sprint” no legado parece atuar como lista pessoal de foco mais do que como um ciclo de trabalho formal. Descobrir se o novo produto precisa de foco pessoal, de ciclos da equipe ou de ambos.
- “Enviar para aprovação” no legado funciona essencialmente como compartilhamento de um link de revisão, sem registrar uma decisão formal de aprovação. Investigar o que a agência e o cliente realmente fazem antes de construir um fluxo de aprovações.
- Categorias atuais reúnem formatos, tipos de trabalho e áreas. Perguntar o que a equipe tenta descobrir quando usa uma categoria, antes de reproduzir a taxonomia.
- A home mostra várias seções e métricas, mas uma pessoa ainda precisa decidir o que merece atenção. Investigar que sinais deveriam alterar uma decisão e quais são apenas informação de fundo.

### Papéis a considerar, sem inventar uma hierarquia completa

**Criador/gestor:** precisa produzir trabalho próprio, enxergar o dia de forma calma e também coordenar a agência. Esses dois modos não devem ser forçados à mesma densidade visual.

**Colaborador:** precisa saber o que lhe cabe, qual resultado é esperado, onde está o material e o que fazer quando está bloqueado ou aguardando alguém. Não pressupor que sua visão de Hoje seja idêntica à do gestor.

**Cliente:** pode precisar ver entregas, comentar ou aprovar, mas essas são capacidades diferentes. Confirmar o que o cliente precisa fazer e o que não deve enxergar antes de desenhar o portal e as permissões.

Outros papéis e diferenças de acesso só devem ser criados quando uma situação real exigir.

## 10. Roteiro de descoberta: primeira fase, antes da interface

Conduza a conversa em **episódios reais**, não em preferências abstratas. Um episódio deve ter situação inicial, atores, sequência de ações, decisão, resultado e exceções. O propósito é revelar os critérios de escolha que hoje vivem fora do aplicativo.

### Episódio A — um dia de trabalho do criador (referência opcional)

Peça que ele descreva um dia recente, sem exigir foto ou transcrição do caderno. Para três a cinco itens escritos nele, registre: parceiro, título, como o item chegou ao caderno, se já estava no app, por que mereceu atenção naquele dia, o que foi feito, o que interrompeu e como saiu do caderno. Todas as ações do Hoje do app entram no caderno; investigue especialmente **os itens que só aparecem no caderno**. Observe o papel da escrita manual, da grade, da cor do dia e da ordem de prioridade. Pergunte se havia itens importantes sem data naquele dia. **Objetivo:** distinguir agendamento, prazo, compromisso escolhido, lembrete e trabalho em andamento.

Não assuma que a solução é uma lista manual de prioridades, uma regra de três itens ou um algoritmo automático. Esses são mecanismos possíveis; o episódio deve revelar se são necessários.

### Episódio B — coordenação da equipe

Peça um caso em que uma entrega atrasou, ficou bloqueada ou exigiu decisão do gestor. Registre quem percebeu, como comunicou, quem tinha o próximo passo e o que o sistema mostrava. **Objetivo:** descobrir quais sinais ajudam a comandar a operação e quais geram apenas ruído.

### Episódio C — planejamento de um cliente

Peça um planejamento real de semana ou mês. Registre como escolhe o período, por que precisa ver as semanas completas, como decide datas, o que muda durante a semana e quais informações consulta fora do UZZINA. **Objetivo:** desenhar a transição entre visão da agência e foco em um cliente sem perder o contexto.

### Episódio D — produção e revisão de conteúdo

Escolha uma peça real do pedido à entrega. Registre briefing, elaboração, mídia, texto, revisão interna, cliente, ajustes, agendamento e publicação somente quando essas etapas de fato ocorrerem. **Objetivo:** separar ação operacional, conteúdo, revisão e publicação; não partir do pressuposto de que são um único registro ou que toda peça percorre o mesmo fluxo.

### Episódio E — exceção ou falha

Investigue uma edição que não salvou, uma mudança de data, uma urgência, ausência de responsável, reprovação ou arquivo substituído. **Objetivo:** definir como o produto deve mostrar incerteza, falha e recuperação, em vez de apenas desenhar o caminho feliz.

Para cada episódio, produza uma síntese curta: **fatos narrados**, **decisões invisíveis hoje**, **problemas do fluxo atual**, **hipóteses de melhoria** e **perguntas ainda abertas**. Peça correção do usuário antes de consolidar como regra.

## 11. Modelo mental a testar, não a impor

A proposta de uma área principal única com Meu dia, Operação e Planejamento é uma hipótese forte porque acompanha as intenções narradas. Teste-a contra os episódios acima. A área principal pode ter abas, alternância de modo ou outra forma de navegação. O nome da visão deve indicar **o que a pessoa consegue fazer**, não apenas como os dados são desenhados.

Requisitos de comportamento candidatos:

1. Ao abrir o app, a pessoa deve reconhecer o contexto ativo e encontrar imediatamente seu próximo trabalho ou decisão, sem interpretar cinco seções concorrentes.
2. Abrir uma ação deve revelar contexto progressivamente: título e parceiro primeiro; briefing, mídia, histórico e controles avançados quando necessários. Não esconder informação necessária para executar.
3. Trocar entre Meu dia, Operação e Planejamento não deve apagar cliente, período ou seleção sem deixar claro o que aconteceu. Confirmar se cada filtro é global, específico de uma visão ou temporário.
4. Filtrar um cliente deve mudar o **escopo** da visão atual; navegar para uma página administrativa do cliente é outra ação. Os dois gestos não devem ter efeitos ambíguos.
5. Uma ação movida ou editada precisa mostrar estado provisório, confirmação ou falha real. Se a gravação falhar, a pessoa deve conseguir recuperar a intenção sem redigitar o trabalho.
6. O sistema deve distinguir conteúdo vazio, carregamento, falta de permissão, falha de rede e ausência de resultados. Uma tela vazia não deve representar todos esses estados.
7. A interface da equipe e a do cliente devem deixar explícito **quem pode ver** uma nota, arquivo ou comentário antes de enviá-lo.

Critérios para rejeitar uma proposta de interface: exige lembrar muitos ícones ou estados ocultos; repete a mesma ação como se fossem entregas distintas; obriga o gestor a abrir várias telas para responder uma pergunta; associa automaticamente foco pessoal a toda data de hoje; faz uma mutação parecer concluída antes da confirmação; torna difícil voltar ao contexto anterior; pressupõe que todo usuário trabalha como o criador.

## 12. Perguntas de modelagem para a segunda fase

Somente depois dos episódios, defina as entidades e seus limites. Questões que devem ser respondidas com exemplos:

- Uma “ação” é tarefa, entrega, peça de conteúdo ou recipiente que mistura tudo? Quando esses conceitos precisam ser registros separados?
- Um trabalho pode pertencer a mais de um cliente? Se sim, qual é a unidade única contada nas métricas?
- O que significa escolher algo para Meu dia? É uma escolha manual, uma recomendação do app, um prazo, um lembrete ou uma combinação explícita?
- Quais datas existem: data planejada de execução, prazo interno, data combinada com cliente, data de aprovação e data/hora de publicação? Quais são opcionais?
- Quais estados são fatos do processo e quais são apenas perspectivas? “Aguardando cliente” e “Em revisão interna” podem ser diferentes de “Fazer/Fazendo”.
- O que a equipe considera “feito”, e em que momento o cliente considera concluído? Existe diferença entre peça pronta e peça publicada?
- O que deve ser versionado para uma aprovação continuar válida após uma edição?
- Qual é a relação entre uma mídia original, suas variações, a peça aprovada e o arquivo publicado?

Evite desenhar uma tabela por tela, preservar colunas antigas por conveniência ou criar uma entidade nova para cada palavra usada na conversa. Antes de fechar o esquema, caminhe por dois ou três casos reais e confirme que o modelo consegue descrevê-los sem exceções artificiais.

## 13. Requisitos de confiança para a futura implementação

Estas condições **não são trabalho para a fase de descoberta**, mas são limites para qualquer versão que venha a usar dados reais:

- Autorização deve ser verificada por identidade e escopo de cliente em cada leitura e escrita sensível. RLS e grants devem ser testados; uma função de servidor com chave privilegiada também precisa verificar permissão explicitamente.
- Login de cliente precisa produzir uma sessão verificável. Não repetir a persistência de um ID de cliente no navegador como prova de identidade.
- Segredos de IA, Meta, armazenamento e chave privilegiada do banco não podem estar no bundle da SPA.
- Mutações devem ter semântica consistente em botão, atalho, arraste e lote; confirmação visual depende de confirmação persistida. Campos limpos precisam poder ser salvos como vazios quando essa é a intenção.
- Cache deve separar usuário, cliente, visibilidade e período. Ao trocar de identidade, dados do usuário anterior não devem permanecer acessíveis pela interface ou pelo cache.
- Filtros de período precisam representar o período exibido. Calendário pode exibir semanas completas, mas métricas devem ter um significado próprio e explícito.
- Publicação automática e sincronização de métricas são trabalhos assíncronos: registrar estado, falha, atualização mais recente e tentativas sem duplicar efeitos.

## 14. O que entregar ao fim da fase de definição

Antes de iniciar a interface de produção, o projeto novo deveria conter material suficiente para que outra pessoa entenda **por que o produto será diferente**:

1. Um mapa de tarefas reais para criador, colaborador e cliente, com episódios e exceções.
2. Uma definição em uma página do propósito da área principal e das perguntas que cada visão responde.
3. Um fluxo de uma ação do surgimento ao resultado, incluindo espera, erro e abandono, sem obrigar todo trabalho ao mesmo caminho.
4. Um vocabulário confirmado: ação, conteúdo, cliente/parceiro, foco, prazo, entrega, aprovação e publicação.
5. Um protótipo de baixa fidelidade ou descrição navegável das transições entre Meu dia, Operação e Planejamento; testar com episódios antes de investir no design visual.
6. Um registro do que será preservado, refeito, descartado e adiado do app antigo, com motivo. Isso **não** significa converter os 52 achados da auditoria em 52 tarefas.
7. Uma lista curta de riscos técnicos a provar antes da implementação ampla: segurança do acesso do cliente, persistência de ações, velocidade da SPA e upload/publicação de mídia.

**Correção de direção:** o usuário não quer prolongar a investigação do caderno como condição para projetar o app. As informações acima servem de contexto, mas o próximo passo é executar a home única da direção V1. Aprender com a primeira versão em uso e ajustar.
