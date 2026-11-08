# DS06 — Estudar efeito de luz e sombra pela paleta

**Status:** encerrado com aceite do proprietário em 08/11/2026.

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Terra, para comparar as variantes de ação e o resultado visual.
- **Anthropic** — Claude Sonnet 5.5, para mapear tokens, consumidores e impacto em outros componentes.
- **Google** — Gemini 3.8 Flash, para inventariar efeitos de luz e sombra e organizar os casos de conferência visual.

**Entrega.** Estudo de um tratamento de relevo visual por paleta. Nos cartões de ação, a sombra e o realce branco da borda superior simulam luz e profundidade e devem responder à mesma opção. Ao desligar o efeito, remover a sombra e deixar a borda superior transparente, preservando sua espessura e a geometria do cartão. Entregar inventário, comparação visual e recomendação para decisão do proprietário. Escopo de investigação.

**Bloqueado por.** Nenhum ticket.

## O que investigar

- [x] Mapear sombras e realces da borda superior das ações por variante, contexto e estado. Incluir calendário, Kanban, Feed, Sprint e demais consumidores encontrados, em temas claro e escuro, com hover e arraste.
- [x] Propor onde declarar a opção na paleta, como propagá-la às variantes e qual valor usar para paletas existentes e personalizadas. Comparar o relevo atual com a versão plana, incluindo variações de cor da borda em claro, escuro e estados de prioridade.
- [x] Inventariar outros elementos com sombra ou realce que simule luz. Classificar quais deveriam seguir a mesma opção, quais precisam de controle separado e quais devem conservar a sombra para distinguir camadas. Conferir cartões, AppBar, menus, popovers e diálogos, quando aplicável.
- [x] Distinguir sombra decorativa de anéis de foco, seleção e outros indicadores de estado. Mostrar como preservar esses sinais e a separação visual das superfícies.

---

## Relatório de Investigação Técnica — 08/11/2026

### 1. Mapeamento de sombras e realces nos cartões de ação

O efeito de profundidade característico da UZZINA é aplicado diretamente no contêiner raiz de cada cartão de ação em `ActionItem.tsx` (linhas 140–178):

```tsx
let baseStyles = `
  text-foreground
  bg-action
  transition-all
  duration-500
  shadow-sm
  shadow-black/10
  border-t
  border-white
  z-0
  ring ring-foreground/3
  focus-within:outline-1
  focus-within:outline-ring/45
  focus-within:ring-4
  focus-within:ring-ring/30
  hover:z-10
  hover:shadow-lg
  hover:bg-action-hover
  dark:border-white/10
  dark:shadow-black/20
`;
```

#### Elementos do relevo:
1. **Luz superior (realce zenital):** `border-t border-white` (Light) e `dark:border-white/10` (Dark). Simula o reflexo de luz na aresta chanfrada superior do cartão.
2. **Sombra de profundidade (elevação de repouso):** `shadow-sm shadow-black/10` (Light) e `dark:shadow-black/20` (Dark).
3. **Sombra de interação (hover):** `hover:shadow-lg` combinado com elevação de camada `hover:z-10` e clareamento `hover:bg-action-hover`.

#### Variações por variante, estado e contexto:
- **Variantes de visualização:**
  - `block` (blocos padrão usados no Kanban, Feed e grade do Calendário)
  - `line` (linhas compactas da lista de Sprint na Home e Calendário)
  - `content` (cartões com pré-visualização de imagem/Instagram)
  *Todas compartilham exatamente a mesma base de relevo de `ActionItem.tsx`.*
- **Estado de Atraso (`isLate`):**
  - O realce superior muda para `border-t-white/50`, sobre fundo de erro sutil (`bg-late text-late-foreground hover:bg-late-hover`) com anel `ring ring-late-foreground`.
- **Estado de Sprint (`isSprint`):**
  - Mantém a sombra e o realce superior e adiciona `ring-2 ring-primary`.
- **Estado de Edição inline (`isEditing`):**
  - Eleva o cartão no empilhamento (`z-100`), mantendo o foco sem alterar as sombras de base.
