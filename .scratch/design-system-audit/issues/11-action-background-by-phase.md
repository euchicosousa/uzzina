# DS11 — Estudar a cor de fundo das ações por fase

**Status.** Aberto para estudo. Entrega em relatório, com comparativos visuais e proposta para decisão do proprietário.

**Bloqueado por.** Nenhum ticket para iniciar o estudo. A implementação depende de autorização explícita após a revisão do relatório.

## O que a pessoa vê

Em Hoje e nas telas de ações do parceiro, os cartões usam o fundo padrão da paleta, com exceções como o destaque de atraso. A cor da fase já aparece nos indicadores de fluxo e no cabeçalho do Kanban. A ideia é oferecer um modo opcional em que o próprio fundo do cartão mostre a cor da fase atual: Ideia, Fazer, Fazendo, Análise, Feito ou Concluído. A preferência deve estar disponível em **Minha Conta → Aparência** e nos **comandos da busca global**. Os nomes **Padrão** e **Por fase** são provisórios.

O pedido mantém o `relief` como está. A configuração de relevo da paleta, as sombras e suas transições, o anel base e a borda superior existentes são a referência da comparação. O hover do novo modo deve ser perceptível pela mudança de superfície também em paletas planas.

## O que investigar

1. **Onde o fundo muda.** Inventariar os cartões reais em Hoje (Parceiros, Categorias, Feed e Kanban), na Home (incluindo Sprint e Atrasadas) e nos calendários e listas do parceiro. Confirmar o alcance em Linha, Bloco e Conteúdo, inclusive cartões compactos, prévia durante arraste e ações exibidas em popovers. Na variante Conteúdo, distinguir o fundo do cartão da capa ou mídia, que tem cor própria da ação. Avaliar separadamente se os resultados da busca entram no alcance. A busca é, de saída, um lugar para alternar a preferência.
2. **Como aplicar a cor.** Usar as cores existentes das fases como referência única. Comparar fundo com a cor direta da fase e fundo tonal derivado da mesma cor, em claro e escuro. Mostrar todas as seis fases lado a lado, em especial Feito e Concluído. Verificar fase ausente ou desconhecida em dados legados, mudança de fase por edição e por arraste, atualização confirmada e reversão em caso de falha. Indicar o fallback proposto e como manter a fase identificável por nome ou ícone, além da cor.
3. **Como o hover responde.** Comparar ao menos duas abordagens, como um tom de hover com luminosidade ajustada e uma sobreposição neutra leve sobre a superfície. Medir a diferença de cor em repouso e hover e o contraste dos textos, ícones e controles nos dois estados, incluindo metadados e edição de título. Mostrar claro, escuro, uma paleta plana e uma com relevo. Conferir movimento reduzido e toque, além de hover e foco por teclado. Propor a resposta mais legível sem alterar sombra, anel base, borda superior, geometria ou comportamento do relevo.
4. **Como os sinais convivem.** O atraso hoje pode ocupar o fundo inteiro. Comparar em exemplos reais qual sinal ganha o fundo e como o outro continua reconhecível. Mostrar pelo menos uma ação atrasada em Sprint e selecionada, com e sem foco. Conferir texto, ícone de fase, atraso, Sprint, seleção, foco e edição inline. Documentar a precedência recomendada e as exceções por variante.
5. **Como a preferência funciona.** Estudar um único valor pessoal compartilhado entre Minha Conta e a busca. Confirmar o comportamento ao alternar na busca, salvar em Minha Conta, reabrir, recarregar e trocar de sessão, inclusive falha, tentativa novamente e alternâncias rápidas nos dois pontos. O padrão proposto para contas existentes é preservar a aparência atual. A escolha é de cor e deve coexistir com Linha, Bloco e Conteúdo, com filtros e agrupamentos. Verificar o contrato de persistência existente e se o validador no banco exigiria uma mudança para aceitar a nova chave. Indicar o alcance e a sequência de publicação se essa mudança for necessária.

## Critérios de conclusão

- [ ] O relatório separa o que já existe, o que foi observado em comparação visual e o que é proposta. Identifica as superfícies que adotariam o modo e os pontos que exigem decisão. Gaveta, portal e revisão pública ficam fora da proposta inicial.
- [ ] As prévias comparáveis mostram **Padrão** e **Por fase**, as seis cores e os estados de repouso, hover e foco. Incluem exemplos de Linha, Bloco e Conteúdo, tema claro e escuro, paleta plana e com relevo, e mostram como ficam atraso, Sprint e seleção. Usar dados fictícios e registrar qualquer cenário que tenha ficado sem verificação.
- [ ] A proposta define onde a opção aparece em Minha Conta e na busca, o que se vê após alternar, quando a escolha é gravada e como voltar à aparência atual. Registra a alternativa recomendada para fundo, hover e atraso, seus custos e um roteiro curto para o proprietário comparar as prévias.
- [ ] O relatório informa se a solução pede apenas mudanças de interface e preferência ou também validação no banco, com dependências e estimativa de esforço. A entrega do estudo se encerra com o relatório e a proposta para revisão.

## Modelos sugeridos

- **Codex — GPT-6 Luna.** Rastrear os cartões e os dois caminhos de preferência quando a matriz de comparação estiver definida.
- **Codex — GPT-6.1 Sol.** Conduzir o estudo completo, cruzando contraste, estados do cartão e persistência da escolha.
- **Codex — GPT-6 Astra.** Avaliar divergências entre variantes ou combinações de estados caso a comparação aponte conflitos difíceis de conciliar.
