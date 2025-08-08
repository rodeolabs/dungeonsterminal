# 🎲 Dungeons Terminal

An AI-powered Dungeon Master system built with TypeScript, featuring comprehensive MCP (Model Context Protocol) integration for enhanced D&D campaign management.

## 🌟 Features

### AI Dungeon Master Core
- **Narrative Generation**: Context-aware storytelling with multiple styles (dramatic, humorous, serious, mysterious)
- **Dynamic Encounters**: Balanced combat encounters based on party level and composition
- **NPC Creation**: Rich character generation with personality, backstory, and relationship dynamics
- **Content Adaptation**: AI responses that adapt to campaign context and player actions

### MCP Integration Suite
- **🗄️ Supabase**: Database operations for campaigns, characters, sessions, and AI content storage
- **🌐 Fetch**: D&D 5e API integration for spells, monsters, equipment, classes, and races
- **🔥 Firecrawl**: Web scraping for D&D content inspiration and official updates monitoring
- **🎭 Playwright**: Automated testing and browser automation for system validation
- **📱 GitHub**: Repository management, documentation creation, and project tracking

### Database Architecture
- **Row Level Security (RLS)**: Secure multi-tenant data access
- **Real-time Subscriptions**: Live updates using Supabase subscriptions
- **Comprehensive Schema**: Campaigns, characters, sessions, NPCs, locations, and AI content tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- TypeScript 5+
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rodeolabs/dungeonsterminal.git
   cd dungeonsterminal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file with:
   ```env
   # Supabase Configuration
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here

   # MCP Tool Configuration
   FIRECRAWL_API_KEY=your_firecrawl_api_key_here
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   # Apply Supabase migrations
   supabase db push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### AI Dungeon Master Endpoints

#### Generate Narrative
```http
POST /api/ai-dm/generate
Content-Type: application/json

{
  "prompt": "The party enters a mysterious cave",
  "context": {
    "campaignId": "uuid",
    "characterNames": ["Aragorn", "Legolas"],
    "currentLocation": "Moria"
  },
  "style": "dramatic",
  "length": "medium"
}
```

#### Create Encounter
```http
POST /api/ai-dm/encounter

{
  "partyLevel": 5,
  "partySize": 4,
  "difficulty": "hard",
  "environment": "forest",
  "theme": "undead"
}
```

#### Generate NPC
```http
POST /api/ai-dm/npc

{
  "name": "Elara Nightwhisper",
  "race": "Elf",
  "occupation": "Ranger",
  "campaignId": "uuid"
}
```

### Campaign Management

#### Create Campaign
```http
POST /api/campaigns

{
  "title": "Lost Mines of Phandelver",
  "description": "A classic D&D adventure",
  "dm_user_id": "uuid",
  "setting_info": {
    "world": "Forgotten Realms",
    "region": "Sword Coast"
  }
}
```

#### Character Creation
```http
POST /api/characters

{
  "name": "Thorin Ironforge",
  "class": "Fighter",
  "race": "Dwarf",
  "level": 1,
  "campaign_id": "uuid",
  "player_user_id": "uuid",
  "stats": {
    "strength": 16,
    "dexterity": 12,
    "constitution": 15,
    "intelligence": 10,
    "wisdom": 13,
    "charisma": 8
  }
}
```

## 🧪 Testing

### Run Test Suite
```bash
# Unit and integration tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# End-to-end tests
npm run test:e2e
```

### Test Categories
- **Unit Tests**: Service layer logic and utilities
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Full system workflow validation using Playwright

## 🏗️ Architecture

### System Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend/UI   │    │   API Gateway   │    │   AI Services   │
│                 │◄──►│   (Express)     │◄──►│   (OpenAI)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  MCP Manager    │
                       │                 │
                       └─────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌─────────────┐      ┌─────────────┐        ┌─────────────┐
│  Supabase   │      │  Firecrawl  │        │  Playwright │
│  Service    │      │  Service    │        │  Service    │
└─────────────┘      └─────────────┘        └─────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────┐      ┌─────────────┐        ┌─────────────┐
│  Database   │      │  Web Scrape │        │  Testing    │
│  Operations │      │  & Research │        │  Automation │
└─────────────┘      └─────────────┘        └─────────────┘
```

### MCP Service Architecture
Each MCP service implements the `BaseMCPService` interface providing:
- **Tool Discovery**: Available operations and their schemas
- **Request Execution**: Type-safe parameter validation and processing  
- **Error Handling**: Consistent error responses across all services
- **Health Monitoring**: Service status and availability tracking

### Database Schema
- **campaigns**: Campaign metadata and settings
- **characters**: Player characters with stats and equipment
- **sessions**: Game sessions with narrative logs and encounters
- **npcs**: Non-player characters with relationships
- **locations**: World locations and geography
- **ai_content**: Generated AI content with quality ratings

## 🔧 Configuration

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | ✅ |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `OPENAI_API_KEY` | OpenAI API key for AI features | ✅ |
| `FIRECRAWL_API_KEY` | Firecrawl API key for web scraping | ❌ |
| `GITHUB_TOKEN` | GitHub token for repository operations | ❌ |
| `PORT` | Server port | ❌ (default: 3000) |
| `NODE_ENV` | Environment mode | ❌ (default: development) |

### Development Scripts
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run typecheck    # Run TypeScript type checking
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests for new functionality**
5. **Run the test suite**
   ```bash
   npm test
   npm run test:e2e
   ```
6. **Commit your changes**
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
7. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **D&D 5e API**: For providing comprehensive D&D data
- **OpenAI**: For powering the AI Dungeon Master capabilities
- **Supabase**: For the real-time database and authentication
- **MCP Protocol**: For enabling seamless tool integration
- **Playwright**: For robust end-to-end testing capabilities

## 🎯 Roadmap

### Phase 1: Foundation ✅
- [x] Core AI DM functionality
- [x] MCP service integration
- [x] Database schema and RLS
- [x] Comprehensive testing suite

### Phase 2: Enhancement (Q2 2025)
- [ ] Real-time multiplayer sessions
- [ ] Advanced NPC AI personalities  
- [ ] Procedural dungeon generation
- [ ] Voice integration capabilities

### Phase 3: Platform (Q3 2025)
- [ ] Web frontend interface
- [ ] Mobile companion app
- [ ] Community content sharing
- [ ] Advanced analytics dashboard

---

Built with ❤️ for the D&D community by the Dungeons Terminal team.