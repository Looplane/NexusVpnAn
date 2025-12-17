# Environment Variables Template for Production

**Document ID:** CFG-ENV-SIMPLE-001  
**Created:** 17-12-2025 | Time: 03:28:24  
**Last Updated:** 17-12-2025 | Time: 03:28:24  
**Agent:** `backend-nexusvpn-specialist` (Backend Specialist Agent)  
**Status:** ✅ Active

**Related Documents:**
- @--DOCUMENTATIONS--/10-Configuration/01-CFG-Env_Template_17-12-2025_022800.md (1-38)
- @--DOCUMENTATIONS--/06-Deployment/27-DEP-Deployment_Checklist_17-12-2025_032824.md (1-272)

---

# Database
DATABASE_URL=postgres://postgres:PASSWORD@HOST:5432/postgres

# JWT
JWT_SECRET=GENERATE_RANDOM_STRING_HERE

# CORS
CORS_ORIGIN=https://nexusvpn.vercel.app

# SSH (Set to true until VPS is ready)
MOCK_SSH=true

# Optional: SSH Keys (if using real VPS)
# VPN_SSH_KEY=
# VPN_SSH_PUBLIC_KEY=

---

**Last Updated:** 17-12-2025 | Time: 03:28:24

