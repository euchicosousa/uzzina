# Novo UZZINA — direção da primeira versão

**Decisão do usuário em 27/09/2026.** Este documento define a direção atual do projeto novo. Quando uma hipótese no `BRIEF-NOVO-UZZINA.md` divergir daqui, esta direção prevalece.

## Produto

O centro do aplicativo é **uma página principal única**. A **home é a home**: abre em **Hoje**, que deve ser direto e objetivo. Outras formas de olhar o mesmo trabalho ficam em abas nessa área. Um **filtro de cliente** muda o escopo da visão ativa; a pessoa não precisa abrir uma página de cliente separada para ver ou planejar o trabalho desse cliente.

Não transformar o caderno em regra de negócio. O caderno mostrou que ver **cliente + título da ação** de forma limpa é útil, mas não é necessário reproduzir o ritual de escrita, a grade em papel, as cores ou uma lógica obrigatória de seleção de prioridades. O usuário continuará podendo usar o caderno. O aplicativo precisa ser bom por si.

## Primeira superfície para construir

```text
┌─────────────────────────────────────────────────────────────┐
│ UZZINA                         [Todos os clientes ▾] [Busca] │
├─────────────────────────────────────────────────────────────┤
│ [Hoje] [Calendário] [Quadro]                                │
├─────────────────────────────────────────────────────────────┤
│ Conteúdo da aba ativa, no escopo do cliente selecionado      │
│                                                             │
│ Abrir uma ação revela detalhes sem perder aba e filtro.      │
└─────────────────────────────────────────────────────────────┘
```

Os nomes e a quantidade final de abas podem ser ajustados após o primeiro protótipo. **Hoje** e **Calendário** são necessidades confirmadas. **Quadro** é uma candidata baseada no uso atual. Lista ou feed só entram como aba própria se resolverem uma tarefa clara; não reproduzir automaticamente as quatro variantes do Hoje atual.

### Hoje

- É a tela inicial, sem uma sequência de blocos concorrentes acima dela.
- Mostra imediatamente o que está marcado para hoje no escopo ativo, com **cliente e título legíveis**. A ação pode ser aberta para consultar e editar detalhes.
- Pode ter controles discretos para mudar o dia e criar ação. Não obrigar o usuário a escolher uma visualização antes de enxergar o trabalho.
- Exibir separadamente falha de carregamento e dia sem ações. Não apresentar falha como lista vazia.
- A ordem inicial pode seguir uma regra simples e visível; não inventar um algoritmo de prioridade nem uma lista pessoal obrigatória na primeira versão.

### Calendário

- Mostra o trabalho por semana e por período mensal; o período mensal inclui **semanas completas**, mesmo quando cruzam o limite do mês.
- O cliente selecionado filtra o calendário sem levar a outra página. Reagendar uma ação deve confirmar a gravação e recuperar o estado anterior se falhar.
- Dias fora do mês de referência permanecem visíveis, com distinção visual. Métricas chamadas “do mês” precisam indicar se contam o mês civil ou o período completo exibido.

### Quadro (candidato para a primeira entrega)

- Permite acompanhar ações pelo andamento. Deve usar os mesmos registros e o mesmo filtro de cliente.
- Não copiar automaticamente as fases atuais; começar com os estados necessários aos trabalhos reais e ajustar depois. Se o quadro não estiver pronto na primeira entrega, Hoje e Calendário ainda formam uma versão útil.

### Filtro de cliente

- Fica visível na área principal. O estado padrão é **Todos os clientes**.
- Ao selecionar um cliente, a aba atual continua aberta e mostra somente o trabalho dele. Ao trocar de aba, o cliente selecionado permanece até a pessoa limpá-lo.
- O contexto ativo precisa estar evidente, evitando que um calendário filtrado pareça vazio por engano.
- Aba, cliente e período devem poder ser representados na URL para restaurar e compartilhar a visão. A primeira implementação pode começar simples, desde que não dependa de estado oculto impossível de recuperar.

### Detalhe da ação

Abrir uma ação deve manter o contexto da home ao fundo ou restaurá-lo ao fechar. Mostrar primeiro o que permite agir: título, cliente, responsável, data e estado. Briefing, conteúdo, arquivos, histórico e controles avançados podem aparecer quando relevantes. Não copiar a gaveta atual inteira antes de decidir o que cada tipo de ação precisa.

## Tecnologia já decidida para começar

- SPA com React, TypeScript, Vite, TanStack Router e TanStack Query; PostgreSQL/Supabase para dados e identidade; Vercel para hospedagem quando houver deploy.
- Carregar dados pequenos e compartilhados uma vez; consultar ações por período e filtro com cache coerente. Manter a navegação rápida.
- Operações privilegiadas e integrações com segredos passam por funções de servidor. Permissões de equipe e cliente devem ser verificadas no servidor/banco; o fato de a interface ser SPA não substitui autorização.
- Base UI/shadcn é a primeira candidata para novos componentes; React Aria atual serve de referência e pode ser reutilizado pontualmente. Tiptap para texto rico, dnd-kit para interações customizadas de calendário/quadro, Cloudinary para mídia na primeira fase. Essas escolhas podem mudar se um teste de uso ou implementação mostrar problema concreto.
- Métricas do Instagram e publicação automática são capacidades futuras. A primeira versão da home não precisa dessas integrações para provar seu funcionamento.

## Como avançar sem paralisar o projeto

1. Criar uma primeira home navegável com **Hoje**, filtro de cliente e **Calendário** usando dados de exemplo. Confirmar se a mudança de aba e filtro preserva o contexto e se Hoje é suficientemente objetivo.
2. Ajustar o desenho depois de usá-lo. Adicionar Quadro se ele trouxer uma forma útil de operar; não preenchê-lo só para completar uma lista de abas.
3. Modelar e conectar os dados reais conforme os fluxos aprovados. Implementar autenticação, autorização, salvamento confiável e testes dos caminhos críticos antes de usar dados da agência.
4. Migrar funcionalidades do app antigo por necessidade demonstrada, não por completude. O app antigo continua como referência e funcionando em paralelo.

**Critério da primeira versão:** em poucos segundos, o usuário consegue ver Hoje, filtrar um cliente, mudar para o calendário, abrir uma ação e voltar ao mesmo contexto. O aprendizado vem desse produto em uso; não depende de responder previamente a todas as perguntas de descoberta.

Um protótipo navegável inicial está em `prototipo-home-v1.html`. Ele usa dados fictícios e serve para avaliar a estrutura; não é a aplicação final.
