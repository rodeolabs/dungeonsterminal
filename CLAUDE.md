# Claude Development Guidelines

This file contains development guidelines and project context for Claude AI assistant when working on the Dungeons Terminal project.

## Project Overview
Dungeons Terminal is an AI-powered Dungeon Master system that leverages MCP (Model Context Protocol) integration to provide comprehensive D&D campaign management capabilities.

## Architecture Principles
- **TypeScript-first**: All code should be written in TypeScript with strict type checking enabled
- **MCP Integration**: Leverage the 5 integrated MCP services (Supabase, Fetch, Firecrawl, Playwright, GitHub) for all operations
- **Modular Design**: Each service should be self-contained and implement the BaseMCPService interface
- **Error Handling**: All services should provide consistent error responses using the standardized format
- **Testing**: Comprehensive test coverage is required for all new features (unit, integration, e2e)

## Key Components

### MCP Services
1. **Supabase Service** (`src/services/mcp/supabase-service.ts`)
   - Database operations for campaigns, characters, sessions
   - Row Level Security (RLS) implementation
   - Real-time subscriptions

2. **Fetch Service** (`src/services/mcp/fetch-service.ts`)
   - D&D 5e API integration
   - Custom HTTP requests for external data
   - Monster, spell, equipment, class, and race data retrieval

3. **Firecrawl Service** (`src/services/mcp/firecrawl-service.ts`)
   - Web scraping for D&D content inspiration
   - Official D&D sources monitoring
   - Community content aggregation

4. **Playwright Service** (`src/services/mcp/playwright-service.ts`)
   - Automated testing and validation
   - Browser automation for web scraping
   - Performance testing capabilities

5. **GitHub Service** (`src/services/mcp/github-service.ts`)
   - Repository management
   - Documentation creation
   - Issue and project tracking

### AI Dungeon Master (`src/services/ai-dm.ts`)
- OpenAI GPT-4 integration
- Context-aware narrative generation
- Dynamic encounter creation
- NPC generation with personality and backstory
- Multiple narrative styles and lengths

### Database Schema
- Located in `supabase/migrations/`
- Comprehensive schema covering campaigns, characters, sessions, NPCs, locations
- Row Level Security policies implemented
- Triggers for automatic timestamp updates

## Development Commands

### Testing
- `npm test` - Run unit and integration tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run test:e2e` - Run Playwright end-to-end tests

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Code Style Guidelines

### TypeScript
- Use strict mode with all strict compiler options enabled
- Prefer explicit types over `any`
- Use interfaces for object shapes
- Use enums for fixed sets of values
- Implement proper error handling with custom error classes

### API Design
- Follow RESTful conventions
- Use consistent response formats: `{ success: boolean, data?: any, error?: string }`
- Validate all inputs using Zod schemas
- Implement proper HTTP status codes
- Use async/await for all asynchronous operations

### Database
- Use UUID primary keys
- Implement RLS policies for all tables
- Include created_at and updated_at timestamps
- Use JSONB for flexible schema fields
- Create appropriate indexes for performance

### Testing
- Write unit tests for all service methods
- Create integration tests for API endpoints
- Use Playwright for end-to-end testing
- Mock external dependencies in tests
- Aim for >80% test coverage

## Environment Configuration

### Required Environment Variables
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
```

### Optional Environment Variables
```
FIRECRAWL_API_KEY=your_firecrawl_key
GITHUB_TOKEN=your_github_token
PORT=3000
NODE_ENV=development
```

## Common Patterns

### MCP Service Implementation
```typescript
export class NewMCPService extends BaseMCPService {
  name = 'service-name';
  description = 'Service description';

  getAvailableTools(): MCPTool[] {
    return [
      {
        name: 'tool_name',
        description: 'Tool description',
        inputSchema: {
          type: 'object',
          properties: {
            param: { type: 'string' }
          },
          required: ['param']
        }
      }
    ];
  }

  async executeRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      switch (request.method) {
        case 'tool_name':
          return await this.handleToolName(request.params);
        default:
          return { success: false, error: `Unknown method: ${request.method}` };
      }
    } catch (error) {
      return this.handleError(error);
    }
  }
}
```

### API Route Implementation
```typescript
import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, ApiError } from '../middleware/error-handler';

const router = Router();

const requestSchema = z.object({
  field: z.string().min(1)
});

router.post('/', asyncHandler(async (req, res) => {
  const validatedData = requestSchema.parse(req.body);
  
  const result = await someService.process(validatedData);
  
  res.json({
    success: true,
    data: result
  });
}));
```

## Troubleshooting

### Common Issues
1. **Supabase Connection**: Ensure URL and keys are correct
2. **OpenAI Rate Limits**: Implement proper retry logic
3. **TypeScript Errors**: Run `npm run typecheck` to identify issues
4. **Test Failures**: Check mock implementations in `src/test/setup.ts`

### Debug Mode
Set `NODE_ENV=development` and check logs using the logger utility:
```typescript
import { logger } from '../utils/logger';
logger.info('Debug message', { context: 'additional data' });
```

## Performance Considerations
- Use database indexes appropriately
- Implement pagination for large data sets
- Cache frequently accessed data
- Monitor API response times
- Use connection pooling for database operations

## Security Best Practices
- Validate all inputs using Zod schemas
- Implement RLS policies on all database tables
- Never log sensitive information (API keys, tokens)
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization