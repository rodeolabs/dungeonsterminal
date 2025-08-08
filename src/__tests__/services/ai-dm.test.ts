import { AIDungeonMaster } from '../../services/ai-dm';
import { NarrativeRequest, EncounterRequest } from '../../services/ai-dm';

describe('AIDungeonMaster', () => {
  let aiDM: AIDungeonMaster;

  beforeAll(() => {
    // Set required environment variables for testing
    process.env.OPENAI_API_KEY = 'test-key';
  });

  beforeEach(() => {
    aiDM = new AIDungeonMaster();
  });

  describe('generateNarrative', () => {
    it('should generate narrative with basic prompt', async () => {
      const request: NarrativeRequest = {
        prompt: 'The party enters a dark tavern'
      };

      const result = await aiDM.generateNarrative(request);

      expect(result).toHaveProperty('narrative');
      expect(result).toHaveProperty('metadata');
      expect(result.metadata).toHaveProperty('timestamp');
      expect(result.metadata).toHaveProperty('model');
      expect(result.narrative).toBe('Mock AI response for testing');
    });

    it('should handle different narrative styles', async () => {
      const request: NarrativeRequest = {
        prompt: 'A dramatic battle scene',
        style: 'dramatic',
        length: 'long'
      };

      const result = await aiDM.generateNarrative(request);

      expect(result).toHaveProperty('narrative');
      expect(result.metadata.model).toBe('gpt-4');
    });

    it('should include campaign context when provided', async () => {
      const request: NarrativeRequest = {
        prompt: 'Continue the adventure',
        context: {
          campaignId: '123e4567-e89b-12d3-a456-426614174000',
          characterNames: ['Aragorn', 'Legolas'],
          currentLocation: 'Moria'
        }
      };

      const result = await aiDM.generateNarrative(request);

      expect(result).toHaveProperty('narrative');
      expect(result.metadata.totalTokens).toBeGreaterThan(0);
    });

    it('should handle errors gracefully', async () => {
      // Mock OpenAI to throw an error
      const originalCreate = require('openai').default.prototype.chat.completions.create;
      require('openai').default.prototype.chat.completions.create = jest.fn(() => {
        throw new Error('API Error');
      });

      const request: NarrativeRequest = {
        prompt: 'Test prompt'
      };

      await expect(aiDM.generateNarrative(request)).rejects.toThrow('Failed to generate narrative');

      // Restore original function
      require('openai').default.prototype.chat.completions.create = originalCreate;
    });
  });

  describe('generateEncounter', () => {
    it('should generate encounter with party details', async () => {
      const request: EncounterRequest = {
        partyLevel: 3,
        partySize: 4,
        difficulty: 'medium',
        environment: 'forest'
      };

      const result = await aiDM.generateEncounter(request);

      expect(result).toHaveProperty('monsters');
      expect(result).toHaveProperty('encounterDescription');
      expect(result).toHaveProperty('xpReward');
      expect(result.monsters).toBeInstanceOf(Array);
      expect(result.xpReward).toBeGreaterThan(0);
    });

    it('should scale encounter difficulty appropriately', async () => {
      const easyEncounter: EncounterRequest = {
        partyLevel: 1,
        partySize: 4,
        difficulty: 'easy'
      };

      const hardEncounter: EncounterRequest = {
        partyLevel: 1,
        partySize: 4,
        difficulty: 'hard'
      };

      const easyResult = await aiDM.generateEncounter(easyEncounter);
      const hardResult = await aiDM.generateEncounter(hardEncounter);

      expect(hardResult.xpReward).toBeGreaterThan(easyResult.xpReward);
    });
  });

  describe('generateNPC', () => {
    it('should generate NPC with basic parameters', async () => {
      const params = {
        name: 'Gareth',
        race: 'Human',
        occupation: 'Blacksmith'
      };

      const result = await aiDM.generateNPC(params);

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('race');
      expect(result).toHaveProperty('occupation');
      expect(result).toHaveProperty('personality');
      expect(result).toHaveProperty('backstory');
      expect(result.name).toBe('Gareth');
    });

    it('should generate random NPC when no parameters provided', async () => {
      const result = await aiDM.generateNPC({});

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('race');
      expect(result).toHaveProperty('occupation');
      expect(result).toHaveProperty('backstory');
      expect(typeof result.name).toBe('string');
    });
  });
});