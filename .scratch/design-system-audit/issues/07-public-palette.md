# DS07 — Criar paleta padrão para o portal e a página inicial

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Terra, para conferir o visual e isolar a aplicação da paleta por rota.
- **Anthropic** — Claude Sonnet 5.5, para rastrear a inicialização do tema e a troca entre áreas.
- **Google** — Gemini 3.8 Flash, para implementar e verificar o isolamento da paleta em navegação direta e interna.

**Entrega.** Criar uma paleta básica compartilhada, exclusiva da página inicial pública (`/`) e do portal do cliente (`/dash`). As duas áreas usam a mesma identidade de cores mesmo quando a equipe está com outra paleta selecionada no mesmo navegador.

**Bloqueado por.** Nenhum ticket. Coordenar o uso dos arquivos de paleta com o trabalho visual em andamento.

## Aceite

- [ ] Definir as cores básicas com os tokens existentes e apresentar a escolha para aceite visual.
- [ ] Conferir acesso direto, recarregamento e transição entre `/app`, `/` e `/dash`. A cor pública deve entrar sem piscar com a paleta pessoal, e a área interna deve recuperar sua preferência ao voltar.
- [ ] Preservar as preferências salvas da equipe e as regras de tema claro/escuro de cada superfície. Validar contraste dos textos e dos controles em todos os modos efetivamente suportados.
- [ ] Verificar login e navegação do portal, incluindo superfícies que herdam seu layout, mantendo a identidade comercial de cada parceiro nos elementos próprios.
