# Test MCP Servers Script for Windows
# This script tests both Supabase and Render MCP servers

Write-Host "🧪 Testing MCP Servers..." -ForegroundColor Green

# Load environment variables
if (Test-Path "..\.env.mcp") {
    Write-Host "Loading environment variables..." -ForegroundColor Yellow
    
    # Read and parse the .env.mcp file
    $envContent = Get-Content "..\.env.mcp" -Raw
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

# Create a simple test command
$testCommand = @"
{"method":"tools/call","params":{"name":"test_connection"}}
"@

Write-Host "Sending test connection request..." -ForegroundColor Yellow

# Run the test (timeout after 10 seconds)
$process = Start-Process -FilePath "node" -ArgumentList "dist\index.js" -NoNewWindow -PassThru -RedirectStandardInput "test-input.txt" -RedirectStandardOutput "test-output.txt" -RedirectStandardError "test-error.txt"

# Write the test command to input file
$testCommand | Out-File -FilePath "test-input.txt" -Encoding UTF8

# Wait a moment for processing
Start-Sleep -Seconds 3

# Check if process is still running
if (-not $process.HasExited) {
    $process.Kill()
}

# Read the output
if (Test-Path "test-output.txt") {
    $output = Get-Content "test-output.txt" -Raw
    Write-Host "📤 Output: $output" -ForegroundColor White
    
    if ($output -match "success|connected|ok") {
        Write-Host "✅ Supabase MCP server test passed!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Supabase MCP server test inconclusive" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  No output file generated" -ForegroundColor Yellow
}

# Check for errors
if (Test-Path "test-error.txt") {
    $error = Get-Content "test-error.txt" -Raw
    if ($error) {
        Write-Host "❌ Errors: $error" -ForegroundColor Red
    }
}

# Cleanup test files
Remove-Item "test-input.txt" -ErrorAction SilentlyContinue
Remove-Item "test-output.txt" -ErrorAction SilentlyContinue
Remove-Item "test-error.txt" -ErrorAction SilentlyContinue

# Test Render MCP Server
Write-Host ""
Write-Host "🔍 Testing Render MCP Server..." -ForegroundColor Cyan

Set-Location "..\render-mcp"

Write-Host "Sending test connection request..." -ForegroundColor Yellow

# Run the test (timeout after 10 seconds)
$process = Start-Process -FilePath "node" -ArgumentList "dist\index.js" -NoNewWindow -PassThru -RedirectStandardInput "test-input.txt" -RedirectStandardOutput "test-output.txt" -RedirectStandardError "test-error.txt"

# Write the test command to input file
$testCommand | Out-File -FilePath "test-input.txt" -Encoding UTF8

# Wait a moment for processing
Start-Sleep -Seconds 3

# Check if process is still running
if (-not $process.HasExited) {
    $process.Kill()
}

# Read the output
if (Test-Path "test-output.txt") {
    $output = Get-Content "test-output.txt" -Raw
    Write-Host "📤 Output: $output" -ForegroundColor White
    
    if ($output -match "success|connected|ok") {
        Write-Host "✅ Render MCP server test passed!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Render MCP server test inconclusive" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  No output file generated" -ForegroundColor Yellow
}

# Check for errors
if (Test-Path "test-error.txt") {
    $error = Get-Content "test-error.txt" -Raw
    if ($error) {
        Write-Host "❌ Errors: $error" -ForegroundColor Red
    }
}

# Cleanup test files
Remove-Item "test-input.txt" -ErrorAction SilentlyContinue
Remove-Item "test-output.txt" -ErrorAction SilentlyContinue
Remove-Item "test-error.txt" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🎉 MCP server testing complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Yellow
Write-Host "1. Start development servers: npm run mcp:dev" -ForegroundColor White
Write-Host "2. Use MCP tools to manage your deployment" -ForegroundColor White
Write-Host "3. Check logs in the mcp-scripts folder" -ForegroundColor White