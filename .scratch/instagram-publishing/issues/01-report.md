# IG01 — Relatório de viabilidade: publicar e agendar no Instagram pela UZZINA

Data: 08/11/2026. Estudo documental; nenhum código, app na Meta, conta ou publicação foi criado.

## Resumo para decisão

**Recomendação: adiar a integração própria e manter o fluxo manual por enquanto; fazer antes dois passos baratos que decidem tudo** — (1) confirmar se a CNVT consegue passar pela verificação da Meta como "provedor de tecnologia" (é o gargalo, não o código) e (2) medir quanto do volume é foto única, carrossel e Reels.

Motivo: o código em si é viável e encaixa na infraestrutura que já existe. Mas para postar em contas **de clientes**, a Meta exige verificação da empresa e revisão do app, e isso é prazo e risco que não dependem de nós. O custo de R$ 300/mês só compensa se a integração própria evitar esse gasto de forma duradoura **e** o prazo de aprovação for aceitável.

## 1. Instagram Login ou Facebook Login

| | Instagram Login | Facebook Login |
|---|---|---|
| Quem autoriza | O dono do perfil entra com a conta do Instagram | Precisa de Página do Facebook vinculada e usuário com papel nela |
| Contas | Profissionais (Business e Creator, conforme a documentação) | Business ligada a Página |
| Permissão de publicar | `instagram_business_content_publish` | permissões equivalentes `instagram_content_publish` + Página |
| Complexidade | Menor: sem Página no meio | Maior, mas dá acesso a anúncios/insights da Página |

**Para a CNVT, Instagram Login é o caminho natural** (menos peças, o cliente autoriza só o Instagram). Facebook Login só vale se algum dia precisarmos de anúncios ou Páginas.

Acesso a contas de terceiros:
- Em **Acesso Padrão** o app só serve contas com papel no próprio app (nós e testadores). Dá para fazer um piloto assim, com perfis da agência, sem aprovação.
- Para **contas de clientes** é preciso **Acesso Avançado**, que exige **App Review** e **Business Verification** da empresa dona do app. Para apps que atendem várias empresas, a Meta ainda pede a verificação de acesso como provedor de tecnologia (processo separado, relatado em até ~5 dias úteis).
- Relatos de comunidade mostram Business Verification demorando dias e travando o envio da revisão. É anedótico; o prazo real só se sabe tentando.
- A Meta exige também política de privacidade, URL de exclusão de dados e um vídeo demonstrando o uso. Isso depende de a CNVT ter CNPJ/documentos aceitos e de acesso ao painel — **só o proprietário pode confirmar**.

## 2. Formatos que a API aceita

Fatos da documentação oficial (conferir no momento da construção, pois mudam):
- Foto única, carrossel, Reels e Stories passam por "criar contêiner" e depois "publicar". Contêiner expira em 24 h.
- Imagens: só JPEG. A Meta **baixa a mídia de uma URL pública**; os arquivos precisam estar acessíveis por link (o Cloudinary que já usamos serve para isso).
- Limite diário de posts pela API: a Meta cita 100 em 24 h em um lugar e 50 em outro. Para 10 clientes não é um limite real; consulte o endpoint de cota em vez de fixar número.
- Reels não entram em carrossel. Música só como "áudio original". Stories pela API: apenas contas business, e relatos externos indicam que marcações, enquetes e músicas do Stories não são suportadas.
- Colaboração e marcação de pessoas existem para posts de feed, mas não as confirmei para todos os formatos; fica para o piloto.

**Lacuna no nosso produto:** a aba Instagram da gaveta guarda hoje **texto de conteúdo e legenda**, não a arte final por slide. O arquivo final não tem lugar estruturado na ação (o upload via Cloudinary existe, mas não vi vínculo "esta é a mídia que sai"). Publicar exigiria criar esse campo — é trabalho de produto, não só de API. Não consegui medir a mix real de formatos da agência (precisa de consulta ao banco de produção, não feita aqui): as categorias existentes são Post Estático, Reels e Stories.

## 3. Fluxo proposto (publicar agora e agendar)

Componentes, reaproveitando o que existe:
- **Conexão da conta:** botão "Conectar Instagram" por parceiro/cliente; token guardado só no servidor, criptografado, nunca no navegador. Tokens de longa duração (~60 dias) precisam de renovação automática.
- **Fila de publicação:** tabela própria (ação, perfil, mídia, legenda, horário em UTC + fuso exibido, estado). Estados: rascunho, agendado, publicando, publicado, falhou, cancelado.
- **Executor:** o projeto já tem o padrão (pg_cron + chamada assinada ao `api/strategy-worker.ts`, uma tarefa por chamada, lease e recuperação). Uma fila de publicação poderia copiar esse desenho em um segundo executor. O horário passa a ser responsabilidade da UZZINA, com o navegador fechado.
- **Antes do envio:** equipe pode editar ou cancelar; só quem tem permissão no parceiro publica.

