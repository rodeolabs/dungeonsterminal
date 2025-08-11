// Configuration Manager Interface
// Defines the contract for configuration management

import type { GrokIntegrationConfig, ConfigValidationResult } from '../types/config-types';

export interface IConfigurationManager {
  /**
   * Load configuration from environment variables and files
   */
  loadConfiguration(): Promise<GrokIntegrationConfig>;

  /**
   * Validate configuration completeness and correctness
   */
  validateConfiguration(config: Partial<GrokIntegrationConfig>): ConfigValidationResult;

  /**
   * Get current configuration
   */
  getConfig(): GrokIntegrationConfig;

  /**
   * Update configuration at runtime
   */
  updateConfig(updates: Partial<GrokIntegrationConfig>): void;

  /**
   * Check if configuration is valid
   */
  isConfigValid(): boolean;

  /**
   * Get configuration validation errors
   */
  getValidationErrors(): string[];

  /**
   * Reload configuration from sources
   */
  reloadConfiguration(): Promise<void>;
}