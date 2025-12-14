
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
### Progress: 15%

### Milestones Achieved:
- ✅ **Production Ready Backend:** API prefix, Root handler, and DB connection finalized.
- ✅ **End-to-End Auth:** Login/Register flows verified on Web and Mobile.
- ✅ **Admin Enhancements:** Demo credentials toggle and dashboard polish.
- ✅ **Mobile Integration:** Mobile app connected to local backend API.

### Upcoming Milestones:
- 🔲 **Real WireGuard Connection:** The `SshService` needs to connect to a real Ubuntu VPS.
- 🔲 **Key Management:** Move key generation from `mockService` to `VpnService` (Node.js crypto).

### Phase Blockers:
- **SSH Access:** Real server metrics require Phase 3 (WireGuard Integration) to begin.

### Notes:
The application is now "Production Ready" in terms of structure and core logic. The focus now shifts entirely to the "Wire" phase - making the VPN actually connect.
