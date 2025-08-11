import React from 'react';
import { useGameSession } from '@/hooks/useGameSession';
import { Character } from '@/types/game';
import { ConnectionStatus } from './ConnectionStatus';
import { ErrorBanner } from './ErrorBanner';
import { LoadingIndicator } from './LoadingIndicator';
import { CharacterStats } from './CharacterStats';
import { createCharacterFromTemplate, CHARACTER_TEMPLATES } from '@/utils/characterTemplates';
import { GAME_MECHANICS } from '@/constants/gameConstants';

/**
 * Example component demonstrating the improved useGameSession hook usage
 * This shows how the refactored hook provides better developer experience
 * with granular loading states, consistent error handling, and computed selectors
 */
export const GameSessionExample: React.FC = () => {
  const {
    // Core data
    character,
    gameState,
    
    // Connection state
    connectionState,
    reconnect,
    
    // Loading states (granular)
    loadingStates,
    
    // Error handling (consistent)
    error,
    clearError,
    
    // Operations
    createCharacter,
    updateGameState,
    saveSession,
    
    // Computed values (memoized)
    selectors,
  } = useGameSession();

  const handleCreateCharacter = async (templateKey: string = 'testFighter') => {
    try {
      const characterData = createCharacterFromTemplate(templateKey as keyof typeof CHARACTER_TEMPLATES);
      await createCharacter(characterData);
    } catch (error) {
      console.error('Failed to create character:', error);
    }
  };

  const handleDamage = async () => {
    if (!character) return;
    
    const damageValue = GAME_MECHANICS.DAMAGE.GOBLIN_ATTACK;
    await updateGameState([{
      type: 'damage',
      target: 'player',
      value: damageValue,
      description: `Player takes ${damageValue} damage from goblin attack`
    }]);
  };

  const handleHealing = async () => {
    if (!character) return;
    
    const healingValue = GAME_MECHANICS.HEALING.MINOR_POTION;
    await updateGameState([{
      type: 'heal',
      target: 'player',
      value: healingValue,
      description: `Player heals ${healingValue} HP from potion`
    }]);
  };



  return (
    <div className="game-session-example">
      <h2>Game Session Example</h2>
      
      {/* Connection Status */}
      <ConnectionStatus 
        connectionState={connectionState} 
        onReconnect={reconnect} 
      />
      
      {/* Error Display */}
      <ErrorBanner error={error} onClear={clearError} />
      
      {/* Loading States */}
      <LoadingIndicator loadingStates={loadingStates} />
      
      {/* Character Management */}
      <div className="character-section">
        <h3>Character Management</h3>
        {!character ? (
          <button 
            onClick={handleCreateCharacter}
            disabled={loadingStates.creating}
          >
            {loadingStates.creating ? 'Creating...' : 'Create Character'}
          </button>
        ) : (
          <>
            <CharacterStats character={character} selectors={selectors} />
            
            <div className="action-buttons">
              <button 
                onClick={handleDamage}
                disabled={!selectors.isCharacterAlive || loadingStates.updating}
                aria-label={`Apply ${GAME_MECHANICS.DAMAGE.GOBLIN_ATTACK} damage to character`}
              >
                Take Damage ({GAME_MECHANICS.DAMAGE.GOBLIN_ATTACK})
              </button>
              
              <button 
                onClick={handleHealing}
                disabled={!selectors.isCharacterAlive || loadingStates.updating}
                aria-label={`Heal character for ${GAME_MECHANICS.HEALING.MINOR_POTION} HP`}
              >
                Heal ({GAME_MECHANICS.HEALING.MINOR_POTION})
              </button>
              
              <button 
                onClick={saveSession}
                disabled={loadingStates.saving}
                aria-label="Save current game session"
              >
                {loadingStates.saving ? 'Saving...' : 'Save Session'}
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Game State Display */}
      {gameState && (
        <div className="game-state-section">
          <h3>Game State</h3>
          <div>Location: {gameState.location}</div>
          <div>Active Effects: {gameState.activeEffects.length}</div>
          <div>Quests: {gameState.questLog.length}</div>
        </div>
      )}
    </div>
  );
};

export default GameSessionExample;