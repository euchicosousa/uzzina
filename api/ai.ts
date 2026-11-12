import {
  aiInputSchema,
  aiResultSchema,
  fileReadInputSchema,
  fileReadResultSchema,
  stripCaptionSection,
} from "../app/lib/ai-contract.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { generateAI, type AIGeneration } from "../server/ai-generation.js";
import { generateStrategies } from "../server/strategy-generation.js";
import type { Database } from "../types/database";
import { recordAIUsage } from "../server/ai-usage.js";
import { randomUUID } from "node:crypto";
import {
  aiOutputLimits,
  defaultAIModelId,
  fileReadModels,
  findAIModel,
} from "../server/ai-model-catalog.js";
import {
  buildInterpretMessages,
  buildTranscribeMessages,
  classifyWorkFile,
  FileReadError,
  IMAGE_RESERVATION_BYTES,
  isSpeechFile,
  PDF_RESERVATION_BYTES,
  SPEECH_RESERVATION_BYTES,
  TRANSCRIBE_MODEL,
  transcribeSpeech,
  type WorkFile,
} from "../server/file-read.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  let failureStatus = 503;
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Método não permitido." });
    }
    const header = req.headers.authorization;
    const token =
      typeof header === "string"
        ? /^Bearer ([^\s]+)$/i.exec(header)?.[1]
        : undefined;
    if (!token)
      return res
        .status(401)
        .json({ error: "Sessão inválida ou expirada. Entre novamente." });

    const localCompatibility =
      process.env.NODE_ENV === "development" &&
      process.env.UZZINA_LOCAL_AI_COMPAT === "true" &&
      !process.env.VERCEL;

    const apiKey = process.env.OPENAI_API_KEY;
    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const publicKey =
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const configuredLimit = process.env.AI_DAILY_LIMIT ?? "100";
    const limit = Number(configuredLimit);

    if (!apiKey || !supabaseUrl) {
      return res.status(503).json({
        code: "AI_CONFIGURATION_MISSING",
        error: "A IA não está configurada neste ambiente.",
      });
    }

    if (localCompatibility) {
      if (!publicKey) {
        return res.status(503).json({
          code: "AI_CONFIGURATION_MISSING",
          error: "A IA não está configurada neste ambiente.",
        });
      }
    } else {
      if (
        !serviceKey ||
        !/^\d+$/.test(configuredLimit) ||
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 10000
      ) {
        return res.status(503).json({
          code: "AI_CONFIGURATION_MISSING",
          error: "A IA não está configurada neste ambiente.",
        });
      }
    }

    let body: unknown;
    try {
      const serialized =
        typeof req.body === "string"
          ? req.body
          : JSON.stringify(req.body ?? {});
      const contentLength = Number(req.headers["content-length"] || 0);
      if (
        contentLength > 65536 ||
        Buffer.byteLength(serialized, "utf8") > 65536
      ) {
        return res.status(413).json({ error: "A solicitação excede 64 KB." });
      }
      body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    } catch {
      return res.status(400).json({ error: "JSON inválido." });
    }
    // File reading has its own contract: the browser names an action and file
    // positions, never addresses or a model id.
    const fileParsed = fileReadInputSchema.safeParse(body);
    const textParsed = fileParsed.success
      ? undefined
      : aiInputSchema.safeParse(body);
    const fileInput = fileParsed.success ? fileParsed.data : undefined;
    const textInput = textParsed?.success ? textParsed.data : undefined;
    if (!fileInput && !textInput)
      return res.status(400).json({
        error: "Dados de IA inválidos. Confira os campos e seus limites.",
      });
    const requestIntent = fileInput ? fileInput.intent : textInput?.intent;
    if (!requestIntent)
      return res.status(400).json({ error: "Intent inválido." });
    // Resolve provider and model before any quota is reserved. An unknown or
    // unvalidated model never falls back silently to another one.
    const model = fileInput
      ? fileInput.intent === "ai-interpret" && fileInput.careful
        ? fileReadModels.interpretCareful
        : fileInput.intent === "ai-interpret"
          ? fileReadModels.interpret
          : fileReadModels.transcribe
      : (textInput?.model ?? defaultAIModelId);
    const modelEntry = findAIModel(model);
    if (!modelEntry?.intents.includes(requestIntent))
      return res.status(400).json({
        code: "AI_MODEL_UNAVAILABLE",
        error: "O modelo escolhido não está disponível para este comando.",
      });
    if (modelEntry.provider === "anthropic" && !process.env.ANTHROPIC_API_KEY)
      return res.status(503).json({
        code: "AI_CONFIGURATION_MISSING",
        error: "O modelo escolhido não está configurado neste ambiente.",
      });

    const clientKey = localCompatibility
      ? (publicKey as string)
      : (serviceKey as string);
    const clientOptions: {
      auth: { persistSession: boolean; autoRefreshToken: boolean };
      global?: { headers: { Authorization: string } };
    } = {
      auth: { persistSession: false, autoRefreshToken: false },
    };
    if (localCompatibility) {
      clientOptions.global = {
        headers: { Authorization: `Bearer ${token}` },
      };
    }

    const supabase = createClient<Database>(
      supabaseUrl,
      clientKey,
      clientOptions,
    );
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError || !user)
      return res
        .status(401)
        .json({ error: "Sessão inválida ou expirada. Entre novamente." });
    const { data: person, error: personError } = await supabase
      .from("people")
      .select("user_id, visible")
      .eq("user_id", user.id)
      .single();
    if (personError && personError.code !== "PGRST116")
      return res.status(503).json({
        error: "Não foi possível verificar seu acesso à IA. Tente novamente.",
      });
    if (person?.visible !== true)
      return res.status(403).json({
        error: "Seu acesso à IA está desativado. Fale com o administrador.",
      });

    // File reading: the user's own session (row-level security) decides whether
    // the action is visible, and the addresses come from the action itself.
    let readableFiles: WorkFile[] = [];
    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.VITE_CLOUDINARY_CLOUD_NAME ||
      "";
    if (fileInput) {
      if (!cloudName)
        return res.status(503).json({
          code: "AI_CONFIGURATION_MISSING",
          error: "A leitura de arquivos não está configurada neste ambiente.",
        });
      const reader = localCompatibility
        ? supabase
        : publicKey
          ? createClient<Database>(supabaseUrl, publicKey, {
              auth: { persistSession: false, autoRefreshToken: false },
              global: { headers: { Authorization: `Bearer ${token}` } },
            })
          : undefined;
      if (!reader)
        return res.status(503).json({
          code: "AI_CONFIGURATION_MISSING",
          error: "A IA não está configurada neste ambiente.",
        });
      const { data: action, error: actionError } = await reader
        .from("actions")
        .select("work_files")
        .eq("id", fileInput.action_id)
        .maybeSingle();
      if (actionError)
        return res.status(503).json({
          error: "Não foi possível verificar a ação. Tente novamente.",
        });
      if (!action)
        return res.status(404).json({
          code: "AI_ACTION_UNAVAILABLE",
          error: "Ação não encontrada ou sem acesso.",
        });
      const stored = action.work_files ?? [];
      const changed = fileInput.positions.some((position, index) => {
        const value = stored[position];
        return (
          value === undefined ||
          !value.endsWith(fileInput.checks[index] ?? "\0")
        );
      });
      if (changed)
        return res.status(409).json({
          code: "AI_FILES_CHANGED",
          error:
            "A lista de arquivos mudou. Feche e reabra o diálogo e tente de novo.",
        });
      const classified = fileInput.positions.map((position) =>
        classifyWorkFile(position, stored[position] ?? "", cloudName),
      );
      readableFiles = classified.filter(
        (file): file is WorkFile => file !== undefined,
      );
      if (readableFiles.length === 0)
        return res.status(422).json({
          code: "AI_FILES_UNSUPPORTED",
          error:
            "Nenhum dos arquivos selecionados pode ser lido (imagem, PDF, áudio ou vídeo).",
        });
    }

    if (!localCompatibility) {
      const { data: allowed, error: usageError } = await supabase.rpc(
        "consume_ai_usage",
        { p_user_id: user.id, p_limit: limit },
      );
      if (usageError || typeof allowed !== "boolean")
        return res.status(503).json({
          code: "AI_QUOTA_UNAVAILABLE",
          error: "Não foi possível verificar o limite de IA.",
        });
      if (!allowed) {
        const now = new Date();
        const reset = Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + 1,
        );
        res.setHeader(
          "Retry-After",
          String(Math.max(1, Math.ceil((reset - now.getTime()) / 1000))),
        );
        return res.status(429).json({
          error:
            "Seu limite diário de IA foi atingido. Tente novamente após a renovação às 00h UTC.",
        });
      }
    }
    const reservationId = randomUUID();
    if (!localCompatibility) {
      const bodyBytes = Buffer.byteLength(JSON.stringify(body), "utf8");
      if (bodyBytes > 65536)
        return res.status(413).json({ error: "A solicitação excede 64 KB." });
      // Images and PDFs are priced by token, not by body size: add a stand-in.
      const fileBytes = readableFiles.reduce(
        (total, file) =>
          total +
          (isSpeechFile(file)
            ? SPEECH_RESERVATION_BYTES
            : file.kind === "pdf"
              ? PDF_RESERVATION_BYTES
              : IMAGE_RESERVATION_BYTES),
        0,
      );
      const inputBytes = Math.min(65536, bodyBytes + fileBytes);
      const { data: allowed, error: reservationError } = await supabase.rpc(
        "reserve_ai_monthly",
        {
          p_user_id: user.id,
          p_id: reservationId,
          p_input_bytes: inputBytes,
          p_output_limit: aiOutputLimits[requestIntent],
          // The default model keeps the original call shape, so an API deploy
          // does not depend on the model-aware reservation migration.
          ...(model === defaultAIModelId ? {} : { p_model: model }),
        },
      );
      if (reservationError || typeof allowed !== "boolean")
        return res.status(503).json({
          code: "AI_QUOTA_UNAVAILABLE",
          error: "Não foi possível verificar a franquia mensal de IA.",
        });
      if (!allowed)
        return res.status(429).json({
          code: "AI_MONTHLY_ALLOWANCE_EXCEEDED",
          error: "Sua franquia mensal de IA não tem saldo para esta geração.",
        });
    }
    failureStatus = 502;
    const logUsage = async (
      response: AIGeneration,
      intentName: string,
      usageModel = model,
      extraCostNanos = 0,
    ) => {
      // Development compatibility has no service role and must not write measurements.
      if (localCompatibility) return;
      await recordAIUsage(
        supabase,
        { userId: user.id, intent: intentName, reservationId },
        response.usage,
        usageModel,
        response,
        extraCostNanos,
      );
    };

    if (fileInput) {
      // Speech (audio, or the sound of a video) goes to speech-to-text first.
      const speechFiles = readableFiles.filter(isSpeechFile);
      const speech = await Promise.all(
        speechFiles.map((file) => transcribeSpeech(file, cloudName)),
      );
      const speechCost = speech.reduce((sum, item) => sum + item.costNanos, 0);
      if (fileInput.intent === "ai-transcribe" && speechFiles.length === 1) {
        await logUsage(
          { text: speech[0].text, usage: undefined, model: TRANSCRIBE_MODEL },
          fileInput.intent,
          TRANSCRIBE_MODEL,
          speechCost,
        );
        return res.status(200).json(
          fileReadResultSchema.parse({
            intent: fileInput.intent,
            output: { text: speech[0].text },
            model: TRANSCRIBE_MODEL,
          }),
        );
      }
      const messages =
        fileInput.intent === "ai-transcribe"
          ? await buildTranscribeMessages(readableFiles[0], cloudName)
          : await buildInterpretMessages(
              readableFiles,
              cloudName,
              new Map(
                speechFiles.map((file, index) => [
                  file.position,
                  speech[index].text,
                ]),
              ),
            );
      const response = await generateAI(messages, {
        intent: fileInput.intent,
        model,
        timeout: 110000,
      });
      await logUsage(response, fileInput.intent, model, speechCost);
      return res.status(200).json(
        fileReadResultSchema.parse({
          intent: fileInput.intent,
          output: { text: response.text },
          model,
        }),
      );
    }
    if (!textInput) return res.status(400).json({ error: "Intent inválido." });
    const {
      intent,
      title,
      description,
      partner_name,
      partner_context,
      category,
      racional,
      headline,
      direcionamento,
    } = textInput;
    const publisherIdentity = `A marca que publica este conteúdo é ${JSON.stringify(partner_name)}. Escreva na voz dessa marca, como autora da publicação. A agência operadora não é a autora por padrão. Preserve menções legítimas a outras marcas quando solicitadas nos insumos; não substitua nem apague essas menções.`;

    // Vamos mapear os intents conforme definidos no app/lib/CONSTANTS.ts e no ai.ts original
    if (intent === "ai-strategy") {
      const strategies = await generateStrategies(
        textInput,
        async (response) => {
          await logUsage(response, intent);
        },
      );
      return res.status(200).json({ intent, output: { strategies } });
    }
    if (intent === "ai-content") {
      const systemPrompt = `Você é o Redator-Chefe e Especialista de Conteúdo da marca informada.
${publisherIdentity}
Sua missão é gerar a resposta exclusivamente em HTML limpo e básico.

REGRAS DE FORMATAÇÃO:
- Retorne APENAS o HTML (sem JSON, sem blocos de código markdown \`\`\`html, sem tags <html>, <head>, <body>).
- Use apenas tags limpas como: <h4>, <h5>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <br>.

ESCOPO: SOMENTE O CONTEÚDO
- Entregue apenas o conteúdo da peça (por exemplo, frase na arte e direção visual, slides, roteiro ou Stories).
- Nunca escreva a legenda do Instagram, nem uma seção, título ou rascunho chamado "Legenda". A legenda é gerada depois, em outro comando, a partir do conteúdo revisado. Mesmo que o briefing mencione a legenda, ignore esse pedido aqui.

CONTEXTO DA MARCA E TOM DE VOZ:
${partner_context}

DIREÇÃO EDITORIAL:
- Execute o pedido e a estratégia selecionada: preserve a headline, a tese, o público, o racional e o direcionamento recebidos. Não troque a ideia central durante a redação.
- Quando não houver estratégia selecionada, defina internamente uma tese coerente com o briefing. Use apenas o contexto fornecido; não alegue ter consultado arquivos ou fontes ausentes.
- Escolha a construção que serve à tese: reconhecimento, contraste, bastidor, consequência, ferramenta, demonstração, posição, vitrine, afeto ou história, conforme os insumos. A estrutura por formato é uma orientação de execução, subordinada ao pedido e à estratégia.
- Use Dor → Problema → Processo → Solução quando a tese depender desse diagnóstico. Dor é o que a pessoa sente; problema é o que causa isso. Não invente uma dor para encaixar vitrine, comemoração ou demonstração nessa arquitetura, nem exija suspense quando mostrar o resultado primeiro for mais adequado.
- Preserve a conversão indicada. OFF: não acrescente oferta ou chamada de venda. ASSISTIDA: use somente a ponte e o destino previstos. DIRETA: apresente a oferta fornecida. Sem indicação no pedido ou na estratégia, use OFF; a existência de produto no contexto não basta para acrescentar venda.

ABERTURA E ENTREGA:
- A abertura deve fazer a pessoa certa parar por um motivo específico. Respeite a headline selecionada e traduza-a para o formato; se não houver headline, crie uma coerente com a tese.
- Em vídeo, fala, texto de tela e primeira imagem devem se complementar. Em carrossel ou estático, a relação entre frase e visual deve carregar a ideia sem repetição desnecessária.
- O corpo deve cumprir a promessa da abertura. Não force uma virada, uma história ou uma sequência de problema quando a ideia pede demonstração, desejo ou utilidade direta.

REALIDADE E VOZ:
- Escreva em português brasileiro, na voz da marca, com detalhes concretos e linguagem natural. Evite fórmulas com lacunas, frases genéricas, jargão de marketing e intensidade sem informação.
- Não invente números, estudos, casos, depoimentos, cenas pessoais, hábitos do público, atributos do produto ou condições comerciais. Não apresente hipóteses como fatos nem afirme atualidade sem evidência fornecida.
- Respeite as restrições informadas. Se faltar um fato indispensável, sinalize a informação a confirmar de forma breve em uma nota de produção, sem colocá-la como afirmação publicável.
- Mostrar o que a marca oferece não autoriza orientar um comportamento de consumo que não está no pedido.
- Valide internamente clareza, fidelidade à estratégia, sustentação da promessa, especificidade e conversão. Retorne apenas a peça, sem o diagnóstico ou a checagem.
`;
      let content = "";
      switch (category) {
        case "post":
          content = `Crie um post estático de acordo com o briefing e a estratégia selecionada.
Use uma ideia central e pouco texto na arte. Apresente a frase principal e uma direção visual concreta; imagem e frase devem se completar. Se a imagem carregar a abertura, o texto apenas ancora o sentido.
Escolha contraste, reconhecimento, desejo, demonstração, utilidade ou posicionamento conforme a tese. O impacto deve vir da clareza e da especificidade, sem obrigar uma fórmula de oposição ou uma narrativa de problema.`;
          break;
        case "carousel":
          content = `Crie um carrossel de acordo com o briefing e a estratégia selecionada.
Identifique cada slide e sua função. A capa deve apresentar a headline e a direção visual, com texto legível em miniatura e uma promessa que o restante cumpre.
Organize os slides seguintes pela dependência lógica da tese: cada um deve acrescentar uma cena, evidência, critério, demonstração ou descoberta. Use a quantidade de slides pedida; sem quantidade definida, use somente os necessários para entregar a ideia.
O fechamento consolida a entrega e segue a conversão indicada. Evite repetição e texto excessivo. Não imponha uma sequência fixa de dor, problema e solução a uma peça que pede outra construção.`;
          break;
        case "reels":
          content = `Crie um roteiro de Reels de acordo com o briefing e a estratégia selecionada.
Na abertura, indique fala inicial, texto de tela e primeira imagem ou ação. Os três devem se complementar, sem repetir a mesma informação; quando a estratégia pedir uma abertura visual, a cena pode carregar a atenção sem fala.
Desenvolva uma sequência filmável que entregue a tese com falas naturais, frases curtas e indicações visuais objetivas. Respeite a duração informada; sem duração, mantenha apenas as cenas necessárias.
Escolha a progressão pela ideia: uma demonstração pode abrir pelo resultado, um bastidor pela decisão, uma vitrine pelo detalhe sensorial. Use reconhecimento e virada apenas quando sustentados pelo briefing.
Finalize com a entrega e o próximo passo coerentes com a conversão indicada. Não retenha artificialmente a resposta nem peça atenção em vez de conquistá-la.`;
          break;
        case "stories":
          content = `Crie uma sequência de Stories de acordo com o briefing e a estratégia selecionada.
Identifique cada Story, com texto ou fala e direção visual. O primeiro deve abrir uma situação, pergunta, imagem, demonstração ou oferta coerente com a tese.
Cada Story deve fazer a ideia avançar, em linguagem conversacional e com pouco texto por tela. Respeite a quantidade pedida; sem quantidade, use somente a necessária.
Use enquete, pergunta ou outra interação apenas quando contribuir para a ideia e puder ser executada com os insumos disponíveis. Não transforme a sequência em um carrossel vertical nem imponha sete etapas a todo assunto.
O último Story cumpre a entrega e segue a conversão indicada, sem chamada de venda quando estiver OFF.`;
          break;
      }
      const userPrompt = `${content}

DADOS DA AÇÃO E ESTRATÉGIA:
TÍTULO: ${title}
${headline ? `HEADLINE SELECIONADA: ${headline}` : ""}
${racional ? `RACIONAL ESTRATÉGICO: ${racional}` : ""}
${direcionamento ? `DIRECIONAMENTO PRÁTICO: ${direcionamento}` : ""}
BRIEFING/INSTRUÇÕES: ${description}

Gere o conteúdo completo formatado exclusivamente no HTML simples solicitado.`;
      const response = await generateAI(
        [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        { intent, model },
      );
      await logUsage(response, intent);
      const generatedHtml = stripCaptionSection(response.text);
      return res
        .status(200)
        .json(
          aiResultSchema.parse({ output: { content: generatedHtml }, intent }),
        );
    }
    if (intent === "ai-caption") {
      const response = await generateAI(
        [
          {
            role: "system",
            content: `Você escreve legendas para a marca informada. ${publisherIdentity} Preserve o pedido, a tese, a abertura e a direção do conteúdo fornecido, na voz da marca e em português brasileiro natural. A primeira linha deve dar um motivo específico para continuar; o restante desenvolve a ideia sem repetir mecanicamente o conteúdo. Não invente fatos, dados, depoimentos, hábitos do público ou condições comerciais. Respeite a conversão indicada: OFF sem oferta; ASSISTIDA com a ponte prevista; DIRETA com a oferta fornecida. Sem indicação de venda, não acrescente chamada comercial. Retorne somente JSON com a propriedade 'caption', contendo o texto final não vazio da legenda, sem diagnóstico nem comentários externos.`,
          },
          {
            role: "user",
            content: `CONTEXTO DA MARCA:\n${partner_context}\n\nTÍTULO:\n${title}\n\nDIREÇÃO:\n${description}\n\nGere a Legenda em JSON contendo a propriedade "caption".`,
          },
        ],
        { intent, json: true, model },
      );
      await logUsage(response, intent);
      const output: unknown = JSON.parse(response.text || "{}");
      return res.status(200).json(aiResultSchema.parse({ output, intent }));
    }
    return res.status(400).json({
      error: "Intent inválido ou não suportado.",
    });
  } catch (error: unknown) {
    if (error instanceof FileReadError)
      return res
        .status(error.status)
        .json({ code: error.code, error: error.message });
    console.error(
      "AI request failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return res.status(failureStatus).json({
      error:
        failureStatus === 502
          ? "A IA não retornou uma resposta válida. Tente novamente."
          : "O serviço de IA está temporariamente indisponível. Tente novamente mais tarde.",
    });
  }
}
