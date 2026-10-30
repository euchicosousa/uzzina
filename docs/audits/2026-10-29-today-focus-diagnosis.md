# Hoje: foco do wrapper, criação por teclado e link do parceiro

Diagnóstico solicitado pelo proprietário em29/10/2026. Somente investigação e documentação; nenhuma correção implementada.

## Resultado conjunto

| Caso | Resultado | Causa / encaminhamento |
| --- | --- | --- |
| Contorno em toda a região “Ações do dia” | Confirmado no DOM e no Chromium com CSS real | Wrapper com `tabIndex=0` e ring explícito. Manter o [ticket específico](../../.scratch/today-focus/issues/01-remove-wrapper-focus.md). |
| Botão “+” após o link do parceiro recebe foco e fica invisível | Confirmado novamente no Chromium | `opacity-0 group-hover/column:opacity-100`, sem revelação por foco. É o achado K01 do [inventário existente](2026-10-29-keyboard-focus-inventory.md#k01--p2--criação-invisível-quando-recebe-tab), não um defeito novo separado. |
| Título do parceiro recebe foco, mas não navega; suspeita de link apenas no texto | Não reproduzido no ensaio controlado; estrutura suspeita descartada no código/DOM examinado | Um único link envolve avatar e nome. Enter, clique no avatar e clique no nome navegaram para o parceiro. Espaço não ativou o link, conforme comportamento nativo observado. Falha relatada no ambiente do proprietário permanece sem causa confirmada. |

## Evidência e reprodução

Ensaio em Chromium headless151, viewport1440×900, tema claro, sobre o build já existente em `dist`, servido temporariamente em `127.0.0.1:5189`. Auth/REST e mídia substituídos por fixtures locais; WebSockets fechados e demais destinos externos bloqueados. Parceiro fictício `active`, com ações em28/10/2026; rota `/app/today?date=2026-10-28`. Nenhuma escrita foi disparada (`WRITES 0`). Não foi iniciado o servidor dev que usa produção.

O probe está em `/private/tmp/uzzina-today-focus-UWn70s/browser.cjs`, fora do checkout, adaptado do harness de Hoje já existente. Executado com `PLAYWRIGHT_MODULE`, `PLAYWRIGHT_BROWSERS_PATH`, `PORTAL_TEST_URL` e `DRAWER_TEST_PREVIEW=true` apontando para runtime local, browser temporário e servidor isolado. O código-fonte atual dos elementos investigados foi conferido; não se trata de novo build de todas as mudanças externas em andamento.

### 1. Wrapper

Focar “Visão por Parceiros” e pressionar Tab: foco passa ao `DIV` com nome “Ações do dia”; `:focus-visible=true`. O `box-shadow` computado contém um contorno interno de2px, preto com50% de opacidade no tema testado. Isso complementa o probe JSDOM anterior, que falhou pela parada indevida mesmo com quadro vazio.

Origem: [TodayPageView](../../app/components/features/today/TodayPageView.tsx), linhas81–97. O ramo atende Parceiros/Categorias/Feed. A correção deve retirar o wrapper do percurso, preservando controles internos, semântica e rolagem; apenas esconder o ring não resolve a parada extra.

### 2. Botão “+”

Com o ponteiro fora da coluna, focar o link do parceiro e pressionar Tab:

```text
tag: BUTTON
ícone: lucide-plus
opacity: 0
focus-visible: true
aria-label: null
texto: vazio
```

Hover no mesmo botão elevou a opacidade computada para1. Shift+Tab voltou ao link do parceiro. O foco/ring do primitivo existe, mas a opacidade do botão torna todo o controle invisível.

Origem: [PartnersBoard](../../app/components/layout/PartnersBoard.tsx), botão imediatamente após o Link. K01 já descreve exatamente essa reprodução, incluindo o padrão em Categorias. O controle também não tem texto nem nome acessível contextual. Direção de correção registrada: revelar o botão e seu indicador ao receber foco, identificando a criação para aquele parceiro. Não há decisão nova de torná-lo sempre visível em repouso. Compartilhamento com Home exige verificar ambos os consumidores quando a correção for autorizada.

### 3. Link do parceiro

Código e DOM mostram `A[href="/app/partner/active"]`, `tabIndex=0`, contendo tanto `[data-slot="avatar"]` quanto o nome do parceiro. Não há descendentes focáveis ou segundo alvo de Tab no avatar. `UAvatar`/`PrismAvatar` renderizam divs sem `tabIndex` nesse uso.

Resultados separados:

- Foco no link + Enter: navega para `/app/partner/active`.
- Clique no avatar: navega para `/app/partner/active`.
- Clique no nome: navega para `/app/partner/active`.
- Foco no link + Espaço: permanece em `/app/today`. Neste ensaio, Espaço não ativa o link; Enter ativa. Isso é uma explicação possível apenas se o gesto do relato tiver sido Espaço, o que não foi informado.

Não há fundamento para mover o link para fora ou adicionar `onClick`/`tabIndex` no avatar: a área conjunta já está no link. Tampouco há evidência suficiente para afirmar que a navegação funciona em todo cenário do proprietário. Se a falha ocorrer com Enter ou clique, registrar navegador, alvo efetivamente focado, URL antes/depois e presença de ação aberta com guarda de navegação; então reproduzir esse cenário específico. Não atribuir a falha a uma guarda sem observação.

## Limites e próximos passos

- Wrapper e “+”: defeitos confirmados, com alvos e critérios de regressão conhecidos. O ticket do wrapper continua específico; o botão é vinculado ao K01 já registrado, sem duplicação de ticket nesta rodada.
- Link: preservar relato como não reproduzido. Não introduzir alteração funcional baseada na hipótese descartada de que o avatar está fora do link.
- Safari físico, mobile, tema escuro, parceiro real da captura e navegação com formulário sujo não foram exercitados. Os ensaios não certificam produção nem autorização do banco.
- Servidor e browser temporários encerrados. Documentos e referências conferidos; sem novo build, testes da suíte completa, SQL, commit, push ou deploy. Mudanças externas no checkout preservadas.
