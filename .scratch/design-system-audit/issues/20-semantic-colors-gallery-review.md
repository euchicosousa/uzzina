# DS20 — Revisar e completar a seção "Cores Semânticas OKLCH" na galeria `/ui`

**Status.** Encerrado com aceite do proprietário em 16/11/2026. Implementado em `app/tailwind.css` e `app/components/ui-sections/TokensColorsSection.tsx`; `tsc --noEmit` limpo e Prettier aplicado. Commit local, sem push.

## O que a pessoa vê hoje

Na galeria `/ui` (aba **Tokens de Design** → **Cores Semânticas**, no topo da página):

1. **Grade de cores incompleta e misturada:** as 18 amostras aparecem numa única grade corrida de 5 colunas, sem separação visual entre grupos (embora o código tenha o campo `group`, ele nunca é exibido na tela). Faltam as cores de texto (`foreground`), as cores base e de texto dos avisos (mostra o fundo de erro e de sucesso, mas não mostra o texto/ícone de erro e de sucesso), as versões de estado (como o hover do cartão de ação `bg-action-hover`, o contorno `ring-action-ring`, a borda superior `border-action-top-border` e o hover do verde forte `bg-success-strong-hover`), além de não explicar quais cores nascem de outras (por exemplo, `card`, `popover`, `input`, `border` e `action` derivadas de `background`; `secondary` derivada de `foreground`; `accent` e `ring` derivadas de `primary`; fundos de aviso misturados sobre `card`).
2. **Títulos colados nos cartões e exemplos fora do padrão do app:** na parte "Aplicação no Mundo Real", o título `"1. Cartões de Ação do Workflow (Relevo, Status e Tipografia Secundária)"` (e os títulos dos itens 2 a 5) fica **sem espaço nenhum** acima dos cartões. Além disso, os cartões exibidos ali são caixas inventadas (com avatar em círculo, linha divisória e botões "Ver detalhes", "Concluir", "Reprogramar", "Excluir") que não existem no app real, e o bloco de feedbacks ainda anuncia no título `"Translucidez a 12%"` (regra antiga, já substituída no DS12 pelos fundos opacos a 7% no claro e 14% no escuro).

## O que foi encontrado no código

### 1. Por que o título está colado nos cartões (0 px de espaço)

Nos 5 blocos de "Aplicação no Mundo Real" (`app/components/ui-sections/TokensColorsSection.tsx`, linhas 320, 399, 429, 527 e 584), cada bloco usa `<div className="space-y-3">` (ou `space-y-4`) tendo um `<span>` como primeiro filho:

```tsx
<div className="space-y-3">
  <span className="text-xs font-bold tracking-wide text-secondary-foreground uppercase">
    1. Cartões de Ação do Workflow (Relevo, Status e Tipografia Secundária)
  </span>
  <div className="grid gap-4 md:grid-cols-2">...</div>
</div>
```

No Tailwind CSS v4, `space-y-*` aplica `margin-block-end` no elemento anterior. Como `<span>` é um elemento inline (`display: inline`), margem vertical não faz efeito nele — deixando literalmente **0 px** entre o título e os cartões abaixo.

### 2. Cores que existem em `app/tailwind.css` e estão ausentes ou soltas na `/ui`

