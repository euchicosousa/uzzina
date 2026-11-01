# Feriados associados à marca — ticket proposto

Preparado em01/11/2026 com To Tickets. Posteriormente o proprietário autorizou somente a etapa Supabase com subagentes. SQL preparado e validado em PostgreSQL isolado; aplicação remota pendente porque a confirmação da ferramenta expirou duas vezes. Interface e integração adiadas. O [ticket individual](../../.scratch/brand-holidays/issues/02-partner-holidays.md) contém o checklist vigente; [relatório](../audits/2026-11-01-holiday-schema.md) distingue banco preparado/aplicado.

## 1. Definir e persistir os feriados de cada parceiro na gestão da marca

**O que construir:** na página existente de gestão do parceiro, administradores escolhem quais feriados cadastrados se aplicam à marca, removem associações e encontram a mesma seleção ao reabrir. Cada parceiro mantém uma lista independente, vazia inicialmente.

**Bloqueado por:** ticket “Marcar datas comemorativas como feriado no cadastro e nas visualizações”, proposto anteriormente. A classificação `is_holiday` deve estar disponível e aplicada no ambiente usado pela funcionalidade. Não depende da implementação de Planejamento.

**Status:** parcial — banco preparado/testado, sem aplicação remota; restante do aplicativo adiado. O campo de classificação do ticket anterior já está aplicado no banco; não é necessário concluir sua interface para retomar este ticket.

### Persistência e integridade

- [ ] Representar a lista por relação muitos-para-muitos, preferencialmente `partner_holidays`, com `partner_id` e `celebration_id` do tipo UUID, referenciando os IDs reais e estáveis de parceiros e datas comemorativas. Usar chave composta para impedir duplicação e índice reverso quando necessário para as referências. Não guardar títulos, slugs ou cópias de datas como identidade, nem arrays/JSON sem integridade referencial na linha do parceiro.
- [ ] Parceiros existentes começam sem vínculos; não associar automaticamente todos os feriados. Um mesmo feriado pode pertencer a várias marcas.
- [ ] Validar no banco que novas associações apontam para datas existentes marcadas como feriado, inclusive diante de alteração concorrente da classificação. Não confiar apenas nas opções filtradas da interface.
- [ ] Remover um vínculo afeta somente a seleção daquela marca. Proposta de ciclo de vida: apagar parceiro ou data elimina seus vínculos por integridade referencial; tentar desmarcar “É feriado” em uma data ainda associada é recusado com mensagem útil, orientando remover os vínculos primeiro. Assim não há perda silenciosa da seleção. Confirmar essa regra na aprovação do ticket e cobri-la também na edição da data comemorativa.
- [ ] Salvar a seleção como uma única operação atômica e autorizada: falha não pode deixar metade da lista removida/adicionada. Repetir o mesmo salvamento não cria duplicatas. Escritas da seleção não sobrescrevem contexto, responsáveis, cores ou outros campos do parceiro, nem são apagadas pelo autosave desses campos. Coordenar envios da seleção para que uma resposta antiga não substitua a última escolha.

### Gestão do parceiro

- [ ] Incluir seção “Feriados da marca” na página existente de criação/edição do parceiro, usando controles Prism e o estilo atual. Seleção múltipla com busca por título e identificação por título/data; mostrar apenas datas marcadas como feriado, sem limitar silenciosamente ao mês atual.
- [ ] Carregar e exibir a seleção persistida ao editar; permitir adicionar, remover um item e limpar todos. Mostrar quantidade/itens selecionados e estados claros de carregamento, erro e ausência de feriados cadastrados. Falha na leitura não pode ser interpretada como lista vazia e gravada por cima da seleção real.
- [ ] Na edição, acompanhar o salvamento automático já existente na gestão do parceiro, com estado de salvando/salvo/erro e possibilidade explícita de tentar novamente. Em falha, conservar a escolha local e não apresentar sucesso antes da confirmação durável do banco.
- [ ] Na criação, manter a seleção local até salvar o parceiro; persistir usando o ID real retornado, sem vincular ao slug. Tratar falha parcial sem duplicar parceiro em uma nova tentativa: indicar se a marca já foi criada e permitir repetir somente a associação pendente. Não anunciar conclusão total enquanto os vínculos não forem confirmados.
- [ ] Confirmar dados canônicos após salvar e atualizar/invalidate os caches de detalhe e da relação pertinentes. Trocar de parceiro ou de sessão não reaproveita seleções nem aplica respostas antigas na marca atual. Chaves incluem identidade e parceiro. Alterações/exclusões no cadastro de feriados atualizam opções e vínculos exibidos.
- [ ] Controles têm rótulos em português, operação por teclado e feedback acessível; nomes longos e lista extensa continuam utilizáveis em largura estreita. Preservar AppBar e rolagem da página. Não criar novos primitivos se os existentes atenderem.

### Autorização, entrega e verificação

- [ ] Ativar RLS e grants mínimos na nova relação. Leitura acompanha o escopo autorizado de leitura do próprio parceiro; escrita exige administrador ativo e validação do parceiro/feriado. A operação atômica mantém essas verificações no banco. Não ampliar acesso do portal, revisão pública ou anônimos.
- [ ] Integrar modelos, contratos e tipos da relação e dos resultados utilizados; acessos do frontend passam por models, sem consultas novas diretamente em componentes/rotas. Consultas existentes de parceiro permanecem compatíveis com o vínculo separado.
- [ ] Preparar migration incremental após conferir catálogo/manifest vigentes, sem aplicar o histórico completo ou executar reparos cegos. Documentar separadamente SQL preparado, aplicação e verificação real, frontend local e publicação Ready.
- [ ] Verificar integridade e autorização reais em ambiente adequado: feriado inexistente/não classificado recusado, duplicação impedida, não administrador sem escrita e parceiro fora do escopo sem leitura. Teste mínimo pertinente para operação atômica/falhas e concorrência de seleção; não criar suite ampla por rotina nem encaminhar fixtures de escrita para produção. Conferir tipos e formatação; build ao publicar e testes serverless quando os caminhos alterados os exigirem.
- [ ] Roteiro visual: selecionar dois feriados na marca A, salvar/reabrir, conferir marca B independente, remover/limpar seleção, criar marca com seleção, simular falha/retentar sem duplicar marca, editar outro campo sem apagar vínculos, conferir teclado e largura estreita. Não tratar suite verde como aceite visual.
- [ ] Atualizar guia de agentes, conhecimento de banco/arquitetura pertinente e CURRENT com contrato, verificações e pendências reais na execução.

### Escopo

Este ticket entrega a associação persistida e toda a sua gestão. Uso dessas escolhas para filtrar calendários, gerar Planejamento ou impedir agendamentos exige trabalho separado; não está implícito no cadastro. Não inclui recorrência, calendário oficial, localidade ou importação automática de feriados.

### Evidência e decisões propostas

Código atual conferido: gestão de parceiro é administrativa, cria manualmente e edita por autosave; usa model compartilhado e invalida caches de parceiros. Datas comemorativas são globais e têm identidade UUID; classificação como feriado ainda é proposta do ticket anterior. Não foi inspecionado nem alterado o banco remoto. Relação muitos-para-muitos, lista inicialmente vazia e recusa de desclassificação enquanto houver vínculos são propostas explícitas para aprovação.
