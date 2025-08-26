FROM node:20-alpine AS deps
WORKDIR /repo
COPY pnpm-workspace.yaml package.json ./
COPY packages/api/package.json packages/api/package.json
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate

FROM node:20-alpine AS builder
WORKDIR /repo
COPY . .
RUN corepack enable && pnpm install --no-frozen-lockfile
RUN pnpm --filter @aila/db prisma generate
RUN pnpm --filter @aila/api build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /repo/packages/api/dist ./dist
COPY --from=builder /repo/packages/api/package.json ./package.json
COPY --from=builder /repo/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/server.js"]

