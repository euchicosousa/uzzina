# Matriz dos 52 achados — baseline para execução Gemini

> **Revisão posterior:** esta baseline foi preservada. Para estado observado após o executor chegar09, leia [revisão05–09](2026-10-06-revisao-tickets-05-09.md), incluindo retificação das aprovações incorretas do retorno.


Data: 06/10/2026. Fonte: `2026-09-26-analise-uzzina.md`. Leia em conjunto com `2026-10-06-execucao-gemini-pendencias.md`.

Esta é uma reconciliação documental da auditoria com as entregas/revisões registradas. Não é uma nova inspeção integral do código nem inventário do banco de produção. “Parcial / revalidar” significa que há correção relatada ou cobertura incompleta: confira a produção atual antes de alterar. “Validado localmente” não significa implantado ou aprovado em todas as camadas.

Os tickets e os achados são numerações diferentes. Os números de ticket indicam encaminhamento técnico, não encerramento automático de um achado. As decisões/regras de produto abaixo refletem o escopo autorizado do aplicativo existente e as escolhas confirmadas pelo proprietário; não executar propostas antigas em sentido contrário.

Ao final, inclua no arquivo de retorno uma linha por achado, com estado/evidência atuais. Preserve esta baseline histórica. Sugestões de produto continuam propostas, sem implementação automática.

