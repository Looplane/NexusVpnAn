# Test MCP Supabase Server
$testCommand = '{"method":"tools/call","params":{"name":"test_connection"}}'
$testCommand | node dist\index.js | Write-Host