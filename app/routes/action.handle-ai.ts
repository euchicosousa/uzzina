import type { ActionFunctionArgs } from "react-router";
import { INTENT } from "~/lib/CONSTANTS";
import { getUserId } from "~/lib/helpers";
import OpenAI from "openai";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = Object.fromEntries(await request.formData());
  const { intent, ...values } = formData;

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  if (intent === INTENT.caption_ai) {
  }

  const response = await client.responses.create({
    model: "gpt-5.1-chat-latest",
    input: [
      {
        role: "system",
        content:
          "Você é um assistente de IA que ajuda a criar legendas para posts de redes sociais.",
      },
    ],
  });

  console.log(response);

  return null;
};
