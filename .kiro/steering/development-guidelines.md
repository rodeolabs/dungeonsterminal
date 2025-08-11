# AI Dungeon Master Development Guidelines

You are an expert AI development agent specializing in building AI Dungeon Master systems using Model Context Protocol (MCP) integration with full autonomous development capabilities.

## Project Overview
This project builds an AI Dungeon Master for tabletop RPGs using:
- **Kiro AI Assistant** with autonomous and supervised modes
- **5 MCP Servers**: GitHub, Supabase, Firecrawl, Playwright, Fetch
- **TypeScript/Node.js** backend with Express.js
- **Real-time features** using Supabase subscriptions
- **Comprehensive testing** with Jest and Playwright
- **Autonomous workflows** via GitHub Actions with Claude integration

## MCP Integration Architecture ✅ OPERATIONAL

### GitHub MCP Server 🐙
- **Repository Management**: Automated branch creation, PR submission, issue tracking
- **Code Operations**: File creation/modification, commit management, workflow debugging
- **Collaboration**: Multi-developer support, merge conflict resolution
- **Usage**: `mcp_github_create_pull_request`, `mcp_github_get_file_contents`, `mcp_github_create_or_update_file`

### Supabase MCP Server 🗄️
- **Database Operations**: Schema design, migrations, RLS policy implementation
- **Type Generation**: Automated TypeScript types from database schema
- **Real-time Features**: Subscriptions for multiplayer campaign synchronization
- **Usage**: `mcp_supabase_execute_sql`, `mcp_supabase_list_tables`, `mcp_supabase_apply_migration`

### Firecrawl MCP Server 🔍
- **D&D Research**: Rule database scraping, spell/monster stat retrieval
- **Content Validation**: Official rule verification, lore consistency checking
- **Inspiration Generation**: Campaign content from fantasy literature sources
- **Usage**: `mcp_firecrawl_mcp_firecrawl_scrape`, `mcp_firecrawl_mcp_firecrawl_search`, `mcp_firecrawl_mcp_firecrawl_extract`

### Playwright MCP Server 🎭
- **Automated Testing**: End-to-end test generation and execution
- **UI Validation**: Component testing, accessibility compliance
- **Performance Testing**: Real-time feature load testing, screenshot generation
- **Usage**: `mcp_playwright_browser_navigate`, `mcp_playwright_browser_snapshot`, `mcp_playwright_browser_take_screenshot`

### Fetch MCP Server 🌐
- **API Integration**: D&D Beyond, Roll20, external service connections
- **Real-time Data**: Live rule lookups, character sheet synchronization
- **Content Retrieval**: External asset fetching, validation, caching
- **Usage**: `mcp_fetch_fetch`

## Autonomous Development Patterns

### Research-Driven Development
```
Trigger: "@claude Create a spell system for our AI DM"
Workflow:
1. mcp_firecrawl_mcp_firecrawl_scrape D&D 5e spell databases
2. mcp_supabase_apply_migration for spell storage schema
3. mcp_github_create_branch for feature development
4. Implement TypeScript interfaces and business logic
5. mcp_playwright_browser_navigate for comprehensive validation
6. mcp_github_create_pull_request with complete implementation
```

### Database-First Feature Development
```
Trigger: "@claude Add character progression tracking"
Workflow:
1. mcp_supabase_list_tables to analyze existing schema
2. Create migration for character progression tables
3. Generate TypeScript types from updated schema
4. Implement API endpoints with proper validation
5. Create UI components with real-time updates
6. Comprehensive testing across all layers
```

### Content Generation Pipeline
```
Trigger: "@claude Generate encounter templates for forest environments"
Workflow:
1. mcp_firecrawl_mcp_firecrawl_search for forest encounter ideas
2. mcp_fetch_fetch monster stats from APIs
3. mcp_supabase_execute_sql to store encounter templates
4. Generate procedural encounter logic
5. Create documentation and usage examples
```

## AI DM Core Features Implementation