- **Estado de Arraste (DnD no Calendário, Kanban e Sprint):**
  - Ao arrastar, o item original permanece no fluxo com opacidade esmaecida (`opacity-20`).
  - O clone em trânsito dentro do `DragOverlay` herda todas as classes do `ActionItem` e flutua com cursor `grabbing`, preservando a sombra e o realce superior durante o deslocamento.
- **Consumidor adicional:**
  - `UAdminItemCard.tsx` (cartões de clientes, parceiros e usuários em `/app/admin/*`): utiliza exatamente o mesmo padrão (`border-t border-white dark:border-white/20 shadow-xs hover:shadow-lg ring ring-black/5`).

---

### 2. Proposta de arquitetura de tokens e propagação na paleta

#### A. Onde declarar a opção na paleta
A opção de relevo é modelada como uma propriedade booleana de estilo de superfície na definição da paleta (`app/lib/palettes.ts`):

```ts
export type Palette = {
  id: string;
  label: string;
  relief?: boolean; // true = relevo clássico (padrão); false = estilo plano (flat)
  light: PaletteModeVars;
  dark: PaletteModeVars;
};
```

- **Paleta padrão (Ônix):** mantém `relief: true` (ou omitido, default ativo), com relevo tátil clássico.
- **Paleta Carbono (`carbon`):** configurada como `relief: false` (estilo plano moderno, sem sombra e com borda superior transparente).
- **Demais paletas existentes:** mantêm `relief: true` por padrão para retrocompatibilidade visual.

#### B. Propagação via variáveis CSS unificadas (`app/lib/palette-vars.ts` e `app/tailwind.css`)
Em vez de condicionar classes utilitárias no JSX em múltiplos componentes, a propagação ocorre de forma unificada no CSS:

```css
/* Valores base no app/tailwind.css */
:root {
  --action-top-border: rgba(255, 255, 255, 1);
  --action-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
  --action-hover-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
}

.dark {
  --action-top-border: rgba(255, 255, 255, 0.1);
  --action-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
  --action-hover-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3);
}

@theme {
  --color-action-top-border: var(--action-top-border);
  --shadow-action: var(--action-shadow);
  --shadow-action-hover: var(--action-hover-shadow);
}
```

Na função `applyPaletteVars` (`app/lib/palette-vars.ts`):
```ts
if (palette.relief === false) {
  root.style.setProperty("--action-top-border", "transparent");
  root.style.setProperty("--action-shadow", "none");
  root.style.setProperty("--action-hover-shadow", "none");
} else {
  root.style.removeProperty("--action-top-border");
  root.style.removeProperty("--action-shadow");
  root.style.removeProperty("--action-hover-shadow");
}
```

#### C. Unificação de `ActionItem.tsx` e `UAdminItemCard.tsx`
Tanto `ActionItem.tsx` quanto `UAdminItemCard.tsx` (e a réplica do design system em `TokensFocusSection.tsx`) passam a compartilhar exatamente as mesmas classes unificadas:
- Borda superior: `border-t border-action-top-border`
- Sombra de repouso: `shadow-action`
- Sombra de hover: `hover:shadow-action-hover`

Elimina-se a divergência atual onde `UAdminItemCard` usava `dark:border-white/20 dark:shadow-black/80` enquanto `ActionItem` usava `dark:border-white/10 dark:shadow-black/20`. Ambos passam a ser controlados de forma centralizada pelo tema.

#### D. Preservação milimétrica da geometria
- O ticket exige expressamente: *"Ao desligar o efeito, remover a sombra e deixar a borda superior transparente, preservando sua espessura e a geometria do cartão."*
- Ao manter `border-t border-action-top-border` (com `--action-top-border: transparent` no tema plano), o contêiner preserva exatamente a sua espessura física de 1px. Não ocorre **nenhum salto de layout (layout shift)** e a altura do cartão no grid do calendário, colunas do Kanban e listas verticais se mantém 100% inalterada entre paletas com relevo e paletas planas.

---

### 3. Inventário geral de sombras e classificação de superfícies

