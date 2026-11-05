# T04: Separar configuração nova da proposta aberta e proteger transições

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Sol, para proteger transições entre configuração e proposta aberta.
- **Anthropic** — Claude Sonnet 5.5, para proteger transições entre configuração e proposta aberta.
- **Google** — Gemini 4 Argon, para proteger transições entre configuração e proposta aberta. Disponibilidade depende do plano do Antigravity.

**Status:** ready-for-agent
**Blocked by:** T02. T01/D6 para validar entrada persistida.
**Origem:** R8; limpeza de contexto e respostas antigas.
**Prioridade:** P2
**Regra de conclusão:** todos os critérios e testes deste ticket são obrigatórios. Sem evidência, usar implemented-unverified; com falha, verification-failed. Ler a regra completa no README.
**Instrução:** não iniciar integração dependente antes de verificar os bloqueios. Caminhos e símbolos estão no mapa de referências desta série.

**What to build:** Preparar dezembro não modifica a visualização de um plano aberto de novembro. Trocar parceiro/proposta preserva ou descarta edições somente por decisão explícita.

## Executar nesta ordem

1. Definir estado distinto para configuração da próxima geração, proposta canônica aberta e rascunho editado. Não criar store global só para isso.
2. Derivar lista/calendário da proposta aberta, nunca das datas mutáveis do formulário esquerdo.
3. Reabrir por leitura autorizada T02, com versão. Restaurar configuração completa e validar campos ausentes; não herdar valores de outro plano silenciosamente.
4. Coordenar troca de parceiro, proposta e saída com a guarda vigente. Cancelar mantém contexto e URL; descartar é explícito. Não substituir guardas globais.
5. Associar respostas a identidade, parceiro e abertura. Última escolha válida vence; nenhuma resposta atrasada reabre contexto antigo.
6. Resize/aviso de largura preserva os estados sem gerar/finalizar novamente. Não criar experiência mobile.
7. Remover resets automáticos que desmontam edição antes da guarda. Limpeza de sessão continua imediata, sem expor dados anteriores.

## Testes obrigatórios

| ID  | Cenário                                              | Resultado                                                                              |
| --- | ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
| W01 | Abrir novembro; editar formulário para dezembro      | Resultado continua novembro até nova proposta escolhida/gerada.                        |
| W02 | Abrir período, depois tema, depois período diferente | Todos os campos visíveis pertencem à entrada correspondente; nenhum valor residual.    |
| W03 | Entrada antiga incompleta/corrompida                 | Aviso recuperável; sem Date inválida/render quebrado e sem completar dados inventados. |
| W04 | Edição pendente; trocar parceiro; cancelar           | Edição, parceiro, URL e proposta originais preservados.                                |
| W05 | Mesmo fluxo, confirmar descarte                      | Novo parceiro sem plano antigo e sem gravação implícita.                               |
| W06 | A lento, B rápido; resposta A chega depois           | B permanece; cache/visualização não adotam A.                                          |
| W07 | Logout e conta nova enquanto leitura pendente        | Nenhum dado da conta anterior aparece.                                                 |
| W08 | Reduzir e restaurar largura                          | Rascunho conservado; zero geração/finalização adicional.                               |

## Acceptance criteria

- [ ] W01–W08 executados com componente real e respostas controladas; não testar apenas setters.
- [ ] Render do calendário recebe entrada da proposta aberta.
- [ ] Todas as transições preservam guardas sem alterar Header/AppBar/acessos.
- [ ] Estado incompatível é erro explícito, não mistura de propostas.

## Entrega obrigatória

- Relatório T04-evidence.md no formato do README, com cada ID de teste e evidência.
- Alterações formatadas e verificações pertinentes, sem escrever “concluído” com critério pendente.
- CURRENT atualizado apenas com fatos observados. Não alterar status de outros tickets, SQL remoto ou deploy por inferência.
