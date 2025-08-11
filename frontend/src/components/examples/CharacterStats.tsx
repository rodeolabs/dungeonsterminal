import React from 'react';
import { Character } from '@/types/game';

interface CharacterStatsProps {
  character: Character;
  selectors: {
    isCharacterAlive: boolean;
    healthPercentage: number;
    availableSpellSlots: number;
    inventoryWeight: number;
    isEncumbered: boolean;
    canCastSpells: boolean;
  };
}

interface StatRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

const StatRow: React.FC<StatRowProps> = ({ label, value, className }) => (
  <div className={`stat-row ${className || ''}`}>
    <span className="stat-label">{label}:</span>
    <span className="stat-value">{value}</span>
  </div>
);

export const CharacterStats: React.FC<CharacterStatsProps> = ({ 
  character, 
  selectors 
}) => {
  const {
    isCharacterAlive,
    healthPercentage,
    availableSpellSlots,
    inventoryWeight,
    isEncumbered,
    canCastSpells,
  } = selectors;

  const healthDisplay = (
    <>
      {character.hitPoints.current}/{character.hitPoints.maximum} 
      <span className="health-percentage">({healthPercentage.toFixed(0)}%)</span>
    </>
  );

  const spellSlotsDisplay = (
    <>
      {availableSpellSlots} 
      <span className="spell-indicator">{canCastSpells ? '✨' : '❌'}</span>
    </>
  );

  const inventoryDisplay = (
    <>
      {inventoryWeight} lbs 
      <span className="encumbrance-indicator">
        {isEncumbered ? '🎒⚠️' : '🎒'}
      </span>
    </>
  );

  return (
    <div className="character-stats">
      <h3 className="character-name">{character.name}</h3>
      
      <StatRow
        label="Status"
        value={
          <span className={isCharacterAlive ? 'alive' : 'dead'}>
            {isCharacterAlive ? '💚 Alive' : '💀 Dead'}
          </span>
        }
      />
      
      <StatRow
        label="Health"
        value={healthDisplay}
        className="health-stat"
      />
      
      <StatRow
        label="Spell Slots"
        value={spellSlotsDisplay}
        className="spell-stat"
      />
      
      <StatRow
        label="Inventory"
        value={inventoryDisplay}
        className={isEncumbered ? 'encumbered' : 'normal'}
      />
    </div>
  );
};