# Avaliação de teclado e foco da gaveta

Escopo autorizado: avaliar o foco inicial e o percurso de Tab na gaveta de ação. Sem alteração funcional, push ou deploy.

## Evidência no aplicativo publicado

Conferência em `uzzina.cnvt.com.br`, no Comet/macOS, em14/10/2026, com uma ação existente na aba Essencial. Nenhum conteúdo digitado ou comando de alteração acionado.

- Com foco colocado no título, Tab percorreu responsáveis → ID → data → criar estratégia → adicionar arquivo → Título1. Outras paradas observadas foram Título2, Título3, Negrito, Itálico, Tachado e Lista com Marcadores.
- A leitura de acessibilidade confirmou o controle focado em cada parada. As capturas de responsáveis e Título1 não apresentaram destaque perceptível; a data apresentou contorno discreto.
- Partindo da descrição, Tab chegou ao seletor de parceiro do rodapé, com indicação visual pouco perceptível.
- O foco inicial não foi certificado. A reabertura usou duplo clique, cujo segundo clique pode atingir a descrição depois que a gaveta abre. Interações simultâneas do usuário interromperam a conferência adicional. Não atribuir esse resultado a uma disputa de autofocus.

## Conferência da implementação

- `EssentialsTab.tsx` monta `ActionTitleInput` com `autoFocus` e `tabIndex={0}`. A intenção atual é iniciar no título; falta confirmar a abertura com um único evento, sem clique posterior.
- O título usa `outline-none`, sem indicador substituto. `.tiptap.ProseMirror` também remove o outline em `app/tailwind.css`.
- `RichTextEditor.tsx` monta13 comandos de formatação antes da descrição; Desfazer/Refazer acrescentam paradas quando habilitados. Os botões removem outline e não possuem estilo de foco substituto.
- `ComboboxTrigger.tsx` remove outline na base. As variantes de rodapé e inline grande usam apenas `focus:bg-secondary/50`; a variante link e a inline pequena não acrescentam sinalização de foco.
- A variante `unstyled` de PrismButton usada por Adicionar arquivo elimina o ring de foco.
- Os `tabIndex={0}` encontrados mantêm a ordem natural. Não foi encontrado índice positivo nesses campos da gaveta. A data participa do percurso observado por meio de React Aria Pressable.

## Encaminhamento

Prioridade: tornar o foco visível e consistente no título, editor, comandos de formatação e seletores. Preservar o título como foco inicial e verificar a abertura isoladamente. Para encurtar o percurso, considerar uma barra de formatação navegável por setas, com uma única entrada por Tab e todos os comandos acessíveis pelo teclado. Não compensar o problema com índices positivos.

Avaliação concluída; implementação não faz parte desta rodada. Sem testes, lint ou build, pois só foram escritos documentos. Conferência visual restrita ao tema claro/desktop observado; sem validação de mobile, tema escuro, banco ou todos os seletores abertos. Conferir referências e diff antes do encerramento.

## Segunda análise: padrão existente e implementação proposta

Solicitação complementar: manter entrada no título, inventariar sinalização de foco para decisão do proprietário e analisar o percurso formatação → descrição → Parceiros. Nenhuma implementação autorizada nesta etapa de análise.

### Inventário dos controles da gaveta

