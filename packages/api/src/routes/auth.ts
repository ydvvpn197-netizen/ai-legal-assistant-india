import { FastifyInstance } from "fastify";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { prisma } from "@aila/db";

const otpStore = new Map<string, string>();

export async function authRoutes(app: FastifyInstance) {
	const otpRequest = z.object({ email: z.string().email() });
	app.post("/api/v1/auth/otp", async (req, reply) => {
		const parsed = otpRequest.safeParse(req.body);
		if (!parsed.success)
			return reply.code(400).send({ error: parsed.error.flatten() });
		const { email } = parsed.data;
		const code = String(Math.floor(100000 + Math.random() * 900000));
		otpStore.set(email, code);
		app.log.info({ email, code }, "OTP generated");
		return { ok: true };
	});

	const otpVerify = z.object({
		email: z.string().email(),
		code: z.string().length(6),
	});
	app.post("/api/v1/auth/verify", async (req, reply) => {
		const parsed = otpVerify.safeParse(req.body);
		if (!parsed.success)
			return reply.code(400).send({ error: parsed.error.flatten() });
		const { email, code } = parsed.data;
		const expected = otpStore.get(email);
		if (!expected || expected !== code)
			return reply.code(401).send({ error: "Invalid OTP" });
		otpStore.delete(email);
		let user = await prisma.user.findUnique({ where: { email } });
		if (!user)
			user = await prisma.user.create({ data: { email, locale: "en" } });
		const token = jwt.sign(
			{ sub: user.id },
			process.env.JWT_SECRET || "dev",
			{ expiresIn: "7d" },
		);
		reply.setCookie(process.env.COOKIE_NAME || "aila_session", token, {
			httpOnly: true,
			path: "/",
		});
		return { token };
	});
}
