# 14: IA rejeita entrada inválida e consumo excessivo

**What to build:** Membro ativo gera conteúdo com entradas válidas e recebe erro claro quando perde acesso ou atinge limite.

**Blocked by:** Nenhum

**Status:** código e navegador com HTTP controlado verificados em 07/10/2026; banco real, provedor real e produção aguardando validação.

## Execução prescrita
Arquivos: api/ai.ts; app/services/ai-client.ts. Criar migration/rpc ai_usage para limite transacional.
1. Handler inteiro com try/catch incluindo configuração, createClient e autenticação. Métodos nãoPOST→405; sem/invalidtoken→401; pessoa nãoativa→403; configuraçãoausente→503; upstream falho→502. Nunca expor chave/stack.
2. Zod strict para body. intent enum dos4 existentes; category string1–100; title string0–500; description/partner_context string0–10000; racional/headline/direcionamento string0–2000. Limite body64KB medido em bytes UTF-8. Objetos/arrays/números nos campos de texto→400. Unknownfields→400; preservar campos legítimos consumidos, listados acima.
3. Decisão operacional inicial: limite configurável por membro/24h, padrão100 chamadas, env AI_DAILY_LIMIT inteiro1–10000; contabiliza tentativa autorizada antes do upstream. Registro UTC por user_id e dia. RPC transacional incrementa somente abaixo do limite; duas instâncias não ultrapassam cota. Service-role no servidor; corpo não envia dono/dia.
4. Limite atingido→429 e Retry-After até próxima janela. Falha da store de consumo→503; contador em memória não substitui persistência.
5. Validar formato da saída conforme cada intent usado hoje; JSON ilegível/schema inválido→502. Conteúdo HTML chega à política01 no render. Falsificar OpenAI, nenhum gasto real nos testes.
6. UI mostra401/403/429/502/503 com mensagem específica e preserva insumo. Não marcar gerado quando upstream falhou.

## Testes e alcance
Interface: api/ai handler real e ai-client real; Auth/SDK/OpenAI/clock externos falsos. Semtoken, membro inativo, intent inválido, title como objeto,64KB,quota atingida,JSON inválido,configuração ausente/upstream falho. Verificar zero chamadas OpenAI em rejeições.
BANCO: duas chamadas simultâneas para última cota na RPC real; NAVEGADOR: N13 do17.

## Acceptance criteria
- [x] Body completo é validado antes de geração.
- [x] Quota preparada com UPSERT transacional; nenhuma alternativa em memória. Execução/concorrência no PostgreSQL real ainda pendentes.
- [x] Sem acesso ao banco, limite fica pendente explicitamente.

## Resultado do executor — 07/10/2026

HEAD `0f8c637ee7da38d25b0b54a8cb290ff47984ae01`. Mudanças anteriores preservadas. Não houve implantação nem chamada real à OpenAI. Na primeira entrega, o proprietário faria os testes do aplicativo. Depois autorizou o agente a executá-los; o resultado complementar abaixo registra os testes de navegador e a correção encontrada.

