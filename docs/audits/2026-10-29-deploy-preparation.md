# Preparação para deploy — 29/10/2026

## Resultado

Lote funcional pronto para publicação a partir de `d5cb55a`, após verificações locais. Pedido do proprietário: preparar todas as entregas que aguardam publicação e realizar limpeza antes de continuar. Nenhum push, deploy ou SQL executado nesta rodada.

`git fetch origin` concluído em29/10 confirmou `origin/main` em `1125131`. `main` permanece quatro commits à frente, sem divergência:

| Commit | Entrega |
|---|---|
| `4dbb90c` | Página de notificações; histórico progressivo; cache compartilhado com sino; remoção de HTML nos trechos. |
| `311d102` | Ajuda com conteúdo real, índice/seletor responsivo e rolagem própria. |
| `7a20122` | Criar/editar datas comemorativas por modal; comandos e página administrativa reutilizam o fluxo. |
| `d5cb55a` | Revisão de layout/teclado do calendário/modal; erro no título e correção do Enter. |

Duas ações, busca/filtros/comandos, launcher/cache, AppBar, Hoje, Minha Conta e preferência de Hoje já pertencem à ancestralidade remota. A referência Git não confirma deploy Ready. Não houve consulta à Vercel nesta preparação.

## Verificação do lote

- `bun run format`: passou, sem alterações de código.
- `bun run lint`: passou,337 arquivos.
- `bun run typecheck`: passou.
- `bun test`:528 testes,0 falhas,1894 assertions,47 arquivos.
- `bun run build`: passou; saída `dist/` regenerada, removendo os artefatos obsoletos do build anterior. Permanece o aviso conhecido de chunks acima de500kB.
- `bun run test:serverless`:7 PASS, build Vercel/import Node/guardas não autenticadas de IA, portal, revisão e contas. Sem chamadas externas/segredos.
- `bun run test:dev-imports`: passou em porta/cache temporários; segunda inicialização rejeitada preservou HTTP200 e os módulos lazy. Primeira tentativa não pôde abrir porta no ambiente restrito; repetição com acesso local autorizado passou.
- `git diff --check`: passou. Referências locais dos documentos atualizados conferidas.

Não há alteração de APIs, dependências ou SQL entre a base remota e o lote funcional. A migration da preferência de Hoje já está aplicada, conforme [manifest](../../supabase/rollouts/today-view-preference-manifest.json); não requer reaplicação para este lote.

## Limpeza realizada

- [CURRENT](CURRENT.md) consolidado em um retrato vigente, separando pendências de registros superados. Cabeçalho atualizado para29/10. A referência remota corrige a classificação antiga de entregas ainda sem push.
- Histórico integral anterior preservado em [arquivo de histórico](2026-10-29-current-history.md), com os registros externos de Planejamento incluídos. Nenhuma evidência operacional perdida.
- [TODO](../../TODO.md) corrigido: Notificações já está implementado/commitado; ainda precisa de conferência visual e de uso real.
- Diretórios gerados vazios `.tanstack/tmp` e `.tanstack` removidos antes do build; o gerador pode recriá-los.
- `dist/` atualizado pelo build limpo do Vite. Cache do servidor de desenvolvimento ativo preservado.

A primeira inspeção preservou capturas que o proprietário queria remover; a revisão abaixo corrige essa decisão. Mantidos testes, scripts de regressão, tickets, relatórios/evidências, biblioteca de hooks preservada por decisão anterior, envs, backups, migrations e histórico de staging. A proposta não versionada de Planejamento foi preservada; nenhuma implementação iniciada. As capturas foram removidas na revisão abaixo.

## Limites e próxima publicação

Tentativa de repetir o roteiro do modal contra o build local, com sessão e HTTP simulados, interrompida antes de abrir o navegador: a instalação disponível de Playwright não tem o executável Chromium. Nenhum navegador foi baixado e nenhuma fixture chegou à produção. O servidor de preview temporário foi encerrado. Roteiro adaptado e logs ficaram apenas em diretório temporário, fora do repositório.

Continuam válidas as verificações anteriores do modal e da Ajuda em navegador com HTTP controlado. Notificações ainda não possui conferência visual desktop/mobile/temas nem confirmação de entrega de registros reais. Os testes automatizados cobrem a implementação, sem certificar banco/provedor. Avaliação do proprietário da preferência de Hoje e da Ajuda permanece sem confirmação registrada.

Quando a publicação for solicitada, enviar o lote validado, verificar a nova versão Ready e sua associação ao domínio público; só então registrar deploy confirmado no CURRENT/manifest. Este relatório não autoriza reaplicar migrations, modificar permissões ou implementar itens futuros.

## Revisão da limpeza solicitada pelo proprietário

Removidas dez imagens PNG produzidas por testes: cinco em `.scratch/account-preferences/evidence/` e cinco em `.scratch/search-review/evidence/`, totalizando 609,639 bytes. As duas pastas vazias também foram removidas. Cinco capturas eram versionadas; cinco ainda não tinham sido adicionadas ao Git. Os favicons em `public/` são arquivos do aplicativo e foram mantidos.

Os três roteiros de perfil/Hoje/modal passam a usar `fs.mkdtemp` dentro de `os.tmpdir`, com prefixos próprios; futuras execuções não repovoam o checkout. Adicionada exclusão de `.scratch/**/evidence/` ao Git. Referências às imagens removidas ajustadas em três relatórios; resultados e limites das verificações mantidos.

Inspeção adicional cobriu arquivos ocultos, extensões de mídia/log/backup/temporários, diretórios vazios e consumidores das fixtures. Não foram encontrados outros arquivos temporários fora das saídas geradas e caches conhecidos. Os scripts de regressão e a fixture de calendário têm uso documentado; não são resíduos de execução. Configuração Vercel, cache do servidor ativo, envs, migrations, planos/tickets e testes foram preservados.

Verificação desta revisão: sintaxe Node dos três roteiros, formatação, lint, tipagem e referências locais. Sem mudança no código do aplicativo, sem repetir testes de negócio/build aprovados acima e sem acessar produção.

## Versionamento solicitado

Em29/10, o proprietário solicitou o commit de tudo que restava no checkout: limpeza, registros de preparação, histórico do CURRENT e proposta de Planejamento já existente. Proposta permanece documental, em revisão; nenhuma implementação iniciada. Verificações reaproveitadas da revisão acima, sem nova mudança funcional. Commit local, sem push/deploy/SQL.
