#!/bin/sh
set -e

cd /app/server
mkdir -p data

if [ ! -f "data/app.db" ]; then
  echo "Database not found. Seeding initial data..."
  npx tsx src/db/seed.ts
fi

echo "Starting Apollo server on port 4000..."
npx tsx src/index.ts &

echo "Starting nginx on port 3000..."
exec nginx -g "daemon off;"
