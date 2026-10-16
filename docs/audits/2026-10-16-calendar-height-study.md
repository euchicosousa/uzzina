# Estudo de altura e rolagem dos calendários

Data: 16/10/2026. Escopo autorizado: levantamento e proposta; sem implementação, publicação ou alteração de preferências/banco.

## Direção solicitada

O padrão deve ser dinâmico, conforme os itens exibidos. Opcionalmente, o usuário poderá limitar a altura, com rolagem interna quando o conteúdo exceder o limite. A formulação final corresponde a **altura máxima**, não fixa: uma célula com poucos itens continua pequena.

## Estado encontrado no código

| Área | Regra atual | Consequência |
| --- | --- | --- |
| [Célula da equipe](../../app/components/features/CalendarDayCell.tsx) | Linha/Bloco usam `h-72` no compacto e `h-96` fora dele; com a escala atual, 288/384 px. `autoHeight` ou variante Conteúdo removem essas classes. | São alturas fixas, não mínimas. Linha ocupa o mesmo espaço reservado para cartões maiores. |
| [Opções de visualização](../../app/components/features/ViewOptions.tsx) | `autoHeight: false` por padrão. Controle “Altura automática” só aparece quando a tela permite e a variante não é Conteúdo. Estado inicializado por `useState`. | A altura dinâmica é exceção; Conteúdo força o comportamento automático e não oferece controle de altura. A escolha de altura não é persistida. |
| [Calendário da Home](../../app/components/features/home/HomeCalendarView.tsx) | Semana tem `max-h-[50vh]` e `overflow-hidden`; mês recebe `isCompact`. Menu só oferece ordenação. | O usuário não pode alternar altura nessa tela. O teto externo da semana deve ser revisto junto com as células. |
| [Calendário do parceiro](../../app/components/features/PartnerCalendarBoard.tsx) | Exibe o mês, mas não recebe `isCompact`. | Linha/Bloco usam 384 px por dia, mesmo sendo mês; não usam a regra de 288 px da Home mensal. |
| [Página do parceiro](../../app/routes/app/partner/$slug.tsx) | Usa `page-height`, que define altura pela janela, e vários ancestrais com `overflow-hidden`. | Alterar só a célula não garante acesso às semanas que excedam o painel. É necessário definir a rolagem vertical do painel. |
| [Grade compartilhada](../../app/components/features/Calendar.tsx) | Contêiner horizontal esconde excedente vertical; grade usa `h-full` e `overflow-y-auto`. | A rolagem depende da cadeia de alturas dos ancestrais. Há múltiplos candidatos a controlar o mesmo eixo. |
| [Lista de ações](../../app/components/features/ActionContainer.tsx) | Fora do compacto: `h-full overflow-y-auto` e máscaras de rolagem. No compacto: primeiros cinco itens e botão de expansão. | Compactação é também truncamento da lista. Remover altura fixa sem separar essas responsabilidades pode manter itens escondidos. |
| [Miolo da célula](../../app/components/features/CalendarDayCell.tsx) | Vários `h-full`/`overflow-hidden`; datas comemorativas ficam fora da lista. | Lista, cabeçalho e comemorações disputam a altura disponível. O modo Conteúdo ainda divide as ações em duas listas. |
| [Portal do cliente](../../app/components/client/ClientCalendar.tsx) | Implementação própria: preenche painel com `h-full`/`flex-1`, lista tem `min-h-30` (120 px); grade tem rolagem. | Não usa `ViewOptions`, nem os três modos Linha/Bloco/Conteúdo. Exige revisão separada; não acompanha automaticamente a mudança da equipe. |

A [preferência de visualização](../../app/lib/preferences.ts) define Linha/Bloco/Conteúdo. A página do parceiro a utiliza; a Home calendário inicializa Linha pelo padrão do hook, sem consultar essa preferência. Isso é uma diferença existente, não autorização para mudar a preferência nesta rodada.

## Proposta para revisão