| Controle | Estado na implementação atual |
|---|---|
| Título | Outline removido, sem sinalização substituta. |
| Responsáveis | ComboboxTrigger form-link remove outline e não define estilo de foco. |
| ID, criar/ver estratégias, atualizar, duplicar, arquivar/desarquivar | PrismButton fornece border-ring e ring de3px. Conferir clipping no navegador. |
| Data | Pressable sobre div sem estilo próprio de foco; contorno discreto observado na primeira rodada. |
| Adicionar arquivo, quando não há anexos | PrismButton unstyled zera o ring. Com anexos, usa secondary, que fornece ring. |
| Anexos existentes | Link sem estilo próprio; remoção fica hidden até group-hover, sem alternativa de teclado. |
| Formatação, Desfazer/Refazer e menu flutuante do editor | Outline removido, sem sinalização substituta. |
| Descrição e conteúdo do Instagram | ProseMirror remove outline, sem sinalização substituta. |
| Parceiros, fase, categoria, cor | Apenas fundo de foco discreto nas variantes usadas; sem ring padrão. |
| Sprint | Fundo discreto e aumento de opacidade, sem ring padrão. |
| Abas Essencial/Instagram/Observações, subabas Conteúdo/Legenda e Fechar | Botões nativos sem estilo de foco Prism. Estado selecionado não substitui indicador de foco. |
| Legenda do Instagram | Textarea nativa com outline-none, sem sinalização substituta. |
| Observação nova/edição | CommentInput usa PrismTextarea, mas classes locais zeram ring, outline e borda de foco. |
| Audiência da observação, notificar, enviar/salvar/cancelar | PrismButton fornece ring padrão. |
| Preview de carrossel | Setas e pontos são botões nativos sem estilo de foco Prism. |
| Busca dentro dos seletores | CommandInput usa outline-hidden e data-slot=command-input; InputGroup espera input-group-control para aplicar ring. O seletor de foco do grupo não alcança esse input. |
| Opções dos seletores | PrismCommandItem define data-focused:bg-secondary/50 e text-foreground; há indicação de foco, embora semelhante à de seleção. |
| Calendário e horário no popover de data | Calendário define ring na célula focada; horário define ring no grupo e fundo/texto no segmento. |
| Cores no popover | ToggleGroupItem, ColorArea, ColorSlider e ColorField possuem indicadores próprios de foco. |

O padrão reutilizável está em PrismButton, PrismInput, PrismTextarea e PrismToggle: border-ring com ring-ring/30 de3px. Os valores de cor acompanham temas/paletas existentes. O inventário inclui campos das três abas e os popovers diretamente relacionados; não certifica widgets externos do Cloudinary, diálogos de gerenciamento de mídia ou contraste/renderização em todos os estados.

### Navegação proposta

1. Preservar autofocus no título ao abrir a gaveta. Não executar refoco em cada alteração/salvamento; verificar montagem inicial, ação existente e rascunho.
2. Transformar a barra de formatação em toolbar nomeada, com uma única parada de Tab: um botão habilitado com tabIndex0, demais com -1. Setas esquerda/direita movem foco; Home/End levam aos extremos; Enter/Espaço executam o comando. Lembrar o último botão visitado e lidar com Desfazer/Refazer quando ficam desabilitados.
3. Deixar Tab sair naturalmente da toolbar para o editor, sem índices positivos. Shift+Tab da descrição retorna à toolbar. Comandos de formato mantêm os handlers atuais que devolvem foco ao texto após execução.
4. Garantir que menus flutuantes não introduzam paradas entre a toolbar principal, o texto e o rodapé. Sua navegação/atalho precisa ser definida e testada; não torná-los inacessíveis removendo simplesmente todos os tabIndex.
5. Da descrição, Tab deve chegar a Parceiros. Hoje esse já é o próximo controle na ordem de renderização, mas os atalhos de Table e ListItem interceptam Tab/Shift+Tab em tabelas/listas. A descrição da gaveta precisa liberar esses atalhos para navegação; preservar edição de tabelas/listas por comandos existentes. Conferir o caminho inverso também.
6. Encapsular a política de saída por Tab como opção do editor, aplicada à descrição Essencial. RichTextEditor também atende Instagram e administração de parceiro; não alterar automaticamente a política de todos os consumidores.

O padrão de uma parada por Tab e setas dentro da barra é documentado no [W3C APG Toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/). A implementação pode ficar no editor existente; nenhum novo primitivo é necessário apenas para este fluxo.

### Verificação necessária quando houver implementação

- Testes nos componentes reais: autofocus, uma parada na toolbar, setas/Home/End, comandos e retorno ao texto, Tab/Shift+Tab, botões habilitados/desabilitados e menu flutuante visível.
- Descrição vazia, texto, lista e tabela: Tab para Parceiros sem recuar lista, trocar célula ou criar linha; caminho inverso sem mutação.
- Verificação visual no navegador: indicadores em tema claro/escuro, rodapé com overflow, toolbar quebrada em linhas e campos das outras abas. Conferir que foco e seleção permanecem distintos.
- Se houver alteração funcional: testes pertinentes, format, lint, typecheck e build. Nesta segunda análise, apenas referências/diff de documentação conferidos; sem alterações funcionais nem testes de comportamento adicionais.

