# Minha Conta — rolagem de Preferências

Em28/10/2026, o proprietário autorizou implementar somente o [ticket01](../../.scratch/account-preferences/issues/01-independent-preferences-scroll.md). Ticket02 de visualização inicial de Hoje permanece adiado.

## Resultado

- `ProfilePage` mede a altura útil e contém a rolagem em duas regiões acessíveis. Em desktop, informações pessoais ficam estáveis, com rolagem própria apenas quando necessário; Preferências rola separadamente.
- Rodapé de Salvar Alterações permanece fora da rolagem, na coluna direita, com reserva de98px para a AppBar. O mesmo formulário contém todos os campos, incluindo inputs ocultos. Preview de tema/paleta, upload e sequência de salvamento existentes preservados.
- Abaixo de `lg`, seletor Prism alterna Informações pessoais/Preferências. Ambas continuam montadas para preservar valores; o rodapé atende as duas. Validação nativa revela a seção pessoal sincronamente antes do foco de um campo inválido. Botão fica desabilitado durante envio; handler também verifica envio em andamento.
- `useFillScrollViewport` foi extraído da página Hoje para hook compartilhado, sem mudança de lógica; a página Hoje passa a importá-lo. Não há novo componente de design system, rota, preferência, model ou contrato de banco.
- Cada região rolável termina com `AppBarSpacer`, e o espaçador externo anterior foi removido. Mudanças prévias em TODO, CURRENT e ticket de IA preservadas.

## Evidências e verificação

Reprodução antes da correção no navegador real, com HTTP controlado: janela1440×900, contêiner externo com836px de altura e1062px de conteúdo; botão terminava em996px e não existia região própria de Preferências. A asserção de região independente falhou.

Após a correção, `scripts/check-profile-scroll-browser.cjs` usa a rota, SDK e componentes reais com sessão fictícia e HTTP interceptado. WebSockets são fechados e requisições externas não previstas abortadas; nenhuma chamada de banco real é encaminhada. Escritas simuladas confirmam contratos de interface, sem certificar PostgreSQL/autorização remota.

- Em1440×900, Preferências mede596px com877px de conteúdo; botão termina em802px. Roda do mouse move somente a região; título, coluna pessoal e botão mantêm posição. Tema personalizado expande o conteúdo para1392px sem rolagem externa.
- Resize para1024×600,390×700,390×480 e720×450 preserva ausência de overflow externo/horizontal e botão98px acima do fim da janela. O último tamanho cobre uma área CSS equivalente à janela1440×900 com zoom200%, mas não certifica zoom físico do navegador.
- Tab do último controle chega a Salvar; Shift+Tab retorna às preferências. Campos ocultos pela seção compacta são revelados e recebem foco na validação; formulário inválido não envia.
- Alteração de nome e layout, envio pendente/desabilitado, falha de preferências, rascunho preservado, nova tentativa, campo desconhecido preservado e submissão por Enter verificados. Cada envio válido fez exatamente uma escrita simulada de perfil e uma de preferências.
- Temas claro/escuro, tema personalizado e resize conferidos; capturas desktop inicial, desktop personalizado e mobile escuro inspecionadas.
- `bun test`:492 testes,1757 assertions,43 arquivos, zero falhas. Inclui os testes existentes da rota Hoje e persistência.
- `bun run format`, `bun run lint`, `bun run typecheck`, `bun run build` e `git diff --check` passaram. Build mantém aviso conhecido de chunks maiores que500kB.

## Limites e estado

Sem teste físico de celular/teclado virtual, zoom real200%, upload real ou sessão autenticada de produção. Em janela720×450 com descrição e seletor visíveis, Preferências tem54px úteis; continua rolável e botão acessível, mas a avaliação de conforto nessa altura cabe ao proprietário.

Perfil e preferências continuam duas escritas sequenciais: falha da segunda pode ocorrer depois de salvar o perfil; atomicidade não foi ampliada. Sem SQL preparado/aplicado, banco real, commit, push ou deploy. Implementação local pronta para avaliação do proprietário.

## Revisão visual após feedback do proprietário

O proprietário rejeitou a primeira composição: o rodapé incluía98px de reserva da AppBar e formava uma faixa grande, com separação ruim da área rolável. Esta revisão substitui a avaliação visual e as medidas de layout anteriores; o comportamento de salvamento continua o mesmo.

- Painel de Preferências com borda discreta, cantos arredondados e padding próprio; rodapé usa a mesma superfície e contorno, com divisória e12px de padding vertical. Botão mede40px no desktop e44px no celular.
- Reserva da AppBar movida para o padding interno da página, dentro da altura medida. Assim o rodapé é compacto e o painel inteiro termina acima da navegação. Uma posição de desktop mais baixa foi descartada na inspeção visual porque a AppBar cobria parte do painel, embora não cobrisse o botão.
- No celular, ambas as seções usam o mesmo contorno acima do rodapé compartilhado. Seletor reduzido para40px; descrição auxiliar oculta somente abaixo de `lg` em janelas de até600px de altura para preservar área útil.
- Teste real de navegador ampliado: antes da correção, falhou com “save footer must remain compact, measured159px”. Depois, mede66px no desktop e70px no celular e verifica interseção geométrica de todo o rodapé com a AppBar, além de ausência de overflow externo/horizontal. Não se limita a conferir visibilidade do botão.
- Repetidos1440×900,1024×600,390×700,390×480 e720×450, claro/escuro/customização, rolagem independente, posição estável de título/coluna/botão, Tab/Shift+Tab, revelação de campo inválido, submissão desabilitada, erro/retry, merge e Enter. HTTP controlado, sem encaminhar escritas reais.
- 14 testes pertinentes de Hoje e persistência passaram (64 assertions); format/lint/typecheck/build e diff passaram. Build mantém aviso conhecido de chunks. As492 verificações do registro anterior não foram repetidas integralmente para este ajuste visual; a regressão de navegador foi repetida e as capturas substituídas/inspecionadas.

