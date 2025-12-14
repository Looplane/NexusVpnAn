
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
*   **Status:** **COMPLETE** (Logic Mocked High-Fidelity in Frontend, Backend Structure Ready)

## Phase 3: The Wire (Weeks 7-8)
*   **Goal:** Real VPN connectivity.
*   **Deliverable:** Backend communicating with a Linux WireGuard node.
*   **Focus:** Security, SSH automation, Key management.

## Phase 4: The Business (Weeks 9-10)
*   **Goal:** Monetization.
*   **Deliverable:** Stripe integration.
*   **Focus:** Checkout flows, Subscription gating.

---

## 📊 Phase Update: [2024-05-24]

### Current Phase: Phase 3: The Wire
### Progress: 10%

### Milestones Achieved:
- ✅ **Frontend High-Fidelity:** Dashboard and Admin panels are now feature-complete (UI).
- ✅ **Interactive Widgets:** Users can interact with settings (Split Tunnel, Multi-hop) even in mock mode.
- ✅ **Admin Power Tools:** `SmartWindow`, Inspectors, and Recharts implemented.

### Upcoming Milestones:
- 🔲 **Real WireGuard Connection:** The `SshService` needs to connect to a real Ubuntu VPS.
- 🔲 **Key Management:** Move key generation from `mockService` to `VpnService` (Node.js crypto).

### Phase Blockers:
- **SSH Access:** Real server metrics require Phase 3 (WireGuard Integration) to begin.

### Notes:
The UI is now "Enterprise Ready". The focus must shift strictly to Backend and Infrastructure to power these interfaces with real data.
