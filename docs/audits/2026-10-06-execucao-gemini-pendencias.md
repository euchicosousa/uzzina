# UZZINA — execução das pendências pelo Gemini

> **Histórico:** este documento registra a rodada anterior. Estado vigente e próxima leitura: [CURRENT.md](CURRENT.md); correções05–09: [fechamento](2026-10-06-fechamento-tickets-05-09.md).

> **Checkpoint após execução05–09 — 06/10/2026:** antes de continuar10, leia [revisão independente](2026-10-06-revisao-tickets-05-09.md) e trate R01–R13 com testes reais. 06–09 não estão aprovados; segurançaSQL e data/salvamento precisam correção/diagnóstico. As instruções originais abaixo permanecem válidas onde a revisão não as complementa.


Data: 06/10/2026. Destinatário: Gemini Flash usado pelo proprietário. Repositório: `/Users/euchicosousa/vercel/uzzina`. Este documento autoriza a execução das correções técnicas restantes do pacote existente. Não autoriza reconstrução, troca de stack ou implantação.

## 1. Comece aqui

Leia AGENTS.md, CURRENT.md e o ticket autorizado. A sequência completa abaixo é referência; o próximo ticket e resultado vigente estão em CURRENT. A matriz52 e fechamentos anteriores só precisam ser lidos se a tarefa envolver uma divergência com aquele histórico.

## 2. Limites e regras que precisam sobreviver

- Trabalhe no UZZINA existente, com SPA/TanStack, Supabase e Prism. Preserve cores, componentes e interações atuais. `/uzzina-2026` fica fora do escopo.
- Parceiro arquivado (`partners.archived=true`) fica fora do contexto operacional, menus, busca, home, Hoje e contagem de atrasados. Cadastro administrativo continua mostrando arquivados para consulta/reativação. Preserve caches administrativo/operacional separados. Não apagar ações para corrigir contagem.
- Ação continua ligada a parceiro(s). Mais de um responsável continua permitido. Admin enxerga trabalho dos parceiros ativos; colaborador mantém as restrições de acesso existentes. A agência pode ser seu próprio parceiro.
- A data atual representa execução. Preserve Feito diferente de Concluído e a conclusão da ação inteira. Concluídas continuam nas visualizações que já as exibem; saem de atrasados/foco conforme contrato existente.
- Preserve semanas completas domingo–sábado no calendário. Dias de meses vizinhos fazem parte do período; isso não é defeito a corrigir recortando ao mês civil.
- Criação ao sair do título continua rápida. Blur, botão Criar e atalhos devem convergir para a mesma gravação; não substituir por formulário obrigatório cheio de passos.
- Banco real/produção: prepare migrations e roteiros, mas não aplique em produção, não faça deploy e não altere registros reais. Sem acesso a banco de teste, declare integração pendente. Se houver apenas conexão de produção, não a use como banco de testes.
- Testes de IA falsificam o serviço externo; não geram consumo real. Credenciais não entram em relatórios, fixtures, patches ou logs.
- Os achados classificados como decisão de produto na matriz ficam documentados, sem novas páginas, projetos, aprovação formal, responsável principal, data de publicação, multitenancy ou remoção de funcionalidades.

## 3. Ordem de execução e condições de parada

Execute sequencialmente, fechando o código/testes de um ticket antes do seguinte:

| Ordem | Arquivo da especificação | Resultado exigido |
|---|---|---|
| 1 | `05-links-revisao.md` | Links limitados, expiráveis/revogáveis; interface migra do formato inseguro. |
| 2 | `06-contas-clientes.md` | Administração de contas/senhas no servidor, com revogação de sessões. |
| 3 | `07-autorizacao-banco.md` | Inventário/SQL/migrations e matriz real de autorização; separar preparação de execução. |
| 4 | `08-conflito-acao.md` | Versão canônica e conflito explícito; atualizar callers, incluindo anexos do portal. |
| 5 | `09-gaveta-recuperavel.md` | Criação/autosave/fechamento coordenados, rascunho recuperável. |
| 6 | `10-cache-otimista.md` | Listas recebem só ações do seu escopo e rollback não desfaz mudança posterior. |
| 7 | `11-lote-confiavel.md` | Recorte explícito, versão por ID e contagem por confirmação. |
| 8 | `12-arrastes-concorrentes.md` | Operação antiga não limpa feedback/gravação nova. |
| 9 | `13-identidade-cache.md` | Completar isolamento por conta/audiência e respostas obsoletas. |
| 10 | `14-ia-validada.md` | Entrada/saída válidas, acesso e quota persistente com falhas explícitas. |
| 11 | `15-preferencias-ordenadas.md` | Última escolha persiste, sem perder patches durante escrita. |
| 12 | `16-regressoes-interface.md` | Testar componentes reais e corrigir somente falhas comprovadas. |
| Fechamento | `17-homologacao-navegador.md` | Preparar roteiro e registrar pendências para Codex/usuário. Executar apenas o que seu ambiente permite. |

