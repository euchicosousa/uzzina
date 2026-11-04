# C07: Reutilizar calendário do app e mover somente sugestões

**Status:** completed — PlanningCalendarView adaptado ao padrão do app com rolagem em dois eixos, drag-and-drop de sugestões e zero mutações em ações

**Blocked by:** C01 e C06. Não depende de geração real C05 para trabalhar com proposta controlada.

**Prioridade:** P2

**Instrução de execução:** ler o README desta série; executar apenas este recorte, preservar mudanças externas e respeitar os bloqueios acima.
**What to build:** A mesma proposta aparece na lista e no calendário real do app, com ajustes laterais e rolagens nos dois eixos. Mudar uma sugestão de data salva somente essa sugestão.

## Pontos de entrada

`app/components/planning/PlanningCalendarView.tsx`; `app/components/features/Calendar.tsx`, `CalendarWithDnd.tsx`, `PartnerCalendarBoard.tsx`, `CalendarToolbar.tsx` e consumidores existentes. Os caminhos são pontos de pesquisa, não autorização para reescrever todos eles.

## Passos obrigatórios

1. Identificar a menor fronteira compartilhável de renderização/layout/controles do calendário existente. Documentar eventos de seleção e movimento antes de alterar.
2. Substituir a grade exclusiva do Planejamento por composição dessa implementação. Se houver acoplamento a ações, separar somente os dados/eventos necessários. Não copiar o calendário nem inventar ações falsas com IDs de sugestões.
3. Renderizar título, formato e decisão das sugestões da proposta aberta, preservando IDs.
4. Manter ajustes laterais, largura, altura por semana/célula e rolagem horizontal/vertical. A região direita não força o documento a crescer nem interfere na rolagem esquerda.
5. Arraste calcula nova data e persiste pela mutação de sugestão C01 com versão esperada. Implementar alternativa por teclado/formulário para a mesma operação.
6. Preview local não grava em ações. Falha remove somente o preview da operação; não restaurar snapshot completo sobre mudanças mais novas.
7. Respeitar limites de movimentação somente se aprovados. Não confundir limite da seleção de comemorações com proibição automática de mover sugestões.
8. Lista e calendário refletem mesma versão após confirmação. Sem gravação ao alternar visualização.
9. Preservar consumidores Home/parceiro. Mudança compartilhada exige verificação dirigida nesses consumidores; não redesenhá-los.

## Acceptance criteria

- [ ] Grade própria deixa de ser usada; recursos do calendário existente ficam disponíveis.
- [ ] Dois eixos e ajustes laterais funcionam dentro da coluna direita.
- [ ] Arrastar e editar data pelo teclado persistem na sugestão e sobrevivem à reabertura.
- [ ] Espionar fronteira de ações confirma zero INSERT/PATCH durante revisão/movimento.
- [ ] Falha/conflito e resposta antiga não corrompem outra sugestão.
- [ ] AppBar continua visível e reserva de rolagem segue o padrão vigente.
- [ ] Roteiro visual curto validado pelo proprietário; teste automatizado não substitui aceite visual.

**Não fazer:** nova biblioteca de calendário, novo shell, suporte mobile, alterações de ação real ou duplicação do calendário.