### Código alterado
- `api/ai.ts`: try/catch também protege configuração/SDK/Auth; Bearer validado; autorização de membro ativo; POST obrigatório; payload estrito, limites por campo e64KB UTF-8; erros seguros400/401/403/413/429/502/503. Reserva tentativa na store persistente antes do upstream; store indisponível não permite geração.
- `app/lib/ai-contract.ts`: contrato compartilhado dos quatro intents, entrada e saída. Estratégias/hooks exigem5 itens com headline/angulo/racional/direcionamento; conteúdo exige texto não vazio, legenda exige caption não vazio. Renderização HTML continua sujeita à política de sanitização existente. Validação estrutural não avalia qualidade editorial.
- `app/services/ai-client.ts`: rejeita entrada/saída inválida, resposta de outro intent e falha de conexão; mensagens específicas por status, sem confiar em stack/erro bruto retornado; preserva headline/racional/direcionamento enviados pelo fluxo existente. `hook` não possui caller e não pertence ao contrato.
- `ActionFormDrawer.tsx`: mostra o erro específico e bloqueia disparo duplicado enquanto uma geração está pendente. Campos só recebem conteúdo após resposta validada; falha não inicia atualização da ação.
- Migration `20261007010000_ai_usage.sql`: tabela por usuário/diaUTC, RLS sem acesso do navegador, RPC exclusiva do service_role com UPSERT condicionado ao limite e verificação de membro ativo. Duas transações disputam a mesma linha; validação física ainda pendente.
- `types/database.ts`, `AGENTS.md` e Knowledge Item do banco atualizados. `scripts/test-database-matrix.sql`: acrescentadas verificações físicas de cota/permissões e instrução para concorrência em duas conexões.
- `tests/ai.test.ts`, `tests/ai-client.test.ts`: handlers/client reais, somente SDK/Auth/OpenAI/rede controlados. Sem banco simulado apresentado como banco real.

Os prompts de estratégia, conteúdo e legenda foram preservados. O prompt de hooks, sem consumidor de UI atual, passou a explicitar os campos do seu contrato de saída. Modelo atual preservado, sem afirmar disponibilidade real do provedor.

### Verificação de código
TDD reproduziu título-objeto aceito com gasto de geração, exceção de Auth fora do handler e cliente aceitando caption numérico em HTTP200. Após correções: **276 testes passam,0 falham,822 asserções,19 arquivos**; tipagem, lint sem avisos e build passam. Build mantém aviso anterior de chunks acima de500kB.
44 casos novos abrangem sucesso dos quatro intents, campos inválidos/desconhecidos,64KB UTF-8, JSON inválido, métodos/acesso, quota/falha da store, configuração, saída ilegível/vazia/tipo incorreto, upstream, mensagens do cliente e ausência de rede em rejeições. Zero chamadas reais à OpenAI.

### Verificação complementar no navegador — 07/10/2026

Executado `scripts/check-ai-browser.cjs` no app local `http://127.0.0.1:5177`, Chromium desktop1440 e móvel390 com toque emulado. Dados fictícios e respostas HTTP controladas; nenhuma gravação no Supabase real nem chamada paga à OpenAI. O script executa o componente, editor, SDK e cliente reais. A resposta de geração e a persistência são controladas na fronteira HTTP: isto comprova integração e reação da interface, não comportamento físico do banco/provedor.

**Defeito reproduzido e corrigido:** o botão **USAR ESTA ESTRATÉGIA** enviava `angulo` como campo extra. O novo contrato estrito rejeitava esse pedido antes da rede, impedindo a geração de conteúdo. Removido somente esse campo redundante do payload no `ActionFormDrawer.tsx`; o ângulo continua presente na estratégia exibida e o prompt existente não consumia esse campo de entrada. O roteiro completo falhou antes da correção e passou depois. Os testes anteriores de API/client não executavam esse botão; por isso não detectaram a incompatibilidade.

Passaram nos dois tamanhos:
- Criar5 estratégias, expandir uma, **USAR ESTA ESTRATÉGIA**, conferir conteúdo, gerar legenda, salvar e reabrir mantendo conteúdo/legenda/insumo.
- Dois disparos rápidos produzem uma única requisição; tentativa de fechar durante geração mantém gaveta aberta com aviso.
- HTTP400/401/403/413/429/502/503: mensagem específica, nenhum PATCH indevido, textos preservados, botão liberado.
- HTTP200 com caption numérico: rejeitado sem substituir texto. Falha de conexão provocada por interrupção da requisição: mensagem e recuperação após nova tentativa.
- Insumo acima de10000 caracteres: rejeitado localmente, sem chamada à IA, texto preservado; restaurar insumo e fechar/reabrir mantém estado salvo.
- Modal e gaveta sem overflow horizontal da página; nenhuma exceção JavaScript capturada.

