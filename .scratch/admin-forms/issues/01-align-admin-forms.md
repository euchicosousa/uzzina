# Adequar os formulários administrativos ao modelo de Parceiros

**Status:** aprovado pelo proprietário em 26/11/2026 e encerrado. Código em produção.

**Bloqueado por:** nenhum.

## Resultado esperado

Em Administração → Usuários e Administração → Clientes, as telas Novo e Editar devem seguir a organização visual de Administração → Parceiros. Hoje esses formulários têm composições próprias. A adequação agrupa campos relacionados em seções com cabeçalho, descrição curta, divisória e espaço entre os blocos. A criação e a edição seguem num formulário contínuo e usam os mesmos blocos quando os campos se aplicam aos dois modos.

## Critérios de aceite

- [x] Adequar Novo e Editar Usuário e Novo e Editar Cliente. Reutilizar `FormSection` e a organização de Parceiros, com controles Prism, seções no fundo da página e ações com rótulos que digam o que fazem.
- [x] Preservar os fluxos de salvamento, acesso, permissões, credenciais e vínculos. Manter campos exclusivos de um modo apenas onde se aplicam.
- [x] Percorrer as demais rotas administrativas, incluindo listas, Datas Comemorativas, Temas e a página de exclusão de parceiro. Registrar onde há um formulário ou bloco adequado a esse padrão, o que mudaria em cada tela e em que ordem. O levantamento dessas páginas entrega uma proposta para revisão antes de alterá-las.
- [x] Apresentar as quatro telas de Usuários e Clientes para conferência visual, incluindo tela estreita, e registrar em que ambiente a mudança está disponível.

## Referência

[Padrão de formulários administrativos](../../../docs/contracts/pages-today-profile-planning.md#formulários-administrativos)

## Entrega em 26/11/2026

Em Administração → Usuários, a tela de Novo e Editar agora organiza perfil e acesso/permissões em seções com cabeçalho, descrição e divisória. Em Administração → Clientes, Novo e Editar organizam perfil, acesso à conta e parceiros com acesso na mesma estrutura. Antes os campos apareciam em blocos próprios, sem seções; agora os campos comuns seguem o padrão visual de Parceiros, preservando os fluxos existentes de credenciais, salvamento, permissões, vínculos e arquivamento. O commit `4f0a8161` foi enviado a `origin/main` em 26/11/2026. A alteração está incluída no [deploy de produção Ready da revisão `701df5d8`](https://vercel.com/agenciacnvt/uzzina/9P4U6FEkL1rMFgTuVdLhocvXZ7FD).

O proprietário pode conferir as quatro telas abrindo Administração → Usuários → Novo Usuário e um usuário existente; depois Administração → Clientes → Novo Cliente e um cliente existente. Em cada tela, conferir a leitura das seções, credenciais, áreas/permissões, parceiros vinculados, ações e a versão estreita. O proprietário aprovou os formulários em 26/11/2026.

## Levantamento das demais rotas administrativas

O padrão pode ser avaliado nesta ordem, sem alterar estas páginas nesta entrega:

1. **Administração → Datas Comemorativas** (`/app/admin/celebrations`): há criação de data com calendário, nome, escolha de feriado e parceiros. Pode receber título/descrição de seção, mas deve manter o formulário compacto junto do calendário; avaliar se a divisão ajuda sem quebrar o fluxo de criação e edição em linha.
2. **Administração → Temas** (`/app/admin/themes`): é um editor interativo de paletas com controles, modos de prévia, descarte, cópia e download, não um cadastro com campos enviados por formulário. Não aplicar `FormSection` à composição atual; se surgirem blocos de configuração persistente, revisar separadamente.
3. **Administração → Parceiros** (`/app/admin/partners`), **Usuários** (`/app/admin/users`) e **Clientes** (`/app/admin/clients`): são listas e atalhos de criação, não formulários. Sem bloco que se beneficie de `FormSection`.
4. **Administração → Excluir parceiro** (`/app/admin/partner/$slug/delete`): fluxo destrutivo de prévia, conferências e confirmação. Os cartões e etapas ajudam a separar riscos e dependências; não substituir por seções de cadastro. Revisar apenas a clareza das ações se houver ticket próprio.
5. **Administração → Cloudinary** (`/app/admin/cloudinary`): explorador de arquivos com busca, filtros, seleção em lote e confirmação de exclusão. Os controles filtram resultados em vez de preencher cadastro; não aplicar o padrão de formulário.

O levantamento descreve possibilidades para revisão e não autoriza mudanças nas páginas acima.

## Modelos sugeridos

- Codex — GPT-6.2 Sol, para reorganizar os formulários e preservar seus fluxos de salvamento.
- Codex — GPT-6.1 Terra, para comparar as telas e conferir agrupamento, espaçamento e leitura em tela estreita.
- Codex — GPT-6.2 Astra, para revisar os modos de criação e edição quando houver regras de acesso ou credenciais mais complexas.
