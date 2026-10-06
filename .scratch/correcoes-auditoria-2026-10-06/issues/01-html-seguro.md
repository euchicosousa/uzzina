# 01: HTML rico seguro nas renderizações

**What to build:** O cliente abre conteúdo rico sem executar código embutido, preservando listas, tabelas e links permitidos.

**Blocked by:** Nenhum

**Status:** implementado e validado localmente; integração/produção pendentes conforme abaixo

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

## Resultado do fechamento — Codex, 06/10/2026
Código: implementado. DOMPurify com allowlist efetiva, protocolos limitados por atributo e retorno vazio sem DOM. Payloads conhecidos neutralizados no navegador; tabelas/links permitidos preservados nos testes.
Teste local: suíte global com **116 aprovados, zero falhas** em seis arquivos; tipagem, lint e build passaram. Há testes legados de outros tickets nesta contagem; 116 não significa cobertura de todo o app.
Navegador: app real em Chromium headless com HTTP controlado, 390×844 e 1440×844; login sem recarga, política HTML, falha/sucesso de logout, recuperação de bootstrap/calendário. Smoke HTTP dos handlers locais reais: JSON, método rejeitado e JSON inválido. Nenhum dado privado consultado.
Banco: não se aplica à sanitização.
Produção: não implantado. Ticket não autoriza deploy isolado do portal; manter implantação coordenada de02–07.
Evidência e comandos: docs/audits/2026-10-06-fechamento-tickets-01-03.md. Script de navegador: scripts/check-portal-browser.cjs (requer Playwright/Chromium disponíveis).
