# Excluir definitivamente um parceiro arquivado

**Status: concluído (25/11/2026).** Implementado e publicado (`api/admin-cleanup.ts`, página `app/routes/app/admin/partner/$slug_.delete.tsx`); o proprietário já excluiu um parceiro arquivado pela tela. Histórico: proposto.

**Bloqueado por:** Nenhum

## Resultado esperado

Na gestão de parceiros, permitir abrir um parceiro arquivado e escolher Excluir. O diálogo informa as ações e os demais registros afetados, com nomes e quantidades, antes da confirmação.

## Critérios de aceite

- [ ] Levantar relações reais de ações, contas, pessoas, tópicos, propostas, arquivos, permissões e vínculos antes de definir a operação.
- [ ] Apresentar ao proprietário proposta para ações compartilhadas por mais de um parceiro e para contas ou arquivos compartilhados. Somente executar a decisão aprovada.
- [ ] Permitir ao administrador revisar ações afetadas e confirmar a exclusão definitiva do parceiro e das ações acordadas, com autorização verificada no servidor e banco.
- [ ] Preservar integridade se houver erro ou repetição e apresentar resultado claro.
- [ ] Relacionar os arquivos eventualmente órfãos à limpeza separada do Cloudinary, incluindo compartilhados e referências externas, sem apagar mídias ainda em uso.
- [ ] Usar dados fictícios para validar fluxo, autorização e falha parcial. A exclusão real exige escolha e confirmação pelo proprietário.

## Modelos sugeridos

- Codex — gpt-6.2-astra. Adequado para verificar os riscos e os contratos do fluxo.
- Codex — gpt-6.2-sol. Alternativa para execução cuidadosa com menor custo.
- Codex — gpt-6.1-terra. Alternativa para conferir a interação visual e os estados.
