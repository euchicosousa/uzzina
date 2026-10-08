# 16: Provar as demais correções com componentes reais

**What to build:** Busca, calendário, arquivados, stories e notificações continuam funcionando com estados corretos, além dos fluxos críticos.

**Blocked by:** 01, 09, 11, 13, 15

**Status:** escopo de código e navegador com HTTP controlado verificado em 07/10/2026. Homologação física/produção permanece no17.

## Execução prescrita
Arquivos: GlobalSearchCommand; routes/dash/index; models/queries de people; admin/users; AdminGuard; comboboxes; useActionShortcut; Header; InstagramTab/ActionFormDrawer.
1. Substituir testes antigos restantes conforme classificacao-dos-testes.md, em pequenos ciclos por comportamento. Não refatorar todas as views para teste; criar providers reais/SDK externo falso.
2. Busca real: parceiro acessível entre múltiplos, parceiro ausente com fallback e resposta antiga descartada. Erro tem estado explícito, não resultado vazio de sucesso.
3. Calendário real: navegar janeiro31→fevereiro→março e dezembro→janeiro. Capturar query HTTP (ou dash-client real com fetch falso) e comparar datas literais esperadas domingo–sábado, usando clock fixo e TZ=America/Fortaleza. Não testar só addMonths.
4. fetchPeople/fetchAllPeople reais: captura de consulta visible=true vs consulta administrativa; montar lista admin com ativo/arquivado e verificar seções.
5. Guard real com person comum/admin; é teste da UI. Checagem administrativa no servidor/banco continua06/07.
6. Combobox compacto montado: getByRole encontra nome acessível. Hook de atalho real em alvo focado, preservando inputs/editors. Stories monta abaInstagram; post/reels/carousel e estratégias têm rótulos reais; funçãoisSocialMediaContent atual permanece.
7. Header real: notificação comdata inválida não quebra; vazio correto; sininho temnome eabre. DOM pode verificar estado e rótulo, não posicionamento/portal na tela.
8. Retirar simulações substituídas e registrar tabela antigo→novo ou →Nxx. Manter cobertura de cada comportamento necessário sem preservar contagem55 como meta.

## Testes e alcance
Interface: componentes/hooks/models listados, produção real. A classificação define o limite: getBoundingClientRect falsificado não encerra visibilidade, clique simulado não encerra touch, label string inventada não encerra componente.
NAVEGADOR: N15/N16 e referências cruzadas do17.

## Acceptance criteria
- [x] Nenhum teste restante usa regra copiada como objeto sob teste.
- [x] Erros/vazio/sucesso são observados em UI real montada.
- [x] Casos de geometria são retirados da contagem local e marcados no17.

## Resultado do executor — 07/10/2026 (parcial)

O escopo desta rodada usa componentes reais no navegador com HTTP externo controlado, em vez de adicionar simulações em jsdom para as mesmas jornadas. Isso verifica a UI montada e as consultas reais; não comprova banco/policies. Sem alterações de dados reais.

**Defeito encontrado/corrigido:** GlobalSearchCommand só registrava falha no console e podia conservar resultado anterior. O roteiro real falhou esperando erro visível. Agora troca de consulta limpa o resultado anterior, mostra busca em andamento, descarta respostas antigas e exibe alerta específico em erro. Não mostra falha como sucesso vazio; nova consulta permite recuperar.

**Passou:** `scripts/check-operations-browser.cjs`, Chromium1440: busca erro/vazio/sucesso, pedido antigo atrasado ignorado, ação com parceiro inacessível primeiro e acessível depois, fallback sem parceiro conhecido, consultas reais fetchPeople(visible=true)/fetchAllPeople(sem filtro), lista administrativa com arquivado e AdminGuard real bloqueando pessoa comum, sininho com nome acessível/abertura/vazio/data inválida sem exceção. Acessos administrativos verificados aqui são da UI, não RLS.

**Passou:** `scripts/check-calendar-period-browser.cjs`, portal/calendário/dash-client reais; captura de HTTP com relógio fixo e America/Fortaleza. Limites literais:
- Janeiro2026:28/12/2025–31/01/2026; fevereiro:01/02–28/02; março:01/03–04/04.
- Dezembro2026:29/11–02/01/2027; janeiro2027:27/12–06/02; semana de31/01:31/01–06/02.
Não testa só date-fns. Seleciona calendário visível, pois portal monta cópias responsivas ocultas. Não certifica troca de parceiro/latência de calendário ou WebKit.

### Retirada rastreável de testes copiados
| Antigo | Substituto real/evidência |
|---|---|
| entrega1: criação/título e finally/cancelamento | drawer-component/drawer-save e drag-concurrency; navegador09/12 já registrado |
| entrega2: guard com função local | operations-browser: página admin real como admin/comum; handlers administrativos têm testes separados |
| entrega3: busca e estados de tela copiados | operations-browser e portal-browser: estados reais, erro e resposta atrasada |
| entrega4: parceiros/cache e seleção/lote | partner-visibility/multi-selection/action-cache e scripts13/11 existentes |
| entrega4: calendário calculado fora da rota | calendar-period-browser: parâmetros HTTP efetivamente enviados pela rota |
| entrega4: pessoas copiadas | operations-browser: fetchers reais/lista admin/guard |
| entrega4: duplicação montada no teste | action-cache e seu browser já registrado |
| entrega4: fila de preferências copiada | preference-persistence e preferences-browser reais |
| entrega4: data/vazio de notificação copiados | operations-browser: Header/popover reais |

A redução de contagem não é perda de casos aprovados: foram removidas cópias que não provavam o app e substituídas por evidências reais indicadas. Scripts de navegador são separados da contagem de `bun test`.

