
# 📚 NexusVPN Documentation Suite

**Central Knowledge Base & Execution Log**

This directory contains the single source of truth for the NexusVPN project. It is structured to guide agents (human or AI) through the lifecycle of the application.

## 📂 Structure

### [00-INDEX](./00-INDEX-Documentation_Structure_17-12-2025_022243.md)
Master index for all documentation structure and naming conventions.

### [01-Planning](./01-Planning)
High-level roadmaps, task breakdowns, and timelines.
*   `01-PL-Master_Plan_[DATE]_[TIME].md`: The strategic vision and phase breakdown.
*   `02-PL-Task_Tracker_[DATE]_[TIME].md`: Granular task items and status.
*   **Prefix:** `PL-` (Planning)

### [02-Architecture](./02-Architecture)
Technical specifications, data models, and system design.
*   `01-AR-API_Schema_[DATE]_[TIME].md`: Interface definitions.
*   `02-AR-System_Architecture_[DATE]_[TIME].md`: Tech stack and data flow.
*   `[BACKEND](./02-Architecture/BACKEND/)`: Backend-specific architecture documentation.
    *   `01-Status/`: Backend production status documents (serialized with date/time).
    *   `02-Fixes/`: Backend production fixes documentation (serialized with date/time).
    *   `03-Agents/`: Backend agent declarations (serialized with date/time).
    *   `04-Handover/`: Agent handover guides (serialized with date/time).
*   **Prefix:** `AR-` (Architecture), `BE-` (Backend)

### [03-Logs](./03-Logs)
Historical records of actions, sessions, and decisions.
*   `01-LG-Chat_Session_History_[DATE]_[TIME].md`: **(Vital)** Refined log of user-agent discussions.
*   `02-LG-Development_Log_[DATE]_[TIME].md`: Chronological record of file changes and features.
*   Session logs with format: `[Serial]-[Prefix]-Session_[DD-MM-YYYY]_[HHmmss].md`
*   **Prefix:** `LG-` (Logs), `BE-` (Backend Session), etc.

### [04-Guides](./04-Guides)
Comprehensive deployment and setup guides.
*   `01-GD-Ultimate_Deployment_Guide_[DATE]_[TIME].md`: Complete deployment walkthrough.
*   **Prefix:** `GD-` (Guides)

### [05-MCP](./05-MCP)
Model Context Protocol (MCP) server documentation and guides.
*   `01-MCP-README_[DATE]_[TIME].md`: Overview of MCP integration.
*   `02-MCP-API_Keys_Guide_[DATE]_[TIME].md`: Detailed API key setup instructions.
*   `03-MCP-Quick_Setup_[DATE]_[TIME].md`: Fast-track MCP configuration guide.
*   `04-MCP-Integration_Guide_[DATE]_[TIME].md`: Complete MCP tool usage guide.
*   Additional MCP guides with `MCP-` prefix (25 files total).
*   **Prefix:** `MCP-` (MCP Integration)

### [06-Deployment](./06-Deployment)
Deployment guides, production setup, and server deployment documentation.
*   `01-DEP-Architecture_[DATE]_[TIME].md`: Deployment architecture diagrams.
*   `02-DEP-Cloud_Deployment_Complete_[DATE]_[TIME].md`: Cloud deployment completion status.
*   `03-DEP-Cloud_Deployment_Summary_[DATE]_[TIME].md`: Complete deployment summary.
*   Additional deployment guides (25 files total).
*   **Prefix:** `DEP-` (Deployment)

### [07-Setup](./07-Setup)
Setup guides, installation commands, and configuration instructions.
*   `01-SET-Auto_Config_Implementation_[DATE]_[TIME].md`: Auto-configuration system overview.
*   `02-SET-Add_VPN_Servers_Guide_[DATE]_[TIME].md`: VPN server addition guide.
*   `03-SET-Windows_Server_SSH_Setup_[DATE]_[TIME].md`: Windows Server SSH configuration.
*   Additional setup guides (26 files total).
*   **Prefix:** `SET-` (Setup)

### [08-Fixes](./08-Fixes)
Troubleshooting guides, fix documentation, and issue resolution.
*   `01-FIX-Windows_SSH_Auto_Config_[DATE]_[TIME].md`: Windows SSH auto-config fix.
*   `02-FIX-Troubleshoot_Old_UI_[DATE]_[TIME].md`: UI troubleshooting guide.
*   `03-FIX-Deployment_Issues_[DATE]_[TIME].md`: Deployment issue fixes.
*   Additional fix guides (9 files total).
*   **Prefix:** `FIX-` (Fixes)

### [09-Status](./09-Status)
Status reports, session summaries, and project status documentation.
*   `01-STAT-Final_Status_[DATE]_[TIME].md`: Final project status.
*   `02-STAT-Complete_Project_Status_[DATE]_[TIME].md`: Complete project status.
*   `03-STAT-Session_Complete_[DATE]_[TIME].md`: Session completion status.
*   Additional status reports (7 files total).
*   **Prefix:** `STAT-` (Status)

### [10-Configuration](./10-Configuration)
Configuration templates, environment variables, and setup configurations.
*   `01-CFG-Env_Template_[DATE]_[TIME].md`: Environment variable templates.
*   **Prefix:** `CFG-` (Configuration)

## 📝 File Naming Convention

**Format:** `[Serial]-[Prefix]-[Name]_[DD-MM-YYYY]_[HHmmss].md`

**Date Format:**
- **Filename:** `DD-MM-YYYY_HHmmss` (e.g., `17-12-2025_022243`)
- **Content:** `DD-MM-YYYY | Time: HH:mm:ss` (e.g., `17-12-2025 | Time: 02:22:43`)

**See:** @--DOCUMENTATIONS--/00-INDEX-Documentation_Structure_17-12-2025_022243.md for complete structure guide.

## 🤖 Governance
This project is managed by the policies defined in `@agents/`. Consult those files for operational rules.
