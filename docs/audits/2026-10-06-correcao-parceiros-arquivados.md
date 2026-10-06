# Regressão: parceiros arquivados voltavam à operação

Data: 06/10/2026. Aplicativo existente `/uzzina`.

## Causa identificada

A mudança de sincronização dos parceiros em `app/routes/app.tsx`, introduzida no commit `2680711`, passou a executar `getAllPartners` para administradores. Esse model intencionalmente inclui arquivados para consultas administrativas. O resultado substituía a lista operacional do bootstrap.

O layout e a página administrativa também usavam a mesma chave de cache `['partners']`, apesar de precisarem de listas diferentes. Visitar a administração podia colocar a lista completa no contexto da home. Home, cabeçalho e consultas de atrasados extraíam os slugs desse contexto: parceiros arquivados voltavam à operação, e suas ações eram consideradas.

A causa principal não estava na data nem na ausência de um campo de ação. O campo necessário é `partners.archived`. `actions.archived` tem outro significado e não substitui a verificação do parceiro. A revisão anterior deveria ter capturado essa regressão.

Na revisão das mudanças dos tickets01–03 também foi encontrada uma omissão em `api/dash-data.ts`: a autorização verificava parceiros vinculados à conta, mas não excluía os arquivados. Essa omissão foi corrigida, junto com o mesmo critério no endpoint de comentários/anexos do ticket04.

## Correção aplicada

- Novo model `getOperationalPartners`: administrador recebe parceiros não arquivados; colaborador recebe parceiros não arquivados aos quais pertence. `getAllPartners` continua disponível para consultas administrativas completas.
- Cache operacional separado por usuário e perfil: `['partners','operational',userId,isAdmin]`. Administração: `['partners','admin']`. Invalidação pelo prefixo `['partners']` continua funcionando, inclusive ao arquivar/desarquivar.
- Bootstrap e contexto filtram arquivados, e menus, barra e busca global recebem a lista operacional. A administração mantém ativos e arquivados para consulta/reativação.
- Home, Hoje, cabeçalho e página do parceiro usam a lista de slugs como parte da identidade das consultas. A lista e as contagens da home/Hoje/cabeçalho descartam ações sem parceiro operacional, mesmo que uma resposta/cache antigo ainda as contenha.
- Uma ação compartilhada entre parceiro arquivado e parceiro ativo continua válida para o parceiro ativo. Ação exclusivamente de parceiro oculto fica fora da operação.
- `/api/dash-data` usa apenas parceiros vinculados e não arquivados na listagem, calendário e detalhe. `/api/dash-action` aplica o mesmo critério à leitura de comentários e às mutações. Não depende de o DTO público expor `archived`; o servidor filtra o campo no banco.
- Não foram alteradas datas, fases ou regras de conclusão. Nenhum parceiro ou ação foi apagado. Nenhuma migration foi necessária ou aplicada.

## Validação

- `tests/partner-visibility.test.ts`: model operacional real para admin/colaborador, preservação da consulta administrativa completa, descarte de ação de parceiro oculto e isolamento do cache. O caso do administrador falhou antes da correção e passou depois.
- `tests/entrega3.test.ts`: handler real não lista parceiro arquivado nem autoriza seu detalhe. Teste inicialmente falhou, depois passou.
- `tests/portal-actions.test.ts`: arquivar parceiro impede leitura de comentários/vínculo de anexo no handler real. Teste inicialmente falhou, depois passou.
- `bun test`: 153 passaram, zero falharam, 425 assertions, 8 arquivos. Banco/HTTP são controlados nas verificações de código; isso não comprova RLS em banco real.
- Tipagem, lint e build passaram. Aviso de bundle grande permanece anterior à correção.
- `scripts/check-partner-visibility-browser.cjs`: navegador real, interface e SDK Supabase reais, HTTP controlado. Bootstrap/respostas de ações contêm propositalmente um parceiro oculto e sua ação. A home descarta ambos; a administração lista o arquivado; retornar da administração para a home não contamina o contexto. O contador de atrasados fica em 1 para a única ação ativa, apesar de a resposta conter duas ações. Requisições operacionais não enviam slug oculto.

## Limites e orientação

Não houve acesso a registros reais nem implantação. A reprodução usa respostas HTTP controladas e não comprova o comportamento do banco de produção. Após atualizar a versão local, conferir a home com a conta real; não apagar dados para ajustar contagem.

Preservar essa separação entre cadastro administrativo e contexto operacional nos próximos tickets. Não considerar que um administrador deva incluir parceiros arquivados automaticamente em Hoje/calendário/atrasados. As pendências de banco/segurança/produção descritas nos fechamentos01–04 continuam vigentes. Próximo ticket do pacote continua05.
