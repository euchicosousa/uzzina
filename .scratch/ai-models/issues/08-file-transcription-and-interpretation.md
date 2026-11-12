# IA-M08 — Ler arquivos de trabalho com IA (transcrição e interpretação)

Aberto em 12/11/2026 e fechado no mesmo dia com todas as decisões do proprietário (desenho final, v4 da simulação). **Pronto para execução; só implementar com ordem explícita do proprietário.** Nada de código, banco ou configuração foi alterado até agora.

[Simulação da tela (HTML estático)](../prototype/file-transcription.html) · [Pesquisa de modelos, custos e OpenRouter](../../../docs/audits/2026-11-12-ia-m08-file-reading-model-research.md)

## Modelos sugeridos

- **Claude Code (Anthropic):** Claude Sonnet 5.5, para a mudança coordenada entre o diálogo de arquivos, a API de IA, o contrato de entrada e a franquia, lendo os contratos da gaveta e de IA antes de editar.
- **Codex (OpenAI):** GPT-6.1 Terra, para a parte de servidor (novos comandos na API, catálogo, registro de uso) com conferência do `bun run test:serverless`.
- **Antigravity (Google):** Gemini 3.8 Flash, para a parte de tela (modo de seleção, botões de leitura e inserção na descrição), de menor risco; confirmar disponibilidade no plano.

**Bloqueado por.** Nada. Usa só as chaves que a UZZINA já tem. Decisão do proprietário em 12/11/2026: tudo com a OpenAI (inclusive áudio, GPT Transcribe pela chave atual); o estudo do OpenRouter (IA-M09) foi encerrado sem adoção.

## O problema, em linguagem simples

Hoje, quando alguém sobe arquivos de trabalho numa ação (prints de um carrossel de referência, um áudio do cliente, um PDF de briefing), o texto que está dentro deles precisa ser digitado à mão na descrição. O proprietário quer selecionar um ou vários arquivos e pedir duas coisas **separadas**:

- **Transcrição:** só o texto literal, sem resumir nem corrigir. Em imagem é o que está escrito na arte; em PDF, o texto do documento; em áudio e vídeo (fase 2), o que foi falado.
- **Interpretação:** vai além do texto. Olha o conteúdo inteiro e diz do que se trata, qual a mensagem e o que está sendo dito.

Às vezes só a transcrição, às vezes só a interpretação, às vezes as duas. O resultado vai para a **descrição** da ação.

## Onde isso aparece

Gaveta da ação → aba **Essencial** → linha de anexos → botão **"N arquivos"**, que abre o diálogo **"Gerenciar arquivos"** (hoje serve para reordenar e remover). A descrição é o editor logo abaixo, na mesma aba.

## Como funciona hoje (o que foi analisado)

- O diálogo mostra miniaturas com alça de arrastar, número de ordem e X de remover; rodapé com Adicionar, Limpar e Concluir. Não existe seleção. É o mesmo componente (`ContentReorderDialog`) usado em "Gerenciar conteúdo" da aba Instagram, onde a ordem é o post.
- Os arquivos ficam no Cloudinary e a ação guarda só a lista de endereços (até 100). O servidor pode entregar o endereço direto ao modelo.
- A IA atual (estratégia, conteúdo, legenda) só recebe texto, passa pela API de IA do servidor com validação, franquia mensal e registro de custo por modelo. Nenhum comando recebe imagem, áudio ou PDF.
- Os comandos de IA atuais aceitam descrição de até 10.000 caracteres: uma transcrição longa inserida na descrição pode travar "gerar estratégia/legenda" naquela ação (ver Cuidados).

## O que entregar

### 1. Tela: o "Gerenciar arquivos" com seleção (não existe botão "Ler com IA")

Conforme a simulação v3:

