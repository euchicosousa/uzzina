# Revisão dos tickets V25–V34 — 04/11/2026

## Resultado vigente

Os dez tickets agora têm arquivos, exports e montagem na galeria. Typecheck e Biome dos dez arquivos passaram (zero erros/avisos). A entrega evita os imports não usados e assertions proibidas encontrados na rodada V19–V24. Prettier ainda falha em nove arquivos, apesar do relatório do executor declarar formatação concluída.

| Ticket | Resultado | Pendência |
|---|---|---|
| V25 ULoader | Implementado, sem erro de montagem. | Prettier. |
| V26 UToggleInput | Clique no alternador atualiza o checkbox. | Prettier. |
| V27 UPreferenceSwitch | Botão muda Inativo para Ativo. | Prettier. |
| V28 UAvatarSelector | Seleção de outro avatar atualiza os IDs exibidos. | Prettier. |
| V29 UAdminItemCard | Renderiza dentro de contexto de roteamento, sem erro. | Prettier. |
| V30 CalendarToolbar | Avançar dia e abrir calendário funcionam. | Prettier. |
| V31 ColorListEditor | Adicionar e remover cor funcionam. Prettier aprovado. | Pode seguir para aceite visual; arraste não foi exercitado nesta revisão. |
| V32 ActionDatePicker | Abre calendário e fecha por Escape. | Prettier. |
| V33 ActionColorDropdown | Popover abre e apresenta campos de cor. | Prettier. |
| V34 PartnerCelebrationsSelector | Filtro de nome e limpar seleção funcionam. | Corrigir overflow horizontal em 375px e formatar arquivo. |

## Evidência do V34

Montagem isolada das dez seções reais, com RouterProvider em memória. Em viewport 375px, documentElement.scrollWidth foi 380px. A seção uzzina-partner-celebrations-selector foi a única com scrollWidth 380px, embora a própria largura fosse 375px. Resultado repetido em claro e escuro. Contraria o critério do ticket que exige ausência de rolagem horizontal em 375px. Investigar o dimensionamento da barra com contador, busca e limpar, preservando as superfícies existentes.

## Verificações executadas e limites

- `bun run typecheck`, aprovado.
- Biome lint dos dez arquivos de seção, aprovado, zero erros/avisos.
- Prettier check dos dez arquivos, 9 pendências. Somente UzzinaColorListEditorSection passou.
- Chromium com componentes reais e dados fictícios, rede externa bloqueada. Zero pageerror e zero solicitações externas.
- Layout a 1400 e 375px, claro/escuro. Apenas V34 apresentou overflow horizontal no ensaio.
- Fluxos principais da tabela exercitados. Sem afirmar cobertura exaustiva de tamanhos, variantes, teclado, drag-and-drop ou salvamento de cores/data ao fechar.
- Montagem temporária removida, servidor encerrado. Sem correção funcional, banco, commit ou publicação nesta revisão.

Logs em /tmp/uzzina-v25-browser.log, /tmp/uzzina-v25-34-types.log, /tmp/uzzina-v25-34-lint.log e /tmp/uzzina-v25-34-format.log.

## Encaminhamento

A entrega está presente, mas os tickets não devem ser encerrados em conjunto antes de resolver formatação e V34. V31 está apto a seguir para aceite visual. Os demais dependem dos pequenos ajustes acima. Os estados concluídos escritos pelo executor devem ser lidos junto deste parecer independente.

## Correções posteriores — 04/11/2026

Pendências de Prettier corrigidas nos dez arquivos. Inspeção detalhada do overflow confirmou que a origem era o texto longo PartnerCelebrationsSelector no cabeçalho da galeria, não os controles do seletor. GallerySectionHeader passou a permitir quebra no título; componente operacional preservado. Chromium após o ajuste: 375/375 em ambos os temas, desktop 1400/1400, zero erros e solicitações externas. Os fluxos principais foram repetidos. V25–V34 tecnicamente prontos, aguardam [aceite visual](2026-11-04-ui-visual-acceptance-checklist.md).

Conflitos do editor nos tickets 30/32/34 reconciliados com cópias dos buffers. Diferença única: buffers não continham o parágrafo da revisão independente. Versão de disco preservada como superset dos dois relatos. Backups em /tmp/uzzina-buffer-30.md, /tmp/uzzina-buffer-32.md e /tmp/uzzina-buffer-34.md.
