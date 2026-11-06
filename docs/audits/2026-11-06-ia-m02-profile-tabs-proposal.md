# IA-M02 — Proposta de abas em Minha Conta (06/11/2026)

Somente proposta. Nenhum código, CURRENT ou migration foi alterado. Base lida: `app/routes/app/profile.tsx` (807 linhas), `app/hooks/usePreferencePersistence.ts`, `app/lib/preferences.ts`, `useFillScrollViewport`, `PrismTabPanel` e o contrato de Minha Conta em AGENTS.md.

## 1. Situação atual

- `PrismTabs` já envolve a página. Dois painéis (`personal`, `preferences`), ambos com `shouldForceMount` e `isAlwaysVisible={isDesktop}`. Abaixo de `lg` aparecem como 2 abas; no desktop são duas colunas (1.2fr / 1.8fr) com rolagem independente.
- A coluna "Preferências" cresceu: tema, cor, tema personalizado, cores dos clientes, layout padrão, Hoje, sidebar do Instagram, 3 modelos de IA e o medidor de uso. É a coluna que mais rola e mistura assuntos sem agrupamento.
- Um único `<form id="profile-form">` e um único botão "Salvar Alterações" no cabeçalho (atributo `form`).
- `handleSubmit` envia sempre o conjunto completo (`theme`, `themeColorIndex`, `followPartnerColor`, `defaultViewVariant`, `showInstagramSidebar`, `customTheme`), mais `defaultTodayView` e modelos de IA só quando alterados. Os campos incondicionais são o risco de sobrescrever valores salvos por outra superfície (menu do cabeçalho, comandos de tema da busca) durante a sessão da página.

## 2. Proposta: quatro abas

Tabs (`PrismTabs`, variante `underline`, padrão), em todos os tamanhos de tela:

| Aba | Conteúdo | Quem vê |
| --- | --- | --- |
| Informações pessoais (`personal`) | Foto, nome, sobrenome, iniciais, nome curto, e-mail (somente leitura) | Todos |
| Aparência (`appearance`) | Tema claro/escuro/sistema, cor de destaque, painel de tema personalizado, "Usar cores dos clientes" | Todos |
| Funcionamento (`behavior`) | Layout padrão, Visualização inicial do Hoje, Sidebar do Instagram por padrão | Todos |
| Uso de IA (`ai`) | Modelos padrão por comando (estratégia, conteúdo, legenda) com "voltar ao padrão", medidor de uso | Ver abaixo |

### Comparação

| Critério | Hoje (2 colunas / 2 abas no celular) | 4 abas (proposta) |
| --- | --- | --- |
| Achar uma opção | Rolar a coluna longa de Preferências | Um assunto por aba, nomes iguais aos do ticket |
| Densidade desktop | Duas colunas lado a lado | Uma coluna de leitura (max ~`max-w-2xl`) sob a barra de abas; sobra espaço lateral |
| Crescimento (padrões por comando, futuros ajustes de IA) | Alonga ainda mais a coluna | Cabe na aba de IA sem afetar as outras |
| Comportamento celular x desktop | Dois modelos diferentes (`isAlwaysVisible`) | Um só modelo; remove `useIsDesktop`, `isAlwaysVisible` e o grid de duas colunas |
| Custo de mudança | Nenhum | Médio: reorganizar JSX, rolagem e o reveal de campo inválido |

Recomendação: adotar as quatro abas em todos os breakpoints. A perda do "ver tudo de uma vez" no desktop é pequena, porque Informações pessoais raramente muda e as demais seções são independentes. Alternativa mais conservadora, caso o proprietário prefira manter duas colunas no desktop: abas apenas no celular com 4 itens (mantém o código duplicado de hoje). Não recomendada.

### Visibilidade por papel

- Nenhum campo mapeado hoje depende de `person.admin`; as quatro abas aparecem para todos os membros.
- Uso de IA: a tela atual consulta `get_my_ai_allowance` (consumo pessoal). O ticket e o ticket ai-usage/01 falam em franquia compartilhada da agência, e existe `getAgencyAIUsage` / `get_agency_ai_usage` (liberada a `authenticated`, validando `people.visible` no banco, migration `20261101230000`). Falta decidir qual medidor a aba mostra (pergunta 1). Em ambos os casos a autorização continua no banco; a aba só consome o resultado e não expõe custos de provedor.
- Se `person` não puder usar IA (caso futuro), a aba permanece, com a seleção de modelos desativada e aviso. Hoje não há esse papel.

## 3. Regras de salvamento

### Ao confirmar o formulário (botão do cabeçalho)

Tudo que hoje já depende do botão, mais o que pertence ao perfil:

- Perfil (`updateOwnProfile`): nome, sobrenome, iniciais, nome curto, foto.
- Aparência: tema, cor de destaque, `customTheme`, `followPartnerColor`. O preview continua imediato (`setTheme`, `previewColorIndex`, `previewCustomTheme`), mas só persiste ao salvar, como o contrato atual.
- Funcionamento: layout padrão, Hoje, sidebar do Instagram.
- Uso de IA: modelos padrão.

