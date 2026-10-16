# 03: Revisar altura e rolagem do calendário do portal

**What to build:** verificar se o portal permite acessar todas as ações e semanas dentro do painel disponível, no desktop e no celular. Entregar evidência e uma conclusão; corrigir somente defeitos de altura/recorte reproduzidos nesse fluxo, quando este ticket for autorizado para execução.

**Blocked by:** None (can start immediately). A implementação do portal é independente do calendário da equipe.

**Status:** approved — revisão publicada no rastreador local.

- [ ] Comparar semana/mês com poucos e muitos itens, feed visível/oculto no desktop e abas calendário/feed no celular, incluindo janela baixa, imagens carregadas e títulos longos.
- [ ] Registrar qual elemento efetivamente rola, suas dimensões e o acesso à última ação e à última semana. Diferenciar defeito reproduzido de hipótese de inspeção textual.
- [ ] Recomendação a validar: painel limitado à janela, grade com rolagem vertical e dias dimensionados pelo conteúdo, sem piso artificial de 120 px nem preenchimento obrigatório que produza espaço vazio. Não introduzir limite ou menu por dia apenas para imitar a equipe.
- [ ] Se já houver acesso correto ao conteúdo e o espaço observado for justificado pelo layout, encerrar com evidência e recomendação, sem refatoração preventiva.
- [ ] Se houver defeito reproduzido, aplicar a menor correção na cadeia de altura/rolagem, com regressão no componente real antes da correção e conferência posterior no navegador. Mudança de política visual além do escopo descrito exige nova decisão, não implementação automática.
- [ ] Preservar feed, abertura da ação e renderização pública de conteúdo sem providers privados. Nenhuma mudança de autenticação, API ou SQL.
- [ ] Registrar resultado e limites na documentação. Se houver código, executar testes pertinentes, format, lint, typecheck e build; se for apenas revisão, conferir referências e diff. Sem deploy neste ticket.
