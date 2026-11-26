# Encontrar e excluir arquivos sem uso no Cloudinary

**Status:** publicado. Reaberto em 26/11/2026. O proprietário executou a exclusão em Administração → Cloudinary, mas a contagem de candidatos sem vínculo permaneceu igual. A exclusão e a atualização do catálogo precisam ser reconciliadas.

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

## Contador após exclusão — 26/11/2026

As capturas mostram 303 candidatos antes da exclusão, 301 após a confirmação
de dois arquivos e 303 na releitura. A consulta somente de leitura ao ambiente
do Cloudinary dos prints confirmou que os dois IDs continuam visíveis na API
como `placeholder: true`, `backup: true` e zero bytes. O catálogo devolveu
219 registros com o marcador de backup. A aplicação contava esses registros
como arquivos ativos.

A listagem passou a ignorar o marcador explícito do provedor ao montar as
listas e totais. A confirmação do lote verifica os IDs respondidos como
excluídos e aceita apenas os que desapareceram ou ficaram como registro de
backup. Se a API ainda mostrar o arquivo ativo ou a verificação falhar, a
tela informa a divergência. A correção preserva os backups.
