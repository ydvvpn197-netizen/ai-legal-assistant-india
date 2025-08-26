FROM node:20-alpine AS builder
WORKDIR /repo
COPY . .
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @aila/web build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /repo/apps/web/.next ./.next
COPY --from=builder /repo/apps/web/package.json ./package.json
COPY --from=builder /repo/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000"]

