# DS04 — Inventário e proposta de microinterações

**Data** — 06/11/2026
**Ticket** — [DS04](../../.scratch/design-system-audit/issues/04-microinteractions.md), vinculado ao [DS01](../../.scratch/design-system-audit/issues/01-audit-visual-deviations.md)
**Escopo** — Investigação estática do código em `app/` e de `dist/` (build de 05/11). Nenhum código de aplicação foi alterado. Nenhuma verificação em navegador foi feita; os comportamentos abaixo são inferidos do código e precisam ser confirmados no DOM antes de qualquer remoção.

## 1. Resumo

- A interface tem pouca convenção de movimento. Há cerca de 139 ocorrências de classes `transition-*`, `duration-*`, `animate-*` e `ease-*` em 69 arquivos, sem tokens de duração ou curva.
- Não há nenhuma biblioteca de movimento em `package.json` e nenhuma regra `motion-reduce:`, `motion-safe:` ou `prefers-reduced-motion` em `app/` (a única referência é o `scrollIntoView` da galeria `/ui`, em `app/routes/ui.tsx:569` e `:780`). Movimento não respeita a preferência do sistema.
- Nova Hora (`app/components/features/bulk/BulkDateTimeDialog.tsx`) usa `transition-all duration-200` com `max-height` e `padding` animados. Funciona, mas anima propriedades de layout e não tem versão reduzida.
- Os overlays do Prism (`dialog`, `popover`, `select`, `combobox`, `dropdown-menu`) declaram `data-entering:animate-in`, `fade-in-0`, `zoom-in-95`, `animate-out` e `slide-in-from-*`. Essas classes não são definidas em lugar nenhum do repositório: `tw-animate-css` e `tailwindcss-animate` não estão em `package.json` nem em `node_modules`, `app/tailwind.css` não as importa, e o CSS compilado em `dist/assets/index-BSb75UqZ.css` não contém `.animate-in`, `.zoom-in-95`, `.fade-in-0`, `.animate-out` nem `.animate-accordion-down`. Na prática, esses overlays não têm animação de entrada ou saída.
- `app/tailwind.css:668-681` declara animações para `[data-slot="dialog-content"][data-state="open"]` (1000 ms) e `[data-state="closed"]` (500 ms). Nenhum componente Prism define `data-state` nesses elementos, então é provável que a regra esteja inativa. Confirmar no DOM antes de remover.
- Padrão de referência já existente e funcional: `app/components/prism/sheet.tsx:48` e `:76` usam `transition duration-200 ease-in-out data-entering:opacity-0 data-exiting:opacity-0` e `translate` por lado. Esse é o modelo a seguir para overlays, porque usa o estado do React Aria em vez de classes inexistentes.

## 2. Inventário

### 2.1 Nova Hora (Alterar Data e Hora)

Arquivo: `app/components/features/bulk/BulkDateTimeDialog.tsx`.

| Linha | Elemento | Comportamento atual |
|---|---|---|
| 101-108 | Bloco do calendário (`Mudar Data`) | `overflow-hidden transition-all duration-200`. Aberto: `max-h-96 px-4 py-4 opacity-100`. Fechado: `pointer-events-none max-h-0 opacity-0`. `inert={!changeDate}` em 102. |
| 140-147 | Bloco `Nova hora` (`Mudar Hora`) | Mesmo padrão. Aberto: `max-h-24 p-4 opacity-100`. Fechado: `pointer-events-none max-h-0 opacity-0`. `inert={!changeTime}` em 141. |
| 93-99, 132-138 | Checkboxes `Mudar Data` / `Mudar Hora` | Sem transição própria. Usam `PrismCheckbox` (`app/components/prism/checkbox.tsx:26`, `transition-all`). |
| 116-117 | `PrismDialog` | `DialogFrame` centraliza o diálogo (`app/components/prism/dialog.tsx:116-118`, `items-center`). Ao expandir, o cabeçalho sobe e o rodapé desce. |

