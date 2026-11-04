# 38 — Editor de paleta com seletor compartilhado e exclusão discreta

**Resumo:** Substitui ColorListEditor por UPaletteEditor com seletor compartilhado, reordenação e exclusão discreta.

**Commit de referência:** `d7efe5f` — entrega versionada no histórico local.

**What to build:** substituir o seletor nativo de cor da lista pelo mesmo seletor da ação, renomear o editor para UPaletteEditor e tornar o comando de exclusão discreto em repouso.

**Blocked by:** V37, seletor reutilizável UColorPickerDropdown funcional. Executor previsto Gemini.

**Status:** Concluído (100%) — aceite registrado no índice da série em 04/11/2026.

## Entrega

- [x] Migrar ColorListEditor para UPaletteEditor, atualizando arquivo, export, imports, consumidor administrativo do parceiro, galeria, navegação e referências vigentes desse componente. Não expandir para uma renomeação global.
- [x] Usar UColorPickerDropdown de V37 no botão de cor de cada linha, preservando identidade e posição da ocorrência editada. Não simular uma ação para abrir o seletor.
- [x] Preservar adicionar, editar, remover, reordenar e o contrato de formulário/onChange/autosave do cadastro do parceiro. Erro antigo não pode restaurar a paleta inteira sobre uma edição mais recente.
- [x] Compartilhar a validação de V37: entrada inválida permanece editável, com feedback, sem virar preto ou hexadecimal preenchido artificialmente. Emitir apenas cor válida no formato esperado pelo consumidor.
- [x] Criar a variante PrismButton ghost-destructive com aparência ghost neutra/transparente em repouso e aparência destructive no hover/focus-visible. Manter foco acessível e tratamento de disabled. Usar icon-sm na exclusão da paleta, sem alterar outras variantes.
- [x] Preservar alça, ordem e seleção ao abrir/fechar popover e durante reordenação. Remover input nativo de cor apenas quando o seletor compartilhado cobrir sua função.
- [x] Atualizar o playground para o nome novo, seletor compartilhado, estado vazio e exemplos de exclusão, sem chamadas ao banco.

## Validação

- `npx tsc --noEmit` aprovado com 0 erros.
- Biome lint aprovado com 0 erros/avisos.
- Prettier executado com `prettier-plugin-tailwindcss`.
- Suíte `tests/color-picker-and-palette-editor.test.tsx` 5/5 PASS.
- Variante `ghost-destructive` integrada em `PrismButton` e demonstrável no playground de botões.
- Galeria atualizada com `UPaletteEditorSection` (id `#uzzina-palette-editor`, mantendo alias legado para `#uzzina-color-list-editor`).

Adicionar, editar e remover primeira/última cor; editar HEX inválido; cancelar/fechar seletor; reordenar; repetir uma cor em duas posições e editar/remover só uma delas; conferir onChange/formulário e fluxo de salvamento real sem gravar fixtures em produção. Teclado, foco, claro/escuro e largura estreita. Conferir hover/focus da variante destructive discreta na galeria. Formatar e executar checks pertinentes ao risco.

Registrar resultado e aceite visual pendente no ticket, CURRENT e relatório central. O estudo de referência está em docs/audits/2026-11-04-color-and-celebration-studies.md. Começar por CURRENT/AGENTS, conferir Git e preservar alterações externas.
