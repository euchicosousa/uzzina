# Diagnóstico da altura da ação ao editar o título

Investigação solicitada em30/10/2026, a partir dos dois prints do proprietário. Sem correção funcional autorizada nesta rodada.

## Resultado

Há dois efeitos simultâneos no cartão em variante Linha:

- O contorno muda de ring1 discreto para ring2 na cor primary durante edição (`ActionItem.tsx`, condição isEditing). Na paleta do print, aparece preto. Ring é sombra externa e não aumenta a caixa de layout.
- A altura real aumenta ao trocar o botão de título pelo input (`ActionItemTitleInput.tsx`). O contêiner usa `leading-snug` (1,375), mas `text-base` do input define line-height1,5. Acima de md, `md:text-[length:inherit]` recupera o tamanho da fonte, sem recuperar a altura de linha.

No componente real, Chromium com viewport1193×700, cartão de264px e fonte do projeto carregada: título14px, altura do texto19,25→21px; cartão36,25→38px; elemento seguinte deslocado1,75px. Duas execuções consecutivas reproduziram o mesmo resultado. O ícone lateral também é ocultado na edição em cartões estreitos pela regra já existente de ActionLineVariant.

## Verificação causal

Página temporária montou ActionItem real com CalendarTestProviders existente e ação fictícia “Drinks”; CSS real via Vite isolado, sem middleware de APIs. Rede externa bloqueada. Probe `node /tmp/uzzina-title-audit/probe.cjs` compara alturas antes/depois e emite `FAIL: editing changes card height`, delta1,75px.

Alterar somente line-height do input para inherit no navegador devolveu cartão36,25px e título19,25px, mantendo o ring2. O controle de remoção de box-shadow não foi conclusivo: a leitura imediata ainda mostrou a sombra durante a transição; não foi usado como evidência. A sombra de hover também se intensifica sob o ponteiro, contribuindo para a percepção visual.

Direção mínima de correção: igualar a altura de linha do input à do título fora da edição, preservando indicação de foco. Ainda não aplicada. Eventual implementação deve cobrir o componente real com CSS e verificar variantes/breakpoints, inclusive a fonte16px abaixo de md.

## Limites e limpeza

Ensaio em Chromium local; não certifica Safari nem medidas exatas no ambiente publicado dos prints. Sem banco real, gravação, SQL, novo build, commit, push ou deploy. Fixture temporária do checkout removida; servidor isolado encerrado. Somente relatório e CURRENT atualizados; mudanças externas preservadas. Referências e diff documental conferidos. Sem suíte de app nesta investigação documental.

## Correção autorizada e preparada

Após o diagnóstico, o proprietário solicitou o ajuste. `ActionItemTitleInput` agora usa `leading-[inherit]` no input: preserva tamanho de fonte existente e herda a altura de linha do título. Ring de foco e estilos do cartão inalterados.

Regressão permanente: `scripts/check-action-title-height-browser.cjs` monta o componente real pela fixture `tests/fixtures/action-title-height-browser.tsx`, com CSS/fonte reais e dados fictícios. Antes da correção falhou em1193px: cartão36,25→38px, texto19,25→21px e elemento seguinte deslocado1,75px. Depois passou em390, 768, 1193 e1440px: mesma geometria ao editar e cancelar, autofocus no campo, título original recuperado por Escape e classe do contorno de foco preservada. Teste não envia alteração ao banco.

Execução usa `PLAYWRIGHT_MODULE` e `PLAYWRIGHT_EXECUTABLE` para os caminhos locais do Playwright/Chromium; `ACTION_TITLE_TEST_URL` seleciona o servidor Vite (padrão5187). Servidor desta rodada isolado em `/tmp/uzzina-title-audit/server.mjs`, sem APIs; encerrado após o ensaio.

`bun run format`, `bun run lint`, `bun run typecheck` e `bun run build` passaram. Lint informou sugestão preexistente em `tests/font-loading.test.ts`; build informou chunks acima de500kB. Diff conferido. Alterações externas preservadas. Sem SQL, commit, push ou publicação; Safari físico continua não verificado. A restrição “sem correção” nas seções anteriores descreve apenas a fase inicial de diagnóstico.

