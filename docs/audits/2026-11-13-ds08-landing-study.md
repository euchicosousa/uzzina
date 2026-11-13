# DS08 — Estudo e levantamento para a página inicial institucional

Data: 13/11/2026. Ticket: [DS08](../../.scratch/design-system-audit/issues/08-uzzina-landing-page.md). Escopo desta rodada: estudo e proposta. **Nenhum código, banco ou configuração foi alterado.**

## O que é o DS08, em linguagem simples

Hoje, quem abre `uzzina.cnvt.com.br` vê uma tela com três linhas grandes ("Escolha qual app quer acessar"): UZZINA, LINK e CNVT, cada uma com uma seta. Não explica o que é a UZZINA nem os outros dois serviços. O DS08 quer trocar essa tela por uma apresentação curta: primeiro o que é a UZZINA (o app de gestão da Agência CNVT), depois uma seção sobre o serviço de links e outra sobre a agência, sem perder os três acessos. Onde ver: abrir `https://uzzina.cnvt.com.br/` sem estar logado (ou `/` no localhost).

## Levantamento

### A página atual (`app/routes/index.tsx`)

- Arquivo único, 70 linhas, sem alteração de conteúdo desde a migração para TanStack Router. Usa a paleta Ônix (DS07) corretamente, em claro e escuro.
- Três destinos: `/app` (UZZINA), `https://cnvt.link` (LINK) e `https://cnvt.com.br` (CNVT). Os links externos abrem na mesma aba.
- Visto em produção a 1024 px e 375 px: sem rolagem horizontal; no celular a descrição de cada item some (só título e seta). No desktop a descrição fica numa coluna estreita (`w-1/6`) e quebra em 4–5 linhas de uma ou duas palavras.
- Acessibilidade: nenhum título (`h1`) na página; "Escolha qual app quer acessar" é texto comum. O nome lido de cada link junta número, título e descrição ("01 UZZINA App de gestão…"). A seta é desenho sem texto, o que está certo.
- Restos de código comentado no meio do componente (um asterisco girando e um bloco de título/descrição).
- O rodapé "CNVT®" não é link. Existe um `Footer` pronto em `app/components/layout/Footer.tsx` (© ano + link para a agência), hoje usado só em `/app`.

### Compartilhamento e busca

- `index.html` tem só `<title>UZZINA</title>`: sem descrição, sem imagem de prévia (Open Graph). Mandar o link no WhatsApp ou Instagram mostra apenas o endereço.
- Como o app é uma SPA, essas etiquetas valem para todas as rotas; isso é aceitável, já que o resto do app exige login.

### Peso do carregamento

- Antes de mostrar a página, o navegador baixa o pacote principal do app: **~317 KB de JS + 28 KB de CSS (compactados)**, medidos em produção em 13/11. A tela fica vazia por um instante (vista em branco na primeira abertura no painel do navegador).
- A rota já é separada por código (`autoCodeSplitting`), mas a raiz carrega tema, paletas, toaster e o resto compartilhado. Uma página institucional que pesa como o app é o ponto técnico mais relevante do DS08. Isso conversa com o item "peso do carregamento" do [plano de melhoria de 09/11](../plans/2026-11-09-improvement-plan.md).

### Os destinos externos

| Item na página | Destino configurado | O que abre hoje (13/11) |
| --- | --- | --- |
| UZZINA | `/app` | Login ou o app, normal |
| LINK — "Sistema de Links exclusivo de quem é parceiro" | `https://cnvt.link` | Redireciona para `www.cnvt.link`, que mostra **o mesmo site da agência** (título "CNVT® - Agência de Marketing 360º"). Lá, o botão "CNVT.LINK" leva a um formulário de contato do Respondi |
| CNVT | `https://cnvt.com.br` | Site da agência: "Não fazemos post que só enfeita feed…", Social Media, Consultoria de Marketing, Identidade Visual, CNVT.LINK, Ferramentas |

