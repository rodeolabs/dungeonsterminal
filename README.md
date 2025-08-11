# AI Dungeon Master Terminal Interface

A retro-style terminal interface for playing text-based Dungeons and Dragons with AI integration. Experience the nostalgia of classic command-line RPGs with modern web technology and intelligent AI dungeon mastering.

## 🎲 Features

### Terminal Interface
- **Retro Terminal Aesthetics**: Green text on black background with authentic cursor blinking
- **Natural Language Processing**: Speak naturally - "I look around" or "I attack the goblin"
- **Command History**: Navigate previous commands with arrow keys
- **Multiple Themes**: Classic green, amber, white, and high-contrast modes
- **Responsive Design**: Works on desktop and mobile devices

### Player Dashboard
- **Real-time Character Stats**: HP, spell slots, abilities display
- **Inventory Management**: Visual item tracking with quantities
- **Spell Slot Tracking**: Visual spell slot indicators by level
- **Condition Monitoring**: Active buffs, debuffs, and conditions
- **Quest Log**: Track active quests and objectives

### AI Dungeon Master
- **Dynamic Storytelling**: AI-generated narratives that adapt to player choices
- **Natural Language Understanding**: Interprets player actions intelligently
- **Combat Management**: Handles dice rolls and combat mechanics
- **World Consistency**: Maintains story continuity across sessions
- **Character Progression**: Tracks XP, leveling, and character development

### Game Features
- **D&D 5e Rules**: Accurate implementation of core mechanics
- **Character Creation**: Full character builder with races and classes
- **Session Persistence**: Save and resume adventures
- **Real-time Updates**: Live dashboard updates during gameplay
- **Accessibility**: Screen reader support and high contrast modes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rodeolabs/dungeonsterminal.git
   cd dungeonsterminal
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## 🎮 How to Play

### Getting Started
1. **Create a Character**: Choose race, class, and allocate ability scores
2. **Enter the World**: Start in the tavern and begin your adventure
3. **Use Natural Language**: Type actions like "I examine the room" or "I talk to the bartender"
4. **Monitor Your Stats**: Keep an eye on the dashboard for HP, spells, and inventory

### Example Commands
- `I look around` - Examine your surroundings
- `I attack the goblin with my sword` - Combat action
- `I cast fireball at the enemies` - Spell casting
- `I search for traps` - Investigation
- `I talk to the merchant` - Social interaction
- `inventory` or `inv` - Check your items
- `help` - Show available commands

### Keyboard Shortcuts
- **Up/Down Arrows**: Navigate command history
- **Ctrl+L**: Clear terminal screen
- **Enter**: Submit command
- **Tab**: Auto-complete (coming soon)

## 🛠 Development

### Project Structure
```
├── src/                    # Backend Node.js/Express server
│   ├── routes/            # API endpoints
│   ├── types/             # TypeScript type definitions
│   └── index.ts           # Main server file
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── types/         # Frontend type definitions
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
└── .kiro/                 # Kiro AI assistant configuration
```

### Available Scripts

#### Development
- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only the frontend development server
- `npm run dev:backend` - Start only the backend development server

#### Building
- `npm run build` - Build both frontend and backend for production
- `npm run build:frontend` - Build only the frontend
- `npm run build:backend` - Build only the backend

#### Testing
- `npm run test` - Run all tests
- `npm run test:unit` - Run unit tests
- `npm run test:integration` - Run integration tests
- `npm run test:e2e` - Run end-to-end tests with Playwright

#### Code Quality
- `npm run lint` - Run ESLint and fix issues
- `npm run typecheck` - Run TypeScript type checking
- `npm run format` - Format code with Prettier

### Technology Stack

#### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Socket.IO Client** for real-time updates
- **Lucide React** for icons
- **Custom CSS** with CSS variables for theming

#### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Socket.IO** for real-time communication
- **Winston** for logging
- **Helmet** for security

#### Development Tools
- **ESLint** and **Prettier** for code quality
- **Jest** for unit testing
- **Playwright** for end-to-end testing
- **Husky** for git hooks

## 🎨 Customization

### Themes
The interface supports multiple themes:
- **Classic**: Traditional green on black terminal
- **Amber**: Warm amber text on dark background
- **White**: High contrast white on black
- **High Contrast**: Maximum accessibility compliance

### Adding Custom Themes
1. Edit `frontend/src/types/terminal.ts`
2. Add your theme to `TERMINAL_THEMES` and `DASHBOARD_THEMES`
3. Themes automatically sync between terminal and dashboard

### Accessibility
- Full keyboard navigation support
- Screen reader compatibility with ARIA labels
- High contrast mode for visual accessibility
- Reduced motion support for vestibular disorders

## 🔧 Configuration

### Environment Variables
```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# Database (when implemented)
DATABASE_URL=postgresql://...

# AI Integration (when implemented)
OPENAI_API_KEY=your_api_key_here
```

### MCP Integration
The project supports Model Context Protocol (MCP) for AI tool integration:
- **GitHub MCP**: Repository management and collaboration
- **Supabase MCP**: Database operations and real-time features
- **Firecrawl MCP**: D&D content research and validation
- **Playwright MCP**: Automated testing and UI validation

## 📚 API Documentation

### Characters API
- `GET /api/characters` - List user's characters
- `POST /api/characters` - Create new character
- `GET /api/characters/:id` - Get character details
- `PUT /api/characters/:id` - Update character
- `DELETE /api/characters/:id` - Delete character

### Sessions API
- `GET /api/sessions` - List user's game sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session details
- `PUT /api/sessions/:id` - Update session
- `POST /api/sessions/:id/actions` - Process player action

### WebSocket Events
- `join-session` - Join a game session room
- `gameStateUpdate` - Real-time game state changes
- `characterUpdate` - Character stat updates
- `narrativeUpdate` - New story content

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Maintain accessibility standards
- Use semantic commit messages
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by classic text-based RPGs and MUDs
- Built with modern web technologies for accessibility
- Designed for the tabletop RPG community
- Powered by AI for dynamic storytelling

## 🐛 Troubleshooting

### Common Issues

**Terminal not responding to input**
- Ensure JavaScript is enabled
- Check browser console for errors
- Try refreshing the page

**Character creation fails**
- Verify all required fields are filled
- Check network connection
- Ensure backend server is running

**Dashboard not updating**
- Check WebSocket connection status
- Verify real-time features are enabled
- Try reconnecting to the session

### Getting Help
- Check the [Issues](https://github.com/rodeolabs/dungeonsterminal/issues) page
- Join our [Discord community](https://discord.gg/dungeonsterminal)
- Read the [Documentation](https://docs.dungeonsterminal.com)

---

**Ready to embark on your AI-powered D&D adventure? 🎲✨**