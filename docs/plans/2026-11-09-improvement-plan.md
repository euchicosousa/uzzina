# Plano de melhoria da UZZINA — o que as rodadas anteriores não cobriram

Data: 09/11/2026. Base: `main` em `c2244bb`, checkout limpo. Entrega de estudo: nenhum código, SQL ou configuração foi alterado. Cada item abaixo depende de autorização própria.

## Por que este plano é diferente dos anteriores

As rodadas anteriores trabalharam bem a aparência (design system), a gaveta de ação, a IA e o Planejamento. Quase nada olhou para quatro assuntos: **o que acontece quando algo quebra**, **proteção das portas de entrada**, **peso do carregamento** e **o custo do próprio processo com agentes**. Este plano cobre só essas lacunas. Remoção de código sem uso e simplificação estrutural continuam no ARQ-01 e não são repetidas aqui.

## Como foi verificado, e os limites

- Leitura do código e do build local já existente em `dist/` (08/11).
- Consultas **somente leitura** ao banco de produção (`bussola`): avisos de segurança e desempenho da Supabase, contagens, definição de funções e policies. Nada foi gravado.
- **Não** abri o app no navegador, não testei em produção e não rodei testes. O que depende de ver na tela está marcado como "não visto na tela".
- O `CURRENT.md` tem 1.334 linhas; li as 289 primeiras (até 06/11). Ver item 10.

Tamanho real hoje: 4 pessoas na equipe, 4 contas de cliente, 30 parceiros, 7.332 ações (cerca de 3.000 novas por ano), banco com 56 MB.

## Prioridade 1 — coisas que podem dar problema para quem usa

### 1. Tela em branco quando algo quebra

- **O que é:** se qualquer tela der erro ao desenhar (um dado inesperado numa ação, por exemplo), o app inteiro some e fica uma página branca, sem mensagem nem botão. O mesmo vale para endereço inexistente: aparece a mensagem padrão em inglês da biblioteca.
- **Onde ver:** qualquer tela; digite um endereço que não existe, como `/app/qualquercoisa`.
- **Evidência:** não existe nenhuma tela de erro ou de "não encontrado" configurada nas rotas (`app/router.tsx`, `app/routes/__root.tsx`; busca por `errorComponent`, `notFoundComponent` e `ErrorBoundary` em `app/` retorna zero).
- **Proposta:** uma tela de erro simples em português ("Algo deu errado", botões Recarregar e Voltar para Hoje) e uma de "Página não encontrada", para equipe e portal. A gaveta de ação ganharia uma proteção própria, para um erro nela não derrubar a tela de trás.
- **Esforço:** pequeno. **Risco:** baixo.

### 2. Planejamento aparece no menu, mas o banco não tem onde salvar

- **O que é:** a tela Planejamento está acessível pelo menu do topo, pela busca e pela página do parceiro. Ela lê e grava propostas numa tabela (`social_plans`) que **não existe em produção** (conferido hoje). Quando a leitura falha, a tela esconde o erro e mostra "nenhuma proposta salva", como se estivesse tudo bem (`app/routes/app/planejamento.tsx:190-203`).
- **Já se sabia:** que o SQL do T02 está pendente e que o Planejamento está em espera. **O que faltou dizer:** que, enquanto isso, a tela continua exposta para a equipe e falha em silêncio. Não visto na tela.
- **Proposta (escolher uma):** (a) esconder a entrada do menu/busca até o T02 ser aplicado; (b) manter visível com um aviso "em construção, propostas não são salvas"; (c) deixar como está.
- **Esforço:** pequeno. **Risco:** baixo.

### 3. Ninguém é avisado quando o app falha

- **O que é:** erros de tela e das APIs só ficam no console do navegador de quem sofreu o erro ou nos logs da Vercel, que ninguém acompanha. Você só descobre quando alguém reclama.
- **Proposta:** registrar erros de tela e de API num lugar que avise (um serviço de monitoramento com plano gratuito, ou uma tabela simples no próprio banco com uma lista em Administração). Decidir qual antes de implementar.
- **Esforço:** pequeno a médio, conforme a opção.

