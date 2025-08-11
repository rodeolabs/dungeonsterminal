import { useCallback, useEffect } from 'react';
import { GameSession, Character, GameState, GameEffect } from '@/types/game';
import { useSocketConnection } from './useSocketConnection';
import { useCharacterManager } from './useCharacterManager';
import { useGameStateManager } from './useGameStateManager';
import { useSessionPersistence } from './useSessionPersistence';
import { useGameSelectors } from './useGameSelectors';
import { gameSessionUtils } from '@/utils/gameSessionUtils';

interface UseGameSessionReturn {
  // Core data
  gameSession: GameSession | null;
  character: Character | null;
  gameState: GameState | null;
  
  // Connection state
  isConnected: boolean;
  connectionState: ReturnType<typeof useSocketConnection>['connectionState'];
  
  // Loading states
  isLoading: boolean;
  loadingStates: ReturnType<typeof useCharacterManager>['loadingStates'];
  
  // Error handling
  error: string | null;
  clearError: () => void;
  
  // Character operations
  createCharacter: (characterData: Partial<Character>) => Promise<void>;
  loadCharacter: (characterId: string) => Promise<void>;
  
  // Game state operations
  updateGameState: (effects: GameEffect[]) => Promise<void>;
  
  // Session operations
  saveSession: () => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  
  // Computed values
  selectors: ReturnType<typeof useGameSelectors>;
  
  // Connection management
  reconnect: () => void;
}

export const useGameSession = (): UseGameSessionReturn => {
  // Initialize all focused hooks
  const socketConnection = useSocketConnection();
  const characterManager = useCharacterManager(socketConnection.socket);
  const gameStateManager = useGameStateManager(socketConnection.socket);
  const sessionPersistence = useSessionPersistence(
    socketConnection.socket,
    characterManager.character,
    gameStateManager.gameState
  );
  const selectors = useGameSelectors(gameStateManager.gameState, characterManager.character);

  // Listen for character updates from server
  useEffect(() => {
    if (!socketConnection.socket) return;

    const handleCharacterUpdate = (updatedCharacter: Character) => {
      try {
        const validatedCharacter = gameSessionUtils.validateCharacter(updatedCharacter);
        // Update character state through the character manager
        // Note: This would require exposing a setCharacter method from useCharacterManager
        // For now, we'll handle this through the existing pattern
        console.debug('Character validated successfully:', validatedCharacter.id);
      } catch (error) {
        console.error('Invalid character update received:', error);
      }
    };

    socketConnection.socket.on('characterUpdate', handleCharacterUpdate);

    return () => {
      socketConnection.socket?.off('characterUpdate', handleCharacterUpdate);
    };
  }, [socketConnection.socket]);

  const createCharacter = useCallback(async (characterData: Partial<Character>) => {
    try {
      const result = await characterManager.createCharacter(characterData);
      
      // Check if the operation was successful
      if (result && 'success' in result && result.success && 'data' in result) {
        const newCharacter = result.data;
        
        // Initialize game state for new character
        const initialGameState = gameSessionUtils.createInitialGameState(newCharacter);
        gameStateManager.setGameState(initialGameState);

        // Create new game session
        sessionPersistence.createSession(newCharacter, initialGameState);
      } else if (result && 'success' in result && !result.success) {
        // Handle operation failure
        console.error('Character creation failed:', result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to create character:', error);
      throw error; // Re-throw to allow component to handle
    }
  }, [characterManager, gameStateManager, sessionPersistence]);

  const loadCharacter = useCallback(async (characterId: string) => {
    const loadedCharacter = await characterManager.loadCharacter(characterId);
    
    if (loadedCharacter) {
      // Load associated game state
      try {
        const stateResponse = await fetch(`/api/characters/${characterId}/gamestate`);
        if (stateResponse.ok) {
          const rawState = await stateResponse.json();
          const loadedState = gameSessionUtils.validateGameState(rawState);
          gameStateManager.setGameState(loadedState);
        } else {
          console.warn(`Game state not found for character ${characterId}, creating initial state`);
          const initialGameState = gameSessionUtils.createInitialGameState(loadedCharacter);
          gameStateManager.setGameState(initialGameState);
        }
      } catch (error) {
        console.error('Failed to load game state:', error);
        // Create initial game state if loading fails
        const initialGameState = gameSessionUtils.createInitialGameState(loadedCharacter);
        gameStateManager.setGameState(initialGameState);
      }
    }
  }, [characterManager, gameStateManager]);

  const updateGameState = useCallback(async (effects: GameEffect[]) => {
    if (!characterManager.character || !sessionPersistence.gameSession) return;
    
    await gameStateManager.updateGameState(
      effects, 
      characterManager.character, 
      sessionPersistence.gameSession
    );
  }, [characterManager.character, sessionPersistence.gameSession, gameStateManager]);

  const loadSession = useCallback(async (sessionId: string) => {
    await sessionPersistence.loadSession(sessionId);
    
    // Load character if session has characterId
    if (sessionPersistence.gameSession?.characterId) {
      await loadCharacter(sessionPersistence.gameSession.characterId);
    }
  }, [sessionPersistence, loadCharacter]);

  // Combine errors from all hooks
  const combinedError = socketConnection.error || 
                       characterManager.error || 
                       gameStateManager.error || 
                       sessionPersistence.error;

  const clearError = useCallback(() => {
    // Clear errors from all composed hooks
    if (socketConnection.error) {
      console.debug('Socket error cleared:', socketConnection.error);
    }
    characterManager.clearError();
    gameStateManager.clearError();
    sessionPersistence.clearError();
  }, [socketConnection.error, characterManager, gameStateManager, sessionPersistence]);

  // Determine if any operation is loading
  const isLoading = characterManager.loadingStates.creating ||
                   characterManager.loadingStates.loading ||
                   sessionPersistence.loadingStates.loading ||
                   sessionPersistence.loadingStates.saving;

  return {
    // Core data
    gameSession: sessionPersistence.gameSession,
    character: characterManager.character,
    gameState: gameStateManager.gameState,
    
    // Connection state
    isConnected: socketConnection.isConnected,
    connectionState: socketConnection.connectionState,
    
    // Loading states
    isLoading,
    loadingStates: {
      ...characterManager.loadingStates,
      ...sessionPersistence.loadingStates,
    },
    
    // Error handling
    error: combinedError,
    clearError,
    
    // Character operations
    createCharacter,
    loadCharacter,
    
    // Game state operations
    updateGameState,
    
    // Session operations
    saveSession: sessionPersistence.saveSession,
    loadSession,
    
    // Computed values
    selectors,
    
    // Connection management
    reconnect: socketConnection.reconnect,
  };
};