1. **Sem nada selecionado**, o diálogo é o de hoje: Adicionar, Concluir, contagem de arquivos. Só a miniatura muda.
2. **Miniatura limpa.** Saem o número, o X de remover e o botão "Limpar". Ficam a **alça de arrastar** (esquerda) e a **caixa de seleção** (direita), sem fundo, no estilo de ícone sobre imagem (seção 5). Os números continuam no "Gerenciar conteúdo" do Instagram.
3. **Computador:** alça e caixa aparecem ao passar o mouse ou ao chegar pelo teclado. Depois do primeiro arquivo marcado, todas as caixas ficam visíveis e clicar em qualquer ponto da miniatura marca ou desmarca.
4. **Celular:** alça sempre visível. Segurar a miniatura (meio segundo) liga a seleção; há também o botão "Selecionar" no rodapé, porque segurar não é óbvio nem funciona por teclado.
5. **Com arquivos marcados**, o topo mostra a contagem, "Selecionar todos" e "Cancelar" (o cancelar já existente). O rodapé troca para:
   - **Esquerda: Excluir.** Remove os selecionados da lista da ação e mostra "N arquivos removidos · Desfazer". Sem pergunta de confirmação; o arquivo no Cloudinary não é apagado.
   - **Direita: três controles lado a lado.**
     - **Botão Transcrição** e **botão Interpretação** (texto, variante padrão): cada um faz a sua leitura ao ser clicado. Dá para clicar nos dois e ficam os dois resultados; clicar de novo refaz.
     - **Toggle Leitura cuidadosa** (o único toggle; só ícone de lupa, nome acessível "Leitura cuidadosa", dica "a interpretação usa um modelo mais forte; mais lenta e um pouco mais cara"): liga e desliga, vale **somente para a interpretação** e não muda a transcrição.
6. **Clicar em Transcrição ou Interpretação já faz a leitura**, sem outro passo. Transcrição lê um arquivo por vez (cada miniatura mostra "na fila", "lendo…" ou "pronto"); Interpretação lê o conjunto de uma vez. Falha em um arquivo não derruba os outros e oferece "Tentar de novo" só nele.
7. **Os resultados são temporários e aparecem no próprio diálogo**, abaixo das miniaturas, um bloco por leitura. Cada bloco mostra o modelo usado e tem **Copiar**, **Inserir na descrição** (o que o proprietário quiser guardar vai para a descrição) e **Descartar**.
8. **Mudar a seleção, excluir ou cancelar descarta os resultados.** Ligar ou desligar a Leitura cuidadosa com uma interpretação na tela refaz só a interpretação com o modelo correspondente. Durante a leitura a seleção fica travada.
9. Arquivos sem suporte (PSD, ZIP…) podem ser selecionados para excluir; na leitura são ignorados com aviso ("1 não será lido").

Usar `PrismButton` (variante padrão) para Transcrição e Interpretação e `PrismToggle` com `icon-sm` para a Leitura cuidadosa. Componente composto novo: verificar foco e teclado à parte.

### 2. Dois comandos de IA separados

Transcrição e interpretação são **dois comandos distintos**, com instrução, saída e cobrança próprias.

|           | Transcrição                                                                                                   | Interpretação                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Entrada   | Um arquivo por chamada                                                                                        | O conjunto selecionado, na ordem da grade, numa única chamada                                          |
| Instrução | Só trazer o texto, literal. Proibido resumir, corrigir ou completar; trecho ilegível é marcado, não inventado | Ler tudo e dizer do que se trata, a mensagem e o que está sendo dito; estrutura e tom quando relevante |
| Saída     | Texto por arquivo                                                                                             | Texto único do conjunto                                                                                |
| Modelo    | **GPT-6 Luna, sempre**                                                                                        | **GPT-6 Luna; GPT-6.1 Terra com a Leitura cuidadosa ligada**                                           |

- Clicando nos dois botões são duas chamadas independentes (a interpretação reenvia as imagens); custo continua em centavos.
- Conteúdo do arquivo é **dado, não ordem**: texto dentro da imagem que pareça instrução para a IA é transcrito, nunca obedecido.

### 3. Modelos (decisão do proprietário em 12/11)

- **Transcrição: GPT-6 Luna**, porque transcrever é só trazer o texto. Não há opção de modelo mais forte.
- **Interpretação: GPT-6 Luna por padrão; GPT-6.1 Terra quando a Leitura cuidadosa está ligada.**
- Sem escolha automática por tipo de arquivo nem tentativa e escalada. Sem conta nova: usa a chave da OpenAI que já existe.
- O servidor decide o modelo por um parâmetro simples (`careful`, verdadeiro ou falso, aceito só no comando de interpretação); o navegador não envia identificador de modelo. O par Luna/Terra fica em um ponto do catálogo, para trocar por uma linha.
- **Verificar com chamada real antes de dar por pronto:** que Luna e Terra aceitam imagem por endereço do Cloudinary; como o PDF entra (o servidor usa a API de Chat Completions, que pode aceitar PDF só embutido: se for o caso, o servidor baixa o arquivo do Cloudinary e embute, limitado a endereços do Cloudinary da UZZINA presentes na ação); HEIC (o Cloudinary entrega JPG por parâmetro de formato); número real de tokens por imagem, que só foi estimado.
- Ponto de atenção: a qualidade do Luna na **interpretação** não foi comparada. O teste de aceite compara Luna e Terra nela. Se o Luna ficar fraco, mudar o padrão da interpretação para Terra é uma linha no catálogo.
- Custo de referência, carrossel de 10 slides, só transcrição: Luna cerca de R$ 0,02; a interpretação com Terra, cerca de R$ 0,19 (estimativas; ver a pesquisa).