### Pendências da primeira rodada — resolvidas na conclusão abaixo
- Atalho real com card focado, inputs e editor; substituir simulação remanescente entrega4/4.7.
- Combobox compacto real com nome acessível; substituir label string inventada entrega4/4.7.
- Stories/post/reels/carousel na gaveta e rótulos reais de criação/recriação/seleção/fallback da estratégia; substituir dois testes copiados entrega4/4.9. Manter teste da função real isSocialMediaContent/isInstagramFeed.
- Preservação de responsáveis ao trocar parceiro: entrega1 ainda possui regra copiada. Substituir por gaveta real antes de remover; não houve evidência suficiente nesta rodada para declarar resolvido.
- Validar os demais casos de geometria/foco/touch no17. Não ampliar componentes só para facilitar teste.

A primeira rodada deixou os quatro grupos acima para a retomada; a conclusão abaixo registra sua substituição. Código de produção adicional mudou somente a busca e o bootstrap do tema necessário ao15.

Verificação final:254 testes passam/0 falham/752 asserções em20 arquivos; tipagem/lint/build passam. Scripts de navegador não entram nessa contagem.

## Conclusão local do16 — 07/10/2026

HEAD permaneceu `0f8c637ee7da38d25b0b54a8cb290ff47984ae01`; mudanças anteriores preservadas. Não houve migration/deploy/gravação real nem gasto OpenAI.

**Regressão real encontrada no móvel:** no rodapé da gaveta, a caixa do parceiro encolhia dentro da linha de controles; o centro do botão era recortado e o toque atingia o controle de fase adjacente. `check-action-controls-browser.cjs` falhou em390px com interceptação do toque por esse controle. Em `ActionFormFooter.tsx`, os quatro wrappers passaram a `shrink-0`; mantém-se o container de rolagem horizontal existente. Nenhum controlador/componente novo foi acrescentado ao app. Mesmo roteiro passou depois em390 e360.

**Componentes reais verificados por `scripts/check-action-controls-browser.cjs`:**
- Desktop1440: mover mouse para fora dos cards, focar card e pressionar T; o hook/SDK reais enviam fase `done`. Digitar C no título e Z no editor não envia mudança de fase. A gaveta cobre os cards de fundo; não foi forçado hover através desse overlay nem falsificada geometria.
- Desktop1440 e toque emulado390/360: botões compactos de categoria, fase e parceiro encontrados por nome acessível real; Stories, Post Estático, Reels e Carrossel abrem Instagram/Conteúdo/Legenda.
- Criar estratégia, texto **CRIANDO ESTRATÉGIA...** enquanto pedido controlado fica pendente; depois **RECRIAR ESTRATÉGIAS**. Recriação mostra **RECRIANDO ESTRATÉGIAS...** e retorna ao estado utilizável.
- Sem seleção mostra **Selecione a estratégia**; selecionar a segunda estratégia pelo checkbox visual altera o botão para **Estratégia teste2** (na UI: espaço antes do2). Sem seleção não foi fabricada por função de rótulo no teste.
- Edição salva: acrescentar parceiro não substitui responsáveis. Rascunho real: escolher parceiro ativo, acrescentar segundo e remover primeiro; criar envia somente o segundo parceiro e conserva o responsável já definido, mesmo com equipe diferente no segundo parceiro.
- Nenhuma exceção JavaScript; página sem overflow horizontal. Toques são nativos emulados, sem `force` ou `dispatchEvent` para contornar hitboxes.

O SDK, providers, gaveta, editor e hook do app são reais. As respostas HTTP de ações/IA são controladas na fronteira; a confirmação representa o servidor de teste, não persistência PostgreSQL física. O roteiro não certifica aparelho, teclado móvel, Safari/WebKit, upload Cloudinary ou RLS.

### Substituições finais
| Caso copiado retirado | Substituto |
|---|---|
| entrega4/4.7: alvo hover/foco | card focado no navegador → hook real → PATCH de fase |
| entrega4/4.7: label inventado | getByRole em botões compactos da gaveta real |
| entrega4/4.9: rótulos/seleção/fallback | EssentialsTab e InstagramTab reais, geração atrasada e checkbox real |
| entrega1: responsáveis em objeto local | edição e criação de rascunho pelo app real, com payload conferido |
| entrega1: serialização remontada no teste | novo caso de updateActionClient real em action-conflict: description undefined não é enviada nem apaga texto existente |

Mantido o caso que chama isSocialMediaContent/isInstagramFeed reais. A tentativa de montar o seletor no jsdom encontrou APIs de navegador ausentes; foi substituída pelo roteiro real, sem adicionar mocks de geometria ou infraestrutura ao app. Não ficaram testes quebrados nem polyfills novos dessa tentativa.

**Verificação final:**249 testes/0 falhas/739 asserções/20 arquivos; tipagem, lint sem avisos e build passam. Build conserva aviso anterior de chunk>500kB. Uma execução conjunta registrou timeouts e falhas subsequentes em contas/preferências, além de timeout inicial de navegação360. Os18 testes desses grupos passaram isoladamente; suíte completa passou novamente em9,35s e360 passou isoladamente, sem aumentar os timeouts ou alterar esses módulos. Causa da interrupção não foi determinada; não apresentar a primeira execução como aprovada.

**Reprodução:** iniciar app local e configurar `PORTAL_TEST_URL`, `PLAYWRIGHT_MODULE`, `PLAYWRIGHT_EXECUTABLE`; executar `node scripts/check-action-controls-browser.cjs`. Para móvel: `ACTION_CONTROLS_TEST_WIDTH=390` ou360. Não usar dados reais para essa demonstração.

**Próxima ação:** lacunas restantes do17 e homologação real de banco/produção. Os quatro grupos de16 estão verificados localmente; não reabrir a investigação inteira. A matriz52 continua sendo mapa de achados, não aprovação integral.
