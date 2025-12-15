#!/bin/bash

# MCP Development Servers Stop Script
# This script stops all running MCP development servers

echo "🛑 Stopping MCP development servers..."

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Function to stop a server
stop_server() {
    local server_name=$1
    local pid_file="logs/${server_name}-pid.txt"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "Stopping $server_name (PID: $pid)..."
            kill "$pid"
            rm -f "$pid_file"
            echo "✅ $server_name stopped"
        else
            echo "⚠️  $server_name is not running"
            rm -f "$pid_file"
        fi
    else
        echo "ℹ️  No PID file found for $server_name"
    fi
}

# Stop Supabase MCP server
stop_server "supabase-mcp"

# Stop Render MCP server
stop_server "render-mcp"

echo ""
echo "🎉 All MCP development servers stopped!"
echo "Log files are preserved in the logs/ directory for review."