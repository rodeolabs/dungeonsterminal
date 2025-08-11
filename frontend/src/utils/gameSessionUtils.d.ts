import { Character, GameState, GameSession } from '@/types/game';
export declare const gameSessionUtils: {
    generateSessionId: () => string;
    generatePlayerId: () => string;
    createInitialGameState: (character: Character) => GameState;
    createGameSession: (character: Character, gameState: GameState, playerId?: string) => GameSession;
    validateCharacter: (data: unknown) => Character;
    validateGameState: (data: unknown) => GameState;
    calculateDamage: (character: Character, damage: number) => number;
    calculateHealing: (character: Character, healing: number) => number;
    isCharacterAlive: (character: Character) => boolean;
    getAvailableSpellSlots: (character: Character) => number;
    calculateInventoryWeight: (inventory: GameState['inventory']) => number;
};
//# sourceMappingURL=gameSessionUtils.d.ts.map