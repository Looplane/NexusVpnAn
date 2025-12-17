# NexusVPN APK Build Script
# This script will guide you through building the APK

Write-Host "`n=== NexusVPN APK Build Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if EAS CLI is installed
Write-Host "Checking EAS CLI..." -ForegroundColor Yellow
$easInstalled = Get-Command eas -ErrorAction SilentlyContinue

if (-not $easInstalled) {
    Write-Host "EAS CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g eas-cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install EAS CLI. Please install manually: npm install -g eas-cli" -ForegroundColor Red
        exit 1
    }
}

# Check if logged in
Write-Host "`nChecking Expo login status..." -ForegroundColor Yellow
$loginStatus = eas whoami 2>&1

if ($loginStatus -match "Not logged in") {
    Write-Host "`nYou need to login to Expo first." -ForegroundColor Yellow
    Write-Host "Please run: eas login" -ForegroundColor Cyan
    Write-Host "Then run this script again." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Starting login process..." -ForegroundColor Yellow
    eas login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Login failed. Please try again." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Logged in as: $loginStatus" -ForegroundColor Green
}

# Generate assets if missing
Write-Host "`nChecking assets..." -ForegroundColor Yellow
if (-not (Test-Path "assets\icon.png")) {
    Write-Host "Generating placeholder assets..." -ForegroundColor Yellow
    node generate-assets-simple.js
}

# Build APK
Write-Host "`nStarting APK build..." -ForegroundColor Yellow
Write-Host "This will take 5-15 minutes. Please wait..." -ForegroundColor Cyan
Write-Host ""

eas build --platform android --profile preview

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Build started successfully!" -ForegroundColor Green
    Write-Host "Check your build status at: https://expo.dev" -ForegroundColor Cyan
    Write-Host "You'll receive a notification when the build is complete." -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Build failed. Please check the error messages above." -ForegroundColor Red
}

