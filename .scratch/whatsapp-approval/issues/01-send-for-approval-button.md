# WA01 — Trocar o botão "ID" da gaveta por "Enviar para aprovação" no WhatsApp

**Status.** Encerrado pelo proprietário em 16/11/2026, sem implementação: sem a API o envio seria manual, praticamente o que ele já faz, e a API do WhatsApp Business não compensa. O botão "ID" continua no rodapé da gaveta. O estudo abaixo fica como referência.

## O que a pessoa vê hoje

Na **gaveta de ação** (a janela que abre ao clicar em uma ação), no rodapé, à esquerda dos botões Duplicar, Arquivar e Excluir, existe um botão escrito **"ID"**. Ele só aparece para administradores e abre uma janelinha com o código da ação e um botão de copiar. O proprietário colocou esse botão para uma necessidade passageira e não precisa mais dele.

## O que o proprietário pediu

1. **Excluir o botão "ID"** por completo (botão e janelinha).
2. **Colocar no lugar um botão de ícone "Enviar para aprovação"**, que abre o WhatsApp levando **a imagem e o texto** da ação.
3. **Estudar** se isso é possível, qual texto vai (o Conteúdo da aba Instagram, a Legenda, ou só imagem e legenda) e qual o melhor ícone.

## Antes e depois

|                       | Antes                                                       | Depois                                                                                                 |
| --------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Rodapé da gaveta      | Botão "ID" (só admin) + janelinha com o código              | Botão de ícone "Enviar para aprovação" no mesmo lugar                                                  |
| Enviar para o cliente | Baixar a imagem, copiar a legenda e montar a mensagem à mão | Um clique abre o envio com imagem e texto prontos (como exatamente, depende da opção escolhida abaixo) |

## Resultado do estudo: dá para mandar imagem e texto por um link do WhatsApp?

**Só o texto. Um link do WhatsApp não carrega imagem.** O link (`wa.me`) aceita o número de destino e um texto já escrito; não existe parâmetro para anexar arquivo. Por isso o pedido, do jeito que foi descrito (um link que leva os dois), não funciona sozinho. Há quatro caminhos:

| Opção                                                                         | O que acontece ao clicar                                                                                     | Imagem vai?                                                               | Texto vai?                                                                                            | Limites                                                                                                                                                                                 |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Link do WhatsApp só com texto**                                          | Abre o WhatsApp com a mensagem escrita; a pessoa escolhe a conversa e envia                                  | Não como anexo. Pode ir um link para a imagem ou para a página de revisão | Sim                                                                                                   | Funciona em qualquer aparelho. O cliente recebe um link, e não a foto                                                                                                                   |
| **B. Compartilhar do aparelho** (a mesma janela de "Compartilhar" do celular) | Abre a lista de apps; a pessoa toca em WhatsApp, escolhe a conversa ou o grupo e envia                       | Sim, como foto de verdade (inclusive várias, no carrossel)                | Em geral sim, como legenda da foto; em alguns aparelhos o WhatsApp descarta o texto quando há arquivo | Funciona bem no celular. No computador depende do navegador; precisa de teste nos aparelhos do proprietário. Um toque a mais (escolher o WhatsApp)                                      |
| **C. Copiar a imagem + abrir o WhatsApp com o texto**                         | A imagem vai para a área de transferência e o WhatsApp abre com o texto; a pessoa cola a imagem (Ctrl/Cmd+V) | Sim, colando                                                              | Sim                                                                                                   | Bom no computador (WhatsApp Web). Uma imagem por vez; exige o gesto de colar                                                                                                            |
| **D. API oficial do WhatsApp Business**                                       | A UZZINA envia sozinha, sem abrir o WhatsApp                                                                 | Sim                                                                       | Sim                                                                                                   | Exige conta comercial verificada na Meta, número dedicado, modelos de mensagem aprovados e custo por conversa. É o mesmo tipo de dependência da Meta que o proprietário recusou no IG01 |

**Recomendação.** Combinar **B e C**: no aparelho que suporta compartilhar arquivo (celular), usar B; no computador, usar C (copia a imagem e abre o WhatsApp com o texto), e em ambos deixar o texto também copiado como garantia caso o WhatsApp descarte a legenda. A opção D não é recomendada. A opção A sozinha só serve se o proprietário aceitar mandar link em vez de foto.

**O que não foi verificado.** O comportamento real no iPhone, no Android e no navegador do computador do proprietário (principalmente se o texto acompanha a foto e se o computador abre a janela de compartilhar). A execução começa por um teste rápido nesses aparelhos antes de fechar o desenho.

## Outros achados do código