1. **Automática (padrão):** altura natural das ações realmente renderizadas, sem piso de 288/384 px, sem truncamento de cinco itens e sem rolagem vertical na lista. A página ou painel permite chegar às semanas seguintes.
2. **Altura máxima (opcional):** a célula cresce naturalmente até um teto; apenas a lista de ações rola ao ultrapassá-lo. Cabeçalho do dia e comemorações permanecem acessíveis. O teto total precisa considerar essas duas áreas, sem deixar que listas internas somem limites independentes.
3. Aplicar a mesma política a Linha, Bloco e Conteúdo. Trocar a apresentação não deve alterar a política de altura escolhida. No modo Conteúdo, as duas listas devem compartilhar uma única área de rolagem por dia.
4. Manter alinhamento dos sete dias de cada semana. No modo automático, o dia mais alto determina a altura daquela semana; outras semanas podem ter alturas diferentes. Ainda haverá espaço vazio nos dias menos ocupados de uma semana cheia, consequência do alinhamento do calendário.
5. Menu proposto: grupo “Altura dos dias”, com “Automática” e “Altura máxima”. Não incluir um terceiro modo fixo neste primeiro escopo, pois a descrição final não exige reservar espaço constante.
6. Separar política de altura, apresentação dos cartões e compactação. `isCompact` não deve continuar decidindo simultaneamente tamanho da célula e quantidade de ações acessíveis.

O valor do teto permanece para decisão. 384 px é uma referência existente para comparação visual, não um valor aprovado. Recomenda-se começar com um único teto predefinido, sem criar campo numérico ou preferência global até existir necessidade confirmada.

O limite proposto é **por dia**, não do calendário inteiro. Essa é uma recomendação a validar com o proprietário. A rolagem vertical externa continua necessária para navegar entre semanas; a interna só existe quando um dia atinge o teto. Rolagem horizontal continua disponível em telas estreitas.

## Pontos de atenção para a implementação futura

- Na Home, remover ou compatibilizar o teto externo de 50vh com o modo automático.
- No parceiro, garantir uma área vertical de navegação até a última semana, preservando o feed lateral e seu funcionamento no celular.
- Definir alturas flexíveis com possibilidade real de encolhimento (`min-h-0` quando necessário), sem depender apenas de `overflow-y-auto`. Não remover indiscriminadamente os recortes usados para a rolagem horizontal.
- Ajustar o uso de `ActionContainer` pelo calendário sem mudar inadvertidamente Sprint, Atrasadas e popovers, que também usam o componente.
- No modo limitado, testar que o cabeçalho não encolhe e que a última ação, o botão de criação e as comemorações são alcançáveis.
- Revisar máscaras após mudança de quantidade de ações e carregamento de imagens: observar apenas o tamanho do contêiner pode não detectar alteração do conteúdo quando sua altura permanece limitada.
- Portal: considerar regra dinâmica própria, retirando seu piso de 120 px e o preenchimento obrigatório somente se esse alcance for confirmado. Não adicionar menu da equipe ao portal automaticamente.
- Preservar arraste entre dias, horário da ação, ordenação, seleção, indicadores e tratamento das ações de Instagram.

## Verificação exigida na próxima etapa

Reproduzir o defeito de rolagem no componente real antes da correção. Os [testes atuais do menu](../../tests/view-options.test.tsx) cobrem visibilidade e seleção, inclusive a ocultação da opção no modo Conteúdo; precisarão acompanhar o novo contrato. Não certificam geometria ou rolagem real.

No navegador, verificar Home semana/mês e parceiro, com e sem feed: dias vazios, um item, mais de cinco itens, dia muito cheio, comemorações, imagens e títulos longos; Linha/Bloco/Conteúdo; janela baixa e celular. Conferir altura automática, teto, última ação acessível, semanas finais, teclado e arraste com área rolada. Se o portal entrar no escopo, incluir semana/mês e feed mobile/desktop separadamente.

## Resultado e limites desta rodada