Decisão pendente do proprietário: tratamento visual dos campos sem indicador ou com apenas indicação discreta/nativa. Recomendação: reaproveitar os tokens de foco Prism, escolhendo entre contorno do controle e destaque do bloco para áreas grandes de texto.

## Plano revisado pelo proprietário

Esta seção substitui o percurso proposto na segunda análise. Escopo desta rodada: revisão do plano e estudo de React Aria, sem implementação.

### Percurso principal na aba Essencial

Título → Descrição → Parceiros → Fase (status) → Categoria (tipo) → Cor, quando disponível → Criar/Atualizar.

Os números1/2 mencionados pelo proprietário são posições lógicas do percurso, não valores positivos de tabIndex. Manter a ordem dos elementos no DOM e tabIndex0 nos controles principais. Shift+Tab percorre o caminho inverso. Elementos ausentes ou desabilitados são ignorados.

Responsáveis, ID, data, estratégia, anexos, formatação, sprint, duplicar e arquivar não entram no percurso principal. Continuam operáveis e precisam de sinalização de foco quando acessados. A formatação deixa de ser uma parada entre título e descrição; quando acessada por atalho, permite setas entre comandos e Tab de volta à descrição. O acesso por teclado aos controles auxiliares deve permanecer disponível e verificável; não resolver a exclusão com tabIndex-1 generalizado sem oferecer acesso alternativo. Abas e Fechar também não devem ser inseridos entre os passos principais; o comportamento nas extremidades e o acesso auxiliar precisam ser verificados sem impor um ciclo novo por suposição.

### Direção visual confirmada

- Data: foco sublinhado como hover/Adicionar arquivo, substituindo o contorno nativo desse gatilho. O calendário e horário dentro do popover mantêm seus indicadores e teclado próprios.
- ID e estratégia: preservar indicadores Prism existentes.
- Título e responsáveis: ausência de indicador reconhecida; aparência nova ainda não definida pelo proprietário.
- Os demais campos e botões continuam no inventário acima, mesmo quando ficam fora do percurso principal. Não aplicar uma aparência nova aos campos pendentes por suposição.

### React Aria: conclusão do estudo

