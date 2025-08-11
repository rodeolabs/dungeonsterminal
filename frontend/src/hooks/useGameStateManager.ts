import { useState, useCallback, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { GameState, Character, GameEffect, GameSession } from '@/types/game';
import { useErrorHandler } from './useErrorHandler';
import { gameSessionUtils } from '@/utils/gameSessionUtils';

interface UseGameStateManagerReturn {
  gameState: GameState | null;
  error: string | null;
  updateGameState: (effects: GameEffect[], character: Character, gameSession: GameSession) => Promise<void>;
  setGameState: (gameState: GameState) => void;
  clearError: () => void;
}

export const useGameStateManager = (socket: Socket | null): UseGameStateManagerReturn => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const { error, handleError, clearError } = useErrorHandler();

  // Listen for game state updates from server
  useEffect(() => {
    if (!socket) return;

    const handleGameStateUpdate = (updatedState: GameState) => {
      try {
        const validatedState = gameSessionUtils.validateGameState(updatedState);
        setGameState(validatedState);
      } catch (error) {
        handleError(error, 'Invalid game state received from server');
      }
    };

    socket.on('gameStateUpdate', handleGameStateUpdate);

    return () => {
      socket.off('gameStateUpdate', handleGameStateUpdate);
    };
  }, [socket, handleError]);

  const updateGameState = useCallback(async (
    effects: GameEffect[], 
    character: Character, 
    gameSession: GameSession
  ): Promise<void> => {
    if (!gameState) {
      handleError(new Error('No game state available'));
      return;
    }

    clearError();

    try {
      const updatedState = { ...gameState };
      let updatedCharacter = { ...character };

      // Apply effects to game state and character
      effects.forEach(effect => {
        switch (effect.type) {
          case 'damage':
            if (effect.target === 'player' && effect.value) {
              const newHp = gameSessionUtils.calculateDamage(updatedCharacter, effect.value);
              updatedCharacter = {
                ...updatedCharacter,
                hitPoints: { ...updatedCharacter.hitPoints, current: newHp }
              };
              updatedState.currentHp = newHp;
            }
            break;

          case 'heal':
            if (effect.target === 'player' && effect.value) {
              const newHp = gameSessionUtils.calculateHealing(updatedCharacter, effect.value);
              updatedCharacter = {
                ...updatedCharacter,
                hitPoints: { ...updatedCharacter.hitPoints, current: newHp }
              };
              updatedState.currentHp = newHp;
            }
            break;

          case 'move':
            updatedState.location = effect.description;
            break;

          case 'item':
            // Handle item changes (add/remove from inventory)
            // This would need more detailed implementation based on effect.description
            break;

          case 'buff':
          case 'debuff':
            // Add effect to active effects if not already present
            const existingEffect = updatedState.activeEffects.find(e => e.name === effect.description);
            if (!existingEffect) {
              updatedState.activeEffects.push({
                id: `effect_${Date.now()}`,
                name: effect.description,
                description: effect.description,
                duration: 10, // Default duration, should come from effect data
                type: effect.type === 'buff' ? 'buff' : 'debuff',
              });
            }
            break;
        }
      });

      // Validate the updated state before setting
      const validatedState = gameSessionUtils.validateGameState(updatedState);
      setGameState(validatedState);

      // Emit updates to server
      if (socket) {
        socket.emit('updateGameState', {
          sessionId: gameSession.sessionId,
          gameState: validatedState,
          character: updatedCharacter,
        });
      }

    } catch (error) {
      handleError(error, 'Failed to update game state');
    }
  }, [gameState, socket, handleError, clearError]);

  return {
    gameState,
    error,
    updateGameState,
    setGameState,
    clearError,
  };
};