Esta execução permite continuar entre tickets, apesar da orientação antiga do README de parar após cada ticket. Mantenha os checkpoints. Quando faltar banco ou navegador, conclua código/preparação executável e marque a camada pendente; prossiga com tarefas independentes. Falta de integração não é sucesso. Um bloqueador de código real impede o ticket dependente: registre qual símbolo/contrato está ausente e não improvise uma implementação paralela.

Se o limite de contexto/tempo da sessão impedir concluir tudo, salve retorno atualizado com último ticket, arquivos alterados e próximo passo exato. Retome desse ponto; não repita a auditoria inteira. Não declarar ticket concluído só porque parou a execução.

## 4. Procedimento de TDD e qualidade dos testes

As interfaces de teste desta rodada são as prescritas nos tickets e na tabela abaixo: handlers, models, hooks/providers e componentes de produção reais. Essa delimitação já está autorizada por este trabalho. Use a skill TDD disponível; não dependa de ter skill instalada para executar os critérios aqui.

Para cada comportamento ainda defeituoso:

1. Importe o handler/model/hook/componente que o app realmente utiliza.
2. Prepare apenas a fronteira externa: SDK/banco, HTTP, Supabase Auth, relógio ou serviço de IA.
3. Escreva um teste observável com resultado literal definido pelo contrato. Execute e registre a falha atribuível ao defeito. Import quebrado/setup incorreto não é evidência de RED funcional.
4. Faça a mudança mínima na produção; repita o mesmo teste até passar.
5. Passe ao próximo comportamento. Depois execute a suíte e verificações do ticket.

Se a correção já existir, escreva/execute uma regressão e registre “implementação prévia; sem RED histórico”. Não modifique código saudável só para produzir um RED. Para um módulo novo, construa uma fatia observável por vez.

Use Bun para os testes. Para React, siga o setup de RTL/user-event/jsdom prescrito no pacote; use providers e QueryClient reais. Instale dependências de desenvolvimento apenas se necessárias. Controle promessas/timers para forçar a ordem de respostas; evite esperas arbitrárias.

**Critério obrigatório:** o teste deve falhar se a produção regredir. Uma função copiada para dentro do teste, um objeto de fila inventado, uma string de label construída no teste ou um predicado reescrito não verificam o app. Leitura de código-fonte pode ser checagem auxiliar, mas não substitui comportamento.

Leia `.scratch/correcoes-auditoria-2026-10-06/classificacao-dos-testes.md` ao substituir testes históricos. Preserve o comportamento necessário com teste real; não preserve uma contagem artificial de testes. Não retirar teste válido para obter suíte verde.

### Casos mínimos por ticket

