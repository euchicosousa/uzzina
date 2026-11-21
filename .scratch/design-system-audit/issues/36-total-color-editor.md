# DS36 — Um só lugar para editar todas as cores do app

**Status.** Aberto em 21/11/2026 a pedido do proprietário. Só estudo e desenho; nenhuma alteração além da página "Cores dos temas" atual sem aprovação de cada etapa. Continua o DS35 (fase 5 e o editor do Admin, antigo DS32).

## O que é

Hoje a página **Cores dos temas** (menu do avatar → Administração, ou busca global → "Cores dos temas"; rota `/app/admin/themes`) edita só parte das cores: as 11 paletas (fundo, texto, camadas de cinza, principal, destaque, sombra), as fases e as prioridades. As cores fixas (erro, atenção, sucesso, informação), as categorias e os números escritos nas fórmulas do CSS ficam espalhados em `tailwind.css` e `CONSTANTS.ts`, e só se mudam à mão.

O proprietário quer **um local que faça tudo**: qualquer cor do app se edita ali, com o mesmo jeito de trabalhar de hoje (acordeão, claro e escuro lado a lado, prévia à direita), e o resultado é o código pronto para colar.

## Decisões do proprietário (21/11)

1. **Paleta e cores fixas são coisas separadas.** Cada paleta só guarda o que muda de tema para tema. Fases, prioridades, categorias e as cores fixas (erro, atenção, sucesso, informação) ficam num **bloco único, compartilhado por todas as paletas**.
2. **Tudo vem de dados, o Tailwind só lê.** O `tailwind.css` passa a consumir variáveis, sem valores escritos nele; as variáveis são gravadas a partir dos dados.
3. **O editor vira o local de tudo**, incluindo fases e categorias.
4. **O editor mostra por abas.** Ao abrir uma aba (Paleta, Cinzas, Fixas, Fases, Prioridades, Categorias, Fórmulas…), aparece só aquela parte, o que deixa a página mais leve e permite mostrar mais itens em cada uma.
5. A saída continua sendo o código completo (hoje o `palettes.ts`); o editor não grava no banco.

## O que será mudado (proposta, por etapa)

1. **Avisos (erro, atenção, sucesso, informação):** vão para o bloco compartilhado, com fundo e texto em claro e escuro. O `tailwind.css` lê as variáveis, sem valor fixo.
2. **Fases, prioridades e categorias:** passam para o mesmo bloco compartilhado. Hoje fases e categorias vivem em `CONSTANTS.ts`; a decisão é onde o bloco mora (arquivo novo ou dentro de `palettes.ts`).
3. **Números das fórmulas:** o tom e a saturação escritos no CSS (texto da fase, sombra da fase, cartão atrasado, `success-strong`) viram campos do bloco compartilhado.
4. **Editor por abas:** a página ganha as abas acima; cada aba mostra só os seus itens.
5. **Código completo de todos os arquivos tocados:** além do `palettes.ts`, o bloco compartilhado.

## Cuidados

- **Piscar antes do JS:** o login e as páginas públicas aparecem antes de o JavaScript gravar as variáveis. Hoje o `index.html` pré-carrega só fundo e primária do Ônix. Com tudo vindo de dados, esse bloco de pré-carga precisa ser gerado a partir dos dados (no build ou por conferência), senão o app mostra cor errada por um instante.
- **Tema Personalizado:** guarda só cores, relevo e sombra; precisa continuar funcionando com o bloco compartilhado e com os ajustes de luz padrão.
- **Fases e categorias são usadas em muitos lugares** (cartões, calendário, portal, revisão pública). A mudança de onde vêm as cores precisa manter as mesmas cores no resultado final; só muda a origem.

## Decisões em aberto

- O bloco compartilhado mora em `palettes.ts` ou em arquivo próprio?
- As categorias (hoje com cor em `CONSTANTS.ts`) entram na primeira rodada ou depois das fases?
- O pré-carregamento do `index.html` é gerado automaticamente ou conferido por teste?

## O que olhar antes de aprovar

