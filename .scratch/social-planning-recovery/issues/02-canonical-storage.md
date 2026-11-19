# T02: Salvar e editar propostas no banco com autorização e versão

## Modelos sugeridos

- **OpenAI** — GPT-6 Astra, para validar autorização, concorrência de versão e reabertura.
- **Anthropic** — Claude Opus 5.5, para validar autorização, concorrência de versão e reabertura.
- **Google** — Gemini 4 Argon, para validar autorização, concorrência de versão e reabertura. Disponibilidade depende do plano do Antigravity.

**Status:** implemented-unverified. A versão preparada segue a proposta antiga de acesso de membros. D1 agora exige admin ativo e requer revisão da implementação, dos testes e do SQL preparado. A evidência de 06/11 é histórica.
**Blocked by:** Retomada da série. D1 já foi definido, então a revisão de acesso pode avançar independentemente. A validação de toda a proposta usa a saída ainda pendente de D6.
**Origem:** R4, R5 e R11; C01.
**Prioridade:** P1
**Regra de conclusão:** todos os critérios e testes deste ticket são obrigatórios. Sem evidência, usar implemented-unverified; com falha, verification-failed. Ler a regra completa no README.
**Instrução:** não iniciar integração dependente antes de verificar os bloqueios. Caminhos e símbolos estão no mapa de referências desta série.

**What to build:** Uma proposta salva no navegador A é lida no B por identidade autorizada. Editar conserva versão canônica e nunca atravessa parceiro ou conta.

## Executar nesta ordem

1. Inventariar catálogo/tipos/helpers atuais, migration preparada e todos os consumidores de storage. Registrar campos reais: não presumir people.role nem converter UUID/texto sem conferir.
2. Corrigir/preparar migration incremental e executar a mesma migration em banco descartável controlado. Tabela, grants, RLS, constraints e versão devem ser os usados pelo app, não um schema de teste simplificado.
3. Implementar leitura/lista/criação/edição em models/services autorizados; rota e componente não chamam .from(). Dados mutáveis são validados no limite; identidade vem da sessão.
4. Exigir administrador ativo para ler ou alterar qualquer proposta, incluindo as operações versionadas. Validar parceiro elegível. Preservar autoria e vínculo da proposta. Ocultar a entrada no menu, busca e tela do parceiro e aplicar a guarda administrativa na rota direta. Usar o padrão administrativo existente e verificar a regra no banco e no servidor.
5. Fazer comparação da versão esperada e incremento no banco na mesma escrita. Retornar registro canônico; disputa resulta em conflito explícito, sem last-write-wins silencioso.
6. Conectar lista, reabertura, edição, aprovação e rejeição da Mesa ao banco. Sem parceiro válido, exibir seleção sem listar tudo.
7. Remover salvamento automático dentro do gerador e todos os fallbacks localStorage/default/global do fluxo ativo. Não importar cópias antigas sem autoria; não apagá-las silenciosamente.
8. Erro de leitura não aparece como vazio. Erro de escrita preserva rascunho. Cache inclui identidade/escopo e descarta resposta antiga após reset.
9. Atualizar contratos/KIs exigidos pelo AGENTS. Registrar aplicação local e remota separadamente. Este ticket não exige aplicação em produção para provar os testes.

## Testes obrigatórios

Usar banco isolado real, identidades distintas e políticas reais. A configuração de testes deve recusar host/projeto de produção e abortar se o destino não estiver explicitamente definido.

| ID  | Ação                                                              | Resultado exato                                                                                       |
| --- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| P01 | Aplicar migration sobre catálogo isolado compatível               | Sem coluna inexistente, erro de UUID/array ou grant ausente; CRUD autorizado funciona.                |
| P02 | Admin cria P; outro navegador ou admin ativo autorizado lê P             | Mesmo ID, entrada, sugestões e versão; localStorage pode estar vazio/desabilitado.                    |
| P03 | Membro comum, inclusive do parceiro, ou sessão ausente acessa Mesa e dados | Entradas ocultas, rota e operações recusadas, sem conteúdo nem alteração. Verificar banco e servidor isolados.                   |
| P04 | Admin inativo, papel removido ou parceiro arquivado             | Novas leituras/escritas negadas segundo contrato; zero ampliação de escopo.                           |
| P05 | Ator tenta alterar autoria/parceiro por payload                   | Rejeitado; linha original inalterada.                                                                 |
| P06 | Dois clientes editam versão V com alterações diferentes           | Exatamente uma escrita aceita; outra conflito. Versão V+1 e campos do vencedor, sem perda silenciosa. |
| P07 | Desconectar escrita; salvar edição; reconectar e repetir          | Texto preservado, sem “salvo” falso; uma versão confirmada após retry.                                |
| P08 | Logout/A→B durante leitura ou escrita pendente                    | Resposta de A não entra na UI/cache de B.                                                             |
| P09 | Gerar/criar proposta e inspecionar armazenamento local            | Zero novas cópias em chaves default, globais ou por usuário; dados vêm da fronteira canônica.         |
| P10 | Outro admin ativo usa proposta sem se tornar autor                | Leitura e edição versionada permitidas. Autoria e parceiro são preservados.                      |

## Acceptance criteria

- [ ] P01–P10 passam com evidência de banco real isolado; nenhum mock substitui RLS/CAS.
- [ ] Navegadores independentes recuperam a proposta sem copiar armazenamento local.
- [ ] Nenhum consumidor ativo usa atalhos sem escopo ou ignora falha de persistência.
- [ ] Schema, models e UI estão conectados: arquivo SQL sozinho não conclui este ticket.

**Reprova automaticamente:** apenas prefixar localStorage; testar com service-role e alegar autorização de membro; manter expectedVersion opcional sem enviar nos consumidores; migration sem execução controlada.

## Entrega obrigatória

- Relatório T02-evidence.md no formato do README, com cada ID de teste e evidência.
- Alterações formatadas e verificações pertinentes, sem escrever “concluído” com critério pendente.
- CURRENT atualizado apenas com fatos observados. Não alterar status de outros tickets, SQL remoto ou deploy por inferência.
