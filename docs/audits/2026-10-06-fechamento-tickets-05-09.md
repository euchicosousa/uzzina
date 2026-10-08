# Correções dos tickets05–09 — 06/10/2026

Implementação local realizada após a revisão independente; iniciada em06/10 e encerrada em07/10/2026. Durante a execução HEAD avançou de fd66021 para0f8c637 por trabalho externo; alterações externas preservadas e resultado conjunto revalidado. O usuário informou que a mudança de data pela gaveta voltou a funcionar depois da correção do executor; esta rodada preservou esse comportamento e corrigiu os demais defeitos identificados. Não houve implantação nem alteração de dados reais.

## Resultado por ticket

| Ticket | Correção atual | Evidência / pendência |
|---|---|---|
| 05 — revisão | Bodies POST/DELETE validados em runtime; revogação confirma linha atualizada. Tokens aleatórios/hash/expiração e autorização do executor preservados. | Handlers reais testados com SDK controlado. Fluxo completo com banco real/link público permanece pendente. |
| 06 — contas | Body inteiro e parceiros validados antes de efeitos; PATCH usa uma RPC transacional para campos/senha/sessões. DELETE/PATCH não confirmam conta inexistente. | Regressão senha+parceiro inválido demonstra ausência de efeito antes400. SQL transacional preparado; atomicidade física ainda não demonstrada. |
| 07 — banco | RLS de comentários depende da ação autorizada; tratamento das policies anteriores; funções com search_path fixo; bootstrap sem arquivados; get_home_actions respeita período; grants de people separam perfil e administração via RPC autorizada. | Revisão estática e matriz preparada, incluindo auth.users, rejeições esperadas e checks anon independentes. NÃO executado no PostgreSQL. Inventário real continua obrigatório. |
| 08 — conflito | PATCH individual só envia alterações/versão recebida. Timestamp do cliente removido desses caminhos. Desfazer arquivamento usa versão confirmada. Trigger preparado protege timestamp canônico e exige revisão se detectar outro writer. | Mutations reais exercitadas com adaptador externo controlado. Concorrência no PostgreSQL e migrations pendentes. Lotes/arrastes pertencem11/12. |
| 09 — gaveta | Criação manual envia draft completo; fila preserva edições durante INSERT/UPDATE; fechar sem editar não grava; erros mantêm texto/painel; comparação antes de rebase; proteção inclui overlay/troca; inicialização única por abertura evita anexos de outra ação; geração de IA impede troca enquanto aguarda resposta. | Coordenador e componente real testados. Navegador real desktop1440/mobile390: data, no-op, erro e retry passam, com HTTP controlado. |

## Correspondência com a revisão anterior

R01: substituído forceSave sem versão por leitura/comparação/rebase e PATCH com versão atual.
R02–R05: draft completo, registro das edições e proteção compartilhada para fechamento/troca; confirmação mescla campos pendentes.
R06: diferença contra confirmação elimina gravação sem mudança.
R07: desfazer usa updated_at da resposta de arquivamento.
R08–R11: preparação SQL e conta transacional corrigidas; homologação real continua aberta, especialmente matriz completa cliente/review/concorrência.
R12: timestamp removido dos PATCH individuais e caminho de anexos do portal; operações em lote aguardam11.
R13: geração do coordenador descarta resposta de contexto anterior; abertura do painel usa chave própria e estado novo.

Achados adicionais da revisão final: estado de anexos e rascunho anterior não eram reinicializados em todas as trocas; simplificados com remount por abertura e remoção do bloco duplicado. Troca enquanto IA gera é bloqueada para impedir aplicar resposta à ação seguinte. DELETE de conta inexistente e checks anon interrompidos prematuramente também corrigidos.

## Testes observados

- 207 testes passam,0 falham,620 assertions em14 arquivos.
- Tipagem e lint passam; build passa com aviso já existente de chunk acima500kB.
- Regressões com RED observado antes da correção: fechar sem alteração gravava; criação manual perdia campos; PATCH de conta podia alterar senha antes de rejeitar parceiros.
- `tests/drawer-component.test.tsx` monta a gaveta, hooks, editor, validação e QueryClient reais. Só a fronteira Supabase é controlada. Cobre criação manual, fechamento, erro, edição duranteINSERT e nova ação sem anexos anteriores.
- `scripts/check-drawer-save-browser.cjs` abre a aplicação real em Chromium e captura PATCH/versão. HTTP externo substituído por fixtures e bloqueado para impedir contato com produção. Desktop testa clique externo; mobile testa botãoFechar. Seleção do dia ativa o botão do calendário por DOM; não certifica gestos touch.
- Testes estruturais SQL não comprovam autorização física, transações nem integração dos portais.

## Manutenção e continuidade

O coordenador foi consolidado em156 linhas; o bloco duplicado de reinicialização da gaveta foi removido. Mantidas bibliotecas, estilo e fluxo do produto. Não criado serviço/framework geral de salvamento.

A continuidade agora entra por [CURRENT.md](CURRENT.md). Ele aponta apenas o próximo ticket e arquivos necessários. O pacote anterior e o retorno do Gemini preservam registro histórico, sem exigir releitura integral a cada tarefa.

Um agente deve escrever por vez no checkout; revisores trabalham em leitura. Na retomada07/10, preservados os tipos e preenchimento de user_id trazidos pela alteração externa. INSERT mantém timestamps iniciais exigidos pelo schema atual; PATCH ignora timestamps recebidos como alterações e condiciona a gravação à versão do banco. Não presumir defaults de migration ainda não aplicada. Resultado conjunto revalidado após essa compatibilização.

Próxima correção proposta:10/cache. Depois11/lotes e12/arrastes, em entregas separadas. Validar banco de teste antes de publicar dependências das novas RPCs. Preparação de segurança não deve ser confundida com proteção já aplicada ao Supabase real.
