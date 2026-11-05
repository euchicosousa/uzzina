# IA-M04 — Escolher modelos por comando e salvar padrões pessoais

## Modelos sugeridos

- **OpenAI** — GPT-6.1 Sol, para integrar dois provedores, seleção e padrões por comando.
- **Anthropic** — Claude Sonnet 5.5, para integrar dois provedores, seleção e padrões por comando.
- **Google** — Gemini 4 Argon, para integrar dois provedores, seleção e padrões por comando. Disponibilidade depende do plano do Antigravity.

**Entrega.** Seletor ao lado da ação de gerar. Demonstrar com um comando e ampliar para estratégias, conteúdo, ganchos e legenda conforme a compatibilidade de cada modelo.

**Bloqueado por.** [IA-M01](01-model-catalog-selection-and-metering.md) para integração e [IA-M03](03-monthly-ai-allowance.md) para habilitar o seletor em produção. O redesenho de Minha Conta em IA-M02 é independente.

## Escolha, preferência e execução

- Grupo Prism com ação de gerar e controle separado para abrir o seletor. Mostrar nome do modelo selecionado, agrupar opções por provedor e permitir qualquer modelo compatível. Abrir o seletor não dispara geração. Avaliar foco, teclado, truncamento e alvos no celular.
- Começar com nome e provedor. Se o usuário quiser sinais visuais depois, testar raios com rótulo explícito para uma característica definida. Evitar usar a iconografia de fase ou inferir força a partir do preço. Os exemplos Sol para estratégias, Terra para escrever e Sonnet ou Opus como alternativas são combinações para experimentar.
- Precedência proposta: escolha para esta geração, preferência pessoal do comando, padrão do sistema para o comando. Começar com Luna nos quatro padrões para continuidade e permitir configurar cada padrão separadamente. Preferência ausente, antiga ou indisponível usa o padrão válido e mostra qual será usado. Se o modelo escolhido falhar após o disparo, informar a falha e deixar uma nova escolha explícita.
- Guardar os padrões pessoais por comando nas preferências existentes da pessoa. Uma ação explícita de salvar como padrão distingue experimento pontual de preferência persistente. Validar a estrutura no servidor, preservar o merge dos demais campos e oferecer voltar ao padrão do sistema. Aproveitar a persistência autenticada do Supabase. Só ampliar seu contrato se o campo atual exigir.
- Validar a seleção no servidor e resolver o provedor e modelo efetivos antes de reservar quota. Usar OpenAI e Claude por seus contratos de API próprios, com adaptadores para manter a resposta já esperada pelo app. Na estratégia durável, congelar modelo e versão de tarifa na operação aceita. Uma retomada de salvamento conserva resultado e medição. Verificar IDs válidos, credenciais no servidor, erros por provedor e a mesma identidade editorial da marca.

## Aceite

- Validar acesso, formato e medição para cada combinação habilitada de modelo e comando. Exercitar os dois provedores antes de liberar suas opções.
- Conferir padrão inicial, troca pontual, padrões de duas pessoas, restauração e modelo desativado. Validar teclado e layout estreito.
- Conferir percentual e número de chamadas após trocar de modelo, inclusive com estratégia em andamento e retomada de salvamento.
