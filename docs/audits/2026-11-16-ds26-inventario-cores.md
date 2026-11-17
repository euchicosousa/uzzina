# DS26 - Inventário de todas as cores do app

Data: 16/11/2026. Só leitura do código. Nada de `app/` foi alterado. Nenhum commit.

Arquivos lidos: `app/tailwind.css`, `app/lib/palettes.ts`, `app/lib/palette-vars.ts`, `app/lib/custom-theme.ts`, `app/utils/color.ts`, `app/lib/action-color.ts`, `app/lib/CONSTANTS.ts` e a busca nos componentes de `app/`.

## Faltando nos laboratórios

O ds24 (neutros) e o ds25 (semânticas) deixaram de fora estes grupos. Eles precisam de fórmula antes de o editor ficar completo:

1. **Sombras de todas as superfícies.** A cor da sombra vem do campo `shadowColor` de cada paleta e a força vem de `shadowOpacity` (de 10% a 70%). Afeta menus, selects, diálogos, tooltips, cartões e avisos. O ds24 excluiu sombras de propósito.
2. **Sombra e anel do cartão de ação.** Repouso e hover, em modo claro e escuro. Hoje derivam da cor de sombra da paleta, não da primária.
3. **Borda superior de relevo do cartão.** Branco no claro, branco a 10% no escuro, transparente nas paletas lisas.
4. **Película de fundo (overlay).** Diálogos e painéis usam `bg-overlay` (cor de sombra a 30%). O painel de edição de ação usa preto fixo: `bg-black/20` no claro e `bg-black/80` no escuro.
5. **Sombra das fases e do atraso.** O ds25 cobre a cor e a mistura do cartão, mas não a sombra do cartão suave, do cartão vivo e do atraso.
6. **Sombra colorida dos avisos (toast).** Cada tipo (sucesso, erro, atenção, informação) tem sombra da própria cor semântica a 30%.
7. **Barra de rolagem e seleção de texto.** O ds24 cita, mas não modela. A seleção de texto não tem cor definida no CSS (usa a do navegador).
8. **Itens fixos que talvez não devam mudar com o tema:** ícones e textos sobre imagem (`image-icon`, botões do Instagram), realce do editor (âmbar), marca do WhatsApp, widget do Cloudinary, xadrez do seletor de cor, níveis de cor da escolha de modelo de IA.
9. **Cores Tailwind diretas** (zinc, gray, neutral, amber) em 4 arquivos. Algumas não seguem o tema.

## 1. Variáveis e valores de cor (CSS e paletas)

Legenda da classificação: (a) ds24 neutros; (b) ds25 semânticas; (c) derivada da primária, fora; (d) vem de dados; (e) não coberto.

### 1.1 Neutros e superfícies (a)

| Variável | Fórmula hoje (claro / escuro) | Varia por tema? | Classe |
|---|---|---|---|
| `--background` | Campo `bg` da paleta (Ônix claro L 0.96, escuro L 0.2) | Sim | a |
| `--foreground` | Campo `fg` (claro quase preto, escuro quase branco) | Sim | a |
| `--card` | Fundo + `cardLDelta` (claro -0.02, escuro +0.05) | Sim | a |
| `--popover` | Fundo + `popoverLDelta` | Sim | a |
| `--border` | Fundo + `borderLDelta` | Sim | a |
| `--input` | Fundo + `inputLDelta` | Sim | a |
| `--action` / `--action-hover` | Fundo + `actionLDelta` / `actionHoverLDelta` | Sim | a |
| `--secondary` | Texto a 5% (claro, mistura em srgb) / 10% (escuro, mistura em oklch) | Não | a |
| `--secondary-foreground` | Texto a 65% | Não | a |
| Texto suave (`text-secondary-foreground`) | Mesma regra, 65% | Não | a |
| `bg-foreground/5`, `/10`, `/15`, `/20`, `/40` e `border-foreground/...` | Transparência do texto, uso espalhado | Não | a |
| `border-border/30` a `/60` | Transparência da borda | Sim | a |

### 1.2 Semânticas e prioridades (b)

