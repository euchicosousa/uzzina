# C01: Persistir propostas com autorização e erros recuperáveis

**Status:** completed — storage isolado por parceiro e usuário, versionamento e migration preparada em supabase/migrations/20261102120000_social_plans.sql

**Blocked by:** C00/D1 para fixar a política de compartilhamento. Inventário e remoção da exposição local podem ser preparados antes.

**Prioridade:** P1

**Instrução de execução:** ler o README desta série; executar apenas este recorte, preservar mudanças externas e respeitar os bloqueios acima.
**What to build:** A pessoa autorizada salva, edita e reabre a mesma proposta em outro navegador, com isolamento entre contas e parceiros e mensagem real quando o salvamento falha.

## Problema comprovado

A chave global `uzzina_social_plans` permite listar todos os planos sem parceiro. Não há banco para propostas nem isolamento por identidade; `saveSocialPlan` esconde erro de quota. Trocar de conta mantém os dados da anterior.

## Pontos de entrada

- `app/lib/social-planning/storage.ts`, `types.ts`.
- `app/routes/app/planejamento.tsx`: lista, abertura e mutações de sugestões.
- Models e query keys existentes; singleton de sessão e reset de cache.
- Contratos de autorização vigentes; não copiar cegamente uma migration antiga.

## Passos obrigatórios

1. Inventariar todos os consumidores de storage, incluindo generator, editor e finalizer. Definir uma única fronteira de leitura/escrita do Planejamento em models/services; rota/componente não chama `.from()`.
2. Após D1, preparar persistência canônica de proposta, configuração completa, sugestões com IDs estáveis, decisões, timestamps e versão. Preservar distinção draft/finalized. Usar tipos validados, não `Record` sem validação nos limites.
3. Proteger leitura, criação e alteração no servidor/banco usando sessão real e parceiro autorizado. Revalidar autorização de parceiro em cada operação. IDs da URL/payload não autorizam acesso.
4. Fazer lista/detalhe/mutações usarem essa fronteira. Sem parceiro válido, mostrar seleção e não listar planos de todos os usuários. Chaves de cache incluem identidade e escopo.
5. Remover o uso automático dos registros antigos sem dono. Não atribuir a chave legada ao próximo usuário e não importá-la para o banco automaticamente. Documentar que esses dados não têm autoria confiável; não apagá-los silenciosamente.
6. Salvar somente após confirmação canônica. Distinguir carregamento, vazio, falha e conflito. Falha preserva edição e oferece retry; não mostrar “salvo” nem atualizar estado confirmado antecipadamente.
7. Usar versão esperada nas mutações para não sobrescrever edição remota em silêncio. Resposta antiga de sessão/parceiro/proposta não atualiza a tela ou cache atual.
8. Publicar no documento do ticket a interface final dos models, estados de erro e schema para C05–C09. Evitar refatoração de models de outras funcionalidades.
9. Preparar migration incremental; verificar catálogo antes de aplicar. Preparar SQL não equivale a aplicar. Atualizar guias/KIs exigidos pelo AGENTS quando houver alteração de banco/model.

## Verificação necessária pelo risco

Em ambiente controlado: usuário A/B com escopos diferentes; acesso por ID manipulado; parceiro arquivado/revogado; duas edições com a mesma versão; falha de escrita e retry; logout durante resposta; reabertura em outro navegador. Nenhuma fixture em produção.

## Acceptance criteria

- [ ] Conta B não vê nem altera proposta de A fora da política D1.
- [ ] Ausência de parceiro não expõe a coleção global local.
- [ ] Edição/aprovação/rejeição confirmadas sobrevivem à reabertura em outro dispositivo.
- [ ] Falha de persistência aparece ao usuário e conserva o rascunho.
- [ ] Dados legados sem dono não são importados/expostos automaticamente.
- [ ] Conflito e sessão antiga não sobrescrevem uma versão nova.
- [ ] Aplicação de SQL e publicação são reportadas separadamente, sem alegar deploy.

**Não fazer:** apenas prefixar localStorage por usuário e chamar isso de persistência compartilhada; usar service-role no navegador; ampliar RLS de ações; implementar o gerador real ou finalização neste ticket.
