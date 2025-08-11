// Grok API Client Interface
// Defines the contract for Grok API communication

import type { GrokCompletionRequest, GrokCompletionResponse, GrokModelsResponse } from '../types/grok-types';

export interface IGrokAPIClient {
  /**
   * Authenticate with the Grok API and validate connection
   */
  authenticate(): Promise<boolean>;

  /**
   * Send a message to Grok AI with conversation context
   */
  sendMessage(request: GrokCompletionRequest): Promise<GrokCompletionResponse>;

  /**
   * Get list of available Grok models
   */
  getAvailableModels(): Promise<GrokModelsResponse>;

  /**
   * Test API connectivity and response
   */
  testConnection(): Promise<boolean>;

  /**
   * Get current API usage statistics
   */
  getUsageStats(): Promise<{
    requestsToday: number;
    tokensUsed: number;
    costEstimate: number;
  }>;
}