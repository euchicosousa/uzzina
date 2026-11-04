# 42 — Padronizar indicadores de carregamento com ULoader

**What to build:** reutilizar ULoader nos spinners equivalentes do app, preservando tamanho, cor contextual e acessibilidade dos estados de carregamento.

**Blocked by:** nenhum. Executor Gemini. Coordenar edição dos consumidores com V40/V43 e demais trabalhos do checkout.

**Status:** done

- [x] Confirmar inventário atual. Estudo encontrou 12 usos operacionais de ULoader e 16 spinners externos: oito de página e oito inline. Registrar candidatos e diferenças antes da migração.
- [x] Ampliar o contrato de ULoader apenas no necessário para cor herdada e atributos acessíveis. Preservar o comportamento dos consumidores atuais que dependem de text-muted-foreground.
- [x] Migrar primeiro indicadores inline de botões/ações, respeitando escala de ícone 12/16/20px e os nomes acessíveis dos botões. Preservar disabled, texto, posição e largura durante carregamento.
- [x] Migrar carregamentos de página com tamanhos explícitos da escala atual. No caso existente de 40px da revisão pública, preservar a geometria por compatibilidade ou registrar decisão de tamanho antes de alterá-la, sem normalização silenciosa.
- [x] Preservar status, mensagens Carregando, anúncios acessíveis, foco e regiões de carregamento. Um ícone decorativo dentro de botão rotulado não deve gerar anúncio duplicado.
- [x] Conservar skeletons, blocos pulsantes e gradiente de geração de IA, que expressam estados distintos de spinner.
- [x] Atualizar galeria para mostrar tamanhos e cor contextual sem chamadas ao banco. Conferir botão neutro, primário, destrutivo, toast e página, em claro/escuro e janela estreita.
- [x] Conferir referências residuais e justificar spinners preservados. Formatar, lint/typecheck conforme mudança e testes somente para regressões concretas. Não disparar IA paga para simular carregamento.

Referência em docs/audits/2026-11-04-component-consolidation-studies.md. Começar CURRENT/AGENTS, preservar alterações externas e atualizar resultado, prova e pendências reais. Não publicar por consequência deste ticket.
