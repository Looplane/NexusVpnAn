# NexusVPN

A production-ready, self-hosted VPN management platform with a premium SaaS-like UI. Built with WireGuard®, NestJS, and React.

## 🏗️ Project Structure (Monorepo)

- **`frontend/`**: React + Vite + Tailwind (User Dashboard & Admin Panel)
- **`backend/`**: NestJS + TypeORM + PostgreSQL (API Server)
- **`mobile/`**: React Native + Expo (iOS/Android App)
- **`infrastructure/`**: Deployment scripts and configurations

## ✨ Features

- 🔐 JWT Authentication with 2FA (TOTP)
- 🌍 Multi-location VPN server management
- 📱 Cross-platform (Web, iOS, Android)
- 🔑 Real WireGuard key generation (Curve25519)
- 🚀 SSH automation for remote server provisioning
- 📊 Real-time analytics and monitoring
- 💳 Stripe integration (ready for monetization)

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- Windows 10/11 (or WSL2)

### 1. Clone & Install
```powershell
git clone https://github.com/Looplane/NexusVpnAn.git
cd nexusvpn
npm install
cd backend && npm install
cd ../mobile && npm install
```

### 2. Database Setup
```powershell
# Create database
psql -U postgres -c "CREATE DATABASE nexusvpn;"

# Run migrations
psql -U postgres -d nexusvpn -f setup_db.sql
```

### 3. Start All Services
```powershell
./start-all.ps1
```

This opens:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Mobile**: Expo Dev Server

## ☁️ Cloud Deployment

**✅ Ready for Production Deployment!**

Deploy to cloud platforms with minimal configuration:

- **Database**: Supabase (PostgreSQL)
- **Backend**: Render (auto-detects `render.yaml`)
- **Frontend**: Vercel (uses `vercel.json`)

### Quick Start
```bash
# Automated deployment guide
./infrastructure/deploy-to-cloud.sh

# Or follow the step-by-step guide
# See: --DOCUMENTATIONS--/06-Deployment/05-DEP-Quick_Cloud_Deployment_17-12-2025_024425.md
```

### Documentation
- **Quick Guide**: [`05-DEP-Quick_Cloud_Deployment`](./--DOCUMENTATIONS--/06-Deployment/05-DEP-Quick_Cloud_Deployment_17-12-2025_024425.md) - 5-step deployment
- **Detailed Guide**: [`30-DEP-Cloud_Deployment`](./--DOCUMENTATIONS--/06-Deployment/30-DEP-Cloud_Deployment_17-12-2025_032824.md) - Complete instructions
- **Post-Deployment**: [`04-DEP-Post_Deployment_Guide`](./--DOCUMENTATIONS--/06-Deployment/04-DEP-Post_Deployment_Guide_17-12-2025_024425.md) - Testing & troubleshooting
- **Checklist**: [`27-DEP-Deployment_Checklist`](./--DOCUMENTATIONS--/06-Deployment/27-DEP-Deployment_Checklist_17-12-2025_032824.md) - Deployment checklist

## 🤖 AI Agents & MCP Integration

This project includes comprehensive AI agent configurations and Model Context Protocol (MCP) integration:

- **AI Agents**: [`agents/`](./agents/) - Universal AI agent registry
- **MCP Servers**: [`mcp-servers/`](./mcp-servers/) - Supabase & Render integration
- **Agent Docs**: [`02-GD-AI_Agents_And_MCP_Integration`](./--DOCUMENTATIONS--/04-Guides/02-GD-AI_Agents_And_MCP_Integration_17-12-2025_032824.md) - Complete setup guide

Compatible with: Cursor, Windsurf, VS Code, Trae, Google AI Studio, Anthropic Console, and more.

## 📚 Documentation

- **Project Roadmap**: [`agents/ROADMAP.md`](./agents/ROADMAP.md)
- **Current Phase**: [`agents/PHASES.md`](./agents/PHASES.md)
- **Task List**: [`agents/TODO.md`](./agents/TODO.md)
- **Complete Docs**: [`--DOCUMENTATIONS--/`](./--DOCUMENTATIONS--/) - Full documentation suite

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | NestJS, TypeORM |
| Database | PostgreSQL |
| Mobile | React Native, Expo |
| VPN | WireGuard (Curve25519) |
| Auth | JWT, TOTP (2FA) |
| Deployment | Vercel, Render, Supabase |

## 📈 Current Status

**Phase 3: The Wire** (60% Complete)
- ✅ Real WireGuard key generation
- ✅ SSH service with retry logic
- ✅ VPS provisioning scripts
- ✅ Cloud deployment configuration
- ✅ CI/CD pipeline
- 🔲 Live VPS testing

## 📄 License

Proprietary - All Rights Reserved

---

*Built with ❤️ for privacy and security*
