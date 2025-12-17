# 🚀 Quick Manual Setup Guide for MCP API Keys

Since the PowerShell wizard had some issues, let's set up your API keys manually. This is actually simpler and more reliable!

## 📋 What You Need to Gather

### 1. Supabase Keys (You already have some!)
- **Project URL**: `https://xorjbccyuinebimlxblu.supabase.co` ✅ (Already known)
- **Anon Key**: Get from Supabase dashboard
- **Service Role Key**: Also from Supabase dashboard

### 2. Render Keys
- **API Key**: Get from Render dashboard
- **Service ID**: Find your NexusVPN service in Render

## 📝 Step-by-Step Instructions

### Step 1: Get Your Supabase Keys

1. **Open your browser**: Go to https://app.supabase.com
2. **Select your project**: Click on "xorjbccyuinebimlxblu"
3. **Go to Settings**: Click the gear icon (⚙️) in the left sidebar
4. **Click API**: In the settings menu
5. **Copy these keys**:
   - **anon public**: Copy the long key that starts with `eyJ`
   - **service_role**: Copy the secret key (this one is powerful!)

### Step 2: Get Your Render API Key

1. **Go to Render**: https://dashboard.render.com
2. **Account Settings**: Click your profile picture → "Account Settings"
3. **API Keys**: Click "API Keys" in the left menu
4. **Create/Copy Key**: If you don't have one, click "Create API Key"
5. **Copy the key**: It should start with `rnd_`

### Step 3: Get Your Render Service ID

1. **Render Dashboard**: https://dashboard.render.com
2. **Find Your Service**: Look for your NexusVPN backend service
3. **Get Service ID**: 
   - Click on your service name
   - Look at the URL - it should show something like `/services/srv-abc123`
   - Copy the `srv-abc123` part

## 🔧 Manual Configuration

### Step 4: Create Your .env.mcp File

1. **Open the file**: In your project folder, open `.env.mcp.example`
2. **Copy it**: Save it as `.env.mcp` (remove the `.example`)
3. **Fill in your keys**:

```bash
# Supabase Configuration
SUPABASE_URL=https://xorjbccyuinebimlxblu.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ... # Your actual anon key
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ... # Your actual service role key

# Render Configuration
RENDER_API_KEY=rnd_your_actual_render_api_key_here
RENDER_SERVICE_ID=srv_your_actual_service_id_here
```

### Step 5: Quick Test

Let's test if your configuration works:

```bash
# Test Supabase connection
cd mcp-servers/supabase-mcp
npm start

# (Press Ctrl+C to stop)

# Test Render connection
cd ../render-mcp
npm start

# (Press Ctrl+C to stop)
```

## 🎯 Quick Links to Get Started

- **Supabase Dashboard**: https://app.supabase.com/project/xorjbccyuinebimlxblu/settings/api
- **Render API Keys**: https://dashboard.render.com/account/api-keys
- **Render Services**: https://dashboard.render.com

## 🚨 Important Reminders

1. **Keep keys secret** - Never share your service_role key or Render API key
2. **Don't commit** - Make sure `.env.mcp` is in your `.gitignore`
3. **Test first** - Always test the connections before using in production

## 📞 Need Help?

If you get stuck on any step:

1. **Check the main guide**: See `MCP_API_KEYS_GUIDE.md` for detailed instructions
2. **Verify your keys**: Make sure you copied the entire keys without extra spaces
3. **Test connectivity**: Ensure you can access both Supabase and Render dashboards

Once you have your API keys, you can use the MCP tools to:
- Check your database connection
- View service logs
- Trigger deployments
- Update environment variables

Ready to get your keys? Start with Step 1 above!