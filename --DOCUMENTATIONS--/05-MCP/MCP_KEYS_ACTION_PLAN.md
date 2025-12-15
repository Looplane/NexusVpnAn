# 🎯 MCP API Keys Setup - Quick Action Plan

## ✅ What You Need to Do Right Now

### 1. Get Your API Keys (Do This First!)

**Supabase Keys** (You already know the project URL):
- **Project URL**: `https://xorjbccyuinebimlxblu.supabase.co` ✅
- **Go to**: https://app.supabase.com/project/xorjbccyuinebimlxblu/settings/api
- **Copy**: Both the "anon public" key and "service_role" key

**Render Keys**:
- **API Key**: Go to https://dashboard.render.com/account/api-keys
- **Service ID**: Find your NexusVPN service at https://dashboard.render.com

### 2. Create Your Configuration File

1. **Open**: `.env.mcp.example` in your text editor
2. **Copy**: Save it as `.env.mcp` (remove `.example`)
3. **Fill in**: Replace the placeholder values with your actual keys

### 3. Test Your Setup

```bash
# Test Supabase MCP server
cd mcp-servers/supabase-mcp && npm start

# Test Render MCP server  
cd ../render-mcp && npm start

# Or test both at once
npm run mcp:test
```

## 🔗 Direct Links to Get Your Keys

- **Supabase API Keys**: https://app.supabase.com/project/xorjbccyuinebimlxblu/settings/api
- **Render API Keys**: https://dashboard.render.com/account/api-keys
- **Render Services**: https://dashboard.render.com

## 📋 What the Keys Look Like

**Supabase Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...` (long string)
**Supabase Service Role**: Similar to anon key but more powerful
**Render API Key**: `rnd_xxxxxxxxxxxxxxxxxxxxxxxx` (starts with rnd_)
**Render Service ID**: `srv_xxxxxxxxxxxxxxxxxxxxx` (starts with srv_)

## 🚀 Once You Have Your Keys

Your `.env.mcp` file should look like this:

```bash
# Supabase Configuration
SUPABASE_URL=https://xorjbccyuinebimlxblu.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ... # Your actual key
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ... # Your actual key

# Render Configuration
RENDER_API_KEY=rnd_your_actual_render_api_key_here
RENDER_SERVICE_ID=srv_your_actual_service_id_here
```

## 🎯 Next Steps After Setup

1. **Test the servers**: `npm run mcp:test`
2. **Start development**: `npm run mcp:dev`
3. **Use MCP tools**: Check logs, trigger deployments, manage database

## 🆘 Need Help?

If you get stuck:
1. **Check the detailed guide**: See `MCP_API_KEYS_GUIDE.md`
2. **Verify your keys**: Make sure you copied the entire keys
3. **Test connectivity**: Ensure you can access both dashboards

**Ready to get your keys? Start with the Supabase dashboard link above!** 🚀