### Imediato, por ação explícita (fora do formulário)

- Foto: o upload só preenche rascunho (continua no formulário). Nada novo é imediato nas abas.
- "Tentar novamente" do medidor: apenas refaz a consulta de leitura.
- "Voltar ao padrão" do modelo: altera só o rascunho do formulário (como hoje), não grava. Isso evita misturar ações imediatas e rascunho na mesma aba.
- Menu do perfil e comandos de tema da busca continuam gravando sozinhos pelo controlador existente (debounce 250ms). Não mudam.

Manter um único botão e um único `form` simplifica o aceite e preserva o contrato "salvamento da conta continua manual".

### Evitar sobrescrever outras superfícies

Hoje o submit manda tema, cor, followPartnerColor, layout e sidebar sempre. Proposta: guardar o valor inicial de cada campo na montagem (`initialPreferencesRef`) e enviar apenas os campos que o usuário alterou (dirty). `update_my_preferences(p_patch)` já faz merge por `auth.uid()`, então um patch parcial preserva o que outra superfície salvou depois. Regras adicionais:

- `customTheme` entra no patch apenas se a cor for -1 e o rascunho estiver completo, ou se o usuário deixou -1 (envia `null`), como hoje.
- Campos de IA e `defaultTodayView` já seguem essa lógica; estender a mesma ideia aos demais.
- `themeColorIndex` continua gravado também no `localStorage` apenas quando alterado ou ao salvar com a cor ativa, mantendo o evento `uzzina-storage-update`.
- Após o sucesso, mesclar a resposta em `person.preferences` somente nos campos enviados (mesma ideia do `onChange` de `usePreferencePersistence`), em vez de substituir o objeto inteiro, e atualizar o valor "inicial" desses campos.
- Mantém as guardas `isCurrentSession()` antes e depois de cada escrita.

Isso não exige novo armazenamento: `people.preferences` e a RPC atual atendem à organização.

### Rascunhos entre abas e campo inválido

- Todos os painéis usam `shouldForceMount` (hidden/inert quando inativos). Estados React (tema, cor, modelos, `customThemeDraft`) já vivem no componente pai. Campos de texto pessoais são não controlados (`defaultValue`) e continuam montados, então não se perdem.
- `isAlwaysVisible` deixa de ser necessário. O painel oculto deve continuar com `inert`/`hidden` para não receber Tab.
- Campo inválido: o `onInvalidCapture` do `<form>` vira genérico. Cada `PrismTabPanel` recebe `data-tab-id`; no handler, `event.target.closest("[data-tab-id]")` define a aba e `flushSync(() => setSection(id))` ocorre antes da validação nativa focar o campo. Hoje isso só existe para "Informações pessoais" (via `aria-label`); a generalização é pequena. Campos inválidos hoje existem só na aba pessoal (todos `required`).
- Aba selecionada na URL: não necessário; opcionalmente `?tab=ai` fica fora do escopo. A seleção volta para Informações pessoais ao remontar a rota.

## 4. Navegação, foco, rolagem e botão salvar

- Abas: setas navegam entre abas (React Aria); Tab segue da aba selecionada para o conteúdo do painel visível, depois para o botão de salvar. Rótulo da lista: "Seção da conta". Em telas estreitas, `PrismTab` já quebra linhas com `wrap-anywhere`; com 4 rótulos ("Informações pessoais" é o mais longo) a barra deve rolar horizontalmente (`overflow-x-auto`, sem barra visível) ou usar rótulos de 1–2 palavras abaixo de `sm`. Preferência: rolagem horizontal, sem encurtar nomes, para respeitar o contrato de quebra sem corte. Validar a 320px.
- Salvar: permanece no cabeçalho, ao lado de "Minha Conta", ligado por `form="profile-form"`. Fica acessível em todas as abas, porque o cabeçalho é `shrink-0` fora da região rolável. Sem rodapé de salvar nem texto auxiliar. Deve funcionar sem estar na aba do campo alterado (a barra de abas não precisa indicar alterações pendentes; ver pergunta 4).
- Rolagem: `useFillScrollViewport` continua limitando a altura ao contêiner rolável. Cada painel é a região rolável (`min-h-0 overflow-y-auto overscroll-contain`) e termina com `AppBarSpacer`. Apenas um painel rola por vez. Com a coluna única, a divisória do cabeçalho/abas é o corte visível. Mantém a ausência de borda, arredondamento e fundo de cartão: nada de caixas ao redor de seções.
- Trocar de aba deve reposicionar a rolagem do painel recém-selecionado no topo (cada painel é separado, então cada um guarda a própria posição; aceitável).
- Foco ao trocar de aba: permanece na aba (padrão do React Aria); não mover foco para o conteúdo.
- Preview de tema: continua aplicado ao navegar entre abas. Se o usuário sair da página sem salvar, comportamento atual (o preview é descartado pelo provedor de tema ao remontar) deve ser conferido no aceite; não alterar.
- Sessão: `isCurrentSession()` e `generation` permanecem como estão.
- Conteúdo da aba de IA: o medidor pertence à mesma aba dos modelos. A ordem sugerida é medidor primeiro (contexto), depois modelos. Em celular, as linhas de modelo já quebram com `flex-wrap`.

