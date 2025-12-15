# MCP Integration Test Script
# This script tests the MCP servers functionality

set -e

echo "🧪 Testing MCP servers..."

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Load environment variables
if [ -f .env.mcp ]; then
    source .env.mcp
else
    echo "⚠️  .env.mcp file not found. Please create it first."
    exit 1
fi

# Function to test an MCP server
test_mcp_server() {
    local server_name=$1
    local server_path="mcp-servers/$server_name/dist/index.js"
    local test_command=$2
    
    echo "Testing $server_name MCP server..."
    
    if [ ! -f "$server_path" ]; then
        echo "❌ Server not built. Please run install-mcp.sh first."
        return 1
    fi
    
    # Test basic functionality
    timeout 10s node "$server_path" <<< "$test_command" > "logs/${server_name}-test.log" 2>&1 || true
    
    if grep -q "Successfully" "logs/${server_name}-test.log"; then
        echo "✅ $server_name MCP server is working"
    else
        echo "❌ $server_name MCP server test failed"
        echo "Check logs/${server_name}-test.log for details"
        return 1
    fi
}

# Create logs directory
mkdir -p logs

echo "Testing Supabase MCP server connection..."
test_mcp_server "supabase-mcp" '{"method":"tools/call","params":{"name":"test_connection"}}'

echo "Testing Render MCP server connection..."
test_mcp_server "render-mcp" '{"method":"tools/call","params":{"name":"test_render_connection"}}'

echo ""
echo "🎉 MCP server tests completed!"
echo "Check logs/ directory for detailed test results."