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

# Legal-Assistant
Legal Assistant
