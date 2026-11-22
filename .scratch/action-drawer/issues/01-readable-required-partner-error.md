# GAV-01 — Mostrar uma mensagem clara ao criar ação sem parceiro

**Onde conferir** — Nova Ação → gaveta → Essencial → Parceiros.

**Antes** — Ao tentar salvar sem parceiro, o alerta do print exibe `Validação falhou: {"partners":["Pelo menos um parceiro é obrigatório"]}`. A validação de criação transforma os erros por campo em JSON e inclui esse texto no erro apresentado.

**Depois** — A gaveta orienta a selecionar pelo menos um parceiro e mantém o rascunho aberto para corrigir.

**Bloqueado por** — Nenhum outro ticket.

**Status.** Encerrado: aprovado pelo proprietário em 21/11/2026 e publicado no GitHub (`main` = `origin/main` em 22/11).

- [ ] Ao salvar sem parceiro, exibir uma mensagem legível em português, como “Selecione pelo menos um parceiro”, sem o objeto JSON no alerta.
- [ ] Manter os dados digitados, adicionar um parceiro e salvar o mesmo rascunho normalmente. Continuar impedindo a criação sem parceiro.
- [ ] Conferir o alerta no mesmo ponto da gaveta mostrado no print e verificar que erros de outro tipo mantêm seu tratamento.

## Modelos sugeridos

- Codex · GPT-6.2 Sol · Primeira opção para corrigir a mensagem e verificar a nova tentativa no mesmo rascunho.
- Codex · GPT-6.1 Sol · Alternativa para um ajuste localizado na apresentação do erro de validação.
- Codex · GPT-6.2 Astra · Alternativa se a mensagem passar por caminhos diferentes de gravação e recuperação do rascunho.
