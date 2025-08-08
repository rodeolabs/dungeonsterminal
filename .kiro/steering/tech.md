# Technology Stack

## Core Technologies
- **Kiro AI Assistant**: Primary development assistant with autonomous and supervised modes for RPG development
- **Model Context Protocol (MCP)**: Integration framework connecting 5 specialized AI services
- **VSCode**: Primary IDE with Kiro extension for campaign development

## MCP Server Capabilities

### 1. **Fetch Server** (`mcp-server-fetch`)
- **Purpose**: Web requests and API integration for RPG content
- **RPG Applications**: 
  - Fetch D&D rules and spell descriptions from online sources
  - Integrate with RPG APIs (D&D Beyond, Roll20)
  - Pull real-world data for campaign inspiration
- **Command**: `uvx mcp-server-fetch`

### 2. **GitHub Server** (`github-mcp-server`)
- **Purpose**: Repository management and collaboration
- **RPG Applications**:
  - Version control for campaign notes and world-building
  - Collaborative campaign development with multiple DMs
  - Issue tracking for campaign bugs and player feedback
  - Store character sheets and campaign assets
- **Command**: `docker run ghcr.io/github/github-mcp-server`

### 3. **Playwright Server** (`@playwright/mcp`)
- **Purpose**: Browser automation and web interaction
- **RPG Applications**:
  - Automate virtual tabletop interactions (Roll20, Foundry VTT)
  - Screenshot generation for campaign documentation
  - Automated dice rolling and character sheet updates
  - Web-based campaign management
- **Command**: `npx @playwright/mcp@latest`

### 4. **Supabase Server** (`@supabase/mcp-server-supabase`)
- **Purpose**: Database operations and real-time data management
- **RPG Applications**:
  - Persistent campaign state and world data
  - Character progression tracking
  - Session logs and narrative continuity
  - Real-time multiplayer campaign synchronization
- **Command**: `npx @supabase/mcp-server-supabase@latest`
- **Project**: `https://csuofiqpafmbcemoosji.supabase.co`

### 5. **Firecrawl Server** (`firecrawl-mcp`)
- **Purpose**: Advanced web scraping and content extraction
- **RPG Applications**:
  - Scrape RPG wikis and lore databases
  - Extract character builds and optimization guides
  - Research campaign settings and historical references
  - Generate inspiration from fantasy literature online
- **Command**: `npx firecrawl-mcp`

## Configuration Management
- **MCP Configuration**: Managed via `.kiro/settings/mcp.json` (workspace) or `~/.kiro/settings/mcp.json` (global)
- **VSCode Settings**: Project-specific settings in `.vscode/settings.json`
- **Steering Rules**: AI guidance documents in `.kiro/steering/`

## RPG Development Workflow
1. **Research Phase**: Use Firecrawl and Fetch to gather RPG content and inspiration
2. **World Building**: Store campaign data in Supabase with version control via GitHub
3. **Session Management**: Use Playwright for virtual tabletop automation
4. **Narrative Continuity**: Leverage database persistence for long-term campaign memory
5. **Collaboration**: GitHub integration for multi-DM campaign development

## Common Commands
- Kiro chat interface for AI Dungeon Master development
- Command palette (`Cmd+Shift+P`) for MCP and Kiro-specific commands
- MCP server management through Kiro's feature panel
- Database migrations via Supabase MCP tools
- Automated testing via Playwright integration