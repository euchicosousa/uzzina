> Atualização17 —07/10/2026: revisão pública e teclado/foco das superfícies registradas verificados; matriz52 reconciliada. Próximas lacunas são banco/staging, foco integral de gaveta/overlays e Safari/aparelho. Leia CURRENT e o resultado17 antes de executar; não repetir tickets antigos.

# Correções da auditoria — pacote de execução

> **Estado vigente:** leia `docs/audits/CURRENT.md` e somente o ticket autorizado. 05–16 verificados localmente com limites por camada;17 parcialmente executado. Próximo passo: lacunas da homologação17. Banco e produção não certificados.

Data: 06/10/2026. Base examinada: commit 2680711. Aplicativo: /uzzina.

## Execução restante pelo Gemini
Para executar os tickets05–17 nesta rodada, leia `docs/audits/2026-10-06-execucao-gemini-pendencias.md`. Ele define sequência, testes e relatório final, permitindo continuidade com checkpoints. A matriz dos52 achados distingue correções técnicas de decisões de produto; não implementar automaticamente as alternativas da auditoria original.

## Como usar
Leia este arquivo e a classificação de testes. Execute um ticket por vez, na ordem abaixo, verificando seus bloqueadores. Cada ticket é uma entrega funcional com teste próprio; testes acompanham a correção, não formam uma etapa final separada.

Material preparado com as skills locais to-tickets, tdd e writing-for-agents de Matt Pocock. Não foi localizada configuração de tracker no projeto. Este é um pacote local solicitado pelo usuário, sem publicação de issues externas. Para configurar o fluxo oficial de tracker posteriormente, executar /setup-matt-pocock-skills; isso não é requisito para ler/executar este material.

A pedido do usuário, os tickets incluem arquivos e decisões de implementação: conferir símbolos atuais antes de editar, sem reformular a solução. Não há redesign, mudança de stack, multitenancy novo nem remoção de funcionalidades de produto.

Este pacote especifica a próxima execução; não comprova que qualquer correção nova já foi implementada. Complementa a auditoria independente e concretiza suas instruções. Em divergência técnica entre instrução genérica anterior e contrato específico deste pacote, aplicar o contrato aqui descrito; preservar as regras de produto da auditoria original.

## Situação atual — atualização de 06/10/2026
Tickets 01–04 implementados e verificados localmente pelo Codex. Consulte docs/audits/2026-10-06-fechamento-tickets-01-03.md e docs/audits/2026-10-06-fechamento-ticket-04.md. Navegador validado com respostas HTTP controladas; banco real, N04 completo e produção continuam pendentes. Próximo trabalho de código: ticket05; não reexecutar01–04 como implementação do zero.

Regressão adicional corrigida: parceiros arquivados fora da operação, cache administrativo separado e ações/contagens filtradas pelo escopo ativo. Leia docs/audits/2026-10-06-correcao-parceiros-arquivados.md antes dos próximos tickets; não reintroduzir getAllPartners no contexto operacional.

## Mensagem para entregar ao agente
Leia este README, os relatórios de fechamento01–04 e issues/05-links-revisao.md. Preserve o código já validado. Execute somente o ticket05 neste contexto e registre resultados reais, distinguindo código/banco/navegador/produção. Falta de banco ou navegador não permite criar funções simuladas para substituir regras da produção.

## Ordem e bloqueadores
| Ticket | Entrega | Bloqueado por |
|---|---|---|
| 01 | HTML seguro com testes reais | nenhum |
| 02 | Login/retomada por sessão de servidor | nenhum |
| 03 | Leitura de ações autorizada no portal | 02 |
| 04 | Arquivos e comentários autorizados no portal | 03 |
| 05 | Links de revisão limitados e revogáveis | 02 |
| 06 | Cadastro de contas e troca de senha pelo servidor | 02 |
| 07 | Policies/RPCs e comprovação de autorização | 03, 04, 05, 06 |
| 08 | Conflito explícito em atualização de ação | nenhum |
| 09 | Gaveta rápida com recuperação e fila de salvamento | 08 |
| 10 | Atualização otimista sem corrupção de listas | 08 |
| 11 | Lote restrito ao recorte com resultado por ID | 08, 10 |
| 12 | Arrastes sucessivos sem limpar operação nova | 08, 10 |
| 13 | Cache/contexto isolados por identidade | 03, 04, 10 |
| 14 | Entrada e consumo de IA controlados | nenhum |
| 15 | Preferências persistidas na ordem escolhida | nenhum |
| 16 | Regressões reais das demais correções de interface | 01, 09, 11, 13, 15 |
| 17 | Homologação de navegador e fechamento do relatório | 01–16; banco separado conforme 07/08/14 |

