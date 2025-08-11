import { useCallback } from 'react';
import { Character, GameEffect } from '@/types/game';
import { GAME_MECHANICS } from '@/constants/gameConstants';

interface UseGameActionsProps {
  character: Character | null;
  updateGameState: (effects: GameEffect[]) => Promise<void>;
  isCharacterAlive: boolean;
}

export const useGameActions = ({ 
  character, 
  updateGameState, 
  isCharacterAlive 
}: UseGameActionsProps) => {
  const applyDamage = useCallback(async (
    damageType: keyof typeof GAME_MECHANICS.DAMAGE = 'GOBLIN_ATTACK',
    customValue?: number
  ) => {
    if (!character || !isCharacterAlive) return;
    
    const damageValue = customValue ?? GAME_MECHANICS.DAMAGE[damageType];
    await updateGameState([{
      type: 'damage',
      target: 'player',
      value: damageValue,
      description: `Player takes ${damageValue} damage from ${damageType.toLowerCase().replace('_', ' ')}`
    }]);
  }, [character, isCharacterAlive, updateGameState]);

  const applyHealing = useCallback(async (
    healingType: keyof typeof GAME_MECHANICS.HEALING = 'MINOR_POTION',
    customValue?: number
  ) => {
    if (!character || !isCharacterAlive) return;
    
    const healingValue = customValue ?? GAME_MECHANICS.HEALING[healingType];
    await updateGameState([{
      type: 'heal',
      target: 'player',
      value: healingValue,
      description: `Player heals ${healingValue} HP from ${healingType.toLowerCase().replace('_', ' ')}`
    }]);
  }, [character, isCharacterAlive, updateGameState]);

  const applyEffect = useCallback(async (
    effectType: 'buff' | 'debuff',
    name: string,
    description: string,
    duration: number = 10
  ) => {
    if (!character) return;
    
    await updateGameState([{
      type: effectType,
      target: 'player',
      description: `Applied ${effectType}: ${name} - ${description} (${duration} rounds)`
    }]);
  }, [character, updateGameState]);

  return {
    applyDamage,
    applyHealing,
    applyEffect,
  };
};