### 4. O que vai para a descrição

Nada vai automaticamente. Cada resultado só entra na descrição quando o proprietário clica em **Inserir na descrição** no bloco dele, **no fim** do texto existente, com título ("Transcrição" ou "Interpretação"). Transcrição entra por arquivo ("Arquivo 1 · slide-01.png" e o texto), na ordem da grade.

- A inserção é feita pelo **editor aberto na gaveta**, como se a pessoa colasse o texto, e não por gravação direta do servidor no banco. Assim valem as proteções da gaveta e nada digitado se perde.
- Depois de inserido, o botão do bloco fica "Inserida ✓" até o resultado mudar.

### 5. Ícones sobre imagem (classe de design system)

Os controles sobre a miniatura são **brancos com sombra que acompanha o desenho do ícone, sem fundo** (filtro `drop-shadow`, e não `shadow-*`). A cor invertida foi testada e descartada. A regra já está no AGENTS e em `docs/contracts/prism-details.md`; esta entrega cria a classe e a aplica ao "Gerenciar arquivos" e ao "Gerenciar conteúdo" (mesmo componente, um só visual). Verificar legibilidade sobre imagem branca, preta, cinza médio e foto.

### 6. Por tipo de arquivo e fases

| Tipo                          | Transcrição                                     | Interpretação                               | Fase              |
| ----------------------------- | ----------------------------------------------- | ------------------------------------------- | ----------------- |
| Imagem (JPG, PNG, WEBP, HEIC) | Texto escrito na arte, em ordem de leitura      | Mensagem, estrutura, tom, elementos visuais | **1**             |
| PDF                           | Texto do documento, por página                  | Pontos principais                           | **1**             |
| Áudio (MP3, M4A, WAV, OGG)    | Fala, com parágrafos                            | Sobre a fala transcrita                     | 2                 |
| Vídeo (MP4, MOV)              | Fala (trilha de áudio extraída pelo Cloudinary) | Sobre a fala transcrita                     | 2                 |
| Vídeo: texto na tela e cenas  | Fora de escopo                                  | Fora de escopo                              | só se fizer falta |
| Outros (DOCX, PSD, ZIP…)      | Não suportado: aviso                            |                                             |                   |

- **Fase 1** (esta entrega): imagem e PDF, com os botões de leitura, os dois comandos e a inserção.
- **Fase 2** (depois do aceite da fase 1): áudio e fala de vídeo com o `gpt-transcribe` da OpenAI (mesma chave; cobrança por minuto, não por token, o que exige caminho próprio no registro de uso). O botão Transcrição passa a aceitar áudio e vídeo (modelo de transcrição de áudio, que não é o Luna); a interpretação de áudio usa a transcrição como entrada e segue o Luna, ou o Terra com a Leitura cuidadosa.

## Passos de implementação (fase 1: imagem e PDF)

Ordem sugerida; cada passo pode virar uma entrega pequena. Ler antes: [action-drawer](../../../docs/contracts/action-drawer.md), [ai-and-strategies](../../../docs/contracts/ai-and-strategies.md) e [prism-details](../../../docs/contracts/prism-details.md).

