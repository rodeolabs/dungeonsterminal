import { gameSessionUtils } from '../gameSessionUtils';
import { Character, GameState } from '@/types/game';

// Mock character data for testing
const mockCharacter: Character = {
  id: 'char_123',
  userId: 'user_456',
  name: 'Test Hero',
  race: 'human',
  class: 'fighter',
  level: 1,
  abilities: {
    strength: 16,
    dexterity: 14,
    constitution: 15,
    intelligence: 10,
    wisdom: 12,
    charisma: 8,
  },
  hitPoints: {
    current: 12,
    maximum: 15,
    temporary: 0,
  },
  spellSlots: {
    1: { current: 2, maximum: 2 },
    2: { current: 1, maximum: 1 },
  },
  inventory: [
    {
      id: 'item_1',
      name: 'Sword',
      description: 'A sharp blade',
      type: 'weapon',
      quantity: 1,
      weight: 3,
      value: 15,
    },
    {
      id: 'item_2',
      name: 'Health Potion',
      description: 'Restores health',
      type: 'consumable',
      quantity: 2,
      weight: 0.5,
      value: 50,
    },
  ],
  equipment: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockGameState: GameState = {
  currentHp: 12,
  spellSlots: { 1: 2, 2: 1 },
  inventory: mockCharacter.inventory,
  activeEffects: [
    {
      id: 'effect_1',
      name: 'Blessed',
      description: 'You feel blessed',
      duration: 10,
      type: 'buff',
    },
  ],
  location: 'Test Location',
  questLog: [],
};

describe('gameSessionUtils', () => {
  describe('generateSessionId', () => {
    it('should generate a unique session ID', () => {
      const id1 = gameSessionUtils.generateSessionId();
      const id2 = gameSessionUtils.generateSessionId();
      
      expect(id1).toMatch(/^session_/);
      expect(id2).toMatch(/^session_/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('generatePlayerId', () => {
    it('should generate a unique player ID', () => {
      const id1 = gameSessionUtils.generatePlayerId();
      const id2 = gameSessionUtils.generatePlayerId();
      
      expect(id1).toMatch(/^player_/);
      expect(id2).toMatch(/^player_/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('createInitialGameState', () => {
    it('should create initial game state from character', () => {
      const gameState = gameSessionUtils.createInitialGameState(mockCharacter);
      
      expect(gameState.currentHp).toBe(mockCharacter.hitPoints.current);
      expect(gameState.spellSlots).toEqual({ '1': 2, '2': 1 });
      expect(gameState.inventory).toBe(mockCharacter.inventory);
      expect(gameState.activeEffects).toEqual([]);
      expect(gameState.location).toBe('Starting Area');
      expect(gameState.questLog).toEqual([]);
    });
  });

  describe('createGameSession', () => {
    it('should create a new game session', () => {
      const session = gameSessionUtils.createGameSession(mockCharacter, mockGameState);
      
      expect(session.sessionId).toMatch(/^session_/);
      expect(session.playerId).toMatch(/^player_/);
      expect(session.characterId).toBe(mockCharacter.id);
      expect(session.gameState).toBe(mockGameState);
      expect(session.currentLocation).toEqual({
        id: 'start',
        name: 'Starting Area',
        description: 'A peaceful starting location for new adventurers.',
        type: 'town',
        exits: ['north', 'east', 'west'],
      });
    });

    it('should use provided player ID', () => {
      const customPlayerId = 'custom_player_123';
      const session = gameSessionUtils.createGameSession(mockCharacter, mockGameState, customPlayerId);
      
      expect(session.playerId).toBe(customPlayerId);
    });
  });

  describe('validateCharacter', () => {
    it('should validate a valid character', () => {
      const result = gameSessionUtils.validateCharacter(mockCharacter);
      expect(result).toBe(mockCharacter);
    });

    it('should throw error for null/undefined data', () => {
      expect(() => gameSessionUtils.validateCharacter(null)).toThrow('Invalid character data: not an object');
      expect(() => gameSessionUtils.validateCharacter(undefined)).toThrow('Invalid character data: not an object');
    });

    it('should throw error for missing id', () => {
      const invalidCharacter = { ...mockCharacter, id: '' };
      expect(() => gameSessionUtils.validateCharacter(invalidCharacter)).toThrow('Invalid character data: missing or invalid id');
    });

    it('should throw error for missing name', () => {
      const invalidCharacter = { ...mockCharacter, name: '' };
      expect(() => gameSessionUtils.validateCharacter(invalidCharacter)).toThrow('Invalid character data: missing or invalid name');
    });

    it('should throw error for invalid hitPoints', () => {
      const invalidCharacter = { ...mockCharacter, hitPoints: null };
      expect(() => gameSessionUtils.validateCharacter(invalidCharacter)).toThrow('Invalid character data: missing or invalid hitPoints');
    });

    it('should throw error for invalid inventory', () => {
      const invalidCharacter = { ...mockCharacter, inventory: 'not an array' };
      expect(() => gameSessionUtils.validateCharacter(invalidCharacter)).toThrow('Invalid character data: inventory must be an array');
    });
  });

  describe('validateGameState', () => {
    it('should validate a valid game state', () => {
      const result = gameSessionUtils.validateGameState(mockGameState);
      expect(result).toBe(mockGameState);
    });

    it('should throw error for invalid currentHp', () => {
      const invalidState = { ...mockGameState, currentHp: 'not a number' };
      expect(() => gameSessionUtils.validateGameState(invalidState)).toThrow('Invalid game state data: missing or invalid currentHp');
    });

    it('should throw error for invalid spellSlots', () => {
      const invalidState = { ...mockGameState, spellSlots: null };
      expect(() => gameSessionUtils.validateGameState(invalidState)).toThrow('Invalid game state data: missing or invalid spellSlots');
    });
  });

  describe('calculateDamage', () => {
    it('should calculate damage correctly', () => {
      const result = gameSessionUtils.calculateDamage(mockCharacter, 5);
      expect(result).toBe(7); // 12 - 5 = 7
    });

    it('should not go below 0', () => {
      const result = gameSessionUtils.calculateDamage(mockCharacter, 20);
      expect(result).toBe(0);
    });
  });

  describe('calculateHealing', () => {
    it('should calculate healing correctly', () => {
      const result = gameSessionUtils.calculateHealing(mockCharacter, 2);
      expect(result).toBe(14); // 12 + 2 = 14
    });

    it('should not exceed maximum HP', () => {
      const result = gameSessionUtils.calculateHealing(mockCharacter, 10);
      expect(result).toBe(15); // Capped at maximum
    });
  });

  describe('isCharacterAlive', () => {
    it('should return true for alive character', () => {
      expect(gameSessionUtils.isCharacterAlive(mockCharacter)).toBe(true);
    });

    it('should return false for dead character', () => {
      const deadCharacter = { ...mockCharacter, hitPoints: { ...mockCharacter.hitPoints, current: 0 } };
      expect(gameSessionUtils.isCharacterAlive(deadCharacter)).toBe(false);
    });
  });

  describe('getAvailableSpellSlots', () => {
    it('should calculate total available spell slots', () => {
      const result = gameSessionUtils.getAvailableSpellSlots(mockCharacter);
      expect(result).toBe(3); // 2 + 1 = 3
    });

    it('should return 0 for character with no spell slots', () => {
      const noSpellsCharacter = { ...mockCharacter, spellSlots: {} };
      const result = gameSessionUtils.getAvailableSpellSlots(noSpellsCharacter);
      expect(result).toBe(0);
    });
  });

  describe('calculateInventoryWeight', () => {
    it('should calculate total inventory weight', () => {
      const result = gameSessionUtils.calculateInventoryWeight(mockCharacter.inventory);
      expect(result).toBe(4); // (3 * 1) + (0.5 * 2) = 4
    });

    it('should return 0 for empty inventory', () => {
      const result = gameSessionUtils.calculateInventoryWeight([]);
      expect(result).toBe(0);
    });
  });
});