| Grupo sugerido                                         | Já aparece hoje na `/ui`                                                                                                             | Falta mostrar / explicar na `/ui`                                                                                                                                                                                                                                                                                                                                                                   | Como deriva hoje no CSS (`app/tailwind.css`)                                                                                                                                                                                                                      |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Superfícies, texto e neutros**                    | `bg-background`, `bg-card`, `bg-popover`, `bg-input`, `bg-secondary`, `bg-border` (hoje solto em "Marca & Ações")                    | `text-foreground` (texto principal), `text-secondary-foreground` (texto secundário), `bg-overlay` (fundo escurecido de janelas/gaveta)                                                                                                                                                                                                                                                              | `card`, `popover`, `input` e `border` aplicam delta de luminosidade (`--*-l-delta`) sobre `background`; `secondary` (5% claro / 10% escuro) e `secondary-foreground` (65%) misturam `foreground`; `overlay` usa a cor de sombra da paleta (`--shadow-tint`) a 30% |
| **2. Cartão de ação e versões**                        | `bg-action` (hoje solto em "Marca & Ações")                                                                                          | `bg-action-hover` (ao passar o mouse), `ring-action-ring` (contorno do cartão), `border-action-top-border` (borda superior de luz no relevo)                                                                                                                                                                                                                                                        | `action` (+0,02 claro / +0,10 escuro) e `action-hover` (+0,04 claro / +0,20 escuro) derivam de `background`; `action-ring` e sombras usam `--action-shadow-color`                                                                                                 |
| **3. Marca, destaque e foco**                          | `bg-primary`, `bg-accent`, `bg-ring`                                                                                                 | `text-primary-foreground` (texto sobre a cor primária) e indicação do anel de foco `ring-ring/30` + `border-ring/60`                                                                                                                                                                                                                                                                                | `primary` vem da paleta; `accent` deriva de `primary` ($L - 0{,}15$ no claro, $L + 0{,}10$ no escuro); `ring` acompanha `primary` (ou override da paleta)                                                                                                         |
| **4. Feedbacks semânticos (4 famílias + verde forte)** | Só os 4 fundos (`bg-error-background`, `bg-success-background`, `bg-warning-background`, `bg-info-background`) e `bg-success-strong` | Para cada família (Erro, Sucesso, Aviso, Informação): a **cor base/borda** (`bg-error` / `border-error` / `text-error`, `success`, `warning`, `info`), o **texto** (`text-error-foreground`, `text-success-foreground`, `text-warning-foreground`, `text-info-foreground`) e o **fundo** (`bg-*-background`); e no **Success Strong**: `bg-success-strong-hover` e `text-success-strong-foreground` | Os 4 fundos são 100% opacos, misturando a cor base sobre `--card` (7% no claro — 13% no erro — e 14% no escuro). _Nota técnica:_ `--color-success-foreground` existe em `:root` e `.dark`, mas faltou registrá-la no bloco `@theme inline` de `app/tailwind.css`  |
| **5. Prioridades (Hoje)**                              | `bg-priority-low`, `bg-priority-medium`, `bg-priority-high` (hoje misturadas no meio de "Status & Feedback")                         | Separar em grupo próprio das colunas/ícones de prioridade (Baixa, Média, Alta), com os valores de claro e escuro                                                                                                                                                                                                                                                                                    | Cores semânticas em OKLCH (verde `h=150`, amarelo `h=90/95`, vermelho `h=25`), com luminosidade ajustada no escuro                                                                                                                                                |

### 3. Problemas de design na seção

- **Falta de padrão visual com o restante da galeria `/ui`:** enquanto a seção vizinha de **Foco** (`TokensFocusSection.tsx`) organiza as famílias com divisores limpos (`divide-y`, `py-8`, `gap-6`), títulos legíveis (`h4 className="text-base font-semibold"`), explicação da regra e das classes e exemplos fiéis ao app, a seção de **Cores Semânticas** usa subtítulos espremidos em `text-xs uppercase`, espaçamentos quebrados (`space-y-*` em `<span>`) e mistura vitrine de tokens com exemplos inventados.
- **Exemplos que não representam o app real:** os "Cartões de Ação do Workflow" e a "Tira de Calendário de Produção" foram desenhados à mão com HTML avulso e não correspondem ao `ActionItem` nem ao calendário real da UZZINA.
- **Import fora do padrão:** `TokensColorsSection.tsx` importa `cn` de `"cnfast"` (linha 49) em vez de `~/lib/utils`.

## Antes e depois proposto

| Ponto na tela (`/ui` → Cores Semânticas) | Antes (hoje)                                                                                                       | Depois (proposto após o estudo)                                                                                                                                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Amostras de cores                        | 18 quadradinhos soltos numa grade única, sem grupo, sem pares de texto/borda e sem versões de hover                | Divididas por camadas claras (Superfícies e Texto, Cartão de Ação e Versões, Marca/Destaque/Foco, Feedbacks Semânticos completos com fundo + texto + borda + hover, Prioridades), mostrando a classe e de qual cor cada uma deriva       |
| Demonstração de componentes e cartões    | Títulos `<span>` colados (0 px) nos cartões; cartões e calendário fictícios que não existem no app; textos antigos | Espaçamento e tipografia alinhados ao padrão limpo da `/ui` (como na seção Foco), usando réplicas fiéis ou componentes reais do app (`ActionItem`, botões, campos, alertas) e textos atualizados com as regras vigentes (DS12/DS14/DS18) |

## O que fazer neste ticket

1. **Estudo e proposta de organização da seção (primeira entrega, sem alterar o app):**
   - Levantar todos os tokens de cor em `app/tailwind.css` (`:root`, `.dark` e `@theme inline`), confirmando pares de fundo, texto (`foreground`), borda, anel e estados (`hover`), além da fórmula de derivação de cada um.
   - Propor o desenho completo da seção **Cores Semânticas OKLCH** (divisão dos grupos de cores, como mostrar na amostra o par fundo + texto/borda + versão hover + fórmula de origem, e quais exemplos vivos manter ou substituir por réplicas fiéis do app).
   - Entregar uma prévia visual (ou maquete HTML comparativa antes/depois) para o proprietário aprovar o desenho antes de tocar em `TokensColorsSection.tsx`.
