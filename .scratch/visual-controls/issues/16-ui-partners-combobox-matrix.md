# 16 — `/ui`: matriz de `PartnersCombobox` (tamanho do avatar por tamanho de botão)

**Resumo:** Demonstra tamanhos de avatares do PartnersCombobox para cada tamanho de botão.

**Commit de referência:** `b5b5f33` — entrega versionada no histórico local.

Status: Concluído (03/11)
Escopo: criar UMA seção de vitrine nova na aba "Componentes Uzzina" do `/ui`, com o `PartnersCombobox` real em uma matriz de variantes × tamanhos × seleção, para o proprietário decidir o tamanho do avatar por tamanho de botão (decisão 1 do [ticket 13](13-combobox-variants.md)). **Não altere nenhum componente do app** (nem `PartnersCombobox`, `ComboboxTrigger`, `UAvatar`, Prism). Somente arquivos de galeria.

## Contexto (já verificado no código; confirme antes de escrever)

- `app/components/features/PartnersCombobox.tsx` exporta `PartnersCombobox` com as props: `selectedPartners?: string[]` (slugs), `onSelect?: (slugs: string[]) => void`, `tabIndex?`, `showText?: boolean`, `variant?` e `size?` (tipos de `ComboboxTriggerProps`, padrão `ghost` + `sm`), `disabled?: boolean`, `allowAll?: boolean`.
- Obtém os parceiros com `useAppContext()` (`app/contexts/AppContext.tsx`), que **lança erro fora de `AppContext.Provider`**. A rota `/ui` (`app/routes/ui.tsx`) não está dentro de `/app`; portanto a seção precisa fornecer o contexto (ver "Dados").
- Tamanho do avatar hoje (código de `PartnersCombobox`):
  - `size` = `default`, `lg`, `icon` ou `icon-lg` → `UAvatar`/`UAvatarGroup` com `size="md"` = `size-8` = **32px**.
  - qualquer outro (`xs`, `sm`, `icon-xs`, `icon-sm`, ou `size` omitido) → `size="sm"` = `size-6` = **24px**.
  - Sem seleção: `<UAvatar fallback="P">` no mesmo tamanho. Com seleção: `UAvatarGroup` com `clampAt={2}` (3 parceiros mostram 2 avatares + "+1").
  - Esses `size-6`/`size-8` vêm de `app/components/uzzina/UAvatar.tsx` (`xs` 16px, `sm` 24px, `md` 32px).
- Ícone do botão Prism (`app/components/prism/button.tsx`): `xs` `size-3` (12px); `sm`, `icon-xs`, `icon-sm` `size-4` (16px); `default`, `lg`, `icon`, `icon-lg` `size-5` (20px). É a referência de comparação do ticket 13.
- Variantes de `buttonVariants`: `default`, `outline`, `secondary`, `ghost`, `destructive`, `success`, `link`, `unstyled`. Tamanhos: `xs`, `sm`, `default`, `lg`, `icon-xs`, `icon-sm`, `icon`, `icon-lg`, `unstyled`.
- Padrão de seção: `app/components/ui-sections/ViewOptionsSection.tsx` e `UzzinaComponentsSection.tsx` (usam `GallerySection`, `GallerySectionHeader`, `GallerySectionContent`, `GalleryItem` de `GalleryHelperComponents.tsx`, estado local com `useState`). Dados fictícios nessas seções são locais ao arquivo; nenhuma lê o banco.

## Arquivos a tocar (somente estes)

1. CRIAR `app/components/ui-sections/UzzinaPartnersComboboxSection.tsx`, exportando `export function UzzinaPartnersComboboxSection()`.
2. EDITAR `app/components/ui-sections/index.ts`: `export * from "./UzzinaPartnersComboboxSection";` junto aos demais exports Uzzina (após `ViewOptionsSection`).
3. EDITAR `app/routes/ui.tsx`:
   - Import: incluir `UzzinaPartnersComboboxSection` no bloco de imports de `~/components/ui-sections`.
   - `SIDEBAR_ITEMS`: logo após o item `uzzina-view-options`, adicionar `{ id: "uzzina-partners-combobox", label: "PartnersCombobox", section: "uzzina", keywords: ["parceiros", "partners", "combobox", "avatar", "tamanho", "matriz"] }`.
   - Render: no bloco `activeSection === "uzzina"`, depois de `<ViewOptionsSection />`, adicionar `<UzzinaPartnersComboboxSection />`.
   - A raiz da seção é `<div id="uzzina-partners-combobox">` contendo `<GallerySection>`.
4. Este ticket (preencher o relatório).

