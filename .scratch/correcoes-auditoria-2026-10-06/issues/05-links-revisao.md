# 05: Compartilhar revisão só por link limitado

**What to build:** A equipe compartilha um link que dá acesso somente às ações selecionadas de um parceiro, até expirar ou ser revogado.

**Blocked by:** 02

**Status revisado em06/10/2026:** parcial — handlers cobertos; integração/banco pendentes.

## Execução prescrita
Arquivos: app/components/features/BulkActionMenu.tsx; app/routes/dash/review.$slug.tsx; app/lib/supabase.queries.ts. Criar api/review-links.ts, api/review.ts e migration review_links.
1. review_links: id uuid PK, token_hash text UNIQUE, partner_slug text, action_ids uuid[], created_by uuid, created_at, expires_at, revoked_at. RLS fechada para anon; acesso privilegiado somente nos handlers autorizados.
2. POST review-links usa token Supabase Auth da equipe; getUser + pessoa visible=true. Admin pode selecionar ações acessíveis; colaborador somente ações em que está em responsibles. Confirmar todas pertencem ao parceiro escolhido, estão não arquivadas e IDs<=100. Zero IDs/ID indevido rejeita pedido completo. Token random32bytes, hash no banco, TTL7dias.
3. URL conserva /dash/review/$slug e troca ids por chave aleatória r. Este é um link de compartilhamento: não exige sessão de cliente. GET review valida r, expiração, revogação e slug do registro no servidor; recebe IDs exclusivamente do registro, nunca da URL. Retorna projeção usada pela revisão. Token inválido e fora do escopo:404.
4. Não aceitar formato antigo ids como autorização. Links antigos precisam ser reemitidos; registrar mudança de segurança no retorno.
5. DELETE review-links exige criador ativo ou admin e revoga. Body não muda lista, parceiro ou criador.
6. Front deixa de usar fetchReviewActions/fetchPartnerBySlug diretos nessa rota; a revisão usa uma única resposta autorizada. Remover bypass por sessão na rota pública. Sanitização segue01.

## Testes e alcance
Interface: ambos handlers reais e rota real. Alterar slug/ids não amplia resposta; token expirado/revogado recusa; colaborador não compartilha ação alheia; validação acontece antes do fetch de conteúdo público. Banco no07; N05 do17.

## Acceptance criteria
- [ ] Compartilhamento não depende de IDs adivinháveis como credencial.
- [ ] Link retorna exatamente sua lista e expira/revoga.
- [ ] Links antigos são declarados incompatíveis, sem fallback inseguro.

## Resultado do executor
Código: pendente. Teste local: pendente. Banco: verificar alcance acima. Navegador: pendente conforme17. Produção: não implantado.


## Revisão independente após execução

Leia `docs/audits/2026-10-06-revisao-tickets-05-09.md` a partir da raiz do repositório. A entrega do executor não encerrou todos os critérios deste ticket. Suíte195 passou; typecheck falhouTS7053; banco real/produção não foram homologados. Corrigir os Rxx relacionados ao ticket e registrar teste real por comportamento, distinguindo módulo isolado de integração da gaveta. Esta revisão prevalece sobre alegações gerais de conclusão do retorno.
