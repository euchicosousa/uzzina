# Instruções de planejamento por marca — banco aplicado em01/11/2026

O proprietário confirmou que as instruções pertencem ao parceiro e são reutilizáveis. Autorizou criar o campo diretamente no Supabase e registrar ticket para outro agente concluir o aplicativo, sem alteração visual nesta rodada.

## Aplicação

- Projeto de produção `dfepmjcozszswocwvdpq` (bussola/UZZINA), PostgreSQL17.11.
- Campo `public.partners.planning_instructions text`, opcional, sem default. `NULL` significa que não há instruções salvas.
- Migration local [20261101225657_partner_planning_instructions.sql](../../supabase/migrations/20261101225657_partner_planning_instructions.sql), SHA256 `e17e844521c819838c1ba20d2d70c9b00bddf3d3bc71d59892a9a7910cf399d4`.
- Migration remota `20261101225709`, nome `partner_planning_instructions`, aplicada com sucesso por `apply_migration` e conferida no catálogo/histórico. Não houve replay do histórico parcial ou db push/repair/reset.

## Verificação e limites

Catálogo confirma text nullable sem default;30 parceiros antes/depois, todos inicialmente com valor nulo. Hash dos dados originais (excluindo a nova coluna) permaneceu igual: `817422cfcdb8cdd141b4cced04fbc7c2`. RLS continua ativa; policies e grants de parceiros foram comparados antes/depois e não mudaram. A leitura acompanha o escopo atual do parceiro e escrita permanece administrativa, sem permissões novas para portal/anônimos.

Leituras reais sob `SET LOCAL ROLE authenticated` e claims de administrador/membro ativos confirmaram que o campo pode ser consultado e que a contagem visível corresponde ao escopo esperado de cada identidade. Transações read-only com rollback, sem imprimir identidades ou conteúdo privado. Não houve ensaio de INSERT/UPDATE remoto ou fixture de escrita: autorização de escrita não foi certificada por uma nova tentativa efetiva nesta entrega; policies vigentes foram preservadas. Não criado/executado teste automatizado ou build para essa expansão simples; catálogo/leituras/diff são as verificações pertinentes.

Nenhuma mudança de UI, tipos, models, gerador, APIs ou armazenamento local de planejamentos. Nenhuma importação de instruções, commit, push ou deploy. Campo disponível no banco não significa que a interface já o lê ou salva.

## Continuação por outro agente

[Ticket08 — Reutilizar instruções de planejamento por marca](../../.scratch/social-planning/issues/08-brand-planning-instructions.md): integrar tipos/models/cache, leitura/edição/salvamento com permissões atuais e uso das instruções no planejamento; preservar distinção entre orientação da marca e tema/pedido pontual. Tratamento visual/erros/concorrência e validação do proprietário continuam pendentes. Não criar tabela de planejamentos por consequência: hoje as propostas estão no armazenamento do navegador.
