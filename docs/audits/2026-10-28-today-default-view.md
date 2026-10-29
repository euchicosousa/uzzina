# Hoje — visualização inicial compartilhada

Em28/10/2026, o proprietário aprovou o ticket01, autorizou seu commit local e pediu seguir para o ticket02. Ticket01 commitado em `064948e`, sem push; arquivos externos de IA não incluídos.

## Resultado local

Minha Conta oferece “Visualização inicial do Hoje”, independente de Layout Padrão dos clientes: Parceiros, Kanban, Categorias ou Feed. Escolha permanece rascunho até Salvar Alterações. `defaultTodayView` tem tipo/validação compartilhados e fallback Parceiros para campo ausente, nulo ou inválido.

`HomeTodayView` e `TodayPageView` continuam separados. Cada um inicializa sua seleção uma vez a partir de `person.preferences`. Trocas manuais não persistem, não sincronizam a outra instância e permanecem durante mudança de data, dados ou resize. Remontagem/reload usa o padrão confirmado. Provider por identidade preserva isolamento entre contas. Home compacta/Kanban30vh e página dedicada com altura medida permanecem com os mesmos contratos.

Foi reproduzida uma concorrência real com HTTP controlado: requisição de tema iniciada antes de salvar o novo padrão retorna depois e traz uma cópia antiga de outras preferências. Antes, substituía o padrão no objeto de sessão e a próxima navegação SPA abria o modo antigo. O controlador agora informa as chaves que alterou; o hook aplica somente essas chaves sobre o objeto atual. O mesmo roteiro passou após a correção, sem alterar o merge autorizado do banco.

Enquanto o SQL aguarda aprovação, perfis legados que mantêm o default Parceiros não enviam a chave nova ao salvar outros campos. Alterar o novo padrão exige a RPC compatível; não há fallback silencioso que anuncie salvamento sem gravá-lo.

## Banco e bloqueio de aplicação

Produção: `dfepmjcozszswocwvdpq`, nome histórico bussola, conforme README e manifest de release. `zacrrtilppvekiyoybzn`, nome uzzina, é staging antigo/inativo e não foi alterado. Uma leitura inicial foi bloqueada automaticamente por confusão entre os nomes; após apresentar os vínculos do repositório, a leitura foi autorizada.

Função real de produção inspecionada: `update_my_preferences(jsonb)` valida uma lista fechada de campos, é SECURITY DEFINER com search_path vazio, pertence a postgres e exige `auth.uid()`/membro ativo. anon não executa; authenticated executa. A migration incremental `20261028201902_today_view_preference.sql` acrescenta somente o ramo que valida os quatro valores de `defaultTodayView`. `CREATE OR REPLACE` preserva owner/ACL, comprovado no banco isolado.

**Não aplicada em produção.** A revisão automática rejeitou a chamada de aplicação porque alterar uma função em produção exige autorização explícita para essa mudança concreta, além do pedido de implementar o ticket. Não foi contornada por outro executor. Consulta somente de catálogo depois da rejeição confirmou `supports_default_today_view=false`, definição MD5 `6f975115f1320e8a79f4a84776bc787d` e permissões originais. Manifest: [today-view-preference-manifest.json](../../supabase/rollouts/today-view-preference-manifest.json).

Para terminar: obter autorização específica, aplicar somente essa migration no projeto de produção identificado e verificar função/validação/ACL; depois avaliar a interface real. Não executar db push/repair/reset nem inferir que migrations históricas foram aplicadas. Código de ticket02 não foi commitado/publicado.

## Verificação

