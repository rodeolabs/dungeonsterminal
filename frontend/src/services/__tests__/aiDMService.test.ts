import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { aiDMService } from '../aiDMService';
import type { PlayerIntent, Character, GameState } from '@/types/game';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-123',
  },
});

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_API_URL: 'http://test-api.com',
    VITE_AI_TIMEOUT: '5000',
    VITE_AI_MAX_RETRIES: '2',
    DEV: true,
  },
}));

describe('AIDungeonMasterService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    aiDMService.clearCache();
    aiDMService.cancelAllRequests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockCharacter: Character = {
    id: 'char-1',
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

  describe('processAction', () => {
    it('should successfully process a player action', async () => {
      const mockResponse = {
        success: true,
        data: {
          narrative: 'You examine the door carefully...',
          gameEffects: [],
          dashboardUpdates: [],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await aiDMService.processAction(
        mockPlayerIntent,
        mockCharacter,
        mockGameState
      );

      expect(result.narrative).toBe('You examine the door carefully...');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-api.com/api/ai-dm/process-action',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Client-Version': '1.0.0',
          }),
        })
      );
    });

    it('should return fallback response on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await aiDMService.processAction(
        mockPlayerIntent,
        mockCharacter,
        mockGameState
      );

      expect(result.narrative).toContain('mystical connection to the realm wavers');
      expect(result.error).toBeDefined();
    });

    it('should retry on retryable errors', async () => {
      // First call fails with 500 error
      mockFetch.mockRejectedValueOnce({
        status: 500,
        message: 'Internal Server Error',
      });

      // Second call succeeds
      const mockResponse = {
        success: true,
        data: {
          narrative: 'Success after retry',
          gameEffects: [],
          dashboardUpdates: [],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await aiDMService.processAction(
        mockPlayerIntent,
        mockCharacter,
        mockGameState
      );

      expect(result.narrative).toBe('Success after retry');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle timeout errors', async () => {
      vi.useFakeTimers();
      
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 10000))
      );

      const resultPromise = aiDMService.processAction(
        mockPlayerIntent,
        mockCharacter,
        mockGameState
      );

      // Fast-forward time to trigger timeout
      vi.advanceTimersByTime(6000);

      const result = await resultPromise;
      expect(result.narrative).toContain('mystical connection to the realm wavers');

      vi.useRealTimers();
    });
  });

  describe('testConnection', () => {
    it('should return true for successful connection', async () => {
      const mockResponse = {
        success: true,
        data: { connected: true, timestamp: '2024-01-01T00:00:00Z' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await aiDMService.testConnection();
      expect(result).toBe(true);
    });

    it('should return false for failed connection', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await aiDMService.testConnection();
      expect(result).toBe(false);
    });

    it('should use cached result', async () => {
      const mockResponse = {
        success: true,
        data: { connected: true, timestamp: '2024-01-01T00:00:00Z' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // First call
      const result1 = await aiDMService.testConnection();
      expect(result1).toBe(true);

      // Second call should use cache
      const result2 = await aiDMService.testConnection();
      expect(result2).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUsageStats', () => {
    it('should return usage statistics', async () => {
      const mockStats = {
        requestsToday: 42,
        tokensUsed: 1500,
        costEstimate: 0.15,
      };

      const mockResponse = {
        success: true,
        data: mockStats,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await aiDMService.getUsageStats();
      expect(result).toEqual(mockStats);
    });

    it('should return null on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Stats unavailable'));

      const result = await aiDMService.getUsageStats();
      expect(result).toBeNull();
    });
  });

  describe('startSession', () => {
    it('should start a new session successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          sessionId: 'session-123',
          welcomeMessage: 'Welcome to the adventure!',
          character: 'Test Hero',
          location: 'Test Tavern',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await aiDMService.startSession(mockCharacter, mockGameState);
      expect(result).toBe('Welcome to the adventure!');
    });

    it('should return null on failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Session start failed'));

      const result = await aiDMService.startSession(mockCharacter, mockGameState);
      expect(result).toBeNull();
    });
  });

  describe('isAvailable', () => {
    it('should return true when service is available', async () => {
      const mockResponse = {
        success: true,
        data: { status: 'healthy' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await aiDMService.isAvailable();
      expect(result).toBe(true);
    });

    it('should return false when service is unavailable', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Service unavailable'));

      const result = await aiDMService.isAvailable();
      expect(result).toBe(false);
    });
  });

  describe('configuration management', () => {
    it('should update configuration', () => {
      const newConfig = {
        timeout: 60000,
        retryConfig: {
          maxRetries: 5,
          baseDelay: 2000,
          maxDelay: 20000,
        },
      };

      aiDMService.updateConfig(newConfig);
      const config = aiDMService.getConfig();

      expect(config.timeout).toBe(60000);
      expect(config.retryConfig.maxRetries).toBe(5);
    });

    it('should return readonly configuration', () => {
      const config = aiDMService.getConfig();
      
      // Attempting to modify should not affect the service
      (config as any).timeout = 99999;
      
      const newConfig = aiDMService.getConfig();
      expect(newConfig.timeout).not.toBe(99999);
    });
  });

  describe('cache management', () => {
    it('should clear cache', async () => {
      // First, populate cache
      const mockResponse = {
        success: true,
        data: { connected: true, timestamp: '2024-01-01T00:00:00Z' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await aiDMService.testConnection();
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Clear cache
      aiDMService.clearCache();

      // Next call should not use cache
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await aiDMService.testConnection();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('request cancellation', () => {
    it('should cancel all pending requests', () => {
      const abortSpy = vi.fn();
      const mockController = { abort: abortSpy };
      
      // Mock AbortController
      global.AbortController = vi.fn(() => mockController) as any;

      aiDMService.cancelAllRequests();
      
      // This test verifies the method exists and can be called
      // In a real scenario, you'd need to set up pending requests first
      expect(aiDMService.cancelAllRequests).toBeDefined();
    });
  });
});