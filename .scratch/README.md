# Tickets abertos da UZZINA

Comece aqui para encontrar o próximo passo, a autorização e a ficha correspondente. O [TODO](../TODO.md) reúne ideias e verificações gerais. O [CURRENT](../docs/audits/CURRENT.md) reúne ambiente, evidências e pendências do piloto. Quando a autorização estiver indefinida, a Planta confirma o escopo antes de encaminhar a execução.

## Pendências do piloto de Instagram

| Entrega | Situação e próxima ação | Responsável |
| --- | --- | --- |
| Programar Stories na gaveta da ação | Agendador ativo com execução registrada. Triar validação da margem, outros formatos e cenários abertos na [ficha](instagram-composio/issues/04-programar-stories.md). Novos envios de teste em produção dependem de autorização. | Planta |
| Consultar o calendário na tela Publicações | Publicado, com aceite visual pendente. Preparar a [conferência de leitura](../docs/audits/CURRENT.md) para o aceite do proprietário. [Critério na ficha](instagram-composio/issues/04-programar-stories.md#critérios-de-aceite) | Prova prepara, proprietário dá o aceite |

## Propostas para revisão do proprietário

- [Formulários administrativos no padrão de Parceiros](admin-forms/issues/01-align-admin-forms.md) — adequar Novo e Editar em Usuários e Clientes e mapear outras páginas administrativas que se beneficiariam do padrão.
- [Exclusão definitiva de parceiro arquivado](partner-cleanup/issues/01-exclusao-parceiro.md) — gestão de parceiros, com prévia das ações e definição para registros compartilhados.
- [Limpeza de arquivos sem uso no Cloudinary](cloudinary-cleanup/issues/01-arquivos-sem-vinculo.md) — inventário, revisão e exclusão selecionada.
- [Integração Instagram pela Composio](instagram-composio/issues/01-piloto-conexao.md) — sete etapas, do piloto de permissões aos relatórios e análise de comentários. O plano visual continua em [HTML](../docs/plans/instagram-composio.html).
- [Limite e unificação de funções da Vercel](vercel-functions/issues/01-investigar-limite-e-unificacoes.md) — confirmar o limite do plano, contar as funções atuais e recomendar possíveis unificações sem implementação neste estudo.
- [EST-06 — Cron de geração de estratégias](action-strategy/issues/06-investigate-strategy-worker-cron.md) — investigar por que o processamento persistente de estratégias da gaveta de ação precisa de um cron e se o recurso continua desejado.

## Referências fora da fila de execução

- [Planejamento original](social-planning/README.md): nove tickets antigos com registros divergentes; a recuperação T01–T11 é a fila vigente. Mantidos para referência, sem declarar os antigos pendentes como resolvidos.
- [Consistência visual](visual-consistency/README.md): onze tickets de série suspensa pelo proprietário. Não executar nem considerar concluídos somente por seus campos completed.

Novos tickets entram na série correspondente. Ao encerrar, manter somente pendências na lista ativa e consolidar finalidade, aceite, commit e limites no histórico.

## Registros anteriores da fila

Em 22/11/2026, HOJE-06 foi aprovado e encerrado pelo proprietário; implementação local, sem publicação, registrada no [histórico](archive/resolved-tickets.md). Os demais ajustes de uso (HOJE-05, CAL-02, GAV-01), o seletor de modelos (IA-M10), design system (DS35 a DS37) e Planejamento (T01–T12, T11 aceito como parecer parcial) foram aprovados; o site publicado foi conferido pelo proprietário. HOJE-04 também foi conferido no app publicado em 22/11.

[Histórico consolidado](archive/resolved-tickets.md): tickets encerrados/aprovados e os 11 registros da antiga série C do Planejamento, substituída pela recuperação. Os antigos arquivos individuais foram retirados e seus links redirecionados.

**Design system fechado em 11/11/2026.** O proprietário aprovou DS05 (ordem do ícone), DS12, DS13, DS15 (cores e superfícies) e DS16 (retirada da cor do parceiro); em 12/11, o DS14 (sombra colorida da paleta) e o DS11 (cor da fase nos cartões), que absorveu o DS10 (foco, Sprint e sombras do cartão). Estão no [histórico](archive/resolved-tickets.md) e foram enviados ao GitHub (`main` igual a `origin/main` em 12/11); o deploy Ready na Vercel não foi conferido. Em 13/11 o DS08 foi encerrado sem implementação; DS17 e DS18 foram implementados e enviados ao GitHub e foram concluídos pelo proprietário em 18/11.

**IA-M02 encerrado.** Abas de Minha Conta publicadas conforme confirmação do proprietário e integradas à main local em 06/11.

Ao criar um ticket ou mudar seu escopo, inclua as três opções da seção `Modelos sugeridos` conforme o [guia de agentes](../AGENTS.md#recomendações-de-agentes-nos-tickets).
