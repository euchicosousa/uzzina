# 01: Investigar o limite de funções da Vercel e possíveis unificações

**O que investigar:** confirmar o limite vigente do plano da Vercel e quantas funções o projeto envia hoje. Mapear as rotas e responsabilidades e recomendar quais podem compartilhar uma função sem mudar o comportamento visível nem enfraquecer autenticação, autorização, limites de execução ou tratamento de erros. A integração do Instagram acrescenta uma rota ao conjunto atual; verificar se isso ultrapassa o limite observado pelo proprietário. Entregar um relatório com contagem comprovada, opções, riscos, estimativa e roteiro de validação. Este ticket é somente de investigação: não unir arquivos, alterar rotas/configuração, modificar código, publicar ou mudar o plano.

**Bloqueado por:** Nenhum (pode começar imediatamente).

**Status:** ready-for-agent

- [ ] Confirmar em fonte oficial o limite aplicável ao plano e em qual etapa a Vercel o aplica.
- [ ] Comparar a contagem local de handlers com a última implantação e explicar diferenças por ambiente/roteamento.
- [ ] Inventariar cada função: finalidade, métodos, autenticação, duração, segredos, dependências e consumidores.
- [ ] Identificar agrupamentos possíveis e estimar impacto em segurança, manutenção, observabilidade, limites de execução e compatibilidade das URLs.
- [ ] Recomendar a menor mudança que deixe margem para as rotas já previstas, com passos de execução, verificação e reversão.
- [ ] Registrar conclusão e fatos não verificáveis sem acesso ao painel ou a uma implantação.

## Modelos sugeridos

- Codex — gpt-6.2-sol. Adequado para inventariar handlers e comparar candidatos de baixo risco.
- Codex — gpt-6.2-astra. Alternativa para avaliar interações de autenticação, duração e segurança entre APIs.
- Codex — gpt-6.1-terra. Alternativa para conferir o comportamento das rotas e explicar opções de forma clara.
