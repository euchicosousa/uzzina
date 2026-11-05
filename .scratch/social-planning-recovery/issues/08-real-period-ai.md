# T08: Gerar período por IA respeitando slots e formatos confirmados

## Modelos sugeridos

- **OpenAI** — GPT-6 Astra, para validar geração por período e consistência de slots e formatos.
- **Anthropic** — Claude Opus 5.5, para validar geração por período e consistência de slots e formatos.
- **Google** — Gemini 4 Argon, para validar geração por período e consistência de slots e formatos. Disponibilidade depende do plano do Antigravity.

**Status:** ready-for-agent
**Blocked by:** T03 e T07.
**Origem:** R3/R6; integração tema/período, regulares/extras.
**Prioridade:** P2
**Regra de conclusão:** todos os critérios e testes deste ticket são obrigatórios. Sem evidência, usar implemented-unverified; com falha, verification-failed. Ler a regra completa no README.
**Instrução:** não iniciar integração dependente antes de verificar os bloqueios. Caminhos e símbolos estão no mapa de referências desta série.

**What to build:** A proposta por período usa a mesma operação real de IA e produz exatamente os slots regulares e extras confirmados, sem alterar o pedido para acomodar a saída do modelo.

## Executar nesta ordem

1. Capturar configuração validada T03 no disparo; servidor revalida entradas e autorização, sem confiar em slots derivados pelo browser.
2. Vincular slots/regulares/extras e formatos à operação durável T07. Cada sugestão recebe ID da aplicação e origem verificável; provedor não decide parceiro ou vínculo.
3. Validar saída contra slots/formatos esperados. Não corrigir contagem inventando ou removendo ideias, relabelar formato ou mudar data silenciosamente.
4. Persistir entrada normalizada e resultado; resumo/lista/calendário usam os mesmos dados T04.
5. Nova geração para período igual ignora ações existentes. Retry técnico mantém a operação anterior. Nenhum conteúdo vira ação nesta etapa.
6. Manter análise editorial curta se prevista em D6; não implementar chat ou novos cadastros.

## Testes obrigatórios

| ID  | Cenário                                                              | Resultado                                                                             |
| --- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| B01 | Período com 12 regulares e 1 extra externo aos dias regulares        | Exatamente 13 conforme fixture D2–D4; IDs/data/formato de cada slot conferidos.       |
| B02 | Um regular manual 1 reel + um extra                                  | Geração integrada funciona; reel regular preservado e extra não consome sua contagem. |
| B03 | Colisão de comemorações e intervalo curto/virada de ano              | Mesmos resultados de T03, sem data externa nem resumo diferente.                      |
| B04 | Modelo omite slot, duplica slot ou devolve data/formato incompatível | Saída inválida não vira proposta confirmada; sem remendo silencioso.                  |
| B05 | Formulário muda enquanto provedor responde                           | Resultado pertence à entrada capturada, não ao formulário novo.                       |
| B06 | Existe ação em todas as datas e 9 aprovadas de proposta anterior     | Novo pedido continua com total integral; nenhum desconto de ações.                    |
| B07 | Persistência falha/retry e mesma operação concorre                   | Mesmas garantias A06–A08, incluindo contagem única do provedor.                       |
| B08 | Abrir resultado em outra sessão autorizada                           | Entrada, contagens e sugestões iguais às confirmadas, sem regenerar.                  |

## Acceptance criteria

- [ ] B01–B08 cobrem UI/handler/validação/persistência reais com somente provedor controlado.
- [ ] Snapshot textual de prompt não substitui assert de slots e formatos.
- [ ] Quantidade/data/formato incompatíveis impedem confirmação.
- [ ] Zero INSERT/PATCH de ações durante geração, revisão e reabertura.

## Entrega obrigatória

- Relatório T08-evidence.md no formato do README, com cada ID de teste e evidência.
- Alterações formatadas e verificações pertinentes, sem escrever “concluído” com critério pendente.
- CURRENT atualizado apenas com fatos observados. Não alterar status de outros tickets, SQL remoto ou deploy por inferência.
