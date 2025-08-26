import { FastifyInstance } from "fastify";
import { prisma } from "@aila/db";
import { z } from "zod";
import { getUserIdFromRequest } from "../utils/auth";
import { writeAudit } from "../utils/audit";

export async function adminRoutes(app: FastifyInstance) {
	app.get("/api/v1/admin/users", async () =>
		prisma.user.findMany({ take: 50 }),
	);
	app.get("/api/v1/admin/templates", async () =>
		prisma.documentTemplate.findMany({ take: 100 }),
	);
	app.get("/api/v1/admin/sources", async () =>
		prisma.source.findMany({ take: 100 }),
	);
	app.get("/api/v1/admin/flags", async () =>
		prisma.flag.findMany({ take: 100 }),
	);

	const templSchema = z.object({
		slug: z.string(),
		title: z.string(),
		category: z.string(),
		schema: z.any(),
		sample: z.any(),
		locale: z.string().default("en"),
		isPremium: z.boolean().default(false),
	});
	app.post("/api/v1/admin/templates", async (req, reply) => {
		const parsed = templSchema.safeParse(req.body);
		if (!parsed.success)
			return reply.code(400).send({ error: parsed.error.flatten() });
		const tpl = await prisma.documentTemplate.create({
			data: parsed.data as any,
		});
		const actorId = getUserIdFromRequest(req);
		await writeAudit(actorId, "template.create", "DocumentTemplate", {
			id: tpl.id,
			slug: tpl.slug,
		});
		return tpl;
	});
}
