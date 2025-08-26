import { FastifyInstance } from "fastify";
import { z } from "zod";
import crypto from "node:crypto";

export async function uploadRoutes(app: FastifyInstance) {
	const schema = z.object({
		filename: z.string().min(1),
		contentType: z.string().min(1),
	});
	app.post("/api/v1/uploads/sign", async (req, reply) => {
		const parsed = schema.safeParse(req.body);
		if (!parsed.success)
			return reply.code(400).send({ error: parsed.error.flatten() });
		const { filename, contentType } = parsed.data;
		// Simple presign for MinIO with public bucket. In prod, sign with S3 SDK.
		const key = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${filename}`;
		const endpoint = process.env.S3_ENDPOINT || "http://localhost:9000";
		const bucket = process.env.S3_BUCKET || "uploads";
		const url = `${endpoint.replace(/\/$/, "")}/${bucket}/${key}`;
		return { url, method: "PUT", headers: { "Content-Type": contentType } };
	});
}