- Testes novos nos dois componentes reais falharam antes:12 falhas por inicialização ignorando preferência/parser ausente; depois passaram. Cobrem quatro modos, fallback legado/inválido, escolha manual local, atualização de data/preferências, remontagem e troca de identidade.
- Suíte:505 testes,1785 assertions em44 arquivos, zero falhas. Após a última alteração de compatibilidade do payload legado, repetidos os roteiros de navegador que exercitam ambos os tipos de envio; não repetida a suíte completa sem outra mudança nos componentes Hoje/controlador.
- PostgreSQL isolado com PGlite executou a migration original e a nova, sem copiar a lógica da função. Confirmou recusa da chave antes da alteração; depois, quatro valores válidos, recusa de tipos/valores/chaves inválidos, merge/campos desconhecidos preservados, tema coexistente, isolamento de pessoas, recusa a membro inativo/anon/sem identidade e de UPDATE direto de preferências, owner/grants preservados. Script: `scripts/check-today-preferences-sql.cjs`; módulo instalado temporariamente em `/private/tmp/uzzina-today-sql`, sem dependência adicionada ao projeto.
- Navegador real com Supabase SDK e HTTP interceptado: quatro padrões salvos/reabertos em Home e Hoje; ausência de escrita ao selecionar sem salvar ou alternar manualmente; erro/retry sem perder rascunho; reload restaura padrão; mudança de data preserva modo manual; campos desconhecidos mantidos; mobile390px. Teste adicional de resposta atrasada de tema falhou antes e passou depois. Script: `scripts/check-today-default-browser.cjs`.
- Roteiro da conta também repetido, incluindo payload legado sem a chave nova, geometria/rolagem/teclado, formulário inválido, erro/retry e Enter. Script: `scripts/check-profile-scroll-browser.cjs`.
- Capturas seletor mobile e página Hoje inspecionadas. Cenário com ações vazias no roteiro de preferência; testes existentes cobrem os contratos de altura e navegação.
- `format`, `lint`, `typecheck`, `build` e `git diff --check` passaram; aviso conhecido de chunks maiores que500kB permanece. Advisors de segurança consultados antes, sem execução de DDL remoto. Sem dados reais escritos ou fixtures em produção, teste físico de teclado virtual, SQL aplicado, push ou deploy.

## Referências técnicas consultadas

[Funções e privilégios no Supabase](https://supabase.com/docs/guides/database/functions), [índice de changelog](https://supabase.com/changelog), [alterações PostgreSQL17.11](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes) e [cifras TLS legadas](https://supabase.com/changelog/cbc-tls-ciphers-deprecated). Mudanças anunciadas não exigem alterar a lógica JSONB/PLpgSQL ou o cliente existente deste ticket.


## Ordem do seletor

A pedido do proprietário, seletor da conta reordenado para Kanban → Categorias → Feed → Parceiros, igual a TodayViewToggle. Apenas ordem visual; padrão de fallback e regras de salvamento preservados. Format/lint/typecheck e diff passaram; sem novos testes que apenas espelhem a ordem. Aplicação do SQL remoto continua aguardando autorização explícita.


## SQL aprovado e aplicado em produção

Em28/10/2026, o proprietário autorizou explicitamente “pode fazer a mudança do sql”. Essa autorização resolveu o bloqueio anterior. Revalidado antes de aplicar: função ainda com definição MD5 `6f975115f1320e8a79f4a84776bc787d`, sem ramo novo, owner postgres, SECURITY DEFINER/search_path vazio e ACL `{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}`.

Aplicada somente a migration preparada ao projeto de produção `dfepmjcozszswocwvdpq`, pela ferramenta de migrations. Confirmação de sucesso e registro remoto `20261028205047`, nome `today_view_preference`. Definição depois: MD5 `de0d9e5797bc6e1c39ba0eeb400eb46c`; ramo novo presente; owner, ACL, search_path e permissões anon/authenticated preservados. Histórico remoto é parcial: esse registro não comprova aplicação das migrations antigas.

Verificação real em produção sem fixtures ou escrita em pessoas reais: sorteada identidade UUID e comprovada sua ausência em people antes de assumir role authenticated. Os quatro valores válidos passaram pela validação e chegaram à recusa esperada de membro ativo (UPDATE com zero linhas); seis tipos/valores inválidos foram recusados por22023; ausência de identidade recusada por42501. Toda a transação foi revertida. Isso verifica validação/autorização negativa reais, sem alegar teste de gravação positiva em pessoa real. Merge e gravação positiva foram novamente testados no PostgreSQL isolado usando o SQL real e passaram.

Advisors antes/depois mantiveram os mesmos achados preexistentes, sem novo aviso. Manifest e evidência atualizados: [manifest](../../supabase/rollouts/today-view-preference-manifest.json), [verificação](../../supabase/rollouts/today-view-preference-production-verification.json). Mudança apenas de SQL e documentação nesta rodada; sem código funcional novo, commit, push ou deploy. Ticket02 implementado/verificado com banco compatível, aguardando avaliação da interface local pelo proprietário.

Capturas temporárias dessa verificação removidas em29/10/2026 a pedido do proprietário; o resultado e os limites acima permanecem registrados. Roteiros de navegador agora salvam novas capturas no diretório temporário do sistema, fora do checkout.