O handler local real também respondeu405 ao GET e401 ao POST sem autenticação. Esses dois pedidos não alcançam banco/OpenAI. Autorização e quota continuam cobertas no código com fronteiras externas controladas; não confundir isso com homologação real.

**Reprodução:** configurar `PORTAL_TEST_URL`, `PLAYWRIGHT_MODULE` e `PLAYWRIGHT_EXECUTABLE` conforme instalação local e executar `node scripts/check-ai-browser.cjs`; para móvel, acrescentar `AI_TEST_WIDTH=390`. O script bloqueia acessos externos não previstos e usa fixtures. Não exige credenciais de teste nem altera dados de produção. Os ajustes de sincronização do próprio roteiro aguardam o fim da geração antes de consultar botões/editor; tocar no corpo do card evita ativar a edição inline do título.

Após a correção:276 testes passam/0 falham/822 asserções em19 arquivos; tipagem, lint e build passam. Permanece apenas o aviso já existente de chunks acima de500kB.

**Ainda não executados:** cota real/concorrência PostgreSQL (T6), geração e salvamento em serviços reais, desligamento físico de rede e aparelho físico (T7). Não há PostgreSQL descartável disponível nesta sessão. Migration continua não aplicada. O teste móvel acima usa Chromium com toque emulado; não certifica Safari/iOS ou hardware de celular.

### Tempo observado na primeira entrega
Medição iniciada ao terminar a investigação inicial (essa leitura inicial não foi cronometrada separadamente). Código e testes direcionados: **5min26s**; revisão/verificações completas: **1min52s**; roteiro/documentação: **4min12s**. Total do trecho medido: **11min30s**. Inclui raciocínio e execução entre os marcos, não apenas CPU dos comandos. Suíte completa:6,87s; build:1,49s. Não houve preparação/execução de navegador.

### Banco/configuração: condição antes do teste normal
**A migration ainda NÃO foi aplicada. Sem a RPC, a nova versão da IA retorna503 e não gera conteúdo. Não publicar API/frontend desta entrega sem instalar a migration correspondente.**
Servidor exige `OPENAI_API_KEY`, `SUPABASE_URL` (ou `VITE_SUPABASE_URL`) e `SUPABASE_SERVICE_ROLE_KEY`, sempre apenas no servidor. `AI_DAILY_LIMIT` é opcional: padrão100; inteiro1–10000. Conta tentativas autorizadas, inclusive falhas posteriores do provedor. Janela por diaUTC, renovação às00h UTC; não é uma janela móvel de24h.

Homologação física: instalar em banco de teste, executar matriz, conferir grants/RLS e executar a disputa da última cota em duas conexões reais conforme comentários finais do script. Não certificar concorrência usando o mock dos testes. Instalação/produção não foram executadas.

## Roteiro de teste no aplicativo — proprietário

### Preparação
1. Use a versão atual de `/uzzina` no computador, não a produção antiga nem `uzzina-2026`. Se precisar iniciar, abra o terminal na pasta `/Users/euchicosousa/vercel/uzzina`, execute `bun run dev` e use o endereço informado. Não assumir que5173 é sempre este projeto.
2. Use uma ação de teste de um parceiro acessível. Título: **TESTE IA — descartar**; categoria **Post**. Não use uma entrega real para testar substituição de conteúdo.
3. Em Essencial, coloque: **Insumo original: campanha de teste sobre organização da rotina. Não inventar números.** Em Instagram, coloque uma legenda manual: **LEGENDA ORIGINAL — não perder**. Aguarde salvar e reabra para confirmar os dois textos.
4. Banco/RPC e configurações acima precisam estar instalados para os testes de geração normal. Se a primeira tentativa mostrar indisponibilidade, envie a mensagem e pare os testes de geração; não modifique credenciais ou banco sem acertarmos essa etapa.
5. Texto, áudio e prints são aceitos. Nos testes que passam, basta registrar o número e “passou”. Em erro, preciso dos passos, mensagem exata e estado do texto antes/depois. Não precisa filmar tudo.