Antes de editar: `git status --short app/components/ui-sections/ app/routes/ui.tsx` (há alterações do proprietário não commitadas: preserve-as). Não criar outros arquivos nem testes.

## Dados

Não há dados reais em `/ui`. Padrão a seguir: dados fictícios locais ao arquivo, como nas outras seções.

1. Declare no arquivo 4 parceiros fictícios do tipo `Partner` (`~/types`, = `Tables<"partners">`). Leia a definição de `partners` em `types/database.ts` (`Row`) e preencha **todos** os campos obrigatórios com valores neutros (strings fixas, `null` onde permitido, datas ISO fixas). Campos usados pelo componente: `id` (único), `slug`, `title`, `short` (2–3 letras), `image: null`, `colors: [fundo, texto]` (cores hex distintas por parceiro, ex.: `["#2563eb", "#ffffff"]`). Nomes sugeridos: "Alfa Odontologia" (`alfa`, "AO"), "Beta Studio" (`beta`, "BS"), "Gama Clínica" (`gama`, "GC"), "Delta Foods" (`delta`, "DF").
2. Envolva a seção em `<AppContext.Provider value={mockContext}>` (import de `~/contexts/AppContext`). `AppContextType` exige `person: Person`, `partners`, `cloudName`, `uploadPreset`, `setPrimaryAction`, `partnerFilters`, `setPartnerFilters`. Monte `person` fictício completo a partir do `Row` de `people` em `types/database.ts` (mesma regra: todos os campos). `cloudName` e `uploadPreset` = `""`; `setPrimaryAction` e `setPartnerFilters` = funções vazias. Memorize o valor (`useMemo` ou constante de módulo) para não recriar a cada render.
3. **Proibido**: `any`, `as any`, `!` (non-null), `as unknown as`, e usar o contexto/dados reais do `/app`. Se `Person` ou `Partner` exigirem um campo cujo valor neutro você não souber, reporte em vez de forçar o tipo.

## Matriz (lista fechada: não invente combinações)

Seleções usadas: **0** (`[]`), **1** (`["alfa"]`), **3** (`["alfa","beta","gama"]`). Cada instância é um `PartnersCombobox` real, controlado: um estado local único por célula (componente local `Cell` com `useState<string[]>(initial)`), `onSelect` atualiza, para o proprietário poder abrir o popover e testar. Todos com `tabIndex` omitido.

Tamanhos de texto (T) = `xs`, `sm`, `default`, `lg`. Tamanhos de ícone (I) = `icon-xs`, `icon-sm`, `icon`, `icon-lg`.

| Bloco | Título (pt-BR)                           | variant                                            | showText | allowAll | Tamanhos  | Seleções | Células |
| ----- | ---------------------------------------- | -------------------------------------------------- | -------- | -------- | --------- | -------- | ------- |
| A     | Ghost — só avatares                      | ghost                                              | não      | não      | T + I (8) | 0, 1, 3  | 24      |
| B     | Ghost — com nome                         | ghost                                              | sim      | não      | T (4)     | 0, 1, 3  | 12      |
| C     | Ghost — "Todos os parceiros"             | ghost                                              | sim      | sim      | T (4)     | 0, 3     | 8       |
| D     | Outras variantes (com nome, 1 selec.)    | outline, secondary, link, default (uma linha cada) | sim      | não      | T (4)     | 1        | 16      |
| E     | Outras variantes (só avatares, 1 selec.) | outline, secondary, link, default (uma linha cada) | não      | não      | I (4)     | 1        | 16      |
| F     | Desabilitado                             | ghost                                              | sim      | não      | `sm`      | 1        | 1       |

Total: 77 células. `destructive`, `success` e `unstyled` ficam fora (não se aplicam).

Leiaute (sem caixas):

- Cada bloco: título em `text-sm font-medium` e, abaixo, uma grade CSS (`grid`) com **uma coluna por tamanho** e **uma linha por seleção** (blocos A, B, C) ou **uma linha por variante** (blocos D, E). Cabeçalho da grade: nome do tamanho (`font-mono text-xs`). Cabeçalho de linha à esquerda: "0 selecionados", "1 selecionado", "3 selecionados" ou o nome da variante. Bloco F: uma única célula.
- Envolva cada grade em `overflow-x-auto` (o bloco A tem 8 colunas) com colunas de largura mínima razoável (`minmax(9rem,1fr)` nos blocos com nome; `minmax(5rem,1fr)` nos de só avatares).
- Cada célula: o componente e, logo abaixo, uma legenda de duas linhas em `font-mono text-xs text-muted-foreground`: `{variant} / {size}` e `avatar {N}px · ícone {M}px`.
  - `N` vem de uma função local `avatarPx(size)` que **espelha o mapeamento do código** (`default`, `lg`, `icon`, `icon-lg` → 32; demais → 24). Comente no código: `// Mirrors PartnersCombobox footerAvatarSize + UAvatar size classes`.
  - `M` vem de uma função local `iconPx(size)`: `xs` → 12; `sm`, `icon-xs`, `icon-sm` → 16; `default`, `lg`, `icon`, `icon-lg` → 20.