1. **Verificação com chamada real (sem mudar o app).** Em script local, com um carrossel e um PDF de teste: Luna e Terra leem imagem por endereço do Cloudinary? Como o PDF entra? HEIC? Quantos tokens por imagem? Resultado vira nota no ticket e decide o formato do passo 3.
2. **Classe de ícone sobre imagem.** Criar a classe (ícone branco, sem fundo, `drop-shadow`) em `app/tailwind.css`, documentar em `docs/contracts/prism-details.md` e conferir sobre imagem branca, preta, cinza médio e foto.
3. **Servidor: contrato e catálogo.** Em `app/lib/ai-contract.ts`, dois novos comandos (transcrição e interpretação) com entrada validada: identificador da ação e posições da lista de arquivos, mais `careful` só na interpretação. Em `server/ai-model-catalog.ts`, Luna e Terra passam a aceitar os dois comandos e `aiOutputLimits` ganha limites próprios. Sem mudança de banco prevista.
4. **Servidor: API.** Em `api/ai.ts`, tratar os dois comandos: conferir a permissão do usuário sobre a ação, buscar os endereços na própria ação (nunca aceitar endereço vindo do navegador), reservar a franquia antes (o Terra envia `p_model`, o Luna não), montar as mensagens com imagens/PDF, chamar `generateAI` em `server/ai-generation.ts`, registrar o uso pelo modelo que respondeu. Duração máxima da função na Vercel e limite de arquivos por leitura.
5. **Cliente de IA.** Em `app/services/ai-client.ts`, duas funções (transcrever um arquivo; interpretar um conjunto) com erro por arquivo.
6. **Tela: miniatura e seleção.** Em `app/components/features/media/ContentReorderDialog.tsx`: remover número, X e "Limpar"; seleção por caixa; alça sem fundo; computador (hover) e celular (segurar + "Selecionar"); Excluir com Desfazer; rodapé alterna entre o modo normal e o de seleção. Vale para os dois usos do componente (arquivos de trabalho e conteúdo do Instagram, que mantém os números e não ganha leitura).
7. **Tela: botões de leitura e resultados.** No mesmo diálogo, os botões Transcrição e Interpretação, o toggle da lupa, a leitura ao clicar, os blocos de resultado temporários (modelo, Copiar, Inserir na descrição) e as regras de descarte. O diálogo recebe do `EssentialsTab.tsx` uma função de inserir na descrição que usa o editor aberto.
8. **Inserção na descrição.** Ligar a função ao editor Tiptap da gaveta (`EssentialsTab.tsx`), no fim do texto, respeitando as proteções da gaveta; tratar o limite de 10.000 caracteres.
9. **Galeria `/ui` e documentação.** Registrar o componente composto novo se for reutilizável; atualizar AGENTS, `docs/contracts/ai-and-strategies.md`, CURRENT e este ticket.
10. **Conferência.** `tsc`, lint e testes focados nos arquivos alterados (catálogo e contrato de IA, diálogo de arquivos); `bun run test:serverless` antes de qualquer push (arquivos de `api/` e `server/` mudam); build ao publicar. Depois, o roteiro de aceite abaixo, feito pelo proprietário.

**Fase 2 (áudio e vídeo), depois do aceite da fase 1:** transcrição de áudio com `gpt-transcribe` (cobrança por minuto, caminho próprio no registro de uso), trilha de áudio do vídeo extraída pelo Cloudinary, limites de duração e tamanho, e o botão Transcrição passa a aceitar esses tipos.

## Decisões do proprietário

Fechadas em 12/11:

- Interpretação = do que se trata, a mensagem, o que está sendo dito; vai além do texto.
- Dois comandos separados.
- **Sem botão "Ler com IA".** Selecionou, aparece Excluir à esquerda e, à direita, os botões Transcrição e Interpretação e o toggle da Leitura cuidadosa.
- Transcrição e Interpretação são **botões** (cada um faz sua leitura; os dois resultados podem coexistir). O **único toggle** é a Leitura cuidadosa, só ícone de lupa.
- Clicar no botão já lê. Resultados temporários no diálogo, com Inserir na descrição por resultado.
- Transcrição sempre no Luna. **Leitura cuidadosa (Terra) só na interpretação.**
- Sem regra por tipo de arquivo; sem conta nova; OpenRouter descartado (IA-M09 encerrado).
- Sem números nas miniaturas; caixa de seleção no lugar do X; ícones brancos com sombra, sem fundo.
- Cancelar é o que já existe no topo.

Assumidas pela proposta, ainda sem resposta explícita (contestar na conferência):

- Interpretação única do conjunto, e não uma por arquivo.
- Fase 1 só imagem e PDF; áudio e vídeo na fase 2.
- Alça e caixa escondidas até passar o mouse no computador.
- Excluir sem pergunta, com "Desfazer".
- O "Gerenciar conteúdo" do Instagram ganha a miniatura limpa, mas mantém os números e não recebe a leitura com IA.
- Mudar a seleção descarta os resultados.