Checkout inicialmente limpo. Levantamento estático das implementações, chamadas e testes pertinentes concluído; referências locais e diff conferidos. Somente este relatório e CURRENT foram alterados. Sem testes/build, inspeção autenticada no navegador, SQL ou deploy. Os pontos de recorte/rolagem são riscos identificados no código; esta rodada não reproduziu nem certificou a causa dos casos observados pelo proprietário.


## Implementação após aprovação — 16/10/2026

Proprietário aprovou a divisão e autorizou o início. Tickets publicados no rastreador local, um arquivo por entrega. O escopo é a implementação dos três tickets, sem publicação do aplicativo.

### Comportamento preparado

- Parceiro inicia automático. Home mês inicia automático; semana inicia limitada. A Home guarda a escolha de cada período durante sua montagem, sem adicionar persistência.
- Controle único “Limitar altura dos dias” nos três modos. O teto efetivo é `min(24rem,60dvh)` (até384px na escala atual); poucos itens não forçam o teto. A grade alinha os dias por semana sem igualar todas as semanas do mês.
- Removidos o truncamento em cinco itens e o acoplamento da altura ao modo compacto. A lista compartilhada mantém rolagem/máscaras para outros consumidores; no calendário, delega a rolagem à célula, sem máscaras ou rolagens concorrentes nas duas listas de Conteúdo.
- Cabeçalho do dia permanece fora da área rolável. Comemorações acompanham as ações nessa área para permanecerem acessíveis mesmo em quantidade grande; essa é a decisão de implementação para evitar recorte de um rodapé maior que o teto. Botão de criação tem nome acessível e aparece também ao receber foco.
- Painel do parceiro ganhou cadeia flexível com encolhimento e rolagem vertical; feed continua independente. Home não acumula o antigo limite externo de50vh.
- Portal: removidos piso de120px e preenchimento vertical das linhas. Grade usa linhas naturais e início do conteúdo dentro do painel limitado à janela. Nenhum novo controle de altura por dia.

### Evidência antes/depois

- Teste no calendário real falhou antes porque “Action6” não era renderizada após cinco ações; passou após remover o truncamento.
- Dia vazio da equipe medido no navegador:384px antes e76px depois, incluindo cabeçalho/paddings. Não há piso artificial de288/384px.
- Portal semanal sem ações, em painel de500px: área de ações media372px antes e excedia o critério de menos de100px. Após a correção, o mesmo critério passa em semana/mês, desktop/mobile.

### Verificação local

-379 testes/1143 assertions passaram na suíte geral;13 testes/32 assertions pertinentes passaram após os ajustes finais. Format, lint, typecheck e build passaram. Aviso conhecido de tamanho de chunks permanece.
- Script permanente de navegador verifica componentes reais/CSS em1440×900,390×600 e1280×450: alturas natural/máxima, semanas independentes, mais de cinco itens, última ação, teclado End, imagens carregadas e comemorações. Home semana/mês e portal semana/mês também conferidos em desktop/mobile.
- Página real do parceiro, com HTTP controlado, conferida em1440×900,390×600 e1280×450: última semana alcançável, limite, rolagem por teclado e feed lateral. Arraste após rolar o dia limitado confirmado com horário10:00 preservado na escrita HTTP simulada. Captura clara inspecionada.
- Portal real também conferido com HTTP controlado: semana/mês, desktop com feed visível e oculto, celular e alternância Calendário/Feed; última ação e rolagem da grade acessíveis, sem providers privados da equipe.
- Regressão existente de períodos do portal passou (viradas de mês/ano e semana domingo–sábado em America/Fortaleza).

Testes no navegador usam dados fictícios e HTTP controlado; não certificam banco, provedor nem uso autenticado nos dados reais do proprietário. Não houve SQL, push ou deploy. Proprietário aprovou o resultado local em16/10; publicação ainda não realizada. Os scripts temporários de diagnóstico são descartáveis; a regressão de geometria permanece no script permanente de calendários.
