# EST-05 — Investigar bloqueio de estratégias ao reabrir a ação

## Modelos sugeridos

- **OpenAI** — GPT-6 Astra, para rastrear a operação durável e as condições de concorrência.
- **Anthropic** — Claude Opus 5.5, para investigar o coordenador de salvamento e as alternativas ao modal.
- **Google** — Gemini 4 Argon, para reproduzir a sequência e revisar cache, versões e guardas. Disponibilidade depende do plano.

**Status.** Encerrado em 06/11/2026 a pedido do proprietário. Causa, correção (`45e58a9`) e roteiro de aceite em [docs/audits/2026-11-06-est-05-strategy-conflict-on-reopen.md](../../../docs/audits/2026-11-06-est-05-strategy-conflict-on-reopen.md). Aceite confirmado pelo proprietário em 06/11/2026: o passo 1 do roteiro foi testado no app e funcionou normalmente.

**Entrega.** Relatório de causa, passos de reprodução e recomendação. Escopo de investigação. Mudanças de código dependem de autorização.

**Bloqueado por.** Nenhum ticket.

## Cenário relatado

Gerar estratégias, fechar a ação e reabri-la. A comparação exibe estratégias na versão atual do servidor, versão aberta vazia e nenhuma edição local pendente. A mensagem atribui a alteração a outra pessoa ou sessão. Cancelar fecha o modal, mas mantém o aviso no topo. Ao abrir estratégias, o usuário não consegue usá-las. O proprietário quer entender como seguir com a versão desejada e considera remover a interrupção.

## O que verificar

- [ ] Reproduzir com conclusão antes e depois da reabertura. Rastrear cache inicial, leitura canônica, operação durável, atualização de versão e entrada em comparação. Identificar se a alteração veio da própria operação e por que ainda bloqueia seleção ou uso após Cancelar.
- [ ] Separar geração própria sem edição local de edição concorrente real, mudança remota em outros campos e edição local pendente. Verificar o que cada botão faz e se existe caminho para continuar com a versão aberta, usar as sugestões salvas ou recuperar a versão desejada.
- [ ] Comparar manter o modal, limitar sua abertura a conflitos reais e oferecer atualização ou escolha sem bloqueio. Explicar consequências para rascunhos, guardas de versão, seleção e persistência, inclusive ao reabrir novamente.
- [ ] Entregar recomendação concreta, evidência e roteiro de aceite, com passos para o usuário no comportamento atual se houver um caminho seguro.
