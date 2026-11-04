# C00: Fechar somente as decisões necessárias às correções

**Status:** completed — decisões D1–D6 registradas em docs/plans/social-planning-design-decisions.md

**Blocked by:** Nenhum. Libera os pontos condicionais de C01, C02, C03, C04, C05 e C09.

**Prioridade:** Definição

**Instrução de execução:** ler o README desta série; executar apenas este recorte, preservar mudanças externas e respeitar os bloqueios acima.
**What to build:** Um registro curto e inequívoco das decisões de produto que o código atual inventou ou que os tickets originais deixaram em aberto. Este ticket não implementa a funcionalidade.

## Ler primeiro

- README desta série e relatório da revisão.
- Tickets originais 01, 03, 04, 05 e 07 em `.scratch/social-planning/issues/`.
- Decisões de design vigentes em `docs/plans/social-planning-design-decisions.md`.

## Passos obrigatórios

1. Conferir se uma decisão já foi registrada depois da revisão. Citar sua fonte exata; não pedir novamente uma resposta existente.
2. Registrar cada item abaixo como **confirmado**, com a fonte, ou **pendente do proprietário**:
   - D1 — Visibilidade: proposta privada do autor ou compartilhada entre membros autorizados ao parceiro? Definir leitura e edição, inclusive papel de administrador. Vínculo ao parceiro continua obrigatório; usuário ativo não significa acesso universal.
   - D2 — Frequência: início da semana civil, semanas incompletas e diferença entre número do slider e dias selecionados. Não transformar o algoritmo atual (domingo, primeiros dias da semana) em decisão aprovada.
   - D3 — Formatos: a soma manual deve equivaler ao total regular? O que fazer quando o total muda? Qual regra automática usar? Como escolher formato dos extras?
   - D4 — Comemorações: ocorrência coincidindo com slot regular acrescenta outro conteúdo ou ocupa o regular? Duas comemorações na mesma data rendem um ou dois extras? Verificar recorrência no cadastro existente antes de propor regra nova.
   - D5 — Finalização: pendentes impedem finalizar ou ficam de fora? Rejeitadas não viram ações. Fixar mapeamento de campos, responsáveis/defaults, data, horário e fuso. Proposta por tema pode não ter data: decidir como coletá-la antes de converter.
   - D6 — Contrato editorial mínimo: quais entradas são obrigatórias e quais campos compõem a sugestão? Aproveitar Contexto/Tom e Direcionamento; não criar um chat ou um questionário extenso.
3. Registrar as respostas no documento de decisões do Planejamento e apontar cada resposta nos tickets dependentes.
4. Enquanto um item estiver pendente, não implementar a política correspondente. Trabalhar apenas nos passos independentes claramente indicados nos tickets.
5. Não exigir que o proprietário reavalie a Mesa, Header, AppBar ou desktop-only: essas escolhas já estão aprovadas.

## Fora do escopo

Redesenho do app, ofertas/catálogos novos, upload/análise de documentos, implantação e execução de SQL.

## Acceptance criteria

- [ ] D1–D6 têm resposta com fonte ou pendência específica identificada.
- [ ] Nenhum valor existente no mockup ou no código é apresentado como aprovação do proprietário.
- [ ] Cada bloqueio é ligado ao ticket afetado; decisões independentes não bloqueiam toda a série.
- [ ] Documento distingue decisão de produto de escolha técnica reversível.