## Validação ampliada das variantes

Solicitada pelo proprietário após esclarecer que a primeira verificação cobria somente Linha. Inventário de usos: `ActionItemTitleInput` é utilizado por Linha e Bloco. Hair segue o renderer de Linha; Conteúdo social usa `Content`, sem editor inline de título. Conteúdo não social recai em Linha. Não há outro consumidor do campo no app.

Fixture e script ampliados para32 cenários em Chromium, com264px de largura do cartão, telas390/768/1193/1440px e títulos curtos/longos. Bloco inclui configuração `lines=2` (suportada pela interface, mas nenhum consumidor explícito `lines={2}` foi localizado no app atual). Resultado:26 passaram e6 falharam. Não declarar todas as variantes estáveis.

- Linha e Hair:16 cenários passaram; geometria do título/cartão/elemento seguinte, autofocus e cancelamento por Escape preservados.
- Bloco de uma linha:6 cenários desktop passaram. Em390px, tanto título curto como longo: cartão95→85px e texto30→20px (2 falhas). Input usa fonte16px abaixo de md; título usa24px. `leading-[inherit]` herda o multiplicador1,25, que se aplica ao tamanho da fonte do próprio input.
- Bloco de duas linhas:4 falhas; cartão125→95px no desktop e125→85px em390px. O botão ocupa duas linhas; input continua de uma linha. Escape recupera o título e a geometria originais em todos os casos.
- Conteúdo social:4 verificações passaram confirmando ausência de campo inline. Isso não certifica todos os fluxos de Conteúdo; apenas estabelece que este campo compartilhado não participa deles.

Controle temporário no navegador restaurando somente line-height1,5 anterior: Bloco de uma linha no desktop95→101px; no celular95→89px; duas linhas125→101px desktop e125→89px no celular. Logo, instabilidade de Bloco já existia; o ajuste estabiliza uma linha no desktop, mas acentua a redução no celular (6→10px) e no caso de duas linhas (24→30px no desktop,36→40px no celular). Não confundir esse controle de CSS com checkout/build histórico completo.

Esta rodada altera somente fixture/script e documentação; nenhuma nova correção de app. O comando ampliado termina com falha real nos seis casos de Bloco, registrados como pendências. Format/lint/typecheck passaram; mesmo aviso informativo anterior de lint. Build não repetido porque não houve alteração de execução do app. Sem banco, SQL, commit, publicação ou Safari físico. Servidor isolado encerrado e mudanças externas preservadas.

## Aprofundamento: fluxos reais, breakpoint e proposta mínima

Proprietário solicitou análise adicional. Esta seção refina a interpretação dos seis casos vermelhos, sem aplicar outro ajuste funcional.

### Alcance atual

HomeLateView (Atrasadas) e HomeSprintView (Sprint) iniciam com Bloco; o menu Visualizar também oferece Bloco aos consumidores que habilitam variantes. ActionContainer não encaminha `lines`; ActionItem usa o padrão1. Busca dirigida não localizou consumidor do app que forneça `lines=2`. Hair passa pelo mesmo renderer de Linha, sem opção própria no menu atual; não é uma quarta implementação independente de edição. Conteúdo social não possui esse editor; categorias não sociais usam o fallback Linha.

Logo, duas das seis falhas da matriz anterior (curto/longo em390px) representam o problema atualmente acessível de Bloco. As outras quatro verificam uma capacidade do componente hoje não ativada por telas. Não confundir contagem de cenários de teste com quantidade de bugs/fluxos atuais.

### Causas isoladas

Ensaio real de ActionItem em767px reproduziu fonte24→16px, altura de linha30→20px, cartão95→85px; em768px manteve24px/30px/95px. O breakpoint é da janela (`md:`), não da largura do cartão. Padding e borda do input permaneceram0px, peso500 e largura do campo inalterados. Herdar só line-height preserva o multiplicador1,25, mas ele é recalculado pela fonte16px do campo no celular. O ajuste inicial corrigiu o line-height divergente; faltou preservar também font-size no Bloco abaixo de md.

