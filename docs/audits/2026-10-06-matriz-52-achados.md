# Matriz dos 52 achados — baseline para execução Gemini

> **Baseline histórica:** estado vigente em [CURRENT.md](CURRENT.md) e correções05–09 no [fechamento](2026-10-06-fechamento-tickets-05-09.md). Ler a matriz quando necessário ao achado específico, sem reexecutar a auditoria inteira.

**Atualização11 — 07/10/2026:** achados12,13 e38 corrigidos localmente; achado14 com regra de concluir/arquivar aplicada também ao lote. Evidências e limites no [ticket11](../../.scratch/correcoes-auditoria-2026-10-06/issues/11-lote-confiavel.md). Tabela abaixo permanece como baseline histórica; isso não certifica banco/produção nem encerra outros atalhos/arrastes.

**Atualização12 — 07/10/2026:** correção local de concorrência dos arrastes, ligada aos achados de preview/concorrência. Evidências e limites no [ticket12](../../.scratch/correcoes-auditoria-2026-10-06/issues/12-arrastes-concorrentes.md); tabela histórica preservada. Não equivale a banco/produção homologados.

**Atualização13 — 07/10/2026:** troca de identidade/cache corrigida localmente, com testes de gravações antigas e navegador real controlado (equipe/portal). [Resultado13](../../.scratch/correcoes-auditoria-2026-10-06/issues/13-identidade-cache.md). Tabela histórica preservada; isolamento de banco e produção continuam pendentes.

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

## Reconciliação atual — fechamento local do17 em 07/10/2026

A tabela histórica acima não é a fila atual. Esta reconciliação usa os resultados dos tickets01–16 e a jornada adicional do17; não representa nova varredura integral de cada superfície. “Local” inclui a camada explicitada e não certifica PostgreSQL ou produção. As escolhas de produto continuam fora da fila de correções automáticas.

| Achado | Estado atual e evidência | O que ainda falta |
|---|---|---|
| 01 | Implementação local02–04 e13; cookie/identidade nos handlers e navegador controlado | Sessão/cookie/revogação reais e produção |
| 02 | Servidor de contas06; hash e revogação cobertos nos handlers | RPC transacional no PostgreSQL e implantação |
| 03 | Código14 e jornada de IA completa com HTTP controlado | Migration quota, banco e provedor reais |
| 04 | SQL07 preparado; inspeção/matriz disponíveis | Inventariar RPCs reais e executar autorização em PostgreSQL |
| 05 | Guard/API06–07; administração no navegador16/17 | RLS/grants e execução administrativa reais |
| 06 | Sanitizador01; parser do navegador e documento público17 | Demais superfícies/arquivos não certificadas; WebKit |
| 07 | Serializer08–09/16; omissão e limpeza explícita no código real | Persistência física de limpeza |
| 08 | Contrato de temas da ação08–09; testes de escrita | Persistência física; não confundir com preferências15 |
| 09 | Coordinator09 e gaveta real; recuperação de criação | Banco/recarga real |
| 10 | Fechamento aguarda save09; navegador | Conflito em duas sessões reais |
| 11 | Fila/versionamento08–10; testes e gaveta | Trigger e concorrência física |
| 12 | Lote11 conta só confirmadas; navegador | Backend real |
| 13 | Lote11 conserva falhas e conflitos por item | Backend real |
| 14 | Regras de concluir/arquivar10–11 verificadas localmente | Persistência real nos callers |
| 15 | Preview por sessão/operação12; gesto real no navegador | Touch físico |
| 16 | Keys/contextos10/13; cache no navegador | Backend real |
| 17 | Identidade/generation/cache13; troca A→B controlada | RLS e confidencialidade física |
| 18 | Parceiros reativos13; arquivados excluídos da operação | Invalidação com edição real |
| 19 | Busca16/17: resultado antigo, falha/vazio e multiparceiro no navegador | Serviço real |
| 20 | Estados de erro nas superfícies tocadas09/14/16/17 | Outras rotas não foram auditadas integralmente |
| 21 | Regra preservada: documento de revisão | Aprovação formal é decisão futura, sem implementação automática |
| 22 | Handler05 e jornada17 gerar/copiar/abrir; corrigido bloqueio por login | Token/expiração/revogação com banco real |
| 23 | DTO/autoria/audiência04; portal controlado | Escolha de audiência da equipe e tráfego real precisam validação específica |
| 24 | Stories16: abas, estratégias e controles no navegador | Aparelho físico |
| 25 | Períodos03 e calendar-period-browser | Troca de parceiro/recarga em backend real |
| 26 | Regra mantida: semanas completas | Revisão editorial do rótulo/intervalo não certificada integralmente |
| 27 | Regra mantida: data de execução | Não adicionar publicação nesta rodada |
| 28 | Regra mantida: done/finished distintos;10–11/16 | Não fundir estados |
| 29 | Sprint preservado; ordenação registrada16 | Não remover ou renomear sem decisão |
| 30 | Decisão de produto | Reorganização da home depende de escolha posterior |
| 31 | Decisão de produto | Agrupamento/repetição multiparceiro depende de escolha posterior |
| 32 | Botão de navegação; toque e percurso de busca17 | Percurso completo da navegação por teclado não certificado |
| 33 | Contrato atual preservado | Navegar/filtrar é decisão de produto |
| 34 | Decisão de produto | Redução de controles não autorizada automaticamente |
| 35 | Estilo/densidade preservados | Redesign é discussão posterior |
| 36 | Compactos com nomes/estado16; menus17 | Não é cobertura de todos os ícones do app |
| 37 | Atalhos por foco e proteção de input/editor16; lote11 | Percurso completo por teclado/aparelho |
| 38 | Seleção restrita ao recorte11; navegador | Backend real |
| 39 | Sininho vazio/data inválida16/17; foco/viewport17 | Ajuda completa não certificada |
| 40 | Regra mantida: múltiplos responsáveis, conclusão inteira | Não adicionar responsável principal |
| 41 | Modelo de ações preservado | Projeto/campanha é decisão futura |
| 42 | Decisão de produto | Capacidade/risco não implementados nesta rodada |
| 43 | Busca:12 Tabs presos no diálogo, Escape/retorno; menus/sininho17 | Gaveta e overlays restantes: ciclo Tab/foco completo; não é auditoria WCAG |
| 44 | Chromium móvel emulado nos fluxos registrados;390/360 no17 | Safari/WebKit, teclado virtual, telefone e upload físicos |
| 45 | Fila/patch/retry15; perfil e Header no navegador | Migration e merge transacional PostgreSQL |
| 46 | Duplicação10 preserva contrato e confirmação; navegador | Persistência real |
| 47 | Contratos de escrita/DTOs corrigidos06/08–13 | Não reescrever camada inteira; banco real pendente |
| 48 | Migrations e inspeção/matriz07 disponíveis | Inventário/schema real não reproduzido nem homologado |
| 49 | 249 testes de código; scripts de UI real; simuladores copiados retirados16 | Banco e aparelho continuam camadas distintas |
| 50 | Limites de volume/bundle registrados | Sem medição representativa; otimização fica posterior |
| 51 | Abertura sem edição não salva09; coordinator/gaveta | updated_at no banco real |
| 52 | fetchAllPeople/admin16/17; lista arquivada e guard no navegador | RLS/lista com dados reais |
