# IA-M09 — Estudar conta e pagamento únicos para os modelos de IA (OpenRouter)

Aberto em 12/11/2026 a pedido do proprietário. **Ticket de estudo:** entrega relatório e recomendação. Nenhuma alteração de código, chave, banco ou configuração; a implementação, se houver, vira outro ticket depois da decisão.

## Modelos sugeridos

- **Claude Code (Anthropic):** Claude Sonnet 5.5, para ler a API de IA, a franquia e o registro de custo e cruzar com a documentação dos serviços.
- **Codex (OpenAI):** GPT-6.1 Terra, para a mesma leitura com foco no cálculo de custo e nas funções de banco da franquia.
- **Antigravity (Google):** Gemini 3.8 Flash, para a pesquisa documental ampla (preços, taxas, limites, política de dados); confirmar disponibilidade no plano.

**Bloqueado por.** Nenhum. Não bloqueia o [IA-M08](08-file-transcription-and-interpretation.md).

## O problema, em linguagem simples

Hoje a UZZINA tem uma conta e uma chave na OpenAI e outra na Anthropic: duas faturas, dois saldos para acompanhar. Novas funções podem pedir um terceiro provedor (por exemplo, Google, para ler vídeo). O proprietário considera usar o OpenRouter: uma conta só, uma chave só, um pagamento só, com acesso aos modelos de várias empresas.

## Onde isso aparece

Não há tela nova. Afeta tudo o que usa IA: gerar estratégia, conteúdo e legenda na gaveta da ação; a franquia mensal e o uso de IA em Minha Conta; e a futura leitura de arquivos (IA-M08).

## O que o estudo precisa responder

1. **Custo real.** Quanto o OpenRouter cobra além do preço do modelo (taxa na compra de créditos, taxa por chamada, câmbio/impostos para pagamento do Brasil). Comparar com o gasto dos últimos meses nas contas diretas.
2. **Franquia e registro de custo.** Hoje o gasto é calculado por modelo, com as tarifas oficiais guardadas no servidor e no banco. Passando por um intermediário, o que muda: usar o custo que ele informa por chamada, manter o cálculo próprio, ou os dois com conciliação. Listar o que teria de ser alterado.
3. **Compatibilidade.** Se os comandos atuais funcionam igual (respostas em formato estruturado, cache de prompt, modelos de raciocínio), e se os mesmos sete modelos do catálogo existem lá com os mesmos nomes.
4. **Arquivos e transcrição.** Como ficam imagem, PDF, áudio e vídeo. O OpenRouter tem catálogo próprio de transcrição de áudio (lista e preços no [IA-M08](08-file-transcription-and-interpretation.md), seção "Modelos de transcrição de áudio"), o que dá acesso ao ElevenLabs Scribe v2 sem conta nova. Confirmar se esse serviço aceita o endereço do arquivo ou exige o arquivo embutido na requisição (limite de tamanho da Vercel), e o tamanho/duração máximos.
5. **Confiabilidade e dados.** Histórico de indisponibilidade, o que acontece quando um provedor cai, limites de uso, e a política de retenção e de uso dos dados dos clientes da agência.
6. **Alternativas.** Comparar três caminhos lado a lado: OpenRouter; AI Gateway da Vercel (mesma ideia, dentro da conta que a UZZINA já usa; estudo de 05/11 em [ai-provider-sdk](../../../docs/audits/2026-11-05-ai-provider-sdk.md)); e continuar direto com cada empresa.
7. **Caminho de volta.** Quanto custa desfazer se não der certo, e se dá para migrar um comando por vez.

## O que entregar

Relatório em `docs/audits/` com: tabela comparativa dos três caminhos (custo, esforço de mudança, risco), a lista do que mudaria na UZZINA em cada um, fontes oficiais com data, e uma recomendação. Dizer claramente o que foi lido em documentação e o que foi (ou não) testado com chamada real.

## Fora do escopo

Criar conta, comprar créditos, trocar chaves, alterar a API de IA, o catálogo de modelos ou a franquia. Teste com chamada real só com autorização explícita do proprietário.

## O que o proprietário decide depois do relatório

Qual dos três caminhos seguir e, se for mudar, por qual comando começar.

## Onde está

Relatório entregue em 12/11/2026: [docs/audits/2026-11-12-single-ai-account-study.md](../../../docs/audits/2026-11-12-single-ai-account-study.md). Checkout local, sem commit. **Encerrado em 12/11/2026** por decisão do proprietário: ficar só com a OpenAI. Cache de prompts e acompanhamento de gasto estudados à parte, sem implementação.
