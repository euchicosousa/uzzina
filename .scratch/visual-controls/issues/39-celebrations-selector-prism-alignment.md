# 39 — Alinhar o seletor de datas comemorativas ao Prism

**What to build:** manter a organização do PartnerCelebrationsSelector e fazer textos, busca, meses, seleção e comandos seguirem os padrões visuais e de teclado da UZZINA.

**Blocked by:** nenhum. Independente de V37/V38. Executor previsto Gemini.

**Status:** concluído (100%) — aceite visual explícito do proprietário em 04/11/2026.

## Entrega

- [x] Preservar barra superior, agrupamento mensal, seleção, busca, duas colunas e rolagem própria. Lista continua integrada ao fundo, sem caixas externas novas.
- [x] Usar text-sm nos nomes/títulos principais e text-xs nos auxiliares, contagens e estados. Remover tamanhos avulsos de 9/10/11px deste seletor.
- [x] Busca no tamanho padrão do PrismInputGroup, removendo altura/ícone/texto menores próprios. Manter rótulo acessível e comando de limpar busca.
- [x] Usar PrismTabs underline padrão para o filtro de meses e preservar seu comportamento de seleção. Manter meses roláveis em janela estreita, sem overflow da página.
- [x] Usar PrismButton ghost padrão em Limpar todas e botão padrão do InputGroup para limpar a busca, com nomes acessíveis.
- [x] Usar uma única seleção/foco semântico por linha com PrismCheckbox e rótulo de toda a linha. Remover o checkbox nativo dentro de outra região role=checkbox, preservando teclado e callback único.
- [x] Usar PrismBadge warning padrão para identificar feriados. Preservar dados e semântica do campo is_holiday.
- [x] Conservar estados carregando, salvando, vazio, filtro sem resultados e ações desabilitadas. Alterações visuais não podem mudar IDs, datas, autorização ou persistência da seleção.
- [x] Conferir os consumidores existentes e o playground com dados locais. Não implementar filtragem de calendários nem novas regras de feriados como consequência.

## Validação

Filtro por mês/nome e combinação, selecionar/desselecionar, limpar, carregamento/salvamento, vazio e nenhum resultado. Conferir clique no texto e no checkbox sem duplicar callback, Tab/Espaço, foco visível, claro/escuro e 375px. Preservar a correção de quebra do título longo da galeria. Formatar e executar lint/typecheck conforme a mudança; validação visual do proprietário continua necessária.

Registrar prova e limites, CURRENT e relatório central. Estudo de referência em docs/audits/2026-11-04-color-and-celebration-studies.md. Começar por CURRENT/AGENTS e preservar mudanças externas; um escritor por checkout.

## Refinamento da revisão independente — 04/11/2026

Histórico da revisão anterior à implementação. Além da troca visual, foram conferidos foco único por linha e callback único (hoje há role checkbox mais input nativo), mensagem de nenhum resultado também em Todos, e comportamento de mutação durante saving conforme a serialização real do consumidor. Preservar contagem, IDs, agrupamento e datas civis. [Análise detalhada e evidências](../../../docs/audits/2026-11-04-v37-v39-independent-review.md).

## Entrega revisada conforme orientação do proprietário — 04/11/2026

Padrão único dos primitivos Prism, sem props size/variant novas no seletor. Busca/meses/botões padrão 40px, checkbox padrão 20px, Badge warning e texto principal 14px/auxiliar 12px. Responsividade apenas de layout: busca e limpar quebram no mobile, meses rolam internamente e títulos longos usam truncamento. Preservados contrato, IDs, datas civis, agrupamento, duas colunas e rolagem da lista.

Removidos checkbox/foco duplicados e estilos de escala próprios. Mensagem de nenhum resultado funciona em Todos. saving desabilita seleção e Limpar todas porque o consumidor dispara escritas sem coordenador; busca e meses continuam ativos.

Prettier, Biome e typecheck aprovados pelo executor. Conferência do coordenador em Chromium com dados fictícios: um checkbox por data, clique no texto gera um callback, busca sem resultados, mutação desabilitada em saving, 375/375 e 1200/1200 em claro/escuro. Zero pageerror e requisições externas. Log /tmp/uzzina-v39-alignment-browser-final.log. Sem teste de banco, commit ou deploy. Aceite visual pendente.

## Segunda revisão independente — 04/11/2026

Subagente leve revisou código, consumidor e evidências da implementação. Nenhum defeito funcional concreto encontrado. Critérios acima alinhados aos tamanhos padrão solicitados na orientação mais recente; desmarcação antiga eliminada. Busca/filtro continuam disponíveis em saving; checkboxes e limpar bloqueados. Pronto tecnicamente para aceite visual do proprietário, sem nova API de tamanho/variante.

## Refinamento visual pelo proprietário — 04/11/2026

Filtro de meses trocado para PrismTabs underline, com um PrismTabPanel ativo e barra horizontal visualmente oculta, mantendo rolagem. Quantidades selecionadas são PrismBadge. Removido padding superior da lista para impedir texto vazando acima do sticky. Cabeçalho de cada mês recebeu border-top, removida a contagem de datas e incluída badge Feriado à direita quando há ao menos um feriado visível no mês, inclusive com mês específico selecionado. Badge removida das linhas. Títulos de datas agora têm truncate/nowrap.

Prettier/lint aprovados. Chromium confirmou associação de Tabs/painel, badges, aviso no cabeçalho, truncamento, rolagem sem barra visual, callback único e bloqueio durante saving; 375/1200px nos dois temas sem overflow, pageerror ou rede externa. Log /tmp/uzzina-v39-followup-browser.log. Aceite visual pendente.

Limite da checagem geral desta rodada: typecheck encontrou import de UToggle não resolvido e parâmetro checked sem tipo no cadastro administrativo do parceiro, em alterações paralelas fora dos arquivos deste ajuste. Logs em /tmp/uzzina-followup-types.log. Verificação de navegador dos ajustes V35/V39 passou.

## Aceite final — 04/11/2026

Proprietário confirmou PartnerCelebrationsSelector ok. V39 encerrado e selo de aprovação aplicado no cabeçalho e menu lateral.
