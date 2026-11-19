# UP01 — Estudar um envio de arquivos próprio, com arrastar e soltar, no lugar do widget do Cloudinary

**Status.** Encerrado em 18/11/2026 por decisão do proprietário após o aceite local. A janela Arquivos de Essencial e Instagram foi enviada à main do GitHub no commit c54a14c7. O build da entrega isolada passou. O status da Vercel para esse commit ficou pronto. Detalhes do estudo e do Console em [relatório técnico](../up01-study-report.md). Veja a [prévia fictícia do estudo](../up01-preview.html) ou a galeria do app em /ui → Componentes Uzzina → Upload de arquivos.

## Como era antes

Para adicionar um arquivo a uma ação, a pessoa clica em um botão e o app abre a **janela do Cloudinary** (o widget). Ela demora para abrir, tem visual próprio, e só depois de escolher o arquivo ali o envio começa. Não dá para arrastar uma imagem da área de trabalho e soltar dentro do app.

Onde isso acontece (cinco lugares, todos pelo mesmo componente):

| Lugar                        | Como abrir                                                                                            | O que envia                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Conteúdo do Instagram        | Abrir uma ação → aba Instagram → botão de adicionar na prévia                                         | Imagens e vídeos do post, vários de uma vez                    |
| Janela de organizar arquivos | Na mesma aba, abrir a janela de reordenar (também usada pelos arquivos de trabalho) → botão de enviar | Conteúdo ou arquivos de trabalho, vários de uma vez            |
| Arquivos de trabalho         | Abrir uma ação → aba Essencial → área de arquivos                                                     | Qualquer tipo de arquivo, vários de uma vez                    |
| Avatar e logotipo            | Minha Conta (foto) e Admin (logotipo do parceiro, foto de pessoa)                                     | Uma imagem, com recorte quadrado feito na janela do Cloudinary |
| Portal do cliente            | `/dash` → abrir uma ação → anexos                                                                     | Arquivos enviados pelo cliente                                 |

## O que o proprietário pediu

Estudar um **envio próprio**, sem a janela do Cloudinary, com arrastar e soltar. Ideia dele: aproveitar a janela de organizar arquivos, que já tem um botão de enviar, e transformar a área de exibição (a área em branco onde ficam as miniaturas) em uma área que **recebe** arquivos soltos.

Fora do escopo, por decisão dele em 16/11: trocar o Supabase, self-hosting e mudar de fornecedor de arquivos. O plano pago do Cloudinary ele avalia depois, por conta própria.

## O que o estudo confirmou

- **É tecnicamente possível sem o widget.** O Cloudinary documenta upload direto do navegador com preset unsigned, sem passar pela Vercel. O cliente usa apenas cloud name e preset públicos; o preset controla as opções não aceitas na chamada unsigned.
- **O preset e os limites da conta foram identificados.** O Console mostra `bussola_unsigned` em modo unsigned, com sobrescrita desativada, uso do nome original, nome único e prefixo da pasta de ativos habilitados. A configuração local de produção aponta para o mesmo preset. O painel da conta confirma 10 MB por imagem, 100 MB por vídeo e 10 MB por raw. O widget aplica 50 MB na seleção local. A proposta inicial usa o menor teto por tipo para preservar a política do app. A aba General confirma que o preset não fixa uma pasta de ativos. O widget informa `uzzina/work` ou `uzzina/content` conforme o contexto. A aba Transform não tem transformações de entrada ou antecipadas configuradas. Advanced mostra envio assíncrono desligado e URL de notificação vazia. Optimize and Deliver mostra os campos de conversão e formatos permitidos vazios. Fonte dos limites da conta: captura de Settings → Account → Usage limits.
- **Arquivos acima de 100 MB** exigem upload em partes segundo a documentação; a conta aceita até 100 MB por vídeo e tem tetos menores para imagem e raw. A primeira etapa não precisa de envio em partes.
- **Barra de progresso e cancelamento da transmissão** são viáveis com XMLHttpRequest. Cancelar a conexão não remove um ativo que o Cloudinary já concluiu.
- **A janela de organizar já tem miniaturas e reordenação.** É plausível separar drop externo do drag interno, mas a prévia estática não prova essa convivência no navegador ou no celular; ela exige validação durante a implementação.
- **O que o widget faz e o envio próprio perderia:**
  - **Recorte do avatar:** o quadrado é escolhido dentro da janela do Cloudinary. Sem ela, é preciso um recorte próprio ou manter o widget só no avatar.
  - **Enviar por link e pela câmera:** o widget oferece "endereço da web" e "câmera". No celular, o seletor de arquivo do próprio aparelho já oferece a câmera; o envio por link deixaria de existir, salvo se for refeito.
- **O resultado do envio continua igual.** Cada arquivo enviado devolve o mesmo endereço do Cloudinary que hoje é gravado na ação, então a gaveta, a leitura por IA e o portal não mudam.

Arquivos envolvidos: `app/components/features/media/CloudinaryUpload.tsx` (o widget), `FileManagerDialog.tsx` (janela Arquivos), `InstagramContent.tsx`, `action-drawer/EssentialsTab.tsx`, `app/components/uzzina/UAvatarUpload.tsx` e `app/routes/dash/action/$id.tsx`.

