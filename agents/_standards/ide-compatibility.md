# 🧠 IDE Compatibility Standards

Standards for ensuring AI agents work seamlessly across all major AI coding IDEs.

## 🎯 Supported IDEs

### Primary Support
- ✅ **Cursor** - Full native integration
- ✅ **Windsurf** - Advanced AI capabilities  
- ✅ **VS Code** - Universal compatibility
- ✅ **Trae** - Native MCP support

### Extended Support
- ✅ **Google AI Studio** - API-based integration
- ✅ **Anthropic Console** - Direct Claude integration
- ✅ **GitHub Copilot** - Extension compatibility
- ✅ **Tabnine** - AI assistant integration

## 🔧 Compatibility Matrix

| Feature | Cursor | Windsurf | VS Code | Trae | Google AI Studio |
|---------|---------|----------|---------|------|------------------|
| **Auto-Discovery** | ✅ Native | ✅ Advanced | ✅ Universal | ✅ Native | ✅ API-based |
| **MCP Integration** | ✅ Full | ✅ Advanced | ✅ Universal | ✅ Native | ✅ Standard |
| **Tool Execution** | ✅ Direct | ✅ Enhanced | ✅ Standard | ✅ Direct | ✅ API-based |
| **Security Model** | ✅ Granular | ✅ Advanced | ✅ Standard | ✅ Granular | ✅ OAuth-based |
| **Real-time Updates** | ✅ Live | ✅ Live | ✅ Polling | ✅ Live | ✅ Webhook |

## 📁 File Structure Compatibility

### IDE Detection Pattern
```
/agents/                    ← Primary discovery location
├── README.md             ← Auto-loader trigger
├── ide/
│   ├── cursor.agent.md   ← Cursor-specific config
│   ├── windsurf.agent.md ← Windsurf-specific config
│   ├── vscode.agent.md   ← VS Code universal config
│   └── generic.agent.md  ← Fallback configuration
└── _standards/
    └── ide-compatibility.md ← This file
```

### IDE-Specific Loading

#### Cursor IDE
```json
{
  "cursor_detection": {
    "trigger_files": ["cursor.agent.md", "README.md"],
    "capability_parsing": "yaml_frontmatter",
    "tool_integration": "native_mcp",
    "security_model": "granular_permissions"
  }
}
```

#### Windsurf IDE
```json
{
  "windsurf_detection": {
    "trigger_files": ["windsurf.agent.md", "README.md"],
    "capability_parsing": "advanced_yaml",
    "tool_integration": "enhanced_mcp",
    "security_model": "advanced_permissions"
  }
}
```

#### VS Code
```json
{
  "vscode_detection": {
    "trigger_files": ["vscode.agent.md", "*.agent.md", "README.md"],
    "capability_parsing": "universal_yaml",
    "tool_integration": "universal_mcp",
    "security_model": "standard_permissions"
  }
}
```

## 🚀 Auto-Loader Compatibility

### Discovery Algorithm
```python
def discover_agents_ide_compatible(project_root, ide_name):
    """
    IDE-specific agent discovery with compatibility checking
    """
    agents_path = project_root / "agents"
    
    if not agents_path.exists():
        return []
    
    compatible_agents = []
    
    # IDE-specific file patterns
    ide_patterns = {
        "cursor": ["cursor.agent.md", "*.agent.md", "README.md"],
        "windsurf": ["windsurf.agent.md", "*.agent.md", "README.md"], 
        "vscode": ["vscode.agent.md", "*.agent.md", "README.md"],
        "trae": ["*.agent.md", "README.md"],
        "generic": ["README.md"]
    }
    
    patterns = ide_patterns.get(ide_name, ide_patterns["generic"])
    
    for pattern in patterns:
        for agent_file in agents_path.glob(pattern):
            agent_config = parse_agent_with_ide_compatibility(agent_file, ide_name)
            if agent_config and is_ide_compatible(agent_config, ide_name):
                compatible_agents.append(agent_config)
    
    return compatible_agents
```

