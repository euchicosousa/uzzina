# V49 — Conferir referências restantes a UToggleInput

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Terra, para reproduzir o caso e verificar a solução.
- **Anthropic** — Claude Haiku 5.5, para conferir os contratos e os cenários de aceite.
- **Google** — Gemini 3.8 Flash, para executar o recorte e conferir o resultado.

**Bloqueado por.** Nenhum.

## Entrega e aceite

A busca encontrou o nome no menu /ui e no exemplo de formulário já migrado para PrismToggle. Confirmar se há implementação ou consumidor legado. Retirar nomes e referências obsoletas e manter o exemplo de FormData se ele tiver utilidade como documentação Prism. Conferir links antigos da galeria.

## Status: Concluído

- Confirmado que não há implementação legada (`UToggle.tsx` já havia sido excluído no V43) nem consumidores de `UToggleInput` no app (todos usam `PrismToggle` diretamente).
- O exemplo de integração com formulário (`FormData`) foi movido diretamente para `ToggleSection.tsx` sob o id de âncora `prism-toggle-form` ("Integração com Formulário (FormData)"), integrando a documentação oficial do `PrismToggle`.
- Removido `UzzinaToggleInputSection.tsx` e todas as referências ao nome `UToggleInput` de `app/routes/ui.tsx` e `app/components/ui-sections/index.ts`.
- Links legados na galeria com `#uzzina-toggle-input` são redirecionados suavemente para `#prism-toggle-form` na aba de Componentes de UI.
- Typecheck limpo.
