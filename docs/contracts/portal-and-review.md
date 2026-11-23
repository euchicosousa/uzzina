# Contratos: portal /dash

> Movido de `AGENTS.md` em 07/11/2026 (ticket DOC-01), sem reescrever as regras. O `AGENTS.md` aponta para este documento. Ao mudar um contrato desta área, atualize-o aqui.

Leia antes de mexer no portal `/dash`, em `/api/dash` (e rewrites legados `/api/dash-*`) ou no componente `Content` compartilhado.

## Autenticação e dados

- `/dash` usa a função unificada `/api/dash` (`api/dash.ts`), que despacha para `server/dash-auth-handler.ts` (`?scope=auth`), `server/dash-data-handler.ts` (`?scope=data`) e `server/dash-action-handler.ts` (`?scope=action`), preservando os caminhos legados `/api/dash-auth`, `/api/dash-data` e `/api/dash-action` via rewrites em `vercel.json`. Sessão opaca em `dash_sessions` e cookie HttpOnly (`Path=/api`), separado do Auth da equipe. `scope=data` autoriza leitura; `scope=action` autoriza comentários públicos/anexos. Autor e audiência vêm do servidor; login/logout/mutações do portal não exigem endereço/Origin autorizado, conforme remoção explícita pelo proprietário em01/11/2026. `app/services/dash-client.ts` não acessa diretamente o SDK do banco.

- A retomada da sessão, a leitura de dados e as operações de comentários e anexos consultam a mesma função `findDashSession` no servidor. Cada requisição distingue sessão ausente ou inválida de falha na consulta. Cada handler conserva sua consulta da conta ativa, a autorização da operação e suas respostas. Ao abrir o portal, sessão inválida leva ao login e indisponibilidade oferece nova tentativa.

- Portal aceita o endereço solicitado sem validação de Origin/APP_ORIGIN ou redirecionamento canônico obrigatório: localhost,127.0.0.1 e IP da rede seguem o mesmo fluxo. Regra removida explicitamente pelo proprietário em01/11/2026; não reintroduzir allowlist/normalização de endereço como correção automática. Autenticação por credenciais/sessão e autorização da conta/ação permanecem.

- O compartilhamento público de revisão por token foi removido do código local por decisão do proprietário. Não há substituto por link individual. A Dash continua exigindo autenticação própria.

- `Content` é compartilhado com o portal: renderize sem providers privados; monte consultas da equipe somente quando o campo e a identidade precisarem delas.

- Cor do quadradinho do conteúdo (TOP-01): `server/dash-data-handler.ts` (`/api/dash?scope=data`) lê `topic_id` e a cor do tópico (service role, `partner_topics`) e devolve em `color` a cor já resolvida (tópico, senão a cor da ação); o DTO não ganhou campo e o nome do tópico não aparece no portal. `Content` não consulta tópicos fora do app da equipe (`TeamContent` só existe com `AppContext`). O SQL dos tópicos precisa estar aplicado antes do deploy, porque `server/dash-data-handler.ts` seleciona `topic_id`.
- No calendário de `/dash`, o ícone abaixo da capa identifica a categoria da ação e fica ao lado da hora.

## Login do portal

Login do portal usa o mesmo layout/estilo do login principal: frame de28rem, logo, campos com ícones, espaçamento, alerta e botão à direita. Não acrescentar mensagem introdutória ou margens próprias ao portal. A autenticação do portal continua no seu serviço existente.

O portal e suas rotas filhas usam a paleta pública neutra, inclusive login; cores próprias do parceiro continuam nos elementos que as recebem diretamente. A escolha visual está pendente de aceite.