### Teste1 — caminho normal completo
1. Na aba Essencial, pressione **CRIAR ESTRATÉGIA** uma vez.
2. Aguarde. Devem aparecer5 estratégias com título, ângulo, racional e direcionamento. O indicador deve terminar.
3. Expanda uma estratégia clicando no título e pressione **USAR ESTA ESTRATÉGIA**. Em Instagram/Conteúdo, confira o resultado. Esse botão precisa ser exercitado: foi o caminho que revelou a incompatibilidade de payload.
4. Deve aparecer conteúdo no editor, sem apagar o insumo original da aba Essencial.
5. Em Instagram/Legenda, pressione **Gerar legenda**. Deve aparecer uma legenda válida; ela substitui a legenda da ação de teste.
6. Aguarde salvar, feche e reabra a mesma ação. Confirme estratégias, conteúdo e legenda persistidos.
**Retorno:** “T1 passou” ou qual etapa falhou. Se houve resultado, mas ele não salvou, informe isso separadamente de falha de geração. Print do erro e da área que perdeu texto.
**Custo:** geração real usa o provedor e consome até3 tentativas. Evitar repetições sem necessidade.

### Teste2 — cliques repetidos e fechamento durante geração
1. Na ação de teste, pressione gerar estratégia duas vezes rapidamente.
2. Enquanto aparece o indicador de geração, tente fechar a gaveta e abrir outra ação.
3. Deve existir uma única geração em andamento; fechamento/troca deve aguardar, com aviso. Depois de terminar, fechar/trocar deve voltar a funcionar.
4. Se tiver familiaridade com a aba Rede do navegador, filtre `/api/ai`: deve haver apenas1 request para os cliques. Contar estratégias na tela sozinho não comprova ausência de requisição duplicada.
**Retorno:** se ficou travado, se abriu outra ação durante a geração ou se houve mais de1 request. Vídeo curto ajuda para esse teste; áudio descrevendo a sequência também serve.

### Teste3 — provocar falha de conexão e recuperar
1. Com a ação aberta, anote o insumo e a legenda atuais.
2. Desligue temporariamente Wi-Fi/rede. Pressione **Gerar legenda** uma vez.
3. Deve aparecer mensagem de conexão; o indicador deve encerrar; legenda e insumo devem continuar iguais, sem sucesso falso.
4. Religue a rede. O botão deve continuar utilizável. Gerar novamente deve funcionar se banco/provedor estiverem disponíveis.
5. Feche/reabra e confira que a tentativa falha não apagou os textos.
**Retorno:** mensagem exata e se preservou texto/liberou o botão. Print da mensagem se houver divergência. Não atualizar a página antes de registrar a falha.

### Teste4 — provocar insumo grande demais
1. Na ação de teste, copie/guarde o insumo original. Cole no editor de descrição um texto com mais de10000 caracteres (pode repetir um parágrafo longo muitas vezes).
2. Tente gerar estratégia. Deve receber erro de campos inválidos/grandes demais; não deve gerar nem apagar o texto.
3. Restaure o insumo original. O comando deve voltar a funcionar. Essa segunda geração só é necessária se houver dúvida sobre recuperação.
**Retorno:** mensagem e se o botão ficou preso. O editor produz HTML, também contado no limite; portanto texto visível menor que10000 caracteres pode ultrapassá-lo quando muito formatado. Limites e bytes exatos já estão cobertos no código.

### Teste5 — mensagens de falha do servidor, sem gastar chamadas reais (opcional)
Este é um **teste da reação da tela a uma resposta controlada**, não do servidor/banco real. Não altera código do app nem testa quota física. Serve para provocar401/403/429/502/503 com segurança e conferir preservação do texto.
1. Abra o app no Chrome e mantenha a ação de teste aberta. Abra o console com **⌘⌥J** no Mac.
2. Cole o bloco abaixo. Troque apenas `429` pelo status que quer conferir. Ele substitui **somente a próxima chamada à IA**, restaura a conexão normal automaticamente e não faz essa geração real.

