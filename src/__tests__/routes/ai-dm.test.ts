import request from 'supertest';
import { app } from '../../index';

describe('AI DM Routes', () => {
  describe('POST /api/ai-dm/generate', () => {
    it('should generate narrative with valid request', async () => {
      const narrativeRequest = {
        prompt: 'The party enters a mysterious cave',
        style: 'dramatic',
        length: 'medium'
      };

      const response = await request(app)
        .post('/api/ai-dm/generate')
        .send(narrativeRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('narrative');
      expect(response.body.data).toHaveProperty('metadata');
    });

    it('should validate request schema', async () => {
      const invalidRequest = {
        prompt: '', // Empty prompt should fail validation
      };

      const response = await request(app)
        .post('/api/ai-dm/generate')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle context in narrative request', async () => {
      const narrativeRequest = {
        prompt: 'Continue the adventure',
        context: {
          campaignId: '123e4567-e89b-12d3-a456-426614174000',
          characterNames: ['Aragorn', 'Legolas'],
          currentLocation: 'Forest of Shadows'
        }
      };

      const response = await request(app)
        .post('/api/ai-dm/generate')
        .send(narrativeRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('narrative');
    });
  });

  describe('POST /api/ai-dm/encounter', () => {
    it('should generate encounter with valid request', async () => {
      const encounterRequest = {
        partyLevel: 3,
        partySize: 4,
        difficulty: 'medium',
        environment: 'dungeon'
      };

      const response = await request(app)
        .post('/api/ai-dm/encounter')
        .send(encounterRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('monsters');
      expect(response.body.data).toHaveProperty('encounterDescription');
      expect(response.body.data).toHaveProperty('xpReward');
    });

    it('should validate encounter request schema', async () => {
      const invalidRequest = {
        partyLevel: 0, // Invalid level
        partySize: 4,
        difficulty: 'medium'
      };

      const response = await request(app)
        .post('/api/ai-dm/encounter')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/ai-dm/npc', () => {
    it('should generate NPC with valid request', async () => {
      const npcRequest = {
        name: 'Marcus',
        race: 'Human',
        occupation: 'Merchant',
        campaignId: '123e4567-e89b-12d3-a456-426614174000'
      };

      const response = await request(app)
        .post('/api/ai-dm/npc')
        .send(npcRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('race');
      expect(response.body.data).toHaveProperty('occupation');
    });

    it('should generate NPC with minimal data', async () => {
      const npcRequest = {};

      const response = await request(app)
        .post('/api/ai-dm/npc')
        .send(npcRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name');
    });
  });

  describe('GET /api/ai-dm/capabilities', () => {
    it('should return AI DM capabilities', async () => {
      const response = await request(app)
        .get('/api/ai-dm/capabilities')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('ai_capabilities');
      expect(response.body.data).toHaveProperty('mcp_integration');
      expect(response.body.data).toHaveProperty('supported_styles');
      expect(response.body.data).toHaveProperty('supported_lengths');
    });
  });

  describe('GET /api/ai-dm/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/ai-dm/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('ai_dm');
      expect(response.body.data).toHaveProperty('mcp_services');
      expect(response.body.data).toHaveProperty('timestamp');
    });
  });

  describe('MCP Integration Routes', () => {
    it('should execute MCP requests', async () => {
      const response = await request(app)
        .post('/api/ai-dm/mcp/supabase/query_campaigns')
        .send({ user_id: 'test-user' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should handle invalid MCP service', async () => {
      const response = await request(app)
        .post('/api/ai-dm/mcp/invalid-service/test')
        .send({})
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should get service tools', async () => {
      const response = await request(app)
        .get('/api/ai-dm/mcp/supabase/tools')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('service');
      expect(response.body.data).toHaveProperty('tools');
      expect(Array.isArray(response.body.data.tools)).toBe(true);
    });
  });
});