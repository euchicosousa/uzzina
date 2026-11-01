# 02: Definir feriados da marca na gestão do parceiro

**What to build:** administradores escolhem múltiplos feriados cadastrados na gestão existente do parceiro, removem/limpam associações e encontram a seleção persistida ao reabrir. Cada marca tem sua lista independente, vazia inicialmente.

**Blocked by:** contrato de banco do #01 — atendido. A conclusão da interface do #01 não bloqueia este ticket. Aplicação do SQL deste ticket aguarda confirmação exigida pela ferramenta Supabase.

**Status:** implemented-locally — banco e interface concluídos localmente; aguarda validação visual do proprietário.

- [x] Preparar relação muitos-para-muitos por UUIDs reais de parceiro/data, PK composta sem duplicações, FKs com cascades e índice reverso. Não copiar nomes/slugs nem guardar array/JSON sem integridade.
- [x] Preparar integridade nativa por referência composta e constante gerada: somente feriados podem ser associados; desclassificar data vinculada é recusado; exclusão do parceiro/data remove apenas vínculos correspondentes. Não preencher seleções automaticamente.
- [x] Preparar RLS de leitura herdando escopo real do parceiro e escrita administrativa; invoker RPC atômica de substituição com lock por parceiro, validação de IDs, deduplicação, array vazio para limpar e retorno canônico. Sem regravar campos do parceiro ou abrir acesso anônimo/portal.
- [x] Verificar migrations reais em PostgreSQL17 isolado: integridade, RLS, rollback inclusive após remoções, concorrência nas duas ordens e cascades;18 grupos PASS.
- [x] Aplicar a migration preparada após concluir confirmação da ferramenta; confirmar catálogo/permissões/contrato remotos e registrar versão efetivamente aplicada. Não assumir que o SQL já existe em produção.
- [x] Integrar tipos/models/leituras e cache por identidade/parceiro; respostas antigas de outra marca/sessão não alteram seleção atual. Mudanças no cadastro de feriados atualizam opções/associações.
- [x] Criar seção “Feriados da marca” na gestão do parceiro, com Prism, busca por título, seleção múltipla e identificação por título/data, sem limitar ao mês atual. Permitir adicionar/remover/limpar e mostrar itens/quantidade escolhidos.
- [x] Tratar carregamento, catálogo vazio, erro e retry; falha de leitura nunca vira seleção vazia gravada por cima da lista real. Controle rotulado, teclado e nomes longos utilizáveis em largura estreita; preservar AppBar/rolagem.
- [x] Na edição, integrar autosave da seleção com feedback confirmado e retry, preservando escolha local na falha; serializar envios e impedir respostas antigas de sobrepor última escolha. Autosave de outros campos não apaga vínculos.
- [x] Na criação, manter seleção local até haver ID real do parceiro; persistir vínculos e tratar falha parcial sem criar parceiro duplicado. Repetir somente etapa pendente e anunciar sucesso completo somente após confirmação durável.
- [x] Validar marca A/B independentes, seleção/reabertura, remoção/limpeza, criação parcial/retry, falhas, edição de outro campo, teclado e largura estreita; documentação/checks proporcionais, build se publicar.

O campo de classificação do #01 já está disponível. Ainda não há tabela de vínculos/RPC na produção: ambas as solicitações de confirmação da ferramenta expiraram sem aplicar. A mensagem da interface sobre desclassificação vinculada deverá orientar remover vínculos primeiro. Uso desses vínculos para filtrar calendários/gerar Planejamento/impedir agendamento fica fora deste ticket.
