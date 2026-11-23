# Conectar o Instagram a cada parceiro

**Status (23/11/2026):** o proprietário confirmou no deploy a conexão do perfil `@euchicosousa` em Administração → Parceiros → Editar. A etapa de conexão está em produção; os cenários de cancelamento, falha, reconexão e desconexão continuam pendentes. A etapa de consultas e o ajuste atual dos calendários foram enviados para `main` no commit `58bdbb96`; a verificação Vercel desse commit está success; o comportamento real dos presets ainda não foi conferido. As consultas são somente leitura e não persistem resultados no Supabase.

O servidor exige uma sessão Supabase válida e administrador ativo tanto ao iniciar quanto ao concluir o retorno. Cada tentativa fica ligada ao administrador, parceiro, hash do state, expiração e ao `connected_account_id` exato devolvido pelo link. O callback volta à rota de edição e o cliente autenticado finaliza a tentativa. O servidor consulta o GET oficial do Composio e exige o mesmo ID, `user_id` estável derivado do UUID do parceiro, auth config configurada, toolkit Instagram, status `ACTIVE` e handle de Instagram antes de gravar. Credenciais OAuth permanecem com o Composio; o Supabase guarda apenas referências e estado. Tabelas sem acesso direto ao navegador; uma RPC troca a referência atual atomicamente e preserva o histórico anterior como substituído.

**Banco e ambientes:** migration [`20261122233000_partner_instagram_connections.sql`](../../../supabase/migrations/20261122233000_partner_instagram_connections.sql) aplicada ao projeto Supabase `uzzina` (`dfepmjcozszswocwvdpq`) em 22/11; histórico remoto registra `20261123024455`. Verificação confirmou as duas tabelas com RLS habilitado e a RPC executável apenas por `service_role` (não por `authenticated` nem `anon`). Código não publicado. `bun run check:composio-config` passou sem exibir valores; a leitura remota confirmou HTTP 200, toolkit Instagram, conta `ACTIVE`, IDs de parceiro/auth config corretos e o perfil `@euchicosousa`. O GET da conexão não traz `state.val.displayName`; a confirmação agora usa uma leitura do `id` e `username` do perfil via proxy autenticado do Composio. O Composio mostrava OAuth user verification `Not configured` na captura de 22/11; o fluxo desta implementação depende do Connect Link retornar ao `callback_url` da tentativa. Habilitar essa configuração global exige adaptar o desenho ao `session_uri`, que não identifica a tentativa/parceiro no callback.

**Reconexão e revogação:** a documentação oficial confirma que o helper TypeScript `link()` tem guarda de múltipla conexão e `allowMultiple`; o schema REST v3.1 do Connect Link não expõe esse campo, então a integração usa o endpoint REST direto e mantém histórico de referências. O Composio documenta `POST /connected_accounts/{id}/revoke` como revogação best-effort do ID informado, com falha quando o estado não é revogável. Não há evidência oficial consultada que determine se revogar uma conexão do Instagram invalida outra connected account do mesmo @. Por isso, uma troca nunca revoga a conexão anterior automaticamente; ao desconectar, a UZZINA pede a revogação apenas do ID atual e só remove sua referência se o Composio confirmar `REVOKED`.

**Verificação local:** a integração de conexão havia passado typecheck, build Vite, testes focados de contrato/cliente (4/4) e empacotamento/importação serverless (13 APIs), antes de sua publicação. Para o ajuste recente dos presets, `bun run typecheck`, `bun run test:serverless` (8 APIs), `bun run build` e `git diff --check` passaram; não executei consulta real pelos botões nem conferi visualmente a tela. O commit `58bdbb96` está em `main` e no remoto; a verificação Vercel está success.

**Etapa de consultas (23/11):** em Administração → Parceiros → Editar → Instagram, a proposta visual divide a linha em cartão de perfil com cerca de dois terços da largura e painel de ações com um terço. O painel mantém **Reconectar** e desconexão por ícone (com confirmação) em cima; abaixo, o rótulo **Buscar** e botões independentes **Publicações** e **Insights**, cada um abrindo seu próprio popover de calendário. Os dois calendários oferecem intervalo personalizado e presets **Todo período**, **Este mês**, **3 meses**, **6 meses** e **12 meses**; escolher um período inicia a consulta da respectiva operação. Para **Todo período**, o app omite `since` e `until`. A consulta de publicações usa `INSTAGRAM_GET_IG_USER_MEDIA`/`/me/media` e retorna uma página de 50 itens por chamada; o cursor permite buscar a página seguinte, sem enviar ou guardar URLs de paginação. A consulta de insights usa `/me/insights`, período diário e métricas `reach`, `accounts_engaged`, `total_interactions`, `views` e `profile_views`. Ambas validam a conta vinculada ao parceiro no servidor e exibem resultados sanitizados em memória. Stories não estão garantidos na listagem `/me/media`; validar cobertura e compatibilidade das métricas pelos botões reais. A paginação é manual para manter cada nova chamada explícita. Código no commit `58bdbb96`, em `main` e remoto; verificação Vercel success; falta conferir visualmente os dois popovers e validar as respostas reais de todos os presets, em especial **Todo período** para insights.

**Próximo roteiro:** recarregar a seção Instagram no app local e conferir se aparece somente `@euchicosousa` com o estado conectado/verificado. A conta atual está confirmada `ACTIVE` no Composio e `active`/current no Supabase. Há uma referência de conexão anterior marcada como substituída; ela não foi revogada. Depois publicar e aguardar deploy Ready; testar cancelamento/falha preservando a conexão anterior, reconectar e desconectar. Conferir também se o mesmo perfil está ligado a outro parceiro antes da revogação. Não configurar OAuth user verification global sem adaptar o callback.

## Resultado esperado

Na gestão do parceiro, uma pessoa autorizada conecta um perfil e a equipe vê o @ e o estado da conexão.

## Critérios de aceite

- [x] Validar conexão, @ e status com autorização por parceiro em um fluxo OAuth real no site publicado (confirmado pelo proprietário em 23/11).
- [x] Manter credenciais no Composio e referências/estado no servidor/banco, com identidade estável isolada por parceiro.
- [ ] Conferir cancelamento, falha, reconexão e revogação com perfil de teste; confirmar o efeito de revogar uma conexão quando o mesmo @ está ligado a outro registro.
- [ ] Executar no deploy as buscas de publicações e insights, validar paginação/métricas e verificar o período com um perfil de teste.

## Referências

[Plano da integração](../../../docs/plans/instagram-composio.md)

## Modelos sugeridos

- Codex — gpt-6.2-astra. Adequado para verificar os riscos e os contratos do fluxo.
- Codex — gpt-6.2-sol. Alternativa para execução cuidadosa com menor custo.
- Codex — gpt-6.1-terra. Alternativa para conferir a interação visual e os estados.
