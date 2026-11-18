# DS34 — Cores do widget do Cloudinary ligadas aos neutros

> **Absorvido pelo [DS35](35-unified-surfaces-and-neutrals.md) em 17/11/2026 como fase 5 (ferramentas que dependem do contrato).** Este arquivo continua como detalhe; o status e a ordem valem pelo DS35.

**Status.** Aberto em 17/11/2026. Decisão A7 do DS25 (17/11): o widget de envio de arquivos segue os neutros do tema. Nada aplicado.

## O que é

A janela de envio de arquivos do Cloudinary (gaveta de ação → Arquivos/Instagram → enviar) tem cores fixas no código (`app/components/features/media/CloudinaryUpload.tsx`, opção `styles.palette`). Não acompanha o tema nem o modo escuro.

## O que será mudado

Ler, no momento de abrir o widget, os valores calculados de `--background`, `--card`, `--border`, `--foreground`, `--secondary-foreground`, `--primary` e semânticas, e passá-los em hexadecimal ao widget (ele não entende `oklch` nem variáveis CSS).

## Observação

O [UP01](../../file-upload/issues/01-own-upload-dropzone.md) estuda trocar o widget por um envio próprio. Se o UP01 for aprovado, este ticket perde o sentido; decidir a ordem.

## Decisões em aberto

- [ ] Fazer agora ou esperar a decisão do UP01?

## Modelos sugeridos

- **Claude Code — Haiku 5.5.** Mudança local em um componente, com conversão de cor já existente em `app/utils/color.ts`.
- **Claude Code — Sonnet 5.5.** Se a conversão `oklch` → hex precisar de função nova.
- **Gemini — Gemini 4 Flash.** Alternativa leve para o mesmo ajuste.