Leitura do comportamento:

- Ao marcar ou desmarcar um checkbox, o bloco anima altura, padding e opacidade em 200 ms. O foco permanece no checkbox, e o conteúdo oculto fica `inert`, então não recebe foco por Tab. Esse comportamento de teclado está correto e deve ser preservado.
- `transition-all` anima também `padding`. Como o estado fechado remove `p-4`, o bloco passa de 0 a 32 px de padding junto com a altura. Isso não causa problema visual relevante, mas torna a animação mais cara e menos previsível.
- `max-h-96` e `max-h-24` são limites, não alturas reais. Quando o conteúdo é menor que o limite, a animação começa "atrasada": a altura visível só muda depois de o limite ser alcançado. No bloco de hora (conteúdo de cerca de 72 px com `max-h-24` de 96 px), ao fechar a altura visível só começa a diminuir quando o limite cai abaixo do conteúdo, um atraso pequeno mas previsível. Essa é uma razão para trocar o padrão, não um defeito grave.
- Não há `motion-reduce:transition-none`. Com a preferência de movimento reduzido ativada no sistema, a expansão continua animada.
- A entrada do próprio diálogo não tem animação, porque o overlay e o conteúdo Prism não recebem classes de animação efetivas (ver 2.2). Isso é aceitável para um diálogo `xs` e não precisa mudar.

### 2.2 Overlays e superfícies flutuantes (Prism)

| Arquivo | Linha | Situação |
|---|---|---|
| `app/components/prism/dialog.tsx` | 48-49 | Overlay: `data-entering:animate-in data-entering:fade-in-0 data-exiting:animate-out ... duration-100`. Classes sem definição. |
| `app/components/prism/dialog.tsx` | 124-125 | Conteúdo: `zoom-in-95`, `zoom-out-95`, `duration-100`. Classes sem definição. |
| `app/components/prism/popover.tsx` | 76 | `slide-in-from-*-2`, `zoom-*`, `duration-100`. Sem definição. |
| `app/components/prism/select.tsx` | 139 | Mesmo padrão, sem definição. |
| `app/components/prism/combobox.tsx` | 141 | Mesmo padrão, sem definição. |
| `app/components/prism/dropdown-menu.tsx` | 46 e 189 | Mesmo padrão, sem definição. |
| `app/components/prism/sheet.tsx` | 48, 76 | Funcional: `transition duration-200 ease-in-out data-entering:opacity-0 ... translate-*`. Referência. |
| `app/components/prism/accordion.tsx` | 86 | `data-open:animate-accordion-down data-closed:animate-accordion-up` (sem keyframes definidos) e `transition-[height]`. A altura é controlada por `--disclosure-panel-height`, então `transition-[height]` funciona, mas usa a duração padrão do Tailwind v4 (150 ms, `cubic-bezier(0.4, 0, 0.2, 1)`). |

Efeito: entrada e saída de overlays é instantânea ou depende só de `duration-*` sem propriedade transicionada (sem efeito).

Atenção ao React Aria: `data-entering` e `data-exiting` só retardam a desmontagem quando há transição ou animação CSS que o React Aria consegue detectar. Ao adicionar transições reais, a saída passa a esperar o fim delas. Duração alta aqui atrasa o fechamento percebido.

### 2.3 Feedback de controles e estados