## 5. Proposta visual (ASCII)

Desktop (>= lg), aba Aparência selecionada:

```
+------------------------------------------------------------------+
| Minha Conta                                  [ nuvem Salvar Alter ]|
|------------------------------------------------------------------|
| Informações pessoais | Aparência | Funcionamento | Uso de IA       |
|                       ^^^^^^^^^^                                  |
|                                                                  |
|  TEMA DO APP                                                     |
|  [ Claro ] [ Escuro ] [ Sistema ]                                |
|                                                                  |
|  COR DE DESTAQUE                                                 |
|  Selecione a paleta de cores primárias...                        |
|  [ ● Cor A ] [ ● Cor B ] ... [ Personalizado ]                   |
|                                                                  |
|  (painel de tema personalizado, quando "Personalizado")          |
|                                                                  |
|  Usar Cores dos Clientes                              ( switch ) |
|  ...                                                             |
|                         (AppBarSpacer)                           |
+------------------------------------------------------------------+
```

Aba Uso de IA:

```
| Informações pessoais | Aparência | Funcionamento | Uso de IA       |
|                                                   ^^^^^^^^^^^    |
|  USO DE IA                                      novembro de 2026 |
|  [======----------------]  32%                                   |
|  12 gerações registradas            Renova às 00h UTC no dia 1   |
|                                                                  |
|  MODELOS PADRÃO                                                  |
|  Criar estratégia                      [↻] [ Luna        v ]     |
|  Gerar conteúdo                            [ Luna        v ]     |
|  Gerar legenda                         [↻] [ Claude ...  v ]     |
|                         (AppBarSpacer)                           |
```

Celular (375px):

```
| Minha Conta     [Salvar Alterações] |   (botão quebra linha se preciso)
|---------------------------------------|
| Informações pessoais | Aparência | Fun→ |   (barra rola na horizontal)
|  ...conteúdo da aba, rola sozinho...  |
|            (AppBarSpacer)             |
```

## 6. Implementação sugerida (para o ticket seguinte, não feita)

1. Trocar `mobileSection` por `section` com 4 chaves; remover `useIsDesktop`, `isAlwaysVisible`, o grid de duas colunas e a classe `lg:hidden` da lista de abas.
2. Painéis com `shouldForceMount`; `data-tab-id` e `onInvalidCapture` genérico com `flushSync`.
3. Mover os blocos existentes para os painéis sem alterar estados, ids, `aria-label`s nem textos.
4. Submit com patch por campos alterados, mesclando a resposta em `person.preferences` por chave.
5. Verificação: `prettier` nos arquivos; sem testes automáticos por rotina (preferência do proprietário); teste manual conforme roteiro abaixo. Typecheck apenas se a mudança tocar tipos.

## 7. Roteiro de aceite do proprietário

1. Abrir Minha Conta no desktop: ver 4 abas e o botão Salvar fixo no cabeçalho. Conferir que cada controle atual está na aba prevista.
2. Em Aparência, escolher outro tema e outra cor sem salvar; navegar por todas as abas: o preview permanece. Salvar e recarregar: continua.
3. Em Aparência, escolher "Personalizado", editar cores, mudar para Funcionamento e voltar: o rascunho segue lá.
4. Alterar nome em Informações pessoais, ir para Uso de IA, trocar um modelo, salvar: ambos persistem. "Voltar ao padrão" só muda o rascunho até salvar.
5. Apagar o nome e ir para Uso de IA; clicar em Salvar: a aba Informações pessoais é aberta e o campo recebe foco.
6. Com a página aberta, mudar o tema pelo menu do cabeçalho e depois salvar em Minha Conta alterando só o layout: o tema do menu não volta ao valor antigo.
7. Teclado: setas entre abas, Tab até o conteúdo e até Salvar; sem foco em painéis ocultos.
8. Celular (320 a 390px): abas legíveis (rolagem horizontal), sem corte de rótulos, botão Salvar acessível, último campo visível acima da barra (AppBarSpacer).
9. Conferir se o medidor e a mensagem de erro/"tentar novamente" aparecem como hoje.

## 8. Perguntas para o proprietário

1. Uso de IA mostra o consumo pessoal (`get_my_ai_allowance`, hoje na tela), a franquia compartilhada da agência (`get_agency_ai_usage`) ou ambos? Nota: o ticket pede a franquia da agência; o código atual mostra a pessoal.
2. Aprovar abas também no desktop (substituindo as duas colunas), ou manter colunas no desktop e abas só no celular?
3. Aprovar o salvamento por campos alterados (patch parcial) em vez de enviar sempre todos os campos?
4. Quer indicação visual de alterações não salvas nas abas (ponto) ou isso fica fora do escopo?
5. Os futuros padrões por comando (IA-M04) devem ficar nesta aba junto dos três modelos atuais?
