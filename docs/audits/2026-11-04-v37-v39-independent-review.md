# Revisão de entregas e análise V39 — 04/11/2026

Base 8d80249 com alterações locais. Rodada de análise solicitada pelo proprietário, sem correções funcionais ou commit.

## Situação encontrada

| Ticket | Estado observado |
|---|---|
| V35 | Parte 1 implementada na navegação; animação continua adiada. Não reexecutada toda a matriz de navegação nesta rodada. |
| V36 | Estudo ainda ready-for-agent. |
| V37 | Código de seleção de cor e formatos entregue. Existem divergências/reprovações abaixo antes de concluir. |
| V38 | UPaletteEditor integrado ao cadastro e galeria, usa seletor compartilhado e exclusão ghost-destructive. Testes não certificam o componente nem persistência. |
| V39 | Ainda ready-for-agent. PartnerCelebrationsSelector permanece com a implementação anterior, sem alteração funcional que atenda o ticket. |
| V40–V43 | Ainda ready-for-agent, sem entrega identificada desses contratos. |

## V39 — análise detalhada

1. A padronização visual continua pendente. Há texto de 9/10/11px, busca sm com campo h-7 e ícone size-3.5, botões de mês nativos e selo amber próprio de 9px. O ticket deve trocar essas composições pelos primitivos existentes, preservando organização, agrupamento mensal e IDs.
2. Cada linha tem div role=checkbox tabIndex=0 e input type=checkbox dentro dela. Na fixture com oito datas, foram observados oito checkboxes ARIA de linha mais oito inputs nativos de data (dois outros inputs pertencem aos controles do playground). A linha deve se tornar um único PrismCheckbox com nome acessível, foco único e callback único.
3. Em Todos, buscar zzzinexistente remove todas as linhas sem apresentar mensagem de nenhum resultado. Em mês específico há mensagem. Unificar o estado vazio de filtro sem confundi-lo com catálogo vazio.
4. saving só mostra o texto Salvando. Não há disabled/isDisabled/aria-disabled nos comandos de mutação. Definir e aplicar a proteção de seleção/limpar enquanto o consumidor não suporta novas alterações durante a escrita; não assumir que o texto por si só bloqueia ações. Busca e filtro de mês podem continuar disponíveis. Conferir o fluxo de autosave do consumidor antes de decidir se é bloqueio ou serialização.
5. Preservar contagem total da seleção ao filtrar, data civil por substring e dois grupos responsivos. Não alterar formatos de data nem usar conversão de fuso por consequência da troca visual.
6. Para o filtro de meses, usar ToggleGroup single/disallowEmptySelection e labels claros para meses/contagens. Manter rolagem interna na janela estreita. Limpar busca e seleção precisam nomes e foco explícitos.
7. Manter o título longo da galeria quebrável e evitar recolocar a moldura externa removida. Revisar carregamento/vazio/sem resultado junto de teclado e contraste, além da aparência da lista preenchida.

## V37 — discrepâncias verificadas

- O ticket pede nome de parceiro acima das cores. A implementação atual usa separadores entre paletas e não renderiza labels dos grupos. Na fixture com Parceiro Alfa e Parceiro Beta, os dois nomes tiveram zero ocorrências visíveis. CURRENT registra a mudança para separadores, mas o ticket ainda afirma o critério original concluído. Confirmar se houve aceite dessa mudança e reconciliar contrato/status.
- Campo HEX preenchido com #12 e desfocado voltou a #2563EB. Não houve aria-invalid nem mensagem de erro. O callback não emitiu cor inválida (positivo), mas não preservou o rascunho inválido/feedback exigido pelo V37. Corrigir antes de declarar validação completa.
- Os seis testes existentes passaram, porém importam parseColor/utilitários e reconstroem filtros/validação dentro do próprio teste. Não importam UColorPickerDropdown nem UPaletteEditor. Por isso não verificam esses comportamentos reais nem callbacks, montagem, drag-and-drop ou gravação.

## Verificações e limites

Typecheck aprovado. Seis testes existentes passaram. Chromium com fixture de componentes reais, dados locais e rede externa bloqueada. Reproduzidos foco duplicado de linha, filtro sem resultado em Todos, comandos ainda habilitados em saving, ausência de nomes dos grupos e reset de HEX incompleto. Zero pageerror. Não exercitados banco, persistência real ou provedor.

Log de navegador /tmp/uzzina-v39-browser.log, testes /tmp/uzzina-v37-39-tests.log, tipagem /tmp/uzzina-v37-39-types.log. Fixture temporária removida e servidor encerrado.

## Encaminhamento

V39 está pronto para começar, mas não para finalizar. Executar o ticket com os pontos funcionais acima. V37 exige corrigir validação e reconciliar o desenho dos grupos. V38 pode seguir para revisão específica de fluxo, identidade de itens, falhas e callback sem duplicação. Não concluir a série apenas com os seis testes atuais.
