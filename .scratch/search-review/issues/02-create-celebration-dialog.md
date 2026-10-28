# 02: Diferenciar criar e gerenciar datas comemorativas

**What to build:** Criar data comemorativa na busca abre um modal simples com título e calendário para cadastrar. Gerenciar datas comemorativas continua abrindo a página administrativa existente. Evitar dois comandos diferentes com exatamente o mesmo destino/comportamento.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent — deferred by owner; do not start automatically

## Evidence

O proprietário observou em28/10/2026 que Criar data comemorativa e Gerenciar datas comemorativas abrem a mesma página. O código confirma os dois destinos iguais. A proposta registrada é tornar Criar um cadastro rápido por modal; nenhuma alteração foi iniciada.

## Acceptance criteria

- [ ] Criar abre modal com campo de título, seleção de data por calendário e ações de cadastrar/cancelar, reutilizando componentes e operação de criação existentes.
- [ ] Gerenciar mantém a página atual com listagem e administração. Não criar outra página ou outro sistema de datas comemorativas.
- [ ] Ambos os comandos continuam exclusivos para administradores; preservar autorização no servidor/banco. Abrir/cancelar não grava dados.
- [ ] Validar título/data, impedir envios duplicados e manter os dados preenchidos se houver falha. Sucesso atualiza o cache/lista existente sem recarregar a aplicação.
- [ ] Preservar edição das ações abertas, guardas necessárias e teclado do calendário/modal, com foco inicial, Escape e retorno de foco adequados. Shift não ganha semântica de ação secundária para esse comando.
- [ ] Testes nos componentes reais verificam distinção entre comandos, permissões, criação única, cancelamento, erro/retry e sincronização; conferir desktop/mobile e temas com HTTP controlado.

## Verification

Executar testes pertinentes, format/lint/typecheck/build e atualizar CURRENT/contratos/KI aplicáveis. Não criar registros de teste no banco real. Sem implementação, commit ou publicação autorizados por este registro.
