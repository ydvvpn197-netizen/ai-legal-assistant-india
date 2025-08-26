import { FastifyInstance } from "fastify";
import { z } from "zod";
import { answerWithCitations } from "@aila/ai/dist/rag";

export async function chatRoutes(app: FastifyInstance) {
	const bodySchema = z.object({
		message: z.string().min(1),
		locale: z.string().default("en"),
	});

	app.post("/api/v1/chat", async (req, reply) => {
		const parsed = bodySchema.safeParse(req.body);
		if (!parsed.success)
			return reply.code(400).send({ error: parsed.error.flatten() });
		const { message } = parsed.data;
		const answer = await answerWithCitations(message);
		return { answer }; // non-stream fallback
	});

	app.post("/api/v1/chat/stream", async (req, reply) => {
		const parsed = bodySchema.safeParse(req.body);
		if (!parsed.success)
			return reply.code(400).send({ error: parsed.error.flatten() });
		const { message } = parsed.data;
		reply.raw.writeHead(200, {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
			"Access-Control-Allow-Origin": req.headers.origin || "*",
		});
		const answer = await answerWithCitations(message);
		const chunks = answer.match(/.{1,200}/g) || [answer];
		for (const c of chunks) {
			reply.raw.write(`data: ${JSON.stringify({ token: c })}\n\n`);
		}
		reply.raw.write("event: end\n");
		reply.raw.write("data: {}\n\n");
		reply.raw.end();
		return reply;
	});
}
