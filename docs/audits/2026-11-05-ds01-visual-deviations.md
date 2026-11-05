# DS01 — Inventário inicial de desvios visuais

## Revisão do V44

A inspeção independente confirmou a ausência de consumidores de `PhaseStationBadges` e de montagens de `PartnerColorPicker`. Os dois diálogos de lote ainda dependem de `toHex` e a galeria menciona a origem de uma réplica. A matriz contempla os 18 arquivos U*, contando `UAvatarGroup` dentro de `UAvatar.tsx`; o total de 16 do resumo precisa ser corrigido. O recorte atual sustenta o uso da matriz como insumo para o DS01, com estas ressalvas de execução.

| Ponto do V44 | Resultado da revisão |
| --- | --- |
| Remover seletor legado | Preservar `toHex` e seu fallback para a entrada original. `safeColor` devolve a cor padrão quando a entrada é inválida, portanto a troca altera o contrato. |
| Controles sem anel Prism | A folha global em `app/tailwind.css` aplica outline de 3px em `:focus-visible`. A falta da classe local prova divergência de estilo, mas a visibilidade real depende dos resets, do recorte e do contraste. `PrismButton unstyled` também dispensa as classes-base. |
| Badges de leads | `LeadDetail` usa `bg-success/15` e `bg-warning/15`; as variantes Prism usam fundos semânticos próprios. Revisar aparência e textos reais “Concluído” e “Em andamento” no aceite. |
| Barra de ferramentas | A troca precisa preservar a relação do botão com a Toolbar React Aria, estado pressionado, foco por setas e atalhos. A matriz estática não comprova paridade. |
| Calendário | Encaminhar os marcadores e a decisão de cor para CAL01. A padronização do botão de criar ação continua no recorte de controles do V44. |

## Inventário por padrão

| Prioridade | Local e evidência | Classificação e encaminhamento |
| --- | --- | --- |
| Alta | `CalendarDayCell`: `bg-amber-500`, `text-amber-600`, `dark:text-amber-400` e opacidades diferentes por tipo. | CAL01 absorve o achado. As paletas `orange` e `yellow` são opções de tema. `warning` é um token semântico e já tem variante de badge. Compará-los no claro/escuro, considerando que feriado é classificação, e testar primeiro marcador neutro com diferença de forma/sublinhado. |
| Alta | `UPreferenceSwitch` e `CustomThemePanel`: contorno, raio, fundo de cartão e espaçamento externo em Preferências. | Adequação à regra existente de superfície contínua. Encaminhar no lote de Minha Conta do V44, com o recorte de layout separado da escolha entre seletor nativo e Prism. |
| Alta | `BulkDateTimeDialog`: rótulo externo envolve checkbox Prism. | Usar composição Prism com rótulo clicável e conferir nome acessível, clique e teclado. Coberto pelo V44. |
| Média | `LeadDetail`: fundos locais nos badges; verde literal no botão WhatsApp. | Usar variantes de status existentes conforme V44. Tratar o verde de marca como exceção candidata e conferir contraste de texto e foco nos dois temas. |
| Média | `GlobalSearchCommand`: cinco usos de `h-10` em itens cujo padrão é `h-8`. | Exceção candidata. Comparar densidade, título/subtítulo e avatares antes de consolidar a altura. Coberto pelo V44. |
| Média | `PlanningCalendarView` e `PlanningSuggestionsList`: estados em emerald/amber e tipografia local de 10px. | Encaminhar à recuperação de Planejamento. Usar variantes de status quando a semântica combinar e validar legibilidade na célula com o conteúdo real. |
| Média | `AppBar` e `RichTextEditor`: mesma receita de superfície flutuante com borda, raio, `shadow-lg` e blur. `ActionItem`, `UAdminItemCard` e `UAvatarSelector` também usam `shadow-lg` em hover. | Propor vocabulário de elevação para superfície flutuante e realce de item. Confirmar se precisam de papéis distintos antes de extrair token. Incorporar à pauta de padrões do DS01. |
| Baixa | `Content`: sombra literal no texto quando há mídia; `CustomThemePanel`: escala no hover e `duration-200`; `UAdminItemCard`: `duration-500`. | Sombra sobre mídia é exceção candidata de legibilidade. Comparar durações com os estados Prism antes de propor uma regra compartilhada de movimento. |

Reaproveitar os lotes de controles do V44, concentrar a apresentação de datas no CAL01 e encaminhar os estados do Planejamento à série existente. Uma proposta de elevação e movimento só vira ticket de implementação se a comparação mostrar um padrão recorrente com o mesmo papel.

Verificação estática no checkout de `cf533cb`, com trabalho documental externo presente. O inventário reúne ocorrências verificadas e exemplos por categoria. A cobertura exaustiva por rota, a comparação renderizada em claro/escuro e o aceite visual seguem pendentes. Nenhum código da aplicação foi alterado.
