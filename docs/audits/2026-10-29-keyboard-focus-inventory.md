# Revisão de foco e teclado — ticket03 — 29/10/2026

## Resultado

Levantamento concluído dentro do escopo de diagnóstico: todas as11 famílias de telas do ticket foram inspecionadas, com navegação de teclado representativa no navegador e conferência dirigida do código. Foram encontrados cinco grupos de problemas reproduzíveis. Nenhuma correção funcional foi aplicada; gaveta e toolbar aprovadas permanecem encerradas.

## Método e cobertura real

- Frontend compilado existente do checkout, servido em porta temporária5182. Scripts e fixtures ficaram somente no diretório temporário do sistema; nenhuma rota, dependência ou ferramenta de teste adicionada ao produto.
- Navegador embutido Chromium, identidade/admin/membro e dados fictícios. Respostas de Auth/REST/APIs simuladas antes do app; fetch não encaminha consultas de dados ao serviço real, WebSocket substituído e CSP bloqueia conexões externas/frames. A revisão não autentica contas reais, envia mensagens, muda senhas, marca notificações reais, altera permissões ou faz uploads.
- Inspeção por árvore de acessibilidade, DOM renderizado, foco após teclas e estilos computados; comparação com componentes reais. Páginas de criação/edição administrativas abertas com fixtures, sem envio. O formulário de redefinição foi inspecionado sem digitar/enviar nova credencial.
- Percursos desktop, mais verificações dirigidas de Minha Conta e Ajuda em390×700/tema escuro. Não significa cobertura integral de todas as telas em todos os temas/viewports. Simulação estreita não certifica teclado virtual, Safari ou aparelho físico. VoiceOver/leitores de tela estão fora do escopo por decisão do proprietário, sem ticket específico para execução.
- Tab/Shift+Tab, Enter/Espaço, setas, Escape, nome dos controles e retorno de foco verificados conforme os cenários abaixo. O que só foi inspecionado no código é indicado; não foi feita auditoria integral de contraste ou certificação WCAG.
- Tab e servidor temporários encerrados; nenhum PNG gerado no checkout.

## Inventário das famílias

| Família | Cobertura realizada | Resultado e limites |
|---|---|---|
| Entrada, recuperação e redefinição | Três páginas renderizadas; Tab na entrada/recuperação, Enter para alternar visibilidade da senha e envio vazio para validação nativa. | Campos e submit alcançáveis. Mostrar senha da equipe não tem nome acessível; redefinição tem o mesmo padrão. Sem envio de e-mail ou alteração de senha. |
| AppBar/menu do perfil | Presença dos controles em páginas da equipe; abrir menu com Enter, mover por seta e fechar com Escape. | Menu recebe foco e devolve ao acionador; ícones da AppBar e link do logo carecem de identificação. |
| Busca global | Ctrl+K, foco inicial, texto com espaços, resultado com seta/Enter, abertura da ação. | Fluxo exercitado funcionou. Não repetida toda a matriz de Shift/duas ações já aprovada; inspeção dos contratos preservados. |
| Home/Hoje/parceiro | Home/Hoje/parceiro renderizados com ação, data e calendário; Tab do link do parceiro para criação, troca de visualização, menu Visualizar com setas/Escape. | Botão de criar nas colunas recebe foco e permanece invisível; menu devolve foco corretamente. Não repetir todos os arrastes/períodos como teste autenticado. |
| Minha Conta | Tab em salvar, região e campos pessoais; identificação dos grupos; seletor móvel por foco/Espaço, Tab entre campos no escuro. | Seção pessoal torna-se acessível; grupos e campos identificados. Sem salvar preferências/foto e sem medir todas as cores. |
| Datas comemorativas | Lista, formulário de criação e modal de edição; anterior → mês → ano → próximo por Tab; abrir mês e dois Escapes em camadas. | Modal preserva diálogo no primeiro Escape, fecha no segundo e retorna ao Editar correto. Criação pela lista tem campo/botão sem nome acessível. Nenhuma escrita/exclusão. |
| Notificações/Ajuda | Tab em leitura/todas/ação da notificação, índice de Ajuda por Enter e seletor móvel escuro. | Controles de Notificações identificados; sem alterar leitura. Âncora/seletor de Ajuda leva foco ao título escolhido. Sem histórico cheio/erro simulado ou teste integral do popover do sino; análise de Safari externa preservada. |
| Leads | Dois registros fictícios, Tab na busca/lista/contato e seleção do segundo por Enter. | Seleção muda detalhe e URL. Busca sem rótulo associado; contato produz duas paradas de Tab para a mesma operação. Sem abrir WhatsApp. |
| Administração | Listas e formulários de criação/edição de pessoas, clientes e parceiros; Tab entre campos; membro comum na lista de usuários. | Formulários básicos rotulados, guarda mostra Acesso Restrito. Contexto/Tom de Voz não identificam os contenteditables. Nenhuma escrita, senha ou permissão alterada; guarda da UI não certifica autorização do banco. |
| Editores/anexos | Toolbar e áreas de texto inspecionadas; abrir Instagram e Gerenciar conteúdo com dois arquivos locais, Tab pelos controles e Escape. | Remover arquivo individual fica fora do Tab; alças focáveis invisíveis. Escape retorna ao acionador. Sensor de teclado existe no código, mas reordenação/salvamento não foram exercitados. Widget externo Cloudinary não foi aberto/certificado. |
| Portal/revisão pública | Entrada, calendário do portal, detalhe de ação e revisão pública com token fictício. Tab na entrada, ação aberta por Enter e avanço do carrossel por Enter. | Portal funciona sem providers da equipe. Campo de observação sem rótulo e setas do calendário sem nome. Revisão pública renderizou conteúdo sem formulário interativo na fixture. Sem validar token/cookie/banco reais ou envio de comentário. |

