# DS05 — Investigar a ordem de ícone e texto nos botões

**Entrega:** Parecer sobre quando usar ícone antes ou depois do texto na UZZINA, com inventário dos usos reais e proposta para revisão do proprietário.

**Bloqueios:** Nenhum. Coordenar a cobertura com DS02.

**Status:** ready-for-agent. Investigação e proposta. Qualquer implementação depende de decisão posterior.

## Modelos sugeridos

- **OpenAI (Codex)** — GPT-6.1 Sol, para cruzar documentação oficial e usos reais no código.
- **Anthropic (Claude)** — Claude Haiku 5.5, para pesquisar diretrizes e inventariar controles. Disponibilidade conforme plano.
- **Google (Gemini/Antigravity)** — Gemini 3.8 Flash, para mapear ocorrências e sintetizar exceções. Disponibilidade conforme plano.

## Critérios de aceite

- [ ] Pesquisar documentação primária de design systems e acessibilidade. Citar links diretos e distinguir requisitos de acessibilidade, convenções e escolhas de produto. Indicar onde as fontes divergem ou não prescrevem uma ordem.
- [ ] Varrer os botões com texto e ícone nas rotas reais da equipe e do portal, incluindo controles de navegação e wrappers de upload. Registrar rota, componente, ordem renderizada, significado do ícone e classes ou propriedades responsáveis. Separar exemplos da galeria e controles que exibem só ícone por largura ou estado.
- [ ] Comparar casos de ação, direção, menu e estado. Conferir amostras renderizadas, incluindo versões compactas, e distinguir ordem visual da ordem no DOM e do nome acessível.
- [ ] Propor uma convenção com exemplos reais, exceções justificadas e lista de usos que valeria ajustar. Entregar o parecer para decisão antes de qualquer mudança na interface.
