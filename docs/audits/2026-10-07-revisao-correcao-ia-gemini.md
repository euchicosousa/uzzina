# Revisão da correção local de IA — Gemini

Data: 07/10/2026. HEAD: `0f8c637ee7da38d25b0b54a8cb290ff47984ae01`.

## Conclusão

A correção implementa o roteiro autorizado e resolve no código a dependência indevida de service_role/quota no Vite local habitual. Não foi encontrado defeito bloqueante no desvio local introduzido. Nenhum código, ambiente, banco ou deploy foi alterado nesta revisão; somente documentação.

A análise ficou restrita ao roteiro, relatório, handler de IA, adaptador local, configuração Vite, cliente e testes relacionados. O checkout inclui muitas alterações anteriores; o diff contra HEAD não permite atribuir todas as mudanças da API somente ao Gemini. Não é uma nova certificação da auditoria inteira.

## O que está confirmado

1. O adaptador define a flag interna como true apenas no modo Vite development e false nos demais. Ela não vem do payload do usuário nem usa prefixo VITE_.
2. O handler exige simultaneamente development, flag true e ausência de VERCEL para dispensar a quota. Não libera geração como fallback de erro do banco.
3. No modo local, a chave pública recebe o Bearer do usuário. O handler verifica o token com getUser e exige people.visible=true. Dispensar quota não dispensa autenticação.
4. Fora desse modo, service_role e limite válido continuam obrigatórios. A RPC reserva antes da OpenAI; erro retorna 503 e esgotamento retorna 429, sem chamar o provedor.
5. Validação de entrada/saída e mensagens públicas seguras permanecem no fluxo. A correção reaproveita o handler, sem segunda API ou novo framework.
6. A alteração adicional em login.tsx move o divisor para a terceira coluna do grid. É independente da IA e está mencionada no relatório, embora ausente da lista inicial de arquivos modificados. Sua aparência não foi revalidada nesta revisão.

## Verificação executada pelo Codex

| Verificação | Resultado | Limite |
| --- | --- | --- |
| Testes de API/cliente de IA | 56 passaram, 0 falhas, 151 asserções | Handler real; Supabase/OpenAI controlados |
| Suíte completa | 266 passaram, 0 falhas, 825 asserções | Não certifica banco/provedor/navegador reais |
| Tipagem | Passou | Compilação estática |
| Lint | Passou; 272 arquivos | Sem erros ou avisos |
| Build | Passou | Aviso existente de chunks acima de 500 kB permanece |

As contagens de asserções diferem do relatório do Gemini (149/823); a execução desta revisão retornou 151/825. Quantidade de testes permanece igual. Não há falha associada a essa diferença.

Os testes chamam o handler existente e controlam somente dependências externas. São úteis para regras de autenticação, recusa, seleção da chave e ordem quota→OpenAI; não são substitutos de geração real no navegador. O adaptador Vite não é iniciado nesses dez casos: a atribuição da flag foi conferida pela leitura do código.

## Correções de interpretação do relatório

- Testes reais locais 1–3: registrados como aprovados pelo proprietário no retorno do Gemini. Nesta revisão não houve nova execução no navegador nem conferência independente dos prints; preservar a atribuição ao proprietário.
- Teste de staging 4: **parcial**. A evidência apresentada é a inicialização sem o aviso de compatibilidade. Isso não demonstra por si só reserva persistida durante uma geração real. O comportamento estrito está verificado no código e nos testes controlados.
- Teste de Vercel 5: verificado somente no código/testes, conforme o próprio relatório. Produção não implantada nem testada nesta rodada.
- O roteiro antigo diz “ainda NÃO implementada”: descreve o momento da elaboração, não o estado atual. Para continuidade, usar CURRENT e esta revisão.

## Próximos passos mínimos

1. Para fechar a evidência de staging, gerar uma única legenda com conta fictícia no ambiente staging; conferir sucesso e incremento de attempts para o usuário/dia UTC no banco. Não remover a RPC nem gastar chamadas em loop. Registrar o resultado separadamente dos testes controlados.
2. Antes de publicar a API, confirmar configuração de servidor e migration de quota no banco de produção. Sem isso, a versão nova ainda pode retornar 503 em produção; a exceção local não resolve implantação.
3. Não implementar agora o acompanhamento futuro por agência. Ele está separado em `docs/plans/2026-10-07-consumo-ia-por-agencia.md`.

Não é necessário reabrir a correção local nem adicionar camadas para encerrá-la. A pendência principal é evidência de integração e coordenação da publicação.


## Integração real concluída — passo 1,07/10/2026

Resultado em `docs/audits/2026-10-07-passo-1-homologacao-staging.md`. IA/API estrita comprovou incremento persistido de quota e geração200; interface gerou, salvou e reabriu legenda real. Portal/revisão/contas/pessoas/Auth/lote/CAS passaram na matriz descrita, após correção do handler local create-user e Content que exigia contexto privado no portal. Opção de revisão sem parceiro desabilitada. Dados descartáveis removidos e fixtures restauradas.267 testes/0 falhas; tipagem/lint/build passam. Substitui pendências históricas desses fluxos no staging; produção, leads, Safari/telefone/upload e demais limites continuam pendentes. Não declara ticket17 integralmente homologado.
