#!/bin/sh
set -eu

echo "Applying database migrations..."
npx prisma db migrate --db "$DATABASE_URL"

if [ "${SEED_ON_START:-false}" = "true" ]; then
  echo "Seeding database..."
  node --experimental-strip-types scripts/seed.ts
fi

exec node server.js