| Arquivo | Linha | Classe | Observação |
|---|---|---|---|
| `app/components/prism/button.tsx` | 23 | `transition-all`, `active:not-aria-[haspopup]:translate-y-px`, `focus-visible:ring-3` | Feedback de pressionar já existe. `transition-all` pode ser estreitado. |
| `app/components/prism/checkbox.tsx` | 11, 26 | `transition-colors`, `transition-all` | Estado selecionado com cor e borda. Estreitar. |
| `app/components/prism/radio-group.tsx` | 10, 25 | `transition-colors`, `transition-all` | Mesmo caso. |
| `app/components/prism/tabs.tsx` | 29, 34, 36 | `transition-colors` | Adequado. |
| `app/components/prism/input.tsx` | 9 | `transition-[color,box-shadow] duration-200` | Bom padrão de foco. Referência. |
| `app/components/prism/time-field.tsx` | 14 | `transition-[color,box-shadow] duration-200` | Mesmo padrão, usado na Nova hora. |
| `app/components/prism/select.tsx` | 84 | `transition-[color,box-shadow]` | Adequado. |
| `app/components/prism/toggle.tsx` | 36 | `transition-colors` | Adequado. |
| `app/components/features/RichTextEditor.tsx` | 678 | `transition-all duration-200` | Anima o contêiner da barra de edição; cuidado com deslocamento de layout ao trocar a barra compacta. |
| `app/components/features/ActionItem.tsx` | 146-147, 192-193, 245 | `transition-all duration-500` | Cartão de ação anima tudo por 500 ms. Estreitar. |
| `app/components/features/ActionContainer.tsx` | 128 | `transition-all duration-300` | Contêiner de ação; estreitar. |
| `app/components/features/ActionVariants/ActionLineVariant.tsx` | 62, 88 | `transition duration-500 group-hover/action:-translate-x-3 group-hover/action:opacity-0` | Ações revelam controles só por hover. Não há `group-focus-within`, então o teclado não revela o mesmo conteúdo. Ver seção 4. |
| `app/components/features/CalendarDayCell.tsx` | 91 | `opacity-0 transition duration-300 group-hover/column:opacity-100 focus-within:opacity-100` | Bom: hover e `focus-within`. Referência para o padrão de revelação. |
| `app/components/features/Content.tsx` | 50 | `transition-opacity duration-500 group-hover/action:opacity-80` | Hover-only; decorativo. |
| `app/components/features/action-drawer/EssentialsTab.tsx` | 269 | `size-4 transition-transform` | Seta de expansão. Adequado. |
| `app/components/features/action-drawer/EssentialsTab.tsx` | 224, 422 | `transition-colors` | Adequado. |
| `app/components/features/action-drawer/ActionFormDrawer.tsx` | 1508 | `transition-opacity` | Adequado. |
| `app/components/features/DnD.tsx` | 77-91 | `transition` do dnd-kit | Movimento de arraste. Manter; não alterar sem teste de arraste. |
| `app/components/uzzina/UAIAllowanceMeter.tsx` | 12, 29 | `transition-colors`, `transition-all duration-500` (barra) | Barra de cota; estreitar para `width`. |
| `app/components/uzzina/UPhaseIcon.tsx` | 31, 44, 57, 82, 90 | `duration-500`, `animate-pop`, `transition-all duration-500` | `animate-pop` (500 ms, overshoot) é decorativo e não tem `motion-reduce`. |
| `app/components/uzzina/UAvatarSelector.tsx` | — | `transition-all duration-500` | Estreitar. |
| `app/components/uzzina/UPreferenceSwitch.tsx` | — | `duration-200 transition-all` | Estreitar. |
| `app/components/uzzina/UPaletteEditor.tsx` | — | `transition` (3 ocorrências) | Revisar. |

### 2.4 Carregamento e movimento contínuo

