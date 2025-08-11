import { Character, GameState, GameSession } from '@/types/game';
// Utility functions for game session management
export const gameSessionUtils = {
    // Generate secure IDs
    generateSessionId: () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return `session_${crypto.randomUUID()}`;
        }
        // Fallback for environments without crypto.randomUUID
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    generatePlayerId: () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return `player_${crypto.randomUUID()}`;
        }
        // Fallback for environments without crypto.randomUUID
        return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    // Create initial game state from character
    createInitialGameState: (character) => {
        return {
            currentHp: character.hitPoints.current,
            spellSlots: Object.fromEntries(Object.entries(character.spellSlots).map(([level, slots]) => [level, slots.current])),
            inventory: character.inventory,
            activeEffects: [],
            location: 'Starting Area',
            questLog: [],
        };
    },
    // Create new game session
    createGameSession: (character, gameState, playerId) => {
        return {
            sessionId: gameSessionUtils.generateSessionId(),
            playerId: playerId || gameSessionUtils.generatePlayerId(),
            characterId: character.id,
            currentLocation: {
                id: 'start',
                name: 'Starting Area',
                description: 'A peaceful starting location for new adventurers.',
                type: 'town',
                exits: ['north', 'east', 'west'],
            },
            gameState,
        };
    },
    // Validate character data
    validateCharacter: (data) => {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid character data: not an object');
        }
        const character = data;
        // Check required fields
        if (!character.id || typeof character.id !== 'string') {
            throw new Error('Invalid character data: missing or invalid id');
        }
        if (!character.name || typeof character.name !== 'string') {
            throw new Error('Invalid character data: missing or invalid name');
        }
        if (!character.hitPoints || typeof character.hitPoints !== 'object') {
            throw new Error('Invalid character data: missing or invalid hitPoints');
        }
        if (typeof character.hitPoints.current !== 'number' ||
            typeof character.hitPoints.maximum !== 'number') {
            throw new Error('Invalid character data: invalid hitPoints values');
        }
        if (!Array.isArray(character.inventory)) {
            throw new Error('Invalid character data: inventory must be an array');
        }
        return character;
    },
    // Validate game state data
    validateGameState: (data) => {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid game state data: not an object');
        }
        const gameState = data;
        if (typeof gameState.currentHp !== 'number') {
            throw new Error('Invalid game state data: missing or invalid currentHp');
        }
        if (!gameState.spellSlots || typeof gameState.spellSlots !== 'object') {
            throw new Error('Invalid game state data: missing or invalid spellSlots');
        }
        if (!Array.isArray(gameState.inventory)) {
            throw new Error('Invalid game state data: inventory must be an array');
        }
        if (!Array.isArray(gameState.activeEffects)) {
            throw new Error('Invalid game state data: activeEffects must be an array');
        }
        if (!Array.isArray(gameState.questLog)) {
            throw new Error('Invalid game state data: questLog must be an array');
        }
        return gameState;
    },
    // Calculate damage with bounds checking
    calculateDamage: (character, damage) => {
        return Math.max(0, character.hitPoints.current - damage);
    },
    // Calculate healing with bounds checking
    calculateHealing: (character, healing) => {
        return Math.min(character.hitPoints.maximum, character.hitPoints.current + healing);
    },
    // Check if character is alive
    isCharacterAlive: (character) => {
        return character.hitPoints.current > 0;
    },
    // Calculate available spell slots
    getAvailableSpellSlots: (character) => {
        return Object.values(character.spellSlots).reduce((total, slots) => total + slots.current, 0);
    },
    // Calculate inventory weight
    calculateInventoryWeight: (inventory) => {
        return inventory.reduce((total, item) => total + (item.weight * item.quantity), 0);
    },
};
//# sourceMappingURL=gameSessionUtils.js.map