
# 🗺️ Master Plan: NexusVPN

**Version:** 1.1.0
**Status:** Phase 2.5 (Cloud Beta)
**Manager:** pages/My-AGENTS (Governance)

## 1. Executive Summary
NexusVPN is a self-hosted/hybrid VPN management dashboard utilizing WireGuard®. It aims to provide a "SaaS-in-a-box" experience.

## 2. Phased Execution

### Phase 1: The Visual Core (MVP) ✅
*   **Status:** **Completed.**
*   **Deliverables:** React UI, Mock Data, Auth Flows.

### Phase 2: The Backend Engine (Complete) ✅
*   **Status:** **Completed.**
*   **Deliverables:** NestJS API, TypeORM Entities, Auth Logic.

### Phase 2.5: Cloud Beta (Current Focus) ☁️
*   **Objective:** Validate application logic on public cloud infrastructure before managing raw servers.
*   **Tech:** Vercel (Frontend), Railway/Render (Backend), Supabase (PostgreSQL).
*   **Tasks:**
    *   [ ] Connect Repository to Vercel.
    *   [ ] Provision Supabase PostgreSQL instance.
    *   [ ] Deploy NestJS to a PaaS (Railway or Render recommended for WebSocket/Cron support).
    *   [ ] Verify "Mock" VPN generation works in production environment.

### Phase 3: WireGuard Integration (VPS) 🚧
*   **Objective:** Bridge the web API to the Linux Kernel networking layer.
*   **Tech:** Ubuntu 24.04, Docker, Nginx, WireGuard.
*   **Tasks:**
    *   [ ] **(Deferred)** Create Dockerfiles for production.
    *   [ ] **(Deferred)** Create `install.sh` for one-click setup.
    *   [ ] Provision Linux server.
    *   [ ] Implement Keypair Generation (Curve25519).
    *   [ ] Create "Peer Management" service to sync DB with `wg0.conf`.

### Phase 4: Monetization & Polish 💰
*   **Objective:** Enable subscription gating and mobile ease-of-use.
*   **Tech:** Stripe API, QR Code Libraries.
*   **Tasks:**
    *   [ ] Integrate Stripe Checkout Webhooks.
    *   [ ] Implement QR Code generation for mobile config import.

## 3. Resource Allocation
*   **Frontend Team:** 1 AI Agent (React Specialist).
*   **Backend Team:** 1 AI Agent (Node/NestJS Specialist).
*   **DevOps:** 1 AI Agent (Cloud/Docker Specialist).
