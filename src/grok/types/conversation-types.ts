// Conversation Management Types
// TypeScript interfaces for conversation handling

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tokens?: number;
}

export interface ConversationSession {
  id: string;
  userId?: string;
  title?: string;
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
  totalTokens?: number;
  model?: string;
}

export interface ConversationContext {
  messages: ConversationMessage[];
  totalTokens: number;
  maxTokens: number;
}

export interface ConversationManagerConfig {
  maxContextTokens: number;
  maxHistoryMessages: number;
  enablePersistence: boolean;
  supabaseConfig?: {
    url: string;
    anonKey: string;
  };
}

export interface DatabaseConversationSession {
  id: string;
  user_id?: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseConversationMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens?: number;
  created_at: string;
}

export interface APIUsageRecord {
  id: string;
  session_id: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_estimate?: number;
  created_at: string;
}