

# TODO List

## 🚀 High Priority (Cloud Deployment Phase)
- [ ] **Database:** Setup Supabase PostgreSQL project.
- [ ] **Backend:** Adapt NestJS for Cloud deployment (Railway/Render) or Vercel Serverless.
- [ ] **Frontend:** Deploy React App to Vercel.
- [ ] **Env Config:** Configure `VITE_API_URL` and `DB_HOST` for production.

## ⏸️ Deferred / On Hold (VPS Phase)
- [ ] **Infrastructure Files:** `backend/Dockerfile`, `frontend/Dockerfile`, `infrastructure/nginx.conf`, and `infrastructure/install.sh`. (Marked for later implementation on Ubuntu 24.04).
- [ ] **Node Provisioning:** Setup script generator for new nodes.
- [ ] **Multi-Server Sync:** Logic exists but needs real SSH/VPS to function.
- [ ] **Health Checks:** Active SSH monitoring requires real nodes.

## Completed Features (MVP)
- [x] **QR Code Support:** Add a QR code generator to the Dashboard.
- [x] **Profile Settings:** User profile management UI.
- [x] **Error Handling:** Improved UI feedback.
- [x] **Admin Polish:** Redesigned charts and widgets.
- [x] **Real Notifications:** Backend DB persistence.
- [x] **Remote Terminal:** UI implemented (Mock API connected).
- [x] **Widget Restoration:** Brought back Active Devices and Data Usage cards.
- [x] **Dashboard Extension:** Added Connection Quality monitor.

## Medium Priority
- [x] **Dark/Light Mode Toggle:** Implemented.
- [x] **Mobile Responsive Tweaks:** Pricing cards fixed.
- [x] **Documentation:** Deployment guides draft (VPS guide exists, need Cloud guide).

## Low Priority / Future
- [x] **Mobile App:** Build a React Native client (Basic UI Complete).
- [ ] **Speed Test:** Real implementation (currently simulated).

---

## 📝 TODO Update: [2025-12-15]

### 🔄 Pivot:
- **Project Structure:** Reorganized into `frontend/`, `backend/`, `mobile/` monorepo.
- **Local Dev:** Prioritized local PostgreSQL setup over Cloud for immediate dev.

### ✅ Completed (2025-12-15):
- [x] **Project Initialization:** Full stack (FE/BE/Mobile) runnable via `start-all.ps1`.
- [x] **Backend Fixes:** Dependency resolution, Root route handler, CORS setup.
- [x] **Frontend Fixes:** Port conflict resolution (5173), `tsconfig` fixes.
- [x] **Database:** Local PostgreSQL connection established.
- [x] **Real Key Management:** Implemented Curve25519 keypair generation using `tweetnacl` (WireGuard-compatible).
- [x] **SSH Service:** Enhanced with retry logic, exponential backoff, and timeout handling.
- [x] **Infrastructure Scripts:** Created `infrastructure/install.sh` for Ubuntu 24.04 VPS provisioning.
- [x] **Cloud Deployment Prep:** Created comprehensive deployment guide and environment templates.
- [x] **Supabase Configuration:** Connection string obtained, migration SQL prepared.
- [x] **Vercel Configuration:** Config files created, deployment guide ready.
- [x] **Render Configuration:** Environment variables generated, deployment guide ready.

### 🔜 Next Up (Manual Steps Required):
- [ ] **Supabase Migration:** Run `supabase_migration.sql` in Supabase SQL Editor.
- [ ] **Vercel Deployment:** Import project and deploy frontend.
- [ ] **Render Deployment:** Create web service and deploy backend.
- [ ] **End-to-End Testing:** Verify full stack works in production.

### ✅ MCP Integration Complete (2025-12-15):
- [x] **MCP Servers:** Supabase and Render MCP servers built and tested
- [x] **API Key Management:** Automated configuration with .env.mcp
- [x] **Documentation:** Complete MCP documentation in --DOCUMENTATIONS--/05-MCP/
- [x] **Windows Support:** PowerShell/batch scripts for Windows users
- [x] **IDE Integration:** Trae IDE and other IDE configurations
- [x] **Deployment Tools:** MCP tools for managing Supabase and Render services