```js
(() => {
  const status = 429; // Test one of: 401, 403, 429, 502, 503
  const original = window.fetch;
  window.restoreAiTest = () => { window.fetch = original; };
  window.fetch = function(input, options) {
    const url = input instanceof Request ? input.url : String(input);
    if (new URL(url, location.href).pathname === '/api/ai') {
      window.restoreAiTest();
      return Promise.resolve(new Response(JSON.stringify({error:'Controlled test'}), {
        status, headers:{'Content-Type':'application/json','Retry-After':'60'}
      }));
    }
    return original.call(window, input, options);
  };
})();
```

3. Volte à gaveta e pressione **Gerar legenda**. Deve encerrar o indicador e preservar os textos.
4. Confira a mensagem:401 pede novo login;403 informa acesso desativado;429 informa limite diário;502 informa resposta inválida;503 informa indisponibilidade.
5. Para testar outro status, repita o bloco com outro número. Se desistir antes de clicar, execute `window.restoreAiTest()` ou recarregue a página; depois confira o estado salvo da ação.
**Retorno:** “T5:401/403/429/502/503 passaram” ou print da mensagem incorreta, com o número testado. Não envie tokens, chaves ou conteúdo do armazenamento. Se não quiser usar console, pule e me diga; esses status já foram verificados no código, mas a apresentação na tela ficará pendente.

### Teste6 — quota real (depende do banco; não fazer100 gerações)
Somente em ambiente de teste com banco instalado: configurar `AI_DAILY_LIMIT=1`, reiniciar o servidor e usar membro de teste que ainda não gerou naquele diaUTC. Primeiro pedido autorizado deve seguir para o provedor; segundo deve retornar429 sem chamar o provedor. Usar outro membro deve ter cota independente. Depois restaurar a configuração. Não alterar quota do ambiente de trabalho para esse teste sem combinarmos.
**Retorno:** ambiente, hora, resultado do primeiro/segundo pedido e mensagem. Isto não substitui a disputa simultânea em duas conexões SQL, que continua pendente.

### Teste7 — repetir o essencial no celular
Em celular físico, repetir T1 apenas se necessário, T2 e T3. Conferir botões visíveis, mensagem legível, editor sem perda de texto e gaveta utilizável após erro. Não repetir gerações reais que já foram suficientemente verificadas.
**Retorno:** aparelho/navegador e número do teste com problema. Print para corte/posição; vídeo curto para travamento ou sequência de toques.

### Como devolver o resultado
Pode mandar uma mensagem só, preenchendo:

```text
Ambiente: local ou produção / endereço sem credenciais
Aparelho e navegador:
T1: passou / falhou na etapa… / bloqueado por banco
T2:
T3:
T4:
T5: passou / pulei / status que falhou…
T6: não executado / resultado…
T7: não executado / resultado…
Erro: fiz…; esperava…; aconteceu…; mensagem exata…
Texto anterior foi preservado? O botão voltou a funcionar?
Anexo: print ou vídeo, apenas quando ajudar.
```

Áudio também serve: diga o número do teste e a sequência. Em perda de texto, erro intermitente ou mensagem inesperada, prefira acompanhar com print/vídeo antes de recarregar.

## Pendências e continuidade
- Código e navegador local com HTTP controlado: verificados. Banco/cota concorrente, provedor e persistência reais: não executados. Produção: não implantada. Aparelho físico: não testado.
- Não declarar encerrados todos os52 achados. Próxima ação é homologar banco/provedor e resolver implantação compatível de14; ticket15 não foi iniciado.

## Passo2 — validação PostgreSQL local,07/10/2026

