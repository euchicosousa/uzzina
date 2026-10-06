# Fechamento do ticket 04 — comentários e anexos do portal

Atualização posterior: corrigida a regressão de parceiros arquivados e a omissão de archived nos endpoints. Ver [correção de visibilidade](2026-10-06-correcao-parceiros-arquivados.md).
Data: 06/10/2026. Aplicativo existente: `/uzzina`. Sem redesign ou troca de stack.

## Situação

Código implementado e verificado localmente. Integração com banco real e produção pendentes. Este fechamento não libera a implantação isolada dos tickets de segurança: preservar a condição do pacote, que exige 02–07 compatíveis, migrations aplicadas e políticas verificadas em ambiente de teste.

## O que mudou

- `api/dash-action.ts`: endpoint de leitura e escrita com cookie de sessão opaca, verificação de expiração/revogação, conta ativa e interseção entre parceiros da conta e da ação. Mutações exigem Origin aprovado pelo helper da sessão. Respostas usam `Cache-Control: no-store`.
- Comentários públicos são consultados no servidor e paginados em lotes de 500, com ordenação por data e ID. A resposta contém campos explícitos; não retorna notas internas, informações de login dos autores ou campos extras da tabela. Imagens são consultadas no servidor apenas para os autores presentes nos comentários públicos autorizados.
- Criação aceita somente `actionId/content`. O servidor deriva nome e ID do autor e fixa `is_user=false`, `is_internal=false`, `mentions=[]`. Conteúdo entre 1 e 10000 caracteres após trim.
- Edição/exclusão exigem comentário da mesma ação autorizada, público, de cliente e pertencente à conta autenticada. Os filtros são repetidos na gravação. A alteração precisa retornar a linha afetada; ausência retorna 404. Erro de infraestrutura retorna 503, sem confirmação de sucesso.
- Anexos aceitam somente `actionId/work_files`, até 100 URLs HTTP/HTTPS de até 2048 caracteres. A gravação também filtra pelos parceiros autorizados e retorna ID, lista e quantidade confirmadas. Não permite alterar fase, autor ou outros campos de ação.
- O endpoint local também foi conferido por HTTP real sem cookie: respondeu 503 em JSON pela configuração ausente, em vez de servir a página da SPA; nenhuma consulta de dados foi executada.
- `app/services/dash-client.ts` centraliza as chamadas HTTP. A tela de detalhe não instancia o SDK do banco nem chama os models de comentários da equipe. O adaptador de desenvolvimento atende o novo endpoint real.
- A tela mostra falhas de comentários com tentativa de recuperação; não apresenta falha de leitura como lista vazia. Erros de sessão são tratados nas leituras e mutações.
- Comentários novos só limpam o campo depois da confirmação. Edição aguarda a gravação; em erro, mantém editor e rascunho. Exclusão não remove visualmente a mensagem antes da confirmação.
- Anexos exibem a lista confirmada. Escritas de anexos da mesma tela são serializadas, para uploads múltiplos não dispararem gravações paralelas. O cache recebe a lista retornada pelo servidor, sem uma recarga antiga desfazer essa confirmação. Isso não resolve concorrência entre outras telas/usuários, assunto do ticket 08.
- No navegador foi encontrado um problema real de clique: o horário sobrepunha os controles de edição/exclusão. Os controles passaram para o fluxo normal, receberam nomes acessíveis e permanecem visíveis em telas pequenas. Remoção de anexo também recebeu nome acessível.

Os models de comentários usados pela equipe foram preservados. Componentes compartilhados continuam aceitando callbacks síncronos; o portal fornece callback assíncrono para aguardar confirmação da edição. Cloudinary continua responsável pelo upload; o novo endpoint autoriza o vínculo da URL à ação.

## Contrato HTTP

| Método e operação | Entrada | Confirmação |
|---|---|---|
| GET `?op=comments&actionId=...` | Ação | `{ comments: [...] }` |
| POST `?op=comment` | `{ actionId, content }` | 201 `{ comment }` |
| PATCH `?op=comment` | `{ actionId, commentId, content }` | 200 `{ comment }` |
| DELETE `?op=comment` | `{ actionId, commentId }` | 200 `{ deletedId }` |
| PATCH `?op=work-files` | `{ actionId, work_files }` | 200 `{ actionId, work_files, count }` |

