# INF01 — Estudar a troca do Supabase pelo Appwrite e o armazenamento próprio de arquivos

**Status.** Encerrado pelo proprietário em 16/11/2026, sem migração: não há vantagem em trocar o Supabase pelo Appwrite e ele não cobre o que o Cloudinary faz; o plano pago do Cloudinary fica para avaliar depois. O [relatório](../../../docs/audits/2026-11-16-inf01-appwrite-study.md) fica como referência. O envio próprio com arrastar e soltar segue no [UP01](../../file-upload/issues/01-own-upload-dropzone.md).

## O que motivou

O proprietário não quer migrar agora e hoje usa tudo em planos gratuitos. Ele quer saber, para decidir no futuro:

- se valeria trocar o Supabase (login e banco) pelo Appwrite, que pode ser instalado em servidor próprio, para ter mais controle e passar a guardar também os arquivos, hoje no Cloudinary;
- como resolver o **limite de tamanho dos arquivos** enviados e o limite de envio pela Vercel;
- como melhorar o **envio de arquivos**: hoje é preciso abrir o widget do Cloudinary (tempo para abrir e subir), sem poder arrastar e soltar a imagem dentro de um componente do próprio app;
- quanto custaria cada caminho, incluindo um plano Pro da Vercel.

Onde ver hoje: abrir uma ação, aba Instagram, e clicar para adicionar imagem; a janela que abre é o widget do Cloudinary. O mesmo acontece nos arquivos de trabalho (aba Essencial), no avatar (Minha Conta) e no portal do cliente.

## O que o estudo respondeu até aqui

1. O envio de hoje vai direto do navegador ao Cloudinary; o limite da Vercel (4,5 MB) não o atinge e **não aumenta no plano Pro**.
2. O limite de tamanho sentido é o do Cloudinary gratuito: 10 MB por imagem, 100 MB por vídeo, 10 MB por outros arquivos.
3. Arrastar e soltar dentro do app é possível **sem trocar de fornecedor**, com um componente próprio enviando direto ao Cloudinary.
4. Trocar o Supabase pelo Appwrite é reescrever o servidor: cerca de 48 regras de acesso, 23 funções e 14 gatilhos do banco, 12 tabelas e 10 APIs, além do portal e da revisão pública.
5. Self-hosted tem custo de servidor e de manutenção; e o Appwrite não cobre as conversões que o app pede ao Cloudinary (recorte de avatar, HEIC para JPG, MP3 para a leitura por IA).

**Recomendação do estudo:** não migrar para o Appwrite; resolver o envio com um componente próprio e adiar plano pago até existir um caso concreto de arquivo que não cabe. Detalhes, tabela de custos, fontes e limites no [relatório](../../../docs/audits/2026-11-16-inf01-appwrite-study.md).

## O que o proprietário precisa responder

1. Qual arquivo já esbarrou no limite: tipo e tamanho aproximado?
2. Quer abrir o ticket do envio próprio com arrastar e soltar (direto ao Cloudinary)?
3. Existe um teto de gasto mensal para considerar um plano pago?
4. O interesse em self-hosted é por controle dos dados, por custo ou pelos dois?

## Se o estudo continuar (segunda rodada, só com aprovação)

- Conferir nas páginas oficiais os preços de Cloudinary pago, Vercel Pro, Supabase Pro e Appwrite, e montar a conta com o uso real de espaço e tráfego (consultar os painéis do Cloudinary e do Supabase, só leitura).
- Confirmar no Appwrite self-hosted: regras de acesso em SQL, funções, gatilhos e se a migração preserva senhas.
- Prova de conceito isolada, fora do app, do envio direto ao Cloudinary com arrastar e soltar e arquivo grande em partes.

## Critérios de conclusão

- [x] Relatório em linguagem simples com o que o app usa hoje, o que a troca exigiria, opções e custos citados, recomendação e limites.
- [x] Respostas do proprietário em 16/11: o limite da Vercel vinha de um envio próprio antigo, já abandonado; o limite sentido é o do Cloudinary gratuito; self-hosting e migração não seguem.
- [x] Decisão registrada: encerrar e abrir o UP01.

## Modelos sugeridos

- **Claude Code — Sonnet 5.5.** Segunda rodada de pesquisa e conta de custos com números oficiais; leitura e síntese, sem risco de código.
- **Codex — GPT-6 Luna.** Alternativa leve para levantar preços e uso real nos painéis e montar a tabela comparativa.
- **Claude Code — Opus 5.5.** Só se o proprietário pedir o plano detalhado de uma migração (regras de acesso, portal, dados), que exige raciocínio de arquitetura e de autorização.
