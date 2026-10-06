# Checkpoint dos tickets 01–03 — qualidade e tempo de execução

Data: 06/10/2026. Base: commit `dedaf8b` mais alterações locais do ticket 03. Escopo desta revisão: documentos de execução, código e testes dos três tickets. O usuário esclareceu que a lentidão percebida é do agente, não do aplicativo.

**Atualização posterior:** os achados A–F deste diagnóstico foram corrigidos/atualizados no fechamento dos tickets 01–03. Ver [fechamento e evidências](2026-10-06-fechamento-tickets-01-03.md). O texto abaixo é o diagnóstico anterior à correção, preservado para rastreabilidade.

## Parecer

**Há avanço real, mas os tickets 01–03 ainda precisam de um fechamento específico antes de prosseguir.** Os testes novos de sessão e leitura do portal executam handlers de produção, diferentemente de várias simulações anteriores. A conclusão do ticket 03, porém, não comprova a jornada login → portal, que não foi montada nos testes.

Não alterei o código nesta revisão. Não apliquei migrations nem consultei dados de produção. Reproduções foram locais, com DOM simulado ou SDK externo falso.

## Por que o agente pode estar demorando

Não tenho um registro completo das rodadas/tempo do agente; não é possível atribuir a demora ao modelo com certeza. Os indícios concretos são:

- Os comandos são rápidos neste computador: suíte completa de 104 casos em aproximadamente 1 segundo; lint em 0,4 segundo; typecheck em 4 segundos; build em 1,7 segundo, incluindo inicialização. Todos passaram. Isso não explica uma execução longa.
- O ticket 03 adicionou aproximadamente 950 linhas ao arquivo de testes. Ele agora tem 1.057 linhas. Uma parte relevante implementa um banco falso com filtros, ordenação e paginação. Essa fronteira falsa é legítima para testar handlers, mas ficou extensa e foi construída novamente, em vez de aproveitar uma infraestrutura pequena comum.
- O arquivo do ticket 02 tem 747 linhas. O custo aqui parece estar na construção/manutenção do aparato, não em executar testes.
- **Minha especificação também elevou o custo:** os primeiros tickets pedem uma mudança de arquitetura de acesso do portal, não apenas correções pontuais. Sessão, API, DTO, banco e frontend são mudanças acopladas. A sequência é necessária para a solução escolhida, mas fui abrangente demais para um executor que precisa de tarefas pequenas e totalmente delimitadas.

Não recomendo acelerar removendo autorização ou testes necessários. Recomendo limitar cada execução a um defeito observável, reutilizar fixtures e evitar que o agente continue construindo infraestrutura genérica.

## O que está comprovado

| Item | Situação |
|---|---|
| Sanitizador mantido, substituindo regex | Implementado; os payloads conhecidos foram neutralizados no DOM simulado |
| Sessão opaca e cookie HttpOnly | Código e migration preparados; há testes reais de handler/helper |
| Fallback de login por ID | Removido do código |
| Leitura de ações do portal no servidor | Implementada em `api/dash-data.ts`, com autorização e projeção de dados |
| Paginação de leitura | Handler testa leitura de 550 registros com banco falso |
| Tipagem/lint/build | Passaram na árvore atual, incluindo APIs na tipagem |
| Banco real | Não validado; migration de sessão ainda registrada como pendente |
| Componentes de login/calendário/detalhe reais montados | Não encontrados nesses arquivos de testes |
| Navegador/produção | Não homologados nesta revisão |

Os testes estáticos que procuram strings em arquivos servem como verificação auxiliar. Não demonstram o funcionamento do portal. O grupo chamado “dash-client.ts no Navegador” testa fetchers com `fetch` falso; deve ser renomeado para não sugerir execução em navegador real.

## Achados que precisam fechar os tickets atuais

### A. Sanitizador combina configurações que se anulam

`app/utils/sanitize.ts` configura `ALLOWED_TAGS` e `USE_PROFILES` juntos. A documentação instalada de DOMPurify informa que `USE_PROFILES` substitui `ALLOWED_TAGS`. Reproduzi com a função real:

- `<video controls src="https://example.com/a.mp4">video</video>` foi preservado, apesar de video não constar na lista prescrita.
- Um link `ftp://example.com/` também foi preservado, embora os protocolos definidos fossem http/https/mailto/tel e relativos.

Isso não demonstra um novo XSS, mas demonstra que a política restrita declarada não está efetivamente aplicada.

**Correção pequena:** manter a allowlist explícita, retirar a configuração concorrente `USE_PROFILES` e corrigir a política de protocolos. Manter o DOMPurify. Acrescentar casos da função real para video, FTP e preservação de tabela/link legítimo. O fallback sem DOM não deve devolver texto potencialmente reinterpretável como HTML: usar saída vazia ou escape explícito, com teste.

### B. Logout retorna sucesso quando revogação falha

`api/dash-auth.ts` aguarda o update da sessão, mas ignora seu resultado `error`. Reproduzi chamando o handler real com SDK de banco falso retornando erro na revogação: resposta **200**, corpo **success=true**, cookie expirado.

Expirar o cookie encerra o acesso nesse navegador, mas não comprova revogação do registro que poderia ser reutilizado. O teste atual só prepara sucesso do banco.

**Correção pequena:** ler e tratar o erro da revogação. Falha no banco não retorna confirmação de revogação. Se optar por limpar o cookie mesmo em erro, informar o erro e manter o contrato explícito. O frontend não deve ignorar `false` de `logoutDashSession()` e anunciar saída confirmada. Teste do handler real com falha na fronteira do banco é obrigatório.

