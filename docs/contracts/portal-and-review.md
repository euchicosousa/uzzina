# Contratos: portal /dash e revisão pública

> Movido de `AGENTS.md` em 07/11/2026 (ticket DOC-01), sem reescrever as regras. O `AGENTS.md` aponta para este documento. Ao mudar um contrato desta área, atualize-o aqui.

Leia antes de mexer no portal `/dash`, em `/dash/review`, em `/api/dash-*`, `/api/review` ou no componente `Content` compartilhado.

## Autenticação e dados

- `/dash` usa `/api/dash-auth`, sessão opaca em `dash_sessions` e cookie HttpOnly, separado do Auth da equipe. `/api/dash-data` autoriza leitura; `/api/dash-action` autoriza comentários públicos/anexos. Autor e audiência vêm do servidor; login/logout/mutações do portal não exigem endereço/Origin autorizado, conforme remoção explícita pelo proprietário em01/11/2026. `app/services/dash-client.ts` não acessa diretamente o SDK do banco.

- Portal aceita o endereço solicitado sem validação de Origin/APP_ORIGIN ou redirecionamento canônico obrigatório: localhost,127.0.0.1 e IP da rede seguem o mesmo fluxo. Regra removida explicitamente pelo proprietário em01/11/2026; não reintroduzir allowlist/normalização de endereço como correção automática. Autenticação por credenciais/sessão e autorização da conta/ação permanecem.

- `/dash/review/$slug?r=token` é público por token. `/api/review` verifica parceiro, expiração e revogação; IDs da URL não autorizam acesso. O layout limpa sessão/cache anterior antes de montar a revisão sem cancelar sua consulta inicial.

- `Content` é compartilhado com portal/revisão: renderize sem providers privados; monte consultas da equipe somente quando o campo e a identidade precisarem delas.

- Cor do quadradinho do conteúdo (TOP-01): `api/dash-data.ts` lê `topic_id` e a cor do tópico (service role, `partner_topics`) e devolve em `color` a cor já resolvida (tópico, senão a cor da ação); o DTO não ganhou campo e o nome do tópico não aparece no portal. `Content` não consulta tópicos fora do app da equipe (`TeamContent` só existe com `AppContext`). A revisão pública não envia cor. O SQL dos tópicos precisa estar aplicado antes do deploy, porque `dash-data` passa a selecionar `topic_id`.
- No calendário de `/dash`, o ícone abaixo da capa identifica a categoria da ação e fica ao lado da hora.

## Login do portal

Login do portal usa o mesmo layout/estilo do login principal: frame de28rem, logo, campos com ícones, espaçamento, alerta e botão à direita. Não acrescentar mensagem introdutória ou margens próprias ao portal. A autenticação do portal continua no seu serviço existente.

O portal e suas rotas filhas usam a paleta pública neutra, inclusive login e revisão; cores próprias do parceiro continuam nos elementos que as recebem diretamente. A escolha visual está pendente de aceite.
