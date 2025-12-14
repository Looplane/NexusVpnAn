
# NexusVPN Roadmap

## Phase 1: Frontend MVP (Complete)
- [x] Project scaffolding (React + Tailwind).
- [x] UI Component Library (Buttons, Inputs, Cards).
- [x] Landing Page (Hero, Features, Pricing).
- [x] Authentication Flows (Login/Register UI + 2FA).
- [x] Dashboard Layout (Tabs: Overview, History, Security).
- [x] Mock Service Layer (Full simulation of API).
- [x] Config File Generator & QR Code.
- [x] SaaS Features (Referrals, Notifications, Support Tickets).
- [x] Admin Panel (Server Mgmt, User Mgmt, Marketing/Coupons).

## Phase 2: Backend Integration (Complete)
- [x] Setup NestJS project structure.
- [x] Implement PostgreSQL database schema.
- [x] Create real Auth endpoints (JWT).
- [x] Admin & Marketing APIs.

## Phase 3: Infrastructure & Networking (Deferred)
- [ ] Set up WireGuard on a Linux server.
- [ ] Create SSH management scripts.
- [x] Dockerfiles for production.

## Phase 4: Payment & Scaling
- [x] Stripe Service Logic (Mocked).
- [ ] Webhook Integration.

## Phase 5: Client Apps (In Progress) 📱
- [x] **Mobile Project Init:** Expo + TypeScript structure.
- [x] **Mobile UI:** Login & Dashboard screens.
- [ ] **Native Integration:** WireGuard Android/iOS bindings.
- [ ] **Desktop App:** Electron wrapper.

---

## 📊 Phase Update: [Current]

### Current Phase: Phase 5: Client Apps
### Progress: 20%

### Milestones Achieved:
- ✅ **Mobile Foundation:** `mobile/` folder created with Expo config.
- ✅ **Shared Design:** Mobile app uses the same color palette as Web Dashboard.

### Notes:
The mobile app is currently a UI shell. The next critical step for mobile is bridging the **WireGuard Native libraries** (Kotlin/Swift) to the React Native layer, which requires "Ejecting" from Expo Go or using a Custom Dev Client.
