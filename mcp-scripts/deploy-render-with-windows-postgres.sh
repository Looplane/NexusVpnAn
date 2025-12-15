#!/bin/bash
# 🚀 Deploy NexusVPN to Render with Windows Server 2019 PostgreSQL
# This script handles the complete deployment process

echo "🚀 NexusVPN Render Deployment with Windows Server 2019 PostgreSQL"
echo "================================================================"
echo ""

# Configuration
RENDER_SERVICE_ID=""
POSTGRES_HOST="91.99.23.239"
POSTGRES_PORT="5432"
POSTGRES_USER="postgres"
POSTGRES_DB="nexusvpn"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to test PostgreSQL connection
test_postgres_connection() {
    print_status "Testing connection to Windows Server 2019 PostgreSQL..."
    
    cd g:\VPN-PROJECT-2025\nexusvpn\backend
    
    # Run the connection test
    node test-your-postgres-connection.js
    
    if [ $? -eq 0 ]; then
        print_success "PostgreSQL connection test passed!"
        return 0
    else
        print_error "PostgreSQL connection test failed!"
        return 1
    fi
}

# Function to get Render service info
get_render_service_info() {
    print_status "Getting Render service information..."
    
    if [ -z "$RENDER_SERVICE_ID" ]; then
        print_warning "No Render service ID provided. Please provide your Render service ID."
        echo "You can find your service ID in the Render dashboard URL:"
        echo "https://dashboard.render.com/web/[SERVICE_ID]"
        echo ""
        read -p "Enter your Render service ID: " RENDER_SERVICE_ID
    fi
    
    # Test Render connection using MCP
    cd g:\VPN-PROJECT-2025\nexusvpn
    
    if [ -f "mcp-servers/render-mcp/test_render_connection.js" ]; then
        node mcp-servers/render-mcp/test_render_connection.js
        if [ $? -eq 0 ]; then
            print_success "Render API connection successful!"
        else
            print_error "Render API connection failed!"
            return 1
        fi
    else
        print_warning "Render MCP server not found, skipping API test"
    fi
    
    return 0
}

# Function to update Render environment variables
update_render_env_vars() {
    print_status "Updating Render environment variables..."
    
    # Get PostgreSQL password from user
    read -sp "Enter your PostgreSQL password: " POSTGRES_PASSWORD
    echo ""
    
    # Environment variables to set
    ENV_VARS="USE_YOUR_POSTGRES=true,YOUR_DB_HOST=${POSTGRES_HOST},YOUR_DB_PORT=${POSTGRES_PORT},YOUR_DB_USER=${POSTGRES_USER},YOUR_DB_PASSWORD=${POSTGRES_PASSWORD},YOUR_DB_NAME=${POSTGRES_DB}"
    
    # Update using MCP Render server
    if [ -f "mcp-servers/render-mcp/update_env_vars.js" ]; then
        print_status "Using MCP Render server to update environment variables..."
        node mcp-servers/render-mcp/update_env_vars.js \
            --service-id "${RENDER_SERVICE_ID}" \
            --env-vars "${ENV_VARS}"
        
        if [ $? -eq 0 ]; then
            print_success "Environment variables updated successfully!"
            return 0
        else
            print_error "Failed to update environment variables via MCP"
            return 1
        fi
    else
        print_warning "MCP Render server not found. Please update environment variables manually:"
        echo "Go to: https://dashboard.render.com/web/${RENDER_SERVICE_ID}/settings"
        echo "Add these environment variables:"
        echo "  USE_YOUR_POSTGRES=true"
        echo "  YOUR_DB_HOST=${POSTGRES_HOST}"
        echo "  YOUR_DB_PORT=${POSTGRES_PORT}"
        echo "  YOUR_DB_USER=${POSTGRES_USER}"
        echo "  YOUR_DB_PASSWORD=********"
        echo "  YOUR_DB_NAME=${POSTGRES_DB}"
        echo ""
        read -p "Press Enter after you've updated the environment variables manually..."
        return 0
    fi
}

# Function to trigger deployment
trigger_deployment() {
    print_status "Triggering deployment on Render..."
    
    # Trigger deployment using MCP
    if [ -f "mcp-servers/render-mcp/trigger_deploy.js" ]; then
        node mcp-servers/render-mcp/trigger_deploy.js \
            --service-id "${RENDER_SERVICE_ID}"
        
        if [ $? -eq 0 ]; then
            print_success "Deployment triggered successfully!"
            return 0
        else
            print_error "Failed to trigger deployment via MCP"
            return 1
        fi
    else
        print_warning "MCP Render server not found. Please trigger deployment manually:"
        echo "Go to: https://dashboard.render.com/web/${RENDER_SERVICE_ID}"
        echo "Click 'Manual Deploy' -> 'Deploy latest commit'"
        echo ""
        read -p "Press Enter after you've triggered the deployment manually..."
        return 0
    fi
}

