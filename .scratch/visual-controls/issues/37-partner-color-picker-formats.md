# 37 — Cores por parceiro, formatos e validação no seletor de cor

**Resumo:** Unifica seleção de cor, paletas por parceiro, formatos HEX/RGB/HSL/HSB e validação no UColorPickerDropdown.

**Commit de referência:** `d7efe5f` — entrega versionada no histórico local.

**What to build:** no ActionColorDropdown, identificar as paletas por parceiro e permitir editar a mesma cor como HEX, RGB, HSL ou HSB, com validação explícita e slider inferior sempre de hue.

**Blocked by:** nenhum. Executor previsto Gemini.

**Status:** Concluído (100%) — aceite registrado no índice da série em 04/11/2026.

## Entrega

- [x] Mostrar nome compacto de cada parceiro acima de suas amostras. Preservar a origem das cores repetidas entre parceiros. Tratar parceiro sem cores sem oferecer amostras fictícias.
- [x] Usar botão ghost xs (ou sm conforme espaço disponível) junto da entrada para escolher HEX/RGB/HSL/HSB. Exibir rótulos acessíveis dos canais. HEX usa um campo; demais formatos usam três campos por canal, aproveitando channel/colorSpace já suportados pelo PrismColorField.
- [x] Manter a área em saturação/brilho e declarar hue no slider inferior. A troca de formato conserva a mesma cor selecionada e não gera alteração persistida por si só.
- [x] Validar HEX e limites dos canais pela API instalada do React Aria. Preservar rascunhos incompletos/inválidos com erro acessível e última cor válida. Não converter erro para preto/cinza nem completar números com zeros para inventar uma cor válida.
- [x] Converter confirmação válida para #RRGGBB, preservando o contrato de persistência. Transparência fica fora deste recorte.
- [x] Garantir que mudança/blur/fechamento não confirmem a mesma cor duas vezes. Preservar a sequência atual de edição da ação e o controle de versão/sessão do consumidor.
- [x] Separar a composição de seleção de cor em UColorPickerDropdown controlado por value/onChange e grupos opcionais. ActionColorDropdown continua adaptando os dados da ação/parceiros para esse núcleo. O V38 reutiliza o núcleo sem criar ação fictícia.
- [x] Usar os primitivos e a escala atuais. Atualizar a galeria correspondente para mostrar grupos, formatos, erros e resultado confirmado, com dados locais e sem gravar no banco.

## Validação e passagem

- Verificado tecnicamente: `npx tsc --noEmit` aprovado com 0 erros, Biome lint com 0 erros/avisos, Prettier formatado.
- Teste automatizado real em `tests/color-picker-and-palette-editor.test.tsx`: 5/5 testes passaram (conversão #RRGGBB, preservação de cores de parceiros sem desduplicação forçada, tratamento de parceiro sem cores sem fictícias, e validação sem fallback de zeros).
- Galeria atualizada em `/ui` > Componentes Uzzina > `ActionColorDropdown` e `UColorPickerDropdown` com dados locais mockados.

Conferir seleção de amostra, edição nos quatro formatos, limites, entrada vazia/incompleta/inválida, troca de formato sem perda de cor, fechar/reabrir, ausência de callback duplicado e vários parceiros. Conferir teclado, rótulos, temas e largura estreita. Teste automatizado somente para regressão concreta de parsing/confirmação que o código real precisar proteger. Formatar, lint/typecheck proporcionais, build se publicar.

Registrar arquivos alterados, verificações reais e pendências, distinguindo ensaio controlado de banco/provedor. V38 deve receber o contrato do seletor reutilizável já funcional. Sem renomeação global de componentes neste ticket.

Estudo de referência em docs/audits/2026-11-04-color-and-celebration-studies.md. Começar por CURRENT/AGENTS e preservar mudanças externas. Um executor escreve no checkout por vez.
