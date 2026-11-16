# INF01 — Estudo: trocar o Supabase pelo Appwrite e trazer os arquivos para dentro

Data: 16/11/2026. Ticket: [INF01](../../.scratch/backend-platform/issues/01-appwrite-migration-study.md). Estudo por leitura do código e pesquisa na web; **nada foi instalado, testado ou alterado**. Preços e limites mudam com frequência: os números abaixo vêm das fontes listadas no fim e precisam ser conferidos nas páginas oficiais antes de qualquer decisão de gasto.

## Resumo em uma página

1. **O limite da Vercel não atinge o envio de arquivos de hoje.** O envio vai direto do navegador para o Cloudinary, sem passar pela Vercel. O limite da Vercel (4,5 MB por requisição) só vale para arquivo que passa por dentro das APIs do app, é fixo e **não aumenta no plano Pro**. Qualquer solução boa, com qualquer fornecedor, envia direto do navegador para o armazenamento.
2. **O limite de tamanho que incomoda é o do plano gratuito do Cloudinary:** 10 MB por imagem, 100 MB por vídeo e 10 MB por outros arquivos.
3. **Arrastar e soltar dentro do app não depende de trocar de fornecedor.** O Cloudinary aceita envio direto por uma chamada simples, com a mesma configuração que o widget já usa. Dá para criar um componente próprio (arrastar, soltar, barra de progresso) e aposentar o widget, sem custo e sem migração.
4. **Trocar o Supabase pelo Appwrite é reescrever o servidor do app.** Login, banco e regras de quem pode ver o quê foram construídos com recursos próprios do Supabase (regras dentro do banco, funções em SQL, gatilhos). O Appwrite funciona de outro jeito e essas peças não são copiadas: são refeitas.
5. **"Self-hosted" significa alugar e cuidar de um servidor.** Não é gratuito: tem o aluguel da máquina e o trabalho de manter (atualizações, backup, segurança, e-mail de recuperação de senha). Hoje esse trabalho é do Supabase.
6. **O Appwrite não substitui tudo o que o Cloudinary faz.** Ele guarda arquivos e redimensiona imagens, mas o app também usa o Cloudinary para recortar avatar, converter HEIC em JPG e transformar áudio/vídeo em MP3 para a leitura por IA.

**Recomendação:** não migrar para o Appwrite. Resolver o incômodo real em duas etapas pequenas: (1) componente próprio de arrastar e soltar enviando direto ao Cloudinary; (2) só se o tamanho dos arquivos virar bloqueio, avaliar um plano pago, comparando Cloudinary pago com o armazenamento do próprio Supabase.

## O que o app usa hoje

| Peça                     | Onde está                                     | O que faz                                                                                                                                                                                                      |
| ------------------------ | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login e senhas da equipe | Supabase Auth                                 | Entrar, recuperar e redefinir senha, criar usuário pelo Admin                                                                                                                                                  |
| Banco de dados           | Supabase (Postgres)                           | 12 tabelas em uso (ações, pessoas, parceiros, contas de cliente, comentários, datas comemorativas, propostas de planejamento, notificações, sessões do portal, links de revisão, leads, feriados por parceiro) |
| Regras de acesso         | Dentro do banco do Supabase                   | Cerca de 48 regras de acesso por linha, 23 funções em SQL e 14 gatilhos nos arquivos versionados; o app chama 7 dessas funções diretamente                                                                     |
| APIs do servidor         | Vercel (10 arquivos em `api/`)                | IA, portal do cliente, revisão pública, contas, estratégias; todas falam com o Supabase                                                                                                                        |
| Arquivos                 | Cloudinary, plano gratuito                    | Imagens e vídeos de conteúdo, arquivos de trabalho, avatares e logotipos                                                                                                                                       |
| Envio de arquivos        | Widget do Cloudinary (`CloudinaryUpload.tsx`) | Abre a janela do Cloudinary; usado na aba Instagram, na aba Essencial, na reordenação de conteúdo, no avatar e no portal do cliente                                                                            |

Pontos que pesam numa troca:

- As regras de acesso do portal `/dash`, da revisão pública, da quota de IA e das preferências (como a função alterada hoje no DS19) vivem dentro do banco do Supabase. É a parte mais delicada do app e nasceu, em boa parte, de bugs reais.
- Os endereços dos arquivos do Cloudinary estão gravados nas ações (`content_files`, `work_files`) e em avatares. Trocar o armazenamento exige copiar os arquivos e reescrever esses endereços.
- A leitura de arquivos por IA só aceita endereços do Cloudinary e pede a ele as conversões (JPG, MP3).

