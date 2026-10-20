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
Gere exatamente 5 estratégias para a ação no formato ${formattedCategory}. Cada estratégia tem duas partes que não se confundem:
- a TESE: o que a peça vai sustentar, a conclusão a que o público chega no fim;
- a HEADLINE: a abertura que faz a pessoa certa parar e querer ver o resto.
A headline não é a tese resumida. Se a headline já entrega a conclusão, ninguém precisa abrir a peça.

PASSO 1: CINCO ESTRATÉGIAS REALMENTE DIFERENTES
- Preserve o pedido, o formato, a abordagem e as restrições fornecidas. O contexto da marca informa a decisão, mas não substitui o objetivo do pedido. Se o pedido fixa uma direção, varie dentro dela.
- Cada uma das 5 usa um mecanismo diferente, escolhido pela barreira do público: espelho (a pessoa se reconhece numa situação); contraste de crença (o que ela acredita está errado ou incompleto); consequência (uma escolha comum produz um efeito que ela não liga à escolha); bastidor (uma decisão do especialista e o porquê); ferramenta (um critério que ela aplica sozinha); demonstração (algo observável prova a ideia); posição (a marca toma um lado). Não repita mecanismo.
- As teses também devem ser diferentes entre si, não a mesma ideia dita de cinco jeitos. Para achar perspectivas, considere: outro lado do balcão, olhar do especialista, escala, tempo, custo e troca, exceção, matéria e origem, significado de uma palavra, momento exato ou excesso.
- Defina a conversão a partir do pedido ou de uma orientação explícita no contexto: OFF sem oferta; ASSISTIDA quando uma ponte editorial leva naturalmente à oferta; DIRETA quando vender faz parte do objetivo. Sem essa indicação, use OFF. A existência de um produto ou serviço não autoriza acrescentar venda.

PASSO 2: A HEADLINE
Para cada estratégia, escreva internamente pelo menos 3 aberturas e fique com a mais forte. Uma headline forte:
- abre uma tensão que o corpo resolve: uma contradição, uma consequência inesperada, uma pergunta que a pessoa não sabe responder, uma cena em que ela se reconhece;
- é concreta: prefira uma cena, um momento, um objeto, um número fornecido ou uma frase que o público diria, em vez de um conceito abstrato;
- é curta: até 14 palavras, legível de uma vez numa capa ou dita em 3 segundos;
- é afirmativa: sem "pode", "talvez", "é importante", "precisa considerar", "é fundamental";
- soa como uma pessoa falando na voz da marca, não como um resumo ou um título de artigo.
Cenas típicas e universais do tema podem ser usadas (por exemplo, recomeçar algo na segunda-feira), desde que qualquer pessoa do público as reconheça. Não invente números, estudos, casos, depoimentos, tendências ou atributos do produto.
A tensão é permitida e desejada, desde que o direcionamento mostre como o corpo cumpre o que ela abre. Evite apenas promessas que a peça não entrega, bordões genéricos e suspense vazio sem assunto.

Exemplos de transformação (o tema é ilustrativo; não copie as frases):
- Fraca, porque entrega a conclusão: "Cortar tudo o que você gosta pode tornar a dieta difícil de manter." Forte: "O alimento que você cortou é o motivo de você ter desistido."
- Fraca, porque é abstrata e hesitante: "Seu plano precisa considerar sua rotina." Forte: "Você não desistiu da dieta na sexta. Desistiu na segunda, quando montou o cardápio."
- Fraca, porque é um conselho genérico: "Métodos radicais duram pouco." Forte: "Se toda segunda você recomeça, o problema não é força de vontade."
- Fraca, porque é um título de artigo: "A importância do protetor solar no inverno." Forte: "O sol que mais mancha sua pele é o que você nem sente."

PASSO 3: REVISÃO
Antes de responder, descarte internamente e reescreva toda headline que: resume a tese; tem verbo hesitante; passa de 14 palavras; serviria para qualquer marca do segmento; ou repete o mecanismo de outra opção. Não mostre essa checagem.

CONTRATO DE RESPOSTA:
Retorne somente JSON com a propriedade "strategies": exatamente 5 objetos com os quatro campos abaixo, todos textos não vazios. Não crie campos adicionais nem retorne tabela ou Markdown.
- "headline": a abertura escolhida, pronta para uso, sem numeração, rótulo técnico ou aspas.
- "angulo": nome curto do mecanismo e da perspectiva, por exemplo "Consequência: o corte que derruba".
- "racional": até 2 frases com a tese (a conclusão que a peça sustenta), o público e o que ele ainda não percebe, e por que esse mecanismo funciona aqui.
- "direcionamento": até 3 frases com aplicação em ${formattedCategory}, como o corpo resolve a tensão da headline, direção visual quando contribuir e conversão (OFF/ASSISTIDA/DIRETA; ponte e destino quando previstos). Se faltar um fato indispensável, registre a lacuna aqui em poucas palavras.
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
