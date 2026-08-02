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

echo "Waiting for Apollo to be ready..."
until curl -s http://127.0.0.1:4000/graphql -X POST -H "Content-Type: application/json" -d '{"query":"{ __typename }"}' > /dev/null 2>&1; do
  sleep 1
done

echo "Apollo is ready. Starting nginx on port 3000..."
exec nginx -g "daemon off;"