Nem todas as sombras do sistema representam relevo de cartão; a maioria desempenha papel semântico de elevação de camadas.

| Categoria | Componentes | Comportamento na paleta plana | Motivo da decisão |
| :--- | :--- | :--- | :--- |
| **A. Cartões de Ação e Entidades** | `ActionItem.tsx`, `UAdminItemCard.tsx`, réplica `/ui` | **Desligar sombra e tornar borda superior transparente** | São superfícies de conteúdo no plano de trabalho; desligar o relevo atende ao estilo plano desejado. |
| **B. Camadas Flutuantes (Overlays)** | `PrismDialog`, `PrismPopover`, `PrismDropdownMenu`, `PrismSelect`, `PrismCombobox`, `PrismSheet`, `AppBar`, Tiptap `BubbleMenu` | **CONSERVAR sombra (`shadow-lg`)** | Separação no eixo Z. Popovers e Diálogos precisam da sombra de projeção para se destacar do conteúdo da página, garantindo contraste e hierarquia visual. |
| **C. Notificações Flutuantes** | `PrismSonner` (Toaster) | **CONSERVAR sombra** | Toasts flutuam no canto da viewport e dependem da sombra para legibilidade imediata sobre qualquer cor de tela. |
| **D. Controles Micro-mecânicos** | Thumbs de `PrismColorArea`, `PrismColorSlider`, `PrismSlider` | **CONSERVAR sombra pontual** | Indicadores interativos arrastáveis que precisam de contraste pontual ao sobrepor gradientes de cores arbitrários. |

---

### 4. Distinção entre relevo decorativo e anéis de estado

É essencial garantir que remover o relevo não enfraqueça o contraste funcional nem a acessibilidade:

1. **Anel de separação base:**
   - `ring ring-foreground/3` (no `ActionItem`) e `ring ring-black/5` (no `UAdminItemCard`).
   - Este anel sutil não é sombra de projeção: ele define o limite do cartão sobre o fundo da página quando a luminosidade do cartão e da tela são muito próximas. No estilo plano, ele permanece ativo.
2. **Foco por teclado e clique interno:**
   - `focus-within:outline-1 focus-within:outline-ring/45 focus-within:ring-4 focus-within:ring-ring/30`.
   - Utiliza exclusivamente anéis de foco do design system Prism. Não tem relação com `shadow-sm` e permanece 100% idêntico.
3. **Indicadores de estado (Sprint e Atraso):**
   - Sprint: `ring-2 ring-primary`.
   - Atrasada: `ring ring-late-foreground` e `bg-late text-late-foreground`.
   - Mesmo com a borda superior transparente (`border-t-transparent`), o cartão atrasado no modo plano continua imediatamente reconhecível pela sua cor de fundo salmão/avermelhada e pelo contorno de alerta.

---

### 5. Comparação visual

| Estado do Cartão | Modo com Relevo (Atual) | Modo Plano (Proposto pelo DS06) |
| :--- | :--- | :--- |
| **Repouso (Light)** | Borda superior branca nítida (`1px #FFF`) + Sombra suave inferior (`shadow-sm black/10`) | Borda superior transparente (`1px transparent`) + Sem sombra (`shadow-none`) |
| **Repouso (Dark)** | Borda superior branca sutil (`1px rgba(255,255,255,0.1)`) + Sombra escura (`shadow-sm black/20`) | Borda superior transparente (`1px transparent`) + Sem sombra (`shadow-none`) |
| **Hover** | Cartão se eleva (`hover:shadow-lg`) e clareia (`hover:bg-action-hover`) | Cartão permanece plano (`hover:shadow-none`) e sinaliza apenas por cor (`hover:bg-action-hover`) |
| **Atrasado** | Borda superior translúcida (`border-t-white/50`) + fundo de erro | Borda superior transparente (`border-t-transparent`) + fundo de erro + anel de alerta |
| **Arraste (DnD)** | Clone no `DragOverlay` flutua com sombra e borda branca | Clone no `DragOverlay` flutua plano sem sombra, acompanhado do cursor `grabbing` |
| **Dimensões e alinhamento** | Altura do cartão: exatamente a mesma | Altura do cartão: **idêntica ao pixel** (1px preservado pela borda transparente) |

