import { generateAI, type AIGeneration } from "./ai-generation.js";
import { aiResultSchema, type AIPayload } from "../app/lib/ai-contract.js";

/** Shared editorial contract for browser-requested and durable strategy work. */
export async function generateStrategies(
  input: AIPayload,
  onUsage?: (response: AIGeneration) => Promise<void> | void,
  timeout?: number,
) {
  const { category, partner_name, partner_context, title, description } = input;
  const publisherIdentity = `A marca que publica este conteúdo é ${JSON.stringify(partner_name)}. Escreva na voz dessa marca, como autora da publicação. A agência operadora não é a autora por padrão. Preserve menções legítimas a outras marcas quando solicitadas nos insumos; não substitua nem apague essas menções.`;
  const categoryMap: Record<string, string> = {
    post: "Post Estático",
    carousel: "Carrossel",
    reels: "Reels (Vídeo Curto)",
    stories: "Stories (Sequência)",
  };
  const formattedCategory = categoryMap[category] || category || "Conteúdo";
  const response = await generateAI(
    [
      {
        role: "system",
        content: `Você é o Estrategista de Conteúdo da marca informada.
${publisherIdentity}
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
    { intent: "ai-strategy", json: true, timeout },
  );
  if (onUsage) {
    try {
      await onUsage(response);
    } catch (err) {
      console.error("Strategy onUsage error:", err);
    }
  }
  const output: unknown = JSON.parse(response.text || "{}");
  const parsed = aiResultSchema.parse({ output, intent: "ai-strategy" });
  if (parsed.intent !== "ai-strategy")
    throw new Error("Invalid strategy output");
  return parsed.output.strategies;
}
