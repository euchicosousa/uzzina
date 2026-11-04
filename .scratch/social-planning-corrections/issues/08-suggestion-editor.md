# C08: Corrigir teclado, foco e salvamento do editor de sugestões

**Status:** completed

**Blocked by:** Nenhum. Entregue em 02/11/2026.

**Prioridade:** P2

**Instrução de execução:** ler o README desta série; executar apenas este recorte, preservar mudanças externas e respeitar os bloqueios acima.
**What to build:** Editar sugestão usa o diálogo existente do app, funciona por teclado e só fecha como salvo quando a escrita é confirmada.

## Problema e pontos de entrada

`app/components/planning/PlanningSuggestionEditor.tsx` usa div com `aria-modal`, sem gestão de foco/teclado; fechar usa “✕” sem nome. `handleSave` fecha imediatamente sem esperar confirmação. Conferir os diálogos Prism/React Aria já usados no app e seu exemplo em /ui antes de compor.

## Passos obrigatórios

1. Substituir a estrutura manual pelo diálogo/modal existente. Dar título acessível e nome “Fechar edição de sugestão” ao controle de fechar.
2. Foco inicial previsível, Tab/Shift+Tab contidos pelo padrão existente e retorno ao disparador. Não adicionar listeners globais de teclado.
3. Escape de select/calendário interno fecha primeiro o overlay interno; Escape de edição com alterações segue guarda de descarte existente, sem perda silenciosa.
4. Conferir identidade do rascunho: abrir outra sugestão não reutiliza os valores de useState da anterior. Reabrir edição lê a versão correta; não resetar texto a cada render.
5. Salvar valida os campos do contrato D6 e aguarda confirmação C01. Enquanto salva, impedir duplicação; erro conserva valores e exibe retry; conflito pede revisão, sem sobregravar.
6. Cancelar/fechar não faz mutação. Não permitir editar campos de vínculo, autoria ou ID mediante patch arbitrário do componente.
7. Reutilizar controles de formato/data existentes. Só sugerir primitivo novo se houver lacuna concreta; nesse caso cumprir galeria/Prism, sem kit externo.

## Acceptance criteria

- [x] É possível abrir, percorrer campos, salvar/cancelar e retornar por teclado.
- [x] Foco não escapa do diálogo por Tab e overlays internos mantêm seu teclado.
- [x] Diálogo e fechar têm nomes em português.
- [x] Falha de escrita mantém diálogo e rascunho, sem falso sucesso.
- [x] Abrir sugestão B depois de A mostra valores de B.
- [x] Nenhuma edição/aprovação cria ação real.

**Fora do escopo:** revisão visual geral do app, editor de ações/Instagram e adaptação mobile do Planejamento.
