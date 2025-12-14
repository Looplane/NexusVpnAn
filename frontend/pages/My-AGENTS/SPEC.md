# 📐 EXECUTION SPEC: NexusVPN

## 🎯 OBJECTIVE
Build a production-ready, self-hosted VPN solution with a premium "SaaS-like" UI, robust backend, and cross-platform mobile app.

## 🏗️ ARCHITECTURE (Monorepo)
- **Root:** `g:\VPN-PROJECT-2025\nexusvpn`
- **Frontend:** `frontend/` (React + Vite + Tailwind)
- **Backend:** `backend/` (NestJS + TypeORM + PostgreSQL)
- **Mobile:** `mobile/` (React Native + Expo)
- **Infrastructure:** `infrastructure/` (Docker, Scripts)

## 🛠️ TECH STACK
- **Language:** TypeScript (Strict Mode)
- **Database:** PostgreSQL (Local for Dev, Supabase for Prod)
- **Auth:** JWT + 2FA (TOTP)
- **VPN Protocol:** WireGuard (Linux Kernel Module)
- **State Management:** React Context + LocalStorage

## 📜 RULES
- **No Questions:** Make expert decisions.
- **No Confirmations:** Execute and verify.
- **No Pauses:** Continuous delivery.
- **Preserve Features:** Never delete working code; only extend or refactor safely.

## 🔄 FLOW
1. **Analyze:** Read `TODO.md` and `PHASES.md`.
2. **Spec:** Define the change in memory.
3. **Implement:** Write code (Frontend -> Backend -> DB).
4. **Validate:** Verify against `SPEC.md`.
5. **Document:** Update `TODO.md` and `ROADMAP.md`.
6. **Continue:** Pick the next task immediately.

## ⚠️ COMPATIBILITY
- All changes must be **additive**.
- Backward compatibility is **mandatory**.
- Use `start-all.ps1` for local development.
