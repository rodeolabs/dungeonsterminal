// Game mechanics constants
export const GAME_MECHANICS = {
  // Example damage values
  DAMAGE: {
    GOBLIN_ATTACK: 5,
    SWORD_STRIKE: 8,
    FIREBALL: 12,
  },
  
  // Example healing values
  HEALING: {
    MINOR_POTION: 3,
    MAJOR_POTION: 8,
    HEALING_SPELL: 10,
  },
  
  // Character limits
  CHARACTER: {
    MAX_LEVEL: 20,
    MIN_ABILITY_SCORE: 3,
    MAX_ABILITY_SCORE: 20,
    STARTING_LEVEL: 1,
  },
  
  // UI constants
  UI: {
    HEALTH_WARNING_THRESHOLD: 0.25, // 25% health
    HEALTH_DANGER_THRESHOLD: 0.1,   // 10% health
    MAX_INVENTORY_DISPLAY: 10,
  },
} as const;

// Connection retry settings
export const CONNECTION_CONFIG = {
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  TIMEOUT: 30000,
} as const;

// Animation durations (in milliseconds)
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;