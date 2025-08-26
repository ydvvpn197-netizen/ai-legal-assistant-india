import { FastifyInstance } from "fastify";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";

const genSchema = z.object({
	templateSlug: z.string(),
	inputs: z.record(z.any()),
});

export async function documentRoutes(app: FastifyInstance) {
	app.post("/api/v1/documents/generate", async (req, reply) => {
		const parsed = genSchema.safeParse(req.body);
		if (!parsed.success)
			return reply.code(400).send({ error: parsed.error.flatten() });
		const { templateSlug, inputs } = parsed.data;
		const html = renderHtml(templateSlug, inputs);
		const outDir = path.join(process.cwd(), "public", "pdfs");
		fs.mkdirSync(outDir, { recursive: true });
		const file = `${Date.now()}-${templateSlug}.html`;
		fs.writeFileSync(path.join(outDir, file), html, "utf8");
		const url = `/pdfs/${file}`;
		return { url };
	});
}

function renderHtml(slug: string, inputs: Record<string, any>) {
	return `<!DOCTYPE html><html><head><meta charset='utf-8'><title>${slug}</title></head><body>
  <h1>${slug}</h1>
  <h3>Generated Document</h3>
  <pre>${escapeHtml(JSON.stringify(inputs, null, 2))}</pre>
  <hr/>
  <small>Not legal advice. For legal advice, consult a qualified Indian advocate.</small>
  </body></html>`;
}

function escapeHtml(s: string) {
	return s.replace(
		/[&<>"']/g,
		(c) =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#39;",
			})[c] as string,
	);
}