Na configuração sintética de duas linhas, há ainda a troca de botão com texto quebrado por input de uma linha. Herdar a fonte corrige o salto de24→16px, mas não preserva a segunda linha. Reservar temporariamente a altura anterior no navegador estabilizou a caixa; isso foi apenas controle causal e não recomenda introduzir medição/fixação de altura para um caminho não usado atualmente.

### Verificação na Home real

Fixture temporária montou HomeLateView e HomeSprintView reais, com CalendarTestProviders, CSS/fonte reais e ações fictícias. Nenhuma alteração foi enviada ao banco.

Em390px, cartões tinham138px de largura. Em Atrasadas com apenas um cartão:95→85px; com vizinho na mesma linha da grade: altura externa95px preservada pelo esticamento da grade, mas título30→20px e informações inferiores sobem10px (offset59→49px). Em Sprint, o wrapper de ordenação permite que o cartão encolha95→85px tanto com um quanto com dois cartões. Em1193px, ambos preservam fonte24px, título30px, cartão95px e offset59px com o código atual.

Controle anterior com line-height1,5 mostrou encolhimento de6px no celular e crescimento de6px no desktop, antes do ajuste. Portanto o problema móvel era anterior, mas o ajuste atual acentua seu deslocamento em4px.

### Proposta mínima comprovada, ainda não aplicada

Manter a altura de linha herdada e fazer o input herdar também o tamanho da fonte em todas as larguras, preservando o desenho de cada variante: Linha14/16px conforme estilos existentes, Bloco24px. Não é necessário alterar bordas, padding, grade, ring ou criar um editor multilinha para resolver o fluxo atual.

Controle temporário de `font-size: inherit` no input passou nos28 cenários da matriz atualmente utilizada: Linha/Hair/Bloco com títulos curtos e longos em390/768/1193/1440px, mais ausência de editor em Conteúdo social. Geometria, autofocus e Escape passaram; nos seis cenários de Home real, fonte herdada também restaurou tamanho/posição do título, rodapé e cartão. Scripts/probes em `/tmp/uzzina-title-audit` (`deep.cjs`, `contexts.cjs`, `font-inherit-all.cjs`); nenhum estilo experimental foi salvo no app.

Limites: Chromium local, dados controlados; sem Safari físico, build histórico integral ou publicação. Somente documentação alterada nesta rodada; fixture temporária removida, servidor encerrado e diff conferido. Sem testes/build adicionais do app porque não houve mudança funcional nem de teste permanente. Correção complementar segue recomendada, não entregue; casos de duas linhas permanecem uma limitação latente a tratar se essa opção for usada.

## Remoção da opção de duas linhas

Proprietário autorizou remover a capacidade de duas linhas. Removidos `lines` de ActionItem, ActionVariantRendererProps, ActionBlockVariant e ActionItemTitleInput, e o ramo `line-clamp-2`. Título fora da edição agora usa sempre uma linha com reticências. Fixture/script deixam de oferecer o cenário de duas linhas; script verifica os estilos reais `nowrap`/`hidden`/`ellipsis` antes de editar.

Verificação:24 cenários editáveis confirmaram uma linha com reticências; quatro cenários de Conteúdo confirmaram ausência de editor inline. Comparação geométrica mantém26 pass/2 fail nos28 cenários atuais: as duas falhas são o problema conhecido do Bloco móvel (fonte24→16px), não corrigido por esta remoção. Formatação/lint/build passaram, com avisos já conhecidos. Typecheck falhou em arquivo de outro fluxo: `ActionFormDrawer.tsx:185`, estado inicial sem propriedade `unavailable` exigida por CoordinatorState; não alterado nesta tarefa. Não há erro reportado nas props removidas. Mudanças externas preservadas; diff conferido. Servidor encerrado. Sem SQL, commit, push ou deploy; Safari físico não verificado.
