# Comandos candidatos para a busca global

Levantamento solicitado em28/10/2026 e implementação integral autorizada pelo proprietário na rodada seguinte. Todos os comandos abaixo foram implementados localmente. Aguardam avaliação do proprietário.

## Comandos disponíveis para a equipe

| Candidato | Reuso existente |
| --- | --- |
| Criar ação | Já implementado; fábrica e guardas dos painéis, Shift para secundária |
| Minha conta | /app/profile |
| Tema claro / Tema escuro / Tema do sistema | useAppTheme e persistência de preferências usados pelo HeaderMenu; não alterar cores/paleta |
| Ir para início / Ir para Hoje | /app e /app/today |
| Notificações | /app/notifications |
| Leads | /app/leads; menu atual disponível à equipe, mantendo escopo autorizado de dados |
| Ajuda e documentação | /app/help |
| Sair | HeaderMenu já oferece signOut; candidato secundário, requer preservar saída segura dos formulários |

## Somente administradores

| Candidato | Reuso existente |
| --- | --- |
| Criar parceiro | /app/admin/partner/new |
| Criar cliente | /app/admin/client/new |
| Criar usuário | /app/admin/user/new |
| Criar data comemorativa | /app/admin/celebrations já reúne formulário de criação e lista; não existe rota separada de criação |
| Gerenciar parceiros / clientes / usuários / datas comemorativas | Respectivas páginas /app/admin/* |

Parceiro é o cliente comercial; cliente (clients) é a conta externa de acesso ao portal. Os dois cadastros existem e não devem ser confundidos. Menu atual restringe o bloco administrativo por person.admin; os destinos usam AdminGuard. Novos comandos devem seguir o mesmo controle, mantendo as autorizações existentes do servidor/banco. Este levantamento não é uma auditoria de autorização de dados.

## Implementação autorizada

Todos os comandos listados foram implementados. Grupo Comandos abaixo dos resultados, seguido de Administração apenas para person.admin; todos localizáveis pelo nome. Shift continua específico à abertura de ação/rascunho. Navegação e Sair validam ambas as guardas via closeAllActions antes de executar; bloqueio mantém ações e busca. Tema usa useAppTheme e usePreferencePersistence em um proprietário que permanece montado depois de fechar a busca; falha tem retry na próxima abertura. APIs/rotas mantêm suas autorizações atuais.

Fontes conferidas: app/components/layout/Header.tsx (HeaderMenu), app/components/features/AdminGuard.tsx, app/hooks/useAppTheme.ts, rotas de perfil/leads/admin e GlobalSearchCommand.tsx. Sem consulta ou alteração de banco.