Migration executada em PostgreSQL15.1 temporário com baseline exportado reconstruído, sem dados reais. Matriz e duas conexões/locks passaram: quota com uma reserva permitida, preferências sem perder patches/campos desconhecidos. Resultado em docs/audits/2026-10-07-passo-2-banco-de-teste.md. Supabase/GoTrue/PostgREST/produção ainda não homologados; banco enviado não foi alterado.

## Complemento — comparação/IA no staging em07/10

Comparação agrupada por versão, valores formatados, textos longos e scroll independente verificados em1440/390. IA503 reproduzido e configuração privada corrigida no staging; API real gerou legenda com200. UI de geração pendente após renovar sessão, produção/Vercel não certificadas.256 testes passam; tipagem/lint/build passam. Detalhes, arquivos e limites em docs/audits/2026-10-07-staging-supabase.md, seção Comparação por versão e diagnóstico da IA.

## Reabertura — regressão de compatibilidade confirmada em07/10
API anterior usa chave pública/Bearer; esta entrega passou a exigir service_role e consume_ai_usage. Ambiente original válido para contrato anterior agora recebe503 antes de autenticar/chamar OpenAI. Reprodução real do handler local com configuração original, token diagnóstico inválido, sem acesso ao banco:503/AI_CONFIGURATION_MISSING. Testes fake e staging preparado não validam rollout sobre banco original. Corrigir implantação coordenada ou adiar explicitamente quota/restaurar contrato anterior; não fallback silencioso. Causa/evidência completas em docs/audits/2026-10-07-staging-supabase.md, seção Revisão causal da regressão. Código runtime e banco não alterados nesta revisão; problema original continua aberto.

## Correção Gemini — compatibilidade local explícita restaurada em 07/10/2026
Implementada a compatibilidade explícita para o Vite de desenvolvimento local sem alterar o banco ou o `.env` original:
- `vite.config.ts`: `localApiPlugin` injeta `process.env.UZZINA_LOCAL_AI_COMPAT = "true"` exclusivamente quando `server.config.mode === "development"`, emitindo aviso único no console; nos demais modos define `"false"`.
- `api/ai.ts`: avalia `localCompatibility = process.env.NODE_ENV === "development" && process.env.UZZINA_LOCAL_AI_COMPAT === "true" && !process.env.VERCEL`. No modo compatível, utiliza chave pública (`SUPABASE_PUBLISHABLE_KEY || VITE_SUPABASE_ANON_KEY`) e `global.headers.Authorization = Bearer token` para autenticação e consulta de `people.visible`, sem chamar `consume_ai_usage`. Nos demais modos (staging, Vercel, produção), mantém quota persistente obrigatória com `consume_ai_usage`, falhando fechado com 503 (`AI_QUOTA_UNAVAILABLE`) se indisponível.
- Testes: 10 novos casos no `tests/ai.test.ts` cobrindo desenvolvimento compatível (200, 401, 403, 503 sem chave pública) e modo estrito (503 sem service_role na produção/Vercel/flag false, 200 com quota, 503 quota indisponível sem OpenAI, 429 quota esgotada). 266 testes passam / 0 falhas; typecheck, lint e build passam.
- Testes reais de UI com navegador e no staging permanecem pendentes.



## Integração real concluída — passo 1,07/10/2026

Resultado em `docs/audits/2026-10-07-passo-1-homologacao-staging.md`. IA/API estrita comprovou incremento persistido de quota e geração200; interface gerou, salvou e reabriu legenda real. Portal/revisão/contas/pessoas/Auth/lote/CAS passaram na matriz descrita, após correção do handler local create-user e Content que exigia contexto privado no portal. Opção de revisão sem parceiro desabilitada. Dados descartáveis removidos e fixtures restauradas.267 testes/0 falhas; tipagem/lint/build passam. Substitui pendências históricas desses fluxos no staging; produção, leads, Safari/telefone/upload e demais limites continuam pendentes. Não declara ticket17 integralmente homologado.
