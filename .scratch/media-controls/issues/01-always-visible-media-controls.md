# 01: Manter os controles de mídia sempre visíveis e operáveis

**What to build:** na janela Gerenciar conteúdo da UZZINA, mostrar permanentemente a remoção individual, a alça de reordenação e a posição de cada arquivo, no desktop e no celular. A pessoa consegue remover/reordenar com ponteiro, toque ou teclado sem depender de hover; miniaturas, ordem, retorno de foco e persistência existentes permanecem coerentes.

**Blocked by:** None (can start immediately). Independente dos tickets de Safari, Planejamento e uso de IA. A entrega mobile de Instagram prepara a área que abre o gerenciador; esta tarefa atua nos controles internos. Coordenar alterações compartilhadas, com um executor por vez no checkout, sem inventar dependência funcional.

**Status:** implemented locally on2026-10-31 — controlled browser and real drawer regression passed; physical-device acceptance/publication pending. See [result](../../../docs/audits/2026-10-31-media-controls.md).

## Decisão e origem

Achado K02 da revisão de teclado: os botões individuais de remover ficam com display:none fora de hover; as alças e números ficam com opacity0. No Tab, foi observada a sequência alça1 → alça2 → Adicionar → Limpar → Concluir, sem remoção individual. A existência de sensor de teclado não resolve um controle invisível ou fora do percurso.

O proprietário esclareceu que ocultar não faz sentido e pediu preparar a correção. A fala contém “invisível sempre”, mas o contexto “exibir no mobile” e “não faz sentido ocultar” foi interpretado e comunicado como **sempre visível**. Esta é a direção deste ticket; não ocultar permanentemente os controles.

O objeto é o gerenciador interno aberto pelo botão com a quantidade de arquivos na aba Instagram. O widget externo do Cloudinary, testes de VoiceOver e demais ajustes de Safari estão fora deste escopo. O diagnóstico anterior não comprovou defeito de touch; esta entrega deve verificar toque, sem pressupor a falha.

## Critérios de aceite

- [ ] Remover de cada item, alça e posição continuam visíveis com mouse fora da grade, sem hover, sem foco e sem mídia selecionada, em desktop e janela estreita. Não trocar a dependência de hover por outra dependência de foco.
- [ ] Manter o estilo Prism e a legibilidade sobre miniaturas claras/escuras e arquivos sem preview. Controles não se sobrepõem entre si, não cobrem toda a miniatura e têm área acionável adequada ao toque; não manter remoção como alvo minúsculo de16px.
- [ ] Botão individual de remover é nativo/Prism, tem nome em português que identifique posição ou arquivo e é alcançável por Tab/Shift+Tab. Enter/Espaço removem somente o item escolhido, sem enviar formulário, fechar modal, acionar Limpar ou iniciar arraste.
- [ ] Após remover, foco vai para controle equivalente de um item vizinho; ao remover o último, retorna a Adicionar ou outro destino útil existente. Não cai no body ou na gaveta por trás.
- [ ] Alça permanece focável, identificável e visualmente sinalizada. Preservar o sensor de teclado existente: iniciar reordenação, mover, confirmar/cancelar usando os comandos suportados sem disparar atalhos da ação ao fundo.
- [ ] Ponteiro/toque na alça reordenam pelo comportamento existente; tocar no remover não começa drag. Verificar em aparelho real quando disponível; simulação de viewport/toque não certifica Safari físico.
- [ ] Remoção e reordenação preservam identidades dos itens, ordem dos demais arquivos e sequência emitida ao formulário. Arquivos com a mesma URL não podem fazer a remoção atingir mais de uma ocorrência por engano.
- [ ] Numeração e tipo detectado acompanham a lista resultante. Capa/vídeo principal seguem as regras atuais de posição; nenhuma mudança silenciosa de contrato de mídia.
- [ ] Preservar Adicionar, Limpar, Concluir, limite atual de20 arquivos e integração de uploads múltiplos. A tarefa não muda o widget, preset, armazenamento, assinatura ou ciclo de eventos do provedor.
- [ ] Preservar o momento atual de aplicar/persistir alterações. Concluir continua fechando o gerenciador; não introduzir fluxo novo de Aplicar/Cancelar nem confirmação obrigatória adicional.
- [ ] Escape e fechamento respeitam a camada interna e retornam ao botão que abriu Gerenciar conteúdo. Principal/secundária conservam mídia e estado independentes; nenhuma operação altera a outra ação.
- [ ] Não reabrir a correção de foco da gaveta, modificar captura global de Tab ou implementar itens K01/K03/K04/K05 desta auditoria por proximidade.

## Etapas dentro da mesma entrega

1. Reproduzir o defeito no componente real e preparar regressão de remoção individual por teclado/visibilidade sem hover.
2. Ajustar somente controles da miniatura e a restauração local do foco necessária. Reutilizar sensores e contrato de mídia existentes.
3. Verificar teclado, ponteiro e layout estreito, depois integração com a ação, salvamento e reabertura por HTTP controlado.

São etapas de execução de uma única entrega demonstrável, não tickets separados por CSS, lógica e testes.

## Verificação necessária

- [ ] Regressão falha antes: botão individual indisponível por Tab ou controle oculto sem hover; passa depois no componente real. Teste que apenas compara strings de classe não comprova visibilidade de navegador.
- [ ] Com dois/três arquivos, Tab alcança cada remoção/alça; remover o intermediário/último preserva ordem e foco; não afeta outros itens. Cobrir coleção vazia, item único e URL repetida.
- [ ] Reordenar por teclado preserva a sequência e a aplicação no formulário; Escape cancela a operação interna antes de fechar o diálogo, quando consumido pelo sensor.
- [ ] Navegador com estilos reais: desktop e390px, claro/escuro, ponteiro fora da grade e foco via teclado; controles visíveis e sem sobreposição. Tocar/remover com ensaio controlado quando suportado; registrar separadamente teste físico disponível e o que não foi executado.
- [ ] Integração por HTTP controlado: remoção/reordenação confirmada, salvamento e reabertura da mesma ação; preservação da outra ação aberta e da sessão. Sem fixture de escrita em produção.
- [ ] Executar testes pertinentes, format/lint/typecheck/build e requisitos serverless somente se o escopo real os acionar. Capturas temporárias ficam fora do checkout.

## Entrega e limites

Uma entrega vertical, de controle visível → operação por teclado/toque → atualização da mídia da ação → regressões. Sem schema, novo fluxo de upload, alteração de biblioteca, exclusão física do arquivo no Cloudinary ou ampliação de permissões. Remover da ação mantém a semântica existente, não significa apagar o recurso do provedor.

Preparar este ticket não inicia implementação nem autoriza gravação real, commit, push, deploy ou trabalho no outro chat de Safari. Ler o estado vigente e preservar mudanças externas antes da execução. Atualizar os contratos/documentação pertinentes somente após a implementação e registrar verificação e limites reais.
