# 00: Alinhar a interface ao mockup aprovado

**What to build:** Fazer a página de Planejamento apresentar os controles e a organização da alternativa Mesa de planejamento mostrada e escolhida na conversa. A pessoa deve reconhecer o desenho aprovado e experimentar sua configuração visual antes de conectar a geração real.

**Blocked by:** None (can start immediately, quando a execução deste ticket for autorizada).

**Status:** pending-owner-validation

## Motivo e referência

O proprietário identificou que a estrutura inicial no app trocou controles importantes por campos genéricos e omitiu o direcionamento. Este ticket realizou o alinhamento visual à Mesa aprovada.

Referências: [mockup e fonte visual](../../../docs/plans/social-planning-mockup.md), alternativa **Mesa de planejamento**, e [decisões vigentes](../../../docs/plans/social-planning-design-decisions.md). A referência determina a composição e os controles; a implementação usa componentes reais do aplicativo.

## Base existente a preservar

- Página interna com Header e AppBar existentes; configuração à esquerda e prévia à direita, com rolagens independentes e reserva final da AppBar.
- Apresentação limpa: sem cartões, fundos de painel, molduras arredondadas ou gutters externos entre colunas; apenas divisórias estruturais e padding interno dos controles.
- Busca global, menu comum e botão no parceiro já levam ao Planejamento; seleção de parceiro autorizada e URL já funcionam. Não reconstruir esses acessos nem alterar o cabeçalho do portal.
- Desktop/telas amplas, sem empilhamento ou nova versão mobile. Manter o aviso existente abaixo do limite provisório.

## Acceptance criteria

- [x] A coluna de configuração oferece a escolha **Por período / Por tema**, com os controles próprios de cada modo; não substituir essa divisão por um formulário único de campos genéricos.
- [x] **Por período** apresenta início/fim, um **slider Conteúdos por semana com valor visível** e, logo abaixo, a **seleção dos dias da semana**. Não usar um input textual “Selecione a frequência” como substituto do slider/dias.
- [x] **Por tema** apresenta quantidade de conteúdos e campo de tema/direcionamento, em vez de exigir o mesmo conjunto de datas e frequência do modo por período.
- [x] **Direcionamento** aparece explicitamente no modo por período como campo de texto multilinha opcional. No modo por tema, o pedido tem espaço equivalente para descrever o que se quer abordar. Campos genéricos “Tema ou campanha” e “Observações” não substituem silenciosamente essa finalidade.
- [x] Mantém a configuração visual de formatos: opção de distribuição automática e quantidades de reels, estáticos e carrosséis quando a distribuição manual for escolhida. Considerar datas comemorativas continua como opção explícita relacionada ao período; não iniciar consulta ou geração.
- [x] Controles podem alternar e atualizar valores somente em estado local de demonstração para avaliar a interface. Mudança de modo preserva seus valores durante a montagem. Não gravar preferências, calcular slots reais, consultar datas, chamar IA ou criar sugestões/ações. Gerar continua desativado.
- [x] Referência ao Contexto/Tom já existentes é discreta, na superfície normal da página, sem recriar um painel com fundo próprio. Não acrescentar chat, upload ou novo cadastro da base.
- [x] Usar controles Prism e padrões reais do app para seleção, campos, slider e dias. Conferir os componentes disponíveis; se faltar slider genérico, incorporar o mínimo necessário ao Prism com React Aria, exportação e exemplo na galeria. Não usar o slider de cor como substituto inadequado, adicionar kit externo inteiro ou transplantar HTML/CSS do mockup.
- [x] A coluna direita permanece como espaço da futura prévia; este ticket não cria calendário próprio nem simula uma proposta gerada. A integração do calendário real pertence ao ticket06, preservando controles e rolagens existentes.
- [x] Aparência é validada pelo proprietário comparando a página com a alternativa Mesa de planejamento, em tela ampla: modo período, slider/dias, modo tema, direcionamento, formatos, rolagens e AppBar. Formatar alterações e verificar tipagem se novos componentes/props exigirem; sem suite ou build por rotina.

## Limites e passagem para o ticket01

Este recorte fecha a **interface**, não as políticas operacionais de frequência, semanas incompletas, limites numéricos ou formato da resposta da IA. Valores de exemplo e interações locais não aprovam regras de produto ainda pendentes nos demais tickets. Não é necessário resolver essas regras para apresentar os controles visuais solicitados.

**Fronteira:** ajustar a interface da configuração e validar sua fidelidade ao mockup. Depois, o ticket01 conecta geração/persistência aos controles aprovados, sem redesenhar a página. O ticket03 implementa frequência/datas; o04 conecta a distribuição de formatos. Entregar uma passagem curta ao próximo agente distinguindo estado visual de comportamento real.