| Variável | Fórmula hoje (claro / escuro) | Classe |
|---|---|---|
| `--color-error`, `--error-foreground`, `--color-error-background` | Base fixa (claro L 0.65 C 0.22 H 16; escuro L 0.72 C 0.16). Fundo = base a L 0.93 (claro) ou 0.32 (escuro) | b |
| `--color-warning` (+ foreground e fundo) | Mesma regra, H 80 | b |
| `--color-success` (+ foreground e fundo) | Mesma regra, H 163 | b |
| `--color-info` (+ foreground e fundo) | Mesma regra, H 250 | b |
| `--priority-low`, `--priority-medium`, `--priority-high` | Valores próprios por modo | b |
| `--success-strong`, `-hover`, `-foreground` | emerald-600, emerald-700, branco (igual nos dois modos) | b |
| `phase-surface` (cartão suave) | Mistura da fase no cartão: 7% / 12% (claro), 14% / 22% (escuro) | b |
| `phase-vivid` (cartão vivo) | Fundo = cor da fase inteira; texto escuro ou claro | b |
| `late-surface` (atraso) | Fundo error-background a 70%, anel e sombra com erro | b |

### 1.3 Primária e derivadas (c, ficam fora)

| Variável | Fórmula hoje | Classe |
|---|---|---|
| `--primary`, `--primary-foreground` | Campo `primary` e `primaryFg` da paleta | c |
| `--ring`, `--color-ring` | Campo `ring` da paleta. No Ônix é preto (claro) e branco (escuro), não a primária | c |
| `--accent`, `--color-accent` | Primária com L -0.15 (claro) ou +0.1 (escuro) | c |
| `ring-ring/30` (41 usos), `border-ring/60` (27), `border-primary/...`, `bg-primary/...` | Uso da primária | c |

### 1.4 Dados (d)

| Origem | Valor | Onde aparece |
|---|---|---|
| Fases (`PHASES` em `app/lib/CONSTANTS.ts`) | Ideia `#fbbf24`, Fazer `#f97316`, Fazendo `#ec4899`, Análise `#a855f7`, Feito `#38bdf8`, Concluído `#4ade80` | Cartão de ação, bolinha da fase, calendários, Hoje |
| Categorias (`CONSTANTS.ts`) | Hex fixo por categoria (cerca de 13) | Quadro de categorias, filtros |
| Tópicos (`partner_topics.color`) | Vem do banco | Etiqueta do tópico, cartão |
| Cor da ação sem tópico (`actions.color`) | Vem do banco; inválida cai em `#666666` (`DEFAULT_ACTION_COLOR`) | Cartão, listas, portal |
| Cor do parceiro (`partner.colors[0]`) | Vem do banco | Barra superior, Início, cartão de ação |
| Cor de sombra e relevo personalizados | Entrada do usuário, padrão `#000000` e `#ffffff` | Minha Conta, tema personalizado |

### 1.5 Campos da paleta (`palettes.ts`) e sombra por tema

Todas as paletas usam `shadowColor` e `shadowOpacity` (claro e escuro). Nenhuma define `topBorderColor`. Relevo é ligado em todas, exceto Carbono e Cobalto (lisas).

| Paleta | Sombra claro (cor, %) | Sombra escuro (cor, %) | Relevo |
|---|---|---|---|
| Ônix | oklch(0.25 0.01 200), 10% | oklch(0.1 0.01 200), 50% | Sim |
| Carbono | oklch(0.25 0 0), 10% | oklch(0.1 0 0), 40% | Não |
| Rubi | oklch(0.25 0.04 20), 10% | oklch(0.03 0 0), 70% | Sim |
| Coral | oklch(0.25 0.05 140), 10% | oklch(0.1 0.03 140), 25% | Sim |
| Damasco | oklch(0.25 0.04 100), 10% | oklch(0.03 0 100), 70% | Sim |
| Elétrico | oklch(0.25 0.04 120), 10% | oklch(0.1 0.03 120), 60% | Sim |
| Folha | oklch(0.25 0.04 130), 10% | oklch(0.1 0.03 130), 50% | Sim |
| Turquesa | oklch(0.25 0.04 200), 10% | oklch(0.1 0.03 200), 50% | Sim |
| Cobalto | oklch(0.25 0.04 264), 10% | oklch(0.1 0.03 264), 50% | Não |
| Violeta | oklch(0.25 0.04 290), 10% | oklch(0.1 0.03 290), 50% | Sim |
| Fúcsia | oklch(0.25 0.15 350), 10% | oklch(0.1 0.1 340), 25% | Sim |