---

### 6. Decisões aprovadas pelo proprietário (08/11/2026)

1. **Unificação de variáveis nos cartões:**
   `ActionItem.tsx`, `UAdminItemCard.tsx` e a galeria `/ui` passam a compartilhar as mesmas variáveis CSS (`--action-top-border`, `--action-shadow`, `--action-hover-shadow`), eliminando regras manuais soltas de sombra e borda.
2. **Propriedade na paleta e caso Carbono (`carbon`):**
   Adicionar a propriedade `relief?: boolean` no tipo de paleta (`app/lib/palettes.ts`). A paleta **Carbono (`carbon`)** é definida como **`relief: false`** (estilo plano, sem sombra e com borda superior transparente), enquanto **Ônix** e as demais mantêm `relief: true` (relevo clássico ativado).
3. **Propagação centralizada em `palette-vars.ts`:**
   Ao trocar de paleta ou visualizar temas, se `relief === false`, as variáveis assumem `transparent` e `none`; caso contrário, removem as sobrescritas restaurando os valores de relevo.
4. **Preservação de superfícies flutuantes:**
   Diálogos (`PrismDialog`), popovers (`PrismPopover`), menus (`PrismDropdownMenu`), seletores (`PrismSelect`, `PrismCombobox`) e a barra inferior (`AppBar`) mantêm suas sombras funcionais (`shadow-lg`) intactas, garantindo a separação no eixo Z.

---

### 7. Execução — 08/11/2026

**Arquivos alterados:**
- `app/lib/palettes.ts`: adicionado `relief: true` em `default` (Ônix) e `relief: false` em `carbon` (Carbono).
- `app/lib/palette-vars.ts`: tipagem `PaletteVars` com `relief?: boolean` e aplicação das sobrescritas `--action-top-border-override`, `--late-top-border-override`, `--action-shadow-override` e `--action-hover-shadow-override` em `applyPaletteVars`.
- `app/tailwind.css`: criação dos tokens CSS e registro no `@theme` (`--color-action-top-border`, `--color-late-top-border`, `--shadow-action`, `--shadow-action-hover`).
- `app/components/features/ActionItem.tsx`: unificação para `border-action-top-border`, `shadow-action`, `hover:shadow-action-hover` e `border-t-late-top-border`.
- `app/components/uzzina/UAdminItemCard.tsx`: unificação para `border-action-top-border`, `shadow-action` e `hover:shadow-action-hover`.
- `app/components/ui-sections/TokensFocusSection.tsx`: réplica de `ActionItem` atualizada para as classes unificadas.
- `tests/palette-vars.test.ts`: testes adicionados para comutação de `relief` entre Carbono e Ônix (3 PASS).

**Verificação:**
- `tsc --noEmit` sem erros.
- `bun test tests/palette-vars.test.ts` (3 pass).
- `bun run test:serverless` (9 pass).
- `bun run build` concluído com sucesso.

**Roteiro de validação para o proprietário:**
1. Abra o app em `http://localhost:5173/app` e observe os cartões de ação (ex.: no Calendário, Kanban ou Hoje): com o tema padrão (Ônix), o cartão exibe a linha branca de 1px no topo e a sombra suave embaixo.
2. Abra o menu de Minha Conta (`/app/profile`) ou o seletor de paletas no cabeçalho e selecione a paleta **Carbono**:
   - Os cartões de ação e os cartões de administração (em Clientes/Parceiros/Usuários) ficam no estilo plano: a linha do topo fica transparente e as sombras de repouso e hover somem, mantendo a geometria intacta.
3. Abra um diálogo (ex.: modal de filtro ou nova ação), um menu ou clique em um seletor: observe que a sombra de elevação da janela flutuante continua presente e destacada.
4. Volte para a paleta **Ônix**: o relevo clássico (brilho superior + sombra) é restaurado imediatamente.
