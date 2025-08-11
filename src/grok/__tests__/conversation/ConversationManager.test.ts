// Conversation Manager Tests
// Unit tests for conversation management functionality

import { ConversationManager } from '../../conversation/ConversationManager';
import type { ConversationManagerConfig, ConversationMessage } from '../../types/conversation-types';

// Mock Supabase
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        order: jest.fn(() => ({
          ascending: jest.fn()
        }))
      }))
    })),
    upsert: jest.fn()
  }))
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

describe('ConversationManager', () => {
  let conversationManager: ConversationManager;
  let mockConfig: ConversationManagerConfig;

  beforeEach(() => {
    mockConfig = {
      maxContextTokens: 4000,
      maxHistoryMessages: 50,
      enablePersistence: false
    };
    conversationManager = new ConversationManager(mockConfig);
    jest.clearAllMocks();
  });

  describe('initializeSession', () => {
    it('should create a new conversation session', async () => {
      const session = await conversationManager.initializeSession('user123', 'Test Session');

      expect(session).toBeDefined();
      expect(session.id).toMatch(/^session_\d+_[a-z0-9]+$/);
      expect(session.userId).toBe('user123');
      expect(session.title).toBe('Test Session');
      expect(session.messages).toEqual([]);
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.updatedAt).toBeInstanceOf(Date);
      expect(session.totalTokens).toBe(0);
    });

    it('should create session with default title when none provided', async () => {
      const session = await conversationManager.initializeSession('user123');

      expect(session.title).toMatch(/^D&D Session \d+\/\d+\/\d+$/);
    });

    it('should create session without userId', async () => {
      const session = await conversationManager.initializeSession();

      expect(session.userId).toBeUndefined();
      expect(session.id).toBeDefined();
    });

    it('should set current session', async () => {
      const session = await conversationManager.initializeSession();
      const currentSession = conversationManager.getCurrentSession();

      expect(currentSession).toEqual(session);
    });
  });

  describe('addMessage', () => {
    beforeEach(async () => {
      await conversationManager.initializeSession('user123');
    });

    it('should add a user message to the conversation', async () => {
      const message = await conversationManager.addMessage('user', 'Hello, DM!', 10);

      expect(message).toBeDefined();
      expect(message.id).toMatch(/^msg_\d+_[a-z0-9]+$/);
      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello, DM!');
      expect(message.tokens).toBe(10);
      expect(message.timestamp).toBeInstanceOf(Date);

      const session = conversationManager.getCurrentSession();
      expect(session?.messages).toHaveLength(1);
      expect(session?.messages[0]).toEqual(message);
      expect(session?.totalTokens).toBe(10);
    });

    it('should add an assistant message', async () => {
      const message = await conversationManager.addMessage(
        'assistant',
        'Greetings, adventurer! Welcome to the realm.',
        25
      );

      expect(message.role).toBe('assistant');
      expect(message.content).toBe('Greetings, adventurer! Welcome to the realm.');
      expect(message.tokens).toBe(25);
    });

    it('should add a system message', async () => {
      const message = await conversationManager.addMessage(
        'system',
        'You are an expert D&D Dungeon Master.',
        15
      );

      expect(message.role).toBe('system');
      expect(message.content).toBe('You are an expert D&D Dungeon Master.');
      expect(message.tokens).toBe(15);
    });

    it('should handle messages without token count', async () => {
      const message = await conversationManager.addMessage('user', 'Test message');

      expect(message.tokens).toBeUndefined();
      
      const session = conversationManager.getCurrentSession();
      expect(session?.totalTokens).toBe(0);
    });

    it('should throw error when no session is initialized', async () => {
      const manager = new ConversationManager(mockConfig);

      await expect(
        manager.addMessage('user', 'Hello')
      ).rejects.toThrow('No active conversation session');
    });

    it('should update session timestamp when message is added', async () => {
      const session = conversationManager.getCurrentSession();
      const originalUpdatedAt = session?.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      await conversationManager.addMessage('user', 'Test');

      const updatedSession = conversationManager.getCurrentSession();
      expect(updatedSession?.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt?.getTime() || 0
      );
    });
  });

  describe('getContext', () => {
    beforeEach(async () => {
      await conversationManager.initializeSession('user123');
    });

    it('should return empty context when no messages', () => {
      const context = conversationManager.getContext();

      expect(context.messages).toEqual([]);
      expect(context.totalTokens).toBe(0);
      expect(context.maxTokens).toBe(4000);
    });

    it('should return all messages when under token limit', async () => {
      await conversationManager.addMessage('system', 'You are a DM.', 10);
      await conversationManager.addMessage('user', 'Hello!', 5);
      await conversationManager.addMessage('assistant', 'Hi there!', 8);

      const context = conversationManager.getContext();

      expect(context.messages).toHaveLength(3);
      expect(context.totalTokens).toBe(23);
      expect(context.messages[0].role).toBe('system');
      // The remaining messages should be in chronological order
      expect(context.messages[1].role).toBe('user');
      expect(context.messages[2].role).toBe('assistant');
    });

    it('should prioritize system messages and recent messages', async () => {
      // Add system message
      await conversationManager.addMessage('system', 'You are a DM.', 1000);
      
      // Add many user/assistant messages that would exceed token limit
      for (let i = 0; i < 10; i++) {
        await conversationManager.addMessage('user', `Message ${i}`, 500);
        await conversationManager.addMessage('assistant', `Response ${i}`, 500);
      }

      const context = conversationManager.getContext(3000); // Limited tokens

      // Should include system message and some recent messages
      expect(context.messages.length).toBeGreaterThan(1);
      expect(context.messages[0].role).toBe('system');
      expect(context.totalTokens).toBeLessThanOrEqual(3000);
    });

    it('should respect custom max tokens', async () => {
      await conversationManager.addMessage('user', 'Test message', 100);
      await conversationManager.addMessage('assistant', 'Test response', 100);

      const context = conversationManager.getContext(150);

      expect(context.maxTokens).toBe(150);
      expect(context.totalTokens).toBeLessThanOrEqual(150);
    });
  });

  describe('clearHistory', () => {
    beforeEach(async () => {
      await conversationManager.initializeSession('user123');
      await conversationManager.addMessage('user', 'Hello', 10);
      await conversationManager.addMessage('assistant', 'Hi', 8);
    });

    it('should clear all messages from current session', () => {
      conversationManager.clearHistory();

      const session = conversationManager.getCurrentSession();
      expect(session?.messages).toEqual([]);
      expect(session?.totalTokens).toBe(0);
    });

    it('should update session timestamp when history is cleared', () => {
      const originalUpdatedAt = conversationManager.getCurrentSession()?.updatedAt;

      conversationManager.clearHistory();

      const updatedAt = conversationManager.getCurrentSession()?.updatedAt;
      expect(updatedAt?.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt?.getTime() || 0);
    });

    it('should handle clearing when no session exists', () => {
      const manager = new ConversationManager(mockConfig);
      
      expect(() => manager.clearHistory()).not.toThrow();
    });
  });

  describe('getStats', () => {
    it('should return zero stats when no session', () => {
      const stats = conversationManager.getStats();

      expect(stats.messageCount).toBe(0);
      expect(stats.totalTokens).toBe(0);
      expect(stats.sessionDuration).toBe(0);
    });

    it('should return correct stats for active session', async () => {
      await conversationManager.initializeSession('user123');
      await conversationManager.addMessage('user', 'Hello', 10);
      await conversationManager.addMessage('assistant', 'Hi', 15);

      // Wait a bit for session duration
      await new Promise(resolve => setTimeout(resolve, 100));

      const stats = conversationManager.getStats();

      expect(stats.messageCount).toBe(2);
      expect(stats.totalTokens).toBe(25);
      expect(stats.sessionDuration).toBeGreaterThan(0);
    });
  });

  describe('history trimming', () => {
    beforeEach(async () => {
      // Create manager with small max history for testing
      const trimConfig: ConversationManagerConfig = {
        ...mockConfig,
        maxHistoryMessages: 5
      };
      conversationManager = new ConversationManager(trimConfig);
      await conversationManager.initializeSession('user123');
    });

    it('should trim history when exceeding max messages', async () => {
      // Add system message
      await conversationManager.addMessage('system', 'You are a DM.');

      // Add more messages than the limit
      for (let i = 0; i < 8; i++) {
        await conversationManager.addMessage('user', `Message ${i}`);
      }

      const session = conversationManager.getCurrentSession();
      expect(session?.messages.length).toBeLessThanOrEqual(5);
      
      // System message should be preserved
      const systemMessages = session?.messages.filter(msg => msg.role === 'system');
      expect(systemMessages?.length).toBe(1);
    });

    it('should keep most recent messages when trimming', async () => {
      // Add messages with identifiable content
      for (let i = 0; i < 8; i++) {
        await conversationManager.addMessage('user', `Message ${i}`);
      }

      const session = conversationManager.getCurrentSession();
      const lastMessage = session?.messages[session.messages.length - 1];
      
      // Last message should be the most recent one added
      expect(lastMessage?.content).toBe('Message 7');
    });
  });

  describe('persistence', () => {
    let persistentManager: ConversationManager;

    beforeEach(() => {
      const persistentConfig: ConversationManagerConfig = {
        ...mockConfig,
        enablePersistence: true,
        supabaseConfig: {
          url: 'https://test.supabase.co',
          anonKey: 'test-key'
        }
      };
      persistentManager = new ConversationManager(persistentConfig);
    });

    it('should initialize Supabase client when persistence is enabled', () => {
      expect(require('@supabase/supabase-js').createClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-key'
      );
    });

    it('should attempt to persist session when initialized', async () => {
      const mockUpsert = jest.fn().mockResolvedValue({ error: null });
      mockSupabaseClient.from.mockReturnValue({
        upsert: mockUpsert
      });

      await persistentManager.initializeSession('user123', 'Test Session');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('conversation_sessions');
      expect(mockUpsert).toHaveBeenCalled();
    });

    it('should continue without persistence if database save fails', async () => {
      const mockUpsert = jest.fn().mockResolvedValue({ 
        error: { message: 'Database error' } 
      });
      mockSupabaseClient.from.mockReturnValue({
        upsert: mockUpsert
      });

      // Should not throw error even if database save fails
      const session = await persistentManager.initializeSession('user123');
      expect(session).toBeDefined();
    });
  });

  describe('token estimation', () => {
    beforeEach(async () => {
      await conversationManager.initializeSession('user123');
    });

    it('should estimate tokens for messages without token count', async () => {
      await conversationManager.addMessage('user', 'This is a test message');

      const context = conversationManager.getContext();
      
      // Should have estimated tokens (roughly 1 token per 4 characters)
      expect(context.totalTokens).toBeGreaterThan(0);
    });

    it('should use provided token count over estimation', async () => {
      await conversationManager.addMessage('user', 'Short', 100); // Explicit high token count

      const context = conversationManager.getContext();
      expect(context.totalTokens).toBe(100);
    });
  });
});