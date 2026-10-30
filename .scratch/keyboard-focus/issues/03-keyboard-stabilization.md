# 03: Mapear foco e teclado nas demais telas da UZZINA

**What to build:** entregar uma revisão verificável de foco e teclado das telas atuais, com cenários aprovados, falhas reproduzidas e correções propostas por prioridade. Preservar os fluxos da gaveta/toolbar já aprovados pelo proprietário e não iniciar correções gerais durante o levantamento.

**Blocked by:** None (can start immediately). Tickets01 e02 da gaveta/toolbar já concluídos; independente de recuperação de salvamento, uso de IA e Planejamento. Teste físico do Safari será feito pelo proprietário em outro chat e não bloqueia o inventário inicial.

**Status:** completed-review — owner authorized review 2026-10-29; all 11 surface families inspected; findings and priorities delivered; no functional corrections applied

## Contexto e limite do aceite anterior

O ticket foi registrado em14/10 para uma revisão futura além da gaveta. Em29/10, o proprietário confirmou vários testes manuais e aprovou o comportamento que já exercitou. Esse aceite continua válido: não reabrir gaveta/toolbar nem presumir novos defeitos por falta de cobertura documentada. Posteriormente pediu preparar este ticket de revisão das demais telas para continuidade futura. Este documento substitui o escopo/status anterior do mesmo ticket, sem duplicar a fila.

A revisão entrega diagnóstico e propostas. Não é migração de biblioteca, refatoração do design system ou compromisso de implementar tudo que for encontrado.

Checklist abaixo indica escopo revisado e registrado no relatório, não aprovação integral de todos os cenários. Cobertura por navegador/estado, falhas e casos não testados estão discriminados na matriz da entrega.

## Telas e cenários de cobertura

- [x] Entrada, recuperação e redefinição de senha: campos, links, envio, mensagens e foco após validação; sem trocar senhas reais para produzir uma fixture.
- [x] AppBar e menu do perfil: links, menus, itens de comando, abertura/fechamento e retorno ao acionador.
- [x] Busca global: foco inicial, texto com espaços, setas entre resultados/comandos, Enter/Espaço após navegação, Shift, filtro de parceiros e opção de arquivadas; seletores/portais mantêm seus próprios eventos.
- [x] Home, Hoje e parceiro: datas, visualizações, calendário/listas, ações focáveis, seletores e regiões com rolagem. Identificar gestos sem alternativa de teclado em vez de afirmar que uma já existe.
- [x] Minha Conta: campos pessoais, preferências, tema/personalização, seções mobile, validação que revela campo inválido, Salvar e controles de foto/upload.
- [x] Datas comemorativas, para administrador: lista, criação/edição, título, seletores de mês/ano, grade, erro vazio, Enter/Escape e retorno. Respeitar a ordem visual anterior → mês → ano → próximo já definida.
- [x] Notificações e Ajuda: ações da lista, leitura, carregar anteriores, erros/retry quando reproduzíveis, índice/seletor e links sem perda da região de rolagem.
- [x] Leads: seleção da lista, filtros existentes, detalhe e retorno; não inventar edição/recursos ausentes.
- [x] Administração: listas/formulários de parceiros, pessoas e contas externas, responsáveis/permissões existentes, salvar/cancelar, popovers e diálogos. Conferir disponibilidade por papel.
- [x] Editores e anexos fora do percurso principal já aprovado: links, seleção/tabelas, menções, barras de formatação, seletores, upload externo, remoção/reordenação quando disponíveis.
- [x] Portal do cliente e revisão pública: entrada, calendário/abas, conteúdo, comentários/anexos disponíveis, overlays e estados de acesso. Não depender de providers privados da equipe no conteúdo compartilhado.

## Critérios comuns a cada fluxo