### 1.6 Sombras, relevo e películas (e, não cobertos)

Todas são derivadas da cor de sombra da paleta (`--shadow-tint`, `--action-shadow-color`), salvo onde está indicado.

| Item | Variável ou regra | Fórmula hoje (claro / escuro) | Varia por tema? | Sugestão de derivação |
|---|---|---|---|---|
| Sombras das superfícies | `--shadow-2xs` até `--shadow-2xl`, `--shadow-toast` | Cor de sombra com alfa: base `--shadow-alpha` (claro 10%, escuro 25%, palette manda) × fator de cada tamanho (0.5, 0.6, 0.8, 1, 2.5 no 2xl) | Sim (cor e %) | Cor do pai/fundo escurecida (ex.: L do fundo -0.8) ou foreground, com alfa fixo por tamanho |
| Sombra do cartão de ação | `--action-shadow`, `--action-hover-shadow` | 14% (claro) / 35% (escuro) em repouso; 18% / 50% no hover | Sim | Mesma base das superfícies, com um alfa a mais |
| Anel do cartão | `--action-ring` | 5% (claro) / 20% (escuro) da cor de sombra | Sim | Foreground a 5% / 10%, igual à borda de container do ds24 |
| Borda superior de relevo | `--action-top-border` | Branco (claro); branco 10% (escuro); transparente sem relevo; pode ser trocado pela personalização | Não no padrão | Fica fixo em branco (ou foreground 10% no escuro) |
| Película de diálogos e sheets | `--color-overlay` / `bg-overlay` | Cor de sombra a 30% | Sim | Manter (já vem da sombra) |
| Painel de edição de ação | `bg-black/20` (claro), `dark:bg-black/80` | Preto literal, não muda com a paleta | Não | Usar `--color-overlay` para uniformizar, ou manter fixo |
| Sombra do cartão suave (fase) | `--phase-shadow` em `phase-surface` | Claro: cor da fase L 0.6 C 0.15, alfa 25%. Escuro: L 0.33 C 0.10, alfa 20% | Sim | Derivada da fase (já é dado), só alfa |
| Halo difuso do cartão suave | `--phase-diffuse` | Escuro: fase L 0.2 C 0.15 a 63%; claro: transparente | Sim | Fica como está |
| Sombra do cartão vivo (fase) | `--vivid-shadow` em `phase-vivid` | Cor da fase L 0.55 C 0.16, alfa 40% | Não por tema | Fica como está |
| Sombra do atraso | `late-surface` | Erro a 25% (claro), 30% (hover). Escuro: erro escuro L 0.45 C 0.18 a 50% / 60% | Sim | Derivada do erro (já é semântica), só alfa |
| Sombra colorida dos avisos | `prism/sonner.tsx`, `shadow-toast` com cor da semântica | Cor da semântica a 30%, offset 12 px | Não | Derivada da semântica (já é b) |
| Cor de sombra da personalização | `--shadow-color-override` | Padrão `#000000`, escolha do usuário | Sim | Entrada do usuário |
| Máscara do editor e da barra de ações | `ActionContainer`, `ActionFormFooter` (`linear-gradient` com preto e transparente) | Máscara de transparência, não aparece como cor | Não | Não é cor visível. Ignorar |
| Barra de rolagem | `::-webkit-scrollbar-thumb` | Polegar `foreground/10`, hover `foreground/20`, borda = fundo | Sim | Foreground transparente, sem trabalho novo |
| Seleção de texto | (sem regra) | Padrão do navegador | Não | Definir: primária a 25% ou foreground a 15% |
| Placeholder e caret do editor | `.tiptap ... is-editor-empty` | `foreground/50` | Sim | Foreground a 50%, já é neutro |
| Realce do editor (`mark`) | `.tiptap mark` | `amber-200` (claro), `amber-500/30` (escuro) | Não | Cor de atenção a baixa intensidade, ou fixo |
| Relevo de debug | `.debug-1` a `.debug-6` | Vermelho, amarelo, verde, azul, índigo, roxo | Não | Ferramenta de depuração. Pode sair |
| Gradiente animado do botão de IA | `animate-spin-gradient`, `--gradient-angle` | Só o ângulo é animado; a cor não está definida no CSS | - | Não há uso em componentes. Código morto |
| Ícones e textos sobre imagem | `image-icon` (branco + `drop-shadow` preto 70% e 55%) | Branco fixo | Não | Fica fixo (regra de 12/11/2026) |
| Botões sobre imagem (Instagram) | `bg-black/50` a `/70`, `text-white`, contador `bg-black/60` | Preto e branco fixos | Não | Fica fixo (está sobre foto) |
| Sombra do texto de miniatura | `drop-shadow-[0px_1px_1px_#00000050]` (Content.tsx) e `rgba(0,0,0,.85)` (ContentReorderDialog) | Preto fixo | Não | Fica fixo |
| Marca WhatsApp | `bg-[#25D366]` e `hover:bg-[#20bd5a]` (LeadDetail) | Hex fixo | Não | Fica fixo (marca) |
| Widget Cloudinary | `CloudinaryUpload.tsx` (cerca de 24 hex claros e escuros) | Zinc fixo por modo, sem tema | Não | Fica fixo, ou ligar aos neutros |
| Xadrez do seletor de cor | `color-slider.tsx` `#CCC` e `white` | Fixo | Não | Fica fixo (transparência) |

