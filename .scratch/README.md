# Tickets abertos da UZZINA

Comece aqui para encontrar o próximo passo, a autorização e a ficha correspondente. O [TODO](../TODO.md) reúne ideias e verificações gerais. O [CURRENT](../docs/audits/CURRENT.md) reúne ambiente, evidências e pendências do piloto. Quando a autorização estiver indefinida, a Planta confirma o escopo antes de encaminhar a execução.

## Pendências do piloto de Instagram

Em 26/11/2026 o proprietário confirmou várias datas, duplicação sem agendamentos e calendário. O proprietário também confirmou em produção que o Reel agendado funcionou após a correção da preparação. A publicação imediata de Reel funcionou na segunda tentativa. O diagnóstico já publicado fica disponível se a falha voltar.

A desconexão e a reconexão com um perfil real foram aprovadas pelo proprietário em produção em 27/11/2026, no commit `3876e0fc`. [Registro do aceite](instagram-composio/issues/02-conectar-perfil.md).

## Cloudinary em produção

- Em 27/11/2026, as capturas do painel registraram a remoção de 35 originais com derivados. Os avisos mostraram 55 backups pendentes e zero limpezas de backup confirmadas. A investigação sobre os backups aguarda retomada. [Registro do teste](cloudinary-cleanup/issues/01-arquivos-sem-vinculo.md#teste-do-painel-em-27112026)

## Referências fora da fila de execução

- [Planejamento original](social-planning/README.md): nove tickets antigos com registros divergentes; a recuperação T01–T12 foi aceita e arquivada pelo proprietário em 21/11/2026; não há pendência nela. Mantidos para referência, sem declarar os antigos pendentes como resolvidos.
- [Consistência visual](visual-consistency/README.md): onze tickets de série suspensa pelo proprietário. Não executar nem considerar concluídos somente por seus campos completed.

Novos tickets entram na série correspondente. Ao encerrar, manter somente pendências na lista ativa e consolidar finalidade, aceite, commit e limites no histórico.

## Registros anteriores da fila

- **Cloudinary aprovado em 26/11/2026.** Em Administração → Cloudinary, o proprietário confirmou a exclusão definitiva publicada em `735e4de3`. A tela diferencia ações, perfis e logotipos, e pede confirmação por lote. [Registro do aceite](cloudinary-cleanup/issues/01-arquivos-sem-vinculo.md#ex-clientes-e-exclusão-definitiva--26112026).

Em 22/11/2026, HOJE-06 foi aprovado e encerrado pelo proprietário; implementação local, sem publicação, registrada no [histórico](archive/resolved-tickets.md). Os demais ajustes de uso (HOJE-05, CAL-02, GAV-01), o seletor de modelos (IA-M10), design system (DS35 a DS37) e Planejamento (T01–T12, T11 aceito como parecer parcial) foram aprovados; o site publicado foi conferido pelo proprietário. HOJE-04 também foi conferido no app publicado em 22/11.

[Histórico consolidado](archive/resolved-tickets.md): tickets encerrados/aprovados e os 11 registros da antiga série C do Planejamento, substituída pela recuperação. Os antigos arquivos individuais foram retirados e seus links redirecionados.

**Design system fechado em 11/11/2026.** O proprietário aprovou DS05 (ordem do ícone), DS12, DS13, DS15 (cores e superfícies) e DS16 (retirada da cor do parceiro); em 12/11, o DS14 (sombra colorida da paleta) e o DS11 (cor da fase nos cartões), que absorveu o DS10 (foco, Sprint e sombras do cartão). Estão no [histórico](archive/resolved-tickets.md) e foram enviados ao GitHub (`main` igual a `origin/main` em 12/11); o deploy Ready na Vercel não foi conferido. Em 13/11 o DS08 foi encerrado sem implementação; DS17 e DS18 foram implementados e enviados ao GitHub e foram concluídos pelo proprietário em 18/11.

**IA-M02 encerrado.** Abas de Minha Conta publicadas conforme confirmação do proprietário e integradas à main local em 06/11.

Ao criar um ticket ou mudar seu escopo, inclua as três opções da seção `Modelos sugeridos` conforme o [guia de agentes](../AGENTS.md#recomendações-de-agentes-nos-tickets).