| Ticket | Interface real e preparação | Resultado observável obrigatório |
|---|---|---|
| 05 | `review-links` e `review` reais; Auth/SDK externos controlados. Registro tem parceiro A e ações A1/A2. | Token retorna só A1/A2. Alterar slug, adicionar IDs à URL, token expirado/revogado: recusado. Formato legado `ids` não libera acesso. Colaborador não compartilha ação alheia. Revogação sem permissão falha. |
| 06 | Handler de contas e login reais; admin, comum e inativo. Password/hash conhecido independentemente. | Comum/inativo não grava. Bcrypt aceita senha certa/rejeita errada. Legado migra condicionalmente; troca concorrente não é sobrescrita. Resposta não contém senha/hash. Senha vazia em update preserva credencial. Falha de RPC não confirma troca/desativação. |
| 07 | SQL/scripts e endpoints reais ligados a banco descartável. | Anon não lê dados privados; membro A não lê/escreve ação B nem se promove a admin; inativo recusado. RPC deriva identidade autenticada. Cliente/revisão limitados. Sem banco, roteiro preparado e casos pendentes: mocks não encerram esta matriz. |
| 08 | Update real e handler de anexos; versão V1 literal recebida. | UPDATE filtra ID+V1. Zero linhas produz conflito, não sucesso. Resposta V2 é preservada sem reformatar e usada na próxima escrita. Campo omitido permanece; limpeza explícita segue contrato. Em banco real, duas escritas com V1: somente uma confirma. |
| 09 | Gaveta real; eventos de input/blur/Criar/Cmd+Enter/Escape/X. INSERT controlado ainda pendente. | Blur+Criar envia um INSERT. Editar descrição enquanto cria leva o patch restante após receber ID. Falha+fechamento mantém editor/texto e permite nova tentativa. Resposta de A não sobrescreve B. Abrir e fechar sem editar não atualiza `updated_at`. |
| 10 | Hook real com QueryClient real; Hoje A, outro dia, parceiro B, atrasados e foco. | Criar A não insere em B/outro dia. Uma duplicação cria uma cópia com mesmo título na UI e payload. Falha antiga não desfaz sucesso recente. Concluído sai de atrasados/foco, permanece onde concluídas são exibidas. |
| 11 | Provider/menu/hooks reais, recorte e versões. Cinco IDs: 2 sucessos, 1 conflito, 2 erros. | Confirma 2, conserva 3 para recuperação. Recorte vazio envia zero writes. Zero linhas não conta sucesso. Mudar filtro/rota/período limpa seleção. Cmd+A no editor não seleciona ações. |
| 12 | Hook real de DnD; eventos tipados, duas promessas externas controladas. | Drop1 pendente, drop2 iniciado: resolver/rejeitar1 não limpa2. Cancelamento sem drop não grava. Calendário trata erro. Isso prova coordenação, não gesto real de toque. |
| 13 | Layouts/providers e QueryClient reais; Auth/HTTP controlados. | A→logout→B não mostra dados A; resposta atrasada A é ignorada. Administration de parceiros arquivados não contamina home. Arquivar parceiro remove cards/contagem sem apagar registros. Cache fora da cobertura de data não inventa lista vazia. |
| 14 | Handler e cliente HTTP de IA reais; OpenAI/SDK controlados. | 401/403/400/429/502/503 conforme contrato. Rejeições não chamam OpenAI. Body inválido/maior que limite é recusado. JSON de saída ilegível é erro. Falha da quota não cai em contador local. Em banco real, duas chamadas disputando a última vaga não ultrapassam limite. |
| 15 | Menu/controlador real de preferências; relógio/SDK externos. | Tema A em voo + paleta B: ambos persistem e última escolha vence. Falha conserva pendência. Patch novo segue após primeira escrita sem novo clique. Conta B não recebe timer de A. Campos JSON desconhecidos preservados. |
| 16 | Busca, calendário, administração, guard, notificações e controles reais. | Busca antiga não sobrescreve nova; parceiro acessível escolhido em ação multiparceiro; sem parceiro não quebra. Calendário navega meses/anos e pede intervalo correto. Lista administrativa inclui pessoa arquivada, seletor não. Comum não renderiza admin. Erro, vazio e carregamento são distintos. Stories mantêm conteúdo previsto. Controles têm nome acessível. |

Para o calendário, compare intervalos com valores literais independentes, no fuso America/Fortaleza. Exemplos: fevereiro/2026 começa domingo01 e termina sábado28; setembro/2026 mostra domingo30/08 até sábado03/10. Não recompute no teste o mesmo algoritmo do componente como única expectativa.

Não simule atomicidade usando duas operações sequenciais em um array e declare isso transação real. Não use `getBoundingClientRect` inventado para aprovar mobile, foco, sobreposição, gesto ou clique possível.

## 5. Código, banco e navegador são entregas distintas

