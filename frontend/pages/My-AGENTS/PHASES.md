
# Development Phases

## Phase 0: Specification (Week 1)
*   Define `types.ts`.
*   Establish Design System.
*   Write `SPEC.md`.

## Phase 1: Prototype / MVP (Weeks 2-3)
*   **Goal:** A clickable, visual representation of the product.
*   **Deliverable:** React App with Mock Data.
*   **Status:** **COMPLETE**

## Phase 2: The Engine (Weeks 4-6)
*   **Goal:** Real backend logic.
*   **Deliverable:** NestJS API connected to a Postgres DB.
*   **Focus:** User management, Auth, and Data persistence.
*   **Status:** **COMPLETE** (Backend running locally, DB connected, Structure finalized)

## Phase 3: The Wire (Weeks 7-8)
*   **Goal:** Real VPN connectivity.
*   **Deliverable:** Backend communicating with a Linux WireGuard node.
*   **Focus:** Security, SSH automation, Key management.

## Phase 4: The Business (Weeks 9-10)
*   **Goal:** Monetization.
*   **Deliverable:** Stripe integration.
*   **Focus:** Checkout flows, Subscription gating.

---

## 📊 Phase Update: [2025-12-15]

### Current Phase: Phase 3: The Wire
### Progress: 25%

### Milestones Achieved:
- ✅ **Production Ready Backend:** API prefix, Root handler, and DB connection finalized.
- ✅ **End-to-End Auth:** Login/Register flows verified on Web and Mobile.
- ✅ **Admin Enhancements:** Demo credentials toggle and dashboard polish.
- ✅ **Mobile Integration:** Mobile app connected to local backend API.
- ✅ **Real Key Management:** Curve25519 keypair generation (WireGuard-compatible) implemented.

### Upcoming Milestones:
- 🔲 **SSH Service Implementation:** Real SSH connections to VPN nodes.
- 🔲 **Infrastructure Automation:** VPS provisioning scripts for Ubuntu 24.04.
- 🔲 **Real WireGuard Connection:** End-to-end tunnel establishment.

### Phase Blockers:
- **VPS Access:** Need a real Ubuntu server to test SSH and WireGuard provisioning.

### Notes:
Task #1 (Key Management) is complete. The backend now generates cryptographically valid WireGuard keys. Next: SSH automation and infrastructure scripts.
