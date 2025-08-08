# Autonomous Development Workflows

## Claude GitHub Actions Integration

### Workflow Configuration
Our dungeonsterminal repository is configured with two Claude workflows:

1. **claude.yml** - Main interaction workflow
   - Triggers on @claude mentions in issues/PRs
   - Creates branches automatically for issues
   - Implements features based on natural language requests
   - Uses CLAUDE_CODE_OAUTH_TOKEN for authentication

2. **claude-code-review.yml** - Automated code review
   - Triggers on PR creation/updates
   - Provides comprehensive code analysis
   - Focuses on security, performance, and best practices
   - Can be customized for different contributor types

### MCP-Enhanced Autonomous Patterns

#### Pattern 1: Research-Driven Development
```
Trigger: "@claude Create a spell system for our AI DM"
Workflow:
1. Firecrawl MCP scrapes D&D 5e spell databases
2. Supabase MCP designs spell storage schema
3. GitHub MCP creates feature branch
4. Claude implements TypeScript interfaces and logic
5. Playwright MCP creates automated tests
6. PR submitted with complete implementation
```

#### Pattern 2: Database-First Feature Development
```
Trigger: "@claude Add character progression tracking"
Workflow:
1. Supabase MCP analyzes existing schema
2. Creates migration for character progression tables
3. Generates TypeScript types from database schema
4. Implements API endpoints with proper validation
5. Creates UI components with real-time updates
6. Comprehensive testing across all layers
```

#### Pattern 3: Content Generation Pipeline
```
Trigger: "@claude Generate encounter templates for forest environments"
Workflow:
1. Firecrawl MCP researches forest encounter ideas
2. Fetch MCP pulls monster stats from APIs
3. Supabase MCP stores encounter templates
4. Claude generates procedural encounter logic
5. Creates documentation and usage examples
```

## Best Practices for Autonomous Development

### Issue Template Optimization
Structure issues to maximize Claude's understanding:
```markdown
## Feature Request: [Clear, specific title]

### Context
- Current system state
- User story or use case
- Technical constraints

### Requirements
- [ ] Specific deliverable 1
- [ ] Specific deliverable 2
- [ ] Testing requirements

### MCP Tools Needed
- [ ] Supabase (database operations)
- [ ] Firecrawl (research/content)
- [ ] Playwright (testing)
- [ ] GitHub (repository management)

@claude Please implement this feature following our AI DM architecture patterns.
```

### CLAUDE.md Configuration
Create project-specific guidelines for autonomous development:
```markdown
# AI Dungeon Master Development Guidelines

## Architecture Patterns
- Use TypeScript for all new code
- Follow MCP integration patterns for external services
- Implement proper error handling and logging
- Create comprehensive tests for all features

## Database Operations
- Use Supabase MCP for all database interactions
- Create migrations for schema changes
- Generate TypeScript types from database schema
- Implement proper RLS policies

## Content Generation
- Use Firecrawl MCP for D&D research and inspiration
- Validate all generated content against official rules
- Store reusable content in database for consistency
- Implement caching for frequently accessed data

## Testing Requirements
- Unit tests for all business logic
- Integration tests for MCP tool interactions
- End-to-end tests using Playwright MCP
- Performance tests for real-time features
```

### Security and Permissions

#### MCP Tool Access Control
```yaml
# Recommended MCP permissions for autonomous workflows
supabase:
  - read: all tables
  - write: user_generated_content, sessions, characters
  - admin: migrations (with approval)

firecrawl:
  - scrape: approved domains only
  - rate_limit: 100 requests/hour

github:
  - read: repository contents
  - write: branches, PRs, issues
  - admin: none (human approval required)

playwright:
  - execute: test suites only
  - no_external_requests: true
```

#### Human Review Gates
- **Database migrations** - Always require human approval
- **Security-related changes** - Manual security review
- **API integrations** - Review external service usage
- **Performance-critical code** - Benchmark validation

## Monitoring and Optimization

### Autonomous Workflow Metrics
- **Success rate** - Percentage of @claude requests completed successfully
- **Review time** - Time from PR creation to human approval
- **Test coverage** - Automated test coverage of AI-generated code
- **MCP tool usage** - Efficiency of tool combinations

### Continuous Improvement
- **Feedback loops** - Learn from human PR reviews
- **Pattern recognition** - Identify successful workflow patterns
- **Tool optimization** - Improve MCP tool integration efficiency
- **Documentation updates** - Keep CLAUDE.md current with learnings

## Integration with AI DM Development