# Function to monitor deployment
monitor_deployment() {
    print_status "Monitoring deployment status..."
    
    if [ -f "mcp-servers/render-mcp/get_service_info.js" ]; then
        print_status "Checking deployment status..."
        
        # Check status multiple times
        for i in {1..10}; do
            echo "Check $i/10..."
            node mcp-servers/render-mcp/get_service_info.js \
                --service-id "${RENDER_SERVICE_ID}"
            
            if [ $? -eq 0 ]; then
                print_success "Service is running!"
                return 0
            fi
            
            echo "Waiting 30 seconds before next check..."
            sleep 30
        done
        
        print_warning "Deployment monitoring completed. Check Render dashboard for final status."
    else
        print_warning "MCP Render server not found. Please monitor deployment manually:"
        echo "Go to: https://dashboard.render.com/web/${RENDER_SERVICE_ID}"
        echo "Check the 'Events' tab for deployment status"
    fi
    
    return 0
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Get service info
    if [ -f "mcp-servers/render-mcp/get_service_info.js" ]; then
        node mcp-servers/render-mcp/get_service_info.js \
            --service-id "${RENDER_SERVICE_ID}"
    fi
    
    # Get service URL
    print_status "Getting service URL..."
    SERVICE_URL=$(node -e "
        const config = require('./mcp-servers/render-mcp/config.js');
        const renderAPI = require('./mcp-servers/render-mcp/render-api.js');
        
        renderAPI.getService('${RENDER_SERVICE_ID}')
            .then(service => {
                console.log(service.service.serviceDetails.url);
            })
            .catch(err => {
                console.error('Error:', err.message);
                process.exit(1);
            });
    " 2>/dev/null)
    
    if [ -n "$SERVICE_URL" ]; then
        print_success "Service URL: ${SERVICE_URL}"
        
        # Test health endpoint
        print_status "Testing health endpoint..."
        if curl -s "${SERVICE_URL}/health" | grep -q "ok"; then
            print_success "Health endpoint is responding!"
        else
            print_warning "Health endpoint test failed or took too long"
        fi
        
        # Test database connection
        print_status "Testing database connection..."
        if curl -s "${SERVICE_URL}/api/health/database" | grep -q "healthy"; then
            print_success "Database connection is healthy!"
        else
            print_warning "Database connection test failed or took too long"
        fi
    else
        print_warning "Could not get service URL automatically"
    fi
}

# Main deployment process
main() {
    echo "Starting deployment process..."
    echo ""
    
    # Step 1: Test PostgreSQL connection
    if ! test_postgres_connection; then
        print_error "PostgreSQL connection test failed. Please check your Windows Server 2019 configuration."
        echo ""
        echo "📋 Troubleshooting checklist:"
        echo "  1. Is PostgreSQL running on Windows Server 2019?"
        echo "  2. Is port 5432 open in Windows Firewall?"
        echo "  3. Is pg_hba.conf configured for remote connections?"
        echo "  4. Is postgresql.conf configured with listen_addresses = '*'?"
        echo ""
        echo "📖 See the complete guide:"
        echo "g:\VPN-PROJECT-2025\nexusvpn\--DOCUMENTATIONS--\05-MCP\WINDOWS_SERVER_2019_POSTGRESQL_DEPLOYMENT_GUIDE.md"
        exit 1
    fi
    
    # Step 2: Get Render service info
    if ! get_render_service_info; then
        print_error "Failed to connect to Render API"
        exit 1
    fi
    
    # Step 3: Update environment variables
    if ! update_render_env_vars; then
        print_error "Failed to update environment variables"
        exit 1
    fi
    
    # Step 4: Trigger deployment
    if ! trigger_deployment; then
        print_error "Failed to trigger deployment"
        exit 1
    fi
    
    # Step 5: Monitor deployment
    monitor_deployment
    
    # Step 6: Verify deployment
    verify_deployment
    
    echo ""
    echo "================================================================"
    print_success "🎉 Deployment process completed!"
    echo "================================================================"
    echo ""
    echo "📊 Deployment Summary:"
    echo "  • PostgreSQL Server: ${POSTGRES_HOST}:${POSTGRES_PORT}"
    echo "  • Database: ${POSTGRES_DB}"
    echo "  • User: ${POSTGRES_USER}"
    echo "  • Render Service: ${RENDER_SERVICE_ID}"
    echo ""
    echo "🔗 Next Steps:"
    echo "  1. Monitor deployment in Render dashboard"
    echo "  2. Test your API endpoints"
    echo "  3. Configure your frontend to use the new backend"
    echo "  4. Set up monitoring and alerts"
    echo ""
    echo "📖 Documentation:"
    echo "  • Windows Server Setup: g:\VPN-PROJECT-2025\nexusvpn\--DOCUMENTATIONS--\05-MCP\WINDOWS_SERVER_2019_POSTGRESQL_DEPLOYMENT_GUIDE.md"
    echo "  • MCP Configuration: g:\VPN-PROJECT-2025\nexusvpn\agents\MCP_AGENT_CONFIG.md"
    echo ""
}

# Run main function
main "$@"