| Achado original | Tema | Situação documental | Encaminhamento | Instrução para o executor |
|---|---|---|---|---|
| 01 | A sessão do cliente não é uma autenticação verificável pelo servidor. | Parcial | 02–04, 06–07, 17 | Sessão opaca e endpoints implementados localmente; completar contas, RLS e integração real. |
| 02 | O código ainda envia senha em claro para persistência. | Pendente / conferir implementação atual | 06 | Remover persistência de senha/hash no browser; bcrypt e revogação transacional. |
| 03 | A API de IA não verifica quem está consumindo a conta. | Parcial / revalidar | 14 | Existe restrição de acesso; completar schemas, quota persistente e falhas do serviço. |
| 04 | O SQL disponível delega confiança a parâmetros fornecidos pelo cliente. | Pendente | 07 | Inspecionar RPCs reais e derivar identidade de auth.uid(); parâmetros só restringem escopo. |
| 05 | A autorização administrativa depende de uma camada que não está documentada no repositório. | Parcial | 06–07, 16 | Guard de UI não encerra autorização; completar servidor e matriz de banco. |
| 06 | HTML persistido é renderizado sem sanitização explícita nas telas examinadas. | Validado localmente | 01, 16–17 | Preservar sanitização existente; revalidar superfícies restantes e navegador afetado. |
| 07 | Apagar certos campos não envia a limpeza ao banco. | Parcial / revalidar | 08–09, 16 | Conferir limpeza explícita de arrays/textos e omissão; não reintroduzir snapshot completo. |
| 08 | Os temas selecionados podem nunca persistir. | Parcial / revalidar | 08–09, 16 | Conferir contrato dos temas e persistência real, distinguindo temas da ação de preferências do usuário. |
| 09 | Uma criação que falha pode bloquear novas tentativas até fechar a gaveta. | Parcial / revalidar | 09 | Criação falha deve liberar nova tentativa e preservar rascunho. |
| 10 | O atalho fecha a edição antes de saber se salvou. | Parcial / revalidar | 09 | Fechamento/atalho aguarda confirmação; falha mantém texto e editor. |
| 11 | Autosaves concorrentes podem sobrescrever alterações. | Pendente | 08–10 | Fila por ação, revisão local e conflito de versão confirmado. |
| 12 | Operações em lote anunciam sucesso antes da resposta. | Pendente | 11 | Sucesso contado somente por IDs confirmados. |
| 13 | Alteração de data/hora em lote ignora erros das escritas individuais. | Pendente | 11 | Resultado individual para data/hora e conflitos. |
| 14 | A regra de concluir/arquivar não é aplicada uniformemente. | Parcial / revalidar | 10–11 | Concluir/arquivar aplica regras de foco/atrasados em todos os callers. |
| 15 | O arraste pode continuar mostrando um estado falso após falhar. | Parcial / revalidar | 10, 12, 17 | Rollback por operação e teste real de gesto depois. |
| 16 | Home e Hoje compartilham cache para consultas diferentes. | Parcial | 10, 13 | Hoje/home separados e escopo ativo corrigidos; completar cobertura de datas e demais caches. |
| 17 | Cache não separa todos os usuários e contextos de confidencialidade. | Parcial | 13, 07 | Portal e parceiros corrigidos em parte; conferir toda identidade/audiência e banco. |
| 18 | Parceiros no contexto não acompanham necessariamente as edições. | Parcial | 13 | Query reativa e arquivados corrigidos; testar troca de conta/edição/invalidação integral. |
| 19 | Busca pode responder ao texto antigo ou quebrar em ações multiparceiro. | Parcial / revalidar | 16 | Testar busca real com respostas fora de ordem e ação multiparceiro. |
| 20 | Erro e ausência de dados são confundidos. | Parcial | 09, 14, 16 | Portal distingue falha/vazio; conferir demais rotas e salvamentos. |
| 21 | A aprovação é apresentada como processo, mas implementada como documento. | Decisão de produto | Sem implantação de aprovação formal | Manter documento de revisão; não criar processo/versionamento de aprovação nesta rodada. |
| 22 | O link de revisão tem contrato de acesso e escopo inconsistente. | Pendente | 05, 07, 17 | Link limitado por token de servidor, expiração/revogação e integração. |
| 23 | Comentário da equipe é público por padrão sem escolha evidente na aba. | Parcial / revalidar | 04, 16 | Portal público filtrado/autoria no servidor; testar escolha de audiência da equipe. |
| 24 | Stories recebe experiência diferente sem justificativa de produto. | Parcial / revalidar | 16–17 | Conferir conteúdo e controles reais de Stories; geometria fica no navegador. |
| 25 | Calendário do cliente navega meses como blocos de 30 dias e tem janela fixa. | Parcial | 03, 16–17 | Calendário usa período consultado; verificar meses, anos e limites na rota real. |
| 26 | A métrica “Setembro” conta dias de agosto e outubro. | Regra esclarecida / conferir rótulo | 16 | Semanas completas são intencionais. Conferir rótulo/intervalo, sem recortar ao mês civil. |
| 27 | Uma data única mistura planejamento, prazo e publicação. | Regra preservada | 16 para rótulos existentes | Uma data de execução por ação; segunda data/publicação fica fora do escopo. |
| 28 | “Feito” e “Concluído” não explicitam a passagem final. | Regra preservada | 10–11, 16 | Feito e Concluído permanecem distintos; não fundir estados ou criar estágios por responsável. |
| 29 | “Sprint” é uma lista pessoal de foco, sem estrutura de sprint. | Parcial; produto preservado | 16 para ordenação do foco | Preservar ordem ao filtrar; manter Sprint atual, sem renomear/remover automaticamente. |
| 30 | A home coloca o trabalho em risco depois da exploração visual. | Decisão de produto | Discussão posterior | Não reorganizar blocos da home nesta execução. |
| 31 | A mesma ação se repete em vários grupos e seções. | Decisão de produto | Discussão posterior | Não alterar agrupamento/repetição multiparceiro sem decisão específica. |
| 32 | A navegação principal desaparece e depende de hover. | Parcial / revalidar | 16–17 | Botão de navegação existe; conferir teclado/toque e área real de interação. |
| 33 | Um seletor alterna entre navegar e filtrar. | Decisão de produto | Discussão posterior | Manter contrato atual de navegar/filtrar, sem nova arquitetura de abas. |
| 34 | Há excesso de decisões de apresentação na superfície principal. | Decisão de produto | Discussão posterior | Redução de controles exige escolha de UX, não faxina automática. |
| 35 | Espaço grande para estrutura e pouco espaço para informação decisiva. | Decisão de produto | Discussão posterior | Preservar estilo e densidade atuais; registrar proposta separada. |
| 36 | Estado e comandos exigem memorizar ícones. | Parcial | 16–17 | Nomes acessíveis/estado textual nos controles afetados; validação real de uso depois. |
| 37 | Atalhos dependem do mouse e podem capturar combinações indevidas. | Parcial / revalidar | 11, 16–17 | Atalhos respeitam foco/editor/modificadores; alcance real conferido no navegador. |
| 38 | Seleção em lote pode sobreviver à mudança de contexto. | Parcial | 11 | Seleção precisa considerar também parceiro/período/filtros, não apenas rota. |
| 39 | Notificações e ajuda têm caminhos incompletos. | Parcial / revalidar | 16–17 | Notificações/ajuda: comportamento existente honesto, erros e trigger corretos. |
| 40 | Responsáveis múltiplos não definem quem conduz a próxima etapa. | Regra preservada / produto posterior | Sem responsável principal novo | Múltiplos responsáveis e conclusão inteira são escolhas confirmadas; não impor dono de etapa. |
| 41 | O modelo de negócio é centrado em ações, sem entidade de projeto no esquema disponível. | Decisão de produto | Discussão posterior | Não criar entidade projeto/campanha nem migrar modelo de negócio. |
| 42 | Métricas de volume não respondem capacidade e risco. | Decisão de produto | Discussão posterior | Não adicionar esforço/capacidade/históricos como requisito dessa correção. |
| 43 | A biblioteca de UI não garante acessibilidade nos fluxos compostos. | Parcial | 09, 16–17 | Verificar foco, rótulos e teclado nos fluxos tocados; não alegar auditoria WCAG completa. |
| 44 | Mobile precisa de validação própria, não só classes responsivas. | Validação real pendente | 17 | Alguns fluxos Chromium em viewport móvel já passaram; telefone/toque e restante ainda pendentes. |
| 45 | Preferências podem sobrescrever mudanças anteriores. | Pendente | 15, 07, 17 | Persistência por patch/fila e merge autorizado no banco. |
| 46 | Duplicar não tem contrato claro de nova entrega. | Parcial / revalidar | 10, 16 | Cópia otimista e persistida coincidem; manter campos atuais sem nova decisão de produto. |
| 47 | A camada de dados tem caminhos paralelos e contratos amplos demais. | Parcial | 06, 08–13 | DTOs do portal existem; completar contratos de escrita/callers necessários, sem reescrever toda camada. |
| 48 | Banco e documentação não são reproduzíveis a partir do repositório disponível. | Parcial | 07 e migrations dos demais tickets | Sessão tem migration preparada; inventariar banco/RPCs reais e documentar o que não foi aplicado. |
| 49 | Verificações passam, mas não cobrem os comportamentos que mais importam. | Parcial | 16–17 e testes de cada ticket | APIs entram na tipagem e há testes reais novos; substituir simulações históricas e separar banco/navegador. |
| 50 | Desempenho e recuperação tendem a piorar com volume. | Medição/decisão posterior | Registrar limites observados | Paginação do portal e aviso de bundle registrados; não prometer performance nem otimizar sem medição. |
| 51 | Apenas consultar uma ação pode mudar sua última atualização. | Parcial / revalidar | 09, 16 | Abrir/fechar sem edição não envia update nem muda updated_at. |
| 52 | A lista de usuários arquivados não pode ser preenchida pela consulta usada. | Parcial / revalidar | 16 | Conferir fetchAllPeople/admin reais; seletor mantém apenas pessoas elegíveis. |
