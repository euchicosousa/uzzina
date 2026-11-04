# Usos de PhaseIcon — 04/11/2026

Inventário estático por subagente, separado de galeria e capacidade dinâmica dos helpers. Sem remoção ou alteração do componente.

| Tamanho | Uso operacional |
|---|---|
| xs 12px | Nenhum consumidor atual; suportado pelo helper do PhaseCombobox para botão xs e pela galeria. |
| sm 16px | Cartão Bloco, cabeçalho do cartão Conteúdo, busca, menus de fase, calendário e detalhe do portal. |
| md 20px | Rodapé, pelo PhaseCombobox icon-lg e helper getTriggerPhaseIconSize. |
| lg 24px | Apenas galeria. |
| xl 32px | Apenas galeria. |
| 2xl 48px | Apenas galeria. |
| dot 8px | Cartão Linha sem atraso. |

progress tem uso nos cartões, busca e rodapé. icon tem uso nos menus, calendário e detalhe do portal. Ambas devem permanecer no contrato operacional atual.

lg/xl/2xl são candidatos à remoção se o proprietário optar por restringir a API ao uso presente. xs mantém coerência com o botão xs, mesmo sem consumidor atual. Remover tamanhos exige atualizar tipos, helper e controles da galeria. PhaseStationBadges contém PhaseIcon sm, mas não tem consumidores encontrados. Content não monta o ícone diretamente; o cabeçalho do ActionItem Conteúdo monta sm.

Referências em PhaseIcon.tsx, ComboboxTrigger.tsx, ActionFormFooter.tsx, ActionLineVariant.tsx, ActionBlockVariant.tsx, ActionItem.tsx, GlobalSearchCommand.tsx, PhaseCombobox.tsx, ClientCalendar.tsx e dash/action/$id.tsx. As variantes/tamanhos configuráveis na galeria não contam como consumo operacional.
