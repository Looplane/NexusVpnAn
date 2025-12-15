#!/bin/bash
# Check all NexusVPN services status

echo "========================================="
echo "  🔍 NexusVPN Services Status"
echo "========================================="
echo ""

echo "📊 PostgreSQL:"
systemctl status postgresql --no-pager -l | head -5
echo ""

echo "📊 PM2 (Backend):"
pm2 list
echo ""

echo "📊 Frontend (Vite):"
ps aux | grep -E "vite|node.*5173" | grep -v grep || echo "❌ Frontend not running"
echo ""

echo "📊 Backend Port (3000):"
netstat -tlnp | grep 3000 || echo "❌ Backend not listening on port 3000"
echo ""

echo "📊 Frontend Port (5173):"
netstat -tlnp | grep 5173 || echo "❌ Frontend not listening on port 5173"
echo ""

echo "========================================="
echo "  ✅ Auto-Start Status"
echo "========================================="
echo ""

echo "PostgreSQL enabled on boot:"
systemctl is-enabled postgresql
echo ""

echo "PM2 enabled on boot:"
pm2 startup | grep -q "PM2" && echo "✅ PM2 startup configured" || echo "⚠️  PM2 startup not configured"
echo ""