## Cuidados

- **Limite de 10.000 caracteres da descrição nos comandos de IA.** O bloco de resultado mostra o tamanho antes de inserir. Decidir na implementação entre avisar e permitir, ou elevar o limite no contrato; não pode a transcrição travar "gerar legenda" sem explicação.
- **Gaveta:** inserir pelo editor ativo; respeitar "salvar só no formulário ativo" e "versão remota nunca sobrescreve edição local". Ler [action-drawer](../../../docs/contracts/action-drawer.md) antes.
- **O servidor decide o que pode ser lido:** a API recebe o identificador da ação e as posições da lista de arquivos, confere a permissão do usuário sobre a ação e busca os endereços nela. Nunca buscar um endereço arbitrário vindo do navegador.
- **Franquia e custo:** dois novos comandos no contrato e no catálogo (`app/lib/ai-contract.ts`, `server/ai-model-catalog.ts`; Luna aceita os dois e o Terra só a interpretação), com reserva de franquia antes da chamada como os demais, limite de saída próprio e registro pelo modelo que respondeu. Ler [ai-and-strategies](../../../docs/contracts/ai-and-strategies.md) antes. O modelo padrão do app segue sendo o Luna, o que mantém o envio de `p_model` só para o Terra.
- **Tempo e tamanho:** uma chamada por arquivo na transcrição (progresso e nova tentativa por arquivo) e uma para a interpretação do conjunto. Como clicar no botão já dispara a leitura, o servidor limita quantos arquivos entram por vez. Definir duração máxima da função na Vercel para esses comandos e limite de arquivos por leitura, com mensagem clara.
- **Segurar no celular** não pode disputar com o arrastar: o arrastar continua só pela alça.
- **Checkbox React Aria:** cliques virtuais do painel de automação não o marcam; validar por teclado.
- Mexe em `api/`, `server/` e `app/lib/ai-contract.ts`: rodar `bun run test:serverless` antes de qualquer push (esperado: 9 PASS).
- Se aparecer tabela ou coluna nova (não previsto), atualizar AGENTS e os KIs.

## Fora do escopo

- Leitura com IA no "Gerenciar conteúdo" do Instagram.
- Portal `/dash` e revisão pública.
- Tradução, legendas com marcação de tempo, identificação de quem fala.
- Guardar a transcrição em campo próprio no banco (usa só a descrição).
- OpenRouter ou qualquer troca de provedor dos comandos existentes.
- Escolha de modelo por tarefa em Minha Conta (pode ser ticket futuro).

## Aceite (como o proprietário confere)

1. Em uma ação com um carrossel de 8 a 10 imagens nos arquivos de trabalho: "N arquivos" → passar o mouse e marcar uma miniatura → "Selecionar todos". Conferir que apareceram **Excluir** à esquerda e, à direita, os botões Transcrição e Interpretação e a lupa, e que não existe "Ler com IA".
2. Clicar só em **Transcrição**: o texto de cada slide vem completo, na ordem, sem resumo, em um bloco no diálogo.
3. Clicar também em **Interpretação**: segundo bloco que fala do conteúdo todo (assunto, mensagem, o que diz), e não repete o texto. Ligar a **Leitura cuidadosa** (lupa): só a interpretação é refeita, e o bloco passa a indicar o Terra; a transcrição não muda.
4. Comparar a interpretação com e sem Leitura cuidadosa nos mesmos slides, para decidir se o Luna basta.
5. **Inserir na descrição** num bloco: entra no fim, com título, sem apagar nada; fica salvo depois de fechar e reabrir a gaveta. Mudar a seleção: os blocos somem.
6. Excluir e Desfazer; arrastar para reordenar pela alça; repetir no celular segurando a miniatura. Incluir um arquivo sem suporte e ver o aviso; forçar uma falha e ver "Tentar de novo" só nele.
7. Ícones: alça e caixa legíveis sobre imagem branca, preta, cinza médio e foto.
8. Em Minha Conta, o uso de IA registra as leituras (modelo e custo).
9. O "Gerenciar conteúdo" do Instagram continua com os números e funciona como antes.
10. Fase 2: um áudio de WhatsApp e um vídeo curto.

**Teste lado a lado antes de fixar:** Luna × Terra na interpretação de 3 carrosséis reais escolhidos pelo proprietário, comparando qualidade da leitura e custo medido. Na transcrição, conferir só fidelidade do texto no Luna.