## Achados e fila proposta

As prioridades são relativas a este levantamento: P2 = impacto funcional/local ou identificação assistiva; P3 = navegação redundante. Não há P0/P1 constatado. Ausência de nome acessível prejudica identificação por tecnologia assistiva; não equivale a afirmar que um usuário visual não consegue clicar no ícone.

### K01 — P2 — criação invisível quando recebe Tab

**Reprodução:** abrir Hoje em Parceiros; focar o link do parceiro e pressionar Tab, sem passar o ponteiro sobre a coluna. O foco chega ao botão de32×32px com `:focus-visible=true` e `opacity:0`. O mesmo padrão de estilo está em Categorias; o botão está disponível no DOM com tabIndex0.

**Esperado:** mostrar o controle e seu indicador quando receber foco, com nome que explique em qual parceiro/categoria criará a ação. Não alterar a política de esconder durante repouso se esse visual for mantido.

**Evidência:** [PartnersBoard](../../app/components/layout/PartnersBoard.tsx), botão na linha90; [CategoriesBoard](../../app/components/layout/CategoriesBoard.tsx), linha79. Estilo só revela por hover da coluna.

**Correção proposta:** estado de foco local/da coluna e nome acessível, sem captura global de teclado. **Regressão:** Tab do link para criação torna o botão visível; Enter abre rascunho contextual, sem INSERT. Conferir Home/Hoje em Parceiros/Categorias e claro/escuro. **Dependências:** nenhuma dos outros achados.

### K02 — P2 — remoção individual indisponível por Tab no gerenciador da UZZINA

**Localização:** janela Gerenciar conteúdo da própria UZZINA, aberta pelo botão de quantidade de arquivos na aba Instagram. O widget Cloudinary é usado para adicionar/upload; sua interface interna não é o objeto deste achado.

**Reprodução:** ação com dois arquivos → Instagram → 2 arquivos → Gerenciar conteúdo; usar Tab. A sequência observada foi alça1, alça2, Adicionar, Limpar, Concluir. Os dois botões individuais de remover têm display:none; só aparecem por group-hover. As alças de ordenação têm opacity0 e não possuem identificação contextual do arquivo.

