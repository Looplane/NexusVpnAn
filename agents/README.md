# 🤖 AI Agents Registry

This folder contains AI agent definitions compatible with all major AI coding IDEs and follows Anthropic MCP (Model Context Protocol) standards.

## 🎯 Purpose

Agents are **NOT runtime code**. They are AI orchestration blueprints that provide:
- Cognitive logic and decision-making frameworks
- Tool orchestration capabilities  
- Permission and capability definitions
- IDE/AI-runtime instructions

## 🏗️ Architecture

This structure ensures compatibility with:
- ✅ Anthropic Claude & MCP
- ✅ OpenAI Agents
- ✅ Cursor IDE
- ✅ Windsurf
- ✅ VS Code AI extensions
- ✅ Google AI Studio
- ✅ Trae IDE
- ✅ Future AI IDEs

## 📁 Directory Structure

```
agents/
├── README.md (This file)
├── QUICK_REFERENCE_GUIDE.md     ← 🚀 Instant start guide
├── TEAM_WORKFLOWS_GUIDE.md      ← 🤝 Team-level workflows
├── _standards/
│   ├── anthropic-mcp.md
│   ├── openai-agents.md
│   └── ide-compatibility.md
├── mcp/
│   ├── agent.overview.md
│   ├── agent.config.mcp.md
│   ├── agent.permissions.mcp.md
│   └── agent.tools.mcp.md
├── ide/
│   ├── cursor.agent.md
│   ├── windsurf.agent.md
│   ├── vscode.agent.md
│   └── generic.agent.md
├── specialists/                 ← 🎯 Expert agents by domain
│   ├── architecture.agent.md    ← 🏗️ System design expert
│   ├── frontend.agent.md        ← 💻 UI/UX specialist
│   └── backend.agent.md         ← ⚡ Server/API specialist
└── loader/
    └── agent.auto-loader.md
```

## 🔧 Auto-Discovery

AI IDEs scan for:
- Root-level semantic folders (`/agents/`)
- Markdown-based agent instructions
- Predictable naming conventions
- Clear capability boundaries

## 🚀 Quick Start

1. **For AI IDEs**: The system auto-discovers agent configurations
2. **For Manual Setup**: Consult specific IDE guides in `/ide/` folder
3. **For MCP Integration**: See `/mcp/` folder for Model Context Protocol setup

## 🔐 Security

- ✅ Agents are **NOT** runtime code - zero XSS/RCE risk
- ✅ Located outside frontend/backend - prevents accidental shipping
- ✅ Optional .gitignore for local-only agents
- ✅ Secure by design architecture

## 📋 Agent Capabilities

### Project Management
- Deployment orchestration
- Database management
- Environment configuration
- Build optimization

### Code Intelligence
- Architecture decisions
- Refactoring guidance
- Security analysis
- Performance optimization

### Integration
- Multi-service coordination
- API design
- Testing strategies
- Documentation generation

## 🔗 Related

- **Project Root**: `../` - Main NexusVPN application
- **Documentation**: `../--DOCUMENTATIONS--/` - Technical documentation
- **MCP Servers**: `../mcp-servers/` - Supabase/Render integration servers

---

*This registry follows industry best practices for AI agent management and maintains compatibility across all major AI development environments.*