// Configuration Manager Implementation
// Handles loading and validation of system configuration

import type { IConfigurationManager } from '../interfaces/IConfigurationManager';
import type { 
  GrokIntegrationConfig, 
  EnvironmentVariables, 
  ConfigValidationResult,
  ConfigurationManagerOptions 
} from '../types/config-types';

/**
 * Configuration Manager for Grok AI Integration
 * 
 * Handles loading, validation, and management of system configuration
 * from environment variables and configuration files.
 * 
 * @example
 * ```typescript
 * const configManager = new ConfigurationManager({
 *   validateOnLoad: true,
 *   throwOnValidationError: true
 * });
 * 
 * const config = await configManager.loadConfiguration();
 * console.log('Grok API Key:', config.grok.apiKey);
 * ```
 */
export class ConfigurationManager implements IConfigurationManager {
  private config: GrokIntegrationConfig | null = null;
  private validationErrors: string[] = [];
  private options: ConfigurationManagerOptions;

  /**
   * Creates a new ConfigurationManager instance
   * 
   * @param options - Configuration options for the manager
   * @param options.validateOnLoad - Whether to validate configuration on load (default: true)
   * @param options.throwOnValidationError - Whether to throw on validation errors (default: true)
   */
  constructor(options: ConfigurationManagerOptions = {}) {
    this.options = {
      validateOnLoad: true,
      throwOnValidationError: true,
      ...options
    };
  }

  async loadConfiguration(): Promise<GrokIntegrationConfig> {
    const env = process.env as EnvironmentVariables;
    
    const defaultConfig: GrokIntegrationConfig = {
      grok: this.buildGrokConfig(env),
      conversation: this.buildConversationConfig(env),
      ...(this.shouldIncludeSupabaseConfig(env) ? {
        supabase: this.buildSupabaseConfig(env)
      } : {}),
      logging: this.buildLoggingConfig(env),
      dnd: this.buildDnDConfig(env)
    };

    this.config = defaultConfig;

    if (this.options.validateOnLoad) {
      const validation = this.validateConfiguration(this.config);
      if (!validation.isValid && this.options.throwOnValidationError) {
        throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
      }
    }

    return this.config;
  }

  private buildGrokConfig(env: EnvironmentVariables) {
    return {
      apiKey: env.GROK_API_KEY || '',
      baseURL: 'https://api.x.ai/v1',
      model: env.GROK_MODEL || 'grok-beta',
      temperature: this.parseFloat(env.GROK_TEMPERATURE, 0.7),
      maxTokens: this.parseInt(env.GROK_MAX_TOKENS, 1000),
      timeout: 30000,
      maxRetries: 3
    };
  }

  private buildConversationConfig(env: EnvironmentVariables) {
    return {
      maxContextTokens: this.parseInt(env.CONVERSATION_CONTEXT_LIMIT, 4000),
      maxHistoryMessages: 50,
      enablePersistence: this.shouldIncludeSupabaseConfig(env)
    };
  }

  private buildSupabaseConfig(env: EnvironmentVariables) {
    return {
      url: env.SUPABASE_URL!,
      anonKey: env.SUPABASE_ANON_KEY!
    };
  }

  private buildLoggingConfig(env: EnvironmentVariables) {
    const level = env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error' | undefined;
    return {
      level: level || 'info',
      enableConsole: true,
      enableFile: false
    };
  }

  private buildDnDConfig(env: EnvironmentVariables) {
    const edition = env.DND_EDITION as '5e' | '3.5e' | 'pathfinder' | undefined;
    return {
      systemPrompt: this.getDnDSystemPrompt(),
      enableRuleValidation: true,
      edition: edition || '5e'
    };
  }

  private shouldIncludeSupabaseConfig(env: EnvironmentVariables): boolean {
    return !!(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
  }

  private parseFloat(value: string | undefined, defaultValue: number): number {
    if (!value) return defaultValue;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  private parseInt(value: string | undefined, defaultValue: number): number {
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  validateConfiguration(config: Partial<GrokIntegrationConfig>): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required Grok API configuration
    if (!config.grok?.apiKey) {
      errors.push('GROK_API_KEY is required');
    }

    if (config.grok?.apiKey && !config.grok.apiKey.startsWith('xai-')) {
      warnings.push('Grok API key should start with "xai-"');
    }

    if (config.grok?.temperature && (config.grok.temperature < 0 || config.grok.temperature > 2)) {
      errors.push('Temperature must be between 0 and 2');
    }

    if (config.grok?.maxTokens && config.grok.maxTokens < 1) {
      errors.push('Max tokens must be greater than 0');
    }

    // Validate Supabase configuration if persistence is enabled
    if (config.conversation?.enablePersistence) {
      if (!config.supabase?.url) {
        errors.push('SUPABASE_URL is required when persistence is enabled');
      }
      if (!config.supabase?.anonKey) {
        errors.push('SUPABASE_ANON_KEY is required when persistence is enabled');
      }
    }

    // Validate logging configuration
    const validLogLevels = ['debug', 'info', 'warn', 'error'];
    if (config.logging?.level && !validLogLevels.includes(config.logging.level)) {
      errors.push(`Log level must be one of: ${validLogLevels.join(', ')}`);
    }

    // Validate D&D configuration
    const validEditions = ['5e', '3.5e', 'pathfinder'];
    if (config.dnd?.edition && !validEditions.includes(config.dnd.edition)) {
      errors.push(`D&D edition must be one of: ${validEditions.join(', ')}`);
    }

    this.validationErrors = errors;

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  getConfig(): GrokIntegrationConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfiguration() first.');
    }
    return this.config;
  }

  updateConfig(updates: Partial<GrokIntegrationConfig>): void {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfiguration() first.');
    }
    
    this.config = {
      ...this.config,
      ...updates,
      grok: { ...this.config.grok, ...updates.grok },
      conversation: { ...this.config.conversation, ...updates.conversation },
      ...(updates.supabase && this.config.supabase ? {
        supabase: { ...this.config.supabase, ...updates.supabase }
      } : {}),
      logging: { ...this.config.logging, ...updates.logging },
      dnd: { ...this.config.dnd, ...updates.dnd }
    };
  }

  isConfigValid(): boolean {
    return this.validationErrors.length === 0;
  }

  getValidationErrors(): string[] {
    return [...this.validationErrors];
  }

  async reloadConfiguration(): Promise<void> {
    await this.loadConfiguration();
  }

  private _cachedSystemPrompt?: string;

  /**
   * Gets the D&D system prompt with memoization for performance
   * @returns The system prompt string
   */
  private getDnDSystemPrompt(): string {
    if (!this._cachedSystemPrompt) {
      this._cachedSystemPrompt = `You are an expert Dungeon Master assistant for Dungeons & Dragons 5th Edition. 
You have comprehensive knowledge of D&D rules, mechanics, lore, and best practices for running engaging tabletop RPG sessions.

Key responsibilities:
- Provide accurate D&D 5e rule interpretations and clarifications
- Help create compelling NPCs, encounters, and storylines
- Assist with campaign planning and world-building
- Offer creative solutions for common DM challenges
- Maintain appropriate tone and atmosphere for fantasy RPG settings

Always prioritize fun, creativity, and collaborative storytelling while ensuring rule consistency and game balance.`;
    }
    return this._cachedSystemPrompt;
  }
}