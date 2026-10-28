# 01: Rolar Preferências independentemente e manter Salvar Alterações no rodapé

**What to build:** Em Minha Conta, manter o cabeçalho e as informações pessoais estáveis enquanto somente o conteúdo de Preferências rola no painel direito. A área Salvar Alterações permanece visível no rodapé desse painel e continua salvando perfil e preferências pelo formulário existente.

**Blocked by:** None (can start immediately). Não depende do ticket02.

**Status:** completed locally — approved by owner; local commit authorized; no deployment requested

## Direção vigente após revisão do proprietário

Substitui o requisito original de rodapé fixo: Salvar Alterações fica no cabeçalho, no lugar do texto auxiliar. Remover barra de salvamento e reserva externa; as duas colunas vão até o fim e cada região mantém seu próprio `AppBarSpacer`. O botão salva o formulário completo; não foi autorizada conversão para autosave. Menu de perfil e comandos de tema da busca já têm autosave; Minha Conta continua com confirmação manual. Critérios originais abaixo são históricos quando conflitarem com esta revisão. Ver resultado atualizado no relatório.

## Resultado em28/10/2026

Implementação autorizada pelo proprietário nesta conversa. Conta com altura contida, regiões independentes e botão de salvar no cabeçalho; seletor de seção abaixo de `lg` preserva campos montados. Validação nativa revela seção pessoal antes de focar campo inválido. Medição existente de Hoje reutilizada via hook compartilhado, sem mudança de lógica. Ver [relatório](../../../docs/audits/2026-10-28-profile-preferences-scroll.md) para evidências, verificações e limites; ticket02 permanece adiado. Os critérios abaixo são a especificação original; verificação física de teclado virtual/zoom permanece não executada.

## Contexto e evidências

Pedido do proprietário em28/10/2026, com referência à captura do painel de Preferências na conversa “Criar dois tickets”. A imagem não está disponível neste checkout/contexto para inspeção visual; o diagnóstico abaixo é baseado no código atual, sem reprodução autenticada.

A rota `/app/profile` monta `ProfilePage` com cabeçalho, um único formulário e grade de duas colunas a partir de `lg`. A coluna direita contém tema, paleta, tema personalizado condicional, cores dos clientes, Layout Padrão e sidebar do Instagram. As duas colunas têm altura natural; a linha do botão fica depois da grade, seguida por `AppBarSpacer`. O layout `/app` fornece um ancestral com rolagem vertical, explicando por que o conteúdo da conta cresce como página inteira.

O formulário atual reúne informações pessoais e preferências: `handleSubmit` chama `updateOwnProfile`, depois `updateMyPreferences`, confere a geração de sessão e apresenta toast. `isSubmitting` desabilita o botão e troca o texto para Salvando...; os previews de tema/paleta e o upload já têm comportamento próprio. A AppBar é flutuante e tem reserva definida por `--app-bar-space`.

## Critérios de aceite

- [ ] Em desktop, a rota ocupa a altura útil abaixo do cabeçalho do app sem aumentar a rolagem da página. Rolar Preferências não desloca o título Minha Conta nem a coluna de informações pessoais; todo o conteúdo da coluna direita permanece alcançável.
- [ ] Preferências tem corpo rolável e rodapé estável dentro do próprio painel. Salvar Alterações permanece visível, acima da AppBar, sem sobrepor campos nem esconder o último controle. Evitar uma fixação relativa à janela que escape do painel.
- [ ] A altura acompanha resize e mudanças de conteúdo, incluindo abrir/fechar tema Personalizado, textos maiores e zoom. Não introduzir barra horizontal nem altura rígida baseada em uma única resolução.
- [ ] Abaixo de `lg` e em janelas baixas, adaptar a composição mantendo informações pessoais, preferências e salvamento acessíveis. A página externa continua contida; se a área de informações pessoais também precisar rolar para caber, ela deve ter região própria acessível, sem depender de campos cortados. Conferir pelo menos390px de largura,480/700px de altura e zoom200%.
- [ ] O rodapé continua submetendo o formulário completo, inclusive os campos pessoais e inputs ocultos. Enter e clique mantêm a semântica atual; durante o envio, mostrar Salvando..., impedir submissão duplicada e manter dimensões estáveis. Em falha, conservar valores para nova tentativa e exibir erro; em sucesso, manter confirmação existente. Não ampliar este ticket para tornar as duas escritas atuais transacionais.
- [ ] Tab/Shift+Tab alcançam todos os campos e o botão; foco revela o controle na região correta, sem ficar sob o rodapé. Preservar validação nativa, foco visível, teclado dos seletores/portais e funcionamento do upload. Não criar aprisionamento global de foco.
- [ ] Preservar temas claro/escuro/sistema, paletas, previews e guardas de sessão. O ajuste de rolagem fica restrito à conta; outras rotas e os dois modos de altura do Hoje mantêm seus contratos.
- [ ] Cobrir submissão e estados no componente real e conferir geometria/rolagem em navegador com HTTP controlado, desktop/mobile, temas e conteúdo curto/longo. Registrar evidência de ausência de rolagem externa, alcance do último campo e do botão, inclusive com teclado virtual quando disponível.

## Riscos e limites

- Aplicar somente `overflow-y-auto` sem limitar a cadeia de altura/flex pode manter a rolagem externa. Alterar o contêiner compartilhado de `/app` pode afetar Home, Hoje e gavetas; preferir contenção local.
- Mover o botão para fora do formulário pode perder submissão e validação. Há duas escritas sequenciais: erro de preferências pode ocorrer depois de salvar o perfil; preservar e documentar esse limite atual.
- A reserva externa atual da AppBar pode acrescentar overflow se mantida duplicada na nova altura contida. Em mobile, teclado virtual e coluna empilhada exigem validação própria para não esconder informações pessoais.

## Verificação prevista

Na implementação futura: testes pertinentes no código real, format/lint/typecheck/build, inspeção visual controlada e atualização de CURRENT. Neste registro foram conferidos código e referências; sem implementação, testes/build, banco, commit ou publicação. O proprietário autorizou apenas criar o ticket.