- Fundo das células: o fundo da página; **sem** `rounded` + `border` + `bg-card`/`bg-surface` em volta de blocos ou células (regra de design do AGENTS.md). Separe os blocos com `divide-y` e `py-8`.
- Textos de interface em pt-BR; código, nomes e comentários em inglês.

Cabeçalho da seção (`GallerySectionHeader`, sem `approved`): título `PartnersCombobox`; descrição `Matriz do seletor de parceiros por variante e tamanho do botão, com o tamanho do avatar e do ícone em cada célula. Vitrine para decidir o tamanho dos avatares; nada aqui altera o componente.` Acima dos blocos, uma linha curta (`text-sm text-muted-foreground`): `Referência do ícone do botão: xs 12px, sm e icon-xs/icon-sm 16px, default, lg e icon-lg 20px. Os avatares atuais são 24px (xs, sm) ou 32px (default, lg).` (corrija a frase se a conferência no navegador mostrar outro valor).

## Verificação (executor)

1. `bunx prettier --write` nos 3 arquivos alterados (plugin Tailwind) e `bunx tsc --noEmit` (ou `bun run typecheck`) sem erros novos.
2. No navegador (`bun run dev`, `/ui` > Componentes Uzzina > PartnersCombobox), em **claro e escuro**: nenhuma célula quebra o leiaute; sem rolagem horizontal da página (só dentro das grades); abrir o popover de uma célula mostra os 4 parceiros e a seleção atualiza o gatilho; "Todos os parceiros" aparece nas células 0 selecionados do bloco C; o bloco F não abre.
3. Confirme no inspetor, em pelo menos `sm` e `lg`, que a largura real do avatar bate com a legenda (24px / 32px). Se não bater, ajuste a legenda e reporte a divergência (não mude o componente).
4. Sem teste novo.

## Critérios de aceite

1. Só os 3 arquivos de código (1 criado, 2 editados) mudam; `git diff --stat` não toca componentes do app.
2. Seção "PartnersCombobox" no grupo Uzzina da barra lateral, logo após "ViewOptionsComponent", com rolagem por âncora para `uzzina-partners-combobox`.
3. As 77 células exatamente como na tabela, cada uma com legenda `variant / size` e `avatar Npx · ícone Mpx` corretos.
4. Instâncias reais de `PartnersCombobox` (não réplicas), interativas, com dados fictícios e `AppContext.Provider` local.
5. Sem cartão/borda/fundo de moldura; claro e escuro sem defeitos; sem `any`, `!` ou asserções de tipo; prettier e `tsc` limpos.
6. Roteiro curto para o proprietário: abrir `/ui` > Componentes Uzzina > "PartnersCombobox", comparar avatar × ícone em cada tamanho e registrar a decisão no ticket 13 (decisão 1).

## Fora do escopo

- Mudar tamanhos de avatar, `footerAvatarSize`, `UAvatar` ou qualquer componente (a decisão do proprietário vem depois).
- Outros comboboxes (`ResponsiblesCombobox` etc.), busca global, rodapé da gaveta.

## Relatório do executor

- **Arquivos alterados/criados:**
  - `app/components/ui-sections/UzzinaPartnersComboboxSection.tsx` (criado)
  - `app/components/ui-sections/index.ts` (export adicionado)
  - `app/routes/ui.tsx` (import, sidebar link `uzzina-partners-combobox` e renderização na aba `uzzina` após `ViewOptionsSection`)
- **Prettier & TypeScript:**
  - `prettier --write`: formatado com sucesso nos 3 arquivos.
  - `tsc --noEmit`: 0 erros (PASS).
- **Estrutura da matriz:**
  - 77 células completas e interativas divididas nos blocos A, B, C, D, E e F.
  - Dados mockados tipados estritamente com `Partner` e `Person` dentro de `AppContext.Provider` local.
  - Cada célula possui legenda com `{variant} / {size}` e `avatar {N}px · ícone {M}px`.
  - Layout limpo fluindo sobre o fundo, sem bordas/cartões, com `divide-y` e rolagem horizontal por grade.
- **Pendências:** nenhuma. Pronto para avaliação visual do proprietário no `/ui`.
