# 44 — Investigar componentes personalizados substituíveis por Prism

**Resumo:** Mapear controles e estilos próprios que repetem recursos Prism e propor sua padronização para dar consistência à interface.

**What to build:** um parecer executável, por componente e consumidor real, indicando onde substituir implementação/estilo personalizado por PrismButton, PrismBadge, PrismInput, PrismTabs e demais primitivos existentes. A entrega é investigação com propostas priorizadas; não iniciar uma migração geral nesta rodada.

**Blocked by:** nenhum. Ler o estado atual e coordenar um escritor por checkout.

**Status:** ready-for-agent — somente investigação, criado em 05/11/2026.

- [ ] Inventariar controles HTML manuais, wrappers, componentes próprios, cópias e overrides visuais que reproduzem primitivos Prism. Localizar usos operacionais, não apenas exemplos.
- [ ] Produzir matriz com componente atual, usos, personalização observada, equivalente Prism disponível, diferença funcional/acessível, risco e proposta concreta. Distinguir substituição direta de adaptação necessária.
- [ ] Priorizar tamanhos, variantes, cores semânticas, tipografia, foco, disabled/loading, layout de popovers e controles criados sem necessidade. Favorecer props/tokens padrão; não recriar o desenho do Prism com classes locais.
- [ ] Separar apresentação arbitrária de regras de negócio, dados, FormData, teclado e contratos dos consumidores. Padronizar não significa apagar comportamento exigido. Aproveitar o estudo V36: UAvatar já compõe Prism e possui adaptações reais; não presumir que todo prefixo U deve desaparecer.
- [ ] Comparar estados normal/hover/foco/desabilitado/carregando e tamanhos nos temas e larguras pertinentes. Registrar o que foi observado no navegador e o que é somente análise de código; não certificar visual por typecheck.
- [ ] Propor lotes pequenos com benefício claro, dependências reais, critérios de aceite e componentes legados removíveis. Evitar novos arquivos que só reexportam o nome antigo ou wrappers vazios.
- [ ] Registrar exceções justificadas e decisões visuais que precisam do proprietário; não introduzir variantes/tamanhos extras sem necessidade concreta. Não alterar APIs, fluxos, banco ou regras de negócio para forçar uma substituição.
- [ ] Entregar recomendação priorizada e roteiro curto de validação por lote. Atualizar ticket e lista geral. Nenhuma refatoração, teste amplo por rotina ou publicação nesta entrega de estudo.

Solicitado pelo proprietário em 05/11/2026 após ajustes no gerenciador de conteúdo e identificação de botões personalizados desnecessários.
