#!/bin/bash

# MCP Servers Development Script
# This script runs all MCP servers in development mode for testing

set -e

echo "🚀 Starting MCP servers in development mode..."

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Load environment variables
if [ -f .env.mcp ]; then
    echo "Loading environment variables from .env.mcp..."
    source .env.mcp
else
    echo "⚠️  .env.mcp file not found. Please create it first."
    echo "Copy .env.mcp.example to .env.mcp and update with your credentials."
    exit 1
fi

# Create logs directory
mkdir -p logs

# Function to start an MCP server in development mode
start_dev_server() {
    local server_name=$1
    local server_dir="mcp-servers/$server_name"
    local log_file="logs/${server_name}-dev.log"
    
    echo "🔄 Starting $server_name in development mode..."
    
    if [ ! -d "$server_dir" ]; then
        echo "❌ Directory $server_dir not found"
        return 1
    fi
    
    cd "$server_dir"
    
    # Start the server in background and log output
    npm run dev > "../../$log_file" 2>&1 &
    local pid=$!
    
    echo "$server_name development server started (PID: $pid)"
    echo "Logs: $log_file"
    
    # Return to project root
    cd "$PROJECT_ROOT"
    
    # Store PID for later cleanup
    echo $pid > "logs/${server_name}-pid.txt"
}

# Start Supabase MCP server
echo "Starting Supabase MCP development server..."
start_dev_server "supabase-mcp"

# Start Render MCP server  
echo "Starting Render MCP development server..."
start_dev_server "render-mcp"

echo ""
echo "🎉 All MCP servers started in development mode!"
echo ""
echo "To view logs:"
echo "  Supabase: tail -f logs/supabase-mcp-dev.log"
echo "  Render: tail -f logs/render-mcp-dev.log"
echo ""
echo "To stop all servers:"
echo "  ./mcp-scripts/stop-dev.sh"
echo ""
echo "The servers are now ready for testing and development."

# Keep script running
wait