## O que é o Appwrite

É uma plataforma de servidor de código aberto, parecida em proposta com o Supabase: login, banco, armazenamento de arquivos, funções e hospedagem. Pode ser usada de dois jeitos:

- **Appwrite Cloud:** eles hospedam, como o Supabase faz hoje. Tem plano gratuito e planos pagos (as fontes divergem entre US$ 15 e US$ 25 por mês no Pro; conferir). Limite de arquivo citado: 5 GB.
- **Self-hosted:** você instala em um servidor seu. A versão 2.0 (2026) roda com Docker, sobe 16 serviços e usa Postgres por padrão. Mínimo citado: 2 processadores e 4 GB de memória. O limite de tamanho de arquivo passa a ser o do seu servidor.

### Comparação direta

| Assunto                   | Supabase (hoje)                        | Appwrite                                                                                                                                                                                                                                   |
| ------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Banco                     | Postgres com acesso completo por SQL   | Postgres por baixo na versão 2.0, mas o app conversa por uma API própria de tabelas e linhas                                                                                                                                               |
| Quem pode ver o quê       | Regras escritas em SQL dentro do banco | Permissões por tabela e por linha, definidas pela API; lógica mais complexa vai para funções do Appwrite. Existe um produto de Postgres gerenciado com regras em SQL na nuvem deles; não ficou confirmado se o self-hosted oferece o mesmo |
| Funções e gatilhos em SQL | Sim, em uso                            | Sem confirmação de suporte equivalente; o caminho normal é reescrever como funções do Appwrite                                                                                                                                             |
| Login                     | Supabase Auth                          | Appwrite Auth (equivalente em recursos)                                                                                                                                                                                                    |
| Arquivos                  | Storage próprio (não usado hoje)       | Storage próprio, com redimensionamento de imagem; sem conversão de vídeo/áudio                                                                                                                                                             |
| Self-hosted               | Também é possível                      | Sim, é o ponto forte                                                                                                                                                                                                                       |
| Ferramenta de migração    | —                                      | Existe uma, vinda do Supabase: copia usuários, tabelas e arquivos; linhas com ressalvas; funções são manuais                                                                                                                               |

### O que a troca exigiria

1. Montar e manter um servidor (ou contratar o Appwrite Cloud).
2. Recriar as 12 tabelas e copiar os dados.
3. Reescrever todas as regras de acesso, as 23 funções e os 14 gatilhos no modelo do Appwrite, e testar cada caso de autorização de novo.
4. Trocar todas as chamadas do app e das 10 APIs que hoje usam o Supabase.
5. Migrar os usuários; confirmar se as senhas atuais continuam valendo ou se todos precisam redefinir (não confirmado).
6. Copiar os arquivos do Cloudinary, reescrever os endereços gravados nas ações e substituir recorte de avatar, conversão de HEIC e MP3 para IA.
7. Refazer o portal do cliente e a revisão pública sobre a nova base.

É o maior projeto que o app já teria, com risco alto justamente em autorização, e não entrega nada novo para quem usa: o ganho seria só de controle e de armazenamento.

## Os dois incômodos reais e como resolver cada um

### 1. Não dá para arrastar e soltar; o widget demora

Não é uma limitação do Cloudinary, é do widget. O Cloudinary aceita envio direto do navegador com a mesma configuração pública ("upload preset") que o widget já usa. Um componente próprio do app pode:

- aceitar arrastar e soltar e colar da área de transferência, dentro da gaveta;
- mostrar a miniatura e o progresso na hora, sem abrir janela;
- enviar vários arquivos de uma vez e arquivos grandes em partes.

O que se perde do widget: o recorte interativo do avatar (precisaria de um recorte próprio ou continuar com o widget só no avatar) e as fontes extras (câmera, Google Drive etc.), se forem usadas. Custo: zero em assinatura; é um ticket de implementação de tamanho médio.

### 2. Limite de tamanho dos arquivos