## 2. Cores escritas à mão nos componentes

Contagem feita com `grep` em `app/` (`.tsx` e `.ts`). Os números são de ocorrências, não de linhas únicas.

| Grupo | Padrão | Usos | Arquivos | Exemplo | Classe |
|---|---|---|---|---|---|
| Preto e branco com alfa | `bg-black/NN`, `bg-white/NN`, `border-white`, `text-white`, `text-black`, `border-black/10` | 34 | 12 | `InstagramPreview.tsx` (14), `ActionDrawerPanel.tsx` (painel, `bg-black/20` e `/80`) | e |
| Texto branco sobre cor de estado | `bg-error text-white` | 2 | 2 | `PlanningCalendarView.tsx`, `WorkFileThumbnail.tsx` (ícone de remover) | b (cor de texto fixa) |
| Sombras (classes) | `shadow-xs` (39), `shadow-action` (30), `shadow-lg` (12), `shadow-sm` (4), `shadow-2xs` (3), `shadow-md` (2), `shadow-toast` (1) | cerca de 91 | cerca de 36 | `TokensColorsSection.tsx` (galeria), `prism/dropdown-menu.tsx`, `prism/dialog.tsx` | e (ver 1.6) |
| Sombras com cor literal | `drop-shadow-[...]` com preto | 2 | 2 | `Content.tsx`, `ContentReorderDialog.tsx` | e |
| Gradientes | `linear-gradient` com cor | 6 | 4 | `ThemeColorInspector.tsx` (ferramenta de admin), máscaras do `ActionContainer` e do `ActionFormFooter` (só transparência) | ferramenta / máscara |
| Hex literal | `#rrggbb` em código | pelo menos 50 linhas | cerca de 10 | `CloudinaryUpload.tsx` (24), galeria `UzzinaColorPickerDropdownSection.tsx` e `UzzinaComboboxTriggerSection.tsx` (demo), admin `ThemePreviewPane.tsx`, `#666666` padrão de ação em 5 lugares | e (fixo), d (padrão de dado), ferramenta |
| RGBA literal | `rgba(...)` | 3 | 2 | `profile.tsx` (borda da prévia do tema) | e |
| Paleta Tailwind direta | `zinc`, `gray`, `neutral`, `amber`, `stroke-*-400/600` | 19 | 4 | `Footer.tsx` (`text-gray-500`), `profile.tsx` (zinc), `UAIModelSelect.tsx` (níveis de IA, 10 classes), `TokensFocusSection.tsx` | e |
| Paleta Tailwind de debug | `border-red-500` etc. em `.debug-*` | 6 | 1 | `tailwind.css` | ignorar (depuração) |
| Opacidade de token | `foreground/NN`, `ring-ring/NN`, `border-border/NN` | muitos (centenas) | 70 | `ring-ring/30` (41), `border-ring/60` (27), `border-foreground/10` (18), `foreground/40` (17) | a (neutros), c (primária) |
| Cor vinda de dado (inline) | `backgroundColor: partner.colors[0]`, `phaseInfo.color`, `topic.color`, `command.primaryColor`, `--phase-color` | cerca de 30 | cerca de 15 | `AppBar.tsx`, `ActionItem.tsx`, `DashboardMetrics.tsx`, `BulkActionMenu.tsx` | d |