Fontes oficiais: [FocusScope/useFocusManager](https://react-aria.adobe.com/FocusScope), [useFocusRing](https://react-aria.adobe.com/useFocusRing), [Toolbar](https://react-aria.adobe.com/Toolbar). As declarações instaladas de react-aria3.50.0 confirmam focusNext/focusPrevious com filtro accept, seleção de elementos tabbable e opção wrap. React Aria Components1.19.0 já exporta Toolbar.

Recomendação: FocusScope e useFocusManager para a navegação local da gaveta; useFocusRing/estados React Aria para a sinalização dos controles próprios quando a aparência for definida. O componente Tabs corresponde à seleção de abas e não controla o percurso da tecla Tab. A biblioteca oferece infraestrutura, mas a lista de campos principais é uma regra da UZZINA e precisa ser declarada pela aplicação.

Implementação prevista:

1. Delimitar o escopo da gaveta e marcar seus destinos principais. Manter o autofocus específico no título; não usar o autofocus genérico de FocusScope para focar o primeiro botão do cabeçalho.
2. No componente interno ao scope, capturar Tab/Shift+Tab localmente e chamar focusNext/focusPrevious com accept dos destinos principais. Captura ocorre antes dos handlers do editor para impedir Tab de recuar listas, trocar células ou criar linhas. Evitar listener global no document.
3. Só tratar eventos do conteúdo principal da aba Essencial. Conferir o alvo DOM real: eventos de portais podem subir pela árvore React. Popovers, calendário, cor, seletores, diálogos e widget externo mantêm seu próprio Tab; não basta verificar que o evento chegou ao handler da gaveta. Conferir também overlays que devolvem foco ao gatilho ao fechar.
4. Não ligar contain/wrap automaticamente: contenção e ciclo são decisões separadas do filtro de campos e precisam respeitar os overlays existentes. Testar limites de Tab e Shift+Tab, abertura/fechamento e retorno ao cartão que abriu a gaveta.
5. Usar Toolbar do React Aria para os comandos de formato, preservando handlers do editor e oferecendo acesso por atalho. Registrar o atalho escolhido e sua descoberta antes de retirar a toolbar do percurso comum.
6. Se houver import direto de react-aria, declarar a dependência direta na implementação em vez de depender apenas da instalação transitiva via react-aria-components. Nenhuma dependência foi adicionada nesta análise.

Essa base pode servir a outros fluxos depois de validada na gaveta. Não há autorização para migrar o teclado de todo o sistema nesta rodada.

Critérios de aceitação adicionais: título → descrição sem paradas auxiliares; cor → Criar/Atualizar sem sprint/duplicar/arquivar; fluxo inverso; ação com e sem cor; descrição com lista/tabela sem mutação por Tab; calendário/horário e seletores com Tab interno preservado; controles auxiliares acessíveis e com indicador; foco inicial e retorno ao fechar; renderização clara/escura e mobile.

Verificação desta revisão: código local, tipos da versão instalada e documentação oficial; referências/diff conferidos. Sem novo ensaio de navegador, alterações funcionais, testes/build ou publicação.

## Ticket01: implementação local

Autorização do proprietário: iniciar o ticket01. Divisão de tickets publicada localmente; toolbar e estabilização futura continuam separadas.

- ActionDrawerFocusScope usa React Aria FocusScope/useFocusManager, filtro dos destinos e captura local. React Aria3.50.0 foi declarado como dependência direta, usando a versão já instalada.
- Título mantém autofocus. Percurso principal e inverso usam a ordem do DOM, com destinos Título/Descrição/Parceiros/Fase/Categoria/Cor/Criar ou Atualizar. Não há índice positivo nem ciclo novo nos limites.
- Alt+F10 alterna entre percurso principal e todos os controles. A gaveta mostra o modo e o atalho; controles auxiliares continuam acessíveis pelo teclado. Mesmo no modo completo, Tab sai de listas/tabelas em vez de editar estrutura.
- Eventos cujo alvo pertence a portais/popovers/diálogos não são capturados. Outras abas conservam sua navegação. Ao desmontar a gaveta, FocusScope restaura o foco anterior.
- Gatilho da data troca o contorno nativo pelo sublinhado de foco. Aparências pendentes não foram alteradas. Toolbar existente permanece para o ticket02.

Verificação:363 testes/1060 assertions, format/lint/typecheck/build e7 PASS serverless. Os13 novos casos usam a gaveta e o editor reais; a fronteira externa de banco é controlada. Casos adicionais verificam que Escape do calendário e do popover não fecha a gaveta. Regressão de Tab foi observada antes de implementar o filtro.

Conferência visual local bloqueada pela revisão automática do navegador: falha por limite de uso, não por avaliação de insegurança. Servidor/arquivos temporários removidos. Temas claro/escuro, mobile/desktop e overflow ainda precisam de conferência visual; não substituir essa evidência por jsdom. Nenhum push/deploy, SQL ou dado remoto alterado. Ticket01 permanece em andamento por essa pendência.

## Publicação autorizada

O proprietário autorizou publicar após as verificações e realizará o teste visual nos dados reais. Commit de código `ac170df7bfcc983317dd639c42367d380cf37621` enviado para main. A listagem da Vercel vinculou esse SHA ao deploy `uzzina-ksgeq4d1k-agenciacnvt.vercel.app`; inspect confirmou `dpl_AefHT1xWqjpNhCM9QDU26J6TKwBC`, ambiente production e readyState READY. Alias `uzzina.cnvt.com.br` confirmado; /app respondeu HTTP200. Não houve SQL ou escrita de dados reais neste processo.

363 testes/1060 assertions, format/lint/typecheck/build e7 verificações serverless passaram antes da publicação. O teste visual/autenticado permanece com o proprietário; resposta HTTP e estado Ready não substituem essa verificação. Ticket02 não foi implementado.
