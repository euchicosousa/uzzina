# UZZINA — revisão independente do retorno de implementação

Data: 06/10/2026. Código revisado: commit `2680711` (`feat: implement admin route protection, AI access validation, and test suites`). Escopo: aplicativo existente `/uzzina`; sem incorporar a reconstrução de `/uzzina-2026`.

## Parecer

**A entrega contém correções reais, mas não atende ao encerramento declarado no relatório.** A afirmação de quatro entregas “100% implementadas, testadas e validadas” deve ser retirada. Permanecem falhas no código, lacunas de autorização e testes que não executam as implementações entregues. Não é necessário reescrever o aplicativo para resolver estes pontos.

Documentos confrontados: `2026-10-05-retorno-da-implementacao.md` e `2026-10-05-instrucoes-atualizadas-para-o-agente.md`, incluindo a cláusula de TDD.

**Execução detalhada preparada posteriormente nesta mesma data:** [.scratch/correcoes-auditoria-2026-10-06/README.md](../../.scratch/correcoes-auditoria-2026-10-06/README.md). O pacote contém 17 tickets individuais, classificação dos 55 testes e homologação de navegador separada. As especificações técnicas dos tickets concretizam as recomendações desta revisão; não representam correções já executadas.

Não modifiquei código de produção nesta revisão. Os diagnósticos de navegador foram isolados, sem rede e sem gravações no banco. Não validei policies, grants, configuração da Vercel ou a jornada completa autenticada em produção.

## Verificações executadas

| Verificação | Resultado | O que comprova |
|---|---|---|
| `bun test` | 55 aprovados, 0 falhas; 171 assertions; quatro arquivos | Os casos existentes passam; não comprova todos os fluxos citados |
| `bun run lint` | 224 arquivos, sem diagnósticos | Conformidade com as regras configuradas; regras de acessibilidade estão desativadas no Biome |
| `bun run typecheck` | Passou | Tipagem do escopo configurado; `api/**/*` está excluído |
| Checagem adicional das APIs | Passou com configuração temporária incluindo `api/**/*.ts` | Tipagem das APIs; não valida autorização ou execução na Vercel |
| Build em diretório temporário | Passou, com alerta de chunks grandes | Geração do bundle; não mede experiência de uso |
| Sanitizador real em Chromium isolado | Duas formas de executar JavaScript sobreviveram | Falha de sanitização reproduzida, além de leitura estática |

O relatório registra 53 testes; a árvore revisada possui 55. O build contém chunks de aproximadamente 981 KB e 514 KB, antes de gzip. Isso merece medição posterior, mas não justifica agora uma troca de stack.

## 1. A suíte não comprova a maior parte da entrega — prioridade alta

Dos 55 casos, 16 chamam implementações do aplicativo: dez casos de validação, quatro do sanitizador, um de chaves de comentários e um de classificação de conteúdo social. Os outros 39 verificam simulações locais, expressões copiadas ou funções de bibliotecas, sem exercitar os fluxos de produção que seus nomes dizem proteger.

Exemplos: `tests/entrega1.test.ts:148` cria `handleTitleBlur` e `triggerCreate` dentro dos testes; não monta `ActionFormDrawer`. `tests/entrega2.test.ts` recria validação da IA, checagem de admin e hash; não chama os handlers. `tests/entrega3.test.ts` cria sua própria busca e resolução de estados. `tests/entrega4.test.ts:4` inventa um cache com listeners; não usa o cache real do TanStack Query. Seleção, duplicação e preferências seguem padrão semelhante.

Esses testes podem continuar passando se a implementação correspondente for quebrada ou removida. Isso contraria explicitamente a cláusula de TDD já fornecida. Não há evidência suficiente para afirmar que houve ciclos RED → GREEN nas interfaces reais.

**Código:** manter os testes úteis; substituir os demais por casos nas interfaces previamente definidas, usando componentes/hooks/handlers reais. Falsificar rede, banco e serviços externos, sem recriar a regra sob teste. Nomear testes posteriores como regressões posteriores quando não houver evidência de TDD.

**Aceite:** um defeito conhecido na implementação real faz o teste correspondente falhar; a correção o faz passar. Entregar arquivo, comando, resultado e alcance. Não aumentar a contagem como objetivo.