| Arquivo | Linha | Classe | Observação |
|---|---|---|---|
| `app/components/prism/skeleton.tsx` | 21 | `animate-pulse` | Skeleton. Sem `motion-reduce`. |
| `app/components/uzzina/ULoader.tsx` | 44 | `animate-spin` | Indicador de carregamento. Deve continuar, mas com alternativa textual ou estática em movimento reduzido (ver seção 4). |
| `app/components/features/action-drawer/InstagramTab.tsx` | 112 | `animate-pulse` no texto "Gerando legenda com IA..." | Texto pulsando. Sem `motion-reduce`. |
| `app/routes/app.tsx` | 263-264 | `animate-spin` / `animate-pulse` | Bloco comentado. Ignorar. |
| `app/routes/app/profile.tsx`, `app/routes/app/admin/*`, `app/routes/dash*.tsx` | — | `animate-pulse` | Skeletons de rota. Sem `motion-reduce`. |
| `app/tailwind.css` | 607-608, 618-620 | `animate-spin-gradient` | Gradiente animado do botão de IA com `@property --gradient-angle`. Decorativo; deve parar em movimento reduzido. |
| `app/tailwind.css` | 683-695 | `animate-pop` (500 ms, `cubic-bezier(0.34, 1.56, 0.64, 1)`) | Decorativo. Usado em `UPhaseIcon.tsx:44,57` e `app/routes/forgot-password.tsx`. |
| `app/tailwind.css` | 702-715 | `scale-down` (1 s, `scaledown`) | Localizar uso antes de decidir. |

### 2.5 Tokens e definições globais

- `app/tailwind.css` não define nenhuma variável `--duration-*`, `--ease-*` ou `--motion-*`. As curvas aparecem como valores literais: `cubic-bezier(0.16, 1, 0.3, 1)` nas animações de diálogo (linhas 670-680), `cubic-bezier(0.34, 1.56, 0.64, 1)` em `animate-pop` (linha 695), `cubic-bezier(0, 0.65, 0.13, 1)` em `scale-down` (linha 715).
- Durações usadas no código: 100, 150, 200, 300, 500 e 1000 ms, além de `duration-[3000ms]` em `app/routes/index.tsx` (página de entrada). Não há escala.
- Nenhum `@media (prefers-reduced-motion)` em `app/tailwind.css`, `index.html` ou componentes.

## 3. Proposta

### 3.1 Tokens (recomendação)

Adicionar a `app/tailwind.css`, dentro de um bloco `@theme` (Tailwind v4 gera `duration-motion-*` e `ease-motion-*` automaticamente):

```css
@theme {
  --duration-motion-fast: 150ms;
  --duration-motion-base: 200ms;
  --duration-motion-slow: 300ms;
  --ease-motion-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-motion-exit: cubic-bezier(0.4, 0, 1, 1);
}
```

Regras de uso:

| Uso | Duração | Curva | Exemplo |
|---|---|---|---|
| Feedback de controle (cor, borda, sombra de foco) | `motion-fast` (150 ms) | `motion-standard` | Botões, checkboxes, radios |
| Expansão ou revelação de conteúdo | `motion-base` (200 ms) entrar; `motion-fast` (150 ms) sair | entrar `motion-standard`; sair `motion-exit` | Nova hora, calendário, disclosure |
| Overlay (diálogo, popover, select) | `motion-fast` (150 ms) | entrar `motion-standard`; sair `motion-exit` | Prism dialog, popover, select, combobox |
| Decorativo (gradiente, pop, pulso) | Sem novo token; manter a duração atual | — | `animate-pop`, `animate-spin-gradient` |

Nada acima passa de 300 ms. Movimento com mais de 300 ms fica reservado a animações decorativas já existentes que serão revistas.

### 3.2 Nova Hora (exemplo de aplicação)

Trocar `max-height` por `grid-template-rows` (0fr para 1fr), que anima a altura real do conteúdo sem depender de limite:

```tsx
<div
  inert={!changeTime}
  className={cn(
    "grid transition-[grid-template-rows,opacity] duration-motion-base ease-motion-standard motion-reduce:transition-none",
    changeTime ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 duration-motion-fast ease-motion-exit pointer-events-none",
  )}
>
  <div className="min-h-0 overflow-hidden">
    <div className="p-4"> {/* conteúdo atual */} </div>
  </div>
</div>
```

Pontos de decisão:

