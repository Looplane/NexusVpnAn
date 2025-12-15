#!/bin/bash
# Complete NexusVPN Deployment with Your PostgreSQL Server
# This script orchestrates the entire deployment process

set -e  # Exit on error

echo "🚀 NEXUSVPN DEPLOYMENT WITH YOUR POSTGRESQL SERVER"
echo "================================================="
echo "Started: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check curl
    if ! command -v curl &> /dev/null; then
        print_error "curl is not installed"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Test PostgreSQL connection
test_postgres_connection() {
    print_status "Testing PostgreSQL connection..."
    
    cd backend
    
    if node test-your-postgres-connection.js; then
        print_success "PostgreSQL connection test passed"
    else
        print_error "PostgreSQL connection test failed"
        print_error "Please ensure your PostgreSQL server is properly configured"
        print_error "See POSTGRESQL_SERVER_SETUP.md for setup instructions"
        exit 1
    fi
    
    cd ..
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    cd backend
    
    if npm install; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
    
    cd ..
}

# Build application
build_application() {
    print_status "Building application..."
    
    cd backend
    
    if npm run build; then
        print_success "Application built successfully"
    else
        print_error "Failed to build application"
        exit 1
    fi
    
    cd ..
}

# Test application locally
test_local() {
    print_status "Testing application locally..."
    
    cd backend
    
    # Start application in background
    USE_YOUR_POSTGRES=true npm run start:dev &
    LOCAL_PID=$!
    
    # Wait for application to start
    sleep 5
    
    # Test health endpoint
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_success "Local application test passed"
    else
        print_warning "Local application test failed or health endpoint not available"
    fi
    
    # Kill background process
    kill $LOCAL_PID 2>/dev/null || true
    wait $LOCAL_PID 2>/dev/null || true
    
    cd ..
}

# Deploy to Render
deploy_to_render() {
    print_status "Deploying to Render..."
    
    cd backend
    
    if node deploy-with-your-postgres.js; then
        print_success "Render deployment initiated successfully"
    else
        print_error "Render deployment failed"
        exit 1
    fi
    
    cd ..
}

# Monitor deployment
monitor_deployment() {
    print_status "Monitoring deployment..."
    print_status "Check deployment status at: https://dashboard.render.com/web/srv-d4vjm2muk2gs739fgqi0/events"
    print_status "This may take 2-5 minutes to complete..."
    
    # Wait for user to confirm deployment is complete
    echo ""
    read -p "Press Enter when deployment is complete (check Render dashboard)..." -n 1 -r
    echo ""
}

# Final verification
final_verification() {
    print_status "Performing final verification..."
    
    # Get the deployed URL (you'll need to update this with your actual URL)
    DEPLOYED_URL="https://nexusvpn-api.onrender.com"  # Update with your actual URL
    
    print_status "Testing deployed application at: $DEPLOYED_URL"
    
    if curl -f "$DEPLOYED_URL/health" > /dev/null 2>&1; then
        print_success "Deployed application is responding"
    else
        print_warning "Deployed application health check failed"
        print_warning "Please check the application logs in Render dashboard"
    fi
}

# Generate deployment report
generate_report() {
    print_status "Generating deployment report..."
    
    REPORT_FILE="deployment-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# NexusVPN Deployment Report
**Date**: $(date)
**PostgreSQL Server**: 91.99.23.239:5432
**Deploy Hook**: https://api.render.com/deploy/srv-d4vjm2muk2gs739fgqi0?key=O-4z2JK4nds

## Configuration
- Database Host: 91.99.23.239
- Database Port: 5432
- Database Name: nexusvpn
- Database User: nexusvpn
- SSL: Disabled
- Environment: Production

## Deployment Steps Completed
$(if [ -f backend/test-your-postgres-connection.js ]; then echo "✅ PostgreSQL connection test"; fi)
$(if [ -f backend/node_modules ]; then echo "✅ Dependencies installed"; fi)
$(if [ -f backend/dist ]; then echo "✅ Application built"; fi)
$(if [ -f backend/deploy-with-your-postgres.js ]; then echo "✅ Render deployment triggered"; fi)

## Next Steps
1. Monitor application logs in Render dashboard
2. Test API endpoints
3. Verify database connectivity
4. Set up monitoring and alerts

## Troubleshooting
If issues arise:
1. Check PostgreSQL server logs
2. Check Render deployment logs
3. Verify environment variables
4. Test connection scripts

## Files Created
- your-postgres-config.service.ts
- test-your-postgres-connection.js
- deploy-with-your-postgres.js
- setup-postgresql-server.sh
- DEPLOYMENT_GUIDE_YOUR_POSTGRES.md
EOF

    print_success "Deployment report generated: $REPORT_FILE"
}

# Main deployment process
main() {
    echo ""
    print_status "Starting NexusVPN deployment process..."
    echo ""
    
    # Execute deployment steps
    check_prerequisites
    test_postgres_connection
    install_dependencies
    build_application
    test_local
    deploy_to_render
    monitor_deployment
    final_verification
    generate_report
    
    echo ""
    print_success "🎉 Deployment process completed!"
    print_status "Check the deployment report for details and next steps."
    echo ""
}

# Run main function
main "$@"