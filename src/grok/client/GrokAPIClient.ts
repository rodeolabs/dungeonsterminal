// Grok API Client Implementation
// Handles authentication and communication with X.AI Grok API

import type { IGrokAPIClient } from '../interfaces/IGrokAPIClient';
import type { 
  GrokCompletionRequest, 
  GrokCompletionResponse, 
  GrokModelsResponse,
  GrokAPIError,
  GrokClientConfig 
} from '../types/grok-types';
import { GROK_API } from '../constants/grok-constants';
import { Logger } from '../utils/logger';

export class GrokAPIClient implements IGrokAPIClient {
  private config: GrokClientConfig;
  private logger: Logger;
  private requestCount: number = 0;
  private totalTokensUsed: number = 0;

  constructor(config: GrokClientConfig) {
    this.config = {
      baseURL: GROK_API.BASE_URL,
      model: GROK_API.DEFAULT_MODEL,
      temperature: GROK_API.DEFAULT_TEMPERATURE,
      maxTokens: GROK_API.DEFAULT_MAX_TOKENS,
      timeout: GROK_API.DEFAULT_TIMEOUT,
      maxRetries: GROK_API.MAX_RETRIES,
      ...config
    };
    this.logger = Logger.getInstance();
  }

  async authenticate(): Promise<boolean> {
    try {
      this.logger.info('Authenticating with Grok API');
      
      // Test authentication by fetching available models
      const response = await this.makeRequest('GET', GROK_API.ENDPOINTS.MODELS);
      
      if (response.ok) {
        this.logger.info('Grok API authentication successful');
        return true;
      } else {
        const errorData = await response.json() as GrokAPIError;
        this.logger.error('Grok API authentication failed', new Error(errorData.error.message));
        return false;
      }
    } catch (error) {
      this.logger.error('Authentication error', error as Error);
      return false;
    }
  }

  async sendMessage(request: GrokCompletionRequest): Promise<GrokCompletionResponse> {
    try {
      this.logger.debug('Sending message to Grok API', { 
        model: request.model,
        messageCount: request.messages.length,
        temperature: request.temperature 
      });

      const response = await this.makeRequest('POST', GROK_API.ENDPOINTS.COMPLETIONS, request);
      
      if (!response.ok) {
        const errorData = await response.json() as GrokAPIError;
        throw new Error(`Grok API error: ${errorData.error.message}`);
      }

      const completionResponse = await response.json() as GrokCompletionResponse;
      
      // Update usage statistics
      this.requestCount++;
      if (completionResponse.usage) {
        this.totalTokensUsed += completionResponse.usage.total_tokens;
      }

      this.logger.info('Grok API response received', {
        id: completionResponse.id,
        model: completionResponse.model,
        tokensUsed: completionResponse.usage?.total_tokens || 0,
        finishReason: completionResponse.choices[0]?.finish_reason
      });

      return completionResponse;
    } catch (error) {
      this.logger.error('Error sending message to Grok API', error as Error);
      throw error;
    }
  }

  async getAvailableModels(): Promise<GrokModelsResponse> {
    try {
      this.logger.debug('Fetching available Grok models');
      
      const response = await this.makeRequest('GET', GROK_API.ENDPOINTS.MODELS);
      
      if (!response.ok) {
        const errorData = await response.json() as GrokAPIError;
        throw new Error(`Failed to fetch models: ${errorData.error.message}`);
      }

      const modelsResponse = await response.json() as GrokModelsResponse;
      
      this.logger.info('Available models fetched', { 
        modelCount: modelsResponse.data.length 
      });

      return modelsResponse;
    } catch (error) {
      this.logger.error('Error fetching available models', error as Error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      this.logger.debug('Testing Grok API connection');
      
      const response = await this.makeRequest('GET', GROK_API.ENDPOINTS.MODELS);
      const isConnected = response.ok;
      
      this.logger.info('Connection test result', { connected: isConnected });
      return isConnected;
    } catch (error) {
      this.logger.error('Connection test failed', error as Error);
      return false;
    }
  }

  async getUsageStats(): Promise<{
    requestsToday: number;
    tokensUsed: number;
    costEstimate: number;
  }> {
    // Note: This is a simplified implementation
    // In a production system, you'd want to track usage across sessions
    const costPerToken = 0.00001; // Estimated cost per token
    const costEstimate = this.totalTokensUsed * costPerToken;

    return {
      requestsToday: this.requestCount,
      tokensUsed: this.totalTokensUsed,
      costEstimate
    };
  }

  private async makeRequest(
    method: 'GET' | 'POST',
    endpoint: string,
    body?: any
  ): Promise<Response> {
    const url = `${this.config.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'AI-Dungeon-Master/1.0.0'
    };

    const requestOptions: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.config.timeout || GROK_API.DEFAULT_TIMEOUT)
    };

    if (body && method === 'POST') {
      requestOptions.body = JSON.stringify(body);
    }

    this.logger.debug('Making API request', { 
      method, 
      url: url.replace(this.config.apiKey, '[REDACTED]'),
      hasBody: !!body 
    });

    try {
      const response = await fetch(url, requestOptions);
      
      this.logger.debug('API response received', { 
        status: response.status,
        statusText: response.statusText
      });

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.timeout}ms`);
      }
      throw error;
    }
  }

  // Helper method to create a completion request with defaults
  createCompletionRequest(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      topP?: number;
    }
  ): GrokCompletionRequest {
    const request: GrokCompletionRequest = {
      model: options?.model || this.config.model || GROK_API.DEFAULT_MODEL,
      messages,
      temperature: options?.temperature ?? this.config.temperature ?? GROK_API.DEFAULT_TEMPERATURE,
      max_tokens: options?.maxTokens || this.config.maxTokens || GROK_API.DEFAULT_MAX_TOKENS,
    };

    // Only add top_p if it's defined to satisfy exactOptionalPropertyTypes
    if (options?.topP !== undefined) {
      request.top_p = options.topP;
    }

    return request;
  }
}