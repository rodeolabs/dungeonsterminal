// Conversation Manager Implementation
// Handles conversation history, context management, and persistence

import type { IConversationManager } from '../interfaces/IConversationManager';
import type {
  ConversationSession,
  ConversationMessage,
  ConversationContext,
  ConversationManagerConfig,
  DatabaseConversationSession,
  DatabaseConversationMessage
} from '../types/conversation-types';
import { CONVERSATION } from '../constants/grok-constants';
import { Logger } from '../utils/logger';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export class ConversationManager implements IConversationManager {
  private currentSession: ConversationSession | null = null;
  private config: ConversationManagerConfig;
  private logger: Logger;
  private supabase: SupabaseClient | null = null;

  constructor(config: ConversationManagerConfig) {
    this.config = {
      ...config,
      maxContextTokens: config.maxContextTokens ?? CONVERSATION.MAX_CONTEXT_TOKENS,
      maxHistoryMessages: config.maxHistoryMessages ?? CONVERSATION.MAX_HISTORY_MESSAGES,
      enablePersistence: config.enablePersistence ?? false,
    };
    this.logger = Logger.getInstance();

    // Initialize Supabase client if persistence is enabled
    if (this.config.enablePersistence && this.config.supabaseConfig) {
      this.supabase = createClient(
        this.config.supabaseConfig.url,
        this.config.supabaseConfig.anonKey
      );
      this.logger.info('Supabase client initialized for conversation persistence');
    }
  }

  async initializeSession(userId?: string, title?: string): Promise<ConversationSession> {
    const sessionId = this.generateSessionId();
    const now = new Date();

    this.currentSession = {
      id: sessionId,
      userId: userId || undefined,
      title: title || `D&D Session ${now.toLocaleDateString()}`,
      messages: [],
      createdAt: now,
      updatedAt: now,
      totalTokens: 0
    };

    this.logger.info('New conversation session initialized', {
      sessionId,
      userId,
      title: this.currentSession.title
    });

    // Persist to database if enabled
    if (this.config.enablePersistence && this.supabase) {
      try {
        await this.persistSessionToDatabase(this.currentSession);
      } catch (error) {
        this.logger.error('Failed to persist session to database', error as Error);
        // Continue without persistence rather than failing
      }
    }

    return this.currentSession;
  }

  async addMessage(
    role: 'user' | 'assistant' | 'system',
    content: string,
    tokens?: number
  ): Promise<ConversationMessage> {
    if (!this.currentSession) {
      throw new Error('No active conversation session. Call initializeSession() first.');
    }

    const messageId = this.generateMessageId();
    const message: ConversationMessage = {
      id: messageId,
      role,
      content,
      timestamp: new Date(),
      tokens
    };

    this.currentSession.messages.push(message);
    this.currentSession.updatedAt = new Date();

    // Update total tokens if provided
    if (tokens) {
      this.currentSession.totalTokens = (this.currentSession.totalTokens || 0) + tokens;
    }

    this.logger.debug('Message added to conversation', {
      sessionId: this.currentSession.id,
      role,
      messageLength: content.length,
      tokens,
      totalMessages: this.currentSession.messages.length
    });

    // Persist message to database if enabled
    if (this.config.enablePersistence && this.supabase) {
      try {
        await this.persistMessageToDatabase(this.currentSession.id, message);
      } catch (error) {
        this.logger.error('Failed to persist message to database', error as Error);
        // Continue without persistence rather than failing
      }
    }

    // Trim history if it exceeds maximum
    this.trimHistoryIfNeeded();

    return message;
  }

  getContext(maxTokens?: number): ConversationContext {
    if (!this.currentSession) {
      return {
        messages: [],
        totalTokens: 0,
        maxTokens: maxTokens || this.config.maxContextTokens
      };
    }

    const contextMaxTokens = maxTokens || this.config.maxContextTokens;
    const messages = this.selectMessagesForContext(contextMaxTokens);
    const totalTokens = messages.reduce((sum, msg) => sum + (msg.tokens || 0), 0);

    this.logger.debug('Context prepared', {
      sessionId: this.currentSession.id,
      contextMessages: messages.length,
      totalMessages: this.currentSession.messages.length,
      totalTokens,
      maxTokens: contextMaxTokens
    });

    return {
      messages,
      totalTokens,
      maxTokens: contextMaxTokens
    };
  }

  async saveToDatabase(): Promise<void> {
    if (!this.config.enablePersistence || !this.supabase || !this.currentSession) {
      this.logger.warn('Cannot save to database: persistence disabled or no active session');
      return;
    }

    try {
      await this.persistSessionToDatabase(this.currentSession);
      
      // Save all messages
      for (const message of this.currentSession.messages) {
        await this.persistMessageToDatabase(this.currentSession.id, message);
      }

      this.logger.info('Conversation saved to database', {
        sessionId: this.currentSession.id,
        messageCount: this.currentSession.messages.length
      });
    } catch (error) {
      this.logger.error('Failed to save conversation to database', error as Error);
      throw error;
    }
  }

  async loadFromDatabase(sessionId: string): Promise<ConversationSession> {
    if (!this.config.enablePersistence || !this.supabase) {
      throw new Error('Database persistence is not enabled');
    }

    try {
      // Load session
      const { data: sessionData, error: sessionError } = await this.supabase
        .from('conversation_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        throw new Error(`Failed to load session: ${sessionError.message}`);
      }

      // Load messages
      const { data: messagesData, error: messagesError } = await this.supabase
        .from('conversation_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        throw new Error(`Failed to load messages: ${messagesError.message}`);
      }

      // Convert database format to internal format
      const session = this.convertDatabaseSessionToInternal(
        sessionData as DatabaseConversationSession,
        (messagesData as DatabaseConversationMessage[]) || []
      );

      this.currentSession = session;

      this.logger.info('Conversation loaded from database', {
        sessionId,
        messageCount: session.messages.length,
        totalTokens: session.totalTokens
      });

      return session;
    } catch (error) {
      this.logger.error('Failed to load conversation from database', error as Error);
      throw error;
    }
  }

  getCurrentSession(): ConversationSession | null {
    return this.currentSession;
  }

  clearHistory(): void {
    if (this.currentSession) {
      this.currentSession.messages = [];
      this.currentSession.totalTokens = 0;
      this.currentSession.updatedAt = new Date();

      this.logger.info('Conversation history cleared', {
        sessionId: this.currentSession.id
      });
    }
  }

  getStats(): {
    messageCount: number;
    totalTokens: number;
    sessionDuration: number;
  } {
    if (!this.currentSession) {
      return {
        messageCount: 0,
        totalTokens: 0,
        sessionDuration: 0
      };
    }

    const sessionDuration = Date.now() - this.currentSession.createdAt.getTime();

    return {
      messageCount: this.currentSession.messages.length,
      totalTokens: this.currentSession.totalTokens || 0,
      sessionDuration: Math.floor(sessionDuration / 1000) // in seconds
    };
  }

  // Private helper methods

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private selectMessagesForContext(maxTokens: number): ConversationMessage[] {
    if (!this.currentSession || this.currentSession.messages.length === 0) {
      return [];
    }

    const messages = [...this.currentSession.messages];
    const selectedMessages: ConversationMessage[] = [];
    let currentTokens = 0;

    // Always include system messages first
    const systemMessages = messages.filter(msg => msg.role === 'system');
    for (const msg of systemMessages) {
      const msgTokens = msg.tokens || this.estimateTokens(msg.content);
      if (currentTokens + msgTokens <= maxTokens) {
        selectedMessages.push(msg);
        currentTokens += msgTokens;
      }
    }

    // Add recent messages in reverse order (most recent first)
    const nonSystemMessages = messages
      .filter(msg => msg.role !== 'system')
      .reverse();

    for (const msg of nonSystemMessages) {
      const msgTokens = msg.tokens || this.estimateTokens(msg.content);
      if (currentTokens + msgTokens <= maxTokens) {
        selectedMessages.push(msg);
        currentTokens += msgTokens;
      } else {
        break; // Stop if adding this message would exceed token limit
      }
    }

    // Restore chronological order (system messages first, then chronological)
    const systemMsgs = selectedMessages.filter(msg => msg.role === 'system');
    const otherMsgs = selectedMessages
      .filter(msg => msg.role !== 'system')
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return [...systemMsgs, ...otherMsgs];
  }

  private trimHistoryIfNeeded(): void {
    if (!this.currentSession) return;

    const maxMessages = this.config.maxHistoryMessages;
    if (this.currentSession.messages.length > maxMessages) {
      // Keep system messages and trim user/assistant messages
      const systemMessages = this.currentSession.messages.filter(msg => msg.role === 'system');
      const otherMessages = this.currentSession.messages
        .filter(msg => msg.role !== 'system')
        .slice(-maxMessages + systemMessages.length);

      this.currentSession.messages = [...systemMessages, ...otherMessages];

      this.logger.debug('Conversation history trimmed', {
        sessionId: this.currentSession.id,
        newMessageCount: this.currentSession.messages.length,
        maxMessages
      });
    }
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }

  private async persistSessionToDatabase(session: ConversationSession): Promise<void> {
    if (!this.supabase) return;

    const dbSession: Partial<DatabaseConversationSession> = {
      id: session.id,
      user_id: session.userId,
      title: session.title,
      created_at: session.createdAt.toISOString(),
      updated_at: session.updatedAt.toISOString()
    };

    const { error } = await this.supabase
      .from('conversation_sessions')
      .upsert(dbSession);

    if (error) {
      throw new Error(`Failed to persist session: ${error.message}`);
    }
  }

  private async persistMessageToDatabase(
    sessionId: string,
    message: ConversationMessage
  ): Promise<void> {
    if (!this.supabase) return;

    const dbMessage: Partial<DatabaseConversationMessage> = {
      id: message.id,
      session_id: sessionId,
      role: message.role,
      content: message.content,
      tokens: message.tokens,
      created_at: message.timestamp.toISOString()
    };

    const { error } = await this.supabase
      .from('conversation_messages')
      .upsert(dbMessage);

    if (error) {
      throw new Error(`Failed to persist message: ${error.message}`);
    }
  }

  private convertDatabaseSessionToInternal(
    dbSession: DatabaseConversationSession,
    dbMessages: DatabaseConversationMessage[]
  ): ConversationSession {
    const messages: ConversationMessage[] = dbMessages.map(dbMsg => ({
      id: dbMsg.id,
      role: dbMsg.role,
      content: dbMsg.content,
      timestamp: new Date(dbMsg.created_at),
      tokens: dbMsg.tokens || undefined
    }));

    const totalTokens = messages.reduce((sum, msg) => sum + (msg.tokens || 0), 0);

    return {
      id: dbSession.id,
      userId: dbSession.user_id || undefined,
      title: dbSession.title || undefined,
      messages,
      createdAt: new Date(dbSession.created_at),
      updatedAt: new Date(dbSession.updated_at),
      totalTokens
    };
  }
}