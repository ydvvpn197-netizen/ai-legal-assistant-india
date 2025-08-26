import fs from "node:fs";
import path from "node:path";
import { prisma } from "@aila/db";

async function ingestDir(dir: string) {
	const entries = fs.readdirSync(dir);
	for (const file of entries) {
		const full = path.join(dir, file);
		const stat = fs.statSync(full);
		if (stat.isDirectory()) continue;
		const ext = path.extname(full).toLowerCase();
		if (![".txt", ".md"].includes(ext)) continue; // simple text seed
		const text = fs.readFileSync(full, "utf8");
		const title = path.basename(full);
		const source = await prisma.source.create({
			data: {
				title,
				sourceType: "bare_act" as any,
				url: null,
				jurisdiction: "India",
				language: "en",
			},
		});
		const chunks = chunkText(text, 800);
		for (let i = 0; i < chunks.length; i++) {
			const chunk = chunks[i];
			const embedding = fakeEmbedding(chunk);
			await prisma.sourceChunk.create({
				data: {
					sourceId: source.id,
					chunk,
					embedding,
					page: i + 1,
					citationMeta: { page: i + 1 },
				},
			});
		}
		console.log(`Ingested ${title} with ${chunks.length} chunks.`);
	}
}

function chunkText(text: string, size: number) {
	const words = text.split(/\s+/);
	const chunks: string[] = [];
	let current: string[] = [];
	for (const w of words) {
		current.push(w);
		if (current.join(" ").length >= size) {
			chunks.push(current.join(" "));
			current = [];
		}
	}
	if (current.length) chunks.push(current.join(" "));
	return chunks;
}

function fakeEmbedding(s: string): Buffer {
	// Deterministic pseudo-embedding
	const arr = new Float32Array(1536);
	let h = 0;
	for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
	for (let i = 0; i < arr.length; i++)
		arr[i] = ((h ^ (i * 2654435761)) % 1000) / 1000;
	return Buffer.from(arr.buffer);
}

const dir = process.argv[2] || path.join(process.cwd(), "seed", "sources");
ingestDir(dir)
	.then(() => {
		console.log("Ingestion done");
		process.exit(0);
	})
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});
