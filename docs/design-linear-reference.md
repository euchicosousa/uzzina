# Referência medida: Linear (02/11/2026)

Valores lidos do estilo calculado no navegador (`getComputedStyle`), workspace Agência CNVT, tema claro, janela 1270×919. Servem como referência de linguagem visual para a UZZINA; não copiar marca, ícones ou textos.

## Estrutura da página

| Elemento | Medida |
| :--- | :--- |
| Barra lateral | 244px de largura, fundo um tom abaixo do conteúdo (`#efeff0` claro / `#09090a` escuro) |
| Painel de conteúdo | afastado 8px do topo/direita/baixo da janela, raio 12px, borda 1px quase invisível (`lch 95`), sombra mínima (`0 3px 6px -2px` a 2%) |
| Recuo interno do painel | 9–12px nas barras; listas ocupam a largura toda |
| Barra superior (breadcrumb) | 44px de altura, texto 13px/500 |
| Barra de filtros/visualização | 44px de altura, separada por borda 1px |

## Tipografia (Inter)

| Uso | Tamanho / peso / entrelinha |
| :--- | :--- |
| Título de página (detalhe, configurações) | 24px / 500–600 / 32px, tracking −0.16px |
| Título de seção | 15px / 500–600 / 23px |
| Texto de descrição | 15px / 450 / 24px |
| Texto padrão da interface (itens, linhas, títulos de card) | 13px / 500 |
| Secundário (ID, datas, ajuda, rótulos de grupo) | 12px / 450–500, cor ~40% |
| Botões e pílulas | 12px / 500 |

Só três tamanhos fazem quase toda a interface: 12, 13 e 15px. Peso máximo 600.

## Alturas e espaçamentos

| Elemento | Medida |
| :--- | :--- |
| Botões, botões de ícone, abas/chips da barra | 28px (ícone 28×28, pílula `9999px`) |
| Pílulas de propriedade (status, prioridade) e selects compactos | 24px |
| Select em formulário de configuração | 30px, raio 8px, padding 10px |
| Item da barra lateral | 28px, raio 8px, 1px entre itens |
| Linha da lista | 44px (conteúdo de 36px) |
| Cabeçalho de grupo da lista | 36px, raio 8px, fundo um tom abaixo |
| Popover (Display) | 300px de largura, padding 16px, linhas a cada 32px, separadores 1px |
| Modal de criação | 750px, conteúdo recuado 20px, título 18px/600, descrição 15px/450 |
| Quadro: coluna | 348px, padding 12px |
| Quadro: card | raio 8px, padding 12px, 8px entre cards, título 13px/500/16px, meta 12px |
| Configurações | coluna de 640px centralizada; título a 64px do topo; 32px até a 1ª seção; 16px do título da seção ao grupo; ~48px entre seções |
| Linha de configuração | 66px, padding 16px, rótulo 13px/500 + ajuda 12px/450; controle alinhado à direita |

## Cor e superfícies

- Cinzas quase neutros em LCH (croma 0–1.25, matiz 282). Texto principal `lch 10`, secundário `lch 38–40`.
- Fundo da página `lch 98`; cards e campos `lch 100`; hover/selecionado `lch 94–95`; borda `lch 95` (clara) a `lch 86` (controles).
- Um único acento (roxo `lch 53 52 287`) no botão principal e nos toggles ligados.
- Controles secundários: fundo branco com borda 1px, sem sombra; o principal tem sombra mínima.

## Observações de comportamento

- Criar issue: modal com "Create more" mantém o modal aberto e Cmd+Enter cria; toasts empilhados no canto inferior direito.
- O detalhe abre em página própria, com propriedades numa coluna à direita (pílulas de 28px sem borda).
- As configurações usam grupos com fundo branco e raio 10px. Isso diverge da regra atual da UZZINA de não encaixotar formulários e precisa de decisão do proprietário.
