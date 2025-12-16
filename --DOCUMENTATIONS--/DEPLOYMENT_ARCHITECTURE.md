# 🏗️ Cloud Deployment Architecture

**Visual guide to NexusVPN cloud deployment architecture**

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│                    (Chrome, Firefox, etc.)                    │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    VERCEL (Frontend)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React App (Vite)                                     │  │
│  │  - Dashboard UI                                       │  │
│  │  - Admin Panel                                        │  │
│  │  - Authentication                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│  Environment: VITE_API_URL → Render Backend                │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS API Calls
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    RENDER (Backend)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  NestJS API Server                                    │  │
│  │  - Authentication (JWT)                               │  │
│  │  - VPN Management                                     │  │
│  │  - User Management                                    │  │
│  │  - Admin APIs                                         │  │
│  └──────────────────────────────────────────────────────┘  │
│  Environment: DATABASE_URL → Supabase                      │
└───────────────────────────┬─────────────────────────────────┘
                            │ PostgreSQL Connection
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  SUPABASE (Database)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                   │  │
│  │  - Users Table                                         │  │
│  │  - VPN Configs                                        │  │
│  │  - Locations/Servers                                  │  │
│  │  - Usage Records                                       │  │
│  │  - Audit Logs                                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### 1. User Authentication Flow
```
User → Frontend (Vercel)
  → Login Request
  → Backend (Render)
  → Database (Supabase)
  → Verify Credentials
  → Generate JWT Token
  → Return to Frontend
  → Store Token
  → Redirect to Dashboard
```

### 2. API Request Flow
```
Frontend (Vercel)
  → API Request (with JWT)
  → Backend (Render)
  → Validate JWT
  → Query Database (Supabase)
  → Process Data
  → Return Response
  → Frontend Updates UI
```

### 3. VPN Configuration Flow
```
User Request VPN Config
  → Frontend → Backend
  → Generate WireGuard Keys
  → Store in Database
  → Return Config to User
  → User Downloads Config
```

---

## 🔐 Security Architecture

### Authentication & Authorization
```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Login Request
       ▼
┌─────────────────┐
│  Vercel (FE)    │
│  - Validates    │
│  - Stores JWT   │
└──────┬──────────┘
       │
       │ 2. API Request + JWT
       ▼
┌─────────────────┐
│  Render (BE)    │
│  - Validates JWT│
│  - Checks Role  │
│  - Authorizes    │
└──────┬──────────┘
       │
       │ 3. Query
       ▼
┌─────────────────┐
│  Supabase (DB)  │
│  - Secure Query │
│  - Returns Data │
└─────────────────┘
```

### CORS Configuration
```
Frontend (Vercel) ←─── CORS Allowed ───→ Backend (Render)
  https://app.vercel.app                    https://api.onrender.com
```

---

## 📦 Component Details

### Frontend (Vercel)
- **Technology**: React + Vite + Tailwind
- **Deployment**: Static site generation
- **Environment**: `VITE_API_URL`
- **Features**:
  - User dashboard
  - Admin panel
  - Authentication UI
  - VPN config download

### Backend (Render)
- **Technology**: NestJS + TypeORM
- **Deployment**: Node.js web service
- **Environment Variables**:
  - `DATABASE_URL` - Supabase connection
  - `JWT_SECRET` - Token signing
  - `FRONTEND_URL` - CORS origin
  - `CORS_ORIGIN` - Allowed origins
- **Features**:
  - REST API
  - Authentication
  - VPN management
  - Admin operations

### Database (Supabase)
- **Technology**: PostgreSQL
- **Features**:
  - Relational database
  - Auto-backups
  - Connection pooling
  - SQL Editor
- **Tables**:
  - `users` - User accounts
  - `vpn_configs` - VPN configurations
  - `locations` - VPN servers
  - `usage_records` - Usage tracking
  - `audit_logs` - System logs

---

## 🌐 Network Architecture