## 3. Resumo por classe

| Classe | O que é | Situação |
|---|---|---|
| a. ds24 neutros | Fundos, texto, bordas, secundários, transparência do texto | Coberto |
| b. ds25 semânticas | Erro, atenção, sucesso, informação, prioridades, sucesso forte, fases (mistura) e atraso (cor) | Coberto |
| c. primária | Primária, anel, accent, uso `ring-ring/NN` | Fora (não muda) |
| d. dados | Fases, categorias, tópicos, cor de ação, cor de parceiro, padrões | Vem de fora do tema |
| e. não coberto | Sombras, relevo, película, seleção, rolagem, itens fixos, Tailwind direto | Falta no laboratório |

## 4. Observações técnicas

- `--secondary` mistura em srgb no claro e em oklch no escuro. A fórmula não é a mesma nos dois modos. Vale unificar no ds24.
- Coral (`orange`) define `actionHoverLDelta: 1` no claro. Isso empurra o hover para branco puro. Parece erro de digitação (os outros usam 0.02 a 0.1). Confirmar com o proprietário.
- `--action-top-border` no escuro é `rgba(255,255,255,0.1)` fixo no CSS, sem campo na paleta.
- `topBorderColor` existe nos tipos, mas nenhuma paleta o define. Só a personalização usa.
- O ds24 cita `app/tailwind.css` linhas 476, 487 e 587 para caret e seleção. Hoje essas linhas só contêm o placeholder do editor. Não há regra de seleção.

## 5. Decisões do proprietário

1. Ícones, textos e botões sobre imagem: ficam fixos (recomendação, pela regra de 12/11/2026).
2. Painel de edição de ação: escurecer com a película da paleta, ou manter preto fixo?
3. Rodapé `text-gray-500`: trocar pelo texto suave do ds24?
4. Níveis de cor do modelo de IA: ficam fixos ou ligados às semânticas?
5. Realce do editor (âmbar): fixo ou cor de atenção?
6. Sombra colorida dos avisos: manter a cor da semântica?
7. Coral com hover em 1 (claro): corrigir?

Fontes dos números: `grep` em `app/` feito em 16/11/2026. Os contadores podem variar em um ou dois usos se o código mudar.

## Decisão do proprietário: sombra (17/11/2026)

Testada em `.scratch/design-system-audit/ds27-sombras.html`. A cor da sombra deixa de ser por paleta e vira uma fórmula única, só com diferença entre claro e escuro:

```css
:root {
  --shadow-mix: 30%;
  --shadow-l: 0.15;
  --shadow-alpha: 10%;
  --shadow-color: oklch(from color-mix(in oklab, var(--background), var(--primary) var(--shadow-mix)) var(--shadow-l) c h);
}
.dark {
  --shadow-mix: 20%; /* menor no escuro: a opacidade é maior e a cor ficava forte demais */
  --shadow-l: 0.15;
  --shadow-alpha: 70%;
}
```

- Nenhuma paleta tem valor próprio de sombra. `shadowColor` e `shadowOpacity` saem de `palettes.ts`, com o código que só existia para eles.
- Princípio: código conciso, sem criar cores novas por paleta.
- Em aberto na aplicação: a sombra do cartão de ação (`--action-shadow-color`, hoje separada) e o tema Personalizado de Minha Conta, que hoje deixa escolher a cor da sombra.
- Sombra do cartão de ação (decisão 17/11): a sombra padrão acima é a **base** do cartão de ação. Os estados trocam a cor: atrasado (cor do erro) e visualização com cor de fase (cor da fase). Aplicar junto com neutros e semânticas, numa única implementação.