## O que o estudo precisa entregar

1. **Confirmação técnica do envio direto:** concluída com documentação oficial do Cloudinary e conferência do Console. O preset unsigned existente e o plano Free foram identificados; a captura do painel confirmou os limites da conta. Transformações e formatos conferidos no Console.
2. **Proposta de desenho,** em linguagem simples e com imagem de antes e depois:
   - a janela de organizar com a área de miniaturas recebendo arquivos soltos, o estado vazio virando convite ("Arraste arquivos aqui ou clique para escolher") e o progresso por arquivo;
   - se vale soltar direto na gaveta (na prévia do Instagram e na área de arquivos de trabalho), sem abrir a janela;
   - colar imagem da área de transferência;
   - como fica no celular, onde não existe arrastar do computador.
3. **Um componente só para os cinco lugares,** ou quais ficam com o widget (avatar, portal) na primeira etapa.
4. **Riscos e regras do app a respeitar:** convivência com o arrastar de reordenar; envio em andamento quando a pessoa fecha a janela ou salva a ação (contrato da gaveta em `docs/contracts/action-drawer.md`); foco e teclado (a área de soltar precisa de um botão equivalente, sem virar parada de foco extra); o portal não usa os provedores privados da equipe (`docs/contracts/portal-and-review.md`); regra de superfícies do Prism (sem caixa em volta) e entrada na galeria `/ui`.
5. **Prévia para o proprietário conferir.** Concluída em página isolada com dados fictícios; sem input funcional e sem chamada ao Cloudinary. Não houve upload nem necessidade de limpeza de ativos.
6. **Plano de implementação em etapas,** com o que entra em cada uma e o roteiro de validação.

## Desenho pedido pelo proprietário (16/11/2026)

A ideia é **simplificar**: um envio próprio, um componente só, sem a janela do Cloudinary.

1. **A janela de organizar arquivos vira a janela de envio.** Ela pode mudar de nome (por exemplo "Arquivos" ou "Enviar arquivos") e passa a ser o lugar de enviar e de organizar. A área das miniaturas recebe arquivos soltos nos dois casos:
   - **vazia:** a área inteira é o convite para soltar ou clicar e escolher;
   - **já com arquivos:** soltar em qualquer ponto da área acrescenta os novos ao fim, e as miniaturas continuam podendo ser arrastadas para reordenar. Os dois gestos convivem porque o navegador informa quando o que está sendo arrastado é um arquivo vindo do computador.
2. **Aba Essencial:** não há lugar para soltar ali; o botão que hoje abre o Cloudinary passa a abrir essa janela.
3. **Aba Instagram:** o retângulo da prévia (imagem, capa do vídeo ou carrossel) também recebe arquivos soltos, direto, sem abrir janela. É o mesmo componente de envio por trás.
4. **Enviar por link e pela câmera:** saem.
5. **Avatar com recorte quadrado no envio próprio: é possível, e é o caminho preferido.** O Cloudinary faz o recorte pelo endereço da imagem, a partir de coordenadas; hoje a janela dele só devolve essas coordenadas e o app já monta o endereço recortado. O envio próprio precisa de uma tela para posicionar o quadrado sobre a foto (arrastar e ampliar, com teclado e toque), envia a foto original e grava o endereço com as coordenadas. Com isso a janela do Cloudinary deixa de ser usada em todo o app. Se o estudo mostrar que essa tela é cara demais, a alternativa aceita pelo proprietário é manter a janela do Cloudinary só no avatar.

## Decisões fechadas em 16/11/2026

1. **Nome da janela:** o proprietário deixou a escolha com o executor. Definido: **"Arquivos"** (título da janela e nome do botão que a abre), por servir tanto para enviar quanto para organizar.
2. **Ordem das etapas, aprovada:** primeiro a janela "Arquivos" e a aba Essencial; depois a prévia do Instagram recebendo arquivos soltos; por último o avatar com recorte próprio.
3. **Portal do cliente:** fica para depois, em etapa própria, feita aos poucos; continua com a janela do Cloudinary até lá.

## Critérios de conclusão

- [x] Relatório com confirmação técnica, limites conhecidos/desconhecidos e o que se perde do widget.
- [x] Proposta de fluxo com celular, teclado e erros no relatório; conferir a prévia fictícia. Testes de interação real permanecem para implementação.
- [x] Prévia isolada e roteiro curto.
- [x] Plano em etapas alinhado às decisões anteriores do proprietário.
- [x] Etapa 1 autorizada, aceita e enviada à main do GitHub.

**Ideias para etapas futuras.** Arrastar direto na prévia do post do Instagram, recorte próprio de avatar e troca do widget no portal. Cada etapa depende de escopo e aprovação próprios.

## Modelos sugeridos

- **Claude Code — Sonnet 5.5.** Leitura dos cinco pontos de uso, conferência da documentação do Cloudinary e prévia do componente; escopo bem delimitado.
- **Codex — GPT-6 Luna.** Alternativa leve para a confirmação técnica do envio direto e o inventário do que cada lugar usa do widget.
- **Claude Code — Opus 5.5.** Se o estudo precisar aprofundar a convivência entre soltar arquivos, reordenar e o salvamento da gaveta, que é a parte com mais risco de comportamento.
