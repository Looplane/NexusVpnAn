# GitHub MCP Server Setup Guide

**Document ID:** MCP-GITHUB-001  
**Created:** 17-12-2025 | Time: 13:30:13  
**Last Updated:** 17-12-2025 | Time: 13:30:13

**Related Documents:**
- @--DOCUMENTATIONS--/05-MCP/01-MCP-README_17-12-2025_022243.md (1-71)
- @--DOCUMENTATIONS--/05-MCP/13-MCP-MCP_API_KEYS_GUIDE_17-12-2025_024425.md (1-133)
- @--DOCUMENTATIONS--/05-MCP/16-MCP-MCP_QUICK_SETUP_17-12-2025_024425.md (1-50)

---

## Overview

The GitHub MCP server enables AI agents to interact with GitHub repositories, manage pull requests, track issues, read repository files, and manage branches. This server uses the official `@modelcontextprotocol/server-github` package.

## Features

- **Repository Operations**: Read files, browse directories, search code
- **Pull Request Management**: Create PRs, review PRs, merge PRs
- **Issue Tracking**: Create issues, comment on issues, manage labels
- **Branch Management**: Create branches, list branches, compare branches
- **Commit Operations**: View commit history, create commits
- **Repository Metadata**: Get repository info, list collaborators

## Prerequisites

- Node.js 18+ installed
- GitHub account
- GitHub Personal Access Token (PAT)

## Installation

The GitHub MCP server is configured to use `npx` and will be automatically installed on first use. No manual installation is required.

**Package:** `@modelcontextprotocol/server-github`

## Configuration

### Step 1: Create GitHub Personal Access Token

1. **Go to GitHub Settings**: https://github.com/settings/tokens
2. **Click "Generate new token"** → **"Generate new token (classic)"**
3. **Configure token settings**:
   - **Note**: `NexusVPN MCP Server`
   - **Expiration**: Choose appropriate expiration (90 days recommended)
   - **Scopes**: Select the following scopes:
     - `repo` (Full control of private repositories)
     - `read:org` (Read org and team membership)
     - `read:user` (Read user profile data)
     - `workflow` (Update GitHub Action workflows) - Optional
4. **Click "Generate token"**
5. **Copy the token immediately** (you won't be able to see it again)

### Step 2: Add Token to Environment

Add the token to your `.env.mcp` file:

```bash
# GitHub Configuration
# Get your token from: https://github.com/settings/tokens
# Required scopes: repo, read:org, read:user
GITHUB_TOKEN=ghp_your-personal-access-token-here
```

### Step 3: Update MCP Configuration

The GitHub MCP server is already configured in `mcp-config.json`:

```json
{
  "github": {
    "name": "GitHub MCP Server",
    "description": "MCP server for GitHub repository operations, PR management, and issue tracking",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
    }
  }
}
```

## Usage

### Available Tools

Once configured, the GitHub MCP server provides the following tools:

1. **`github_search_repositories`** - Search for repositories
2. **`github_get_repository`** - Get repository information
3. **`github_list_files`** - List files in a repository
4. **`github_read_file`** - Read file contents
5. **`github_create_pull_request`** - Create a new pull request
6. **`github_list_pull_requests`** - List pull requests
7. **`github_get_pull_request`** - Get pull request details
8. **`github_create_issue`** - Create a new issue
9. **`github_list_issues`** - List issues
10. **`github_get_issue`** - Get issue details
11. **`github_list_branches`** - List repository branches
12. **`github_create_branch`** - Create a new branch

### Example Usage

**Search repositories:**
```
Use GitHub MCP tool: github_search_repositories
QUERY: nexusvpn
CONTEXT: Find repositories related to NexusVPN
```

**Read a file:**
```
Use GitHub MCP tool: github_read_file
REPOSITORY: owner/repo
PATH: backend/src/main.ts
CONTEXT: Read the main backend file
```

**Create a pull request:**
```
Use GitHub MCP tool: github_create_pull_request
REPOSITORY: owner/repo
TITLE: Add new feature
BODY: Description of changes
HEAD: feature-branch
BASE: main
```

## Security Considerations

1. **Token Security**:
   - Never commit tokens to version control
   - Use environment variables only
   - Rotate tokens regularly
   - Use minimum required scopes

2. **Token Scopes**:
   - Only grant necessary permissions
   - `repo` scope gives full repository access
   - Consider using fine-grained tokens for better security

3. **Token Storage**:
   - Store in `.env.mcp` (not committed)
   - Use secure secret management in production
   - Never log or expose tokens

## Troubleshooting

### Issue: "Authentication failed"

**Solution:**
- Verify token is correct in `.env.mcp`
- Check token hasn't expired
- Ensure token has required scopes
- Regenerate token if needed

### Issue: "Repository not found"

**Solution:**
- Verify repository name format: `owner/repo`
- Check token has access to the repository
- Ensure repository exists and is accessible

### Issue: "Permission denied"

**Solution:**
- Check token has required scopes
- Verify token has access to the repository
- For private repos, ensure `repo` scope is granted

## Testing

Test the GitHub MCP server connection:

```bash
# Test via MCP client
npx @modelcontextprotocol/server-github
```

Or use the MCP test script:
```bash
./mcp-scripts/test-mcp.sh github
```

## Integration with Cursor IDE

The GitHub MCP server is automatically available in Cursor IDE when configured in `mcp-config.json`. No additional setup is required.

## Related Resources

- **GitHub API Documentation**: https://docs.github.com/en/rest
- **MCP GitHub Server**: https://www.npmjs.com/package/@modelcontextprotocol/server-github
- **GitHub Token Guide**: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token

---

**Last Updated:** 17-12-2025 | Time: 13:30:13
