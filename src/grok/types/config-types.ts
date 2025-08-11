// Configuration Types
// TypeScript interfaces for system configuration

export interface GrokIntegrationConfig {
  grok: {
    apiKey: string;
    baseURL: string;
    model: string;
    temperature: number;
    maxTokens: number;
    timeout: number;
    maxRetries: number;
  };
  conversation: {
    maxContextTokens: number;
    maxHistoryMessages: number;
    enablePersistence: boolean;
  };
  supabase?: {
    url: string;
    anonKey: string;
  } | undefined;
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableConsole: boolean;
    enableFile: boolean;
  };
  dnd: {
    systemPrompt: string;
    enableRuleValidation: boolean;
    edition: '5e' | '3.5e' | 'pathfinder';
  };
}

export interface EnvironmentVariables {
  GROK_API_KEY?: string;
  GROK_MODEL?: string;
  GROK_TEMPERATURE?: string;
  GROK_MAX_TOKENS?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  LOG_LEVEL?: string;
  CONVERSATION_CONTEXT_LIMIT?: string;
  DND_EDITION?: string;
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ConfigurationManagerOptions {
  envFilePath?: string | undefined;
  configFilePath?: string | undefined;
  validateOnLoad?: boolean | undefined;
  throwOnValidationError?: boolean | undefined;
}