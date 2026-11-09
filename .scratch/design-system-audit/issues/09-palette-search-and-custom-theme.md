# DS09 — Buscar paletas e acessar o tema personalizado

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Terra, para integrar os comandos de paleta e conferir navegação e estados.
- **Anthropic** — Claude Sonnet 5.5, para revisar o editor personalizado, os tokens do DS06 e a persistência de preferências.
- **Google** — Gemini 3.8 Flash, para implementar os atalhos e conferir os fluxos de busca e Minha Conta.

**Entrega.** Encontrar paletas pelo nome na busca global, abrir a configuração de Personalizado pelo menu superior e incluir no editor as novas opções de aparência definidas no DS06.

**Dependência.** A busca e o atalho podem avançar primeiro. A extensão do editor depende da versão consolidada do DS06. Coordenar os arquivos de paleta com o trabalho em andamento.

## Aceite

- [ ] Gerar os comandos a partir das paletas disponíveis à equipe. Buscar “Carbono” e acionar “Usar paleta Carbono” aplica e salva a escolha pelo fluxo existente. Conferir teclado, busca por nome e persistência ao recarregar.
- [ ] Ocupar o espaço reservado no seletor de paletas do menu superior com **Personalizado**. Acionar abre **Minha Conta → Aparência**, com o editor personalizado à vista, sem aplicar uma paleta ao navegar. Reutilizar o fluxo de saída da gaveta e a navegação do app.
- [ ] Inventariar as variáveis finais do DS06 e expor os controles de personalização correspondentes. Incluir o relevo dos cartões de ação, com sombra e realce superior tratados em conjunto e borda transparente no estilo plano. Usar controles de intenção visual para tokens derivados.
- [ ] Conferir prévia, salvar, recarregar e abrir rascunhos personalizados existentes. Preservar valores legados por padrão e manter a escolha de paletas restrita à área interna.

**Revisão posterior:** a função de produção foi atualizada em 08/11 para aceitar e validar as novas propriedades do tema, mantendo as permissões existentes. O corte da aba foi corrigido no código local. Falta conferir o visual e o salvamento completo no app; os testes abaixo não verificam uma gravação real.

## Relatório de Implementação (08/11/2026)

1. **Busca Global (`GlobalSearchCommand.tsx`):**
   - Comandos gerados dinamicamente para todas as paletas de `PALLETE` com `label: "Usar paleta " + palette.label` e amostra da cor primária no modo claro ou escuro ativo.
   - Busca por nome, seleção via teclado/Enter e persistência de preferências via `onPaletteChange` (chamando `applyPaletteVars` e gravando em storage).
   - Verificado em `tests/global-search-partners.test.tsx` (54 PASS).

2. **Atalho "Personalizado" no HeaderMenu (`Header.tsx` e `profile.tsx`):**
   - Ocupada a 12ª vaga na grade 2x6 de paletas do menu superior do usuário com `<PrismMenuItem textValue="Personalizado">`.
   - Dispara navegação assistida por guardas (`onNavigate("/app/profile?tab=appearance")`), abrindo diretamente a aba Aparência de Minha Conta sem alternar nem aplicar paleta antes da confirmação do usuário.
   - Suporte ao parâmetro de busca `?tab=appearance` em `app/routes/app/profile.tsx` via `getInitialProfileTab()` resiliente e listener `popstate`.
   - Verificado em `tests/header-menu.test.tsx` e `tests/profile-palette-swatches.test.tsx` (8 PASS).

3. **Integração dos Tokens DS06 no Tema Personalizado:**
   - Tipos `CustomTheme` e `SerializedPreferences` em `preferences.ts` e `custom-theme.ts` estendidos com `relief?: boolean`, `shadowColor?: string`, `topBorderColor?: string`.
   - Defaults e migração segura: temas legados ou novos iniciam com `relief: true` por padrão.
   - `useAppTheme.ts` passa `relief`, `shadowColor` e `topBorderColor` para `applyPaletteVars` tanto na prévia em tempo real (`previewCustomTheme`) quanto na paleta ativa (`selectedPalette`).
   - `CustomThemePanel.tsx` redesenhado conforme a regra de superfícies (sem container de card externo):
     - Switch `UPreferenceSwitch` para "Relevo dos cartões de ação" (trata em conjunto sombra de profundidade e borda superior).
     - Quando desligado (estilo plano), aplica `--action-top-border-override: transparent`, `--action-shadow-override: 0 0 #0000`, `--action-hover-shadow-override: 0 0 #0000`.
     - Controles visuais para "Sombra e contorno base" (`shadowColor`) e "Realce superior" (`topBorderColor`) com botões para restaurar valores padrão.
     - Cartão de demonstração em tempo real com classes reais de ação (`border-t border-action-top-border bg-action shadow-action ring ring-action-ring`) refletindo imediatamente as opções escolhidas.

4. **Verificação Automatizada:**
   - Teste de integração dedicado criado em `tests/custom-theme-ds09.test.tsx` (5 PASS).
   - Suíte de serverless verificada com `node scripts/check-serverless-runtime.cjs` (9 PASS).
   - Typecheck estrito sem erros (`tsc --noEmit`).
