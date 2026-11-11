# DS16 — Remoção completa da opção legada "Usar cor do parceiro" (`followPartnerColor`)

**Status.** Concluído e aprovado pelo proprietário em 11/11/2026. Verificado com `tsc --noEmit` (0 erros), `bun test tests/header-menu.test.tsx tests/preference-persistence.test.ts` (9/9 pass) e `node scripts/check-serverless-runtime.cjs` (9/9 pass). As sobras de lint foram removidas em 11/11/2026. A página do parceiro passa a usar sempre a paleta pessoal do usuário. A publicação (push) está pendente.

**Bloqueado por.** Nenhum ticket. Tarefa independente de limpeza e simplificação.

## O que a pessoa vê

No menu do usuário (canto superior direito do cabeçalho) e na tela de Minha Conta → Aparência, existem controles para alternar entre "Usar cores da agência/paleta" e "Usar cor do parceiro" (que tentava tingir o tema do app com as cores da marca do cliente ativo).

Essa funcionalidade foi um experimento do passado que nunca mais foi utilizado, gerava confusão visual e poluição nos menus de configuração de tema. Com a remoção, a interface fica mais limpa, direta e intuitiva: o usuário escolhe sua paleta de cores normalmente, sem seletores redundantes ou menus divididos.

## Qual componente

1. **Menu do cabeçalho ([`Header.tsx`](../../../app/components/layout/Header.tsx)):**
   - Grupo "Origem das cores" (`aria-label="Origem das cores"`, linhas ~629–656), contendo as opções "Do parceiro" e "Escolher cor";
   - Classes de atenuação de opacidade (`opacity-30`) que eram aplicadas nos botões de paleta quando a cor do parceiro estava ativa.

2. **Tela de perfil / configurações ([`profile.tsx`](../../../app/routes/app/profile.tsx)):**
   - Switch de preferência `UPreferenceSwitch` com label `"Usar Cores dos Clientes"` (linhas ~984–991);
   - Campo oculto `name="followPartnerColor"` no formulário (linha ~782);
   - Estado `selectedFollowPartnerColor` e lógica de envio no submit da página.

3. **Página do parceiro ([`app/routes/app/partner/$slug.tsx`](../../../app/routes/app/partner/$slug.tsx)):**
   - Efeito de montagem que invocava `applyPartnerColors` ao abrir a rota do cliente (linhas ~134–136).

4. **Busca global por comando ([`GlobalSearchCommand.tsx`](../../../app/components/features/GlobalSearchCommand.tsx)):**
   - Lógica que desativava `followPartnerColor` ao selecionar uma paleta pela busca (linhas ~101–106).

5. **Lógica de tema e preferências:**
   - [`app/hooks/useAppTheme.ts`](../../../app/hooks/useAppTheme.ts): remoção de `followPartnerColor`, `setFollowPartnerColor`, `applyPartnerColors` e dos estilos injetados para a cor do parceiro;
   - [`app/lib/preferences.ts`](../../../app/lib/preferences.ts): remoção do campo `followPartnerColor` do contrato e dos valores padrão;
   - [`app/routes/app.tsx`](../../../app/routes/app.tsx): limpeza da chamada de bootstrap que passava o status de `followPartnerColor`.

## O que foi analisado, o que já mudou e o que será mudado

- **O que foi analisado:** O recurso `followPartnerColor` não agrega valor ao produto, adicionava código de injeção dinâmica de CSS em runtime e causava conflito com o sistema de temas estrito e as sombras de paleta.
- **O que já mudou:** Decisão confirmada pelo proprietário de descontinuar e remover por completo.
- **O que será mudado:**
  1. Remover as opções da interface visual no menu do `Header` e na tela de `profile`.
  2. Remover as funções auxiliares em `useAppTheme.ts` e `preferences.ts`.
  3. Limpar chamadas residuais em `GlobalSearchCommand.tsx` e na rota `$slug.tsx` do parceiro.
  4. Executar verificação de tipos (`tsc --noEmit`) e testes automatizados para assegurar zero regressões.

## Onde está

- `app/components/layout/Header.tsx`
- `app/routes/app/profile.tsx`
- `app/routes/app/partner/$slug.tsx`
- `app/components/features/GlobalSearchCommand.tsx`
- `app/hooks/useAppTheme.ts`
- `app/lib/preferences.ts`
- `app/routes/app.tsx`

## O que o proprietário precisa decidir e o que olhar antes de aprovar

- Abrir o menu do cabeçalho e constatar a simplificação: apenas a seleção direta de tema e paletas, sem o bloco "Origem das cores".
- Abrir Minha Conta → Aparência e conferir a remoção do switch "Usar Cores dos Clientes".
- Navegar para a página de um parceiro e verificar que a paleta do usuário permanece consistente e estável.

## Critérios de conclusão

- [x] Menus de interface limpos sem referências a "Do parceiro" ou "Cores dos clientes".
- [x] Código de injeção dinâmica de cores do parceiro removido de `useAppTheme.ts`.
- [x] Contrato de preferências atualizado sem quebras para usuários existentes.
- [x] `tsc --noEmit` passa com zero erros e testes existentes de tema/perfil passando (9/9).

## Modelos sugeridos

- **Google — Gemini 3.8 Flash.** Eficiente para rastrear e limpar todas as referências residuais nos 7 arquivos afetados.
- **OpenAI — GPT-6.1 Sol.** Recomendado para assegurar que a remoção do campo em `preferences.ts` mantenha compatibilidade com sessões existentes no localStorage/Supabase.
- **Anthropic — Claude Sonnet 5.5.** Alternativa para validar a limpeza das dependências nos hooks do React. Disponibilidade depende do plano.
