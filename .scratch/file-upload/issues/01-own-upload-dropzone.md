# UP01 — Estudar um envio de arquivos próprio, com arrastar e soltar, no lugar do widget do Cloudinary

**Status.** Aberto em 16/11/2026 a pedido do proprietário, como ticket de **estudo**, e deixado **preparado, em espera**: o proprietário decidiu não executá-lo agora. Nasceu do [INF01](../../backend-platform/issues/01-appwrite-migration-study.md), encerrado no mesmo dia. Desenho e decisões registrados abaixo; nada foi testado e nenhum arquivo do app foi alterado. Quando for liberado, a entrega é relatório, prévia e plano; nada é implementado sem aprovação explícita.

## O que a pessoa vê hoje

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

## O que o levantamento já mostra

- **É possível sem o widget.** O Cloudinary aceita envio direto do navegador por uma chamada simples, usando a mesma configuração pública que o widget já usa hoje (nome da conta e "upload preset"). Não passa pela Vercel, então o limite de 4,5 MB dela não entra na história.
- **Os limites de tamanho não mudam.** Continuam os do plano gratuito do Cloudinary (10 MB por imagem, 100 MB por vídeo, 10 MB para outros arquivos). Além disso, o código do widget hoje barra qualquer arquivo acima de 50 MB. O envio próprio deve avisar com clareza quando o arquivo passar do limite, antes de tentar enviar.
- **Arquivos grandes** (acima de 100 MB, só possíveis em plano pago) exigem envio em partes; o estudo deve dizer se isso entra agora ou fica preparado para depois.
- **Barra de progresso** é viável, com a miniatura aparecendo na hora, antes de o envio terminar.
- **A janela de organizar já tem a estrutura.** Ela mostra as miniaturas em grade, já permite arrastar para reordenar e tem o estado "Nenhum arquivo adicionado ainda". Soltar um arquivo vindo do computador é um gesto diferente de arrastar uma miniatura, e os dois podem conviver; o estudo precisa provar isso na prática, inclusive no celular.
- **O que o widget faz e o envio próprio perderia:**
  - **Recorte do avatar:** o quadrado é escolhido dentro da janela do Cloudinary. Sem ela, é preciso um recorte próprio ou manter o widget só no avatar.
  - **Enviar por link e pela câmera:** o widget oferece "endereço da web" e "câmera". No celular, o seletor de arquivo do próprio aparelho já oferece a câmera; o envio por link deixaria de existir, salvo se for refeito.
- **O resultado do envio continua igual.** Cada arquivo enviado devolve o mesmo endereço do Cloudinary que hoje é gravado na ação, então a gaveta, a leitura por IA e o portal não mudam.

Arquivos envolvidos: `app/components/features/media/CloudinaryUpload.tsx` (o widget), `ContentReorderDialog.tsx` (janela de organizar), `InstagramContent.tsx`, `action-drawer/EssentialsTab.tsx`, `app/components/uzzina/UAvatarUpload.tsx` e `app/routes/dash/action/$id.tsx`.

## O que o estudo precisa entregar

1. **Confirmação técnica do envio direto:** quais parâmetros o envio sem assinatura aceita (pasta, tipo automático), como medir o progresso, como cancelar e como tratar erro de tamanho, de rede e de tipo de arquivo. Conferir na documentação oficial do Cloudinary e nas configurações do "upload preset" da conta (só leitura).
2. **Proposta de desenho,** em linguagem simples e com imagem de antes e depois:
   - a janela de organizar com a área de miniaturas recebendo arquivos soltos, o estado vazio virando convite ("Arraste arquivos aqui ou clique para escolher") e o progresso por arquivo;
   - se vale soltar direto na gaveta (na prévia do Instagram e na área de arquivos de trabalho), sem abrir a janela;
   - colar imagem da área de transferência;
   - como fica no celular, onde não existe arrastar do computador.
3. **Um componente só para os cinco lugares,** ou quais ficam com o widget (avatar, portal) na primeira etapa.
4. **Riscos e regras do app a respeitar:** convivência com o arrastar de reordenar; envio em andamento quando a pessoa fecha a janela ou salva a ação (contrato da gaveta em `docs/contracts/action-drawer.md`); foco e teclado (a área de soltar precisa de um botão equivalente, sem virar parada de foco extra); o portal não usa os provedores privados da equipe (`docs/contracts/portal-and-review.md`); regra de superfícies do Prism (sem caixa em volta) e entrada na galeria `/ui`.
5. **Prévia para o proprietário conferir.** Uma página isolada ou um exemplo na `/ui`. Atenção: o app local usa a conta real do Cloudinary; qualquer teste de envio grava arquivo de verdade lá, então a prévia usa uma pasta de teste e o estudo diz como limpar.
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

- [ ] Relatório com a confirmação técnica, os limites e o que se perde do widget.
- [ ] Proposta de desenho com antes e depois, incluindo celular, teclado e erros.
- [ ] Prévia para conferir, com roteiro curto.
- [ ] Plano em etapas e as decisões acima respondidas pelo proprietário.
- [ ] Implementação só em ticket próprio, depois da aprovação.

## Modelos sugeridos

- **Claude Code — Sonnet 5.5.** Leitura dos cinco pontos de uso, conferência da documentação do Cloudinary e prévia do componente; escopo bem delimitado.
- **Codex — GPT-6 Luna.** Alternativa leve para a confirmação técnica do envio direto e o inventário do que cada lugar usa do widget.
- **Claude Code — Opus 5.5.** Se o estudo precisar aprofundar a convivência entre soltar arquivos, reordenar e o salvamento da gaveta, que é a parte com mais risco de comportamento.
