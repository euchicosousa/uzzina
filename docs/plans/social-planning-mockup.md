# Planejamento — mockup para decisão

Preparado em 01/11/2026 a pedido do proprietário para entender o fluxo antes de aprovar. Fonte de escopo: [proposta dos tickets](social-planning-ticket-breakdown.md). **Decisão posterior: Mesa de planejamento escolhida, exclusiva para telas amplas, sem adaptação mobile nesta versão.** Contrato vigente em [decisões de interface e escopo](social-planning-design-decisions.md). A aprovação da composição não representa aprovação automática das demais regras propostas.

## O que comparar

- **Etapas:** configuração central, revisão em lista/calendário e confirmação final em telas sucessivas. Menos informação simultânea.
- **Mesa de planejamento:** configuração lateral e proposta ao lado; lista/calendário e editor na mesma área de trabalho. Mais contexto simultâneo, menos largura para o calendário.

O proprietário escolheu a Mesa de planejamento. Etapas fica somente como referência histórica do estudo; não será um modo alternativo do produto. A adaptação a360px descrita na conferência abaixo pertencia ao protótipo exploratório e não integra mais o escopo do Planejamento.

Correção explícita posterior do proprietário: Planejamento é somente outra página dentro do layout do app, com o mesmo cabeçalho global. A barra superior ilustrativa deste mockup não será implementada. O calendário será o mesmo do aplicativo, incluindo controles/ajustes laterais e rolagens vertical e horizontal; a grade HTML simplificada desta demonstração não será reproduzida. A escolha da segunda alternativa aprova a composição criação/visualização lado a lado, não um app separado nem um calendário novo.

Correção de fidelidade solicitada depois: a estrutura do app não reproduziu controles da configuração escolhida. Preservar no produto Por período/Por tema, slider de conteúdos por semana, seleção de dias abaixo e campo Direcionamento. [Ticket00](../../.scratch/social-planning/issues/00-align-page-with-approved-mockup.md) preparado para outro agente realizar somente esse alinhamento visual antes de01; nenhuma alteração de interface nesta rodada.

Ambas usam seleção de parceiro, entradas simuladas pela busca/menu/página do parceiro, modo por período ou tema, formatos, comemorações extras, edição de sugestão, decisões, mudança de data e finalização apenas das aprovadas. Dados inteiramente fictícios. O exemplo inicial tem12 publicações regulares e1 extra de aniversário fictício da clínica; a opção está ligada na demonstração para mostrar o acréscimo, sem mudar a proposta de iniciar desligada no produto.

O protótipo serve para avaliar organização e percurso. Não representa implementação dos componentes Prism, autorização, persistência em banco, IA ou criação real de ações. Não foi acrescentada rota ao app nem conectado o dev habitual de produção. Estado temporário da demonstração não é um planejamento salvo na UZZINA.

## Fonte visual

Fragmento interativo no diretório desta conversa:

`/Users/euchicosousa/.codex/visualizations/2026/10/27/01a17e66-14a8-7c31-8b13-4de2847f80f7/planejamento-uzzina.html`

A apresentação é inline na conversa; não há site publicado. Código descartável, não promover diretamente para o app. Decisão do proprietário sobre uma alternativa, combinação ou mudanças deve voltar aos tickets antes da implementação.

## Conferência e limites

JavaScript conferido; fragmento renderizado pelo wrapper de visualizações e inspecionado em Chromium isolado. Exercitados geração fictícia de13 itens, aprovação, edição/salvamento do título, calendário e finalização de uma aprovada; nenhuma exceção JavaScript. Verificados seleção sem parceiro e modo tema com cinco sugestões para outro parceiro fictício. Configuração e mesa sem overflow horizontal em360px; capturas desktop/mobile inspecionadas. Conferência limitada ao mockup, sem suite do app, build do produto, banco/provedor, Safari físico, SQL, commit ou deploy.

Organização escolhida: Mesa de planejamento. Permanecem para detalhamento: largura mínima efetiva, editor inline versus outra apresentação, legibilidade do calendário e clareza da confirmação, utilizando componentes reais do app. Regras propostas no documento de tickets continuam propostas; em especial pendentes, horário e limites não recebem aprovação implícita por existirem no mockup. Contratos reais de IA evoluíram desde a proposta inicial; devem ser reconferidos antes de implementar Planejamento.
