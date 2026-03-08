#!/bin/bash
set -e

echo "Running Prisma migration..."
cd packages/db
npx prisma migrate deploy

echo "Installing backend deps..."
cd ../../apps/api
npm install

echo "Installing frontend deps..."
cd ../web
npm install

echo "Building frontend..."
npm run build

echo "Done. Start servers:"
echo "Backend: cd apps/api && npm run start"
echo "Frontend: cd apps/web && npm run start"