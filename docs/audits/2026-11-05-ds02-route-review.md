# DS02 — Matriz inicial de conferência por rota

05/11/2026. Levantamento estático do checkout com subagente. A matriz cobre 24 destinos e os layouts raiz, equipe e portal, conforme a árvore de rotas. Aceites anteriores valem para o controle indicado. As demais combinações de tema claro/escuro, largura ampla/compacta e estados interativos aguardam evidência renderizada.

| Rotas | Controles e estados a conferir | Fixture ou papel |
| --- | --- | --- |
| `/` | Entrada, links, foco, quebra dos títulos | Público |
| `/login`, `/forgot-password`, `/reset-password` | Labels, senha, validação, erro, carregamento e token expirado | Anônimo, token fictício |
| `/app`, `/app/today`, `/app/partner/$slug` | Cabeçalho/AppBar, calendário, cartões, busca, gaveta e overlays. Marcadores CAL01 aceitos localmente. Editor D aceito | Membro com parceiro ativo, ações e datas fictícias |
| `/app/notifications`, `/app/help` | Sino e lista, vazio e ação indisponível, seletor da Ajuda no celular e foco | Membro, notificações fictícias |
| `/app/leads`, `/app/profile`, `/app/planejamento` | Lista/detalhe, preferências e upload de avatar, uso de IA, seleção de parceiro e estados desabilitados do Planejamento | Equipe, leads e uso fictícios; membro e admin no Perfil |
| `/app/admin/users`, `/app/admin/user/$userId`, `/app/admin/clients`, `/app/admin/client/$userId`, `/app/admin/partners`, `/app/admin/partner/$slug`, `/app/admin/celebrations` | Cartões, formulário e upload, foco, estados vazio/erro e feriados. Identidade do formulário aceita no C | Admin, registros fictícios em edição e criação |
| `/dash`, `/dash/login`, `/dash/action/$id`, `/dash/review/$slug` | Calendário e sessão do portal, revisão por token, contraste com cor do parceiro, erro de acesso. Anexos da ação aceitos | Conta externa, ações fictícias e tokens válidos/inválidos |
| `/ui` | Referência Prism para comparar variantes, foco, escala e densidade | Galeria |

O seletor de cor em lote e a geometria xs/sm do calendário de lote também têm aceite do proprietário.

## Achados para comparação no navegador

- Upload de avatar em Minha Conta e nos cadastros administrativos de pessoa, parceiro e conta externa repete a cobertura `bg-black/40` que aparece por hover. Conferir nome acessível, foco e descoberta por toque antes de propor ajuste compartilhado.
- Minha Conta usa âmbar e rosa diretos nos limiares de 75% e 90% da franquia de IA. Comparar contraste nos dois temas com tokens semânticos antes de sugerir troca.
- Planejamento mantém controles HTML próprios. Conferir no recorte T01–T11. A ação de WhatsApp em Leads usa cor de marca externa e merece registro como exceção se a comparação confirmar adequação.
- Encaminhar a ordem de ícone e texto ao DS05 e a comparação de marcadores ao CAL01.

## Próxima rodada

Usar navegador com fixtures e rede controlada, começando por notificações, Ajuda mobile, calendário do portal e upload de avatar. Registrar antes/depois, comparação Prism e evidência por estado. Nesta rodada não houve capturas, exercício de sessão ou comparação renderizada. Nenhum desvio estático foi tratado como falha visual confirmada.
