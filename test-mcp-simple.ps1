# Simple Test MCP Servers for Windows
Write-Host "🧪 Testing MCP Servers..." -ForegroundColor Green

# Load environment variables
if (Test-Path ".env.mcp") {
    Write-Host "Loading environment variables..." -ForegroundColor Yellow
    
    # Read and parse the .env.mcp file
    $envContent = Get-Content ".env.mcp" -Raw
    $envLines = $envContent -split "`n"
    
    foreach ($line in $envLines) {
        if ($line -match "^([^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    
    Write-Host "✅ Environment variables loaded" -ForegroundColor Green
} else {
    Write-Host "❌ .env.mcp file not found!" -ForegroundColor Red
    exit 1
}

# Test Supabase MCP Server
Write-Host ""
Write-Host "🔍 Testing Supabase MCP Server..." -ForegroundColor Cyan

Set-Location "mcp-servers\supabase-mcp"

Write-Host "Starting Supabase MCP server..." -ForegroundColor Yellow

# Start the server in background
$process = Start-Process -FilePath "node" -ArgumentList "dist\index.js" -NoNewWindow -PassThru

# Wait a moment for server to start
Start-Sleep -Seconds 2

# Check if process is running
if ($process -and -not $process.HasExited) {
    Write-Host "✅ Supabase MCP server is running!" -ForegroundColor Green
    
    # Kill the process
    $process.Kill()
    $process.WaitForExit()
} else {
    Write-Host "❌ Supabase MCP server failed to start" -ForegroundColor Red
}

# Test Render MCP Server
Write-Host ""
Write-Host "🔍 Testing Render MCP Server..." -ForegroundColor Cyan

Set-Location "..\render-mcp"

Write-Host "Starting Render MCP server..." -ForegroundColor Yellow

# Start the server in background
$process = Start-Process -FilePath "node" -ArgumentList "dist\index.js" -NoNewWindow -PassThru

# Wait a moment for server to start
Start-Sleep -Seconds 2

# Check if process is running
if ($process -and -not $process.HasExited) {
    Write-Host "✅ Render MCP server is running!" -ForegroundColor Green
    
    # Kill the process
    $process.Kill()
    $process.WaitForExit()
} else {
    Write-Host "❌ Render MCP server failed to start" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 MCP server testing complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Yellow
Write-Host "1. Start development servers: npm run mcp:dev" -ForegroundColor White
Write-Host "2. Use MCP tools to manage your deployment" -ForegroundColor White
Write-Host "3. Check logs in the mcp-scripts folder" -ForegroundColor White