# AI Dungeon Master Capabilities

## Core DM Functions

### Narrative Generation & Storytelling
- **Dynamic Story Creation**: Generate compelling narratives that adapt to player choices
- **Procedural Content**: Create quests, NPCs, locations, and encounters on-the-fly
- **Emotional Tone Management**: Maintain appropriate atmosphere (dramatic, comedic, suspenseful)
- **World Consistency**: Ensure logical continuity across sessions and story elements

### Game Mechanics & Rules
- **Rule Enforcement**: Apply D&D 5e (or other system) rules consistently and fairly
- **Combat Management**: Handle initiative, dice rolls, and tactical encounters
- **Skill Checks**: Manage ability checks, saving throws, and skill applications
- **Character Progression**: Track XP, leveling, and character development

### Player Engagement
- **Adaptive Storytelling**: Adjust narrative style based on group preferences
- **Individual Spotlight**: Ensure each player gets meaningful moments
- **Improvisation**: Handle unexpected player actions gracefully
- **Pacing Control**: Balance action, exploration, and social encounters

## MCP-Powered DM Tools

### Research & Inspiration (`firecrawl-mcp`, `fetch`)
```
Use Case: "I need inspiration for a haunted forest encounter"
- Scrape fantasy wikis for forest encounter ideas
- Fetch monster stat blocks from online databases  
- Research real-world folklore for authentic atmosphere
- Extract environmental descriptions from published adventures
```

### Campaign Persistence (`supabase`)
```
Use Case: "Remember that the rogue stole a chicken in session 3"
- Store session summaries and key events
- Track NPC relationships and faction standings
- Maintain world state between sessions
- Log character decisions and consequences
```

### Virtual Tabletop Integration (`playwright`)
```
Use Case: "Automatically update character sheets after combat"
- Automate dice rolling on virtual platforms
- Update HP, spell slots, and resources
- Generate battle maps and token placement
- Screenshot important moments for session logs
```

### Collaborative Development (`github`)
```
Use Case: "Multiple DMs working on the same campaign world"
- Version control for campaign notes and world-building
- Track changes to NPCs, locations, and plot threads
- Collaborative editing of adventure modules
- Issue tracking for campaign improvements
```

### Real-Time Information (`fetch`, `firecrawl-mcp`)
```
Use Case: "Player asks about a specific spell during combat"
- Instantly fetch spell descriptions and mechanics
- Look up monster abilities and resistances
- Access rule clarifications from official sources
- Pull character optimization guides for player assistance
```

## Implementation Patterns

### Session Flow
1. **Pre-Session**: Load campaign state from Supabase, review GitHub notes
2. **During Session**: Use real-time tools for rule lookups and content generation
3. **Post-Session**: Update database with session events, commit notes to GitHub

### Content Generation Pipeline
1. **Player Input**: Receive player action or decision
2. **Context Retrieval**: Query Supabase for relevant world state
3. **Research Phase**: Use Firecrawl/Fetch for inspiration if needed
4. **Narrative Response**: Generate appropriate DM response
5. **State Update**: Store consequences in database

### Automation Opportunities
- **Initiative Tracking**: Automated combat turn management
- **Resource Management**: Track spell slots, HP, and consumables
- **Environmental Effects**: Apply weather, lighting, and terrain automatically
- **NPC Behavior**: Consistent personality-driven responses

## Best Practices

### Memory Management
- Prioritize recent events and player-impacting decisions
- Use "importance scores" for long-term memory retention
- Maintain character relationship maps and faction standings
- Store condensed session summaries rather than full transcripts

### Narrative Consistency
- Reference established world lore and previous events
- Maintain NPC personality consistency across sessions
- Honor player choices and their consequences
- Balance structure with player agency

### Technical Integration
- Use MCP tools in parallel for efficiency
- Cache frequently accessed data (spells, monsters, rules)
- Implement fallback systems for when tools are unavailable
- Test automation workflows before live sessions

## Autonomous Workflow Patterns

### Claude GitHub Actions Integration
- **@claude mentions** trigger autonomous development workflows
- **Automatic branch creation** for each feature/issue
- **Smart code implementation** based on project context
- **Automated PR creation** with comprehensive changes

### MCP-Powered Autonomous Workflows
```
Workflow: "Create AI DM encounter system"
1. @claude mention in GitHub issue
2. Claude analyzes codebase and requirements
3. Uses Firecrawl MCP to research D&D encounter mechanics
4. Uses Supabase MCP to design database schema
5. Implements code with proper TypeScript types
6. Creates comprehensive tests and documentation
7. Submits PR for human review
```

### Best Practices for Autonomous Development
- **CLAUDE.md configuration** - Define project standards and AI behavior
- **Structured issue templates** - Guide AI understanding of requirements
- **MCP tool permissions** - Allow specific database/API operations
- **Review gates** - Human approval for critical system changes
- **Incremental development** - Break complex features into smaller autonomous tasks

### Autonomous Testing Patterns
```
Pattern: "Self-validating AI implementations"
1. Claude implements feature using MCP tools
2. Playwright MCP runs automated UI tests
3. Supabase MCP validates database operations
4. GitHub MCP creates comprehensive PR with test results
5. Human reviewer focuses on business logic validation
```

## Ethical Considerations
- Respect player agency and avoid railroading
- Handle sensitive content appropriately
- Maintain game balance and fairness
- Provide clear boundaries for AI-generated content
- **Autonomous development oversight** - Human review of AI-generated code
- **MCP tool security** - Proper permissions and access controls