| Camada | O Gemini deve entregar | O que continua para revisão aqui |
|---|---|---|
| Código | Implementação, testes reais executados, scripts, tipagem/lint/build e registro de falhas. | Codex confronta diff, contratos e testes, inclusive possíveis regressões. |
| Banco | Migrations ordenadas, inventário somente leitura, fixtures e comandos para banco descartável. Execução somente se ambiente de teste disponível e claramente identificado. | Conferir grants/RLS/triggers/RPCs, isolamento e atomicidade em ambiente real de teste. |
| Navegador | Roteiro por Nxx do ticket17, pré-condições, passos e resultado esperado. Se indisponível: “não executado”. | Codex/usuário executa desktop/mobile, foco, cliques, gestos, overlays, upload e persistência/recarga. |
| Produção | Lista de variáveis e incompatibilidades; passos de implantação propostos. | Implantação posterior autorizada e verificação real. Sem alegação de liberação agora. |

Os scripts `scripts/check-portal-browser.cjs`, `scripts/check-portal-actions-browser.cjs` e `scripts/check-partner-visibility-browser.cjs` já exercitam UI real com HTTP controlado. Se não puder executá-los, deixe pendente. Esses scripts não comprovam cookie/banco/Cloudinary reais e não encerram o ticket17 inteiro.

A mudança de sessão/permissões exige conjunto compatível02–07. Concorrência exige adaptar callers08–12. Entregue as migrations, mas não aplique partes incompatíveis isoladamente. Identifique no retorno os caminhos que dependem de migration ainda não executada.

## 6. Eficiência e prevenção de regressão

- Faça inspeção dirigida ao ticket atual e execute só seus testes durante o ciclo. Rode suíte completa/tipagem/lint no fechamento de cada ticket; build quando contrato/configuração/rotas mudarem e no fechamento da rodada. Repita checks depois de novas alterações relevantes, não em loops sem mudança.
- Antes de renomear chave/contrato, localize todos os callers e invalidações. Liste-os no retorno e migre em conjunto. Compatibilidade não pode ser resolvida com cast que esconde campo ausente.
- Mantenha AdminGuard complementar à autorização do servidor. Uma aprovação do teste de UI não prova autorização do banco.
- Toda confirmação de gravação vem de resposta confirmada; zero linhas, conflito, erro ou resposta inválida não são sucesso.
- Dados privados incluem identidade/audiência no cache. Limpeza/cancelamento deve impedir resposta antiga de preencher nova sessão.
- Atualize o ticket com resultados reais e o relatório de retorno. Descreva impedimentos específicos, não “não consigo testar” sem dizer qual ambiente/recurso falta.

## 7. Arquivo final e formato de retorno

Arquivo obrigatório: `docs/audits/2026-10-06-retorno-gemini-pendencias.md`. Preencha seguindo os requisitos abaixo, sem editar a matriz de baseline como se fosse evidência nova.

O retorno deve conter:

1. Commit/estado inicial, mudanças que já existiam e arquivos que você efetivamente alterou/criou.
2. Tabela05–17 com status separado de código, testes de código, banco, navegador e produção. Use “implementado”, “parcial”, “pendente” ou “não se aplica” por camada, com motivo. Não usar “100%” geral.
3. Uma linha para cada achado01–52, com estado final e evidência ou encaminhamento de produto. Ticket concluído não encerra automaticamente todo achado relacionado.
4. Por ticket executado: comportamento anterior/depois, contratos/callers alterados, arquivo e nome de cada teste, RED observado ou implementação prévia, GREEN e comandos/saída resumida. Registre também testes retirados/substituídos e por quê.
5. Migrations e scripts com ordem, pré-condições, incompatibilidades e reversão proposta. Distinguir arquivos preparados de migrations aplicadas.
6. Roteiro do navegador para cada Nxx afetado: dados de teste, passos, resultado esperado, executado/não executado. Nada de preencher resultado observado a partir de expectativa.
7. Lista explícita de pendências, riscos, último ticket e próximo passo. Bugs adicionais encontrados vão em seção separada; não refaça o produto para resolvê-los silenciosamente.

Na mensagem final ao proprietário, forneça o caminho clicável do retorno, tickets executados e pendências de banco/navegador. O proprietário volta ao Codex com esse arquivo para revisão. Não enviar mensagens para outros agentes/chats nem abrir PR/deploy automaticamente.

## 8. Critério de entrega para revisão

A rodada está pronta para revisão quando cada tarefa executada tem produção real e evidência local, checks disponíveis foram executados, arquivos preparados estão identificados e todas as pendências aparecem no retorno. Ela não está automaticamente pronta para produção. Se houver falha conhecida, entregue a evidência e o estado parcial; não masque com teste simulado ou falso sucesso.
