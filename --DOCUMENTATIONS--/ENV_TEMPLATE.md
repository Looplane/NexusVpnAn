# Environment Variables Template

This document provides comprehensive environment variable templates for different deployment scenarios.

---

## 🌐 Cloud Deployment (Render + Vercel + Supabase)

### Backend (Render) Environment Variables

```env
# Application
NODE_ENV=production
PORT=10000

# Database (Auto-configured from Render database)
DATABASE_URL=postgres://nexus:password@dpg-xxxxx-a.oregon-postgres.render.com/nexusvpn

# Authentication
JWT_SECRET=<generate-random-32-char-string>

# CORS & Frontend
FRONTEND_URL=https://nexusvpn.vercel.app
CORS_ORIGIN=https://nexusvpn.vercel.app

# SSH Configuration (Cloud deployment uses mock)
MOCK_SSH=true

# Stripe Payments (Optional - set manually in Render dashboard)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Email Service (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@nexusvpn.com
```

### Frontend (Vercel) Environment Variables

```env
# API Endpoint
VITE_API_URL=https://nexusvpn-api.onrender.com/api
```

---

## 🖥️ VPS Deployment (Ubuntu 24.04)

### Backend Environment Variables

```env
# Application
NODE_ENV=production
PORT=3000

# Database (Local PostgreSQL)
DB_HOST=localhost
DB_USER=nexusvpn
DB_PASSWORD=<generated-secure-password>
DB_NAME=nexusvpn

# Authentication
JWT_SECRET=<generate-random-32-char-string>

# CORS & Frontend
FRONTEND_URL=http://YOUR_SERVER_IP:5173
CORS_ORIGIN=http://YOUR_SERVER_IP:5173

# SSH Configuration (Real SSH for VPN nodes)
MOCK_SSH=false
SSH_PRIVATE_KEY_PATH=/opt/nexusvpn/.ssh/id_rsa
SSH_PUBLIC_KEY_PATH=/opt/nexusvpn/.ssh/id_rsa.pub

# Stripe Payments (Optional)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Email Service (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@nexusvpn.com
```

### Frontend Environment Variables

```env
# API Endpoint
VITE_API_URL=http://YOUR_SERVER_IP:3000/api
```

---

## 💻 Local Development

### Backend Environment Variables

```env
# Application
NODE_ENV=development
PORT=3000

# Database (Local PostgreSQL)
DB_HOST=localhost
DB_USER=nexus
DB_PASSWORD=secure_password_123
DB_NAME=nexusvpn

# Authentication
JWT_SECRET=local-dev-secret-key-change-in-production

# CORS & Frontend
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

# SSH Configuration (Mock for local dev)
MOCK_SSH=true

# Stripe Payments (Test mode)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx
```

### Frontend Environment Variables

```env
# API Endpoint
VITE_API_URL=http://localhost:3000/api
```

---

## 🔐 Environment Variable Descriptions

### Application Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode (`development`, `production`) | Yes | `development` |
| `PORT` | Server port | Yes | `3000` |

### Database Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | Full PostgreSQL connection string (for PaaS) | Conditional* | - |
| `DB_HOST` | Database host | Conditional* | `localhost` |
| `DB_USER` | Database username | Conditional* | `nexus` |
| `DB_PASSWORD` | Database password | Conditional* | `secure_password_123` |
| `DB_NAME` | Database name | Conditional* | `nexusvpn` |

*Use `DATABASE_URL` for cloud deployments (Render, Railway). Use individual `DB_*` variables for VPS/local deployments.

### Authentication Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `JWT_SECRET` | Secret key for JWT token signing | Yes | - |
| `JWT_EXPIRES_IN` | JWT token expiration time | No | `7d` |

### CORS & Frontend Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `FRONTEND_URL` | Frontend application URL | Yes | `http://localhost:5173` |
| `CORS_ORIGIN` | Allowed CORS origin | Yes | `http://localhost:5173` |

### SSH Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MOCK_SSH` | Use mock SSH (true/false) | Yes | `true` |
| `SSH_PRIVATE_KEY_PATH` | Path to SSH private key | Conditional** | - |
| `SSH_PUBLIC_KEY_PATH` | Path to SSH public key | Conditional** | - |
| `SSH_KEY_PATH` | Alternative SSH key path | Conditional** | - |
| `VPN_SSH_KEY` | SSH key as environment variable | Conditional** | - |

**Required when `MOCK_SSH=false` (VPS deployment with real VPN nodes).

### Payment Variables (Stripe)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret API key | No | - |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | No | - |

### Email Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `EMAIL_HOST` | SMTP server host | No | - |
| `EMAIL_PORT` | SMTP server port | No | `587` |
| `EMAIL_USER` | SMTP username | No | - |
| `EMAIL_PASSWORD` | SMTP password | No | - |
| `EMAIL_FROM` | From email address | No | - |

---

## 🚀 Quick Setup Commands

### Generate JWT Secret

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Generate Database Password

```bash
# Linux/Mac
openssl rand -base64 24

# Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 24 | ForEach-Object {[char]$_})
```

---

## 📝 Notes

1. **Never commit `.env` files** to version control
2. **Use different secrets** for each environment (dev, staging, production)
3. **Rotate secrets regularly** in production
4. **Use Render/Vercel dashboard** to set sensitive variables securely
5. **For cloud deployments**, use `DATABASE_URL` instead of individual `DB_*` variables
6. **For VPS deployments**, use individual `DB_*` variables for better control

---

**Last Updated**: 2025-01-15