## Procedimento de cada ticket
1. Confira a base atual e alterações compartilhadas. Registre a divergência se o arquivo já mudou; preserve trabalho existente.
2. Leia somente o ticket e as referências nele necessárias. Verifique bloqueadores.
3. Use a interface de teste especificada no ticket. São propostas técnicas deste pacote para executar o pedido; não substituem uma confirmação exigida pela skill TDD se ainda não houver autorização da interface no ambiente do executor. Havendo essa lacuna, peça confirmação agrupada, uma vez, antes de escrever testes.
4. Um comportamento por ciclo: teste na implementação real → falha atribuível ao defeito → mudança mínima → teste passando. Correção prévia recebe teste de regressão posterior, sem inventar RED histórico.
5. Mantenha as bibliotecas do app reais. Falsifique HTTP, SDK de banco/serviços, relógio e aleatoriedade somente nas fronteiras. O falso recebe dados e devolve respostas preparadas; a autorização, fila, merge e classificação são executados pelo app.
6. Rode testes do ticket, tipagem e lint; build nos tickets que alteram dependência/configuração/rotas e no fechamento. Registre comandos e resultados.
7. Acrescente resultado ao próprio ticket: código, teste local, banco, navegador, produção, arquivos alterados e impedimento concreto. Pare ao terminar o ticket; próximo contexto começa pelo próximo arquivo elegível.

## Infraestrutura de testes decidida
Manter Bun como runner. Testes puros/handlers usam bun:test. Componentes/hooks usam React Testing Library, user-event e jsdom atual como dependências de desenvolvimento, com setup carregado antes dos módulos React. Criar tests/dom-setup.ts e configuração/preload por processo de testes; instalar window/document/navigator/HTMLElement/MutationObserver necessários e IS_REACT_ACT_ENVIRONMENT, limpar DOM e mocks entre casos.

O ticket 01 instala o DOM para sanitização; 09 acrescenta a infraestrutura React quando necessária. Se pacote não puder ser instalado, registrar dependência pendente. Escrever simulação local da lógica não é alternativa.

DOM simulado executando componente real é teste de código legítimo. Não comprova geometria, CSS responsivo, hit testing, suporte real a toque ou segurança em todos os parsers. Esses casos estão no 17. Instalar ferramentas apenas na implementação dos tickets; este pacote não alterou dependências.

## Decisões de segurança já fixadas
Preservar SPA e Supabase Auth da equipe. Para clientes do portal, usar sessão opaca persistida no servidor e cookie HttpOnly; não introduzir outro framework. Todas as operações do portal passam por endpoints de servidor, com service-role restrita ao servidor e autorização explícita antes da consulta/gravação. Não usar token customizado como se fosse JWT do Supabase.

A implantação de mudanças de sessão/policies exige conjunto compatível: 02–07 completos, migrations aplicadas em teste, banco validado e variáveis configuradas. Antes disso, código pode ser testado com banco falso, mas não é liberável. Não implantar cada ticket de segurança isoladamente sobre o portal atual.

Não exportar segredos em logs, snapshots ou bundle. Não editar banco/produção sem etapa de implantação autorizada. Falta de acesso ao banco significa migration preparada e integração pendente.

## Saída obrigatória
Para cada ticket:
- Código: implementado / incompleto.
- Teste de código: executado e passou / falhou / pendente, com nome e comando.
- Banco: validado em teste / migration preparada, aplicação pendente / não se aplica.
- Navegador: validado / pendente, com itens de 17 vinculados.
- Produção: não implantado / implantado e evidências, apenas se realmente verificado.

Referências oficiais para infraestrutura: [Bun DOM](https://bun.sh/docs/test/dom), [React Testing Library](https://testing-library.com/docs/react-testing-library/setup/), [DOMPurify](https://github.com/cure53/DOMPurify). A documentação do DOMPurify recomenda jsdom atualizado e alerta contra DOMs inadequados; não trocar por um DOM alternativo para validar a sanitização.

Auditoria de origem: ../../docs/audits/2026-10-06-revisao-do-retorno.md (resolver a partir da raiz do projeto: docs/audits/2026-10-06-revisao-do-retorno.md).