- Abrir: 200 ms, curva de entrada. Fechar: 150 ms, curva de saída. Fechar mais rápido evita a sensação de atraso.
- O padding passa para o conteúdo interno, para que a animação não dependa de transição de padding.
- `motion-reduce:transition-none` mantém a troca de estado (aberto/fechado) imediata, sem animação de altura ou opacidade.
- O teclado não muda: `inert` continua impedindo foco no conteúdo fechado, e o foco não é movido ao expandir. O checkbox mantém o foco.
- Estabilidade de layout: a altura do diálogo muda durante a expansão, e como o diálogo está centralizado, cabeçalho e rodapé se movem. Esse deslocamento é o próprio efeito da expansão e é aceito. Como medida adicional, o botão `Aplicar` não deve ser pressionado durante a transição; isso não exige mudança de código.
- Verificar em Safari: `grid-template-rows` com transição depende de suporte nos navegadores do proprietário. Se não for confiável, a alternativa é manter `max-h` com `max-h-96`/`max-h-24` ajustados à altura real medida, sem atraso visível.

### 3.3 Overlays do Prism

1. Remover as classes inexistentes (`animate-in`, `animate-out`, `fade-in-0`, `zoom-*`, `slide-in-from-*`, `animate-accordion-*`) de `dialog.tsx`, `popover.tsx`, `select.tsx`, `combobox.tsx`, `dropdown-menu.tsx` e `accordion.tsx`, substituindo por um padrão igual ao de `sheet.tsx`:

   ```
   transition duration-motion-fast ease-motion-standard
   data-entering:opacity-0 data-entering:scale-95
   data-exiting:opacity-0 data-exiting:scale-95 data-exiting:ease-motion-exit
   motion-reduce:transition-none motion-reduce:data-entering:scale-100 motion-reduce:data-exiting:scale-100
   ```

   O React Aria espera o fim da transição para desmontar na saída, então o fechamento continua correto.

2. Remover as regras `[data-slot="dialog-content"][data-state=...]` e os keyframes `dialog-in`/`dialog-out`/`overlay-in`/`overlay-out` (`app/tailwind.css:629-681`) somente depois de confirmar no DOM que `data-state` não aparece nesses elementos. Se aparecer, a duração de 1000 ms é alta demais para o padrão e deve ser reduzida para `motion-base`.

3. Não adicionar `tw-animate-css` nem outra dependência. Os três padrões acima resolvem o caso com CSS nativo e o estado do React Aria. Adicionar biblioteca exige necessidade concreta (AGENTS.md, seção 2).

### 3.4 Feedback e estados

- Estreitar `transition-all` para as propriedades realmente alteradas em `button.tsx:23`, `checkbox.tsx:26`, `radio-group.tsx:25`, `ActionItem.tsx:146-147` e `ActionContainer.tsx:128`. Exemplo para botões: `transition-[color,background-color,border-color,box-shadow,transform] duration-motion-fast ease-motion-standard`. Ganho: menos propriedades animadas e nenhuma animação acidental de layout.
- Revelação por hover (`ActionLineVariant.tsx:62,88`): acrescentar `group-focus-within/action:` com o mesmo estado para que o teclado revele os mesmos controles, seguindo `CalendarDayCell.tsx:91`. Isso é sobre teclado, não sobre movimento, e deve ser feito antes de reduzir a duração de 500 ms.
- Duração de 500 ms em cartões e barras (`ActionItem.tsx:147`, `UAIAllowanceMeter.tsx:29`, `UPhaseIcon.tsx`): reduzir para `motion-base` (200 ms). Mudança de cor ou progresso não precisa de meio segundo.

### 3.5 Movimento contínuo e decorativo

- `animate-pulse` (`skeleton.tsx:21`, `InstagramTab.tsx:112`, rotas de admin/perfil/dash): adicionar `motion-reduce:animate-none`. O skeleton continua visível como bloco estático.
- `animate-spin` (`ULoader.tsx:44`): manter a rotação em movimento normal. Em movimento reduzido, trocar por `motion-reduce:animate-none` e manter o texto de carregamento ou o rótulo do estado ao lado. O carregamento continua indicado.
- `animate-spin-gradient` e `animate-pop`: adicionar `motion-reduce:animate-none` nas utilidades em `app/tailwind.css:607-608` e `:694-695`.
- Não usar uma regra global `*{transition-duration:1ms!important}` sob `prefers-reduced-motion`. Ela afetaria o carregamento e o movimento de arraste (dnd-kit), e cria dependência oculta. Preferir `motion-reduce:` por componente.