## 2. Portal ainda aceita identidade por ID — prioridade crítica

Em `app/routes/dash.tsx:63`, a sessão é verificada, mas em `:66` qualquer resultado inválido é seguido de `getClientById(supabase, storedId)`. Portanto, o código ainda permite retomada por ID, inclusive depois de token inválido ou expirado, caso essa leitura esteja permitida no banco. `active = true` não comprova identidade.

**Código:** remover esse fallback como autenticação. Falha de sessão deve bloquear a entrada; indisponibilidade do servidor deve ter tratamento próprio, sem promover um ID a credencial. Se usuários legados precisarem reativar acesso, definir migração explícita.

**Aceite local:** ID sem token, token adulterado e token expirado nunca liberam o portal. Testar a implementação real de retomada.

## 3. Token novo não autoriza as operações no banco — prioridade crítica

`api/dash-auth.ts` gera um token próprio e valida perfil ativo. Contudo, as leituras e gravações de ações e comentários continuam usando diretamente `createSupabaseBrowserClient()`. Não encontrei integração do token próprio com a identidade usada por essas operações.

Em `app/routes/dash/action/$id.tsx:51`, a ação é lida por ID; a alteração de arquivos também filtra apenas ID. A home do portal usa `.select('*')`. O sucesso ou bloqueio dessas operações ainda depende das policies implantadas, que não foram verificadas. Se o banco permite operações anônimas necessárias ao fluxo atual, o token novo não restringe essas operações ao cliente autenticado. Se as bloqueia, o token próprio, sozinho, não as libera.

**Código:** usar identidade reconhecida pelo Supabase com policies adequadas, ou operações de servidor que validem sessão, cliente ativo, parceiro e campos permitidos em cada chamada. Definir projeção pública dos dados; evitar entregar o objeto inteiro de ação ao portal.

**Banco:** entregar migrations e matriz de acesso; testar conta A contra ação/parceiro/comentário da conta B. Não declarar autorização validada com mocks.

## 4. Assinatura de sessão admite segredo conhecido — prioridade alta

`api/dash-auth.ts:15` usa a chave service-role, depois `SUPABASE_ANON_KEY`, depois uma string fixa no código como segredo HMAC. Nos dois últimos caminhos, a assinatura pode depender de material público ou conhecido. É condicional à configuração, mas o caminho inseguro existe.

**Código:** usar segredo exclusivo de sessão; configuração ausente deve impedir emissão/verificação, sem fallback público. Tratar configuração inválida no handler. Definir revogação ao trocar senha; o token atual verifica expiração/atividade, mas não contém versão de sessão para revogar tokens antigos após a troca.

**Aceite:** segredo ausente gera erro controlado; assinatura falsa é recusada; troca de senha revoga acesso anterior conforme contrato escolhido. Compatibilidade de senha legada precisa ser comprovada e ter estratégia de migração, não apenas um teste de hash repetido contra ele mesmo.

## 5. Sanitização permite execução de JavaScript — prioridade crítica

O sanitizador de `app/utils/sanitize.ts` usa expressões regulares. Reproduzi, chamando a função real e inserindo seu resultado no DOM de um navegador isolado:

```html
<a href=javascript:window.__auditXss=1>abrir</a>
<a href="java&#x73;cript:window.__auditXss=2">abrir</a>
```

Ambos permaneceram após sanitização. Ao clicar, o navegador executou os valores `1` e `2`. O primeiro explora atributo sem aspas; o segundo usa entidade HTML. As renderizações do portal usam essa função com `dangerouslySetInnerHTML`.

**Código:** substituir a sanitização artesanal por solução mantida, com política explícita compatível com o Tiptap, aplicada aos pontos de renderização relevantes. Preservar o conteúdo legítimo.

**Aceite:** payloads acima e outras variantes de URL/eventos não executam; tabelas, listas, links permitidos e formatação continuam corretos. Testar a função real e manter validação de interpretação pelo navegador.

## 6. Fechamento ainda pode descartar rascunho — prioridade alta

Em `ActionFormDrawer.tsx:480`, `handleSafeClose` aguarda a promessa de criação, mas chama `onClose()` independentemente do resultado. A criação captura falha e retorna `null`. Portanto, fechar durante uma criação que falha ainda fecha a gaveta. O fechamento também não coordena atualizações existentes nem verifica alterações pendentes nas refs dos editores.

