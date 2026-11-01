# 02: Revisar sugestões e salvar decisões

**What to build:** A pessoa abre uma proposta salva, ajusta uma sugestão, registra sua decisão e retoma a revisão depois com o estado confirmado.

**Blocked by:** 01 — Gerar e reabrir proposta por tema.

**Status:** ready-for-agent (após #01).

## Base existente a preservar

- A página Planejamento, os acessos e o escopo pela URL já existem; adicionar a revisão na mesma Mesa limpa. Preservar layout interno do app, AppBar, duas colunas roláveis, divisor/padding interno e desktop-only.
- Sugestões têm identidade própria; ações existentes não são sugestões nem devem ser usadas como registros falsos.
- Ticket01 define a proposta e o armazenamento canônico. Reutilizar seu contrato, autorização, sessão e controle de versão.

## Acceptance criteria

- [ ] Cada sugestão abre em editor próprio da Mesa, sem abrir a gaveta de ação ou produzir escrita em ações reais.
- [ ] A pessoa pode editar somente os campos definidos em #01 e salvar com confirmação canônica; dados não salvos são preservados em erro e ficam sujeitos às guardas de saída existentes.
- [ ] Aprovar e rejeitar são decisões persistidas e reaparecem ao reabrir, inclusive após recarga. Não acrescentar regras de encerramento da proposta que pertencem à finalização.
- [ ] Datas opcionais podem ser alteradas na revisão apenas conforme o contrato de data definido para o modo de geração; data ausente é identificada sem inventar valor ou deslocá-la para hoje.
- [ ] Revisão concorrente detecta versão remota mais nova; não sobrescreve silenciosamente. A pessoa pode revisar a comparação e resolver pelo fluxo aprovado, preservando edição local até decisão explícita.
- [ ] Troca de proposta, parceiro, identidade ou sessão invalida respostas antigas; estado de uma proposta não aparece na seguinte.
- [ ] Servidor e banco revalidam sessão, autorização atual ao parceiro, estado editável e versão. Proposta encerrada ou acesso revogado não aceita escrita; não confiar no ID/decisão enviado pelo navegador.
- [ ] Contadores/lista refletem somente respostas confirmadas, e falhas/retry não duplicam a mutação. Rejeitar não apaga registro nem cria ação.
- [ ] Testes de risco cobrem salvar/reabrir, edição, decisão, data inválida/válida, erro/retry, conflito, acesso revogado e troca de sessão. Conferência visual do proprietário inclui foco/teclado na Mesa desktop.

**Fronteira:** editor e persistência de revisão. Não gera proposta, não acrescenta frequência/formatos extras e não cria ações. Fornece a identidade e decisão canônica que #06 e #07 consomem.
