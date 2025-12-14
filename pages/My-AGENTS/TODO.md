

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

## 📝 TODO Update: [Current Session]

### 🔄 Pivot:
- **VPS Infrastructure** moved to "Deferred".
- **Vercel/Supabase** added to "High Priority".

### ✅ Completed:
- [x] **Resilience Logic:** `VpnSyncService` basic structure (mocked).
- [x] **Monitoring:** Health check cron jobs (mocked).
- [x] **UI Polish:** Restored missing widgets per user feedback.
