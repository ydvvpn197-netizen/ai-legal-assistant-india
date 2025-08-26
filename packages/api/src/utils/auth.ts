import type { FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

export function getUserIdFromRequest(req: FastifyRequest): string | undefined {
	try {
		const raw = (req.cookies as any)?.[
			process.env.COOKIE_NAME || "aila_session"
		];
		if (!raw) return undefined;
		const decoded = jwt.verify(raw, process.env.JWT_SECRET || "dev") as any;
		return decoded?.sub as string | undefined;
	} catch {
		return undefined;
	}
}