Campos adicionais nas mutações são recusados. Códigos: 400 entrada inválida; 401 sessão ausente/inválida ou conta inativa; 403 Origin recusado; 404 ação/mensagem ausente ou sem autorização; 405 método não suportado; 503 infraestrutura indisponível. Em produção é necessário `APP_ORIGIN`, além das variáveis de servidor já exigidas pelos tickets anteriores.

## Evidências de código e TDD

Interface acordada pelo ticket: handler real e detalhe real. Banco/HTTP são as fronteiras controladas; os testes não reimplementam regras de autorização em funções paralelas.

- `tests/portal-actions.test.ts`: 27 casos do handler real, com SDK do banco controlado. Incluem ação alheia, autoria falsa, notas internas, mensagens da equipe/com mesmo ID de autor, outra ação, criação/edição/exclusão, zero linhas, falha de banco, Origin, sessão, limites de conteúdo e URLs.
- `tests/portal-client.test.ts`: três casos adicionais nas funções HTTP reais verificam ausência de confirmação, 401/404 e resposta inválida de comentários.
- Foi observado vermelho antes de implementar os fluxos de autorização, leitura, criação, edição/exclusão e confirmação de anexos. Depois das mudanças, os mesmos testes passaram.
- Suíte completa: `bun test` — **146 passaram, 0 falharam, 413 assertions, 7 arquivos**. O total inclui testes históricos; não significa que todos os testes antigos sejam adequados, nem que toda a auditoria foi encerrada.
- `bun run typecheck` passou. `bun run lint` passou sem apontamentos. `bun run build` passou; permanece o aviso anterior de bundle acima de 500 kB.

## Navegador real — alcance parcial de N04

Script reproduzível: `scripts/check-portal-actions-browser.cjs`. Executado em Chromium, 390×844 e 1440×844. A aplicação e os componentes reais são renderizados; respostas HTTP são controladas, e requisições externas são bloqueadas.

Confirmado: recuperação de leitura de comentários; criação com falha/reenvio; rascunho preservado em falha de edição; edição confirmada; falha e confirmação de exclusão; falha e confirmação de remoção de anexo; ausência de campos de autoria/audiência no pedido do navegador; ausência de exceções não tratadas.

O teste inicialmente falhou tanto na interação bloqueada pelo horário quanto na perda do texto após erro de edição. As correções foram aplicadas e o fluxo passou sem forçar cliques.

Para reproduzir: iniciar `bun run dev --host 127.0.0.1 --port 5176`; executar o script com um Playwright/Chromium já instalado. Variáveis opcionais: `PLAYWRIGHT_MODULE`, `PLAYWRIGHT_EXECUTABLE`, `PORTAL_TEST_URL`, `PORTAL_TEST_WIDTH`. Nenhuma dependência nova foi instalada.

## O que permanece pendente

1. **Banco / ticket 07:** executar integração em banco de teste com dados de duas contas, migrations de sessão aplicadas e policies/RLS verificadas. O banco controlado testa o código do handler; não comprova isolamento físico nem fecha acessos diretos antigos por outras interfaces.
2. **N04 completo / ticket 17:** confirmar persistência e recarga com cookie/banco reais; upload real pelo Cloudinary seguido de vínculo; tentativa real de acesso cruzado e ausência de notas internas no tráfego. A sessão e as respostas foram controladas no teste da interface. Não chamar isso de integração ponta a ponta com o banco.
3. **Concorrência / ticket 08:** o endpoint ainda recebe a lista completa de anexos. Atualizações de telas/usuários diferentes precisam da política de concorrência prevista naquele ticket. Alteração de escopo entre consultas também requer garantia transacional de banco, não comprovada aqui.
4. **Produção:** sem deploy, sem aplicação de migration e sem alteração de registros reais. A proteção de outros caminhos, especialmente links de revisão, depende dos tickets seguintes.

Próximo trabalho prescrito: ticket 05, links de revisão. Preservar os tickets 01–04 e não reimplementá-los do zero.
