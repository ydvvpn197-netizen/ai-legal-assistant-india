import fs from "node:fs";
import path from "node:path";
import pdfParse from "pdf-parse";
import * as cheerio from "cheerio";
import { prisma } from "@aila/db";

async function extractText(filePath: string): Promise<string> {
	const buf = fs.readFileSync(filePath);
	const ext = path.extname(filePath).toLowerCase();
	if (ext === ".pdf") {
		const out = await pdfParse(buf);
		return out.text;
	}
	if (ext === ".html" || ext === ".htm") {
		const $ = cheerio.load(buf.toString("utf8"));
		return $("body").text();
	}
	return buf.toString("utf8");
}

function chunkText(text: string, size = 1200): string[] {
	const sentences = text.replace(/\s+/g, " ").split(/(?<=[\.!?])\s+/);
	const chunks: string[] = [];
	let current = "";
	for (const s of sentences) {
		if ((current + " " + s).length > size) {
			if (current.trim()) chunks.push(current.trim());
			current = s;
		} else {
			current += " " + s;
		}
	}
	if (current.trim()) chunks.push(current.trim());
	return chunks;
}

function fakeEmbedding(s: string): Buffer {
	const arr = new Float32Array(1536);
	let h = 0;
	for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
	for (let i = 0; i < arr.length; i++)
		arr[i] = ((h ^ (i * 2654435761)) % 1000) / 1000;
	return Buffer.from(arr.buffer);
}

async function ingestPath(inputPath: string) {
	const stat = fs.statSync(inputPath);
	const files: string[] = [];
	if (stat.isDirectory()) {
		for (const f of fs.readdirSync(inputPath))
			files.push(path.join(inputPath, f));
	} else files.push(inputPath);

	for (const f of files) {
		const ext = path.extname(f).toLowerCase();
		if (![".pdf", ".txt", ".md", ".html", ".htm"].includes(ext)) continue;
		const text = await extractText(f);
		const title = path.basename(f);
		const source = await prisma.source.create({
			data: {
				title,
				sourceType: "custom" as any,
				url: null,
				jurisdiction: "India",
				language: "en",
			},
		});
		const chunks = chunkText(text);
		for (let i = 0; i < chunks.length; i++) {
			const chunk = chunks[i];
			await prisma.sourceChunk.create({
				data: {
					sourceId: source.id,
					chunk,
					embedding: fakeEmbedding(chunk),
					page: i + 1,
					citationMeta: { page: i + 1 },
				},
			});
		}
		console.log(`Ingested ${title}: ${chunks.length} chunks`);
	}
}

const target = process.argv[2] || path.join(process.cwd(), "seed", "sources");
ingestPath(target)
	.then(() => process.exit(0))
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});
