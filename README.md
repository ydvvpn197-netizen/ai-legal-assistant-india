## AI Legal Assistant (India)

Production-ready monorepo for a multilingual legal assistant focused on Indian law. Includes RAG chat, document generator, compliance checklists, admin console, and mobile app.

### Quickstart

1. Copy envs
```
cp .env.example .env
```

2. Install
```
pnpm i
```

3. Start stack
```
pnpm dev
```

4. Migrate and seed
```
pnpm db:migrate && pnpm db:seed
```

5. Ingest seed sources
```
pnpm ingest ./seed/sources
```

Services:
- API: http://localhost:4000
- Web: http://localhost:3000
- Admin: http://localhost:3001
- Postgres: localhost:5432
- MinIO: http://localhost:9000 (console http://localhost:9001)

See `docs/` for SECURITY, PRIVACY, and DISCLAIMER.

### CI/CD

- CI runs typecheck, build, and tests on push/PR (`.github/workflows/ci.yml`).
- CD builds and pushes Docker images to GHCR on push to main (`.github/workflows/cd.yml`).
  Images:
  - ghcr.io/<owner>/<repo>/api:latest
  - ghcr.io/<owner>/<repo>/web:latest
  - ghcr.io/<owner>/<repo>/admin:latest

To deploy locally with built images, use:
```
bash scripts/deploy.sh
```

### HTTPS with Caddy (one-command)

- Set DNS A/AAAA records to your server IP for three domains, then set in `.env`:
```
APP_DOMAIN=app.example.com
ADMIN_DOMAIN=admin.example.com
API_DOMAIN=api.example.com
```
- Start the production stack (includes Caddy with automatic Let's Encrypt):
```
docker compose -f infra/docker/docker-compose.prod.yml up -d
```
- Access:
  - https://$APP_DOMAIN
  - https://$ADMIN_DOMAIN
  - https://$API_DOMAIN

# Legal-Assistant
Legal Assistant
