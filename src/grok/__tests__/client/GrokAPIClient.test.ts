// Grok API Client Tests
// Unit tests for Grok API client functionality

import { GrokAPIClient } from '../../client/GrokAPIClient';
import type { GrokClientConfig, GrokCompletionResponse, GrokModelsResponse } from '../../types/grok-types';

// Mock fetch globally
global.fetch = jest.fn();

describe('GrokAPIClient', () => {
  let client: GrokAPIClient;
  let mockFetch: jest.MockedFunction<typeof fetch>;
  const testConfig: GrokClientConfig = {
    apiKey: 'xai-test-key',
    baseURL: 'https://api.x.ai/v1',
    model: 'grok-beta',
    temperature: 0.7,
    maxTokens: 1000,
    timeout: 30000,
    maxRetries: 3
  };

  // Helper function to create proper mock responses
  const createMockResponse = (options: {
    ok: boolean;
    status: number;
    statusText: string;
    data?: any;
  }) => {
    const headers = new Map([['content-type', 'application/json']]);
    const mockResponse = {
      ok: options.ok,
      status: options.status,
      statusText: options.statusText,
      headers,
      json: jest.fn().mockResolvedValue(options.data)
    };
    // Mock the headers.entries() method
    mockResponse.headers.entries = jest.fn().mockReturnValue([['content-type', 'application/json']]);
    return mockResponse;
  };

  beforeEach(() => {
    client = new GrokAPIClient(testConfig);
    mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockClear();
  });

  describe('authenticate', () => {
    it('should return true when authentication is successful', async () => {
      const mockResponse = createMockResponse({
        ok: true,
        status: 200,
        statusText: 'OK',
        data: {
          object: 'list',
          data: [{ id: 'grok-beta', object: 'model' }]
        }
      });
      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await client.authenticate();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.x.ai/v1/models',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer xai-test-key'
          })
        })
      );
    });

    it('should return false when authentication fails', async () => {
      const mockResponse = createMockResponse({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        data: {
          error: { message: 'Invalid API key' }
        }
      });
      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await client.authenticate();

      expect(result).toBe(false);
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await client.authenticate();

      expect(result).toBe(false);
    });
  });

  describe('sendMessage', () => {
    const mockCompletionResponse: GrokCompletionResponse = {
      id: 'chatcmpl-test',
      object: 'chat.completion',
      created: Date.now(),
      model: 'grok-beta',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: 'Hello! I am your AI Dungeon Master assistant.'
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: 20,
        completion_tokens: 15,
        total_tokens: 35
      }
    };

    it('should send message and return response', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockCompletionResponse)
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const request = client.createCompletionRequest([
        { role: 'user', content: 'Hello, DM!' }
      ]);

      const result = await client.sendMessage(request);

      expect(result).toEqual(mockCompletionResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.x.ai/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer xai-test-key',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(request)
        })
      );
    });

    it('should throw error when API returns error response', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({
          error: { message: 'Rate limit exceeded' }
        })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const request = client.createCompletionRequest([
        { role: 'user', content: 'Hello, DM!' }
      ]);

      await expect(client.sendMessage(request)).rejects.toThrow('Grok API error: Rate limit exceeded');
    });

    it('should handle network timeouts', async () => {
      mockFetch.mockRejectedValue(new Error('Request timeout after 30000ms'));

      const request = client.createCompletionRequest([
        { role: 'user', content: 'Hello, DM!' }
      ]);

      await expect(client.sendMessage(request)).rejects.toThrow('Request timeout after 30000ms');
    });
  });

  describe('getAvailableModels', () => {
    const mockModelsResponse: GrokModelsResponse = {
      object: 'list',
      data: [
        {
          id: 'grok-beta',
          object: 'model',
          created: Date.now(),
          owned_by: 'xai'
        },
        {
          id: 'grok-1',
          object: 'model',
          created: Date.now(),
          owned_by: 'xai'
        }
      ]
    };

    it('should fetch and return available models', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockModelsResponse)
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await client.getAvailableModels();

      expect(result).toEqual(mockModelsResponse);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]?.id).toBe('grok-beta'); // Fixed: Added optional chaining
    });

    it('should throw error when models fetch fails', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({
          error: { message: 'Unauthorized' }
        })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await expect(client.getAvailableModels()).rejects.toThrow('Failed to fetch models: Unauthorized');
    });
  });

  describe('testConnection', () => {
    it('should return true when connection is successful', async () => {
      const mockResponse = { ok: true };
      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await client.testConnection();

      expect(result).toBe(true);
    });

    it('should return false when connection fails', async () => {
      const mockResponse = { ok: false };
      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await client.testConnection();

      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await client.testConnection();

      expect(result).toBe(false);
    });
  });

  describe('getUsageStats', () => {
    it('should return usage statistics', async () => {
      // First, make a successful request to increment stats
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: 'test',
          object: 'chat.completion',
          created: Date.now(),
          model: 'grok-beta',
          choices: [{ index: 0, message: { role: 'assistant', content: 'Test' }, finish_reason: 'stop' }],
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 }
        })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const request = client.createCompletionRequest([{ role: 'user', content: 'Test' }]);
      await client.sendMessage(request);

      const stats = await client.getUsageStats();

      expect(stats.requestsToday).toBe(1);
      expect(stats.tokensUsed).toBe(15);
      expect(stats.costEstimate).toBeGreaterThan(0);
    });
  });

  describe('createCompletionRequest', () => {
    it('should create request with default values', () => {
      const messages = [{ role: 'user' as const, content: 'Hello' }];
      const request = client.createCompletionRequest(messages);

      expect(request).toEqual({
        model: 'grok-beta',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: undefined
      });
    });

    it('should create request with custom options', () => {
      const messages = [{ role: 'user' as const, content: 'Hello' }];
      const options = {
        model: 'grok-1',
        temperature: 0.5,
        maxTokens: 500,
        topP: 0.9
      };
      const request = client.createCompletionRequest(messages, options);

      expect(request).toEqual({
        model: 'grok-1',
        messages,
        temperature: 0.5,
        max_tokens: 500,
        top_p: 0.9
      });
    });
  });

  describe('configuration', () => {
    it('should use default values when not provided', () => {
      const minimalConfig: GrokClientConfig = {
        apiKey: 'xai-test-key'
      };
      const clientWithDefaults = new GrokAPIClient(minimalConfig);

      const request = clientWithDefaults.createCompletionRequest([
        { role: 'user', content: 'Test' }
      ]);

      expect(request.model).toBe('grok-beta');
      expect(request.temperature).toBe(0.7);
      expect(request.max_tokens).toBe(1000);
    });

    it('should override defaults with provided config', () => {
      const customConfig: GrokClientConfig = {
        apiKey: 'xai-test-key',
        model: 'grok-1',
        temperature: 0.3,
        maxTokens: 2000
      };
      const customClient = new GrokAPIClient(customConfig);

      const request = customClient.createCompletionRequest([
        { role: 'user', content: 'Test' }
      ]);

      expect(request.model).toBe('grok-1');
      expect(request.temperature).toBe(0.3);
      expect(request.max_tokens).toBe(2000);
    });
  });
});