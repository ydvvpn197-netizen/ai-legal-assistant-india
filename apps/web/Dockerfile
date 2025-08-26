FROM node:20-alpine AS deps
WORKDIR /app
COPY ../../pnpm-workspace.yaml ../../package.json ./
COPY package.json ./
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate
RUN pnpm fetch

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /root/.local/share/pnpm/store /root/.local/share/pnpm/store
COPY ../../ .
RUN corepack enable && pnpm install --offline
RUN pnpm --filter @aila/web build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000"]

