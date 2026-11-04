# 36 — Estudar sobreposição entre Avatar, Avatar Group e avatares Uzzina

**What to build:** um parecer comparativo sobre os primitivos Avatar/Avatar Group e os componentes UAvatar/UAvatarGroup. Identificar quais personalizações atendem necessidades reais da UZZINA, quais repetem recursos dos primitivos e quanto seria possível simplificar preservando os comportamentos dos consumidores.

**Blocked by:** nenhum. Usar a implementação vigente e registrar a base analisada, inclusive alterações locais.

**Status:** ready-for-agent — somente estudo.

## Pergunta central

UAvatar e UAvatarGroup justificam a camada adicional que mantêm? Quais responsabilidades podem ser atendidas diretamente por PrismAvatar, PrismAvatarGroup e seus componentes auxiliares? A conclusão deve resultar da comparação, sem presumir que os wrappers precisam ser removidos.

## Escopo do estudo

- [ ] Inventariar contratos, propriedades, padrões e responsabilidades de Avatar, Image, Fallback, Group, GroupCount e Badge, comparando com UAvatar/UAvatarGroup.
- [ ] Mapear os consumidores reais do app e os comportamentos de que dependem, incluindo pessoas, parceiros, responsáveis e Sprint. Distinguir exemplo da galeria de uso operacional.
- [ ] Comparar tamanhos efetivos, escala e tipografia, sobreposição, limite de itens, indicador +N, imagem ausente ou com erro, iniciais, cores por marca, bordas, tema claro/escuro, nomes acessíveis, títulos, IDs e overrides.
- [ ] Para cada responsabilidade, registrar quem a implementa hoje, o recurso equivalente do primitivo, diferenças observáveis e dependências dos consumidores. Distinguir duplicação, adaptação de dados e regra própria do app.
- [ ] Verificar se a composição dos primitivos cobre os grupos sem repetir manualmente renderização, sobreposição ou contagem. Considerar ordenação, lista vazia, um item, vários itens, limite atingido e identidade dos itens.
- [ ] Explicar o custo de manter a camada atual e o custo real de simplificá-la. Uma função pequena que evita repetição nos consumidores pode continuar justificada.
- [ ] Apresentar alternativas concretas: manter, reduzir responsabilidades ou substituir por composição direta. Mostrar quais consumidores precisariam mudar e quais comportamentos exigiriam prova antes de migrar.
- [ ] Entregar uma recomendação fundamentada por componente, com referências ao código vigente e exemplos curtos que ilustrem as diferenças. Registrar o que foi inspecionado e o que foi observado no navegador.

## Entrega e aceite

Parecer no diretório de auditorias contendo matriz comparativa, inventário dos consumidores relevantes, responsabilidades redundantes e necessárias, recomendação e eventuais dúvidas para o proprietário. Atualizar o ticket e o relatório central com o resultado do estudo.

A entrega deste ticket é o estudo. Refatoração, remoção de wrappers, alteração de tamanhos aprovados ou migração de consumidores dependem de decisão posterior do proprietário. Não criar uma implementação alternativa nem modificar a galeria para produzir a comparação. Verificações devem ser proporcionais à investigação e focadas em divergências concretas.

Criado em 04/11/2026 a pedido do proprietário.
