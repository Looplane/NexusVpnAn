# Ubuntu Server Deployment Helper for Windows
# This script helps deploy the Ubuntu setup to your Hetzner VPS

param(
    [string]$ServerIP = "5.161.91.222",
    [string]$Username = "root",
    [string]$Password = "#HaseebChaChu02110@",
    [string]$ScriptPath = "g:\VPN-PROJECT-2025\nexusvpn\mcp-scripts\ubuntu-dev-environment-setup.sh"
)

Write-Host "🚀 Ubuntu Server Deployment Helper" -ForegroundColor Green
Write-Host "📝 Server: $ServerIP" -ForegroundColor Yellow
Write-Host "👤 User: $Username" -ForegroundColor Yellow
Write-Host ""

function Show-Menu {
    Write-Host "Ubuntu Server Deployment Options:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Manual Deployment Instructions" -ForegroundColor White
    Write-Host "2. Using PuTTY Instructions" -ForegroundColor White
    Write-Host "3. Using Windows Terminal/SSH" -ForegroundColor White
    Write-Host "4. Create Deployment Files" -ForegroundColor White
    Write-Host "5. Exit" -ForegroundColor White
    Write-Host ""
}

function Show-ManualInstructions {
    Write-Host "📋 Manual Deployment Instructions:" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. Connect to your Ubuntu server using your preferred SSH client:" -ForegroundColor Yellow
    Write-Host "   Server: $ServerIP" -ForegroundColor White
    Write-Host "   Username: $Username" -ForegroundColor White
    Write-Host "   Password: $Password" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Once connected, download the setup script:" -ForegroundColor Yellow
    Write-Host "   wget -O ubuntu-setup.sh https://raw.githubusercontent.com/your-repo/ubuntu-dev-environment-setup.sh" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Make it executable:" -ForegroundColor Yellow
    Write-Host "   chmod +x ubuntu-setup.sh" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Run the script:" -ForegroundColor Yellow
    Write-Host "   sudo ./ubuntu-setup.sh" -ForegroundColor White
    Write-Host ""
    Write-Host "5. The script will run for 15-30 minutes and install everything." -ForegroundColor Yellow
    Write-Host ""
}

function Show-PuTTYInstructions {
    Write-Host "🔧 PuTTY Deployment Instructions:" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. Download and install PuTTY from: https://www.putty.org/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "2. Configure PuTTY connection:" -ForegroundColor Yellow
    Write-Host "   Host Name: $ServerIP" -ForegroundColor White
    Write-Host "   Port: 22" -ForegroundColor White
    Write-Host "   Connection type: SSH" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Save the session for future use" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "4. Connect and login with credentials:" -ForegroundColor Yellow
    Write-Host "   Username: $Username" -ForegroundColor White
    Write-Host "   Password: $Password" -ForegroundColor White
    Write-Host ""
    Write-Host "5. Follow the manual deployment steps after connecting" -ForegroundColor Yellow
    Write-Host ""
}

function Show-SSHInstructions {
    Write-Host "💻 Windows Terminal/SSH Instructions:" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. Open Windows Terminal or Command Prompt" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "2. Connect using built-in SSH:" -ForegroundColor Yellow
    Write-Host "   ssh $Username@$ServerIP" -ForegroundColor White
    Write-Host ""
    Write-Host "3. When prompted for password, enter: $Password" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "4. Follow the manual deployment steps after connecting" -ForegroundColor Yellow
    Write-Host ""
}

function Create-DeploymentFiles {
    Write-Host "📁 Creating deployment files..." -ForegroundColor Green
    
    # Create batch file for easy access
    $batchContent = @"
@echo off
echo Ubuntu Server Deployment Helper
echo Server: $ServerIP
echo User: $Username
echo.
echo Starting SSH connection...
ssh $Username@$ServerIP
echo.
echo If SSH is not recognized, please install OpenSSH or use PuTTY
echo.
pause
"@
    
    $batchContent | Out-File -FilePath "deploy-to-ubuntu.bat" -Encoding ASCII
    Write-Host "✅ Created deploy-to-ubuntu.bat" -ForegroundColor Green
    
    # Create PowerShell script
    $psContent = @"
# Ubuntu Server Deployment Script
`$ServerIP = "$ServerIP"
`$Username = "$Username"
`$Password = "$Password"

Write-Host "Connecting to Ubuntu server..."
Write-Host "Server: `$ServerIP"
Write-Host "User: `$Username"

# Start SSH connection
ssh `$Username@`$ServerIP
"@
    
    $psContent | Out-File -FilePath "deploy-to-ubuntu.ps1" -Encoding ASCII
    Write-Host "✅ Created deploy-to-ubuntu.ps1" -ForegroundColor Green
    
    # Create instructions file
    $instructionsContent = @"
Ubuntu Server Deployment Instructions
=====================================

Server Information:
- IP Address: $ServerIP
- Username: $Username
- Password: $Password

Quick Start:
1. Double-click deploy-to-ubuntu.bat to connect via SSH
2. Or use: ssh $Username@$ServerIP
3. Once connected, follow the manual deployment steps

Manual Deployment Steps:
1. Download setup script: wget -O setup.sh [URL]
2. Make executable: chmod +x setup.sh
3. Run: sudo ./setup.sh

Web Panels (after setup):
- Cockpit: https://$ServerIP:9090
- aaPanel: http://$ServerIP:7800

Database Access:
- MongoDB: mongodb://nexusvpn:NexusVPN_MongoDB_2024!@$ServerIP:27017/
- Redis: redis://:Redis_Secure_Password_2024!@$ServerIP:6379/
- MySQL: mysql://root:MySQL_Root_Password_2024!@$ServerIP:3306/
- PostgreSQL: postgresql://nexusvpn:NexusVPN_PostgreSQL_2024!@$ServerIP:5432/nexusvpn
"@
    
    $instructionsContent | Out-File -FilePath "DEPLOYMENT_INSTRUCTIONS.txt" -Encoding ASCII
    Write-Host "✅ Created DEPLOYMENT_INSTRUCTIONS.txt" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "📋 All deployment files created in current directory!" -ForegroundColor Green
    Write-Host ""
}

# Main menu loop
do {
    Show-Menu
    $choice = Read-Host "Select option (1-5)"
    
    switch ($choice) {
        "1" { Show-ManualInstructions }
        "2" { Show-PuTTYInstructions }
        "3" { Show-SSHInstructions }
        "4" { Create-DeploymentFiles }
        "5" { Write-Host "👋 Goodbye!" -ForegroundColor Green; exit }
        default { Write-Host "❌ Invalid option. Please try again." -ForegroundColor Red }
    }
    
    if ($choice -ne "5") {
        Write-Host ""
        Write-Host "Press any key to continue..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        Clear-Host
    }
} while ($choice -ne "5")