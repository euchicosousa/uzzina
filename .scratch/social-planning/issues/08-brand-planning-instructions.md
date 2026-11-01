# 08: Reutilizar instruções de planejamento por marca

**What to build:** cada marca mantém suas próprias instruções reutilizáveis de planejamento. A equipe encontra as instruções salvas e pode editá-las conforme sua permissão, sem reescrevê-las a cada planejamento nem misturá-las com o tema ou pedido pontual de uma proposta.

**Blocked by:** None (can start immediately). O Planejamento já está em validação pelo proprietário; o campo de banco já foi aplicado. Não depende dos tickets de feriados.

**Status:** partial — Supabase concluído em01/11/2026; integração do aplicativo e implementação visual ficam para outro agente. Este registro não autoriza execução automática do restante.

- [x] Criar `partners.planning_instructions` como texto opcional, vinculado à identidade estável do parceiro. `NULL` representa ausência de instruções, sem copiar contexto/tom/dados de outra marca nem preencher conteúdo automaticamente.
- [x] Aplicar migration incremental em produção e verificar catálogo: text nullable sem default;30 parceiros anteriores com valor nulo; dados originais, RLS, policies e grants preservados.
- [x] Conferir leitura remota com administrador e membro ativo respeitando escopo atual de parceiros. Escrita continua sujeita à política administrativa vigente; nenhuma autorização nova foi concedida.
- [ ] Propagar campo a tipos, models e contratos usados pelo aplicativo e bootstrap quando pertinente; consultas novas passam por models. Preservar compatibilidade com parceiros sem instruções e salvamento de outros dados.
- [ ] Conectar o campo de instruções do Planejamento à marca selecionada: carregar valor persistido, oferecer edição/salvamento para administrador e leitura para membros autorizados, sem ampliar permissão de edição do parceiro.
- [ ] Manter instruções reutilizáveis distintas do tema/direcionamento pontual. Usar as instruções da marca como orientação no fluxo de geração pertinente, sem gravar automaticamente temas de um lote como orientação permanente nem substituir contexto/tom de voz.
- [ ] Tratar ausência, carregamento, falha, envio pendente e retry. Salvar confirma valor durável; limpar grava ausência de instruções. Falha mantém edição para nova tentativa e não anuncia sucesso.
- [ ] Preservar edição local e tratar troca de parceiro sem misturar instruções. Leituras/respostas antigas, troca de sessão e refetch não sobrescrevem edições atuais silenciosamente. Cache inclui identidade/parceiro e usa confirmação canônica.
- [ ] Salvar instruções altera somente esse campo. Autosave de contexto, tom, cores ou responsáveis não apaga instruções, e falha antiga não restaura snapshots completos.
- [ ] Reutilizar Prism/estilo da página e preservar modos, controles e rolagens; rótulos em português, teclado e feedback acessível. Não migrar todo o armazenamento de planejamentos do navegador para Supabase por consequência.
- [ ] Validar marca A/B independentes, vazio, editar/salvar/reabrir, limpar, falha/retry, troca de parceiro/sessão, edição de outro campo e leitura sem edição por membro; conferir uso no gerador e aceite visual do proprietário. Checks proporcionais ao risco e build ao publicar.
- [ ] Atualizar documentação/CURRENT com estado efetivo da integração, distinguindo SQL aplicado de frontend publicado.

Somente o banco foi executado nesta rodada. Não há mudança de UI, tipos, models ou gerador. Não importar instruções do navegador automaticamente nem criar tabela de planejamentos; o proprietário confirmou armazenamento reutilizável por marca/parceiro.