- [x] Registrar foco inicial, Tab/Shift+Tab, indicador visível, ordem coerente, setas quando aplicáveis e ativação por Enter/Espaço conforme o controle. Distinguir foco, hover, seleção e estado ativo.
- [x] Overlays internos recebem teclado sem acionar a página por trás; Escape fecha primeiro o elemento que o consumiu; fechamento devolve foco a um destino útil e existente.
- [x] Digitação em texto/editor não dispara atalhos de ação. Não usar contenção global de foco ou captura global de Tab como correção presumida.
- [x] Identificar controles inacessíveis, sem nome acessível, fora da tela ou sem destino de retorno; separar problema funcional de preferência visual.
- [x] Preservar contratos React Aria/Prism e o percurso principal da gaveta aprovado, inclusive acesso auxiliar e atalhos das toolbars. Não exigir repetir toda a gaveta para encerrar uma outra tela.
- [x] Registrar tema, papel/sessão, navegador e viewport da observação. Claro/escuro, viewport estreito e Safari só contam como testados quando efetivamente executados.

## Método e entregáveis

- [x] Inventário de fluxos em tabela, cada um com situação: verificado sem falha, falha reproduzida, inspeção estática apenas, não aplicável ao papel ou não testado. Não transformar ausência de ensaio em defeito confirmado.
- [x] Para cada falha: tela/controle, passo a passo mínimo, resultado observado/esperado, impacto e evidência reproduzível. Capturas temporárias ficam fora do projeto.
- [x] Priorizar bloqueio de operação, perda de foco/edição e atalhos indevidos antes de ajustes cosméticos. Não usar prioridade alta apenas por se tratar de acessibilidade.
- [x] Para cada correção proposta, definir comportamento final, limite de escopo, teste de regressão viável, dependências reais e critério de aceite. Agrupar por fluxo utilizável, não por biblioteca/camada.
- [x] Entregar relatório e fila proposta para decisão do proprietário, sem aplicar correções nem abrir uma sequência infinita de tickets automaticamente.
- [x] Se nenhum problema reproduzível for encontrado, declarar esse resultado dentro da cobertura realizada; não inventar trabalho para justificar o ticket.
- [x] Manter testes físicos do Safari/telefone como resultado externo futuro, sem certificar essa cobertura por simulação de viewport. Incorporar a informação quando o proprietário a trouxer, se pertinente.

## Verificação e limites operacionais

Preferir navegação sem escrita e dados/HTTP controlados quando o fluxo exigir alteração. Localhost usa o banco real de produção: não criar pessoas, mudar permissões, marcar notificações reais ou comentar em conteúdos reais só para exercitar foco. Inventariar dependências de conta/papel/link sem solicitar credenciais já disponíveis.

Esta entrega é de diagnóstico/documentação: conferir referências e diff; não criar testes que apenas repitam texto. Testes de regressão e format/lint/typecheck/build serão necessários nas futuras correções autorizadas, não por existir esta lista. Sem SQL, mudança de biblioteca, alteração funcional, commit ou publicação autorizados por este ticket.

## Review result — 2026-10-29

The owner explicitly authorized executing this diagnostic. Inspection and representative keyboard navigation covered all11 surface families using the compiled application, controlled Auth/REST/API fixtures and blocked external connections. Report delivered with coverage matrix, observed behavior, five finding groups, priorities and proposed regression criteria. Existing drawer/toolbar approvals preserved; no product code, SQL, permissions or production data changed. The checked scope above records completion of the review and its coverage matrix, not certification of every possible browser/state.

Findings: creation controls remain invisible on keyboard focus; per-file removal in media manager depends on hover; several icon controls lack accessible names; some inputs/editors lack associated labels; Lead contact has redundant nested focus targets. Report distinguishes runtime evidence from source inspection, successful sampled flows and untested cases, including external upload and Safari. VoiceOver/screen-reader testing is explicitly out of scope by owner decision; no separate ticket exists for it. Future corrections require a separate owner decision; no new correction tickets opened automatically.

## Owner scope clarification — 2026-10-29

Owner acknowledged finding K01 about the plus button and requested clarification of K02. K02 concerns the application-owned Gerenciar conteúdo dialog, opened by the file-count button in Instagram, not the Cloudinary upload widget. The observation is keyboard-specific: per-file removal is hidden outside hover, so Tab does not reach it. Touch behavior was not established by this observation and must not be reported as broken. Safari/mobile work is handled in another chat. Do not expand this review into changes to the Cloudinary widget. VoiceOver/screen-reader testing is excluded from further work; no standalone VoiceOver ticket was found or created. No additional functional change authorized by this clarification.