### 4. Portal de clientes: sem limite de tentativas de senha

- **O que é:** a tela de login do portal (`/dash/login`) aceita tentativas ilimitadas de senha para um e-mail. As senhas são guardadas de forma segura (bcrypt; não resta nenhuma no formato antigo), mas nada impede um robô de testar milhares.
- **Evidência:** `api/dash-auth.ts` não tem contagem de tentativas nem bloqueio.
- **Proposta:** bloquear por alguns minutos após N erros seguidos para o mesmo e-mail (contador no banco). Junto: ligar na Supabase a opção que recusa senhas já vazadas na internet para a equipe (hoje desligada; é um botão no painel e pode depender do plano).
- **Esforço:** pequeno. Exige SQL em produção, com autorização.

### 5. Cabeçalhos de proteção do site

- **O que é:** o site não envia as instruções básicas que impedem, por exemplo, outra página de embutir a UZZINA num quadro invisível para capturar cliques. `vercel.json` não define nenhum cabeçalho.
- **Proposta:** adicionar os cabeçalhos padrão (bloqueio de moldura, tipo de conteúdo, política de referência). Uma política de conteúdo mais rígida (CSP) fica para depois, porque precisa ser testada com Cloudinary e o editor.
- **Esforço:** pequeno. **Risco:** baixo; conferir upload de mídia e portal depois.

## Prioridade 2 — velocidade

### 6. O app carrega mais do que precisa

- **Arquivo principal:** 1,08 MB (315 KB compactado), baixado inclusive pela página inicial e pelo portal do cliente. Ele inclui textos de cerca de 30 idiomas da biblioteca de componentes (árabe, hebraico, japonês, chinês), e o app só usa português.
- **Listas de ações:** as telas pedem todas as colunas de cada ação, inclusive o texto do conteúdo e da legenda, que a lista não mostra. O mês atual (317 ações) pesa cerca de 430 KB por carga, e o app recarrega tudo sempre que você volta para a aba do navegador (`app/lib/query-client.ts`: validade zero e recarga ao focar).
- **Proposta:** (a) manter só português no pacote; (b) separar em partes o que o portal e a página inicial não usam; (c) listas pedirem só as colunas que mostram, e a gaveta buscar o resto ao abrir; (d) dar alguns segundos de validade aos dados antes de recarregar.
- **Cuidado:** (c) e (d) tocam os contratos de cache e da gaveta; precisam de estudo próprio antes.
- **Esforço:** (a) pequeno; (b) médio; (c) e (d) médios, com risco.

### 7. Banco sem índices na tabela de ações

- **O que é:** a tabela de ações só tem o índice do identificador. Toda lista (Hoje, calendário, atrasadas) lê a tabela inteira. Com 7 mil linhas ainda é rápido; cresce 3 mil por ano.
- **Avisos da Supabase (conferidos hoje):** 10 regras de acesso refazem a checagem de identidade linha por linha; 5 ligações entre tabelas sem índice; 2 tabelas com regras de leitura duplicadas; a extensão `pg_net` no esquema público.
- **Proposta:** um pacote de SQL pequeno com índices por data e por parceiro e o ajuste das regras recomendado pela Supabase. Sem mudança visível.
- **Esforço:** pequeno. **Risco:** médio por ser produção; ensaiar antes e aplicar com autorização. Sem urgência.

### 8. Listas sem teto podem cortar resultados em silêncio

- **O que é:** as consultas de "atrasadas" e de fluxo não têm limite nem paginação. A API da Supabase corta respostas em um máximo configurado (o padrão é 1.000 linhas) sem avisar. Hoje há 130 atrasadas e 425 ações abertas, então **não está acontecendo**; o maior parceiro tem 893 ações não arquivadas.
- **Limite:** não consegui confirmar o valor configurado no projeto.
- **Proposta:** confirmar o teto no painel e pôr período ou limite explícito nessas duas consultas.
- **Esforço:** pequeno.

## Prioridade 3 — dados e processo

