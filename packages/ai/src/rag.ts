import { prisma } from "@aila/db";
import OpenAI from "openai";

const SYSTEM_PROMPT = `You are an AI legal assistant for Indian law. Provide general information, not legal advice. Include citations to Indian statutes/acts/judgments when possible in the format [Title — Section/Page — Year]. If unclear or outside India, say so and recommend consulting a qualified Indian advocate. Refuse criminal evasion, forging documents, or targeted harassment. Answer in plain language with bold headings and numbered steps.`;

export async function retrieveHybrid(query: string, k = 5) {
	// Vector-like: naive by matching chunk substring; in production use pgvector cosine similarities
	const textMatches = await prisma.sourceChunk.findMany({
		where: { chunk: { contains: query, mode: "insensitive" } },
		include: { source: true },
		take: k,
	});
	return textMatches.map((m) => ({
		id: m.id,
		score: 0.5,
		chunk: m.chunk,
		sourceTitle: m.source.title,
		page: m.page || 1,
	}));
}

export async function answerWithCitations(question: string) {
	const client = new OpenAI({ apiKey: process.env.LLM_API_KEY });
	const ctx = await retrieveHybrid(question, 5);
	const citationsText = ctx
		.map(
			(c, i) =>
				`(${i + 1}) ${c.sourceTitle} — p.${c.page}: ${c.chunk.slice(0, 300)}...`,
		)
		.join("\n");
	const jurisdictionGuard = `Only answer for Indian law. If the question is about non-Indian jurisdictions, refuse politely.`;
	const messages = [
		{ role: "system", content: SYSTEM_PROMPT + "\n" + jurisdictionGuard },
		{
			role: "user",
			content: `Question: ${question}\n\nContext:\n${citationsText}`,
		},
	] as OpenAI.Chat.Completions.ChatCompletionMessageParam[];
	const completion = await client.chat.completions.create({
		model: "gpt-4o-mini",
		messages,
	});
	const text = completion.choices[0]?.message?.content || "";
	const inlineCitations = ctx
		.map((c, i) => `[${i + 1}] ${c.sourceTitle} — Page ${c.page} — 2024`)
		.join("\n");
	return `${text}\n\nCITATIONS:\n${inlineCitations}`;
}

export async function summarizePdfText(text: string) {
	const client = new OpenAI({ apiKey: process.env.LLM_API_KEY });
	const messages = [
		{ role: "system", content: SYSTEM_PROMPT },
		{
			role: "user",
			content: `Summarize the following legal document for an Indian audience. Provide TL;DR, key clauses, and risks.\n\n${text.slice(0, 12000)}`,
		},
	];
	const completion = await client.chat.completions.create({
		model: "gpt-4o-mini",
		messages,
	});
	return completion.choices[0]?.message?.content || "";
}

export async function runComplianceQA(
	checklistName: string,
	answers: Record<string, unknown>,
) {
	const checklist = await prisma.complianceChecklist.findFirst({
		where: { name: checklistName },
	});
	if (!checklist) return { checklist: checklistName, items: [] };
	const items = (checklist.items as any[]).map((i: any) => ({
		id: i.id,
		text: i.text,
		status: answers[i.id] ? "ok" : "missing",
	}));
	return { checklist: checklist.name, items };
}
