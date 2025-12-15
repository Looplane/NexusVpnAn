# 🎯 Agent Auto-Loader Logic

This document defines the auto-discovery and loading mechanism for AI agents across all supported IDEs and platforms.

## 🧠 Auto-Discovery Algorithm

### 1. Root-Level Scanning
AI IDEs scan for semantic folders at project root:
```
/agents/           ← Primary discovery location
/docs/            ← Fallback documentation
/config/          ← Configuration files
```

### 2. File Pattern Recognition
Standard file patterns trigger agent loading:
```
agents/
├── README.md              ← Main registry
├── *.agent.md            ← IDE-specific agents
├── agent.*.md            ← Capability-specific agents
└── loader/
    └── agent.auto-loader.md ← This file
```

### 3. Capability Detection
Agents declare capabilities in standardized format:
```markdown
---
agent_id: nexusvpn-orchestrator
agent_version: 1.0.0
capabilities:
  - deployment
  - database
  - monitoring
ide_compatibility:
  - cursor
  - windsurf
  - vscode
  - trae
mcp_compatible: true
---
```

## 🚀 Loading Sequence

### Phase 1: Discovery
```python
def discover_agents(project_root):
    agents = []
    agents_path = project_root / "agents"
    
    if agents_path.exists():
        # Read main registry
        registry = read_registry(agents_path / "README.md")
        
        # Find agent definitions
        for agent_file in agents_path.glob("**/*.agent.md"):
            agent_config = parse_agent_file(agent_file)
            agents.append(agent_config)
    
    return agents
```

### Phase 2: Validation
```python
def validate_agent(agent_config):
    required_fields = ["agent_id", "capabilities", "ide_compatibility"]
    
    for field in required_fields:
        if field not in agent_config:
            raise ValidationError(f"Missing required field: {field}")
    
    # Validate capabilities against MCP standards
    if agent_config.get("mcp_compatible"):
        validate_mcp_compliance(agent_config)
    
    return True
```

### Phase 3: Registration
```python
def register_agent(agent_config, ide_context):
    # Check IDE compatibility
    if ide_context.name not in agent_config["ide_compatibility"]:
        return False
    
    # Register capabilities
    for capability in agent_config["capabilities"]:
        ide_context.register_capability(capability, agent_config)
    
    # Load tools if MCP compatible
    if agent_config.get("mcp_compatible"):
        load_mcp_tools(agent_config)
    
    return True
```

## 🔧 Configuration Format

### Agent Definition Template
```markdown
---
# Agent Metadata
agent_id: unique-agent-identifier
agent_version: 1.0.0
agent_name: Human Readable Name
description: Brief description of agent purpose

# Capabilities
capabilities:
  - deployment
  - database
  - monitoring
  - security

# IDE Compatibility
ide_compatibility:
  - cursor
  - windsurf
  - vscode
  - trae
  - google-ai-studio

# MCP Integration
mcp_compatible: true
mcp_version: 1.0
mcp_servers:
  - supabase-mcp
  - render-mcp

# Security
permissions:
  read: ["config", "logs"]
  write: ["env_vars", "deployments"]
  execute: ["migrations", "builds"]

# Metadata
tags: ["orchestration", "deployment", "nexusvpn"]
author: NexusVPN Team
---

# Agent Instructions

## Purpose
Detailed description of what this agent does.

## Tools Available
List of tools and capabilities.

## Usage Examples
Concrete examples of how to use this agent.

## Security Notes
Important security considerations.
```

## 🎯 Multi-IDE Support

### Cursor IDE
```json
{
  "cursor_agent_detection": true,
  "cursor_capabilities": {
    "deployment": "full",
    "database": "full",
    "monitoring": "read-only"
  }
}
```

### Windsurf
```json
{
  "windsurf_agent_detection": true,
  "windsurf_tool_integration": "mcp_compatible",
  "windsurf_security_model": "explicit_permissions"
}
```

### VS Code
```json
{
  "vscode_ai_extension_detection": true,
  "vscode_tool_registration": "dynamic",
  "vscode_capability_discovery": "file_based"
}
```

### Trae IDE
```json
{
  "trae_agent_detection": true,
  "trae_mcp_integration": "native",
  "trae_capability_loading": "auto"
}
```

## 🔐 Security Model

### Permission Inheritance
```python
def apply_security_model(agent_config, ide_context):
    # Base permissions from agent config
    base_permissions = agent_config.get("permissions", {})
    
    # IDE-specific overrides
    ide_security = get_ide_security_policy(ide_context.name)
    
    # Merge with least privilege
    effective_permissions = merge_permissions(base_permissions, ide_security)
    
    # Apply to IDE context
    ide_context.set_permissions(agent_config["agent_id"], effective_permissions)
    
    return effective_permissions
```

### Capability Sandboxing
```python
def sandbox_capability(agent_id, capability, ide_context):
    # Create isolated execution context
    sandbox = create_sandbox(agent_id, capability)
    
    # Apply capability-specific restrictions
    restrictions = get_capability_restrictions(capability)
    sandbox.apply_restrictions(restrictions)
    
    # Monitor execution
    monitor = create_monitor(agent_id, capability)
    sandbox.set_monitor(monitor)
    
    return sandbox
```

## 📊 Monitoring & Telemetry

### Agent Loading Metrics
```python
def track_agent_loading():
    metrics = {
        "agents_discovered": count_discovered_agents(),
        "agents_loaded": count_loaded_agents(),
        "load_failures": count_load_failures(),
        "load_time": measure_load_time(),
        "ide_compatibility": get_ide_compatibility_stats()
    }
    
    send_metrics(metrics)
```

### Capability Usage Tracking
```python
def track_capability_usage(agent_id, capability, success=True):
    event = {
        "agent_id": agent_id,
        "capability": capability,
        "timestamp": get_timestamp(),
        "success": success,
        "ide_context": get_ide_context()
    }
    
    log_event(event)
```

## 🚀 Performance Optimization

### Lazy Loading
```python
def lazy_load_agent(agent_config):
    # Only load when capability is requested
    def capability_factory(capability):
        if capability in agent_config["capabilities"]:
            return load_capability(agent_config, capability)
        return None
    
    return capability_factory
```

### Caching Strategy
```python
def cache_agent_config(agent_config):
    cache_key = f"agent:{agent_config['agent_id']}:{agent_config['agent_version']}"
    
    # Cache parsed configuration
    cache.set(cache_key, agent_config, ttl=3600)
    
    # Pre-load common capabilities
    for capability in agent_config.get("preload_capabilities", []):
        capability_key = f"capability:{capability}"
        cache.set(capability_key, load_capability(capability), ttl=1800)
```

## 🔗 Integration Points

### MCP Server Integration
```python
def integrate_mcp_servers(agent_config):
    if not agent_config.get("mcp_compatible"):
        return
    
    for server_name in agent_config.get("mcp_servers", []):
        server_config = load_mcp_server_config(server_name)
        register_mcp_tools(agent_config["agent_id"], server_config)
```

### IDE-Specific Adapters
```python
def create_ide_adapter(ide_name, agent_config):
    adapter_class = get_adapter_class(ide_name)
    adapter = adapter_class(agent_config)
    
    # Configure IDE-specific features
    adapter.configure_auto_completion()
    adapter.configure_tool_integration()
    adapter.configure_security_model()
    
    return adapter
```

---

*This auto-loader ensures seamless agent discovery and loading across all AI IDEs while maintaining security and performance standards.*