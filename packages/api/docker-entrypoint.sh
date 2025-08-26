#!/bin/sh
set -e

PRISMA_SCHEMA_PATH=${PRISMA_SCHEMA_PATH:-/app/prisma/schema.prisma}

echo "Running Prisma migrate deploy using schema: $PRISMA_SCHEMA_PATH"
npx prisma migrate deploy --schema "$PRISMA_SCHEMA_PATH"

echo "Starting API server"
exec node dist/server.js

