import { prisma } from "@aila/db";

export async function writeAudit(
	actorId: string | undefined,
	action: string,
	entity: string,
	payload: unknown,
) {
	try {
		await prisma.auditLog.create({
			data: {
				actorId: actorId || "anonymous",
				action,
				entity,
				payload: payload as any,
			},
		});
	} catch (e) {
		// swallow
	}
}
