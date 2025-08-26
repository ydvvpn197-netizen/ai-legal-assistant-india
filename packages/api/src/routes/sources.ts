import { FastifyInstance } from "fastify";
import { prisma } from "@aila/db";
import { z } from "zod";

export async function sourceRoutes(app: FastifyInstance) {
  app.get("/api/v1/sources/search", async (req, reply) => {
    const q = (req.query as any)?.q || "";
    if (!q) return { items: [] };
    const items = await prisma.sourceChunk.findMany({
      where: { chunk: { contains: String(q), mode: "insensitive" } },
      take: 5,
      include: { source: true },
    });
    return { items: items.map((c) => ({ id: c.id, title: c.source.title, snippet: c.chunk.slice(0, 240) })) };
  });
}