| Opção                      | Limite por arquivo                                  | Custo mensal citado                  | Observação                                                                        |
| -------------------------- | --------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------- |
| Cloudinary gratuito (hoje) | 10 MB imagem, 100 MB vídeo, 10 MB outros            | 0                                    | 25 créditos por mês divididos entre espaço, tráfego e transformações              |
| Cloudinary pago            | Maior (conferir no plano)                           | A conferir; é o mais caro da lista   | Mantém tudo como está, inclusive conversões                                       |
| Supabase Storage gratuito  | 50 MB                                               | 0                                    | 1 GB de espaço; sem redimensionamento de imagem                                   |
| Supabase Storage no Pro    | Configurável, envio retomável para arquivos grandes | US$ 25                               | 100 GB incluídos, depois cerca de US$ 0,021 por GB; o mesmo plano melhora o banco |
| Appwrite Cloud             | 5 GB (plano a confirmar)                            | US$ 15 a 25 (fontes divergem)        | Exigiria a migração inteira ou usar o Appwrite só para arquivos                   |
| Appwrite self-hosted       | O do servidor                                       | Aluguel do servidor + sua manutenção | Idem, e o espaço em disco é pago no servidor                                      |
| Vercel Pro                 | Não muda o limite de envio                          | Cobrado por pessoa (conferir)        | Não resolve arquivo grande; serve a outros limites (funções, tráfego, equipe)     |

Um caminho intermediário, se um dia fizer sentido: manter o Cloudinary para o que é exibido e convertido e guardar só os originais pesados em outro armazenamento. Isso cria dois lugares de arquivo e só vale se o volume justificar.

## Recomendação

1. **Não migrar para o Appwrite.** O custo e o risco são de reescrita completa do servidor, e os dois incômodos têm solução bem menor.
2. **Abrir um ticket de implementação do envio próprio** (arrastar e soltar direto ao Cloudinary), se o proprietário aprovar.
3. **Adiar a decisão de plano pago** até existir um caso concreto de arquivo que não cabe. Quando existir, comparar Cloudinary pago com Supabase Pro usando o tamanho e o volume reais.
4. Se o objetivo for **controle** (ter os dados em servidor próprio), a opção de menor reescrita é hospedar o próprio Supabase, que roda o mesmo código de hoje; ainda assim traz o trabalho de manter servidor.

## O que o proprietário precisa responder

1. Qual arquivo já esbarrou no limite: tipo (imagem, vídeo, PDF, áudio) e tamanho aproximado? Isso define se o problema é o Cloudinary gratuito ou outra coisa.
2. Quer abrir o ticket do envio próprio com arrastar e soltar?
3. Existe um teto de gasto mensal para considerar um plano pago no futuro?
4. O interesse em self-hosted é por controle dos dados, por custo ou pelos dois?

## Limites deste estudo

- Nada foi testado: nem instalação do Appwrite, nem envio direto ao Cloudinary, nem a ferramenta de migração.
- Preços do Cloudinary pago, da Vercel Pro e do Appwrite Pro não foram confirmados nas páginas oficiais; as fontes de terceiros divergem.
- Não foi confirmado se o Appwrite self-hosted oferece regras de acesso em SQL, funções e gatilhos como o Supabase, nem se a migração preserva as senhas.
- O uso real de espaço e tráfego no Cloudinary e no Supabase não foi consultado.
- As contagens de regras, funções e gatilhos vêm dos arquivos versionados em `supabase/`, que não garantem o estado exato de produção.

## Fontes

- [Vercel: como contornar o limite de 4,5 MB das funções](https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions)
- [Vercel: erro FUNCTION_PAYLOAD_TOO_LARGE](https://vercel.com/docs/error/application/FUNCTION_PAYLOAD_TOO_LARGE)
- [Cloudinary: comparação de planos](https://cloudinary.com/pricing/compare-plans)
- [Cloudinary: limites de uso](https://cloudinary.com/documentation/developer_onboarding_faq_usage_limits.md)
- [Cloudinary: envio pelo navegador](https://cloudinary.com/documentation/client_side_uploading)
- [Supabase: limites de arquivo](https://supabase.com/docs/guides/storage/uploads/file-limits)
- [Supabase: preços](https://supabase.com/pricing)
- [Supabase: envio retomável](https://supabase.com/blog/storage-v3-resumable-uploads)
- [Appwrite 2.0 self-hosted](https://appwrite.io/blog/post/appwrite-2-self-hosted)
- [Appwrite 2.0: Postgres por padrão](https://appwrite.io/blog/post/appwrite-2-0-postgres-by-default)
- [Appwrite: bancos no self-hosting](https://appwrite.io/docs/advanced/self-hosting/configuration/databases.md)
- [Appwrite: controle de acesso no Postgres gerenciado](https://appwrite.io/docs/products/databases/postgresql/concepts/access-control)
- [Appwrite: migrar do Supabase](https://appwrite.io/docs/advanced/migrations/supabase)
- [Appwrite: plano Pro](https://appwrite.io/docs/advanced/billing/pro.md)
- [Appwrite comparado ao Supabase (página do próprio Appwrite)](https://appwrite.io/alternative-to/supabase)
- [Encore: Appwrite vs Supabase](https://encore.dev/articles/appwrite-vs-supabase)
