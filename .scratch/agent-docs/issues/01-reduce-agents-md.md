# DOC-01 — Reduzir o AGENTS.md movendo o detalhe por área para documentos próprios

## Modelos sugeridos

- **Claude Code (Anthropic):** Claude Sonnet 5.5, para mover blocos sem reescrever e conferir cada etapa com `diff`.
- **Codex (OpenAI):** GPT-6.1 Terra, para mover o texto por etapa, ajustar os links e conferir que nenhuma frase se perdeu.
- **Antigravity (Google):** Gemini 3.8 Flash, para a movimentação mecânica dos blocos; confirmar disponibilidade no plano.

**Bloqueado por.** Nenhum. Cada etapa só começa depois de o proprietário aprovar a anterior.

## O problema, em linguagem simples

O guia que todo agente lê ao entrar no projeto, o `AGENTS.md`, tem cerca de 52 mil caracteres (uns 13 mil tokens, estimativa). Todo agente carrega tudo isso até para ajustar uma cor. Cerca de 58% é detalhe de uma área específica (gaveta de ação, busca, páginas, detalhes finos do design system) que só importa ao mexer nela. Isso custa atenção e dinheiro, e dilui as regras que valem sempre.

## Onde ver

Não há tela. O efeito é no arquivo [AGENTS.md](../../../AGENTS.md) e em novos documentos em `docs/contracts/`.

## O que foi analisado (estudo de 07/11/2026, só leitura)

- Tamanho: 189 linhas, ~52 mil caracteres. `CLAUDE.md` só importa o AGENTS.
- Seções maiores: contratos de ações e gaveta (~26%), design system Prism (~21%), preferências e visual (~15%), IA e ambientes (~11%).
- Necessário em toda tarefa: ~30% (processo, convenções, mapa de pastas, regras estruturais e de segurança).
- Só importa por área: ~58%. Histórico ou repetido do README: ~10% (por exemplo o `bun run dev` em produção, o endereço do portal, datas de aplicação em produção, hashes de commit).
- O `docs/audits/CURRENT.md` tem ~219 mil caracteres e o AGENTS manda lê-lo primeiro: custo à parte, fora deste ticket.
- Meta sugerida: 14 a 18 mil caracteres, estimativa e não regra.

## Proposta (por etapas, cada uma com conferência)

1. Criar `docs/contracts/` e mover só a **gaveta de ação**, deixando um parágrafo-resumo e o link.
2. Mover **IA e banco**; tirar as datas de aplicação em produção para o CURRENT ou o manifest; atualizar a etiqueta do IA-M04.
3. Mover **páginas** (Hoje, Minha Conta, Planejamento, AppBar, calendários) e **busca, comandos, celebrações e Ajuda**.
4. Mover os **detalhes do Prism** (foco, movimento, abas, containers), mantendo no AGENTS a escala de controles, os tokens e as regras gerais.
5. Remover duplicações com o README, deixando uma linha com a decisão e o link.
6. Escrever o índice final "ao mexer em X, leia Y primeiro" e conferir os links.

## Cuidados

- **Mover, não apagar nem reescrever.** Muitos parágrafos são regras que nasceram de bugs reais (foco do Tab, `restoreFocus`, `setRawAction` por tecla). Conferir cada etapa com `diff` do texto movido contra o original.
- Preservar, com texto e data, as decisões explícitas do proprietário: portal sem validação de Origin (01/11), `bun run dev` em produção (27/10), rodapé da gaveta sem customização (03/11), foco sem paradas em rolagens (03/11), barra compacta do editor do Instagram (06/11), regra de caixas de formulário, ordem ícone/texto (DS05), priorizar agilidade e não rodar testes por rotina, tickets de estudo sem implementação, regras de linguagem simples.
- O risco maior é um agente não abrir o documento da área. O índice com gatilhos curtos e imperativos reduz, mas não elimina; por isso o proprietário valida a etapa 1 antes das outras.
- Ajustar os links relativos dos blocos movidos.
- Não há benchmark nosso que quantifique o ganho; o argumento é custo de contexto e clareza.

## Fora do escopo

Mudar o conteúdo de qualquer decisão, reduzir o CURRENT, e qualquer mudança de código.

## Como o proprietário confere

Depois da etapa 1: abrir o AGENTS e ver que o parágrafo-resumo e o link da gaveta estão no lugar, e abrir o documento novo para ver que o texto é o mesmo de antes. Pedir a um agente uma pequena tarefa na gaveta e ver se ele abre o documento da área.

## Onde está

Executado e aceito pelo proprietário em 07/11/2026 (encerrado). AGENTS.md reduzido de 52.017 para cerca de 18.700 caracteres; sete documentos novos em `docs/contracts/`, ainda sem commit. Verificação por script: nenhuma linha do original foi perdida e os links existem.