- Etapa 1: avisos nas telas (alerta, toast, selo, campo com erro), claro e escuro, em duas paletas, sem mudança de cor em relação a hoje.
- Etapa 2: cartões de ação por fase, calendário e portal com as mesmas cores de antes.
- Editor: abas, cada uma com só o seu conteúdo, e o código copiado igual ao arquivo que será colado.

## Modelos sugeridos

- **Claude Code — Sonnet 5.5.** Mexe em dados, `palette-vars`, `tailwind.css` e no editor ao mesmo tempo; exige conferir que as cores finais não mudam.
- **Claude Code — Haiku 5.5.** Só para a etapa de abas do editor, que é interface sobre dados já prontos.
- **Gemini — Gemini 4 Pro.** Alternativa para a migração dos números das fórmulas, com revisão antes de aplicar.

## Implementado (21/11, etapas 1 a 8)

Sem commit, sem push e sem publicação. Registro detalhado por etapa no [brief de execução](ds36-execution-brief.md).

- **Etapa 1:** acordeão Prism corrigido (`data-expanded`); botão (i) ao lado de cada nome, com a regra e os números da paleta aberta; abas Tema, Estados, Fases e categorias, Fórmulas; blocos numerados 1 a 10; prévia com Cartão, Menu, Cinza, Campos e Avisos.
- **Etapa 2:** bloco `SHARED_COLORS` em `palettes.ts` (estados, fases, categorias); fases e categorias em `CONSTANTS.ts` vêm dele; `UIcons`, as duas páginas do dash e o gravador do código não usam mais hex.
- **Etapa 3:** texto de apoio a partir do fundo (ΔL e ΔC em dados); `--primary-hover`; halo com `ring-ring-halo` (37 usos); brilho do cartão; sem defaults de ΔL no CSS; pré-carga do `index.html` só com as quatro variáveis de fundo e texto, e `applyPaletteVars(PALLETE[0])` antes do primeiro render.
- **Etapa 4:** sombra única (DS29) em `--shadow-color`; `shadowColor` e `shadowOpacity` saíram das paletas e do Personalizado; sombra do cartão atrasado a partir de dados.
- **Etapa 5:** derivações suave e vivo (22 valores) em dados e no editor, aba Fases.
- **Etapa 6:** estados, sucesso forte, fundo dos avisos e marca-texto vêm de variáveis; as prioridades são só leitura e seguem os estados.
- **Etapa 7:** texto sobre a principal é um deslocamento (ΔL, ΔC, ΔH) em cada paleta; comprovado com script: cor derivada igual à antiga dentro de 0,0001 em L e C nas 22 combinações.

## Etapa 9 (21/11, ajustes pós-revisão)

- Regra de fundos secondary/card/input e lista do que mudou: ver CURRENT (etapa 9) e o contrato de superfícies.
- Acordeão Prism com `variant` default e card.
- Pendências: aplicar a migration pelo procedimento do proprietário; conferir telas autenticadas; levantamento das transparências escritas à mão e do termo "cartão" em `.scratch/transparencies-survey.md` e `.scratch/cartao-survey.md`.

## Não verificado no navegador

Telas autenticadas, o editor (login não feito), o primeiro pintar das páginas públicas, a sombra nas 11 paletas e o efeito do halo srgb. Só `tsc`, testes listados e compilação do Tailwind foram rodados.

- **Etapa 8:** o Personalizado guarda por modo `accentHex?` e `layers` (8 deltas) além das quatro cores hex; `customThemeToPalette` entrega objeto completo ao `applyPaletteVars`; `resolveCustomLayers` preenche temas antigos com o Ônix (único lugar). Editor em Minha Conta: Destaque e "Camadas" recolhível. `fgLDelta` e `primaryFgDelta` não são guardados (texto e texto sobre a principal continuam hex explícitos). Migration `supabase/migrations/20261121120000_custom_theme_layers_preferences.sql` preparada, NÃO aplicada; sem ela o salvamento recua para as quatro cores com aviso. Não verificado na tela autenticada.