### 9. 130 ações atrasadas em aberto, a mais antiga de outubro de 2024

- **O que é:** o aviso de atrasadas no topo carrega 130 ações que nunca foram concluídas, algumas com dois anos. Isso tira o valor do aviso.
- **Proposta:** decisão sua, sem código: concluir ou arquivar em lote o que é antigo (a seleção em lote já existe), ou definir que o aviso só conta os últimos N dias.

### 10. O processo com agentes ficou caro e frágil

- **`CURRENT.md` tem 240 KB (cerca de 98 mil tokens).** O guia manda todo agente começar por ele, mas o arquivo já não cabe numa leitura: cada sessão gasta muito ou lê só o começo. Ele acumulou histórico desde outubro sob o título "Pendências reais".
- **`TODO.md` aponta para uma lista de tickets de 01/11**, superada pelo tracker atual.
- **Proposta:** `CURRENT.md` volta a ser uma página só com o que está pendente hoje; o restante vai para um arquivo de histórico, sem reescrever. Corrigir o apontamento do TODO.
- **Sem conferência automática:** não há CI, e várias entradas do histórico registram testes que "já falhavam antes". Proposta: uma verificação automática no GitHub a cada envio (tipos, lint e os 9 testes das APIs, cerca de 2 minutos), sem mudar seu fluxo de aceite visual.
- **Esforço:** pequeno.

### 11. Arrumações pequenas

- **Cor ao abrir o app:** o trecho que pinta a cor antes do app carregar (`index.html`) tem uma lista antiga de 12 cores que não corresponde às 11 paletas atuais. Pode causar um piscar de cor errada na abertura. Não visto na tela.
- **Fonte sem uso:** os arquivos da PP Object Sans (132 KB) continuam sendo publicados, embora a fonte esteja desligada desde 01/11.
- **Criar usuário (Administração):** a API `api/create-user.ts` não usa os utilitários compartilhados das outras e não valida o formato dos dados; um pedido malformado devolve erro genérico. A autorização (só administrador) está correta.
- **Sessões do portal vencidas** nunca são apagadas (5 hoje; irrelevante agora, cresce devagar).
- **Código da senha antiga do portal** pode sair: não resta nenhuma conta no formato antigo.

## O que conferi e está certo

- Todas as tabelas têm controle de acesso ligado; as tabelas internas (IA, sessões, contas de cliente) só são lidas pelo servidor.
- As funções do banco que carregam o app e a Home conferem a identidade de quem chama; o aviso da Supabase sobre elas é esperado.
- Conteúdo em HTML mostrado no portal e na revisão passa por limpeza antes de ser exibido.
- Nenhum `any` no código; componentes não acessam o banco diretamente.

## Ordem sugerida

1. Itens 1 e 2 (tela de erro; Planejamento exposto): pequenos e protegem quem usa.
2. Itens 4 e 5 (tentativas de senha; cabeçalhos): pequenos e fecham portas.
3. Item 10 (CURRENT enxuto e verificação automática): barateia todas as próximas sessões.
4. Item 6a e item 8: ganhos rápidos de carregamento e segurança de dados.
5. Itens 3, 7, 6b–d: precisam de decisão ou estudo antes.
6. Itens 9 e 11 quando convier.

## O que você precisa decidir

- Quais itens autoriza virar ticket (cada um pode ser aprovado separado).
- Item 2: esconder, avisar ou manter o Planejamento no menu.
- Item 3: serviço externo ou registro no próprio banco.
- Item 9: o que fazer com as atrasadas antigas.

## Modelos sugeridos

- **Claude Code — Sonnet 5.5.** Itens 1, 2, 5, 10 e 11: mudanças pequenas e localizadas.
- **Claude Code — Opus 5.5.** Itens 4, 7 e 8: envolvem SQL em produção e regras de acesso.
- **Claude Code — Fable 5.2.** Itens 6c e 6d: tocam os contratos de cache e da gaveta, onde o risco de regressão é maior.

Disponibilidade depende do plano. A recomendação não autoriza disparar agentes.