Ou seja: **hoje não existe uma página pública do "serviço de links"**. O item LINK leva o visitante ao site da agência, igual ao item CNVT. Também não há nada no banco ou no código da UZZINA sobre esse serviço. A seção de links do DS08 depende de o proprietário dizer o que o serviço é e para onde o botão deve levar.

### Material de marca disponível no repositório

- `UZZINALogo` em `app/components/logo.tsx` (usado no login).
- Fonte PP Object Sans em `public/object-sans/`, desligada no `index.html` (o app usa a fonte do sistema).
- Favicons claro/escuro. Nenhuma imagem de prévia, foto, captura de tela do app ou logo da CNVT em arquivo.
- Texto de referência da agência (do site): "Marcas Paradigma®", "Onde parceria vira resultado", serviços Social Media, Consultoria de Marketing e Identidade Visual.

## Proposta de estrutura

Mantém o estilo atual (tipografia grande, linhas divisórias, Ônix) e acrescenta contexto, sem virar um site de marketing longo.

1. **Abertura:** logo UZZINA, uma frase do que é ("O app onde a Agência CNVT planeja, produz e entrega o conteúdo dos parceiros", rascunho) e o botão "Entrar". Título real (`h1`).
2. **UZZINA:** três ou quatro linhas curtas do que o app faz (ações por parceiro, calendário e sprint, estratégias com IA, portal de aprovação para o cliente). Sem capturas de tela de dados reais.
3. **Links:** texto e destino a definir pelo proprietário (ver decisões).
4. **Agência CNVT:** frase da agência + botão para `cnvt.com.br`.
5. **Rodapé:** © ano, CNVT com link.

Ajustes técnicos que entram junto, pequenos:

- Links externos em nova aba com `rel="noopener noreferrer"`; nome acessível curto em cada botão.
- Descrição e imagem de prévia no `index.html` (a imagem precisa de arte; ver decisões).
- Retirar o código comentado.
- Medir o peso da rota `/` e, se for barato, evitar carregar o toaster e o que for só do app nessa página. Se exigir mexer na raiz do app, vira item separado para não misturar com o visual.

## O que precisa da decisão do proprietário

1. **Serviço de links:** o que ele é (página de links na bio para parceiros?), se continua sendo oferecido e para onde o botão deve ir. Hoje `cnvt.link` mostra o site da agência.
2. **Textos:** aprovar ou reescrever os rascunhos da abertura e das seções (o ticket já pede essa validação).
3. **Material de marca:** usar ou não a fonte PP Object Sans só nesta página; se há logo da CNVT e uma imagem para a prévia no WhatsApp.
4. **Tamanho:** uma tela só (como hoje, mais rica) ou página com rolagem pelas seções.

## O que dá para adiantar sem essas decisões

- Montar a estrutura da página com os textos em rascunho marcados como provisórios, numa branch de proposta, para o proprietário ver no localhost. Seção de links com o destino atual até a decisão.
- Medir o peso da rota `/` no build local e descrever o que dá para cortar.

## Verificação desta rodada

Leitura de código (`index.tsx`, `__root.tsx`, `index.html`, `Footer`, `logo`, `tailwind.css`); página em produção aberta no painel do navegador a 1024 px e 375 px (somente leitura, sem login); `cnvt.link`, `cnvt.com.br` e `/ferramentas` abertos e redirecionamentos conferidos com `curl -I`; tamanho dos arquivos iniciais medido baixando-os de produção e compactando localmente (gzip, aproximação do que o navegador recebe). Nada testado em leitor de tela.

## Modelos sugeridos

- **Claude Code** — Claude Sonnet 5.5: montar a página com os componentes Prism e conferir no navegador em claro, escuro, celular e desktop.
- **Codex** — GPT-6.1 Terra: implementar a página e investigar o corte de peso da rota `/` no build.
- **Gemini CLI** — Gemini 3.8 Flash: alternativa mais leve para a página, se o corte de peso ficar fora do escopo.