**Código:** coordenar todos os caminhos de saída e preservar conteúdo não confirmado. Em falha, manter recuperação visível. Não adicionar confirmação indiscriminada a toda saída; proteger somente conteúdo realmente pendente.

**Aceite local:** componente real com criação atrasada e falha não perde rascunho; descrição digitada sem blur permanece recuperável ao fechar; Escape, fechar, clique externo e troca de ação seguem o mesmo contrato.

**Navegador:** verificar foco, teclado, toque e reabertura com conteúdo preservado.

## 7. Patches melhoraram; concorrência não foi resolvida — prioridade alta

`ActionFormDrawer` passou a enviar patches, o que reduz sobrescritas entre campos diferentes. Entretanto, não existe fila/versionamento por ação. `updateActionClient` atualiza por ID, sem comparar versão anterior. Duas alterações do mesmo campo ainda podem chegar fora de ordem; duas sessões também podem sobrescrever uma à outra.

Na criação, o payload é capturado antes da resposta. O merge mantém o estado local mais recente, mas não garante persistência de alterações feitas durante a requisição. `handleSave`, ao encontrar criação em andamento, apenas aguarda e retorna sucesso. Assim, preservar o texto na tela não equivale a tê-lo salvo. A resposta da criação também pode atingir um novo contexto se a ação da gaveta for trocada durante a requisição.

**Código:** coordenar writes por ação, acompanhar patches pendentes e identidade do rascunho; persistir edições realizadas durante criação; associar respostas à ação correta. Preparar comparação atômica de versão/`updated_at` no banco, conforme instrução original.

**Aceite:** A → B no mesmo campo termina em B; edições durante criação sobrevivem à recarga; falha antiga não desfaz sucesso posterior; conflito de duas sessões é comunicado sem confirmar sucesso falso.

## 8. Seleção em lote mantém fallback perigoso e contagem inexata — prioridade alta

Em `BulkActionMenu.tsx:163`, quando não há nenhuma ação visível, a função devolve **todos os IDs selecionados**. Isso contradiz a restrição ao recorte atual: o conjunto vazio deveria impedir a operação. O provider recebe apenas `location.pathname`, sem representar mudanças de filtro na mesma rota.

Em `:179`, a operação ignora as linhas retornadas e anuncia sucesso com a quantidade solicitada. `bulkUpdateActionsClient` pode retornar menos linhas sem erro; zero linhas também pode resultar em mensagem de sucesso. Atualizações separadas de data/hora não entregam um resultado estruturado por ID para sucesso parcial.

**Código:** usar recorte explícito de dados, não o DOM global como única fonte; zero elegíveis significa zero operações. Retornar IDs confirmados/falhos, contabilizar resultado real e preservar seleção dos que precisam de nova tentativa.

**Aceite:** selecionar, filtrar para conjunto vazio e aplicar não grava nada; retorno de 2 em 5 anuncia 2, sem perder os outros 3; testar zero linhas e falha parcial.

## 9. Cancelamento de arraste melhorou; duas operações ainda concorrem — prioridade média

`useKanbanDnd.ts` agora limpa a ação ativa em `finally` e oferece cancelamento. Mas `:65` remove o override pelo ID sem verificar qual requisição o criou. A resposta do primeiro arraste pode remover o override do segundo arraste ainda pendente; o `finally` externo pode limpar um novo arraste iniciado nesse intervalo.

**Código:** associar override e limpeza à operação, ou serializar a operação da mesma ação preservando interação fluida.

**Aceite:** usar o hook real; terminar/rejeitar a primeira promessa depois do segundo arraste não desfaz a segunda operação ou seu feedback.

## 10. Escopo de revisão foi filtrado depois da leitura — prioridade alta

`fetchReviewActions` lê conteúdo por uma lista arbitrária de IDs. Somente depois, `dash/review.$slug.tsx:43` filtra por parceiro no navegador. Dados de outros parceiros já podem ter sido recebidos; esconder cards não autoriza acesso.

**Código/banco:** validar autorização antes de retornar conteúdo. Se o link for compartilhável, definir uma capacidade de acesso limitada, validada no servidor, com campos e escopo específicos. Não tratar IDs/slug como prova suficiente de permissão.