### Request Routing
```
Internet
  │
  ├─→ Vercel CDN (Frontend)
  │   └─→ Serves static files
  │
  └─→ Render (Backend API)
      └─→ Processes API requests
          └─→ Supabase (Database)
              └─→ Returns data
```

### HTTPS/SSL
- **Vercel**: Automatic HTTPS (Let's Encrypt)
- **Render**: Automatic HTTPS
- **Supabase**: SSL/TLS encrypted connections

---

## 🔄 Deployment Flow

### Initial Deployment
```
1. Create Supabase Project
   └─→ Get connection string
   
2. Deploy Backend to Render
   └─→ Auto-detects render.yaml
   └─→ Links database
   └─→ Builds and deploys
   
3. Deploy Frontend to Vercel
   └─→ Sets VITE_API_URL
   └─→ Builds and deploys
   
4. Update CORS in Render
   └─→ Sets FRONTEND_URL
   └─→ Sets CORS_ORIGIN
   └─→ Auto-redeploys
```

### Update Flow
```
1. Push to GitHub
   │
   ├─→ Render auto-deploys (backend)
   └─→ Vercel auto-deploys (frontend)
```

---

## 📊 Monitoring & Logs

### Log Aggregation
```
┌──────────────┐
│   Vercel     │
│  - Build Logs│
│  - Runtime    │
└──────────────┘

┌──────────────┐
│   Render     │
│  - App Logs  │
│  - Build Logs│
└──────────────┘

┌──────────────┐
│   Supabase   │
│  - Query Logs│
│  - Error Logs│
└──────────────┘
```

### Metrics
- **Vercel**: Page views, performance, errors
- **Render**: CPU, memory, request count
- **Supabase**: Query performance, connections

---

## 🔧 Environment Configuration

### Frontend Environment (Vercel)
```env
VITE_API_URL=https://nexusvpn-api.onrender.com/api
```

### Backend Environment (Render)
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgres://...
JWT_SECRET=<generated>
FRONTEND_URL=https://nexusvpn.vercel.app
CORS_ORIGIN=https://nexusvpn.vercel.app
MOCK_SSH=true
```

### Database (Supabase)
- Connection string from Supabase dashboard
- Auto-configured in Render when linked

---

## 🚀 Scaling Architecture

### Horizontal Scaling
```
Load Balancer
  ├─→ Render Instance 1
  ├─→ Render Instance 2
  └─→ Render Instance N
      └─→ Supabase (Connection Pool)
```

### Database Scaling
- Supabase handles connection pooling
- Automatic backups
- Can upgrade to higher tier for more resources

---

## 🔒 Security Layers

### 1. Network Security
- HTTPS/TLS encryption
- CORS protection
- Rate limiting

### 2. Application Security
- JWT authentication
- Password hashing (bcrypt)
- Input validation
- SQL injection prevention (TypeORM)

### 3. Platform Security
- Environment variable encryption
- Secure secret storage
- Automatic SSL certificates

---

## 📈 Performance Optimization

### Frontend (Vercel)
- CDN distribution
- Automatic code splitting
- Image optimization
- Caching strategies

### Backend (Render)
- Connection pooling
- Query optimization
- Caching (if implemented)
- Efficient database queries

### Database (Supabase)
- Indexed queries
- Connection pooling
- Query optimization
- Automatic backups

---

## 🎯 Best Practices

### 1. Environment Separation
- Development: Local
- Staging: Separate cloud instances
- Production: Main deployment

### 2. Monitoring
- Set up error tracking
- Monitor performance metrics
- Alert on failures

### 3. Backups
- Database: Automatic (Supabase)
- Code: Git repository
- Configuration: Documented

### 4. Security
- Rotate secrets regularly
- Use strong passwords
- Enable 2FA
- Monitor access logs

---

## 📚 Related Documentation

- **Deployment Guide**: `QUICK_CLOUD_DEPLOYMENT.md`
- **Configuration**: `ENV_TEMPLATE.md`
- **Troubleshooting**: `POST_DEPLOYMENT_GUIDE.md`
- **Architecture**: This document

---

**Last Updated**: 2025-01-15

