import { useMemo } from 'react';
import { GameState, Character } from '@/types/game';
import { gameSessionUtils } from '@/utils/gameSessionUtils';

// D&D 5e game rules constants
const DND_5E_CARRYING_CAPACITY_MULTIPLIER = 15;

interface UseGameSelectorsReturn {
  isCharacterAlive: boolean;
  availableSpellSlots: number; // >= 0
  inventoryWeight: number; // >= 0
  isEncumbered: boolean;
  healthPercentage: number; // 0-100
  hasActiveEffects: boolean;
  activeBuffs: number; // >= 0
  activeDebuffs: number; // >= 0
  canCastSpells: boolean;
  isAtFullHealth: boolean;
}

export const useGameSelectors = (
  gameState: GameState | null, 
  character: Character | null
): UseGameSelectorsReturn => {
  // Memoize character health data to avoid redundant calculations
  const characterHealth = useMemo(() => {
    if (!character) return null;
    return {
      current: character.hitPoints.current,
      maximum: character.hitPoints.maximum,
      temporary: character.hitPoints.temporary
    };
  }, [character?.hitPoints.current, character?.hitPoints.maximum, character?.hitPoints.temporary]);

  // Memoize active effects to avoid redundant filtering
  const effectsData = useMemo(() => {
    if (!gameState) return { buffs: 0, debuffs: 0, total: 0 };
    
    const buffs = gameState.activeEffects.filter(effect => effect.type === 'buff').length;
    const debuffs = gameState.activeEffects.filter(effect => effect.type === 'debuff').length;
    
    return {
      buffs,
      debuffs,
      total: gameState.activeEffects.length
    };
  }, [gameState?.activeEffects]);

  const isCharacterAlive = useMemo(() => {
    try {
      return characterHealth ? characterHealth.current > 0 : false;
    } catch (error) {
      console.error('Error checking character alive status:', error);
      return false;
    }
  }, [characterHealth]);

  const availableSpellSlots = useMemo(() => {
    try {
      return character ? gameSessionUtils.getAvailableSpellSlots(character) : 0;
    } catch (error) {
      console.error('Error calculating available spell slots:', error);
      return 0;
    }
  }, [character]);

  const inventoryWeight = useMemo(() => {
    try {
      return gameState ? gameSessionUtils.calculateInventoryWeight(gameState.inventory) : 0;
    } catch (error) {
      console.error('Error calculating inventory weight:', error);
      return 0;
    }
  }, [gameState?.inventory]);

  const isEncumbered = useMemo(() => {
    if (!character || !character.abilities?.strength) return false;
    
    try {
      // D&D 5e rule: carrying capacity is Strength score × 15 pounds
      const carryingCapacity = character.abilities.strength * DND_5E_CARRYING_CAPACITY_MULTIPLIER;
      return inventoryWeight > carryingCapacity;
    } catch (error) {
      console.error('Error checking encumbrance:', error);
      return false;
    }
  }, [character?.abilities?.strength, inventoryWeight]);

  const healthPercentage = useMemo(() => {
    if (!characterHealth || characterHealth.maximum <= 0) return 0;
    
    try {
      const percentage = (characterHealth.current / characterHealth.maximum) * 100;
      // Clamp between 0-100 to handle edge cases
      return Math.max(0, Math.min(100, percentage));
    } catch (error) {
      console.error('Error calculating health percentage:', error);
      return 0;
    }
  }, [characterHealth]);

  const hasActiveEffects = useMemo(() => {
    return effectsData.total > 0;
  }, [effectsData.total]);

  const activeBuffs = useMemo(() => {
    return effectsData.buffs;
  }, [effectsData.buffs]);

  const activeDebuffs = useMemo(() => {
    return effectsData.debuffs;
  }, [effectsData.debuffs]);

  const canCastSpells = useMemo(() => {
    return availableSpellSlots > 0 && isCharacterAlive;
  }, [availableSpellSlots, isCharacterAlive]);

  const isAtFullHealth = useMemo(() => {
    return characterHealth ? characterHealth.current === characterHealth.maximum : false;
  }, [characterHealth]);

  return {
    isCharacterAlive,
    availableSpellSlots,
    inventoryWeight,
    isEncumbered,
    healthPercentage,
    hasActiveEffects,
    activeBuffs,
    activeDebuffs,
    canCastSpells,
    isAtFullHealth,
  };
};