# 04: Arquivos e comentários com autoria do servidor

**What to build:** Cliente autorizado anexa arquivos e conversa na ação; não acessa notas internas nem altera mensagens alheias.

**Blocked by:** 03

**Status:** ready-for-agent (respeitar bloqueadores; pacote local)

## Execução prescrita
Arquivos: app/routes/dash/action/$id.tsx; app/models/action_comments.ts (preservar uso do time); app/services/dash-client.ts. Criar api/dash-action.ts.
1. Endpoint autenticado com helper 02 e verificação de ação/parceiro do 03. GET comments retorna apenas is_internal=false e DTO de comentário público; não usa helper browser de attachAuthorsImages para enumerar people/clients.
2. POST comment recebe somente actionId/content; servidor deriva author_id/name da sessão e fixa is_user=false,is_internal=false,mentions=[]. Comprimento 1–10000 após trim. Author/image do DTO são montados no servidor.
3. PATCH comment e DELETE comment exigem comentário público, is_user=false e author_id da sessão, além de ação autorizada. Corpo não redefine audiência, autor ou ação. Zero linhas confirmadas:404, não sucesso.
4. PATCH work-files aceita somente actionId e work_files array até100 URLs http/https, cada URL até2048 caracteres. Valida escopo e não aceita outros campos da ação. Retorna representação/quantidade confirmada. Upload continua Cloudinary; isto autoriza o vínculo do arquivo, não implementa serviço de mídia.
5. Checar Origin em mutações com cookie. Substituir operações diretas do portal, mantendo métodos do time em seus caminhos existentes.

## Testes e alcance
Interface: handler real e detalhe real. A tenta escrever em ação B →404 e zero writes. A tenta modificar mensagem de B/interna →404. Tentar enviar author_id/is_internal produz400 ou são recusados pelo schema estrito. Nota interna nunca vem na resposta GET. Falsificar apenas banco/HTTP.
BANCO: 07. NAVEGADOR: N04 do 17.

## Acceptance criteria
- [ ] Portal não grava diretamente actions/action_comments.
- [ ] Autor e audiência vêm do servidor; notas internas não saem.
- [ ] UI confirma apenas operação efetivamente gravada.

## Resultado do executor
Código: pendente. Teste local: pendente. Banco: verificar alcance acima. Navegador: pendente conforme17. Produção: não implantado.

