# MCP Configuration Setup Wizard (PowerShell)
# This script guides you through setting up your MCP configuration on Windows

Write-Host "🚀 MCP Configuration Setup Wizard" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "This wizard will help you set up the required API keys for your MCP servers." -ForegroundColor Yellow
Write-Host ""

# Check if .env.mcp exists, create if not
if (-not (Test-Path ".env.mcp")) {
    Write-Host "Creating .env.mcp file..." -ForegroundColor Yellow
    Copy-Item ".env.mcp.example" ".env.mcp"
}

# Backup existing config
if (Test-Path ".env.mcp") {
    Copy-Item ".env.mcp" ".env.mcp.backup" -Force
    Write-Host "✅ Backed up existing configuration to .env.mcp.backup" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔑 SUPABASE CONFIGURATION" -ForegroundColor Cyan
Write-Host "-------------------------" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your Supabase project URL is: https://xorjbccyuinebimlxblu.supabase.co" -ForegroundColor White
Write-Host ""
Write-Host "To get your API keys:" -ForegroundColor Yellow
Write-Host "1. Go to: https://app.supabase.com/project/xorjbccyuinebimlxblu/settings/api" -ForegroundColor White
Write-Host "2. Copy the 'anon public' key" -ForegroundColor White
Write-Host "3. Copy the 'service_role' key (for admin operations)" -ForegroundColor White
Write-Host ""

$SUPABASE_URL = "https://xorjbccyuinebimlxblu.supabase.co"
$SUPABASE_KEY = Read-Host "Enter your Supabase anon key"
$SUPABASE_SERVICE_KEY = Read-Host "Enter your Supabase service_role key"

Write-Host ""
Write-Host "🔑 RENDER CONFIGURATION" -ForegroundColor Cyan
Write-Host "----------------------" -ForegroundColor Cyan
Write-Host ""
Write-Host "To get your Render API key:" -ForegroundColor Yellow
Write-Host "1. Go to: https://dashboard.render.com/account/api-keys" -ForegroundColor White
Write-Host "2. Create a new API key if you do not have one" -ForegroundColor White
Write-Host "3. Copy the API key (starts with 'rnd_')" -ForegroundColor White
Write-Host ""
Write-Host "To get your service ID:" -ForegroundColor Yellow
Write-Host "1. Go to: https://dashboard.render.com" -ForegroundColor White
Write-Host "2. Find your NexusVPN service" -ForegroundColor White
Write-Host "3. Copy the service ID from the URL or service settings" -ForegroundColor White
Write-Host ""

$RENDER_API_KEY = Read-Host "Enter your Render API key"
$RENDER_SERVICE_ID = Read-Host "Enter your Render service ID"

Write-Host ""
Write-Host "📝 Creating configuration file..." -ForegroundColor Yellow

# Create new .env.mcp file
$content = "# Supabase Configuration`n"
$content += "SUPABASE_URL=$SUPABASE_URL`n"
$content += "SUPABASE_KEY=$SUPABASE_KEY`n"
$content += "SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY`n"
$content += "`n"
$content += "# Render Configuration`n"
$content += "RENDER_API_KEY=$RENDER_API_KEY`n"
$content += "RENDER_SERVICE_ID=$RENDER_SERVICE_ID`n"

$content | Out-File -FilePath ".env.mcp" -Encoding UTF8

Write-Host "✅ Configuration file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Configuration Summary:" -ForegroundColor Cyan
Write-Host "------------------------" -ForegroundColor Cyan
Write-Host "Supabase URL: $SUPABASE_URL" -ForegroundColor White
if ($SUPABASE_KEY) {
    Write-Host "Supabase Key: $($SUPABASE_KEY.Substring(0, [Math]::Min(10, $SUPABASE_KEY.Length)))..." -ForegroundColor White
}
if ($RENDER_API_KEY) {
    Write-Host "Render API Key: $($RENDER_API_KEY.Substring(0, [Math]::Min(10, $RENDER_API_KEY.Length)))..." -ForegroundColor White
}
Write-Host "Render Service ID: $RENDER_SERVICE_ID" -ForegroundColor White
Write-Host ""

# Test configuration
if ($SUPABASE_KEY -and $RENDER_API_KEY) {
    Write-Host "✅ Configuration appears complete" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Test the MCP servers: npm run mcp:test" -ForegroundColor White
    Write-Host "2. Start development mode: npm run mcp:dev" -ForegroundColor White
    Write-Host "3. Use MCP tools to manage your deployment" -ForegroundColor White
} else {
    Write-Host "⚠️  Some configuration values are missing" -ForegroundColor Yellow
    Write-Host "Please update .env.mcp with the missing values" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Setup complete! Your MCP servers are ready to use." -ForegroundColor Green