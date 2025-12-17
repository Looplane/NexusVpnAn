# 📚 Documentation Structure Index

**Document ID:** DOC-INDEX-001  
**Created:** 17-12-2025 | Time: 02:22:43  
**Last Updated:** 17-12-2025 | Time: 02:22:43

**Purpose:** This document serves as the master index for all documentation in the NexusVPN project.

---

## 📂 Folder Structure

### 01-Planning/
**Purpose:** High-level roadmaps, task breakdowns, and timelines.

**Files:**
- `01-PL-Master_Plan_[DATE]_[TIME].md` - Strategic vision and phase breakdown
- `02-PL-Task_Tracker_[DATE]_[TIME].md` - Granular task items and status

**Prefix:** `PL-` (Planning)

---

### 02-Architecture/
**Purpose:** Technical specifications, data models, and system design.

**Files:**
- `01-AR-API_Schema_[DATE]_[TIME].md` - API interface definitions
- `02-AR-System_Architecture_[DATE]_[TIME].md` - Tech stack and data flow

**Subfolders:**
- `BACKEND/` - Backend-specific architecture
  - `01-Status/` - Status documents
  - `02-Fixes/` - Fix documentation
  - `03-Agents/` - Agent declarations
  - `04-Handover/` - Handover guides

**Prefix:** `AR-` (Architecture), `BE-` (Backend)

---

### 03-Logs/
**Purpose:** Historical records of actions, sessions, and decisions.

**Files:**
- `01-LG-Chat_Session_History_[DATE]_[TIME].md` - User-agent discussions
- `02-LG-Development_Log_[DATE]_[TIME].md` - File changes and features
- `[Serial]-[Prefix]-Session_[DATE]_[TIME].md` - Session-specific logs

**Prefix:** `LG-` (Logs), `BE-` (Backend Session), etc.

---

### 04-Guides/
**Purpose:** Comprehensive deployment and setup guides.

**Files:**
- `01-GD-Ultimate_Deployment_Guide_[DATE]_[TIME].md` - Complete deployment walkthrough
- Additional guides with `GD-` prefix

**Prefix:** `GD-` (Guides)

---

### 05-MCP/
**Purpose:** Model Context Protocol (MCP) server documentation.

**Files:**
- `01-MCP-README_[DATE]_[TIME].md` - MCP overview
- `02-MCP-API_Keys_Guide_[DATE]_[TIME].md` - API key setup
- Additional MCP guides with `MCP-` prefix (25 files total)

**Prefix:** `MCP-` (MCP Integration)

---

### 06-Deployment/
**Purpose:** Deployment guides, production setup, and server deployment documentation.

**Files:**
- `01-DEP-Architecture_[DATE]_[TIME].md` - Deployment architecture
- `02-DEP-Cloud_Deployment_Complete_[DATE]_[TIME].md` - Cloud deployment status
- `03-DEP-Cloud_Deployment_Summary_[DATE]_[TIME].md` - Deployment summary
- Additional deployment guides (25 files total)

**Prefix:** `DEP-` (Deployment)

---

### 07-Setup/
**Purpose:** Setup guides, installation commands, and configuration instructions.

**Files:**
- `01-SET-Auto_Config_Implementation_[DATE]_[TIME].md` - Auto-configuration
- `02-SET-Add_VPN_Servers_Guide_[DATE]_[TIME].md` - VPN server setup
- `03-SET-Windows_Server_SSH_Setup_[DATE]_[TIME].md` - Windows SSH setup
- Additional setup guides (26 files total)

**Prefix:** `SET-` (Setup)

---

### 08-Fixes/
**Purpose:** Troubleshooting guides, fix documentation, and issue resolution.

**Files:**
- `01-FIX-Windows_SSH_Auto_Config_[DATE]_[TIME].md` - Windows SSH fix
- `02-FIX-Troubleshoot_Old_UI_[DATE]_[TIME].md` - UI troubleshooting
- `03-FIX-Deployment_Issues_[DATE]_[TIME].md` - Deployment fixes
- Additional fix guides (9 files total)

**Prefix:** `FIX-` (Fixes)

---

### 09-Status/
**Purpose:** Status reports, session summaries, and project status documentation.

**Files:**
- `01-STAT-Final_Status_[DATE]_[TIME].md` - Final status
- `02-STAT-Complete_Project_Status_[DATE]_[TIME].md` - Project status
- `03-STAT-Session_Complete_[DATE]_[TIME].md` - Session status
- Additional status reports (7 files total)

**Prefix:** `STAT-` (Status)

---

### 10-Configuration/
**Purpose:** Configuration templates, environment variables, and setup configurations.

**Files:**
- `01-CFG-Env_Template_[DATE]_[TIME].md` - Environment templates

**Prefix:** `CFG-` (Configuration)

---

## 📝 File Naming Convention

**Format:** `[Serial]-[Prefix]-[Name]_[DD-MM-YYYY]_[HHmmss].md`

**Examples:**
- `01-BE-Production_Status_17-12-2025_021916.md`
- `02-PL-Task_Tracker_17-12-2025_022243.md`
- `01-AR-API_Schema_17-12-2025_022243.md`

**Prefixes:**
- `PL-` = Planning
- `AR-` = Architecture
- `BE-` = Backend
- `FE-` = Frontend
- `MOB-` = Mobile
- `DEP-` = Deployment
- `SET-` = Setup
- `FIX-` = Fixes
- `STAT-` = Status
- `CFG-` = Configuration
- `GD-` = Guides
- `LG-` = Logs
- `MCP-` = MCP Integration

**Date Format:**
- **Filename:** `DD-MM-YYYY_HHmmss` (e.g., `17-12-2025_022243`)
- **Content:** `DD-MM-YYYY | Time: HH:mm:ss` (e.g., `17-12-2025 | Time: 02:22:43`)

---

## 🔗 Reference Format

**Document References:**
- Use `@--DOCUMENTATIONS--/path/to/file.md (line-range)` format
- Example: `@--DOCUMENTATIONS--/02-Architecture/BACKEND/01-Status/01-BE-Production_Status_17-12-2025_021916.md (1-131)`

**Code References:**
- Use `@path/to/file.ts (line-range)` format
- Example: `@backend/src/main.ts (11-88)`

---

## 📋 Document Structure

Every document should include:
1. **Document ID** (e.g., BE-STATUS-001)
2. **Created/Last Updated** with proper date format
3. **Agent declaration** (if applicable)
4. **Related Documents** section with proper references
5. **Content** organized with clear sections

---

**Related Documents:**
- @--DOCUMENTATIONS--/03-Logs/08-LG-Documentation_Reorganization_Complete_17-12-2025_024425.md (1-200)

**Last Updated:** 17-12-2025 | Time: 02:44:25