### Campaign Management Workflows
```
"@claude Create a new campaign management system"
→ Research existing TTRPG campaign tools
→ Design database schema for campaigns, sessions, NPCs
→ Implement real-time collaboration features
→ Create DM dashboard with campaign analytics
→ Generate comprehensive documentation
```

### Procedural Content Generation
```
"@claude Implement dynamic quest generation"
→ Research quest structure patterns
→ Create quest template system in database
→ Implement procedural generation algorithms
→ Add player choice tracking and consequences
→ Create testing framework for quest quality
```

## Local-Remote Merge Strategy

### Standardized Merge Workflow

#### 1. Initial Repository Setup
```bash
# Initialize local repository
git init
git remote add origin https://github.com/rodeolabs/dungeonsterminal.git

# Create comprehensive .gitignore before any commits
# Include: .env, node_modules/, dist/, .supabase/, mcp-*.log
```

#### 2. MCP-Enhanced Merge Process
```bash
# Step 1: Fetch remote state using GitHub MCP
# - Check for new branches created by Claude
# - Identify any autonomous changes

# Step 2: Handle merge conflicts intelligently
git fetch origin
git pull origin main --allow-unrelated-histories

# Step 3: Preserve local configurations
# - Backup local .env and config files
# - Merge comprehensive .gitignore
# - Maintain .kiro/ steering documents
```

#### 3. Autonomous Merge Resolution
Use GitHub MCP for intelligent merge operations:
- **Branch Management**: Create feature branches for local changes
- **Conflict Resolution**: Use MCP tools to analyze and resolve conflicts
- **File Synchronization**: Maintain consistency between local and remote
- **Configuration Preservation**: Protect sensitive local configurations

#### 4. Post-Merge Validation
```bash
# Validate merge success
npm install          # Ensure dependencies are correct
npm run typecheck    # Validate TypeScript compilation
npm run test         # Run test suite
npm run lint         # Check code quality
```

### MCP-Powered Merge Automation

#### GitHub MCP Integration
```javascript
// Automated merge workflow using GitHub MCP
const mergeStrategy = {
  // 1. Create feature branch for local changes
  createBranch: "feature/local-sync-{timestamp}",
  
  // 2. Push local changes to feature branch
  pushChanges: "all uncommitted local work",
  
  // 3. Create PR for review and merge
  createPR: {
    title: "Sync local development with remote",
    body: "Automated sync of local changes with remote repository",
    reviewers: ["human-reviewer"]
  }
}
```

#### Conflict Resolution Patterns
```yaml
# .github/workflows/merge-conflict-resolution.yml
name: Autonomous Merge Conflict Resolution

on:
  pull_request:
    types: [opened]
    branches: [main]

jobs:
  resolve-conflicts:
    if: contains(github.event.pull_request.title, 'local-sync')
    runs-on: ubuntu-latest
    steps:
      - name: Auto-resolve common conflicts
        uses: anthropics/claude-code-action@beta
        with:
          direct_prompt: |
            Resolve merge conflicts intelligently:
            - Preserve local .env configurations
            - Merge .gitignore files comprehensively
            - Maintain steering document updates
            - Keep MCP configurations intact
```

### Best Practices for Autonomous Merges

#### 1. Configuration Management
- **Local Configs**: Never commit .env, keep in .gitignore
- **Steering Documents**: Always preserve local .kiro/ updates
- **MCP Settings**: Maintain local MCP server configurations
- **IDE Settings**: Keep .vscode/ settings synchronized

#### 2. Automated Validation
- **Pre-merge Checks**: Validate TypeScript, run tests, check lint
- **Post-merge Verification**: Ensure all MCP servers still functional
- **Dependency Sync**: Update package.json and lock files
- **Database Migrations**: Apply any new Supabase migrations

#### 3. Human Review Gates
- **Sensitive Changes**: Always review security-related modifications
- **Architecture Changes**: Human approval for major structural changes
- **Database Schema**: Review all migration files before applying
- **Workflow Updates**: Validate GitHub Actions changes

### Emergency Merge Recovery

#### Rollback Strategy
```bash
# If autonomous merge fails
git reset --hard HEAD~1           # Rollback last commit
git push origin main --force      # Reset remote (use carefully)

# Or create recovery branch
git checkout -b recovery/merge-fix
git revert HEAD                   # Safer option
```

#### MCP-Assisted Recovery
Use GitHub MCP to:
- Create recovery branches automatically
- Analyze merge conflicts and suggest resolutions
- Restore previous working state
- Document recovery actions for future reference

This autonomous workflow system enables rapid, high-quality development while maintaining human oversight for critical decisions and providing robust merge conflict resolution.