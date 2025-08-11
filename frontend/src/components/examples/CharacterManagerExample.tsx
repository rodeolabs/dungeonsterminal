import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Character } from '@/types/game';
import { useCharacterManager } from '@/hooks/useCharacterManager';

interface CharacterManagerExampleProps {
  socket: Socket | null;
}

export const CharacterManagerExample: React.FC<CharacterManagerExampleProps> = ({ socket }) => {
  const {
    character,
    characters,
    loadingStates,
    error,
    createCharacter,
    loadCharacter,
    updateCharacter,
    deleteCharacter,
    listCharacters,
    clearError,
  } = useCharacterManager(socket);

  const [newCharacterName, setNewCharacterName] = useState('');
  const [selectedCharacterId, setSelectedCharacterId] = useState('');

  // Load characters on mount
  useEffect(() => {
    const loadInitialCharacters = async () => {
      const result = await listCharacters();
      if (!result.success) {
        console.error('Failed to load characters:', result.error);
      }
    };

    if (socket) {
      loadInitialCharacters();
    }
  }, [socket, listCharacters]);

  const handleCreateCharacter = async () => {
    if (!newCharacterName.trim()) return;

    const characterData: Partial<Character> = {
      name: newCharacterName,
      level: 1,
      hitPoints: { current: 10, maximum: 10 },
      inventory: [],
      spellSlots: {},
    };

    const result = await createCharacter(characterData);
    
    if (result.success) {
      setNewCharacterName('');
      console.log('Character created successfully:', result.data);
    } else {
      console.error('Failed to create character:', result.error);
    }
  };

  const handleLoadCharacter = async (characterId: string) => {
    const result = await loadCharacter(characterId);
    
    if (result.success) {
      console.log('Character loaded:', result.data);
    } else {
      console.error('Failed to load character:', result.error);
    }
  };

  const handleUpdateCharacter = async () => {
    if (!character) return;

    const updates: Partial<Character> = {
      level: (character.level || 1) + 1,
      hitPoints: {
        ...character.hitPoints,
        maximum: character.hitPoints.maximum + 5,
        current: character.hitPoints.current + 5,
      },
    };

    const result = await updateCharacter(character.id, updates);
    
    if (result.success) {
      console.log('Character updated successfully:', result.data);
    } else {
      console.error('Failed to update character:', result.error);
    }
  };

  const handleDeleteCharacter = async (characterId: string) => {
    if (!confirm('Are you sure you want to delete this character?')) return;

    const result = await deleteCharacter(characterId);
    
    if (result.success) {
      console.log('Character deleted successfully');
      if (character?.id === characterId) {
        setSelectedCharacterId('');
      }
    } else {
      console.error('Failed to delete character:', result.error);
    }
  };

  return (
    <div className="character-manager-example">
      <h2>Character Manager Example</h2>
      
      {/* Error Display */}
      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
          Error: {error}
          <button onClick={clearError} style={{ marginLeft: '0.5rem' }}>
            Clear
          </button>
        </div>
      )}

      {/* Connection Status */}
      <div className="connection-status" style={{ marginBottom: '1rem' }}>
        Status: {socket ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      {/* Create Character */}
      <div className="create-character" style={{ marginBottom: '2rem' }}>
        <h3>Create New Character</h3>
        <input
          type="text"
          value={newCharacterName}
          onChange={(e) => setNewCharacterName(e.target.value)}
          placeholder="Character name"
          disabled={loadingStates.creating}
        />
        <button 
          onClick={handleCreateCharacter}
          disabled={loadingStates.creating || !newCharacterName.trim()}
        >
          {loadingStates.creating ? 'Creating...' : 'Create Character'}
        </button>
      </div>

      {/* Character List */}
      <div className="character-list" style={{ marginBottom: '2rem' }}>
        <h3>Characters ({characters.length})</h3>
        {loadingStates.loading && <p>Loading characters...</p>}
        
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {characters.map((char) => (
            <div 
              key={char.id} 
              style={{ 
                padding: '0.5rem', 
                border: '1px solid #ccc',
                backgroundColor: character?.id === char.id ? '#e6f3ff' : 'white'
              }}
            >
              <strong>{char.name}</strong> (Level {char.level || 1})
              <div style={{ marginTop: '0.5rem' }}>
                <button 
                  onClick={() => handleLoadCharacter(char.id)}
                  disabled={loadingStates.loading}
                  style={{ marginRight: '0.5rem' }}
                >
                  Load
                </button>
                <button 
                  onClick={() => handleDeleteCharacter(char.id)}
                  disabled={loadingStates.updating}
                  style={{ color: 'red' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Character */}
      {character && (
        <div className="current-character" style={{ marginBottom: '2rem' }}>
          <h3>Current Character</h3>
          <div style={{ padding: '1rem', border: '2px solid #007bff', borderRadius: '4px' }}>
            <h4>{character.name}</h4>
            <p>Level: {character.level || 1}</p>
            <p>HP: {character.hitPoints.current}/{character.hitPoints.maximum}</p>
            <p>Inventory Items: {character.inventory.length}</p>
            
            <button 
              onClick={handleUpdateCharacter}
              disabled={loadingStates.updating}
              style={{ marginTop: '0.5rem' }}
            >
              {loadingStates.updating ? 'Updating...' : 'Level Up!'}
            </button>
          </div>
        </div>
      )}

      {/* Loading States Debug */}
      <div className="loading-states" style={{ fontSize: '0.8rem', color: '#666' }}>
        <h4>Loading States (Debug)</h4>
        <ul>
          <li>Creating: {loadingStates.creating ? '✅' : '❌'}</li>
          <li>Loading: {loadingStates.loading ? '✅' : '❌'}</li>
          <li>Updating: {loadingStates.updating ? '✅' : '❌'}</li>
          <li>Saving: {loadingStates.saving ? '✅' : '❌'}</li>
        </ul>
      </div>
    </div>
  );
};

export default CharacterManagerExample;