# ARQ-02 — Separar os detalhes compartilhados dos cartões Linha e Bloco

**Status.** Encerrado com aceite visual do proprietário em 19/11/2026 na `main` local (sem push/publicação).

**Bloqueado por.** Nenhum ticket. O estudo dos cartões já foi entregue. [Evidências e verificação](../../../docs/audits/2026-11-18-arq01-estrutura.md#cartões-de-ação)

## O que fazer

Nos cartões de ação de Hoje, Home, Parceiros e Sprint, o cartão principal carrega Linha e Bloco. As variantes voltam ao cartão principal para buscar data, prioridade, Sprint, parceiros e responsáveis. O estudo confirmou o ciclo e não atribuiu a ele falha no app. Mover esses elementos existentes para um módulo local que o cartão e as variantes possam usar diretamente. A reorganização é interna, com Linha e Bloco preservados como formatos distintos e sem diferença visual esperada.

O proprietário encerrou os apontamentos de teclado e altura do título. Conservar o comportamento e as dimensões existentes durante este trabalho. O escopo inclui conferir o cabeçalho de Conteúdo que usa os avatares de parceiros e conferir rapidamente a Linha do tempo, que usa a estrutura externa do cartão.

## Critérios de aceite

- [x] Linha e Bloco usam os detalhes compartilhados sem importar o cartão principal. O módulo compartilhado (`app/components/features/ActionItemDetails.tsx`) não depende das variantes.
- [x] Cartões preservam aparência, ajustes por largura, cores, avatares e indicadores. Conferir Linha e Bloco nos quadros de Hoje e Home, nos calendários da Home e de Parceiros e na prévia de temas do Admin.
- [x] Abertura, seleção, edição do título, arraste nos quadros e reordenação na Sprint conservam seu comportamento. Conferir também Conteúdo e Linha do tempo com dados fictícios.
- [x] A entrega é um ajuste local e reversível. Relatar o que foi verificado e o que falta conferir antes de publicar.

## Verificação em 19/11

- Extraídos `ActionItemDateTimeDisplay`, `ActionItemPartners`, `ActionItemResponsibles`, `ActionItemPriority` e `ActionItemSprint` para `app/components/features/ActionItemDetails.tsx`, sem alterar classes, marcação ou props.
- `ActionItem.tsx` importa `ActionItemPartners` do novo módulo (para o cabeçalho da variante `content`), `ActionLineVariant.tsx` importa os cinco componentes e `ActionBlockVariant.tsx` importa parceiros, responsáveis e Sprint de `ActionItemDetails.tsx`, eliminando o ciclo entre `ActionItem` e `ActionVariants`.
- Passaram `tsc --noEmit`, `biome check`, `prettier`, `git diff --check`, `vite build`, verificação do grafo de imports (nenhum caminho de `ActionItemDetails.tsx` ou das variantes alcança `ActionItem.tsx`) e 33 testes focados (`action-item-title-drag`, `action-late-transition`, `view-options` e `timeline`).
- Aceite visual confirmado pelo proprietário em 19/11/2026. Falta apenas push e confirmação de deploy na Vercel.

## Modelos sugeridos

- **Codex — GPT-6.1 Terra, raciocínio baixo (preferido).** Pode mover os detalhes sem alterar a apresentação e conferir as variantes no navegador.
- **Codex — GPT-6.2 Sol, raciocínio médio.** Pode executar a extração e verificar se os imports formam um caminho de volta por outro módulo.
- **Codex — GPT-6.2 Astra, raciocínio baixo.** Alternativa se a execução revelar dependências inesperadas em Conteúdo, Linha do tempo ou Sprint.
