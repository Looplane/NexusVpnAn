@echo off
REM MCP Configuration Helper for Windows
REM This batch file helps you set up MCP configuration

echo 🚀 MCP Configuration Helper for Windows
echo ======================================
echo.
echo This helper will guide you through setting up your MCP API keys.
echo.
echo 📋 What you need to gather:
echo.
echo 🔑 SUPABASE KEYS:
echo 1. Go to: https://app.supabase.com/project/xorjbccyuinebimlxblu/settings/api
echo 2. Copy your 'anon public' key (starts with eyJ)
echo 3. Copy your 'service_role' key (keep this secret!)
echo.
echo 🔑 RENDER KEYS:
echo 1. Go to: https://dashboard.render.com/account/api-keys
echo 2. Create/copy your API key (starts with rnd_)
echo 3. Go to: https://dashboard.render.com
echo 4. Find your NexusVPN service and copy the service ID
echo.
echo 📝 MANUAL SETUP INSTRUCTIONS:
echo 1. Open .env.mcp.example in a text editor
echo 2. Copy it to .env.mcp
echo 3. Replace the placeholder values with your actual keys
echo 4. Save the file
echo.
echo 🎯 QUICK LINKS:
echo - Supabase: https://app.supabase.com/project/xorjbccyuinebimlxblu/settings/api
echo - Render API: https://dashboard.render.com/account/api-keys
echo - Render Services: https://dashboard.render.com
echo.
echo 📖 For detailed instructions, see:
echo - MCP_API_KEYS_GUIDE.md (detailed guide)
echo - MCP_QUICK_SETUP.md (quick reference)
echo.
echo Press any key to open .env.mcp.example in notepad...
pause > nul

REM Open the example file in notepad
if exist .env.mcp.example (
    notepad .env.mcp.example
) else (
    echo ❌ .env.mcp.example not found!
    echo Please check that the file exists in your project folder.
)

echo.
echo ✅ After editing, save the file as .env.mcp
echo Then test your configuration with: npm run mcp:test
echo.
pause