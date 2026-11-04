# 43 — Substituir UToggleInput por PrismToggle preservando formulário

**What to build:** usar PrismToggle no controle Arquivado do cadastro de parceiro, preservando formulário, autosave e estados existentes, e remover o wrapper redundante após migração.

**Blocked by:** nenhum. Executor Gemini.

**Status:** completed

- [x] Confirmar consumidores. O estudo encontrou um uso operacional no cadastro administrativo do parceiro e outro na galeria. Não há uso operacional de radio.
- [x] Substituir por PrismToggle controlado com isSelected/onChange, mantendo rótulo, ícone, nome acessível, disabled e teclado. Controlar type=button para não submeter formulário por acidente.
- [x] Preservar FormData: quando marcado, enviar archived com valor on; desmarcado não enviar esse valor. Usar campo oculto ligado ao mesmo estado e conferir a interpretação atual do handler de salvamento.
- [x] Preservar autosave, tratamento de falha/retry, alterações locais e proteção contra respostas antigas. Troca de parceiro/sessão não pode reaproveitar o estado Arquivado do parceiro anterior.
- [x] Usar variante Prism existente e tokens de estado. Se a indicação destrutiva de Arquivado exigir nova variante, documentar a necessidade concreta e obter definição visual antes de inventar estilo local.
- [x] Migrar a galeria para demonstrar o controle e sua integração de formulário, preservando o link antigo da seção ou redirecionando-o. Não deixar exemplo de wrapper removido.
- [x] Remover UToggleInput e exports apenas após busca completa de referências. Não reconstruir suporte radio que não tem consumidor operacional.
- [x] Conferir marcar/desmarcar e conteúdo de FormData, submissão manual sem duplicação, autosave e falha, disabled, Espaço/Tab, troca de parceiro e temas. Testar por fixtures controladas, sem gravar dados de teste em produção.

Referência em docs/audits/2026-11-04-component-consolidation-studies.md. Começar CURRENT/AGENTS, conferir Git e preservar alterações externas. Registrar comportamento verificado e pendências visuais no ticket/CURRENT/relatório central. Sem publicação automática.
