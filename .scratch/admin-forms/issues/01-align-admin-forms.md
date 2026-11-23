# Adequar os formulários administrativos ao modelo de Parceiros

**Status:** proposto para execução.

**Bloqueado por:** nenhum.

## Resultado esperado

Em Administração → Usuários e Administração → Clientes, as telas Novo e Editar devem seguir a organização visual de Administração → Parceiros. Hoje esses formulários têm composições próprias. A adequação agrupa campos relacionados em seções com cabeçalho, descrição curta, divisória e espaço entre os blocos. A criação e a edição seguem num formulário contínuo e usam os mesmos blocos quando os campos se aplicam aos dois modos.

## Critérios de aceite

- [ ] Adequar Novo e Editar Usuário e Novo e Editar Cliente. Reutilizar `FormSection` e a organização de Parceiros, com controles Prism, seções no fundo da página e ações com rótulos que digam o que fazem.
- [ ] Preservar os fluxos de salvamento, acesso, permissões, credenciais e vínculos. Manter campos exclusivos de um modo apenas onde se aplicam.
- [ ] Percorrer as demais rotas administrativas, incluindo listas, Datas Comemorativas, Temas e a página de exclusão de parceiro. Registrar onde há um formulário ou bloco adequado a esse padrão, o que mudaria em cada tela e em que ordem. O levantamento dessas páginas entrega uma proposta para revisão antes de alterá-las.
- [ ] Apresentar as quatro telas de Usuários e Clientes para conferência visual, incluindo tela estreita, e registrar em que ambiente a mudança está disponível.

## Referência

[Padrão de formulários administrativos](../../../docs/contracts/pages-today-profile-planning.md#formulários-administrativos)

## Modelos sugeridos

- Codex — GPT-6.2 Sol, para reorganizar os formulários e preservar seus fluxos de salvamento.
- Codex — GPT-6.1 Terra, para comparar as telas e conferir agrupamento, espaçamento e leitura em tela estreita.
- Codex — GPT-6.2 Astra, para revisar os modos de criação e edição quando houver regras de acesso ou credenciais mais complexas.
