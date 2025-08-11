// Conversation Manager Interface
// Defines the contract for conversation management

import type { ConversationSession, ConversationMessage, ConversationContext } from '../types/conversation-types';

export interface IConversationManager {
  /**
   * Initialize a new conversation session
   */
  initializeSession(userId?: string, title?: string): Promise<ConversationSession>;

  /**
   * Add a message to the current conversation
   */
  addMessage(role: 'user' | 'assistant' | 'system', content: string, tokens?: number): Promise<ConversationMessage>;

  /**
   * Get conversation context for API requests
   */
  getContext(maxTokens?: number): ConversationContext;

  /**
   * Save current conversation to database
   */
  saveToDatabase(): Promise<void>;

  /**
   * Load conversation from database
   */
  loadFromDatabase(sessionId: string): Promise<ConversationSession>;

  /**
   * Get current session
   */
  getCurrentSession(): ConversationSession | null;

  /**
   * Clear conversation history
   */
  clearHistory(): void;

  /**
   * Get conversation statistics
   */
  getStats(): {
    messageCount: number;
    totalTokens: number;
    sessionDuration: number;
  };
}