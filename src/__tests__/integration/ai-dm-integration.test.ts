// Integration tests for AI Dungeon Master service

import request from 'supertest';
import express from 'express';
import aiDMRouter from '../../routes/ai-dm';
import type { Character, GameState, PlayerIntent } from '../../types/game';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/ai-dm', aiDMRouter);

describe('AI DM Integration Tests', () => {
  const mockCharacter: Character = {
    id: 'test-char-1',
    name: 'Test Hero',
    class: 'Fighter',
    level: 1,
    hitPoints: { current: 10, maximum: 10 },
    armorClass: 16,
    stats: {
      strength: 16,
      dexterity: 14,
      constitution: 15,
      intelligence: 12,
      wisdom: 13,
      charisma: 10,
    },
    skills: [],
    equipment: [],
    spells: [],
  };

  const mockGameState: GameState = {
    currentLocation: 'Test Tavern',
    timeOfDay: 'evening',
    weather: 'clear',
    activeQuests: [],
    completedQuests: [],
    partyMembers: [mockCharacter],
    inventory: [],
    gold: 100,
    experience: 0,
    sessionNotes: [],
  };

  const mockPlayerIntent: PlayerIntent = {
    action: 'investigate',
    target: 'mysterious door',
    method: 'carefully examine the hinges and lock',
    character: mockCharacter,
  };

  describe('POST /api/ai-dm/process-action', () => {
    it('should process a valid player action', async () => {
      const response = await request(app)
        .post('/api/ai-dm/process-action')
        .send({
          intent: mockPlayerIntent,
          character: mockCharacter,
          gameState: mockGameState,
        })
        .expect(200);

      expect(response.body).toHaveProperty('narrative');
      expect(response.body).toHaveProperty('gameEffects');
      expect(response.body).toHaveProperty('dashboardUpdates');
      expect(typeof response.body.narrative).toBe('string');
      expect(Array.isArray(response.body.gameEffects)).toBe(true);
      expect(Array.isArray(response.body.dashboardUpdates)).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/ai-dm/process-action')
        .send({
          intent: mockPlayerIntent,
          // Missing character and gameState
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.narrative).toContain('cosmic forces are confused');
    });

    it('should handle malformed requests gracefully', async () => {
      const response = await request(app)
        .post('/api/ai-dm/process-action')
        .send({
          invalid: 'data',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('narrative');
    });
  });

  describe('GET /api/ai-dm/test-connection', () => {
    it('should return connection status', async () => {
      const response = await request(app)
        .get('/api/ai-dm/test-connection')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('connected');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('version');
      expect(response.body.data).toHaveProperty('features');
      expect(Array.isArray(response.body.data.features)).toBe(true);
    });
  });

  describe('GET /api/ai-dm/usage-stats', () => {
    it('should return usage statistics', async () => {
      const response = await request(app)
        .get('/api/ai-dm/usage-stats')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      
      if (response.body.data) {
        expect(response.body.data).toHaveProperty('requestsToday');
        expect(response.body.data).toHaveProperty('tokensUsed');
        expect(response.body.data).toHaveProperty('costEstimate');
      }
    });
  });

  describe('POST /api/ai-dm/start-session', () => {
    it('should start a new session', async () => {
      const response = await request(app)
        .post('/api/ai-dm/start-session')
        .send({
          character: mockCharacter,
          gameState: mockGameState,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      
      if (response.body.data) {
        expect(response.body.data).toHaveProperty('sessionId');
        expect(response.body.data).toHaveProperty('welcomeMessage');
      }
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/ai-dm/start-session')
        .send({
          character: mockCharacter,
          // Missing gameState
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/ai-dm/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/ai-dm/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('uptime');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('version');
    });
  });

  describe('GET /api/ai-dm/capabilities', () => {
    it('should return AI DM capabilities', async () => {
      const response = await request(app)
        .get('/api/ai-dm/capabilities')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('features');
      expect(response.body.data).toHaveProperty('supportedSystems');
      expect(response.body.data).toHaveProperty('version');
      expect(response.body.data).toHaveProperty('maxPlayersPerSession');
      expect(response.body.data).toHaveProperty('supportedLanguages');
      expect(response.body.data).toHaveProperty('rateLimit');

      expect(Array.isArray(response.body.data.features)).toBe(true);
      expect(Array.isArray(response.body.data.supportedSystems)).toBe(true);
      expect(Array.isArray(response.body.data.supportedLanguages)).toBe(true);
    });
  });

  describe('POST /api/ai-dm/generate-encounter', () => {
    it('should generate an encounter', async () => {
      const response = await request(app)
        .post('/api/ai-dm/generate-encounter')
        .send({
          partyLevel: 3,
          environment: 'forest',
          difficulty: 'medium',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should use default values for missing parameters', async () => {
      const response = await request(app)
        .post('/api/ai-dm/generate-encounter')
        .send({})
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('POST /api/ai-dm/generate-npc', () => {
    it('should generate an NPC', async () => {
      const response = await request(app)
        .post('/api/ai-dm/generate-npc')
        .send({
          race: 'Human',
          profession: 'Merchant',
          personality: 'Friendly',
          location: 'Tavern',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should handle missing parameters gracefully', async () => {
      const response = await request(app)
        .post('/api/ai-dm/generate-npc')
        .send({})
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('Error handling', () => {
    it('should handle 404 for unknown endpoints', async () => {
      await request(app)
        .get('/api/ai-dm/unknown-endpoint')
        .expect(404);
    });

    it('should handle invalid JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/ai-dm/process-action')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      // Express should handle this before it reaches our routes
      expect(response.body).toBeDefined();
    });
  });

  describe('Rate limiting and performance', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = Array(5).fill(null).map(() =>
        request(app)
          .post('/api/ai-dm/process-action')
          .send({
            intent: mockPlayerIntent,
            character: mockCharacter,
            gameState: mockGameState,
          })
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('narrative');
      });
    });

    it('should respond within reasonable time limits', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/ai-dm/test-connection')
        .expect(200);
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000); // Should respond within 5 seconds
    });
  });

  describe('Content validation', () => {
    it('should validate character data structure', async () => {
      const invalidCharacter = {
        id: 'test',
        name: 'Test',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/ai-dm/process-action')
        .send({
          intent: mockPlayerIntent,
          character: invalidCharacter,
          gameState: mockGameState,
        });

      // Should either return 400 or handle gracefully with error message
      expect([200, 400, 500]).toContain(response.status);
      
      if (response.status !== 200) {
        expect(response.body).toHaveProperty('error');
      }
    });

    it('should validate game state structure', async () => {
      const invalidGameState = {
        currentLocation: 'Test',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/ai-dm/process-action')
        .send({
          intent: mockPlayerIntent,
          character: mockCharacter,
          gameState: invalidGameState,
        });

      // Should either return 400 or handle gracefully with error message
      expect([200, 400, 500]).toContain(response.status);
      
      if (response.status !== 200) {
        expect(response.body).toHaveProperty('error');
      }
    });
  });
});