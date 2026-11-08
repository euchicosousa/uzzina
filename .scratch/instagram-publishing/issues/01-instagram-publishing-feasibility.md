# IG01 — Estudar publicação e agendamento de posts do Instagram pela UZZINA

**Entrega.** Relatório de viabilidade com estimativa de implantação e manutenção, comparação de custos e proposta do menor piloto que permita decidir se vale conectar as contas dos clientes à API oficial da Meta.

**Status.** Encerrado em 08/11 por decisão do proprietário: não seguir com a integração e continuar agendando pelo Meta Business Suite. Motivo: a aprovação do app pela Meta (verificação da empresa e revisão) é prazo e dependência externa que ele não quer assumir. Relatório: [01-report.md](01-report.md). Um piloto, cadastro de app na Meta, conexão de contas ou publicação real exige autorização específica.

**Dependências.** Nenhum ticket bloqueia o estudo documental. A viabilidade para clientes depende de confirmar as permissões e o processo de aprovação da Meta para o acesso que a CNVT tem às contas.

## O que a equipe veria

Hoje, a equipe abre uma ação na UZZINA e prepara o post em **Gaveta da ação → Instagram → Conteúdo e Legenda**. A hipótese é reaproveitar mídia e legenda nessa mesma ação, confirmar qual perfil profissional vai receber o post e escolher **Publicar agora** ou **Agendar**. O estudo deve mostrar como a equipe saberia se publicou, se ainda está aguardando ou se precisa agir após uma falha. A data de execução da ação continua sendo um dado de planejamento. A publicação teria data e hora confirmadas para o perfil escolhido.

## Verificação inicial

- A coleção oficial da Meta documenta acesso a contas profissionais e publicação em duas etapas, preparando a mídia e depois chamando a operação de publicação. Pelo fluxo documentado, o horário futuro teria de ficar sob responsabilidade da UZZINA, que chamaria a API quando o post estivesse pronto para sair. Há um precedente no projeto de um processo de servidor acionado periodicamente para as estratégias. O estudo deve avaliar o que é reaproveitável para uma fila separada de publicação. [Instagram Login na coleção oficial da Meta](https://www.postman.com/meta/instagram/folder/1z5vxzu/instagram-api-with-instagram-login) · [Exemplo oficial de publicação de Reel](https://www.postman.com/meta/instagram/request/gabnx7r/publish-reel).
- A referência informada pelo proprietário é de cerca de 10 clientes a R$ 30 por cliente/mês, ou R$ 300/mês. Em 12 meses cheios, a conta dá R$ 3.600. O desembolso relatado é da ordem de R$ 3 mil antecipados. O estudo deve confirmar prazo e total da oferta para separar fluxo de caixa de custo anual.
- Algumas páginas do portal Meta for Developers limitaram a consulta. Os exemplos oficiais no Postman sustentam a leitura inicial. Aprovação, exigências para as contas da CNVT e custos seguem para confirmação no estudo.

## Aceite do estudo

- [ ] Comparar **Instagram Login** e **Facebook Login** para a CNVT. Verificar contas Business e Creator, vínculo com Página, quem pode autorizar em nome do cliente, permissões mínimas, diferença entre conta de teste e conta de cliente, acesso avançado, App Review e eventual verificação empresarial. Listar o que a Meta exige para cadastro, políticas e exclusão de dados e o que depende de acesso ao painel ou confirmação do proprietário.
- [ ] Cruzar formatos realmente usados pela agência com o que a API aceita. Começar pela foto única como hipótese de piloto e medir a cobertura que se perde sem carrossel e Reel. Mapear Stories, música, marcações e colaboração conforme uso, além de formatos de arquivo, limites de publicação e como a Meta buscaria as mídias da UZZINA.
- [ ] Desenhar o fluxo de publicar agora e agendar com o navegador fechado, incluindo conta selecionada, horário e fuso, edição ou cancelamento antes do envio, permissões da equipe e proteção de credenciais. Explicar o que acontece se a conta for desconectada, a mídia falhar, a resposta da Meta se perder ou o processo rodar duas vezes. Propor como registrar a confirmação e impedir envio ao perfil errado ou duplicado.
- [ ] Comparar integração própria, agendamento manual na ferramenta oficial da Meta e contratação de um serviço externo para aproximadamente 10 clientes. Estimar separadamente o trabalho inicial, o tempo de aprovação, o custo marginal de infraestrutura, a manutenção mensal e as horas de operação poupadas. Mostrar custos acumulados e desembolso em 12 e 24 meses, ponto de equilíbrio e premissas que mais afetam a conta.
- [ ] Entregar recomendação de seguir, adiar ou manter o fluxo manual, com as evidências e lacunas. Se a integração compensar, propor um piloto com um perfil profissional de teste e um formato, critérios verificáveis de publicação imediata, agendamento e recuperação de falhas, e o que ainda seria necessário antes de atender clientes.

## Modelos sugeridos

- **Codex · GPT-6.1 Sol** — cruzar a documentação da Meta com o fluxo de conteúdo e os mecanismos de servidor existentes.
- **Codex · GPT-6.1 Terra** — avaliar o encaixe da fila de publicação no código e os riscos de duplicidade, perda de confirmação e recuperação.
- **Codex · GPT-6 Astra** — consolidar requisitos de aprovação e cenários de custo quando houver incertezas sobre elegibilidade ou manutenção.
