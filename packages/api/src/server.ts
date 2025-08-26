import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import { prisma } from "@aila/db";
import { chatRoutes } from "./routes/chat";
import { sourceRoutes } from "./routes/sources";
import { documentRoutes } from "./routes/documents";
import fastifyStatic from "@fastify/static";
import path from "node:path";

const PORT = Number(process.env.PORT || 4000);
const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

async function buildServer() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: [ORIGIN, "http://localhost:3001", "http://localhost:3002"], credentials: true });
  await app.register(cookie, { secret: process.env.AUTH_SECRET || "dev" });
  await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
  await app.register(multipart);
  await app.register(fastifyStatic, { root: path.join(process.cwd(), "public"), prefix: "/" });

  app.get("/health", async () => ({ ok: true }));

  app.get("/api/v1/config", async () => ({
    name: process.env.NEXT_PUBLIC_APP_NAME || "AI Legal Assistant (India)",
    locales: (process.env.NEXT_PUBLIC_SUPPORTED_LOCALES || "en,hi").split(","),
  }));

  app.get("/api/v1/seed-check", async () => {
    const users = await prisma.user.count();
    return { users };
  });

  await chatRoutes(app);
  await sourceRoutes(app);
  await documentRoutes(app);

  return app;
}

buildServer()
  .then((app) => app.listen({ port: PORT, host: "0.0.0.0" }))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

