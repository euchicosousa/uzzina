# DS05 — Investigar a ordem de ícone e texto nos botões

**Entrega:** Parecer sobre quando usar ícone antes ou depois do texto na UZZINA, com inventário dos usos reais e proposta para revisão do proprietário.

**Bloqueios:** Nenhum. Coordenar a cobertura com DS02.

**Status:** CONCLUÍDO e validado pelo proprietário em 11/11/2026. A taxonomia por função semântica foi implementada no código e registrada nos contratos:
- **Gatilhos Mistos (`UViewOptions`):** Ícone de contexto à esquerda + Rótulo + Chevron à direita (`[⊞ Visualizar ⌄]`, `[⑂ Ordenar ⌄]`, `[👁 Exibir ⌄]`).
- **Ação & Disparo:** Ícone à direita (`[Nova Ação +]`, `[Salvar ☁️]`, `[Publicar agora ✈️]`, `[Concluir ✓✓]`, `[Gerar proposta ✨]`, `[WhatsApp 📞]`, `[Excluir 🗑]`).
- **Contexto & Entidade:** Ícone à esquerda (`[👤+ Novo Usuário]`, `[🏢 Novo Parceiro]`, `[🎨 Cor da marca]`, `[👥 Pessoas]`).
- **Navegação Direcional:** Sentido físico do fluxo (`[← Voltar para leads]` à esquerda / `[Avançar →]` à direita / `[Link ↗]` à direita).
- **Abas:** Padrão de texto puro mantido.
- **Calendário:** Badge de datas comemorativas limpo com ponto colorido (`[🟢 Dia de finados]`), sem ícone redundante competindo na célula.

Laboratório interativo: `.scratch/design-system-audit/estudo-ordem-icones.html`.

## Modelos sugeridos

- **Anthropic (Claude)** — Claude Sonnet 5.5, para análise semântica de componentes e geração do laboratório visual interativo.
- **Google (Gemini/Antigravity)** — Gemini 3.8 Flash, para varredura e catalogação de ocorrências de ícones.
- **OpenAI (Codex)** — GPT-6.1 Sol, para cruzamento de diretrizes de design systems e acessibilidade.

## Critérios de aceite

- [ ] Pesquisar documentação primária de design systems e acessibilidade. Citar links diretos e distinguir requisitos de acessibilidade, convenções e escolhas de produto. Indicar onde as fontes divergem ou não prescrevem uma ordem.
- [ ] Varrer os botões com texto e ícone nas rotas reais da equipe e do portal, incluindo controles de navegação e wrappers de upload. Registrar rota, componente, ordem renderizada, significado do ícone e classes ou propriedades responsáveis. Separar exemplos da galeria e controles que exibem só ícone por largura ou estado.
- [ ] Comparar casos de ação, direção, menu e estado. Conferir amostras renderizadas, incluindo versões compactas, e distinguir ordem visual da ordem no DOM e do nome acessível.
- [ ] Propor uma convenção com exemplos reais, exceções justificadas e lista de usos que valeria ajustar. Entregar o parecer para decisão antes de qualquer mudança na interface.

## Execução — 06/11/2026

Relatório: [2026-11-06-ds05-button-icon-label-order.md](../../../docs/audits/2026-11-06-ds05-button-icon-label-order.md).

- Nenhuma fonte de acessibilidade prescreve a ordem; WCAG exige só nome contendo o texto visível, DOM igual ao visual e ícone decorativo oculto. Os design systems divergem (Carbon à direita; Atlassian e Polaris antes).
- Padrão atual da UZZINA: ícone antes em cerca de 30 de 38 botões; 9 desvios T-I, a maioria sem motivo semântico.
- Proposta: ícone antes por padrão; depois apenas para disclosure, avanço e link externo; `gap` em vez de margem manual.
- 12 sítios e 1 ajuste de sistema (regras `data-icon` não acionadas no app) listados para decisão; nenhum código foi alterado. Apple, Material e Fluent não puderam ser verificados.

## Ajustes aplicados — 06/11/2026

Convenção aplicada: ícone antes do texto; sem `mr-*`/`ml-*` no ícone (o `gap` do botão cuida do espaço); nome acessível contém o texto visível.

