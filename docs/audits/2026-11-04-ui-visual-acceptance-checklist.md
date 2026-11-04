# Aceite visual da galeria — 04/11/2026

Inventário dos 21 cabeçalhos de seção sem a propriedade approved na galeria. A ausência do selo também aparece em seções com aceite anterior, discriminadas abaixo. V19–V24 estão tecnicamente concluídos por autorização anterior; a conferência visual de seus exemplos pode ser registrada separadamente aqui. V25–V34 estão concluídos conforme os registros consolidados da série; os roteiros abaixo permanecem para consulta. Atualização documental em 04/11, base `d7efe5f`.

Abra /ui, confira os temas claro/escuro e uma janela estreita de 375px. Verifique texto legível, alinhamento, foco por teclado, controles sem corte e ausência de rolagem horizontal na página. A barra de meses pode rolar internamente.

## Exemplos entregues que podem ser conferidos agora

| Aceite | Ticket / seção | Lista de verificação |
|---|---|---|
| [ ] | V19 — Avatar / AvatarGroup | Alternar sm/default/lg; imagem válida e quebrada; conferir fallback; ligar selo; variar quantidade do grupo e contador +3. |
| [ ] | V20 — Sheet | Abrir nos quatro lados; fechar por X, Cancelar, Salvar e Escape; verificar retorno de foco; testar clique fora ligado/desligado; esconder cabeçalho/rodapé e ligar conteúdo longo. |
| [x] | V21 — ComboboxTrigger | Trocar variante e tamanho; testar avatar, ícone, texto e amostra de cor; confirmar tamanhos icon-* sem texto; conferir foco e desabilitado. |
| [ ] | V22 — ResponsiblesCombobox | Presets 0/1/3; selecionar e remover pessoas; Shift+clique exclusivo; trocar tamanho/variante; desabilitado não abre. |
| [ ] | V23 — SprintCombobox | Presets 0/1/2 e responsáveis Nenhum/Um/Todos; selecionar pessoa fora dos responsáveis e conferir ambas as contagens; Shift exclusivo; desabilitado. |
| [x] | V24 — PhaseIcon | Percorrer as seis fases e todos os tamanhos; comparar Progresso/Temático; Concluído com check; dot como ponto na variante Progresso; conferir linha comparativa. |
| [x] | V25 — ULoader | Percorrer xs/sm/md/lg/xl/2xl; conferir tamanho com legenda, rotação e contraste. |
| [x] | V26 — PrismToggle (antes UToggleInput) | Marcar/desmarcar Arquivado; conferir FormData (on quando marcado, ausente quando desmarcado), disabled, texto/ícone, Tab e Espaço; não há consumidor radio a preservar. |
| [x] | V27 — UPreferenceSwitch | Alternar Ativo/Inativo na prévia e no controle; editar rótulo e descrição; conferir quebra de texto em janela estreita. |
| [x] | V28 — UAvatarSelector | Selecionar/desselecionar; presets Nenhum/Um/Todos; variar 2–8 opções e subtítulo; mínimo 1 com um selecionado deve impedir remoção e mostrar aviso. |
| [x] | V29 — UAdminItemCard | Ligar/desligar cores, subtítulo e selo; título e fallback longos; conferir truncamento e alinhamento do avatar. |
| [x] | V30 — CalendarToolbar | Passos 1/3/7 com anterior/próximo; abrir calendário e escolher data; Mostrar mês; conferir modo compacto. |
| [x] | V31 — ColorListEditor | Alterar hexadecimal; adicionar/remover; reordenar pela alça; variar quantidade inicial; conferir legenda e ordem após cada operação. |
| [x] | V32 — ActionDatePicker | Alterar data e hora, fechar e conferir o resultado; percorrer formatos e tamanhos; ligar Atrasada; conferir Escape e foco. |
| [x] | V33 — ActionColorDropdown | Abrir; escolher amostra de parceiro; alterar área, slider e hexadecimal; fechar e conferir cor/legenda; variar parceiros, variante e tamanho. |
| [x] | V34 — PartnerCelebrationsSelector | Buscar nome e alternar mês; marcar/desmarcar e limpar; presets Nenhuma/Duas/Todas; Carregando/Salvando; quantidade 0; conferir título e controles em 375px. |

## Outros cabeçalhos sem selo

| Seção | Situação / roteiro |
|---|---|
| Cores Semânticas OKLCH | Conferir paletas em claro/escuro, legibilidade de texto/fundo e cores semânticas. A lista de tickets não registra aceite específico desta seção. |
| Espaçamento Exponencial | Conferir a escala, legendas, progressão dos intervalos e comparação com os tamanhos de controle. A lista de tickets não registra aceite específico desta seção. |
| Foco | Aceite anterior registrado no V09. Conferir somente se desejar revisar: Tab entre exemplos, um único anel visível, sem corte ou alteração de tamanho. |
| Ícones (Tokens) | Aceite anterior registrado no V14. Conferir somente se desejar revisar: desenho, significado, tamanho e contraste. |
| RichTextEditor | Coberto pelo aceite dos demais exemplos do V18. Conferência opcional: escrever, selecionar, formatar, abrir Mais formatação e testar atalhos. |

O sinal do menu e o sinal do cabeçalho podem divergir. Avatar e Sheet já aparecem com approved no menu, enquanto seus cabeçalhos não têm selo. Este inventário usa os cabeçalhos visíveis dos exemplos e preserva os aceites anteriores. Marcar cada linha após o retorno do proprietário.

## Verificação técnica desta rodada

Prettier dos dez arquivos V25–V34 corrigido. Quebra de título longo corrigida em GallerySectionHeader. Chromium após a correção: largura/scrollWidth 375/375 em ambos os temas e 1400/1400 no desktop, zero erros de página ou requisições externas. Controles principais dos dez exemplos reexercitados, conforme relatório V25–V34. Aceite visual pertence ao proprietário.

PartnerCelebrationsSelector aprovado visualmente pelo proprietário em 04/11 após os refinamentos do V39.

## Pendências após consolidação

V35: confirmar que um clique no pai abre o submenu e rola ao primeiro filho; conferir filho, troca rápida e rolagem manual. Implementação e regressão commitadas em `d7efe5f`, sem presumir aceite final. V36 e V41 têm entregas ainda pendentes, não são casos prontos para aceite visual.
