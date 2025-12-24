#!/usr/bin/env sh
set -e

echo "🚀 Starting NexusVPN services..."

# Backend
cd backend
npm run start &
cd ..

# Frontend
cd frontend
npm run start &
cd ..

wait
