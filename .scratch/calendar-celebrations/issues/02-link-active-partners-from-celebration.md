# CAL-02 — Vincular parceiros ativos ao criar ou editar uma data comemorativa

**Onde conferir** — Administração → Datas comemorativas, no formulário de criação e na janela de edição. Também na Busca global → Criar data comemorativa.

**Antes** — A janela do print tem título, feriado e calendário. O vínculo com a data é gerenciado a partir da edição do parceiro. A administração tem formulário próprio para criar e compartilha a janela de edição com o fluxo de criação da busca.

**Depois** — O administrador seleciona os parceiros ativos no próprio cadastro da data. Em tela larga, o seletor fica ao lado dos campos da data. Em tela estreita, fica abaixo, seguindo a rolagem do formulário.

**Bloqueado por** — Nenhum outro ticket.

**Status** — Aberto na main local. Aguardando implementação, verificação da gravação e revisão visual antes de publicar.

- [ ] Selecionar e remover um ou mais parceiros ativos ao criar ou editar e poder salvar uma data sem seleção. Na edição, carregar os vínculos existentes e preservar vínculos de parceiros inativos ao salvar outras alterações.
- [ ] Reaproveitar o vínculo já gerenciado pela edição do parceiro. Reabrir a data e conferir o mesmo vínculo na edição do parceiro. Uma falha parcial não deve produzir confirmação de sucesso nem duplicar vínculos ao tentar novamente.
- [ ] Preservar autorização administrativa, título, data e feriado. Cancelar descarta alterações locais e, em caso de falha, os campos ficam disponíveis para nova tentativa.
- [ ] Conferir a posição e o uso do seletor com teclado em tela larga e estreita nos pontos de entrada. O proprietário avalia a composição após a implementação.

## Modelos sugeridos

- Codex · GPT-6.2 Sol · Primeira opção para reaproveitar o vínculo existente e integrar os formulários.
- Codex · GPT-6.2 Astra · Alternativa se a gravação conjunta exigir mudanças no banco ou na autorização.
- Codex · GPT-6.1 Terra · Alternativa para verificar o seletor lateral e o fluxo responsivo nos três pontos de entrada.
