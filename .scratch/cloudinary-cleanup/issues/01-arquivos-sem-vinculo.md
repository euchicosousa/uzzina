# Encontrar e excluir arquivos sem uso no Cloudinary

**Status: implementado e publicado (25/11/2026), ainda não testado pelo proprietário** (`app/routes/app/admin/cloudinary.tsx`, `api/admin-cleanup.ts`). Reabre se houver erro. Histórico: proposto.

**Bloqueado por:** Nenhum

## Resultado esperado

Criar um local administrativo para comparar os arquivos do Cloudinary com os arquivos usados pela UZZINA e apresentar candidatos à exclusão para revisão.

## Critérios de aceite

- [ ] Inventariar todas as referências, incluindo arquivos de trabalho, Instagram, avatares, logotipos, anexos, conteúdo público e outras fontes existentes. Investigar arquivos externos ao app e versões de URL transformadas antes de classificar.
- [ ] Consultar o catálogo completo do Cloudinary com paginação e tipos de mídia, identificar arquivos de forma estável e exibir resultados e cobertura da análise.
- [ ] Mostrar os candidatos sem vínculo com prévia, tamanho, origem e seleção, com contagem e estimativa de espaço recuperável.
- [ ] Conferir novamente os vínculos antes da exclusão e tratar uploads em andamento, inconsistências e falhas parciais.
- [ ] Exigir revisão e confirmação explícita da seleção. Manter fora da lista de exclusão arquivos de uso desconhecido ou com referências incertas até esclarecer.
- [ ] Validar com catálogo fictício, arquivos compartilhados e URLs transformadas, sem excluir arquivos reais durante a investigação.

## Modelos sugeridos

- Codex — gpt-6.2-astra. Adequado para verificar os riscos e os contratos do fluxo.
- Codex — gpt-6.2-sol. Alternativa para execução cuidadosa com menor custo.
- Codex — gpt-6.1-terra. Alternativa para conferir a interação visual e os estados.
