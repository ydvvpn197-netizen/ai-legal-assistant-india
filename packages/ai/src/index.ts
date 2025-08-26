import OpenAI from "openai";
import { prisma } from "@aila/db";

const systemPrompt = `You are an AI legal assistant for Indian law. Provide general information, not legal advice. Include citations to Indian statutes/acts/judgments when possible. If unclear or outside India, say so and suggest consulting a qualified Indian advocate.`;

export async function simpleAnswer(question: string): Promise<string> {
  const provider = process.env.LLM_PROVIDER || "openai";
  if (provider !== "openai") {
    return "LLM provider not configured. Please set LLM_PROVIDER=openai.";
  }
  const client = new OpenAI({ apiKey: process.env.LLM_API_KEY });
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question }
    ]
  });
  return completion.choices[0]?.message?.content || "";
}

