#!/bin/sh
set -e

cd /app/server
mkdir -p data

if [ ! -f "data/app.db" ]; then
  echo "Database not found. Seeding initial data..."
  npx tsx src/db/seed.ts
fi

exec npx tsx src/index.ts
