# UZZINA — guia para agentes

## Continuidade e escopo

Comece por [CURRENT.md](docs/audits/CURRENT.md), depois leia somente os arquivos e dependências da tarefa autorizada. Consulte relatórios anteriores apenas para resolver uma divergência específica. Ao terminar, atualize CURRENT com resultado, verificação e pendências reais; detalhes de operação ficam no documento correspondente. Ideias de produto registradas não autorizam implementação. Tickets de investigação/estudo entregam relatório e proposta; nenhuma alteração de código, branch de implementação ou correção dos achados sem aprovação explícita do proprietário para aquele item, mesmo sob objetivo aberto ("enquanto tiver tokens").

Antes de editar, confira o estado do Git e preserve mudanças externas. Um executor escreve no checkout por vez. Diferencie código preparado, SQL aplicado, teste local, staging e produção; um push não confirma deploy Ready.

## Como falar com o proprietário sobre tickets

Regra do proprietário em 06/11/2026: ele decide muita coisa e não decora tickets nem código. Toda vez que mencionar um ticket (EST-05, IA-M05, DS03 etc.), diga em linguagem simples e, na mesma mensagem:

- **O que ele é:** o problema que se vê na tela, em uma ou duas frases, sem sigla solta nem nome de arquivo ou função como explicação.
- **Qual componente:** o nome que ele reconhece (por exemplo "a barra de formatação do editor Tiptap, na aba Instagram → Conteúdo"), dizendo onde abrir no app para vê-lo.
- **O que foi analisado, o que já mudou e o que será mudado**, com o antes e o depois visíveis.
- **Onde está:** `main`, branch de proposta, banco ou produção, e o que falta para publicar.
- **O que ele precisa decidir e o que olhar antes de aprovar.**

Nunca peça aprovação de algo que ele não consiga descrever com as próprias palavras. Se o pedido for ambíguo (por exemplo "a linha"), pergunte qual elemento antes de alterar. Nunca desfaça ou sobrescreva mudanças feitas por ele; se precisar mudar algo dele, diga o que existia e o que vai trocar, e espere a resposta.

## Recomendações de agentes nos tickets

Ao criar um ticket ou mudar seu escopo, inclua a seção `## Modelos sugeridos` com exatamente três opções de execução, sem exigir uma por empresa ou família de modelos. Em cada linha, indique a ferramenta, o modelo e o motivo ligado à tarefa. Prefira o modelo mais leve que cubra o risco e a complexidade. Confira a disponibilidade na ferramenta de execução quando possível e sinalize quando depender do plano. As três opções são alternativas para o responsável escolher. A recomendação por si só não autoriza disparar agentes nem altera os modelos usados pelo app.

## 1. Stack e estrutura

UZZINA é a aplicação existente de gestão de ações da agência CNVT: React, TanStack Router em SPA, TanStack Query, Supabase, Tailwind CSS v4, Prism/React Aria, Tiptap, Cloudinary e OpenAI. Vercel executa o frontend e as APIs.