**Aceite:** trocar IDs ou slug não retorna conteúdo fora do escopo. A validação real depende do mecanismo de servidor/policies, não de `.filter()` em arrays de teste.

## 11. Cache e autorização de banco continuam parciais — prioridade alta

A lista de parceiros passou a acompanhar uma query reativa e o logout da equipe limpa o cache. Porém, continuam chaves sem identidade para parceiros, detalhe de ação e comentários, e atualizadores otimistas amplos em todas as listas de ações. A chave de atrasados está sob o prefixo `actions`, e ambos os prefixos recebem atualizações. O rollback repõe snapshots completos, podendo apagar alterações concorrentes. IDs temporários ainda são produzidos dentro do updater com relógio.

Não foram entregues migrations de autorização. Há SQL local com duas definições distintas de `get_home_actions`; a definição de cinco parâmetros é `SECURITY DEFINER`, aceita `p_user_id` e não valida `auth.uid()` nem fixa `search_path`. Isso é um risco **se implantada com acesso executável aos usuários**; não confirmei sua presença/grants em produção.

**Código:** revisar escopo de chaves e reconciliação por mutation, evitar dupla atualização e rollback destrutivo; trocar identidade reinicializa contexto e cache.

**Banco:** inventariar função/policies/grants existentes e produzir migração reproduzível; o usuário enviado pelo navegador nunca substitui identidade autenticada. Não executar os scripts atuais cegamente.

## 12. API de IA foi restringida parcialmente — prioridade média

Há checagem real de membro ativo, intents e alguns limites de tamanho. Entretanto, os limites de `title`, `description` e `partner_context` só se aplicam se o valor já for string: objetos/arrays não são rejeitados por essas verificações. Outros campos usados nos prompts não têm limites equivalentes. Não há limite persistente de consumo implementado. Configuração/criação do cliente e autenticação ocorrem antes do `try` principal.

**Código:** validar objeto completo e tipos antes do uso, definir limites de consumo e controlar falhas de configuração/upstream. Testar o handler real com fronteiras externas falsas e nenhuma chamada paga.

## Correções que devem ser preservadas

- Separação de schemas de criação/patch; campos omitidos não viram limpeza involuntária. Existem testes reais úteis para isso.
- Comparação de título com referência salva e coordenação da promessa de criação; ainda precisam dos ajustes de saída/concorrência acima.
- Preservação de responsáveis já selecionados ao mudar parceiro.
- Limpeza do arraste em falha e cancelamento, respeitada a pendência de concorrência.
- Comentário interno por padrão e chaves distintas para audiência pública/interna; autorização no banco ainda é necessária.
- Guard de administração e checagem de admin no endpoint de criação de usuário; guard de UI não substitui policies.
- Consulta do calendário por período visível e navegação por meses reais.
- Consulta administrativa de pessoas incluindo arquivados, separada dos seletores operacionais.
- Título de duplicação consistente e reconhecimento de stories na gaveta de conteúdo social.
- Parceiros reativos e melhorias de nomes acessíveis; teclado/toque ainda precisam de homologação.

## Próxima rodada: ordem de execução

1. **Segurança:** sanitização; identidade do portal; autorização efetiva das leituras/gravações e revisão; segredo de sessão e migrations. Antes de expor o portal como seguro, comprovar esses contratos.
2. **Integridade:** fechamento/recuperação de rascunho, concorrência de saves, seleção e resultados de lote, cache/rollback e arrastes simultâneos.
3. **Testes reais:** substituir simulações por regressões da implementação a cada correção, seguindo a cláusula de TDD vigente. Não deixar esta etapa para depois das correções.
4. **Homologação aqui:** navegação autenticada, mobile, teclado, popovers, edição/recarga, troca de parceiro/período, revisão e dois perfis separados. Banco de teste para matriz de autorização; navegador não substitui essa camada.

O agente pode implementar código e preparar migrations/casos de banco, registrando aplicação pendente quando não tiver acesso. Não precisa de navegador para chamar handlers reais, controlar promessas e testar componentes reais em DOM simulado.

Relatório de retorno obrigatório: por item, estado separado de código, teste local, banco, navegador e produção; referência da implementação/teste; resultado e limitação. Atualizar também o mapa dos achados originais 01–52. Nenhuma frase de “100%” sem correspondência verificável.
