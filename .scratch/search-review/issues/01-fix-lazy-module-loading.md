# 01: Corrigir falhas de carregamento ao criar parceiro e ação

**What to build:** os comandos Criar parceiro e Criar ação abrem seus formulários no servidor local sem derrubar a interface por falha ao carregar módulos. Cobrir os dois fluxos na mesma investigação; separar a correção se as causas forem diferentes.

**Blocked by:** None (can start immediately).

**Status:** completed — tested and approved by owner on 2026-10-28

## Evidence

Em28/10/2026 o proprietário enviou duas capturas com erro Failed to fetch dynamically imported module. Criar parceiro apontou o editor de texto rico; criar ação apontou o formulário da gaveta. Na segunda captura a URL visível era a página Ajuda, portanto não assumir que o erro foi causado pela rota de Ajuda. Ambos os componentes são carregados sob demanda na implementação atual.

Na conferência posterior, os dois arquivos responderam HTTP200 ao servidor local. Isso não reproduz a navegação com a sessão/cache do navegador nem certifica as dependências transitivas. Os testes anteriores em preview compilado passaram, mas não certificam carregamento de módulos pelo servidor de desenvolvimento. Causa ainda não determinada: não atribuir a cache, compilação ou rede sem reprodução/evidência.

## Acceptance criteria

- [x] Reproduzir os dois caminhos no servidor local habitual, capturando a requisição que falha, status/resposta e erro do navegador, sem registrar segredos. Comparar sessão já aberta e primeira abertura após carregar a página.
- [x] Investigar o carregamento sob demanda e suas dependências; verificar se os erros compartilham causa antes de aplicar uma correção. Não trocar imports ou desativar otimizações sem evidência.
- [x] Criar parceiro abre o cadastro completo, inclusive campos com editor, e respeita acesso administrativo. Somente abrir não grava parceiro.
- [x] Criar ação funciona pela busca em principal/secundária e pelo atalho atual; preserva outra ação, identidade, guardas e limite de duas. Somente abrir não faz INSERT.
- [x] Falha de carregamento não vira sucesso silencioso nem causa perda de edição. Qualquer recuperação deve evitar gravação duplicada ou recarga automática que descarte trabalho.
- [x] Criar um teste/reprodutor na fronteira real que falhe pelo problema antes da correção, depois repetir os caminhos no Vite local além do build/preview.
- [x] Verificar carregamento inicial/reabertura, desktop/mobile e mensagens no console/rede; manter o modo local de produção e as proteções de sessão/banco.

## Verification

Executar testes pertinentes, format/lint/typecheck/build e navegador com HTTP externo controlado. Não usar fixtures de escrita em produção nem alterar banco/envs por hipótese. Atualizar CURRENT com causa, evidência, resultado e limites. Sem implementação, commit ou publicação autorizados por este registro.

## Local result — 2026-10-28

Owner authorized implementation in the next turn. Confirmed the active Vite server had optimized dependencies missing from disk. A real two-process regression reproduced HTTP200 before a rejected reoptimizing duplicate start and HTTP504 afterward. Startup now checks the occupied port before launching Vite; optimizer cache is local to each checkout. The same regression now returns200. No lazy import replacement or automatic page reload was introduced.

Real dev browser checks passed at1440px and390px, including first opening, repeated opening and page reload, action primary/secondary, existing shortcut, partner editor and zero writes on open. Backend HTTP controlled; no real database/provider verification. Full verification is recorded in docs/audits/2026-10-28-local-lazy-imports.md and CURRENT. No commit or publication. Other deferred tickets not started.
