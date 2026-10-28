# Busca global por parceiros — ticket04

Autorizado pelo proprietário depois do encerramento do03. O pedido atual prioriza04; o comando Criar ação do05 permanece futuro.

## Resultado

Filtro de parceiros no rodapé da busca, reutilizando PartnersCombobox com allowAll opcional, acompanhado de Incluir arquivadas. A posição e o controle de arquivadas foram revistos pelo proprietário na seção final. Vazio/Todos os parceiros representa todos os parceiros operacionais disponíveis. Clique adiciona/remove um parceiro sem fechar o popover neste modo; Shift seleciona exclusivamente um e fecha. Todos limpa restrições. Consumidores anteriores mantêm rótulo vazio e fechamento originais. Nenhum primitivo Prism/Uzzina novo.

GlobalSearchCommand monta conteúdo próprio para cada abertura. A rota só fornece seleção inicial: parceiro atual se disponível; nas outras páginas, todos. Fechar/reabrir limpa texto, seleção e resultados. Mudanças de seleção invalidam o efeito da consulta anterior; callbacks atrasados de uma abertura desmontada não publicam resultados na próxima. Portais do seletor não acionam a captura de teclado dos resultados externos. Shift dos resultados mantém a abertura secundária.

searchActionsByTitle recebe partnerSlugs disponíveis e selectedPartnerSlugs opcionais; intersecta ambos, usa overlaps para qualquer selecionado e retorna vazio sem HTTP quando não há escopo válido. A antiga restrição contains derivada da rota foi removida. Título e limite padrão10 preservados; arquivadas tornaram-se opcionais na revisão final abaixo. Não há filtro global nem alteração de calendário, navegação ou atribuição de rascunhos. RLS e Auth continuam no cliente/servidor existentes, sem SQL ou políticas novas. Semântica conferida na [documentação oficial de overlaps](https://supabase.com/docs/reference/javascript/overlaps).

## Verificação

Teste no componente real falhou antes do ajuste pela ausência do filtro e passou depois.10 testes novos exercitam rota, todos/um/vários, opção Todos, remoção da última seleção, reset nas duas origens, respostas atrasadas após troca/fechamento, Shift no seletor/resultados, consumidores anteriores e model real com SDK/HTTP controlados. O SDK CJS é usado somente no teste para evitar que mocks ESM das APIs substituam sua fábrica; conversão de tipo documenta identidades privadas distintas das declarações ESM/CJS.

453 testes em43 arquivos passaram, sem falhas. Incluem94 testes de regressão da gaveta/seletores. Format/format:check/lint/typecheck/build passaram; aviso conhecido de chunks grandes permanece. Chromium com build isolado e HTTP externo controlado passou em1440px: todos/um/vários, escopo HTTP sem restrição oculta, mesma rota, reset de seleção/texto, abertura de outro parceiro por Shift e regressões das duas ações. O mesmo roteiro passou em390px. Capturas desktop/mobile inspecionadas; seletor e resultado cabem na largura disponível.

## Limites e continuidade

Código preparado localmente para avaliação do proprietário, sem commit, push/deploy, SQL, escrita real em produção, geração de IA ou upload real. HTTP controlado certifica interface/consulta emitida, não RLS/provedor reais. KIs de arquitetura/banco sincronizados por mudança de fluxo e model. Alterações externas de Hoje/Kanban preservadas. Ticket05 permanece não iniciado.

## Revisão visual e ações arquivadas

Proprietário pediu controles no rodapé, sem “Ações de”, com opção de arquivadas e correção do contorno extra. Seletor e checkbox Prism “Incluir arquivadas” agora ficam após os resultados, numa linha que permite quebra conforme a largura. Estado de arquivadas inicia false e reinicia a cada abertura. O model acrescenta includeArchived=false e aplica eq(archived,false) somente quando desligado; quando ligado, inclui ativas/arquivadas dentro do mesmo escopo de parceiros. Não altera a disponibilidade de parceiros operacionais.

O trigger de variante filter herdava border/focus-visible ring de buttonVariants; o popover somava ring do primitivo à borda do componente. Somente neste uso allowAll/filter, trigger remove borda/ring e preserva fundo de foco; popover allowAll preserva borda e remove ring extra. Primitivos e demais consumidores continuam com seus estilos existentes.

Teste do rodapé falhou antes da revisão e passou depois.455 testes em43 arquivos passaram, incluindo dois casos novos para ordem dos controles e arquivadas com escopo/reset. Format/format:check/lint/typecheck/build passaram, com aviso conhecido de chunks. Roteiro Chromium verifica posição real do rodapé, CSS do ring/borda, exclusão inicial/inclusão por checkbox e reset, em1440px/390px e claro/escuro; ambos os roteiros passaram e as capturas de390px em claro/escuro foram inspecionadas. O rodapé acomoda ambos os controles na mesma linha no caso verificado; CSS confirmou trigger com borda0/ring0 e popover sem ring1 extra. Sem commit, publicação, SQL ou escrita real.

## Uniformização do ghost

Proprietário comparou o filtro ghost (hover secondary integral no claro, /50 no escuro e expanded integral) ao item do menu (/50) e autorizou unificar. A variante compartilhada em app/components/prism/button.tsx usa hover:bg-secondary/50 e aria-expanded:bg-secondary/50; dark:hover específico removido. A regra alcança os consumidores do ghost e não se restringe à busca. Format/lint/typecheck/build e diff passaram; aviso conhecido de chunks permanece. Sem teste novo que apenas repita classes, nova conferência visual, commit ou publicação nesta rodada.

## Escopo de arquivadas e peso dos controles

Conferência solicitada pelo proprietário: getOperationalPartners filtra partners.archived=false (inclusive a consulta por membro); app/routes/app.tsx filtra novamente visiblePartners e fornece essa lista à busca. searchActionsByTitle continua limitando por overlaps/interseção ao retirar apenas o filtro actions.archived=false. Portanto Incluir arquivadas acrescenta ações arquivadas às ativas dentro dos parceiros operacionais disponíveis, sem acrescentar parceiros arquivados ao seletor/escopo. Ação vinculada a um parceiro ativo pode continuar acessível por esse vínculo; não se exige que todos os seus parceiros sejam ativos. Nenhuma regra de escopo mudou nesta conferência.

Proprietário aceitou peso médio ou regular para o seletor e pediu peso normal na opção de arquivadas. Ambos foram definidos como font-normal/400, localmente no uso allowAll/filter e no checkbox do rodapé. Demais seletores/checkboxes preservam seus pesos.12 testes da busca/model/seletor, format/lint/typecheck/build e diff passaram, com aviso conhecido de chunks. Sem testes novos que apenas espelhem classes, nova conferência visual, SQL, consulta/escrita em banco real, commit ou publicação.