Falhas e duplicidade:
- Conta desconectada/token expirado: marcar "precisa reconectar", avisar a equipe, não tentar de novo sozinho.
- Mídia falhou: o contêiner reporta erro; ficar em "falhou" com motivo legível e botão de tentar de novo.
- Resposta da Meta perdida: gravar o ID do contêiner **antes** de chamar "publicar", e ao recuperar consultar o estado do contêiner em vez de criar outro.
- Executor rodando duas vezes: reserva da linha com lease (como já fazem as estratégias) e chave única por ação+perfil+versão da mídia.
- Perfil errado: mostrar @ e foto do perfil na confirmação e travar a conta pela ação; registrar quem confirmou e quando.
- Confirmação: guardar ID e link do post devolvidos pela Meta e mostrar "Publicado" na ação.

## 4. Comparação de caminhos (aprox. 10 clientes)

| | Integração própria | Agendar na ferramenta oficial da Meta | Serviço externo |
|---|---|---|---|
| Custo mensal | ~R$ 0 de infraestrutura nova (Vercel/Supabase/Cloudinary já pagos); manutenção | R$ 0 | Referência do proprietário: ~R$ 300/mês (10 × R$ 30) |
| Trabalho inicial | Alto (estimativa abaixo) | Nenhum | Baixo (conectar contas) |
| Prazo | Semanas de código + aprovação da Meta (imprevisível) | Imediato | Imediato |
| Dentro da UZZINA | Sim, status na ação | Não: o post é recolhido e copiado à mão | Não, salvo integração à parte |
| Risco | Aprovação da Meta, mudanças de API, tokens | Retrabalho manual | Dependência e reajuste |

Observação sobre preços de mercado: as fontes que achei são blogs comparativos, não páginas oficiais. Metricool cobra por marca, Buffer por canal, Later por pacote; **não consegui confirmar um preço para 10 marcas em nenhum**. Os R$ 300/mês do proprietário devem ser usados como a referência, e o total e prazo da oferta ainda precisam ser confirmados.

Conta de custos (a partir da referência de R$ 300/mês):
- 12 meses: R$ 3.600. 24 meses: R$ 7.200. Se há R$ 3 mil antecipados, é fluxo de caixa; o custo anual é o total acima.
- Integração própria: estimativa de **60 a 100 horas** de construção (conexão, fila, executor, campo de mídia, telas, testes) e **3 a 5 horas/mês** de manutenção (renovação de tokens, mudanças de API). É estimativa minha, sem medição.
- Ponto de equilíbrio em meses ≈ (horas iniciais × valor da hora) ÷ (R$ 300 − manutenção mensal em R$). Exemplo ilustrativo com R$ 100/h: 80 h = R$ 8.000; manutenção 4 h = R$ 400/mês, que **já supera** os R$ 300/mês. Ou seja, com hora de dev valorada a R$ 100, a integração própria **não se paga em 24 meses**. Só compensaria se o tempo for tratado como custo baixo/zero, ou se o número de clientes crescer bem acima de 10.
- Premissas que mais pesam: valor da hora, horas de manutenção, número de clientes e se o serviço externo cobra por cliente.
- Horas de operação poupadas: não medidas. Se a equipe gasta, por exemplo, 5 minutos por post e publica 100 posts/mês, são ~8 h/mês — esse é o dado que decide, e hoje não o temos.

## 5. Recomendação e piloto

**Adiar / manter manual**, até haver dois números: horas reais gastas postando e mix de formatos. Se as horas poupadas valerem mais que ~R$ 300/mês, reabrir.

Se o proprietário quiser seguir, o menor piloto (precisa de autorização):
- Um app na Meta em modo desenvolvimento, **Acesso Padrão**, com **um perfil profissional de teste da própria agência**, via Instagram Login.
- **Um formato: foto única JPEG** (a cobertura perdida sem carrossel/Reels deve ser medida antes).
- Critérios verificáveis: (a) publicar agora gera post visível com o ID guardado; (b) agendar para 5 min depois publica sozinho com o navegador fechado; (c) cancelar antes do horário impede o envio; (d) executor chamado duas vezes não duplica; (e) token revogado vira "precisa reconectar" sem tentativa de envio; (f) mídia inválida vira "falhou" com motivo.
- **Antes de atender clientes:** verificação da empresa e revisão do app aprovadas, política de privacidade e exclusão de dados publicadas, renovação de token automática, campo de mídia final na ação, suporte a carrossel e Reels conforme o uso, e decisão sobre o que fazer quando a cota diária for atingida.

## Lacunas

- Documentação da Meta lida só em parte (o portal limitou a consulta); números de cota e regras de Stories conflitam entre páginas. Confirmar no painel.
- Preços de terceiros não confirmados em páginas oficiais.
- Mix real de formatos e horas de operação: não medidos.
- Elegibilidade da CNVT para verificação de empresa e de provedor: depende do proprietário.

## Fontes

- [Meta: Content Publishing](https://developers.facebook.com/docs/instagram-platform/content-publishing/)
- [Meta: IG User Content Publishing Limit](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/content_publishing_limit)
- [Meta: App Review do Instagram](https://developers.facebook.com/documentation/instagram-platform/app-review)
- [Meta: Business Login (Instagram Login)](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/business-login)
- [Meta: verificação de acesso para provedores de tecnologia](https://developers.facebook.com/blog/post/2022/06/02/access-verification-process-for-tech-provider-apps/)
- [Meta: Business Verification exigida para Acesso Avançado](https://developers.facebook.com/blog/post/2023/02/01/developer-platform-requiring-business-verification-for-advanced-access/)
- [Comparação de preços de agendadores (secundária)](https://buffer.com/resources/buffer-vs-metricool/)