### C. Indisponibilidade vira credencial inválida ou conteúdo vazio

`verifyDashSession()` converte qualquer resposta HTTP não OK ou falha de rede em `null`. O layout interpreta isso como cliente inválido. `fetchDashActions()` e `fetchDashPartners()` transformam 401 em lista vazia; o detalhe transforma 401 em null. Assim, uma sessão expirada pode parecer ausência de trabalho, e falha de banco/servidor pode parecer senha inválida.

Além disso, os handlers usam `.single()` e tratam vários erros de banco como “sessão inválida”. Configuração/criação do SDK e chamadas não estão protegidas por um tratamento de exceção abrangente.

**Correção pequena:** contrato de erro HTTP tipado e consistente. 401 significa sessão ausente/inválida; 404 significa recurso inexistente/inacessível; erro de banco/rede/configuração gera indisponibilidade controlada (503), nunca lista vazia de sucesso. No lookup de sessão/perfil, usar retorno que distinga zero linhas de erro de infraestrutura. Preservar mensagem e possibilidade de tentar novamente. Testar uma falha de sessão e uma falha de rede/banco nas funções reais.

### D. Layout pode não reinicializar após login

O efeito de bootstrap de `app/routes/dash.tsx` depende apenas de `navigate`. O hook da versão instalada mantém essa função estável entre navegações do mesmo layout. O login navega para `/dash`, mas não publica o perfil no layout nem pede uma nova validação. Se o layout já tentou verificar sessão quando estava em `/dash/login`, `clientData` pode permanecer null após login; fora da tela de login isso retorna tela vazia.

Esta conclusão vem da leitura do fluxo e da implementação instalada de `useNavigate`; a jornada ainda precisa de teste funcional, não está marcada como reproduzida em navegador nesta revisão.

**Correção delimitada:** derivar `isLoginPath` da localização do router antes do efeito. O bootstrap deve disparar na transição de login para área autenticada, com loading reinicializado e cancelamento/generation para resposta antiga. Na tela de login, não iniciar bootstrap do portal. Ao sair/desautenticar, limpar `clientData`, parceiros e cache privado. Testar com layout/router reais: abrir login sem sessão → login 200 → navegar → verificar sessão → parceiros → portal renderizado sem recarregar a página. Confirmar também pelo navegador depois.

### E. Ambiente de desenvolvimento não atende às APIs novas

`vite.config.ts` possui middleware somente para `/api/ai`. As funções `/api/dash-auth` e `/api/dash-data` não são atendidas por esse adaptador. O comando atual de desenvolvimento é Vite. Portanto, testes que importam handlers diretamente não comprovam que essas URLs funcionam no servidor local.

**Correção delimitada:** acrescentar ao middleware local uma allowlist dos handlers existentes de portal. Adaptar método, headers/cookie, query, body e resposta `status/json/setHeader`, preservando Set-Cookie. Caminho não autorizado segue para o Vite. Reutilizar um adaptador, sem criar framework novo. Validar por HTTP local que `/api/dash-data?op=partners` responde JSON com status de API, e não HTML da SPA. Não usar dados reais nem enviar senha ao banco para esse smoke test; ausência de sessão/configuração permite verificar o roteamento sem consultar registros.

O ambiente da Vercel é outra camada; este achado não afirma que a Vercel deixa de atender as funções.

### F. Registro do ticket 03 superestima o alcance

O resultado chama banco de “N/A” e código de “pronto para commit/deploy”. A autorização no handler é testável localmente, mas depende da tabela de sessão, configuração e banco reais para funcionar. Não basta usar service-role para excluir essa dependência. O pacote 02–07 já exigia implantação coordenada.

Os 32 casos do arquivo incluem seis testes antigos que recriam regras de busca/estado, além dos casos novos do ticket. Não são 32 novos testes de integração do portal.

**Correção documental:** registrar “implementado localmente, testes de componentes pendentes; integração de banco pendente; não liberado para deploy isolado”. Corrigir contagem por grupo e nomes. Guardar o resultado exato das verificações sem chamar todo teste de integração real.

## Orientação enxuta para o executor

1. Ler somente este checkpoint e os símbolos envolvidos em A–F. Não reler toda a auditoria/17 tickets em cada contexto.
2. Primeiro contexto: corrigir A e registrar teste da função real. É uma tarefa curta e independente.
3. Segundo contexto: corrigir B/C em API/fetchers; testar sucesso, sessão inválida e infraestrutura falha, aproveitando as fixtures existentes.
4. Terceiro contexto: corrigir D/E e executar smoke local + montagem real do layout. Esta é a verificação funcional que os testes de handler deixaram de fora.
5. Atualizar F, manter banco/navegador pendentes e devolver para revisão. Só então continuar o 04.

Em cada ciclo, rodar o teste relevante; ao fechar o contexto, suíte, tipagem e lint. Build ao fechar mudanças de dependência/middleware e o conjunto. Não gerar novamente centenas de linhas de um banco falso para cada endpoint; usar respostas externas controladas e validar filtros/chamadas necessários. Não trocar testes reais por cópias de regras. Não escrever um teste de cada detalhe mecânico que não acrescenta evidência.

Não refatorar agora todo o arquivo de 1.057 linhas apenas para reduzir tamanho: isso também consumiria tempo. Reutilizar o que está correto e reduzir o escopo dos próximos incrementos.

Os tickets 04–17 permanecem como direção, mas cada contexto do executor recebe apenas uma entrega delimitada. Contagem de tickets ou de testes não é medida de progresso; comportamento confirmado é.