## Onde está

**Fase 1 (imagem e PDF) implementada em 12/11/2026 no checkout local, sem commit nem push.** **Fase 2 (áudio e vídeo) implementada em 12/11/2026 no checkout local, ainda sem teste real:** a Transcrição e a Interpretação aceitam MP3, M4A, WAV, OGG, AAC, OPUS, MP4, MOV, M4V e WEBM enviados ao Cloudinary; o servidor pede ao Cloudinary um MP3 de 64 kbps (a trilha de áudio, se for vídeo), recusa mais de 20 minutos (pelo tamanho, 10,5 MB) e transcreve com `gpt-transcribe`; na Interpretação a fala transcrita entra junto com as imagens (o vídeo em si não é visto). O custo por segundo (US$ 0,0045/min, preço de terceiros) vai para o registro de uso sem migration; a reserva da franquia assume o máximo (20 min). `maxDuration` de `api/ai.ts` subiu para 180 s. Instagram fica sem leitura por IA (decisão do proprietário). A Fase 1 foi aceita pelo proprietário e commitada (`1c1bfdd`). Nenhuma chamada real à OpenAI foi feita, nenhum banco alterado (sem migration) e nada foi aberto no navegador.

Arquivos: `app/components/features/media/ContentReorderDialog.tsx` (seleção, Excluir/Desfazer, rodapé, long-press), `app/components/features/media/FileReadPanel.tsx` (novo: estado da leitura, blocos de resultado, aviso de 10.000 caracteres), `app/components/features/action-drawer/EssentialsTab.tsx` (inserção no fim da descrição pelo editor), `app/components/features/RichTextEditor.tsx` (prop `editorRef`), `app/lib/ai-contract.ts` (`fileReadInputSchema`, `fileReadResultSchema`), `server/ai-model-catalog.ts` (intents, `aiOutputLimits`, `fileReadModels`), `server/file-read.ts` (novo: validação Cloudinary, HEIC, PDF embutido, prompts), `api/ai.ts`, `app/services/ai-client.ts` (`readWorkFiles`), `app/tailwind.css` (`image-icon`), `vercel.json` (`maxDuration` 120 s para `api/ai.ts`), `scripts/check-serverless-runtime.cjs` (inclui `server/file-read.ts`), `/ui` (réplica `image-icon` em `TokensFocusSection.tsx`), `tests/drawer-component.test.tsx` (teste de remoção do Instagram adaptado à seleção + Excluir), contratos e CURRENT.

Verificado: `tsc`, lint dos arquivos alterados, `bun run test:serverless` (9 PASS), `tests/ai.test.ts`, `tests/ai-client.test.ts`, `tests/ai-models-catalog-alignment.test.ts`, `tests/rich-text-editor-keyboard.test.tsx`.

**Não verificado:** a tela no navegador (hover, caixas, long-press no celular, foco por teclado, Desfazer, legibilidade de `image-icon`), qualquer chamada real, o roteiro de aceite 1 a 10.

Decisões onde havia ambiguidade: texto de resultado entra na descrição como `<h2>` + `<h3>` por arquivo (o Tiptap só aceita títulos 1 a 3); passar de 10.000 caracteres só avisa (não bloqueia); "Selecionar" no rodapé só aparece em ponteiro grosseiro (toque); o servidor confere a ação com a sessão do usuário (RLS) e rejeita lista alterada (409) por comparação do final do endereço; reserva de franquia soma estimativa fixa por arquivo; máximo de 12 arquivos por leitura; sem limite de dimensão de imagem (não pedido).

Pendências reais e o que depende da chamada real: (1) Luna e Terra aceitam imagem por endereço do Cloudinary? (2) PDF embutido em base64 funciona na Chat Completions (campo `file`)? (3) HEIC via extensão `.jpg` no Cloudinary; (4) tokens reais por imagem e se `ai-transcribe` 8192 e `ai-interpret` 4096 bastam com o raciocínio do Luna (resposta vazia por `length` vira erro 502); (5) comparar Luna x Terra na interpretação; (6) as estimativas da reserva; (7) confirmar que `CLOUDINARY_CLOUD_NAME` ou `VITE_CLOUDINARY_CLOUD_NAME` e a chave pública do Supabase existem no ambiente da Vercel; (8) conferir no navegador o roteiro de aceite; (9) fase 2.
