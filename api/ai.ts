import { aiInputSchema, aiResultSchema } from "../app/lib/ai-contract.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import type { Database } from "../types/database";
// const model = "gpt-5.3-chat-latest";
const model = "gpt-6-luna";
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
    const parsed = aiInputSchema.safeParse(body);
    if (!parsed.success)
      return res.status(400).json({
        error: "Dados de IA inválidos. Confira os campos e seus limites.",
      });
    const {
      intent,
      title,
      description,
      partner_context,
      category,
      racional,
      headline,
      direcionamento,
    } = parsed.data;

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
    failureStatus = 502;
    const client = new OpenAI({
      apiKey,
    });

    // Vamos mapear os intents conforme definidos no app/lib/CONSTANTS.ts e no ai.ts original
    if (intent === "ai-strategy") {
      const categoryMap: Record<string, string> = {
        post: "Post Estático",
        carousel: "Carrossel",
        reels: "Reels (Vídeo Curto)",
        stories: "Stories (Sequência)",
      };
      const formattedCategory = categoryMap[category] || category || "Conteúdo";
      const response = await client.chat.completions.create({
        model: model,
        response_format: {
          type: "json_object",
        },
        messages: [
          {
            role: "system",
            content: `Você é o Estrategista de Conteúdo da Agência CNVT.
Gere exatamente 5 estratégias distintas para a ação no formato ${formattedCategory}. Cada opção deve oferecer uma direção editorial executável e uma headline pronta para uso.

DECISÕES ESTRATÉGICAS:
- Preserve o pedido, o formato, a abordagem e as restrições fornecidas. O contexto da marca informa a decisão, mas não substitui o objetivo do pedido.
- Defina uma tese central por opção: o que a peça vai sustentar, além de apenas nomear o tema.
- Identifique o público neste assunto, o que ele já percebe e o que a peça precisa fazê-lo perceber. Não invente hábitos, crenças ou cenas do público para justificar uma ideia.
- Escolha um ângulo que revele algo da tese. As cinco opções devem mudar a perspectiva ou o mecanismo, não apenas reescrever a mesma headline. Se o pedido já fixa uma direção, varie dentro dela.
- Escolha o mecanismo pela barreira do público, não pelo formato. Repertório: espelho (reconhecimento de uma situação real); contraste de crença (revisão de uma crença informada); bastidor (uma escolha e sua razão); consequência (nexo entre escolha e efeito); ferramenta (critério aplicável); demonstração (evidência observável); posição (um lado e seu critério). Use apenas o que os insumos sustentam.
- Para encontrar perspectivas, considere: outro lado do balcão, olhar do especialista, escala, tempo, custo e troca, exceção, matéria e origem, significado de uma palavra, momento exato ou excesso. São perguntas para pensar, não fórmulas obrigatórias.
- Defina a conversão a partir do pedido ou de uma orientação explícita no contexto: OFF sem oferta; ASSISTIDA quando uma ponte editorial leva naturalmente à oferta; DIRETA quando vender faz parte do objetivo. Sem essa indicação, use OFF. A simples existência de um produto ou serviço não autoriza acrescentar venda.
- Defina a direção lógica e o trabalho da abertura: o que precisa fazer a pessoa certa perceber e o que o corpo deve entregar.

HEADLINES E QUALIDADE:
- Escreva aberturas concretas, claras de primeira e naturais na voz da marca. Varie reconhecimento, curiosidade, contraste, consequência, utilidade, identidade ou demonstração conforme a tese.
- O impacto vem da precisão; evite bordões, revelações vazias, superlativos e promessas absolutas. A headline não pode prometer mais do que a direção permite entregar.
- Use apenas fatos, dados, depoimentos, atributos e comportamentos sustentados pelos insumos. Não afirme tendências atuais nem acesso a pesquisas ou arquivos que não foram fornecidos. Quando faltar informação, registre a lacuna brevemente no direcionamento, sem preenchê-la com um fato inventado.
- Mostrar opções não autoriza prescrever como o público deve consumi-las. Vitrine, afeto e comemoração podem trabalhar desejo ou significado sem inventar uma dor.
- Antes de responder, confira internamente: fidelidade ao pedido, tese única, realidade, especificidade da marca, diversidade e adequação ao formato. Não mostre essa checagem.

CONTRATO DE RESPOSTA:
Retorne somente JSON com a propriedade "strategies": exatamente 5 objetos com os quatro campos abaixo, todos textos não vazios. Não crie campos adicionais nem retorne tabela ou Markdown.
- "headline": abertura pronta para uso, sem numeração ou rótulo técnico.
- "angulo": nome curto da perspectiva escolhida, sem obrigação de código ou número.
- "racional": até 2 frases com objetivo, tese, público/consciência e por que o mecanismo escolhido funciona neste caso.
- "direcionamento": até 3 frases com aplicação em ${formattedCategory}, dependência lógica, entrega que sustenta a headline e conversão (OFF/ASSISTIDA/DIRETA; ponte e destino quando previstos). Inclua a direção visual quando contribuir.
Mantenha cada campo com no máximo 1800 caracteres, para permitir seu uso na próxima etapa.`,
          },
          {
            role: "user",
            content: `CONTEXTO DA MARCA E TOM DE VOZ:\n${partner_context}\n\nTÍTULO DA AÇÃO:\n${title}\n\nFORMATO DA AÇÃO:\n${formattedCategory}\n\nINSTRUÇÕES / INSUMO DO USUÁRIO (Siga se houver direcionamento específico):\n${description}\n\nGere a resposta em JSON com a propriedade "strategies".`,
          },
        ],
      });
      const output: unknown = JSON.parse(
        response.choices[0]?.message.content ?? "{}",
      );
      return res.status(200).json(aiResultSchema.parse({ output, intent }));
    }
    if (intent === "ai-content") {
      const systemPrompt = `Você é o Redator-Chefe e Especialista de Conteúdo da Agência CNVT.
Sua missão é gerar a resposta exclusivamente em HTML limpo e básico.

REGRAS DE FORMATAÇÃO:
- Retorne APENAS o HTML (sem JSON, sem blocos de código markdown \`\`\`html, sem tags <html>, <head>, <body>).
- Use apenas tags limpas como: <h4>, <h5>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <br>.

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
Escolha contraste, reconhecimento, desejo, demonstração, utilidade ou posicionamento conforme a tese. O impacto deve vir da clareza e da especificidade, sem obrigar uma fórmula de oposição ou uma narrativa de problema.
Quando a legenda fizer parte do pedido, use-a para desenvolver a ideia sem repetir a arte.`;
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
      const response = await client.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
      });
      const generatedHtml = response.choices[0]?.message.content ?? "";
      return res
        .status(200)
        .json(
          aiResultSchema.parse({ output: { content: generatedHtml }, intent }),
        );
    }
    if (intent === "ai-hooks") {
      const response = await client.chat.completions.create({
        model,
        response_format: {
          type: "json_object",
        },
        messages: [
          {
            role: "system",
            content: `Você cria hooks para a Agência CNVT. Gere exatamente 5 aberturas para a direção recebida, em 2 ou 3 rotas de atenção. Preserve a estratégia e o pedido; não escreva a peça completa.
Escolha os mecanismos pelo que a pessoa precisa perceber: reconhecimento, curiosidade, contraste, consequência, utilidade específica, identidade ou prova/demonstração. Use a rota principal sugerida pelo briefing e alternativas fundamentadas. As opções devem variar em mecanismo ou construção, não ser paráfrases; use no máximo duas da mesma família de construção.
Cada abertura deve ser clara de primeira, específica deste público e natural na voz da marca. A promessa deve caber na entrega planejada ou no corpo fornecido. Não invente comportamentos, fatos, estatísticas, casos, resultados ou tendências. Sem corpo pronto, não alegue ter conferido uma entrega que ainda não existe.
Adapte ao formato informado: Reel combina fala, texto de tela e primeira imagem sem repetição; carrossel combina capa e visual legíveis em miniatura; estático relaciona frase e imagem; Stories abre a sequência com uma cena ou unidade clara. Sem formato definido, não presuma um.
Respeite restrições e conversão do briefing. Sem indicação de venda, use OFF. Descarte internamente promessas sem sustentação, aberturas obscuras e bordões genéricos. Entre as opções válidas, recomende a mais forte para o objetivo e justifique em uma frase.
Retorne somente JSON com "strategies": exatamente 5 objetos, cada um com apenas headline, angulo, racional e direcionamento, todos textos não vazios e com no máximo 1800 caracteres por campo. "headline" contém a abertura pronta; "angulo" identifica a rota e o mecanismo; "racional" explica por que funciona neste caso; "direcionamento" descreve a execução visual ou oral e a entrega que sustenta a promessa. Inclua "Recomendado: " e a justificativa no racional de exatamente uma opção, sem adicionar campos ao JSON.`,
          },
          {
            role: "user",
            content: `CONTEXTO DA MARCA E TOM DE VOZ:\n${partner_context}\n\nTEMA GERAL:\n${title}\n\nINSUMO:\n${description}\n\nFORMATO:\n${category}\n\nESTRATÉGIA DISPONÍVEL:\n${headline}\n${racional}\n${direcionamento}\n\nGere as 5 aberturas em JSON com a propriedade "strategies".`,
          },
        ],
      });
      const output: unknown = JSON.parse(
        response.choices[0]?.message.content ?? "{}",
      );
      return res.status(200).json(aiResultSchema.parse({ output, intent }));
    }
    if (intent === "ai-caption") {
      const response = await client.chat.completions.create({
        model: model,
        response_format: {
          type: "json_object",
        },
        messages: [
          {
            role: "system",
            content:
              "Você escreve legendas para a Agência CNVT. Preserve o pedido, a tese, a abertura e a direção do conteúdo fornecido, na voz da marca e em português brasileiro natural. A primeira linha deve dar um motivo específico para continuar; o restante desenvolve a ideia sem repetir mecanicamente o conteúdo. Não invente fatos, dados, depoimentos, hábitos do público ou condições comerciais. Respeite a conversão indicada: OFF sem oferta; ASSISTIDA com a ponte prevista; DIRETA com a oferta fornecida. Sem indicação de venda, não acrescente chamada comercial. Retorne somente JSON com a propriedade 'caption', contendo o texto final não vazio da legenda, sem diagnóstico nem comentários externos.",
          },
          {
            role: "user",
            content: `CONTEXTO DA MARCA:\n${partner_context}\n\nTÍTULO:\n${title}\n\nDIREÇÃO:\n${description}\n\nGere a Legenda em JSON contendo a propriedade "caption".`,
          },
        ],
      });
      const output: unknown = JSON.parse(
        response.choices[0]?.message.content ?? "{}",
      );
      return res.status(200).json(aiResultSchema.parse({ output, intent }));
    }
    return res.status(400).json({
      error: "Intent inválido ou não suportado.",
    });
  } catch (error: unknown) {
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