| Caminho                                  | Responsabilidade                                                                                                                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app/routes/`                            | Rotas; `app/routeTree.gen.ts` é gerado                                                                                                                                                           |
| `app/components/prism/`                  | Primitivos do design system                                                                                                                                                                      |
| `app/components/uzzina/`                 | Componentes reutilizáveis de alto nível                                                                                                                                                          |
| `app/components/features/`               | Fluxos de negócio, incluindo gaveta e upload                                                                                                                                                     |
| `app/components/layout/`, `ui-sections/` | Layout e galeria `/ui`                                                                                                                                                                           |
| `app/hooks/`, `app/lib/`                 | Estado, cache, preferências e contratos compartilhados; paletas em `lib/palettes.ts`, variáveis CSS em `lib/palette-vars.ts`, rascunho de tema personalizado em `lib/custom-theme.ts`            |
| `app/utils/`                             | Utilitários puros (barrel `~/utils`, `uzzina-utils`, `factory`); `cn` permanece em `~/lib/utils`                                                                                                 |
| `app/data/`                              | Dados preservados sem uso pelo app (`hooks-library.ts`)                                                                                                                                          |
| `app/models/`, `app/services/`           | Consultas por entidade e clientes de API                                                                                                                                                         |
| `api/`, `server/`                        | Handlers Vercel, sessão e adaptador local; `server/supabase-admin.ts` (config/cliente service-role) e `server/auth.ts` (token Bearer) são compartilhados pelos handlers de portal/revisão/contas |
| `supabase/`, `tests/`, `scripts/`        | Contratos do banco e verificações                                                                                                                                                                |

## 2. Convenções e verificação

- Código, arquivos e comentários técnicos novos em inglês; interface em português brasileiro.
- TypeScript estrito: use `unknown` com validação para dados dinâmicos; não introduza `any` nem assertions de não-nulo.
- Use a estrutura existente para corrigir o comportamento; arquitetura adicional exige uma necessidade concreta.
- Preferência do proprietário em01/11/2026: priorizar agilidade; fazer a alteração e fornecer roteiro curto para ele validar. Não criar/executar testes por rotina. Automatizar somente quando houver necessidade concreta ligada ao risco da mudança, usando o menor conjunto pertinente e código real. Não tratar suite verde como aceite visual.
- Formate os arquivos alterados; lint/typecheck/testes conforme necessidade concreta. Build é necessário ao publicar. Para ajustes visuais simples, a validação do proprietário é o fluxo principal. Formatação/ordem de classes Tailwind: Prettier com apenas `prettier-plugin-tailwindcss` (único plugin de parser; outro plugin anula a ordenação). Biome só faz lint (formatter desligado). Não há CI: antes de qualquer push que toque `api/`, `server/`, `app/lib/ai-contract.ts`, arquivos importados pelas APIs ou `package.json`/`bun.lock`, rode `bun run test:serverless` (esperado: 9 PASS, incluindo os dois endpoints de estratégias). Para documentação isolada, confira referências e diff, sem criar testes que apenas repetem texto.
- `bun test` com a suíte inteira passa de 10 minutos; rode por arquivo (`bun test tests/<arquivo>`). Em 06/11/2026 os 71 arquivos passaram individualmente. Cliques do painel de navegador da automação chegam como cliques virtuais: o rótulo do checkbox React Aria os ignora (use teclado ou `userEvent` para validar).
- HTTP controlado no navegador verifica a interface, mas não certifica o banco/provedor. Inspeção textual de SQL não comprova autorização real. Registre esses limites.

## 3. Contratos de funcionamento

As regras detalhadas por área ficam em `docs/contracts/`. Ao mexer em uma área, abra o documento dela antes de editar; o texto foi movido sem reescrever e nasceu, em boa parte, de bugs reais.

| Ao mexer em                                                                                             | Leia primeiro                                                                                    |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Gaveta de ação, listas/calendários de ações, cache de consultas, notificações                           | [docs/contracts/action-drawer.md](docs/contracts/action-drawer.md)                               |
| Busca global, comandos, data comemorativa pela busca                                                    | [docs/contracts/search-and-commands.md](docs/contracts/search-and-commands.md)                   |
| Hoje/Home, Minha Conta, Planejamento, Ajuda, AppBar/Header, altura de calendários, preferências e temas | [docs/contracts/pages-today-profile-planning.md](docs/contracts/pages-today-profile-planning.md) |
| Foco, movimento, abas, containers flutuantes, galeria `/ui`                                             | [docs/contracts/prism-details.md](docs/contracts/prism-details.md)                               |
| IA, estratégias, catálogo de modelos, quota                                                             | [docs/contracts/ai-and-strategies.md](docs/contracts/ai-and-strategies.md)                       |
| Migrations, RPCs, triggers, tabelas, `bun run dev`, ambientes, publicação                               | [docs/contracts/database-and-deploy.md](docs/contracts/database-and-deploy.md)                   |
| Portal `/dash`, revisão pública, componente `Content`                                                   | [docs/contracts/portal-and-review.md](docs/contracts/portal-and-review.md)                       |

Decisões do proprietário que valem sempre, com o detalhe no documento da área:

- Portal `/dash`: sem validação de Origin/APP_ORIGIN nem redirecionamento canônico (01/11/2026); não reintroduza como correção automática.
- `bun run dev` usa o banco e as contas reais de produção (27/10/2026); ao verificar no navegador, só leia.
- Rodapé da gaveta sem customização, só variantes e tamanhos padrão do botão Prism (03/11/2026).
- Regiões de rolagem (Hoje, Kanban, Perfil, células de calendário, carrossel do Instagram) não são paradas de foco (03/11/2026).
- Editor de conteúdo do Instagram usa sempre `RichTextEditor compactToolbar` (06/11/2026).

### Regras estruturais

- `/app` usa Supabase Auth. `app/routes/app.tsx` acompanha getSession/onAuthStateChange e carrega `get_app_bootstrap`. Preserve o singleton em `app/lib/supabase.client.ts` para o refresh de sessão.
- PATCH administrativo de contas usa `admin_update_client_account`; edição administrativa de pessoas usa `admin_update_person`. Preserve autorização no servidor/banco, além da interface.
- Partners são os clientes comerciais da agência; clients são suas contas externas. O formulário de Leads está no repositório separado `/Users/euchicosousa/vercel/lead`: POST/PATCH por `/api/lead`, cookie HttpOnly/HMAC por lead, Origin exato, schema/limites e DML no servidor. Não reintroduzir acesso anônimo direto à tabela.
- Ações pertencem a parceiros. Preserve a data de execução, responsáveis múltiplos e os estados distintos Feito (`done`) e Concluído (`finished`). Conclusão pertence à ação inteira. Sprint e agrupamentos atuais não são removidos por uma limpeza técnica.
- A policy SELECT de ações deve autorizar pelos campos da própria linha; não consultar a ação por ID em uma função STABLE durante INSERT RETURNING. Criação/duplicação precisam devolver a versão canônica sem ampliar escopo de membros.
- Rascunho de "Nova ação": todos os pontos usam `createActionDraft` e `resolveDraftPartners` (`app/utils/factory.ts`); a gaveta identifica rascunho pela ausência de `id`. Componentes e rotas não chamam `.from()` diretamente: use `app/models/` (`actions`, `partners`, `people`).

- Gaveta de ação: até duas ações abertas (`useActionPanels`), formulários sempre montados, salvar só no formulário ativo; versão remota mais nova nunca sobrescreve edição local sem comparação. Detalhe em [docs/contracts/action-drawer.md](docs/contracts/action-drawer.md).
- Cache: chaves privadas incluem identidade/audiência; lista só é atualizada com escopo conhecido e versão canônica. Detalhe em [docs/contracts/action-drawer.md](docs/contracts/action-drawer.md).
- Portal e revisão pública têm autenticação própria, separada da equipe; IDs da URL não autorizam acesso. Detalhe em [docs/contracts/portal-and-review.md](docs/contracts/portal-and-review.md).
- IA: segredos OpenAI/Supabase ficam no servidor; quota persistente antes da geração; estratégias são o fluxo permanente. Detalhe em [docs/contracts/ai-and-strategies.md](docs/contracts/ai-and-strategies.md).
- Banco: autorização no servidor/banco, além da interface; SQL versionado não confirma aplicação. Detalhe em [docs/contracts/database-and-deploy.md](docs/contracts/database-and-deploy.md).

- Fontes e finalidade dos envs estão no README. Não imprimir/versionar segredos nem pedir credenciais já disponíveis. O comando dev usa Node e env específico por modo; preservar ausência de `.env` genérico, que o Bun poderia pré-carregar sobre a configuração do Vite.
- Não executar db push/repair/reset cegamente: produção foi atualizada por bundles parciais, sem histórico de migrations. Publicação exige verificar nova versão Ready antes de restringir os acessos legados.

## 4. Manutenção de documentação

Documente contratos vigentes aqui, operação no README e status/pendências em CURRENT. Ideias futuras permanecem separadas em docs/plans, sem implementação automática.

Ao adicionar/modificar tabelas ou models, atualize este guia e `~/.gemini/antigravity-ide/knowledge/uzzina-database/artifacts/database.md`. Novas rotas/portais/fluxos exigem atualização do guia e do KI correspondente, incluindo `uzzina-architecture/artifacts/architecture.md`. Novos componentes Prism/Uzzina também entram na galeria `/ui`.

Contratos de área (gaveta, busca, páginas, Prism em detalhe, IA, banco e implantação, portal) pertencem a `docs/contracts/`: ao criar ou mudar um deles, atualize o documento correspondente e o índice da seção 3, sem inflar este guia.

## 5. Design system: Prism

Preserve o estilo próprio, temas e paletas OKLCH da UZZINA. Novos primitivos ficam em `app/components/prism/`, exportados por index.ts, com React Aria Components, CVA e `cn()` de `~/lib/utils`. Componentes de negócio reutilizam esses primitivos. Consulte implementação e `/ui` para props e variantes atuais.

| Token                                   | Uso                          |
| --------------------------------------- | ---------------------------- |
| bg-background / bg-card / bg-input      | Página, painéis e campos     |
| text-foreground / text-muted-foreground | Texto principal e secundário |
| border-border / border-input            | Bordas                       |
| bg-primary / text-primary-foreground    | Ação principal               |
| border-ring / ring-ring/30              | Foco                         |
| text-error / bg-error-background        | Erro                         |
| text-success / bg-success-background    | Sucesso                      |
| text-warning / bg-warning-background    | Aviso                        |
| text-info / bg-info-background          | Informação                   |

Escala de controles `xs`/`sm`/`default`/`lg` = 24/32/40/48px, com ícone só `icon-xs`/`icon-sm`/`icon`/`icon-lg` nas mesmas medidas. Texto por tamanho: `xs` `text-xs` (único com 12px), `sm` e `default` `text-sm`, `lg` `text-base` em revisão. Raios: controles até `default` `rounded-2xl squircle`, `lg` `rounded-3xl squircle`; ButtonGroup/ToggleGroup seguem o raio dos itens do tamanho; containers (popover, dropdown, conteúdo de select/combobox, command dialog, dialog, alert, toaster) `rounded-2xl`; itens internos `rounded-xl squircle`; Badge/`PrismKbd` em pílula `rounded-full` sem squircle. Cores de estado usam tokens, sem `emerald`/`green` fixos. `PrismKbd` (atalhos) e `PrismDialogBody` (corpo `px-5 py-2`) existem em `prism/`. Estado vigente e pendências em [visual-controls-final-status](docs/plans/visual-controls-final-status.md); lista de componentes a ajustar em [visual-controls-where](docs/plans/visual-controls-where.md).

Ordem ícone/texto (regra do proprietário, DS05): em botões, links com aparência de botão, abas e toggles que têm texto e ícone, o ícone fica sempre depois (à direita) do texto; botões só com ícone ficam isentos. O espaço vem do `gap` do botão, sem margens manuais.

Use estados React Aria data-[hovered], data-[pressed], data-[focused] e data-[disabled]. Ícones Lucide novos seguem sufixo Icon; botões definem tamanho padrão e focus ring. PrismInput aplica foco/erro ao Group que inclui prefixo/sufixo. PrismAlert reúne ícone, título e descrição por variante. Componente composto precisa de verificação própria de foco/teclado, além das garantias dos primitivos.

- Superfícies e caixas de formulário (regra de design): nunca empacotar seções de formulários, seletores, listas ou blocos de campos em caixas/cartões externos com borda arredondada e fundo (padrão card/caixa com `rounded`, `border`, `bg-card` ou `bg-surface`). Os elementos, seletores e listas fluem diretamente sobre o fundo da página e da área rolável, mantendo a composição limpa e integrada, sem molduras de cartão ao redor de blocos de configuração.

Containers flutuantes (Popover, Menu, Select, Combobox, Command, Dialog, AppBar, BubbleMenu): `rounded-2xl squircle`, `border border-foreground/5 dark:border-foreground/10` (ring só para foco), listas `p-1`, `shadow-lg`, largura por `size` (popover `w-56/72/80`, diálogo `max-w-sm/lg/xl/2xl`); Sheet sem raio. Todo elemento arredondado usa `squircle`, exceto `rounded-full` e `rounded-none`.

Detalhes do Prism (foco, movimento, abas, nomes acessíveis, galeria `/ui`) estão em [docs/contracts/prism-details.md](docs/contracts/prism-details.md); leia-o ao mexer nesses pontos.