- **Destino da mensagem.** Nem o parceiro nem as contas de cliente têm telefone cadastrado, e um link do WhatsApp **não consegue abrir um grupo**. Então, em qualquer opção, a pessoa escolhe a conversa ou o grupo na hora. Guardar um número por parceiro seria um campo novo no banco e só resolveria conversa individual.
- **De onde vem cada coisa.** Imagens: os arquivos de conteúdo da ação (aba Instagram; pode ser carrossel com várias, e pode haver vídeo, que é pesado para compartilhar). Legenda: o campo "Legenda" da aba Instagram. Conteúdo: o campo "Conteúdo" da mesma aba, que é texto formatado e precisa ser convertido para texto simples (negrito do WhatsApp usa asteriscos).
- **Já existe um envio para revisão.** No menu de ações em lote, "Compartilhar para Revisão" gera um link seguro de revisão pública (vale 7 dias) e copia para a área de transferência. O texto do WhatsApp pode levar esse link para o cliente aprovar e comentar na página, em vez de responder na conversa. Colaborador só gera link de ação em que é responsável.
- **Quem vê o botão.** O "ID" é só de administrador. O novo botão faz sentido para toda a equipe (ou seguindo a regra do link de revisão). Ações sem imagem e sem legenda: botão desabilitado ou escondido.
- **Onde fica.** `app/components/features/action-drawer/ActionFormFooter.tsx` (botão "ID", estado `isIdDialogOpen`, `handleCopyId` e o `PrismDialog` no fim do arquivo). O rodapé só aceita variantes e tamanhos padrão do botão Prism (decisão de 03/11): o novo botão é `size="icon-lg"`, `variant="ghost"`, sem classes próprias, com `aria-label` e dica "Enviar para aprovação". No celular os botões do rodapé ficam na faixa rolável, então o botão também aparece lá.
- **Dados.** O envio só lê a ação; não cria tabela nem muda o banco (a não ser que se decida guardar telefone do parceiro ou registrar o envio).

## Sugestões de ícone

Todos existem na biblioteca de ícones já usada no app (Lucide):

1. **Balão com check (`MessageCircleCheckIcon`).** Recomendado: junta "conversa" e "aprovação" e não se confunde com os vizinhos.
2. **Aviãozinho (`SendIcon`).** Já é o ícone de "Compartilhar para Revisão" no menu em lote; mantém a coerência, mas não diz "aprovação".
3. **Balão com seta de compartilhar (`MessageSquareShareIcon`).** Lê como "mandar por mensagem".
4. **Carimbo (`StampIcon`).** Lê como "aprovação", sem lembrar mensagem.

O logotipo do WhatsApp não existe na Lucide; usar o logo exigiria um ícone desenhado à parte.

## O que fazer

1. Remover o botão "ID", a janelinha e o código que só servia a eles.
2. Testar rapidamente as opções B e C nos aparelhos do proprietário e registrar o que cada um faz com imagem e texto.
3. Implementar o botão "Enviar para aprovação" conforme as decisões, com texto montado pela regra escolhida e aviso claro (toast) do que foi feito ("Imagem copiada, cole no WhatsApp", por exemplo).
4. Se o botão virar um padrão reutilizável, incluir na `/ui`; atualizar `docs/contracts/action-drawer.md` (rodapé da gaveta) e `CURRENT.md`.

## O que o proprietário precisa decidir

1. **Caminho de envio:** B + C (recomendado), só A (link com texto, sem foto anexada) ou outro.
2. **Qual texto vai:** só a Legenda (recomendado, é o que o cliente aprova para publicar), Legenda + Conteúdo, ou escolher na hora em um menu pequeno do botão.
3. **Incluir o link de revisão pública no texto?** Recomendado: sim, para o cliente aprovar e comentar na página.
4. **Ícone:** uma das quatro sugestões.
5. **Quem vê o botão:** toda a equipe (recomendado) ou só administradores, como o "ID".
6. **Carrossel e vídeo:** mandar todas as imagens, só a capa, e o que fazer quando o conteúdo é vídeo.

Para ver antes de aprovar: abrir qualquer ação com imagem, olhar o botão "ID" no rodapé da gaveta e a aba Instagram (Conteúdo, Legenda e imagens).

## Critérios de conclusão

- [ ] Botão "ID" e janelinha removidos.
- [ ] Teste das opções nos aparelhos do proprietário registrado neste ticket.
- [ ] Botão "Enviar para aprovação" no rodapé, com o ícone escolhido, nome acessível e dentro da regra do rodapé.
- [ ] Envio conforme as decisões 1, 2, 3 e 6, com mensagem clara quando algo não puder ir (sem imagem, vídeo, navegador sem suporte).
- [ ] Roteiro curto de validação para o proprietário, no celular e no computador.

## Modelos sugeridos

- **Claude Code — Sonnet 5.5.** Remoção do botão e implementação do envio em um arquivo principal; lida bem com os casos de navegador e com a regra do rodapé.
- **Codex — GPT-6 Luna.** Alternativa leve se a decisão for a opção A (link só com texto) ou para a parte de remover o "ID".
- **Claude Code — Opus 5.5.** Se a decisão incluir a API do WhatsApp Business (opção D), telefone por parceiro no banco ou registro de envios, que envolvem servidor, segredos e migração.
