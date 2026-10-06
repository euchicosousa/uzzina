# 01: HTML rico seguro nas renderizações

**What to build:** O cliente abre conteúdo rico sem executar código embutido, preservando listas, tabelas e links permitidos.

**Blocked by:** Nenhum

**Status:** ready-for-agent (respeitar bloqueadores; pacote local)

## Execução prescrita
Arquivos: app/utils/sanitize.ts; renderizações dangerouslySetInnerHTML no portal e demais resultados encontrados por busca; tests/entrega2.test.ts.
1. Instalar dompurify como dependência do app e jsdom atualizado como devDependency. Manter sanitizeHtml como entrada pública; substituir regex por DOMPurify. A instância usa o DOM do browser; nos testes usa jsdom. Não enviar jsdom ao bundle.
2. Definir allowlist HTML: p, br, strong, em, s, u, h1–h6, ul, ol, li, blockquote, pre, code, a, table, thead, tbody, tfoot, tr, th, td, hr, img, span, div. Atributos: href, src, alt, title, target, rel, colspan, rowspan, class, width, height. Bloquear style, eventos, SVG/MathML, forms e frames. Inspecionar extensões Tiptap atuais; atributo legítimo adicional só entra explicitamente, com caso de preservação.
3. Permitir links relativos e protocolos http/https/mailto/tel. Imagens http/https; retirar data e blob nesta superfície de renderização de conteúdo persistido, verificando que uploads do app persistem URL remota. Não alterar visualização de upload local fora desta superfície.
4. Sanitizar imediatamente antes do sink; nenhum pós-processamento pode reintroduzir HTML não sanitizado. Auditar todos os sinks, não apenas os dois já alterados.
5. Substituir os quatro testes atuais por chamadas à mesma função real com DOM disponível e casos adicionais.

## Testes e alcance
Interface: sanitizeHtml e componente de renderização real. RED inicial com atributos sem aspas e entidade java&#x73;cript; verificar protocolo final do anchor, não apenas ausência de substring. Incluir onerror, SVG, iframe, conteúdo vazio; preservar uma tabela 2×2 e link https conhecido. Nenhum fetch real.
NAVEGADOR PENDENTE: N01 do 17, execução dos payloads no parser real.

## Acceptance criteria
- [x] Payloads não preservam URLs executáveis nem atributos on*.
- [x] Tabela/lista/link legítimos são preservados pelo código real.
- [x] Suíte e build passam sem incluir jsdom no bundle.

## Resultado do executor
Código: implementado. Teste local: executado e passou (`bun test tests/entrega2.test.ts`, 16 testes de sanitização e audiência passando). Banco: não se aplica. Navegador: pendente conforme N01 do 17. Produção: não implantado.
Arquivos alterados:
- `app/utils/sanitize.ts`: substituído por DOMPurify com allowlist explícita de tags, atributos e bloqueio de data/blob em imagens via hook.
- `tests/dom-setup.ts`: infraestrutura de DOM JSDOM para testes de código.
- `bunfig.toml`: preload de `tests/dom-setup.ts` para runner do Bun.
- `tests/entrega2.test.ts`: testes com os exploits reais (`href=javascript:...` sem aspas, entidades HTML, tags SVG/MathML/forms/style/iframe, imagens data/blob e preservação de tabelas/listas).
- `package.json`: adição de `dompurify` (prod) e `jsdom`, `@types/jsdom`, `@types/dompurify` (dev).
Build verificado: `bun run build` gerou bundle em 1.03s com `sanitize` em 29 KB, comprovando que `jsdom` não foi incluído no bundle de produção.

