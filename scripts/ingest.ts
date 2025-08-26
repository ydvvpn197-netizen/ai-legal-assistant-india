import path from "node:path";
import { spawn } from "node:child_process";

const dir = process.argv[2] || path.join(process.cwd(), "seed", "sources");
const child = spawn("pnpm", ["--filter", "@aila/ai", "cli:ingest", dir], {
	stdio: "inherit",
	shell: true,
});
child.on("exit", (code) => process.exit(code || 0));
