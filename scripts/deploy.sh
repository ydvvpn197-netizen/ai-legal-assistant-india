#!/usr/bin/env bash
set -euo pipefail

STACK=${1:-prod}
cd "$(dirname "$0")/.."

if [ "$STACK" = "prod" ]; then
  docker compose -f infra/docker/docker-compose.prod.yml build
  docker compose -f infra/docker/docker-compose.prod.yml up -d
else
  echo "Unknown stack: $STACK" >&2
  exit 1
fi

echo "Deploy complete. Web on http://localhost:3000, Admin on http://localhost:3001"

