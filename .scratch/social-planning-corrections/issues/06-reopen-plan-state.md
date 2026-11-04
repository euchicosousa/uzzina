# C06: Reabrir proposta com configuração e parceiro coerentes

**Status:** completed — restauração canônica de inputs e período em handleOpenPlan; encerramento limpo ao trocar de parceiro

**Blocked by:** C01. Pode ser implementado antes de C05 usando proposta canônica controlada.

**Prioridade:** P2

**Instrução de execução:** ler o README desta série; executar apenas este recorte, preservar mudanças externas e respeitar os bloqueios acima.
**What to build:** Abrir proposta anterior restaura sua configuração e mostra suas sugestões no período correto. Trocar parceiro não deixa uma proposta de outro cliente aberta.

## Problema e pontos de entrada

`app/routes/app/planejamento.tsx` abre apenas `setCurrentPlan(plan)`; o calendário usa início/fim do formulário atual. A troca de parceiro atualiza a lista, mas não limpa/invalida a proposta aberta. Ler também `PlanningCalendarView.tsx` e o contrato C01.

## Passos obrigatórios

1. Criar uma única operação de abrir proposta: carregar versão autorizada, conferir parceiro/identidade e validar configuração persistida antes de aplicar.
2. Restaurar modo, período ou quantidade do tema, frequência, dias, direcionamento, formatos e seleção de comemorações a partir da entrada canônica. Não preencher campos ausentes inventando respostas.
3. Fazer a visualização usar dados da proposta selecionada. Alterar o formulário para preparar uma futura geração não deve mudar o período das sugestões já geradas.
4. Definir claramente configuração de nova geração e resultado aberto. Usar nomes/tipos explícitos; não duplicar todos os estados do app nem criar store global sem necessidade.
5. Ao trocar parceiro, passar pela guarda de alterações e encerrar/desassociar a proposta anterior. Não mostrar A sob título/URL de B. Partner inválido mantém seleção explícita, sem escolha automática.
6. Descartar leitura tardia de proposta/sessão anterior. Clique rápido em A e depois B termina em B.
7. Plano antigo com entrada incompleta mostra aviso de incompatibilidade/recuperação; não quebra render nem altera dados automaticamente.
8. Confirmação de escrita ou geração conserva relação com o parceiro e configuração capturados, mesmo se o formulário atual tiver mudado.

## Roteiro de validação

Abrir plano de novembro com formulário em dezembro: sugestões continuam visíveis em novembro. Abrir modo tema após período restaura direção/quantidade corretas. Trocar parceiro com edição pendente permite conservar/cancelar conforme guarda; resposta atrasada não reaparece. Redimensionar e voltar à largura suportada preserva estado sem reenviar operação.

## Acceptance criteria

- [ ] Reabrir recupera valores persistidos completos.
- [ ] Formulário de nova geração não desloca calendário da proposta aberta.
- [ ] Plano de A nunca permanece sob contexto/URL de B.
- [ ] Conflito, erro de leitura e acesso revogado têm estado explícito.
- [ ] Nenhuma reabertura gera IA ou cria ação.
- [ ] Header/AppBar, acessos e duas rolagens existentes permanecem.
