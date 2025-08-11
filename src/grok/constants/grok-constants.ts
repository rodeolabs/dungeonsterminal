// Grok AI Constants
// System-wide constants for Grok AI integration

export const GROK_API = {
  BASE_URL: 'https://api.x.ai/v1',
  ENDPOINTS: {
    COMPLETIONS: '/chat/completions',
    MODELS: '/models'
  },
  DEFAULT_MODEL: 'grok-beta',
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 1000,
  DEFAULT_TIMEOUT: 30000,
  MAX_RETRIES: 3
} as const;

export const CONVERSATION = {
  MAX_CONTEXT_TOKENS: 4000,
  MAX_HISTORY_MESSAGES: 50,
  DEFAULT_SYSTEM_ROLE: 'system',
  USER_ROLE: 'user',
  ASSISTANT_ROLE: 'assistant'
} as const;

export const ERROR_CODES = {
  AUTHENTICATION_FAILED: 'AUTH_FAILED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  CONFIGURATION_ERROR: 'CONFIG_ERROR',
  DATABASE_ERROR: 'DB_ERROR'
} as const;

export const TERMINAL = {
  WELCOME_MESSAGE: `
🎲 AI Dungeon Master Terminal - Grok Integration
===============================================

Welcome to your AI-powered D&D assistant! Type your questions or commands below.
Commands: 'help', 'status', 'clear', 'exit'

`,
  PROMPT_PREFIX: '🎯 DM> ',
  EXIT_COMMANDS: ['exit', 'quit', 'q', 'bye'],
  HELP_COMMANDS: ['help', '?', 'commands']
} as const;

export const DND = {
  EDITIONS: ['5e', '3.5e', 'pathfinder'] as const,
  DEFAULT_EDITION: '5e',
  SYSTEM_PROMPT_TEMPLATE: `You are an expert Dungeon Master assistant for Dungeons & Dragons {edition}.
You have comprehensive knowledge of D&D rules, mechanics, lore, and best practices for running engaging tabletop RPG sessions.

Key responsibilities:
- Provide accurate D&D {edition} rule interpretations and clarifications
- Help create compelling NPCs, encounters, and storylines
- Assist with campaign planning and world-building
- Offer creative solutions for common DM challenges
- Maintain appropriate tone and atmosphere for fantasy RPG settings

Always prioritize fun, creativity, and collaborative storytelling while ensuring rule consistency and game balance.`
} as const;