// Configuration Manager Tests
// Unit tests for configuration loading and validation

import { ConfigurationManager } from '../../config/ConfigurationManager';
import type { GrokIntegrationConfig } from '../../types/config-types';

describe('ConfigurationManager', () => {
  let configManager: ConfigurationManager;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    configManager = new ConfigurationManager({ throwOnValidationError: false });
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('loadConfiguration', () => {
    it('should load default configuration when no env vars are set', async () => {
      // Clear relevant env vars
      delete process.env['GROK_API_KEY'];
      delete process.env['SUPABASE_URL'];
      delete process.env['SUPABASE_ANON_KEY'];

      const config = await configManager.loadConfiguration();

      expect(config.grok.baseURL).toBe('https://api.x.ai/v1');
      expect(config.grok.model).toBe('grok-beta');
      expect(config.grok.temperature).toBe(0.7);
      expect(config.conversation.enablePersistence).toBe(false);
    });

    it('should load configuration from environment variables', async () => {
      process.env['GROK_API_KEY'] = 'xai-test-key';
      process.env['GROK_MODEL'] = 'grok-1';
      process.env['GROK_TEMPERATURE'] = '0.5';
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test-anon-key';

      const config = await configManager.loadConfiguration();

      expect(config.grok.apiKey).toBe('xai-test-key');
      expect(config.grok.model).toBe('grok-1');
      expect(config.grok.temperature).toBe(0.5);
      expect(config.conversation.enablePersistence).toBe(true);
      expect(config.supabase?.url).toBe('https://test.supabase.co');
    });
  });

  describe('validateConfiguration', () => {
    it('should return errors for missing required fields', () => {
      const config: Partial<GrokIntegrationConfig> = {
        grok: {
          apiKey: '',
          baseURL: 'https://api.x.ai/v1',
          model: 'grok-beta',
          temperature: 0.7,
          maxTokens: 1000,
          timeout: 30000,
          maxRetries: 3
        }
      };

      const result = configManager.validateConfiguration(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('GROK_API_KEY is required');
    });

    it('should return warnings for suspicious API key format', () => {
      const config: Partial<GrokIntegrationConfig> = {
        grok: {
          apiKey: 'invalid-key-format',
          baseURL: 'https://api.x.ai/v1',
          model: 'grok-beta',
          temperature: 0.7,
          maxTokens: 1000,
          timeout: 30000,
          maxRetries: 3
        }
      };

      const result = configManager.validateConfiguration(config);

      expect(result.warnings).toContain('Grok API key should start with "xai-"');
    });

    it('should validate temperature range', () => {
      const config: Partial<GrokIntegrationConfig> = {
        grok: {
          apiKey: 'xai-valid-key',
          baseURL: 'https://api.x.ai/v1',
          model: 'grok-beta',
          temperature: 3.0, // Invalid: too high
          maxTokens: 1000,
          timeout: 30000,
          maxRetries: 3
        }
      };

      const result = configManager.validateConfiguration(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Temperature must be between 0 and 2');
    });

    it('should validate Supabase config when persistence is enabled', () => {
      const config: Partial<GrokIntegrationConfig> = {
        grok: {
          apiKey: 'xai-valid-key',
          baseURL: 'https://api.x.ai/v1',
          model: 'grok-beta',
          temperature: 0.7,
          maxTokens: 1000,
          timeout: 30000,
          maxRetries: 3
        },
        conversation: {
          maxContextTokens: 4000,
          maxHistoryMessages: 50,
          enablePersistence: true
        }
        // Missing supabase config
      };

      const result = configManager.validateConfiguration(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('SUPABASE_URL is required when persistence is enabled');
      expect(result.errors).toContain('SUPABASE_ANON_KEY is required when persistence is enabled');
    });
  });

  describe('updateConfig', () => {
    it('should update configuration values', async () => {
      process.env['GROK_API_KEY'] = 'xai-initial-key';
      await configManager.loadConfiguration();

      configManager.updateConfig({
        grok: {
          apiKey: 'xai-updated-key',
          baseURL: 'https://api.x.ai/v1',
          model: 'grok-beta',
          temperature: 0.8,
          maxTokens: 1000,
          timeout: 30000,
          maxRetries: 3
        }
      });

      const config = configManager.getConfig();
      expect(config.grok.apiKey).toBe('xai-updated-key');
      expect(config.grok.temperature).toBe(0.8);
      // Other values should remain unchanged
      expect(config.grok.model).toBe('grok-beta');
    });
  });
});