Sem commit, publicação, banco/SQL ou implementação do ticket02. Aguardando avaliação visual do proprietário; os limites de teclado virtual e zoom físico permanecem.

## Botão no cabeçalho e colunas até o fim da janela

Nova direção explícita do proprietário, após conferir a captura: estender ambas as colunas até o fim da janela, preservar a reserva da AppBar somente dentro das duas regiões, retirar a barra de salvar e substituir o texto auxiliar do cabeçalho pelo botão. Esta seção substitui as decisões de rodapé e reserva externa das versões anteriores.

`ProfilePage` agora tem apenas uma linha de conteúdo no formulário, sem padding inferior na página. O botão do cabeçalho usa `form="profile-form"`, preservando submit/validação do formulário completo, mesmo fora dele. As duas regiões terminam com `AppBarSpacer`; a AppBar permanece sobre o conteúdo, sem faixa reservada fora das colunas. O seletor de seção em telas pequenas mantém ambos os conjuntos de campos montados.

Regressão antes da alteração: teste de navegador falhou com “save must be next to Minha Conta”. Depois, o mesmo roteiro confere associação real do botão ao formulário, colunas até o fim da janela e reserva de98px dentro de cada região visível, sem rolagem externa/horizontal. Conferidos1440×900,1024×600,390×700/480 e720×450, claro/escuro/customização, posição estável do título/botão ao rolar, navegação de teclado, revelação de campo inválido, envio desabilitado, erro/retry, merge e Enter. Capturas atualizadas e inspecionadas.14 testes pertinentes/64 assertions, format/lint/typecheck/build e diff passaram; aviso conhecido de chunks permanece.

### Onde existe salvamento automático

Inspeção solicitada pelo proprietário, sem mudar o contrato:

- `HeaderMenu` persiste automaticamente tema claro/escuro/sistema, paleta e usar cores do parceiro por `usePreferencePersistence`.
- `GlobalSearchCommand` persiste automaticamente os comandos de tema pelo mesmo controlador, mantido montado depois de fechar a busca.
- O controlador agrupa alterações por250ms e serializa escritas de patches na RPC autorizada. Em erro, mantém escolhas e oferece retry explícito.
- Minha Conta usa rascunho dos campos e só envia `updateOwnProfile`/`updateMyPreferences` em submit. Há uma assimetria preexistente: seu seletor de tema usa `setTheme`, que grava em localStorage imediatamente; preview de paleta/customização também pode alterar a aparência, mas não confirma preferências na conta. Portanto, aparência/localStorage não comprovam salvamento no banco.

Nenhum autosave foi adicionado, removido ou unificado nesta rodada. Sem banco real, SQL, commit ou publicação. Ticket02 permanece adiado.


## Colunas sem cartão e corte no cabeçalho

Pedido posterior do proprietário: remover borda, arredondamento e fundo de Preferências, e fazer a divisória de Minha Conta coincidir com o limite visível da rolagem. Removidos decoração das regiões e padding superior externo do formulário; espaçamento inicial dos campos permanece dentro das regiões, de modo que rola junto com o conteúdo. No celular, o seletor mantém seu espaço interno, sem margem externa adicional. Botão no cabeçalho e espaçadores de98px dentro de ambas as colunas preservados.

Teste real ampliado com comparação entre o topo da região e o fim do cabeçalho: falhou antes por16px de distância e passou após ajuste com gap zero no desktop, inclusive ao redimensionar. Roteiro controlado repetiu temas, cinco tamanhos, colunas até o fim, espaçadores, rolagem, teclado, validação e salvamento/falha/retry. Capturas atualizadas e inspecionadas; format/lint/typecheck/build e diff passaram, aviso de chunks preservado. Sem nova suíte completa para este ajuste visual.

### Autosave na edição de parceiros

O proprietário recordava corretamente outro autosave. A rota administrativa `/app/admin/partner/$slug` usa `triggerAutoSave` para parceiros existentes. Nome, nome curto e assinatura do Instagram acionam ao sair do campo; Contexto e Tom de Voz acionam no blur do editor. Imagem, usuários vinculados, cores, escopo e arquivamento acionam ao alterar. A mesma tela oferece Salvar Tudo. Não foi encontrado um interruptor global de autosave nessa implementação; o comportamento é próprio dessa tela. `isNew` impede o autosave durante criação de parceiro novo. Evidência de leitura do código, sem gravação real ou alteração desse fluxo.


## Aceite

Proprietário aprovou a versão final e autorizou commit local em28/10/2026, seguido de implementação do ticket02. Nenhum push ou deploy solicitado.

Capturas temporárias dessa verificação removidas em29/10/2026 a pedido do proprietário; o resultado e os limites acima permanecem registrados. Roteiros de navegador agora salvam novas capturas no diretório temporário do sistema, fora do checkout.
