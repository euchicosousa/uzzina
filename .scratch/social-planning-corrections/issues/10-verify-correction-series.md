# C10: Verificar integração e registrar aceite real do Planejamento

**Status:** completed — suíte de slots e storage (25 PASS), serverless runtime (9 PASS), tsc (0 erros) e relatório consolidado emitido

**Blocked by:** C01–C09 e decisões D1–D6 resolvidas para os comportamentos entregues.

**Prioridade:** P2

**Instrução de execução:** ler o README desta série; executar apenas este recorte, preservar mudanças externas e respeitar os bloqueios acima.
**What to build:** Um parecer final verificável que demonstra que os achados foram corrigidos juntos, sem anunciar conclusão por uma suíte verde ou por um status documental.

## Passos obrigatórios

1. Ler o relatório original e montar matriz achado→ticket→evidência. Confirmar o commit revisado e os commits/código corrigidos; não confundir trabalhos posteriores de design com esta série.
2. Conferir tipos/contratos usados por toda a mesa: geração, persistência, reabertura, decisões, calendário e conversão compartilham a mesma proposta/versão.
3. Reexecutar somente verificações necessárias ao risco, aproveitando testes já entregues. Cobrir a cadeia configuração válida → IA controlada → salvamento → edição/aprovação → reabertura → movimento → finalização → retry sem duplicata.
4. Cobrir conta/escopo errados, falhas de geração/escrita, conflito, troca de sessão e parceiro. Não usar dados reais como fixtures.
5. Roteiro visual desktop: Header/AppBar originais, duas rolagens independentes, controles aprovados, seleção de parceiro na URL, entradas busca/menu/parceiro para membros, lista/calendário sincronizados e teclado no editor. Abaixo da largura suportada, somente aviso e preservação de estado.
6. Conferir que ações só nascem na finalização, com datas/defaults aprovados e sem redução por ações existentes.
7. Se houve alteração em API/dependências serverless, executar as verificações específicas do AGENTS; build ao publicar. Não executar suites amplas sem necessidade.
8. Atualizar CURRENT e relatório desta série com resultado e pendências reais. Registrar separadamente código preparado, SQL aplicado, teste controlado, provedor real, deploy Ready e aceite visual do proprietário.
9. Não encerrar/modificar tickets originais automaticamente. Recomendar aceite/reabertura com evidências. Se houver falha, apontar o ticket e cenário exato, sem criar melhorias de produto fora da série.

## Acceptance criteria

- [ ] Todos os achados originais e complementares têm evidência ou pendência explícita.
- [ ] Finalização concorrente/retry e acesso entre contas foram verificados em ambiente controlado.
- [ ] Nada é certificado como banco/provedor real só por mocks.
- [ ] Aceite visual permanece identificado como do proprietário.
- [ ] Sem regressão nos consumidores de calendário ou ações tocados pela integração.
- [ ] Nenhum push, SQL ou deploy é assumido como autorizado por este ticket documental.

**Não fazer:** benchmark amplo, nova auditoria de todo o app, suporte mobile ou “aproveitar” para implementar funcionalidades adicionais.
