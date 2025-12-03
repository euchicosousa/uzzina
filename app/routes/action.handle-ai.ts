import type { ActionFunctionArgs } from "react-router";
import { INTENT } from "~/lib/CONSTANTS";
import { getUserId } from "~/lib/helpers";
import OpenAI from "openai";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = Object.fromEntries(await request.formData());
  const { intent, ...values } = formData;

  let prompt = "";

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  if (intent === INTENT.caption_ai) {
    prompt = `Crie uma legenda para o post ${values.title} com essa abordagem ${values.description}.`;
  }
  console.log(values.contexto);

  const response = await client.responses.create({
    model: "gpt-5.1-chat-latest",
    input: [
      {
        role: "system",
        content: `Você é um assistente de IA especializado em criação de conteúdo para redes sociais. Sua missão é ajudar os usuários a criar legendas para seus posts de redes sociais. Ao receber as informações do usuário você deve identificar qual a etapa do funil esse conteúdo está servindo se é topo meio ou fundo de funil, isso irá lhe ajudar a determinar o modelo a ser utilizado e o objetivo que o usuário quer. Sua abordagem é primariamente em Storytelling. Caso você sinta falta de alguma informação que você considere como crucial você deve ignorar o pedido do usuário e retornar a sua pergunta com os itens que você acredita que preciso para fazer um bom conteúdo. você deve ser breve na sua resposta e mandar tudo o que você precisa e justificar. 
          
          Considere também o contexto da marca para ajudar no tom de voz da escrita e no conteúdo. ${values.contexto}
          
          
          Ao retornar antes da sua resposta você deve adicionar os pontos que você concluiu, para que o usuário concorde ou faça ajustes.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return { output: response.output_text, intent };
};
