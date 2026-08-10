import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
// const model = "gpt-5.3-chat-latest";
const model = "gpt-5.6-luna";
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed",
    });
  }
  if (!apiKey) {
    return res.status(500).json({
      error: "OPENAI_API_KEY não configurada no servidor.",
    });
  }
  const {
    intent,
    title = "",
    description = "",
    partner_context = "",
    category = "",
    hook = "",
    racional = "",
    headline = "",
    direcionamento = "",
  } = req.body;
  if (!intent || !category) {
    return res.status(400).json({
      error: "Intent e category são obrigatórios.",
    });
  }
  try {
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
            content: `Você é o Estrategista-Chefe de Conteúdo da Agência CNVT.
Sua missão é gerar exatamente 5 ESTRATÉGIAS / ÂNGULOS DE CONTEÚDO altamente persuasivos, acionáveis e profissionais para a ação especificada.

REGRAS OBRIGATÓRIAS:
1. SE O USUÁRIO FORNECEU INSTRUÇÕES, DIRECIONAMENTOS OU PEDIDOS ESPECÍFICOS no insumo/descrição, VOCÊ DEVE OBEDECER E PRIORIZAR ESTRITAMENTE essas solicitações ao adaptar os ângulos.
2. Se o usuário não forneceu direcionamento específico, selecione autonomamente os 5 melhores ângulos do Banco de 200 Ângulos da Agência CNVT que mais se adequam ao tema e marca.
3. RETORNE A RESPOSTA EM JSON CONTENDO A PROPRIEDADE "strategies", QUE É UM ARRAY COM EXATAMENTE 5 OBJETOS. CADA OBJETO DEVE TER OS SEGUINTES CAMPOS:
   - "headline": Título/headline forte e pronto para uso formulado de acordo com o ângulo.
   - "angulo": Nº e Nome Exato do Ângulo no Banco (ex: "12. A grande renúncia de hábito").
   - "racional": Explicação estratégica de por que esse ângulo funciona para o tema e marca.
   - "direcionamento": Como aplicar e estruturar a peça especificamente no formato ${formattedCategory}.

BANCO DE IDEIAS (200 ÂNGULOS UNIVERSAIS AGÊNCIA CNVT):
1. TENDÊNCIAS E MERCADO: 1. O comportamento que vai dominar 2025 | 2. A morte do [Tópico] no seu nicho | 3. Por que a [Notícia] muda tudo | 4. O Efeito [Nome] | 5. A estatística que prova o erro | 6. [Seu Nicho] em 3 anos | 7. A ferramenta/app que está mudando o jogo | 8. O que o [Nicho Oposto] ensina | 9. A maior oportunidade e ameaça | 10. O mapa da mina inexplorado | 11. A micro-mudança na plataforma | 12. A grande renúncia de hábito | 13. O que o exterior faz | 14. Desempacotando relatório | 15. A uberização do serviço | 16. O cisne negro no mercado | 17. Analisando estratégia de Big Tech | 18. O custo de não adotar tecnologia | 19. O novo funil do nicho | 20. A habilidade chata valiosa.
2. PRODUTIVIDADE E ROTINA: 21. Meu ritual de 5 min | 22. A regra das 2 horas | 23. Como organizo tarefas (bastidores) | 24. Checklist de desligamento | 25. O ladrão de tempo número 1 | 26. Pare de fazer listas de tarefas | 27. Setup ideal com pouco R$ | 28. O que faço com zero motivação | 29. O guardião do foco | 30. Planejamento semanal em 20 min | 31. A única métrica matinal | 32. Deep Work vs Shallow Work | 33. Sistema de batching | 34. O que deletei do celular | 35. Rotina de especialista | 36. O "Não Fazer" > "Fazer" | 37. Reset mental no meio do dia | 38. Lei de Parkinson na prática | 39. Kit de sobrevivência para caos | 40. Comer o sapo primeiro.
3. PSICOLOGIA E COMPORTAMENTO: 41. O viés cognitivo nocivo | 42. Por que você procrastina (não é preguiça) | 43. Efeito Dunning-Kruger | 44. Medo do resultado > medo do problema | 45. Síndrome do impostor | 46. O poder do "E se..." | 47. O que o comportamento diz sobre resultado | 48. Paralisia da Análise | 49. Dopamina barata viciante | 50. Paradoxo da Escolha | 51. A emoção que mais vende | 52. Efeito IKEA | 53. Gatilho da Coerência | 54. O cérebro quer necessidade básica | 55. Psicologia das cores | 56. Viés da Ancoragem e preço | 57. Por que o cérebro odeia mudança | 58. Efeito Halo | 59. Prova Social atualizada | 60. O que o nível de esforço revela.
4. NEGÓCIOS E ESTRATÉGIA: 61. O Moat (fosso) defensável | 62. Escala vs Margem | 63. LTV do cliente | 64. Oceano Azul escondido | 65. Curva em S da carreira | 66. Funil Invertido | 67. O MVP da sua tarefa | 68. Desmistificando CAC | 69. Cauda Longa vs Blockbuster | 70. Efeito Rede | 71. Seja o melhor em uma coisa | 72. A métrica do chefe | 73. Jobs to be Done | 74. Estratégia Cavalo de Tróia | 75. Desbundling do serviço | 76. O ativo mais valioso | 77. Pivotar não é fracassar | 78. Princípio de Pareto (80/20) | 79. Motor de Crescimento | 80. Skin in the Game.
5. HISTÓRIAS E CASES: 81. Maior erro na carreira | 82. Case de A para B | 83. Fato inesperado com lição técnica | 84. Como marca famosa usou a estratégia | 85. A conversa divisor de águas | 86. Antes e depois numerado | 87. Eu estava errado sobre | 88. Bastidores do caos | 89. História desconhecida de famoso | 90. O cliente que não teve resultado | 91. Meu Dia 1 no nicho | 92. A decisão difícil | 93. Transição de carreira | 94. O conselho que ignorei | 95. Análise transparente de ROI | 96. Origem do meu método | 97. História da palavra-chave | 98. Print de DM com lição | 99. O herói desconhecido | 100. O dia que quase desisti.
6. ERROS COMUNS E MITOS: 101. O erro invisível sutil | 102. O maior mito desmentido | 103. Pare de X, faça Y | 104. Erro que até especialistas cometem | 105. O pior conselho famoso | 106. Sinal vermelho de erro | 107. A solução mágica problemática | 108. Por que ferramenta popular te atrasa | 109. Pecado capital do nicho | 110. A diferença entre A e B | 111. X é fácil, o difícil é Y | 112. Conselho de guru para ignorar | 113. 3 Red Flags ao contratar | 114. Não é sobre óbvio, é sobre profundo | 115. Erro silencioso de alto custo | 116. Mito vs Realidade | 117. O atalho mais longo | 118. Ferramenta não salva fundamento | 119. Erro na métrica de vaidade | 120. Crença limitante disfarçada.
7. FERRAMENTAS E MÉTODOS: 121. Framework de 3 passos | 122. Meu Stack de ferramentas | 123. Hack de app popular | 124. Template mágico acionável | 125. Método analógico low-tech | 126. Comparativo A vs B | 127. App gratuito que substitui pago | 128. Fluxo de trabalho exato | 129. Matriz 2x2 de decisão | 130. O único tipo de ferramenta necessária | 131. Script de conversa difícil | 132. Checklist pré-post | 133. Método K.I.S.S. | 134. Uso inesperado de ferramenta | 135. Protocolo de crise | 136. Calculadora de ROI | 137. Diagrama explicativo | 138. Framework de Big Tech adaptado | 139. Prompt de IA pronto | 140. Auditoria de 10 min.
8. CULTURA, MEMES E VIDA REAL: 141. Meme do momento adaptado | 142. O que filme/série ensina | 143. Unpopular opinion | 144. POV situação clássica | 145. Fofoca com lição séria | 146. Frases de clientes/leigos | 147. Expectativa vs Realidade | 148. Bingo do nicho | 149. O que seu objeto diz | 150. Se produto fosse personagem | 151. Carta aberta ao público | 152. O som do nicho | 153. Citação com opinião própria | 154. Música que define momento | 155. Não faço X, faço Y | 156. Estereótipos visuais | 157. React de especialista | 158. Duas verdades e uma mentira | 159. Versão nicho de trend | 160. Amigo tentando fazer meu trabalho.
9. APRENDIZADOS E INSIGHTS HUMANOS: 161. Lição de atividade mundana | 162. A habilidade mais difícil | 163. Redefinição contraintuitiva de sucesso | 164. Conselho ao eu jovem | 165. Pergunta diária de reflexão | 166. Consistência > Intensidade | 167. Custos ocultos reais | 168. Habilidade que escola não ensina | 169. O que faria sem medo | 170. O poder da ação simples | 171. Curto prazo vs Longo prazo | 172. Lição cara demorada | 173. Disciplina > Motivação | 174. Privilégios invisíveis | 175. Incerteza é feature | 176. A decisão mais superestimada | 177. Mentalidade de crescimento | 178. Não é sobre você, é sobre eles | 179. Falsa produtividade | 180. A verdade nua e crua.
10. UX DE CONTEÚDO: 181. Dicas de legibilidade | 182. Gancho de 3 segundos | 183. Loop perfeito em vídeo | 184. Estrutura de lâminas de carrossel | 185. CTA quebra-padrão | 186. Voz própria vs Música em alta | 187. Regra do polegar | 188. B-Roll inteligente | 189. Carrossel infinito | 190. Salvar é o novo curtir | 191. Capa de Reels | 192. Guia de Safe Zones | 193. Post para comentários | 194. Mini-história na legenda | 195. Corte seco (Jump Cut) | 196. Tamanho da legenda | 197. Sound Design | 198. Stories: Palco vs Bastidor | 199. Primeiro story do dia | 200. Primeira linha da legenda.

FORMATO DE RESPOSTA (JSON):
{
  "strategies": [
    {
      "headline": "1. [Headline Redigida]",
      "angulo": "[Nº e Nome do Ângulo no Banco]",
      "racional": "[Motivo estratégico da escolha]",
      "direcionamento": "[Aplicação prática no formato ${formattedCategory}]"
    }
  ]
}`,
          },
          {
            role: "user",
            content: `CONTEXTO DA MARCA E TOM DE VOZ:\n${partner_context}\n\nTÍTULO DA AÇÃO:\n${title}\n\nFORMATO DA AÇÃO:\n${formattedCategory}\n\nINSTRUÇÕES / INSUMO DO USUÁRIO (Siga se houver direcionamento específico):\n${description}\n\nGere a resposta em JSON com a propriedade "strategies".`,
          },
        ],
      });
      const output = JSON.parse(response.choices[0].message.content ?? "{}");
      return res.status(200).json({
        output,
        intent,
      });
    }
    if (intent === "ai-content") {
      const systemPrompt = `Você é o Redator-Chefe e Especialista de Conteúdo da Agência CNVT.
Sua missão é gerar a resposta exclusivamente em HTML limpo e básico.

REGRAS DE FORMATAÇÃO:
- Retorne APENAS o HTML (sem JSON, sem blocos de código markdown \`\`\`html, sem tags <html>, <head>, <body>).
- Use apenas tags limpas como: <h4>, <h5>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <br>.

CONTEXTO DA MARCA E TOM DE VOZ:
${partner_context}

Você deve criar conteúdo utilizando a Arquitetura Dor → Problema.

A arquitetura parte de uma distinção fundamental:

DOR = aquilo que a pessoa sente.
PROBLEMA = aquilo que causa essa dor.

A pessoa frequentemente busca primeiro aliviar a dor, enquanto a resolução do problema exige um processo.

A estrutura de raciocínio é:

DOR → PROBLEMA → PROCESSO → SOLUÇÃO

Antes de criar qualquer conteúdo:

1. Identifique a DOR real do público.
2. Descreva como essa dor aparece na experiência cotidiana.
3. Identifique o PROBLEMA que causa essa dor.
4. Explique o PROCESSO necessário para resolver o problema.
5. Defina a SOLUÇÃO coerente com esse problema.
6. Escolha qual camada possui maior potencial de atenção para iniciar o conteúdo.

REGRAS:

- Nunca confunda dor com problema.
- Não transforme o problema em dor apenas trocando as palavras.
- Não invente ou exagere dores para gerar atenção.
- Não apresente a solução antes de estabelecer o problema.
- A solução deve resolver o problema, não apenas aliviar a dor.
- O conteúdo deve partir da realidade do público, não de frases genéricas.
- A arquitetura é uma estrutura de raciocínio, não uma fórmula fixa de texto.

Primeiro faça o diagnóstico da arquitetura.
Depois adapte esse diagnóstico ao formato solicitado.
`;
      let content = "";
      switch (category) {
        case "post":
          content = `Crie um post estático utilizando a Arquitetura Dor → Problema.

Primeiro identifique:

DOR → PROBLEMA → PROCESSO → SOLUÇÃO

Porém, NÃO tente colocar toda a arquitetura na arte.

O post estático deve funcionar como um ponto de impacto.

Escolha a tensão mais forte entre a dor e o problema e transforme-a em uma afirmação curta, clara e memorável.

A arte deve priorizar:

- contraste;
- tensão;
- posicionamento;
- reconhecimento;
- uma ideia central.

Prefira estruturas como:

“Você acha que [DOR].
Na verdade, [PROBLEMA].”

“Seu problema não é [X].
É [Y].”

“[COMPORTAMENTO] não resolve [PROBLEMA].”

A legenda pode desenvolver o raciocínio completo:

DOR → PROBLEMA → PROCESSO → SOLUÇÃO.

REGRAS:

- Uma ideia principal por post.
- Evitar explicar demais na arte.
- Não utilizar frases motivacionais genéricas.
- A frase deve possuir posicionamento.
- O impacto deve vir da clareza da ideia, não de exagero.`;
          break;
        case "carousel":
          content = `Crie um carrossel utilizando a Arquitetura Dor → Problema.

Primeiro aplique o diagnóstico central:

DOR → PROBLEMA → PROCESSO → SOLUÇÃO

Depois transforme esse raciocínio em uma sequência visual.

ESTRUTURA:

SLIDE 1 — ATENÇÃO
Apresente a dor, tensão, consequência ou contradição de maior potencial.

SLIDES 2–3 — EXPERIÊNCIA
Mostre como essa dor aparece na vida real do público.
Faça a pessoa se reconhecer.

SLIDES 4–5 — PROBLEMA
Revele o que realmente está causando aquela dor.
Crie uma mudança de perspectiva.

SLIDES 6–7 — PROCESSO
Explique o que precisa acontecer para resolver o problema.
Entregue conhecimento.

SLIDE FINAL — SOLUÇÃO/DIREÇÃO
Apresente a solução ou conduza a pessoa para o próximo passo.

REGRAS:

- Cada slide deve fazer a narrativa avançar.
- Não repetir a mesma ideia em slides diferentes.
- Não começar explicando o problema de forma abstrata.
- Evitar frases genéricas de marketing.
- O conteúdo deve construir uma descoberta progressiva.
- Reduza o texto ao necessário para comunicação visual.`;
          break;
        case "reels":
          content = `Crie um roteiro de Reels utilizando a Arquitetura Dor → Problema.

Primeiro construa:

DOR → PROBLEMA → PROCESSO → SOLUÇÃO

Depois transforme essa estrutura em uma narrativa oral.

ESTRUTURA:

1. GANCHO
Comece pela dor, consequência, tensão ou contradição mais relevante.

2. RECONHECIMENTO
Mostre uma situação concreta que faça o público pensar:
“Isso acontece comigo.”

3. APROFUNDAMENTO
Mostre o impacto daquela dor no cotidiano.

4. VIRADA
Apresente:
“O problema não é [X]. O problema é [Y].”

5. EXPLICAÇÃO
Mostre por que o problema acontece e qual processo precisa ser percorrido.

6. SOLUÇÃO
Apresente a solução de maneira coerente com o diagnóstico.

7. DIREÇÃO
Finalize indicando o próximo passo adequado ao objetivo do conteúdo.

REGRAS:

- Escreva para ser falado, não para ser lido.
- Frases curtas.
- Uma ideia conduz à próxima.
- Não entregar a conclusão no início.
- Evitar introduções genéricas.
- Não utilizar “você sabia que...?” como padrão.
- A virada deve produzir mudança de perspectiva.`;
          break;
        case "stories":
          content = `Crie uma sequência de Stories utilizando a Arquitetura Dor → Problema.

Primeiro construa:

DOR → PROBLEMA → PROCESSO → SOLUÇÃO

Depois distribua o raciocínio em uma sequência de interações.

ESTRUTURA:

STORY 1 — ATENÇÃO
Apresente uma situação ou dor reconhecível.

STORY 2 — IDENTIFICAÇÃO
Mostre uma experiência cotidiana relacionada àquela dor.

STORY 3 — TENSÃO
Aprofunde a consequência ou apresente uma pergunta que gere reflexão.

STORY 4 — PROBLEMA
Revele o que realmente está causando aquilo.

STORY 5 — PROCESSO
Explique o que precisa mudar ou ser feito.

STORY 6 — SOLUÇÃO
Apresente a solução.

STORY 7 — INTERAÇÃO/DIREÇÃO
Utilize pergunta, enquete, resposta, CTA ou próximo passo coerente com o objetivo.

REGRAS:

- Cada Story deve ter uma função.
- Não transformar a sequência em um carrossel vertical.
- Priorizar linguagem natural e conversacional.
- Utilizar interação quando ela realmente contribuir para o raciocínio.
- Criar progressão entre os Stories.
- Não revelar a conclusão antes da hora.`;
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
      const generatedHtml = response.choices[0].message.content ?? "";
      return res.status(200).json({
        output: {
          content: generatedHtml,
        },
        intent,
      });
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
            content:
              "Você é o Estrategista-Chefe da CNVT. Selecione os 5 melhores ângulos do arsenal CNVT e retorne em JSON.",
          },
          {
            role: "user",
            content: `CONTEXTO DA MARCA E TOM DE VOZ:\n${partner_context}\n\nTEMA GERAL:\n${title}\n\nINSUMO:\n${description}\n\nGere os ângulos em JSON.`,
          },
        ],
      });
      const output = JSON.parse(response.choices[0].message.content ?? "{}");
      return res.status(200).json({
        output,
        intent,
      });
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
              "Você é o Estrategista-Chefe da CNVT. Gere uma legenda profissional em JSON contendo somente a propriedade 'caption'.",
          },
          {
            role: "user",
            content: `CONTEXTO DA MARCA:\n${partner_context}\n\nTÍTULO:\n${title}\n\nDIREÇÃO:\n${description}\n\nGere a Legenda em JSON contendo a propriedade "caption".`,
          },
        ],
      });
      const output = JSON.parse(response.choices[0].message.content ?? "{}");
      return res.status(200).json({
        output,
        intent,
      });
    }
    return res.status(400).json({
      error: "Intent inválido ou não suportado.",
    });
  } catch (error: unknown) {
    console.error("Erro no processamento da API de IA:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro interno do servidor.";
    return res.status(500).json({
      error: errorMessage,
    });
  }
}
