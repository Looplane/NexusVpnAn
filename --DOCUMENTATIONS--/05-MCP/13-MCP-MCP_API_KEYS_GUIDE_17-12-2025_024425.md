# API Keys and Configuration Setup Guide

This guide will help you gather all the required API keys and configuration details for the MCP servers.

## 🔑 Required API Keys

### 1. Supabase Configuration

#### Get Supabase URL and Keys:
1. **Go to your Supabase Dashboard**: https://app.supabase.com
2. **Select your project** (xorjbccyuinebimlxblu)
3. **Click on Settings** (gear icon in left sidebar)
4. **Click on API** in the settings menu
5. **Copy these values**:
   - **Project URL**: `https://xorjbccyuinebimlxblu.supabase.co`
   - **anon public**: Your anon key (starts with `eyJ`)
   - **service_role**: Your service role key (for admin operations)

#### Required Environment Variables:
```bash
SUPABASE_URL=https://xorjbccyuinebimlxblu.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

### 2. Render Configuration

#### Get Render API Key:
1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click on Account Settings** (top right corner)
3. **Click on API Keys** in the left menu
4. **Create New API Key** if you don't have one
5. **Copy the API Key** (starts with `rnd_`)

#### Get Service ID:
1. **Go to your Render Dashboard**: https://dashboard.render.com
2. **Find your NexusVPN service** in the services list
3. **Click on the service name**
4. **Copy the Service ID** from the URL or service settings
5. **Service ID format**: Usually looks like `srv-xxxxxxxxxxxxxxxxxxxxx`

#### Required Environment Variables:
```bash
RENDER_API_KEY=rnd_your-api-key-here
RENDER_SERVICE_ID=srv-your-service-id-here
```

## 📝 Step-by-Step Configuration

### Step 1: Create Environment File
```bash
cp .env.mcp.example .env.mcp
```

### Step 2: Edit .env.mcp
Open the file and replace the placeholder values:

```bash
# Supabase Configuration
SUPABASE_URL=https://xorjbccyuinebimlxblu.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvcmpiY2N5dWluZWJpbWx4Ymx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MzU1NjksImV4cCI6MjA4MTMxMTU2OX0.nYPfU9o3uJ3r8lefPgQSb1Jg-y7A8bYJkTvXQ8ieCMM
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Render Configuration
RENDER_API_KEY=rnd_your-render-api-key-here
RENDER_SERVICE_ID=srv-your-nexusvpn-service-id-here
```

### Step 3: Verify Configuration
Test your configuration:
```bash
# Test Supabase connection
node mcp-servers/supabase-mcp/dist/index.js

# Test Render connection
node mcp-servers/render-mcp/dist/index.js
```

## 🔍 Finding Your Specific Details

### For Supabase:
- **Project URL**: Already known - `https://xorjbccyuinebimlxblu.supabase.co`
- **Anon Key**: Get from Supabase dashboard → Settings → API → anon public
- **Service Role Key**: Same location, but "service_role" (keep this secret!)

### For Render:
- **API Key**: Create at https://dashboard.render.com/account/api-keys
- **Service ID**: Find your service at https://dashboard.render.com, click on it, copy ID from URL

## 🚨 Important Notes

1. **Keep API keys secret** - Never commit them to version control
2. **Service role key** is powerful - only use for admin operations
3. **Render API key** should have appropriate permissions for your needs
4. **Test connections** before using in production

## 🧪 Testing Your Configuration

After setting up your API keys, test the integration:

```bash
# Test Supabase MCP
npm run mcp:test

# Or manually test each server:
cd mcp-servers/supabase-mcp && npm run dev
cd ../render-mcp && npm run dev
```

## 📋 Troubleshooting

### "Invalid API key" errors:
- Double-check you copied the entire key
- Ensure there are no extra spaces or line breaks
- Verify the key is active (not revoked)

### "Service not found" errors:
- Verify the service ID is correct
- Ensure the service exists in your Render account
- Check that the API key has access to the service

### Connection timeouts:
- Check your internet connection
- Verify firewall settings
- Ensure services are accessible from your network

## 🔗 Quick Links

- **Supabase Dashboard**: https://app.supabase.com/project/xorjbccyuinebimlxblu/settings/api
- **Render Dashboard**: https://dashboard.render.com
- **Render API Keys**: https://dashboard.render.com/account/api-keys

Need help finding any of these details? Let me know which service you're having trouble with!