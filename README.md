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

See [`CLOUD_DEPLOYMENT.md`](./CLOUD_DEPLOYMENT.md) for production deployment to:
- **Database**: Supabase
- **Backend**: Render/Railway
- **Frontend**: Vercel

## 📚 Documentation

- **Project Roadmap**: [`frontend/pages/My-AGENTS/ROADMAP.md`](./frontend/pages/My-AGENTS/ROADMAP.md)
- **Current Phase**: [`frontend/pages/My-AGENTS/PHASES.md`](./frontend/pages/My-AGENTS/PHASES.md)
- **Task List**: [`frontend/pages/My-AGENTS/TODO.md`](./frontend/pages/My-AGENTS/TODO.md)

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

**Phase 3: The Wire** (40% Complete)
- ✅ Real WireGuard key generation
- ✅ SSH service with retry logic
- ✅ VPS provisioning scripts
- 🔲 Live VPS testing
- 🔲 Cloud deployment

## 📄 License

Proprietary - All Rights Reserved

---

*Built with ❤️ for privacy and security*