**Interpretação:** observação da navegação somente por teclado. Ela não comprova defeito no touch nem exige alterar o widget Cloudinary. Com mouse/hover, o controle aparece; com Tab, o botão individual está oculto.

**Esperado, caso a correção seja escolhida:** a pessoa consegue localizar/identificar a alça e remover um arquivo específico por teclado, sem usar Limpar como substituto.

**Evidência:** [ContentReorderDialog](../../app/components/features/media/ContentReorderDialog.tsx), linhas67–85. Há KeyboardSensor no componente; não se propõe trocar a biblioteca.

**Correção proposta:** tornar remoção individual disponível no percurso e alça visível no foco, com nomes por posição/arquivo. Preservar Escape/retorno, limite de arquivos e ordem. **Regressão:** Tab alcança remover de cada item; Enter remove apenas o escolhido; foco tem destino após remoção; reordenação pelo sensor de teclado preserva ordem/identidade. **Dependências:** nenhuma de K01.

### K03 — P2 — comandos de ícone sem nome acessível

**Atualização31/10:** correção autorizada como item2 da priorização, implementada e verificada localmente; incluída no commit local solicitado pelo proprietário após a entrega. [Resultado e regressões](2026-10-31-icon-control-names.md): nomes por ação/estado nos consumidores abaixo;28 testes pertinentes, format/lint/typecheck/build passaram. Sem publicação nesta rodada; aceite com leitor de tela/aparelho não realizado. O levantamento original permanece concluído; K04/K05 não foram implementados.

**Reprodução observada na árvore:** mostrar senha no login/redefinição da equipe aparece como botão sem identificação; AppBar contém seleção/filtro/busca sem nome; Home/Hoje/parceiro têm controles de data sem identificação; portal tem anterior/próximo sem nome. Link do logo também é sem nome. Login do portal e formulários administrativos de senha já possuem Mostrar/Ocultar senha, portanto a correção deve ser localizada aos consumidores faltantes.

**Evidência:** [login](../../app/routes/login.tsx), linha130; [reset](../../app/routes/reset-password.tsx); [AppBar](../../app/components/layout/AppBar.tsx); [Header](../../app/components/layout/Header.tsx), link do logo; [ClientCalendar](../../app/components/client/ClientCalendar.tsx), linhas87/91. Localizar o consumidor de datas atual de Home/Hoje/parceiro antes de corrigir.

**Correção proposta:** nomes curtos em português descrevendo ação e estado; não criar texto visual obrigatório ou mudar o percurso. **Regressão:** nomes expostos no papel correto, alternância de Mostrar/Ocultar, ativação por teclado e ausência de duplicação de controles. **Dependências:** nenhuma. Revisão dirigida, não mudança global do Prism que invente nomes genéricos.

### K04 — P2 — campos sem associação com sua finalidade

**Publicação01/11:** commit `3b4d2a4`, incluído no deploy Ready `dpl_4NiCX2REw75oXxCXEJ5HT1G47mZW`; sem implementação pendente.

**Atualização01/11:** implementado/verificado localmente na sequência autorizada, sem commit/deploy. [Resultado](2026-10-31-field-accessible-names.md): campo de data, observação e editores reais de Contexto/Tom nomeados; busca de Leads já estava correta.30 testes pertinentes e verificações passaram; aceite de aparelho/leitor de tela separado.

**Reprodução:** busca de Leads renderiza input sem label/aria-label; formulário de criação de data pela lista também. Dois editores administrativos de Contexto/Tom têm contenteditable sem id/role/aria-label/aria-labelledby; o label visual aponta a um input oculto, não à área editável. Campo de observação do portal tem apenas placeholder, sem rótulo associado. Nomes/ordem das toolbars não identificam qual editor está sendo editado.

**Evidência:** [Leads](../../app/routes/app/leads.tsx), linha79; [datas](../../app/routes/app/admin/celebrations.tsx), formulário a partir da linha107; [parceiro administrativo](../../app/routes/app/admin/partner/$slug.tsx), Contexto/Tom a partir da linha409; [RichTextEditor](../../app/components/features/RichTextEditor.tsx), atributos do editor; [CommentInput](../../app/components/features/ActionComments/CommentInput.tsx), linha69.

