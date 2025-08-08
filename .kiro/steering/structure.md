# Project Structure

## Directory Organization

```
.
├── .kiro/                    # Kiro AI assistant configuration
│   └── steering/            # AI guidance documents (always included)
│       ├── product.md       # Product overview and purpose
│       ├── tech.md         # Technology stack and commands
│       └── structure.md    # This file - project organization
└── .vscode/                 # VSCode workspace configuration
    └── settings.json       # IDE-specific settings
```

## Configuration Files

### Kiro Configuration
- **`.kiro/steering/`**: Contains markdown files that guide AI behavior
  - Files are automatically included in AI context
  - Can reference other files using `#[[file:<relative_file_name>]]`
  - Support conditional inclusion with front-matter

### VSCode Integration
- **`.vscode/settings.json`**: Workspace-specific IDE settings
  - Currently enables MCP configuration: `"kiroAgent.configureMCP": "Enabled"`

## File Conventions
- Steering documents use markdown format
- Configuration files use JSON format
- All paths are relative to workspace root
- MCP configurations can exist at workspace or user level