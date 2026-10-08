# Passo 1 — integração real no staging, 07/10/2026

## Resultado e escopo

A matriz abaixo passou no projeto separado `zacrrtilppvekiyoybzn`, usando o aplicativo Node/Vite staging em `http://127.0.0.1:5180`. Integração realizada com Auth oficial, JWT, PostgREST, RPCs e OpenAI reais. Navegador controlado pelo Codex; administrador entrou com ajuda do proprietário. Nenhum acesso a produção, deploy, commit ou alteração da integração externa de leads nesta entrega.

Este resultado encerra a matriz de integração deste passo; não certifica todas as jornadas da auditoria, Vercel ou aparelho físico. HEAD de referência: `0f8c637ee7da38d25b0b54a8cb290ff47984ae01`. O checkout já continha alterações extensas das entregas anteriores, preservadas.

## Evidências reais

| Fluxo | Verificação | Resultado |
| --- | --- | --- |
| IA/API estrita | Uma geração com JWT real; comparação de attempts antes/depois no usuário/dia UTC | 200, legenda válida, incremento exato de 1 |
| IA/interface | Gerar legenda no drawer, aguardar, atualizar, fechar, recarregar e reabrir | Legenda gerada e persistida; segunda chamada real nesta rodada |
| Contas de clientes/API | Administrador cria DTO sem senha/hash, altera por RPC, desativa; colaborador tenta administrar | Sucessos autorizados e recusa 403 |
| Sessão do portal/API | Login, cookie HttpOnly, verify, logout, alteração da senha descartável e desativação | Sessões anteriores recusadas com 401 nos casos de revogação |
| Escopo do portal/API | Ação própria, alheia, parceiro arquivado e visitante anônimo | Própria disponível; alheia/arquivado 404; anônimo 401 |
| Comentários/API | Origin externo, autor forjado, criação e edição autorizadas | 403/400 nas recusas; autor e audiência definidos pelo servidor |
| Pessoas/RPC | Atualização administrativa e tentativa do colaborador | Persistência autorizada; recusa do colaborador; nome original restaurado |
| Criação de usuário/API + banco | Admin cria Auth, insere people completo como o fluxo existente e nova pessoa faz login; colaborador tenta criar | 200 e login oficial; colaborador 403, anônimo 401 |
| Portal/interface | Login com cliente descartável, calendário/feed, abrir ação, tentar URL alheia e sair | Conteúdo próprio renderizado; sem dados alheios; logout retorna ao login |
| Revisão pública/API | Gerar, ler sem sessão, parceiro errado, somente ids, revogar | Token e escopo respeitados; revogada recusada |
| Revisão pública/interface | Gerar no calendário do parceiro, abrir URL sem sessão do portal, revogar e recarregar | Ação renderizada; depois “Acesso Não Disponível” |
| Lote/interface + banco | Selecionar duas ações, alterar para Feito e conferir os dois registros reais | Toast de duas confirmações e fases done persistidas; fases originais restauradas |
| Concorrência/banco | Dois PATCHs simultâneos com a mesma versão retornada; tentativa de escrever ação alheia | Exatamente uma escrita confirmada; outra com zero registros; ação alheia recusada |

São chamadas reais, não respostas simuladas. O runner temporário de API terminou com 11 casos aprovados e zero falhas após correção dos dois erros de expectativa do próprio roteiro: nome isolado não revoga sessão e revisão usa parâmetro `r`, não `token`. A geração/quota foi aferida separadamente na primeira execução; a repetição do runner usou SKIP_AI para evitar outra cobrança. Houve duas gerações reais no total, uma na API e outra na interface.

## Defeitos encontrados e correções mínimas

1. **Criação de usuário indisponível no Vite:** `/api/create-user` não constava no adaptador, retornando 404 sem JSON. Acrescentado o handler existente em `server/dev-api.ts`. Repetição comprovou 401 anônimo, 403 colaborador e criação administrativa real. Sem novo endpoint ou regra.
2. **Calendário do portal quebrava após login:** `Content` chamava `useAppContext` obrigatório, mas o portal não possui o contexto privado da equipe. `app/components/features/Content.tsx` agora lê esse contexto opcionalmente e monta a consulta privada de responsáveis apenas na área autenticada da equipe, quando necessária. Não foi criado provider fictício no portal nem relaxada a proteção geral de useAppContext. O teste `tests/content-portal.test.tsx` falhou antes com o erro observado e passou após a correção, renderizando DTO público sem AppContext/QueryClientProvider. Calendário e detalhe reais foram repetidos com sucesso.
3. **Compartilhar para Revisão clicável sem contexto:** o menu da Home oferecia a opção, mas seu handler dependia do parceiro da rota e não executava nada. `BulkActionMenu.tsx` desabilita a opção quando não há esse parceiro ou existe geração em andamento. Navegador confirmou desabilitada na Home e habilitada no calendário do parceiro. Compartilhamento global entre parceiros não foi implementado.

## Limpeza e preservação

Contas Auth/people, clientes, sessões, comentários e links criados exclusivamente nesta rodada foram removidos. Os dois links gerados pela interface foram revogados, a recusa foi conferida no navegador e depois os registros foram removidos. Conferência final: zero clientes descartáveis do teste, zero desses links, três pessoas e quatro ações originais do staging preservadas. Nome da pessoa, fases das ações A/3 e legenda da ação B retornaram aos valores capturados antes dos testes. A visualização Feed do parceiro foi restaurada. Attempts reais de IA permanecem registrados; não apagar contabilização para simular ausência de consumo. Segredos não foram publicados nem enviados no chat.

## Verificações de código

- `bun test`: **267 passaram, 0 falhas, 826 asserções, 22 arquivos**.
- `bun run typecheck`, `bun run lint` e `bun run build`: passaram; lint conferiu 273 arquivos.
- `git diff --check`: passou.
- Aviso já existente de chunks maiores que 500 kB permanece; não indica falha de build.

## Limites e próximo passo

- Criação/edição administrativas passaram por API/RPC/Auth reais; não foi percorrida toda a interface dos formulários administrativos. Cookie Secure em HTTPS/Vercel ainda depende do ambiente publicado.
- Lote com sucesso e CAS concorrente passaram com banco real. Falha parcial/retry de lote na UI nesta rodada não foi provocada; os testes controlados anteriores continuam sendo a evidência específica desse caso.
- O modo Feed do parceiro abre a gaveta ao clicar no card e não participa da seleção em lote como o calendário. Registrar como limitação de interação a decidir, sem ampliar esta correção.
- A ação alheia no portal mostra mensagem genérica de falha; o servidor mantém o isolamento. Melhorar essa mensagem é refinamento de UX, não correção de autorização pendente.
- Safari/telefone, teclado virtual, upload Cloudinary real e percurso completo de foco continuam para o passo móvel. As confirmações anteriores do proprietário não equivalem à matriz completa.
- Produção não recebeu migrations nem esta versão. Verificar contratos/env e implantação coordenada antes de publicar. Os avisos de SECURITY DEFINER do Advisor continuam com os limites do relatório cloud anterior.
- **Próxima entrega: passo 2, integração de leads em `/Users/euchicosousa/vercel/lead`.** Conferir criação e retomada do formulário e substituir autorização anônima por ID por um contrato seguro, antes de fechar as permissões do banco atual. Não aplicar esse fechamento isoladamente.
