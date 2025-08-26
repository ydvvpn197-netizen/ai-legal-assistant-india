import { FastifyInstance } from "fastify";
import Razorpay from "razorpay";
import crypto from "node:crypto";
import { z } from "zod";

export async function billingRoutes(app: FastifyInstance) {
	const key_id = process.env.RAZORPAY_KEY_ID || "";
	const key_secret = process.env.RAZORPAY_KEY_SECRET || "";
	const rz = new Razorpay({ key_id, key_secret });

	const orderInput = z.object({
		amount: z.number().min(100),
		currency: z.string().default("INR"),
		receipt: z.string().optional(),
	});
	app.post("/api/v1/billing/order", async (req, reply) => {
		const parsed = orderInput.safeParse(req.body);
		if (!parsed.success)
			return reply.code(400).send({ error: parsed.error.flatten() });
		const order = await rz.orders.create(parsed.data as any);
		return order;
	});

	app.post("/api/v1/billing/webhook", async (req, reply) => {
		const signature = req.headers["x-razorpay-signature"] as string;
		const body = JSON.stringify(req.body);
		const secret = process.env.RAZORPAY_KEY_SECRET || "";
		const expected = crypto
			.createHmac("sha256", secret)
			.update(body)
			.digest("hex");
		if (expected !== signature) return reply.code(401).send({ ok: false });
		app.log.info({ event: req.body?.event }, "Razorpay webhook");
		return { ok: true };
	});
}