**Correção proposta:** associar o nome ao controle efetivamente editável; nomes distintos para os dois editores. Manter placeholders e aparência existentes quando adequados, sem reabrir o percurso principal da gaveta. **Regressão:** localizar cada campo por papel/nome e acessar texto por teclado; rótulos não focam somente elemento oculto. **Dependências:** nenhuma; verificar consumidores do editor antes de ampliar sua interface.

### K05 — P3 — duas paradas de Tab para o mesmo contato de Lead

**Publicação01/11:** commit `3b4d2a4`, incluído no deploy Ready `dpl_4NiCX2REw75oXxCXEJ5HT1G47mZW`; sem implementação pendente.

**Atualização01/11:** implementado/verificado após09, com link nativo único e variantes existentes. [Resultado](2026-11-01-lead-contact-keyboard.md):2 regressões vermelhas→verdes;12 testes pertinentes passaram, Tab/Enter e destino preservados, sem contato externo. Sem commit/deploy ou novo aceite físico.

**Reprodução:** Tab após o segundo Lead passa primeiro pelo link de WhatsApp e depois por um botão interno, ambos com o mesmo telefone. Não foi aberto/enviado contato.

**Evidência:** [LeadDetail](../../app/components/features/leads/LeadDetail.tsx), linhas77–87: link contém PrismButton.

**Correção proposta:** um único elemento de navegação estilizado como botão, preservando destino/target e nome. **Regressão:** uma parada de Tab, papel de link e destino correto; Enter aciona o mesmo destino. **Dependências:** nenhuma. Prioridade menor que K01/K02.

## O que não é um achado desta revisão

- Não foi reproduzida perda de texto, escrita indevida ou nova falha no percurso principal da gaveta. Não se conclui ausência absoluta dessas falhas em todos os ambientes.
- Relatos do Safari em outro chat sobre viewport/teclado, Leads responsivo, Instagram, notificações e atualização ao reabrir foram preservados no CURRENT; não foram atribuídos a estes achados sem reprodução específica.
- Arraste de ações não foi certificado por teclado. Alteração de data/fase já tem outros controles, portanto a simples presença de arraste por ponteiro não é, sozinha, prova de operação inacessível.
- Falhas/latência de provedor, limites de IA, e-mails, autorização real de portal e upload externo estão fora do ensaio controlado.

## Encerramento e próximos passos

Ticket03 de diagnóstico concluído; as correções acima são propostas independentes para escolha do proprietário. Não foram criados tickets novos automaticamente nem aplicada qualquer correção funcional. Aguardar decisão de qual grupo tratar; K01/K02 têm maior efeito direto no uso visual por teclado. Revisões de nomes/associações vêm depois e K05 pode ser feito junto ao fluxo de Leads quando autorizado.

Referências e diff documental conferidos. Sem testes novos que repitam texto, build novo, SQL, commit, push ou deploy. Ensaios do navegador descritos são a verificação desta auditoria, não uma nova suíte persistida.

## Decisões posteriores do proprietário

K01 reconhecido pelo proprietário; K02 esclarecido como comportamento do gerenciador interno e apenas de teclado. Cloudinary não entra como nova frente de trabalho. Safari segue em outro chat. VoiceOver foi excluído do escopo; não havia ticket separado a remover. A análise de nomes/associações no relatório permanece como evidência do DOM observado, sem exigir teste de leitor de tela ou correção não autorizada.

## Ticket de K02 preparado

Em29/10, o proprietário pediu preparar a correção de controles permanentemente visíveis em Gerenciar conteúdo. [Ticket único](../../.scratch/media-controls/issues/01-always-visible-media-controls.md), independente dos demais achados, com remoção individual, alça/posição, teclado, toque e preservação do fluxo de mídia existente. A direção sempre visível substitui a proposta anterior de revelar apenas por foco/hover. Não inclui widget Cloudinary, VoiceOver ou implementação automática dos demais itens. Nenhuma correção aplicada nesta preparação.