2. **Implementação (somente após aprovação do estudo pelo proprietário):**
   - Atualizar `app/components/ui-sections/TokensColorsSection.tsx` (e os subitens do menu lateral em `app/routes/ui.tsx`, se os subtítulos mudarem) seguindo o desenho aprovado.
   - Registrar `--color-success-foreground` no `@theme inline` de `app/tailwind.css` se confirmado no estudo.
   - Trocar o import de `cn` para `~/lib/utils` e formatar com Prettier.

## Critérios de conclusão

- [x] Estudo entregue com o mapa completo de cores (base, derivadas, pares fundo/texto e versões de hover) e proposta visual para a seção de Cores Semânticas da `/ui`.
- [x] Implementação em `TokensColorsSection.tsx` e `tailwind.css` (`--color-success-foreground` registrada no `@theme inline`, troca de import de `cn` para `~/lib/utils`, divisão em 5 categorias sem empacotamento em cards externos, réplicas fiéis de `ActionItem` em bloco/linha com repouso, hover, atraso `late-surface`, fase suave `phase-surface` e viva `phase-vivid`, e remoção de bugs de `space-y-*` com `<span>`).
- [x] Aceite visual do proprietário na galeria `/ui` (aba Tokens de Design → Cores Semânticas), em 16/11/2026.

## Roteiro para validação visual pelo proprietário

1. Iniciar o app (`bun run dev`) e acessar `http://localhost:5173/ui`.
2. No menu lateral da `/ui`, clicar em **Tokens de Design** → **Cores Semânticas**.
3. **Amostras de Cores (`#tokens-colors-semantics`):** conferir as 5 categorias divididas com espaçamento limpo (`divide-y`), mostrando a amostra com raio squircle, nome, classe Tailwind e fórmula de derivação:
   - _Superfícies, Estrutura e Texto Neutro_: Background, Foreground ("Aa"), Card, Popover, Input, Border, Secondary, Secondary Foreground ("Aa"), Overlay.
   - _Cartão de Ação e Versões_: Action, Action Hover, Action Ring, Action Top Border.
   - _Marca, Destaque e Foco_: Primary, Primary Foreground ("Aa"), Accent, Ring.
   - _Feedbacks Semânticos e Verde Firme_: Erro, Sucesso, Sucesso Firme (Strong), Aviso, Informação (com cor base, texto com contraste e fundos opacos).
   - _Prioridades (Hoje)_: Baixa, Média, Alta.
4. **Aplicação no Mundo Real (`#tokens-colors-real-world`):**
   - _Cartões de Ação_: verificar réplicas de `ActionItem` (em bloco e linha) com relevo, hover, cartão atrasado com selo e contorno em vermelho (`late-surface`), e cartões com fase suave (`phase-surface`) e fase viva (`phase-vivid`). O espaçamento entre o título e os cartões deve estar nítido e sem sobreposição.
   - _Botões Prism_: botões alinhados com ícone à direita (DS05), incluindo "Nova ação" com `PlusIcon` à direita.
   - _Controles de formulário_: campos com `bg-input`, foco dinâmico com anel da paleta e erro com `aria-invalid`.
   - _Abas e Popover_: abas com hover em `bg-secondary` e popover flutuante com `PrismKbd`.
5. **Feedbacks Semânticos (`#tokens-colors-feedback`):**
   - Título atualizado com explicação dos fundos opacos (7% claro / 14% escuro) e inclusão do bloco de "Sucesso Firme" em verde esmeralda sólido (`bg-success-strong`).
6. Testar alternando entre o modo **Claro** e **Escuro** e trocando as bolinhas de paleta no cabeçalho.

## Modelos sugeridos

- **Claude Code — Sonnet 5.5.** Cobre com folga a leitura de `app/tailwind.css` e `TokensColorsSection.tsx`, a montagem da prévia comparativa antes/depois e o redesenho limpo da seção na `/ui`.
- **Gemini — Gemini 4 Argon (Medium).** Bom custo-benefício para catalogar os tokens OKLCH, organizar as tabelas de derivação e estruturar o layout da galeria seguindo o padrão de `TokensFocusSection.tsx`.
- **Codex — GPT-6 Luna.** Opção mais leve para aplicar a atualização mecânica em `TokensColorsSection.tsx` e `ui.tsx` depois que o desenho do estudo estiver aprovado.
