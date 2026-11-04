# C09: Finalizar aprovadas atomicamente sem duplicação e para membros

**Status:** completed — finalização idempotente por created_action_id, responsibles de membro comum garantidos, validação estrita de data e relatório de falhas parciais

**Blocked by:** C01 e C06; C00/D5. Não depende de C05/C07 para implementar com proposta canônica controlada.

**Prioridade:** P1

**Instrução de execução:** ler o README desta série; executar apenas este recorte, preservar mudanças externas e respeitar os bloqueios acima.
**What to build:** Confirmar finalização cria exatamente uma ação por sugestão aprovada elegível, ou nenhuma se a operação falhar antes de confirmar. Repetir a mesma finalização retorna os vínculos já criados.

## Pontos de entrada

`app/lib/social-planning/finalizer.ts`; `handleFinalize` na rota; botão em `PlanningSuggestionsList.tsx`; contrato canônico C01; `createActionDraft`/`resolveDraftPartners` em factory; schema/mutações de ações e autorização atual.

## Passos obrigatórios

1. Registrar D5 antes de fixar campos/data/horário/fuso/responsáveis e comportamento de pendentes. Remover defaults implícitos “10:00” e “hoje”. Para tema sem data, coletar o dado aprovado antes de confirmar; não salvar ações sem essa decisão.
2. Mostrar resumo: parceiro, aprovadas, pendentes, rejeitadas, quantidade elegível e datas. Somente aprovadas entram; pendentes seguem D5. Aprovar item não cria ação.
3. Substituir loop de INSERTs no navegador por operação transacional autorizada no servidor/banco. A mesma transação verifica versão, seleciona sugestões canônicas, cria ações, grava vínculos e finaliza. Uma falha reverte o conjunto inteiro.
4. Criar vínculo durável e unicidade por sugestão. Se necessário incluir parceiro/proposta no vínculo para integridade, usar chaves verificadas. Controle de clique é conveniência; unicidade e transação são a garantia.
5. Duas requisições/abas concorrentes não duplicam. Resposta perdida: consultar operação/vínculos canônicos antes de tentar de novo. Proposta já finalizada retorna resultado existente; não reexecuta INSERT.
6. Revalidar ator ativo, acesso ao parceiro, autoria/permissão D1, versão e estado no momento da transação. Navegador não escolhe IDs aprovados ou responsáveis para contornar autorização.
7. Mapear campos/defaults pelo fluxo canônico de criação e D5. Conferir especificamente responsáveis: membro comum precisa cumprir o contrato real de autorização; não preencher só `user_id`. Não afrouxar RLS de ações para fazer funcionar e não usar uma função privilegiada sem todas as verificações.
8. Respeitar categoria/formato e estados distintos de ação. Não gerar conteúdo final, legenda ou roteiro ausentes na proposta.
9. UI só anuncia sucesso após confirmação completa. Mostrar falha/conflito/resultado incerto corretamente; nunca “0 ações criadas com sucesso” após erro. Finalizado desabilita nova conversão e permite consultar resultado existente.
10. Atualizar cache de ações somente com versões canônicas e escopo conhecido; invalidar o necessário quando escopo for desconhecido. Respostas de sessão antiga não entram no cache atual. Antes de iniciar/reconciliar escrita conferir continuidade da sessão.
11. Exclusão posterior de ação ou perda de acesso não apaga vínculo de conversão nem faz retry recriá-la. Não expor ação agora inacessível.
12. Nova geração explícita é independente e pode criar novas ações em nova finalização. Não deduplicar por título/período nem buscar ações antigas para reduzir quota da proposta.

## Casos obrigatórios em ambiente controlado

- A/B/C aprovadas; erro na criação de B: zero ações/vínculos novos, proposta não finalizada.
- Retry após corrigir erro: três ações; segundo retry: mesmas três, nenhuma extra.
- Dois pedidos concorrentes e resposta perdida: um único conjunto canônico.
- Membro autorizado e administrador funcionam; membro alheio, parceiro arquivado, versão antiga e payload adulterado falham sem escrita parcial.
- Sessão trocada não inicia próxima operação nem adota resultado antigo.
- Pendentes, rejeitadas e ausência de data seguem D5.
- Excluir uma ação e repetir finalização não a recria.

## Acceptance criteria

- [ ] Associação e criação são realmente atômicas e idempotentes no banco, demonstradas pelos casos acima.
- [ ] Membros comuns funcionam sem ampliar permissões.
- [ ] Nenhuma falha parcial recebe status finalizado ou mensagem de sucesso.
- [ ] Data/hora/fuso e pendentes têm decisão documentada; nenhum default inventado.
- [ ] Resultado final inclui vínculos canônicos e cache correto.
- [ ] Preparação de SQL, aplicação e implantação são evidências separadas.

**Não fazer:** compensar INSERTs com deletes posteriores, confiar somente em botão desabilitado, guardar IDs apenas em localStorage ou alterar estratégias09.