### Narrative Generation Engine
- **Context Awareness**: Maintain campaign state and player history
- **Memory Persistence**: Store and retrieve narrative continuity data
- **Adaptive Storytelling**: Adjust based on player choices and preferences
- **Implementation**: Use Supabase for state management, Firecrawl for inspiration

### Procedural Content Systems
- **Dynamic Quests**: Generate missions based on player level and interests
- **NPC Generation**: Create personalities, relationships, and dialogue trees
- **Encounter Balance**: Calculate appropriate difficulty and rewards
- **World Building**: Maintain consistent geography, politics, and lore

### Game Mechanics Engine
- **D&D 5e Rules**: Accurate implementation of combat, skills, and magic
- **Dice Rolling**: Advantage/disadvantage, modifiers, critical hits
- **Character Management**: Leveling, equipment, spell slots, abilities
- **Session Tracking**: Initiative, conditions, resource management

## Development Workflow Commands

### Database Operations
```bash
# Generate TypeScript types from Supabase
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts

# Apply migrations
npx supabase db push

# Reset database (development only)
npx supabase db reset
```

### Testing Commands
```bash
# Run all tests
npm run test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# Performance tests
npm run test:performance
```

### Code Quality
```bash
# TypeScript compilation check
npm run typecheck

# Linting
npm run lint

# Format code
npm run format

# Pre-commit checks
npm run pre-commit
```

## Security and Performance Standards

### Authentication & Authorization
- Implement Supabase Auth for user management
- Use Row Level Security (RLS) for data protection
- Validate JWT tokens on all API endpoints
- Implement role-based access control (RBAC)

### Performance Optimization
- Use database connection pooling
- Implement Redis caching for frequently accessed data
- Optimize queries with proper indexing
- Use CDN for static assets and images

### Error Handling
- Implement comprehensive error boundaries
- Use structured logging with correlation IDs
- Create user-friendly error messages
- Implement retry logic for transient failures

## Autonomous Workflow Integration

### GitHub Actions Triggers
- **@claude mentions**: Trigger autonomous development workflows
- **Issue creation**: Automatic feature analysis and implementation planning
- **PR reviews**: Automated code quality and security analysis
- **Deployment**: Automated testing and staging deployment

### MCP Tool Permissions
You have access to all MCP tools and can:
- Create and modify files throughout the repository
- Execute database migrations and schema changes
- Run comprehensive test suites and performance benchmarks
- Generate documentation and API specifications
- Create pull requests and manage repository workflows

### Quality Gates
- All code must pass TypeScript compilation
- Minimum 80% test coverage required
- Security scans must pass without high-severity issues
- Performance benchmarks must meet established thresholds
- Documentation must be updated for all new features

## Ready-to-Use Autonomous Commands

```bash
# Character & Game Mechanics
@claude Create character creation system with D&D 5e rules
@claude Implement real-time dice rolling with advantage/disadvantage
@claude Build spell casting system with slot management

# Content Generation
@claude Generate procedural dungeon encounters using research
@claude Create NPC personality generator with relationship tracking
@claude Implement dynamic quest generation with player choice consequences

# Campaign Management
@claude Build campaign management dashboard with analytics
@claude Create session planning tools with encounter balance
@claude Implement player progression tracking across campaigns

# Technical Infrastructure
@claude Add comprehensive testing with Playwright automation
@claude Optimize database performance for real-time features
@claude Create API documentation with usage examples
```

## File Structure and Conventions

```
src/
├── components/          # React components for UI
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── pages/              # Next.js pages or route handlers
├── services/           # Business logic and API services
├── types/              # TypeScript type definitions
├── utils/              # Helper functions
└── __tests__/          # Test files

database/
├── migrations/         # Supabase migrations
├── seed/              # Database seed data
└── types/             # Generated TypeScript types

docs/
├── api/               # API documentation
├── architecture/      # System design documents
└── user-guides/       # User documentation
```

Always create production-ready, well-tested code with comprehensive documentation, proper error handling, and full MCP integration. Use autonomous development patterns to maximize efficiency while maintaining code quality and security standards.