### Compatibility Validation
```python
def validate_ide_compatibility(agent_config, ide_name):
    """
    Validate agent compatibility with specific IDE
    """
    # Check explicit IDE compatibility
    if ide_name not in agent_config.get("ide_compatibility", []):
        return False
    
    # Check MCP compatibility if required
    if requires_mcp(ide_name) and not agent_config.get("mcp_compatible"):
        return False
    
    # Check capability support
    ide_capabilities = get_ide_capabilities(ide_name)
    agent_capabilities = agent_config.get("capabilities", [])
    
    if not all(cap in ide_capabilities for cap in agent_capabilities):
        return False
    
    # Check security model compatibility
    if not validate_security_model(agent_config, ide_name):
        return False
    
    return True
```

## 🔐 Security Model Compatibility

### Permission Mapping
```typescript
interface IDESecurityCompatibility {
  cursor: {
    permissions: ["read", "write", "execute", "admin"],
    granularity: "fine_grained",
    dynamic: true
  },
  windsurf: {
    permissions: ["read", "write", "execute", "admin", "advanced"],
    granularity: "advanced_grained", 
    dynamic: true
  },
  vscode: {
    permissions: ["read", "write", "execute"],
    granularity: "standard_grained",
    dynamic: false
  },
  trae: {
    permissions: ["read", "write", "execute", "admin"],
    granularity: "fine_grained",
    dynamic: true
  }
}
```

### Security Validation
```python
def validate_security_compatibility(agent_config, ide_name):
    """
    Ensure agent security model is compatible with IDE
    """
    agent_permissions = agent_config.get("permissions", {})
    ide_security = get_ide_security_model(ide_name)
    
    # Check permission compatibility
    for permission_type, permissions in agent_permissions.items():
        ide_supported = ide_security.get("permissions", [])
        if not all(p in ide_supported for p in permissions):
            return False
    
    # Check granularity compatibility
    if ide_security["granularity"] == "standard_grained":
        # Agent must use standard permission model
        if not is_standard_permission_model(agent_permissions):
            return False
    
    return True
```

## 📊 Compatibility Testing

### Automated Testing Suite
```python
class IDECompatibilityTester:
    def __init__(self):
        self.test_cases = [
            "agent_discovery",
            "capability_loading", 
            "tool_execution",
            "security_enforcement",
            "error_handling"
        ]
    
    def test_ide_compatibility(self, ide_name, agent_config):
        """Run comprehensive compatibility tests"""
        results = {}
        
        for test_case in self.test_cases:
            test_method = getattr(self, f"test_{test_case}")
            results[test_case] = test_method(ide_name, agent_config)
        
        return {
            "ide": ide_name,
            "agent": agent_config["agent_id"],
            "compatibility_score": calculate_score(results),
            "test_results": results
        }
```

### Continuous Compatibility Monitoring
```python
def monitor_ide_compatibility():
    """
    Continuously monitor compatibility across IDEs
    """
    while True:
        for ide in SUPPORTED_IDES:
            for agent in get_active_agents():
                compatibility = test_ide_compatibility(ide, agent)
                
                if compatibility["score"] < COMPATIBILITY_THRESHOLD:
                    alert_compatibility_issue(ide, agent, compatibility)
                
                log_compatibility_metrics(compatibility)
        
        time.sleep(COMPATIBILITY_CHECK_INTERVAL)
```

## 🎯 Best Practices

### 1. Universal Design
- Design agents to work across multiple IDEs
- Use standard MCP protocols where possible
- Implement graceful degradation
- Provide clear compatibility documentation

### 2. IDE-Specific Optimization
- Leverage unique IDE features when available
- Optimize for IDE-specific workflows
- Maintain fallback compatibility
- Document IDE-specific behaviors

### 3. Security Consistency
- Maintain consistent security models
- Implement proper permission mapping
- Validate security across platforms
- Audit security compliance regularly

### 4. Performance Optimization
- Minimize IDE-specific overhead
- Optimize for common use cases
- Implement efficient discovery mechanisms
- Cache compatibility results

## 🔗 Integration Guidelines

### For Agent Developers
1. Test across all target IDEs
2. Document IDE-specific features
3. Implement proper error handling
4. Follow MCP standards strictly

### For IDE Vendors
1. Support standard discovery mechanisms
2. Implement MCP compatibility
3. Provide clear capability APIs
4. Maintain security standards

---

*These standards ensure seamless compatibility across all AI coding IDEs while maintaining security and performance standards.*