# Tickets abertos da UZZINA

Comece aqui para encontrar o próximo passo, a autorização e a ficha correspondente. O [TODO](../TODO.md) reúne ideias e verificações gerais. O [CURRENT](../docs/audits/CURRENT.md) reúne ambiente, evidências e pendências do piloto. Quando a autorização estiver indefinida, a Planta confirma o escopo antes de encaminhar a execução.

## Pendências do piloto de Instagram

Em 25/11/2026 o proprietário aceitou e encerrou os tickets 02 a 05 (conexão, publicar agora, programar e várias datas); os testes que ele deixou para depois reabrem o ticket se falharem. Os tickets 06 (relatórios) e 07 (comentários) foram excluídos em 25/11, porque a busca de dados do Instagram saiu. Pendências ativas:

| Entrega                                                                                                                                                                             | Situação e próxima ação                                                                           | Responsável         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------- |
| Reel pela UZZINA ([03](instagram-composio/issues/03-publicar-agora.md))                                                                                                             | Publicar e programar um Reel e conferir a mídia. Carrossel, Stories e post estático já testados.  | Proprietário        |
| Testes adiados ([02](instagram-composio/issues/02-conectar-perfil.md), [04](instagram-composio/issues/04-programar-stories.md), [05](instagram-composio/issues/05-varias-datas.md)) | Reconexão e desconexão; duplicar ação sem copiar programações; várias datas na mesma programação. | Proprietário        |
| Importar arquivos por link ([08](instagram-composio/issues/08-importar-referencia-instagram.md))                                                                                    | Em produção. Falta validar com posts públicos reais: imagem, Reel e carrossel.                    | Proprietário        |
| Importar relatórios ([06](instagram-composio/issues/06-importar-relatorios.md))                                                                                                     | Proposto, sem prioridade.                                                                         | Proprietário decide |

## Propostas para revisão do proprietário

- [Formulários administrativos no padrão de Parceiros](admin-forms/issues/01-align-admin-forms.md) — adequar Novo e Editar em Usuários e Clientes e mapear outras páginas administrativas que se beneficiariam do padrão.
- [Limite e unificação de funções da Vercel](vercel-functions/issues/01-investigar-limite-e-unificacoes.md) — confirmar o limite do plano, contar as funções atuais e recomendar possíveis unificações sem implementação neste estudo.

## Referências fora da fila de execução

- [Planejamento original](social-planning/README.md): nove tickets antigos com registros divergentes; a recuperação T01–T12 foi aceita e arquivada pelo proprietário em 21/11/2026; não há pendência nela. Mantidos para referência, sem declarar os antigos pendentes como resolvidos.
- [Consistência visual](visual-consistency/README.md): onze tickets de série suspensa pelo proprietário. Não executar nem considerar concluídos somente por seus campos completed.

Novos tickets entram na série correspondente. Ao encerrar, manter somente pendências na lista ativa e consolidar finalidade, aceite, commit e limites no histórico.

## Registros anteriores da fila

Em 22/11/2026, HOJE-06 foi aprovado e encerrado pelo proprietário; implementação local, sem publicação, registrada no [histórico](archive/resolved-tickets.md). Os demais ajustes de uso (HOJE-05, CAL-02, GAV-01), o seletor de modelos (IA-M10), design system (DS35 a DS37) e Planejamento (T01–T12, T11 aceito como parecer parcial) foram aprovados; o site publicado foi conferido pelo proprietário. HOJE-04 também foi conferido no app publicado em 22/11.

[Histórico consolidado](archive/resolved-tickets.md): tickets encerrados/aprovados e os 11 registros da antiga série C do Planejamento, substituída pela recuperação. Os antigos arquivos individuais foram retirados e seus links redirecionados.

**Design system fechado em 11/11/2026.** O proprietário aprovou DS05 (ordem do ícone), DS12, DS13, DS15 (cores e superfícies) e DS16 (retirada da cor do parceiro); em 12/11, o DS14 (sombra colorida da paleta) e o DS11 (cor da fase nos cartões), que absorveu o DS10 (foco, Sprint e sombras do cartão). Estão no [histórico](archive/resolved-tickets.md) e foram enviados ao GitHub (`main` igual a `origin/main` em 12/11); o deploy Ready na Vercel não foi conferido. Em 13/11 o DS08 foi encerrado sem implementação; DS17 e DS18 foram implementados e enviados ao GitHub e foram concluídos pelo proprietário em 18/11.

**IA-M02 encerrado.** Abas de Minha Conta publicadas conforme confirmação do proprietário e integradas à main local em 06/11.

Ao criar um ticket ou mudar seu escopo, inclua as três opções da seção `Modelos sugeridos` conforme o [guia de agentes](../AGENTS.md#recomendações-de-agentes-nos-tickets).
