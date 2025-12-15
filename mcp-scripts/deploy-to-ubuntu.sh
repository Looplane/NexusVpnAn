#!/bin/bash

# Ubuntu Server Deployment Script for Hetzner VPS
# This script connects to your Ubuntu server and runs the setup

set -e

# Configuration
SERVER_IP="5.161.91.222"
SSH_USER="root"
SSH_PASS="#HaseebChaChu02110@"
LOCAL_SCRIPT_PATH="g:\\VPN-PROJECT-2025\\nexusvpn\\mcp-scripts\\ubuntu-dev-environment-setup.sh"
REMOTE_SCRIPT_PATH="/tmp/ubuntu-dev-environment-setup.sh"

echo "🚀 Ubuntu Server Deployment Script"
echo "📝 Server: $SERVER_IP"
echo "👤 User: $SSH_USER"
echo ""

# Function to check if sshpass is available
check_sshpass() {
    if ! command -v sshpass &> /dev/null; then
        echo "📦 Installing sshpass for automated SSH connections..."
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo apt-get install -y sshpass
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            brew install hudochenkov/sshpass/sshpass
        else
            echo "❌ Please install sshpass manually for your operating system"
            exit 1
        fi
    fi
}

# Function to copy and execute script on remote server
deploy_to_server() {
    echo "📤 Copying setup script to server..."
    
    # Copy script to server using scp with password
    sshpass -p "$SSH_PASS" scp -o StrictHostKeyChecking=no "$LOCAL_SCRIPT_PATH" "$SSH_USER@$SERVER_IP:$REMOTE_SCRIPT_PATH"
    
    echo "🔧 Making script executable on server..."
    sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no "$SSH_USER@$SERVER_IP" "chmod +x $REMOTE_SCRIPT_PATH"
    
    echo "⚙️  Running setup script on server..."
    echo "📝 This will take approximately 15-30 minutes..."
    echo ""
    
    # Execute script on server
    sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no "$SSH_USER@$SERVER_IP" "sudo $REMOTE_SCRIPT_PATH"
    
    echo "✅ Setup completed successfully!"
}

# Function to show manual deployment instructions
show_manual_instructions() {
    echo "📋 Manual Deployment Instructions:"
    echo ""
    echo "1. Connect to your Ubuntu server:"
    echo "   ssh root@$SERVER_IP"
    echo "   (password: $SSH_PASS)"
    echo ""
    echo "2. Download the setup script:"
    echo "   wget https://raw.githubusercontent.com/your-repo/ubuntu-dev-environment-setup.sh"
    echo ""
    echo "3. Make it executable:"
    echo "   chmod +x ubuntu-dev-environment-setup.sh"
    echo ""
    echo "4. Run the script:"
    echo "   sudo ./ubuntu-dev-environment-setup.sh"
    echo ""
    echo "5. Follow the on-screen instructions"
    echo ""
}

# Function to create Windows batch file for deployment
create_windows_batch() {
    cat > deploy-to-ubuntu.bat <<EOF
@echo off
echo Ubuntu Server Deployment Script
echo Server: $SERVER_IP
echo User: $SSH_USER
echo.
echo This batch file will help you deploy to Ubuntu server
echo.
echo Option 1: Using Windows Subsystem for Linux (WSL)
echo Option 2: Using Git Bash
echo Option 3: Using PuTTY (manual)
echo.
echo For automated deployment, please use WSL or Git Bash
echo and install sshpass: apt-get install sshpass
echo.
echo Manual steps:
echo 1. Copy ubuntu-dev-environment-setup.sh to server
echo 2. Connect via SSH: ssh root@$SERVER_IP
echo 3. Run: chmod +x ubuntu-dev-environment-setup.sh
echo 4. Run: sudo ./ubuntu-dev-environment-setup.sh
echo.
pause
EOF
    
    echo "✅ Windows batch file created: deploy-to-ubuntu.bat"
}

# Main menu
show_menu() {
    echo "Ubuntu Server Deployment Options:"
    echo ""
    echo "1. Automated Deployment (requires sshpass)"
    echo "2. Manual Deployment Instructions"
    echo "3. Create Windows Batch File"
    echo "4. Exit"
    echo ""
    read -p "Select option (1-4): " choice
    
    case $choice in
        1)
            check_sshpass
            deploy_to_server
            ;;
        2)
            show_manual_instructions
            ;;
        3)
            create_windows_batch
            ;;
        4)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            show_menu
            ;;
    esac
}

# Check if script is being run on Windows
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo "🪟 Windows detected. Creating deployment helper files..."
    create_windows_batch
    echo ""
    echo "📋 Manual Deployment Instructions:"
    show_manual_instructions
else
    show_menu
fi