## 4. Movimento reduzido e teclado

- Movimento reduzido: `motion-reduce:transition-none` e `motion-reduce:animate-none` em cada padrão acima. Estados continuam mudando (abrir, fechar, selecionar); só o trajeto é suprimido.
- Teclado: nenhum movimento pode depender de hover para revelar conteúdo necessário. Revelações como `ActionLineVariant` devem ter `focus-within`. `inert` em conteúdo fechado deve permanecer.
- Foco visível: não aplicar movimento ao anel de foco. Ele deve aparecer imediatamente, como já está em `button.tsx:23` e `time-field.tsx:14`.
- Estabilidade de layout: nenhuma microinteração deve deslocar elementos vizinhos sem ação do usuário. Expansões são a exceção aceita, e apenas quando o usuário as pede (checkbox).

## 5. Padrões a compartilhar

Recomendação, em ordem de prioridade:

1. Tokens de duração e curva em `app/tailwind.css` (seção 3.1). Baixo risco, sem alteração visual além da duração.
2. Padrão de overlay de `sheet.tsx` aplicado a dialog, popover, select, combobox e dropdown (seção 3.3). Corrige um problema existente: classes sem definição.
3. Padrão de disclosure com `grid-template-rows` (seção 3.2). Não criar componente agora. Dois consumidores (duas seções de Nova Hora) não justificam abstração; reavaliar quando houver um terceiro, e nesse caso considerar `PrismDisclosure`.
4. Regra `motion-reduce:` por componente nas utilidades já existentes (seção 3.5).

Não recomendado: biblioteca de movimento, animação de entrada de página, movimento em listas de dados ou no Kanban.

## 6. Critérios de aceite

Para a implementação posterior (não executada nesta entrega):

- Nova Hora abre e fecha em até 200 ms e 150 ms, com a altura real do conteúdo, sem atraso perceptível ao fechar.
- Checkbox alterna a seção com Space e Enter; foco permanece no checkbox; conteúdo fechado não recebe Tab (`inert`).
- Com movimento reduzido ativado no sistema (macOS: Ajustes > Acessibilidade > Monitor > Reduzir movimento), abrir e fechar não animam altura nem opacidade, e o estado final é o mesmo.
- Nenhuma duração de transição de interface acima de 300 ms, exceto animações decorativas já listadas e revisadas.
- Overlays Prism: entrada e saída visíveis com `motion-fast`, sem classes sem definição no CSS compilado (verificar `dist` após o build).
- `transition-all` removido de botões, checkboxes, radios e cartões de ação, substituído por lista explícita de propriedades.
- Revelações por hover em ações também funcionam com `focus-within` (teclado).
- Skeletons, pulsos e gradientes param em movimento reduzido.

Validação: o proprietário faz o roteiro de Nova Hora e de um diálogo ou select (mouse, teclado e movimento reduzido). O build é necessário antes de publicar, conforme AGENTS.md. Não criar testes automatizados por rotina; apenas se houver necessidade concreta ligada ao risco.

## 7. Limites desta investigação

- Análise estática do código e do CSS compilado de 05/11. Não houve verificação no navegador, no DOM real nem no Safari.
- A afirmação de que as classes `animate-in`, `zoom-in-95` etc. estão inativas se baseia na ausência em `package.json`, em `node_modules`, em `app/tailwind.css` e no `dist`. Confirmar no DOM em execução antes de remover.
- A inatividade das regras `[data-slot="dialog-content"][data-state]` é inferida da ausência de `data-state` no código Prism.
- O suporte de `grid-template-rows` com transição no Safari precisa ser confirmado.
- Contagens de classes são aproximadas (expressão regular sobre o código).
