import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@aila/db";

export async function complianceRoutes(app: FastifyInstance) {
	const input = z.object({
		checklistId: z.string(),
		answers: z.record(z.any()).default({}),
	});
	app.post("/api/v1/compliance/run", async (req, reply) => {
		const parsed = input.safeParse(req.body);
		if (!parsed.success)
			return reply.code(400).send({ error: parsed.error.flatten() });
		const { checklistId, answers } = parsed.data;
		const checklist = await prisma.complianceChecklist.findUnique({
			where: { id: checklistId },
		});
		if (!checklist)
			return reply.code(404).send({ error: "Checklist not found" });
		const items = (checklist.items as any[]).map((i: any) => ({
			...i,
			status: answers[i.id] ? "ok" : "missing",
		}));
		return { checklist: { id: checklist.id, name: checklist.name }, items };
	});
}
