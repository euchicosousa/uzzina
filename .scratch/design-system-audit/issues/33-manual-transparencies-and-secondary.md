# DS33 — Transparências escritas à mão e o novo secundário

**Status.** Aberto em 17/11/2026. Inventário e proposta antes de alterar código.

## O que é

Com o DS28, o secundário ficou opaco e ganhou um hover próprio. Restam três coisas fora da regra:

1. **Transparências escritas à mão** sobre o texto principal, contadas em 17/11: `border-foreground/10` (18), `text-foreground/40` (16), `border-foreground/5` (11), `border-foreground/15` (7), `text-foreground/80` (6), `bg-foreground/50` (4) e outras ~15. A borda de container (`border-foreground/5` claro, `/10` escuro, decidida no DS24) e o texto suave (texto principal a 40%) foram aprovados, mas não viraram token.
2. **Hover do secundário:** 14 arquivos usam `hover:bg-secondary` ou `data-[hovered]:bg-secondary`. Botões que já são `bg-secondary` precisam passar a `bg-secondary-hover` no hover; hoje não mudam de cor ao passar o mouse sobre eles mesmos.
3. **Secundário sobre superfícies coloridas** (cartão de fase, área colorida de admin no menu, imagem): agora é um cinza sólido calculado do fundo da página; antes era uma película. Também `bg-secondary/50`, `/80` e `/20` (5 usos).

## O que será entregue

- Inventário por arquivo, classificado: vira `border-container`, vira `text-soft`, vira `bg-secondary-hover`, continua transparente de propósito (película, ícone sobre imagem, `image-icon`).
- Proposta de dois tokens (`--text-soft` e `--border-container`, já escritos em `novo/tailwind-novo.css`) com nomes de classe.
- Depois do ok: troca nos componentes e na galeria `/ui`.

## Relação com o DS23

O [DS23](23-opaque-surface-aware-colors.md) propunha cores opacas calculadas pela superfície onde o item está. O proprietário escolheu calcular pelo fundo da página (DS24/DS28). Proposta: encerrar o DS23 como substituído por DS28 + DS33, levando para cá os casos de superfície colorida.

## Decisões em aberto

- [ ] Encerrar o DS23 como substituído?
- [ ] Nomes das classes dos dois tokens novos.

## Modelos sugeridos

- **Claude Code — Haiku 5.5.** Inventário por busca no código.
- **Claude Code — Sonnet 5.5.** Troca nos componentes com conferência visual nos dois modos.
- **Gemini — Gemini 4 Argon (Medium).** Alternativa para o inventário.
