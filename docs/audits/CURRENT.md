# UZZINA — estado atual

Atualizado em 08/10/2026. Leia este arquivo primeiro; depois somente o material necessário à tarefa autorizada. Contratos permanentes estão no [AGENTS.md](../../AGENTS.md); execução e ambientes no [README](../../README.md).

## Publicação

- O proprietário confirmou o push. Deploy Ready e execução da nova versão no domínio público ainda não foram verificados nesta etapa.
- Produção Supabase `dfepmjcozszswocwvdpq`: fase1 compatível aplicada; Auth/bootstrap/merge de preferências e handler estrito de IA validados com conta fictícia removida. Fase2 de permissões **não aplicada**. [Roteiro e evidências](2026-10-08-publicacao-uzzina.md), [manifest](../../supabase/rollouts/uzzina-release-manifest.json).
- Antes da fase2, confirmar nova versão Ready. Depois aplicar finish-uzzina-release.sql e verificar login/home, ação/data, preferências, IA, administração, portal/revisão, upload e Leads no site. Não antecipar restrições que quebram os acessos do código antigo.
- A captura da Vercel mostra os nomes necessários; os valores e os ambientes selecionados no painel não foram inspecionados diretamente. Arquivo privado de importação UZZINA contém dez variáveis, incluindo Cloudinary. Limpeza local não altera o painel.

## Evidências disponíveis

- Código da aplicação:267 testes passaram; tipagem/lint/build passaram. A limpeza de sete arquivos sem execução foi seguida de nova tipagem/lint/build; aviso de chunks maiores que500kB permanece. [Limpeza](2026-10-08-limpeza-pos-publicacao.md).
- Staging `zacrrtilppvekiyoybzn`: Auth oficial e matriz real de IA, portal/revisão, contas/pessoas, lote e conflito passaram; fixtures removidas/restauradas. [Homologação](2026-10-07-passo-1-homologacao-staging.md). Configuração/operação específica: [staging](2026-10-07-staging-supabase.md).
- Leads `https://lead.cnvt.com.br`: formulário/API publicados; criação/edição/conclusão persistidas e negativas de acesso passaram. Em produção, acesso anônimo direto à tabela foi fechado; leitura de membro ativo e recusa de DML direto verificadas. Falta conferir lista/detalhe na UZZINA publicada. [Integração](2026-10-07-passo-2-leads-externos.md).
- Backups privados preservados fora do Git, incluindo 2026-10-08_00-29-18 anterior à fase1. Archive/hashes verificados; ensaio com dados públicos em PostgreSQL15 passou. Isso não certifica restauração integral de Supabase/Auth nem backup de mídia externa.

## Pendências reais

1. Concluir a publicação e fase2 na ordem acima; verificar interfaces/APIs públicas e negativas de acesso.
2. Validação restante em Safari/WebKit e telefone físico: teclado virtual/editor, seleção, rolagem, overlays e upload real; verificar percurso completo de foco dos fluxos restantes. Confirmações anteriores do proprietário sobre arrastes/mobile não certificam todos esses percursos.
3. Revisar avisos de plataforma/SECURITY DEFINER e defaults de supabase_admin no contexto do banco efetivo. Não presumir resolvidos pelos ensaios locais.
4. Transferência/unificação da conta de staging fica para depois da estabilização. Não migrar bancos nesta limpeza.

## Documentação e ideias

- Lista1 autorizada: enxugar AGENTS/README/CURRENT e preservar migrations/configuração. Outros grupos de arquivos seguem aguardando avaliação do proprietário; não apagar tickets, relatórios ou ideias nesta etapa.
- [TODO](../../TODO.md) é o índice dos trabalhos e ideias futuras. O plano de consumo de IA por agência permanece como especificação, sem implementação autorizada. consume_ai_usage já existe como contador técnico, distinto dessa proposta.
- Propostas de UX não implementadas permanecem na [auditoria original](2026-09-26-analise-uzzina.md); selecionar com o proprietário as relevantes ao app atual antes de remover essa fonte. Não criar documento de direção da nova versão nem promover as conversas de reescrita a tarefas neste projeto.

## Encerramento de cada tarefa

Registre arquivos alterados, verificação pertinente e pendências com escopo de evidência. Atualize este estado em vez de anexar mais diários contraditórios. Consulte os relatórios antigos apenas para uma divergência concreta; tarefas concluídas não precisam ser relidas a cada mudança.
