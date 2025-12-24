#!/usr/bin/env sh
set -e

echo "🚀 Starting NexusVPN (Linux mode)"

# Backend
cd backend
npm run start:prod &
cd ..

# Frontend (Vite preview or custom prod server)
cd frontend
npm run build
npm run preview -- --host 0.0.0.0 &
cd ..

wait
