# Estudos de cores e datas comemorativas — 04/11/2026

Solicitação do proprietário após conferência da galeria. Três subagentes fizeram estudo somente leitura. As propostas abaixo aguardam decisão de implementação.

## ActionColorDropdown

Agrupar amostras por parceiro, com nome compacto acima de suas cores, preservando a origem mesmo quando a mesma cor aparece em mais de um parceiro. Hoje flatMap e Set eliminam essa informação.

Botão ghost xs ao lado da entrada permite escolher HEX, RGB, HSL e HSB. PrismColorField encaminha channel/colorSpace. HEX usa um campo; RGB/HSL/HSB usam três canais nativos. A área permanece HSB (saturação/brilho) e o slider inferior deve declarar hue explicitamente. Mudar formato altera somente a representação.

Validar limites nativos (RGB 0–255, hue 0–360 e canais percentuais 0–100). Manter rascunho inválido, feedback e última cor válida. Persistência permanece #RRGGBB, sem alfa. Evitar confirmação duplicada da mesma cor durante mudança e fechamento do dropdown.

## ColorListEditor

Nome sugerido PaletteEditor. Uso operacional no cadastro administrativo do parceiro, além da galeria. Reutilizar o seletor de cor por um núcleo controlado ColorPickerDropdown com value/onChange e grupos opcionais. ActionColorDropdown conserva a adaptação de ação/parceiros. Assim o editor de paleta não precisa simular uma ação para editar uma cor.

Excluir pode usar ghost icon-sm. A variante ghost-destructive proposta conserva aparência neutra em repouso e usa texto/fundo/borda/anel destrutivos no hover e foco visível, respeitando a escala Prism.

A validação atual converte entradas inválidas em preto e completa valores incompletos com zeros. A migração deve preservar o texto inválido e emitir apenas uma cor válida, com feedback explícito.

## PartnerCelebrationsSelector

Preservar barra, meses e lista. Trocar textos principais para text-sm e auxiliares para text-xs. Busca sm sem h-7/text-xs/ícone de 14px próprios. Meses com PrismToggleGroup ghost sm; Limpar todas com PrismButton link sm; limpar busca ghost icon-xs.

Linhas com PrismCheckbox padrão, evitando o checkbox nativo dentro de outra região role=checkbox. Badge warning padrão para feriado, substituindo o selo próprio de 9px. Manter agrupamento por mês, duas colunas e rolagem sobre o fundo da página.

## Estado

Sem implementação desses estudos. As mudanças funcionais propostas precisam preservar seleção, upload/persistência já existentes e autorização dos consumidores. Referências centrais em ActionColorDropdown.tsx, ColorListEditor.tsx, PartnerCelebrationsSelector.tsx e primitivos de cor/botão do Prism.
