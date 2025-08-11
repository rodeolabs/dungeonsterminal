# Grok AI Integration

This module provides production-ready integration with X.AI's Grok API for the AI Dungeon Master system.

## Features

- 🤖 **Real Grok API Integration** - Production connection to X.AI's Grok API
- 💬 **Conversation Management** - Persistent conversation history with context management
- 🎯 **D&D Context** - Specialized prompting for tabletop RPG assistance
- 🛡️ **Error Handling** - Comprehensive error handling with retry logic
- 📊 **Logging & Monitoring** - Structured logging and usage tracking
- 🔧 **Configuration Management** - Environment-based configuration with validation

## Quick Start

### 1. Setup Environment Variables

```bash
# Required
export GROK_API_KEY=xai-your-api-key-here

# Optional
export GROK_MODEL=grok-beta
export GROK_TEMPERATURE=0.7
export GROK_MAX_TOKENS=1000
export CONVERSATION_CONTEXT_LIMIT=4000
export DND_EDITION=5e

# For conversation persistence
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_ANON_KEY=your-anon-key
```

### 2. Run the Terminal Interface

```bash
npm run grok
```

## Project Structure

```
src/grok/
├── cli.ts                    # CLI entry point
├── index.ts                  # Main module exports
├── client/                   # API client implementation
├── conversation/             # Conversation management
├── terminal/                 # Terminal interface
├── config/                   # Configuration management
│   └── ConfigurationManager.ts
├── utils/                    # Utilities and helpers
│   ├── logger.ts
│   └── ErrorHandler.ts
├── types/                    # TypeScript type definitions
│   ├── grok-types.ts
│   ├── conversation-types.ts
│   └── config-types.ts
├── interfaces/               # Interface contracts
│   ├── IGrokAPIClient.ts
│   ├── IConversationManager.ts
│   ├── ITerminalInterface.ts
│   ├── IErrorHandler.ts
│   └── IConfigurationManager.ts
├── constants/                # System constants
│   └── grok-constants.ts
└── __tests__/               # Test files
    └── config/
        └── ConfigurationManager.test.ts
```

## Configuration

The system uses environment variables for configuration with sensible defaults:

| Variable | Default | Description |
|----------|---------|-------------|
| `GROK_API_KEY` | *required* | Your X.AI API key |
| `GROK_MODEL` | `grok-beta` | Grok model to use |
| `GROK_TEMPERATURE` | `0.7` | Response randomness (0-2) |
| `GROK_MAX_TOKENS` | `1000` | Maximum response length |
| `CONVERSATION_CONTEXT_LIMIT` | `4000` | Max context tokens |
| `DND_EDITION` | `5e` | D&D edition for context |
| `LOG_LEVEL` | `info` | Logging level |

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- ConfigurationManager.test.ts

# Run with coverage
npm run test:coverage
```

### Development Mode

```bash
# Run with hot reload
npm run grok:dev
```

## Implementation Status

- [x] **Task 1**: Project structure and core interfaces ✅
- [ ] **Task 2**: Grok API client with authentication
- [ ] **Task 3**: Conversation management system
- [ ] **Task 4**: Error handling system
- [ ] **Task 5**: Supabase database integration
- [ ] **Task 6**: Terminal interface
- [ ] **Task 7**: D&D-specific AI prompting
- [ ] **Task 8**: Real-time API communication
- [ ] **Task 9**: Logging and monitoring
- [ ] **Task 10**: Production configuration
- [ ] **Task 11**: Rate limiting and optimization
- [ ] **Task 12**: Comprehensive test suite
- [ ] **Task 13**: Security and data protection
- [ ] **Task 14**: Deployment and documentation
- [ ] **Task 15**: Final integration and testing

## Next Steps

1. Implement the Grok API client (Task 2)
2. Build conversation management (Task 3)
3. Add comprehensive error handling (Task 4)
4. Create terminal interface (Task 6)

## API Reference

### ConfigurationManager

```typescript
const configManager = new ConfigurationManager();
const config = await configManager.loadConfiguration();
```

### Logger

```typescript
const logger = Logger.getInstance();
logger.info('Message', { context: 'data' });
```

## Contributing

1. Follow the existing code structure and patterns
2. Add tests for new functionality
3. Update documentation for API changes
4. Ensure all tests pass before submitting

## License

MIT License - see the main project LICENSE file for details.