- `app/components/layout/AppBar.tsx:127-130`: `PlusIcon` movido antes dos spans "Nova Ação"/"Ação".
- `app/routes/app/admin/users.tsx:56`, `clients.tsx:44`, `partners.tsx:90`: ícone (UserPlus/UserPlus/FolderPlus) antes do texto.
- `app/routes/reset-password.tsx:251-254`: `KeyIcon` antes do texto, sem `ml-2`. Tratado como ícone decorativo (não é avanço), seguindo a seção 6 do relatório.
- `app/components/features/ActionComments/CommentInput.tsx:209`: removido `mr-1.5`.
- `app/components/features/AdminUserForm.tsx:241`: removido `mr-2`.
- `app/components/planning/PlanningSuggestionsList.tsx:238,255,270`: removidos os `mr-1` (Editar, Descartar, Aprovar).
- `PlanningSuggestionsList.tsx` (botões Descartar/Aprovar): removidos `aria-label="Descartar sugestão"` e `"Aprovar sugestão"`; o nome acessível agora é o texto visível ("Desfazer descarte", "Aprovada" etc.).

### Deixado para o proprietário

- `action-drawer/ActionFormFooter.tsx` (Salvar/Atualizar): decisão do proprietário, não tocado.
- `UCalendarToolbar.tsx:67` (nome `MMMM/yy` x visível `MM/yy` no celular): não alterado. `tests/icon-control-names.test.tsx:191` fixa o nome "Escolher data, outubro/26" de propósito; baixa prioridade.
- S1 (regras `data-icon` mortas em `prism/button.tsx`): fora do escopo.
- `Fazer Login` e demais exceções do relatório: mantidos.

### Roteiro de conferência visual

1. Barra superior: "Nova Ação" mostra o + antes do texto; em tela estreita aparece "+ Ação". Espaço entre ícone e texto igual ao dos outros botões.
2. /app/admin/users, clients e partners: botão com ícone antes ("Novo Usuário", "Novo Cliente", "Novo Parceiro").
3. /reset-password (com link de recuperação): botão com a chave antes de "Redefinir Senha e Entrar".
4. Gaveta, aba Observações: botão Enviar com ícone e espaço normal. Admin, usuário: botão Salvar Usuário idem.
5. /app/planejamento com sugestões: Editar, Descartar e Aprovar sem espaço extra; alternar descartar/aprovar e ver o rótulo mudar.

## Nome do seletor de data — 06/11/2026

`UCalendarToolbar.tsx:68` mostra "outubro/26" a partir de `md` e "10/26" abaixo disso. O nome acessível é sempre "Escolher data, outubro/26". No desktop ele contém o texto visível, como pede a WCAG 2.5.3. No celular a diferença afeta só o controle por voz falando "10/26", e o leitor de tela recebe o mês por extenso, que é mais claro. Recomendação: manter como **exceção justificada**, porque um `aria-label` não muda por breakpoint e a alternativa seria tirar o formato curto do celular. O teste `icon-control-names.test.tsx:191` protege esse nome. Se o proprietário preferir, troca-se o formato curto por "out/26".

## Branch conferido no app real — 06/11/2026

`proposal/ds05-save-icon-first` (`4f76198`) servido localmente com a sessão do proprietário, em 1280px, numa ação existente. O botão mostra o ícone de nuvem antes de "Atualizar". A gaveta foi fechada sem salvar.

## Decisão do proprietário — 06/11

Em botões e abas com ícone e texto, o ícone fica sempre à direita. Fazer Login já segue a ordem. Inventariar divergências, começando por Nova Ação, criação no Admin, Redefinir Senha, Salvar/Atualizar e abas. Controles só com ícone não têm ordem de rótulo. A proposta `proposal/ds05-save-icon-first` foi superada. Aplicação depende de autorização.

---

## Reabertura pelo Proprietário — 11/11/2026

O proprietário identificou equívocos na aplicação da regra "ícone à direita" (ex.: gatilhos de menu `UViewOptions` onde o ícone de categoria ficou espremido entre o rótulo e o chevron, badges de datas comemorativas, etc.).

**Ações em andamento:**
1. Criação do laboratório interativo [`estudo-ordem-icones.html`](../estudo-ordem-icones.html) catalogando todos os componentes com ícones do sistema para comparação lado a lado (Ícone à Esquerda vs. Ícone à Direita vs. Casos Mistos).
2. Validação interativa de cada grupo de componentes com o proprietário antes de qualquer alteração no código de produção.
