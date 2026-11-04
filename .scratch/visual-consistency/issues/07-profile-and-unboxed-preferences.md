# 07: Minha Conta e Preferências desencaixotadas (Zona Suíça Arejada)

**What to build:** a página `/app/profile` (`Minha Conta`) e seus subcomponentes (`UPreferenceSwitch`, `CustomThemePanel`) operam integralmente na Zona 1 (Editorial Suíça Arejada), sem caixas/cartões com borda ao redor de preferências ou do bloco de uso de IA, sem cores `zinc`/`rose`/`amber` hardcoded, sem `font-bold` (`700`) e com respiro amplo entre seções.

**Blocked by:** #02 (Alinhamento geométrico dos primitivos Prism e vitrine oficial em `/ui`).

**Status:** completed

- [x] Em `UPreferenceSwitch.tsx`, a moldura externa de cartão (`rounded-2xl border border-border bg-card/25 p-4`) é removida para cumprir a regra de superfícies limpas do `AGENTS.md` e do [docs/design-system.md](../../../docs/design-system.md): cada preferência flui diretamente sobre a coluna rolável com alinhamento limpo, separação sutil por espaçamento ou linha `border-b border-border/60`, título em `text-sm font-medium` (sem `font-semibold`) e controles em `PrismToggleGroup` (`rounded-md`).
- [x] Em `CustomThemePanel.tsx` e `PaletteSwatch` (`app/routes/app/profile.tsx`), a caixa externa `rounded-xl border bg-zinc-50/50 p-4 dark:bg-zinc-950/20` e as classes `zinc-*` / `border-black/10` / `rgba` inline são removidas, usando tokens semânticos (`bg-secondary`, `border-border`, `text-muted-foreground`), `PrismColorField` / seletores sem `shadow-sm`, e rótulos em `text-xs` (sem `text-[11px]` ou `text-[10px]`).
- [x] No bloco "Uso e consumo de IA" em `app/routes/app/profile.tsx`, as caixas externas `rounded-2xl border bg-muted/20 p-4` são desencaixotadas para fluir na coluna de Preferências como as demais seções, e a barra de progresso substitui `bg-rose-500` e `bg-amber-500` pelos tokens semânticos `bg-error` e `bg-warning` com raio `rounded-xs` (`2px`).
- [x] A tipografia e o ritmo de `/app/profile` seguem a Zona 1: título `h1` em `text-xl lg:text-2xl font-semibold`, títulos de seção `h2` em `text-base lg:text-lg font-medium` (sem `font-bold`), eyebrows em `text-xs font-medium tracking-wider uppercase text-muted-foreground`, botão "Remover foto" com `PrismButton`, e preservação integral do contrato de `useFillScrollViewport`, formulário único ligado ao botão `Salvar Alterações` no cabeçalho (o único CTA primário da vista) e `AppBarSpacer` no final de cada coluna.

