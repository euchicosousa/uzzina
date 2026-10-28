# 01: Implementar a página de notificações da equipe

**What to build:** ao abrir Notificações pela busca global ou pelo link Ver todas as notificações do sino, a pessoa encontra suas notificações, identifica as não lidas e consegue abrir a ação mencionada e marcar notificações como lidas. Reaproveitar a consulta, cache e operações existentes do sino, sem recriar o sistema de notificações.

**Blocked by:** None (can start immediately). Independente dos tickets de duas ações/busca; os links para a página já existem.

**Status:** ready-for-agent — deferred by owner; do not start automatically

## Confirmed finding

Em28/10/2026 o proprietário relatou a página vazia durante a conferência dos novos comandos. A renderização isolada do componente real confirmou apenas texto provisório, sem lista, consulta ou controles. A página ainda não foi implementada; o comando da busca aponta para o destino correto. O sino já possui listagem, contador, abertura da ação e operações de leitura. Não foi consultado o banco real, portanto não há conclusão sobre existência ou entrega de notificações para a conta do proprietário.

## Acceptance criteria

- [ ] Substituir o texto provisório por uma página utilizável, acessível pelo comando Notificações e por Ver todas as notificações no sino, sem exigir perfil de administrador.
- [ ] Consultar apenas notificações da pessoa autenticada, ordenadas das mais recentes para as antigas; exibir autor, ação, trecho legível e data, diferenciando lidas/não lidas.
- [ ] Reaproveitar os models, hook/cache e políticas atuais; componentes/rotas não acessam diretamente as tabelas. Troca de sessão não expõe dados nem aplica respostas da identidade anterior.
- [ ] Abrir a ação relacionada pelo fluxo comum da principal, respeitando guardas e tratando ação indisponível/sem acesso com mensagem apropriada.
- [ ] Oferecer marcar como lida e marcar todas como lidas, sincronizando lista e contador do sino. Erros não apresentam sucesso falso nem descartam a leitura atual.
- [ ] Distinguir carregamento, nenhuma notificação e falha de consulta, com possibilidade de tentar novamente. Ausência de dados não deve parecer página quebrada.
- [ ] Não apresentar o limite atual de40 itens como histórico completo: permitir acessar os registros anteriores se existirem, sem redesenho adicional do fluxo.
- [ ] Conferir desktop/mobile, temas, teclado, área rolável e reserva da AppBar com os componentes existentes.
- [ ] Teste na rota real falha com a implementação provisória e passa após a entrega; verificar consulta/leitura/erro, abertura da ação, sincronização com sino e isolamento de sessão com fronteira externa controlada.

## Verification and limits

Executar testes pertinentes, format/lint/typecheck/build e conferência de navegador com HTTP controlado. Localhost usa produção: não criar fixtures nem marcar notificações reais como lidas durante os testes. Preservar autorização do destinatário e acesso à ação no servidor/banco. Nenhuma mudança de schema presumida. Atualizar CURRENT e contratos/KI aplicáveis ao implementar. Sem commit, publicação ou início automático autorizados por este registro.
