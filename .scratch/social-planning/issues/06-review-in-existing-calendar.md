# 06: Revisar e mover sugestões no calendário existente

**What to build:** A pessoa alterna a visualização da mesma proposta para o calendário existente, examina as sugestões e muda suas datas sem criar ou alterar ações reais.

**Blocked by:** 02 — Revisar sugestões e salvar decisões.

**Status:** ready-for-agent (após #02).

## Base existente a preservar

- A estrutura da Mesa e seus acessos já existem: mesma página interna, visual limpa sem cartões/fundos/gutters externos, layout global e AppBar, duas rolagens independentes e desktop-only.
- Reutilizar o calendário real do app, com controles, ajustes laterais, dimensionamento e rolagens vertical e horizontal. O calendário não é recriado nem substituído pela grade ilustrativa do mockup.
- Sugestões mantêm identidade própria e estado persistido de #01/#02. Os componentes atuais de calendário podem esperar ações; integrar por uma fronteira de dados/eventos adequada, sem adaptar uma sugestão como ação falsa.

## Acceptance criteria

- [ ] Lista/calendário mostram a mesma proposta, datas canônicas e rótulos de estado definidos por #02; não inventam descarte, encerramento ou conversão de pendentes/rejeitadas.
- [ ] Reutiliza o calendário existente com seus controles e ajustes laterais. A grade continua alcançável vertical e horizontalmente, sem corte ou expansão descontrolada da página.
- [ ] Mudar data por arraste persiste somente na sugestão. Acesso por teclado/formulário também permite escolher data; gesto não é a única forma de editar.
- [ ] A rolagem de dois eixos e ajustes laterais preservam proposta aberta, edição, decisões e datas confirmadas; retorno de operação mantém a posição/seleção esperada.
- [ ] Preview de arraste é local à operação. Falha desfaz somente esse preview; conflito não restaura um snapshot completo sobre edições posteriores.
- [ ] Datas externas ao período são bloqueadas somente se esse limite tiver sido aprovado e estiver definido pelo tipo de proposta; não inventar bordas de intervalo.
- [ ] Dados não são enviados às mutações de ações e nenhuma criação/edição de ação ocorre ao abrir, revisar, aprovar ou mover uma sugestão.
- [ ] Troca de sessão/proposta e respostas antigas não alteram calendário seguinte. Autorização, versão, erro/retry e acesso revogado são verificados no servidor.
- [ ] Verificação inclui ambos os eixos, controles laterais, movimento/teclado, reabertura, conflito e confirmação de ausência de escrita em ações. Aparência é validada pelo proprietário na Mesa desktop.

**Fronteira:** calendário e movimento de sugestões. Não gera, não define decisões de revisão e não finaliza. Pode trabalhar com #03/#04 após #02 em checkout separado; #05 integra-se quando disponível.
