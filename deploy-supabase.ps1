# NexusVPN - Supabase Database Migration Script
# Run this from your local machine with: .\deploy-supabase.ps1

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  NexusVPN Supabase Migration" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Supabase Connection Details
$SUPABASE_PROJECT = "GenziNest-NexusVPN"
# Get password from environment variable or prompt
$SUPABASE_PASSWORD = $env:SUPABASE_DB_PASSWORD
if ([string]::IsNullOrWhiteSpace($SUPABASE_PASSWORD)) {
    Write-Host "⚠️  SUPABASE_DB_PASSWORD environment variable not set." -ForegroundColor Yellow
    Write-Host "   You can set it with: `$env:SUPABASE_DB_PASSWORD = 'your-password'" -ForegroundColor Yellow
    $SUPABASE_PASSWORD = Read-Host "Enter Supabase Database Password"
}

Write-Host "Project: $SUPABASE_PROJECT" -ForegroundColor Yellow
Write-Host ""
Write-Host "Please provide your Supabase connection details:" -ForegroundColor Green
Write-Host ""

# Prompt for host
$SUPABASE_HOST = Read-Host "Enter Supabase Host (e.g., db.xxxxx.supabase.co)"

if ([string]::IsNullOrWhiteSpace($SUPABASE_HOST)) {
    Write-Host "ERROR: Host is required" -ForegroundColor Red
    exit 1
}

# Construct connection string
$CONNECTION_STRING = "postgres://postgres:$SUPABASE_PASSWORD@$SUPABASE_HOST:5432/postgres"

Write-Host ""
Write-Host "Connection String: $CONNECTION_STRING" -ForegroundColor Cyan
Write-Host ""
Write-Host "Running database migrations..." -ForegroundColor Yellow

# Run migration
try {
    psql "$CONNECTION_STRING" -f setup_db.sql
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Database migration successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Save this connection string for backend deployment:" -ForegroundColor Yellow
        Write-Host $CONNECTION_STRING -ForegroundColor Cyan
        Write-Host ""
    }
    else {
        Write-Host ""
        Write-Host "❌ Migration failed. Check the error above." -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host ""
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure PostgreSQL client (psql) is installed:" -ForegroundColor Yellow
    Write-Host "  Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    exit 1
}
