import { useState, useCallback, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { GameSession, Character, GameState } from '@/types/game';
import { useErrorHandler } from './useErrorHandler';
import { useLoadingStates } from './useLoadingStates';
import { useDebouncedAutoSave } from './useDebouncedAutoSave';
import { gameSessionUtils } from '@/utils/gameSessionUtils';

interface UseSessionPersistenceReturn {
  gameSession: GameSession | null;
  loadingStates: ReturnType<typeof useLoadingStates>['loadingStates'];
  error: string | null;
  saveSession: () => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  createSession: (character: Character, gameState: GameState) => GameSession;
  clearError: () => void;
}

export const useSessionPersistence = (
  socket: Socket | null,
  character: Character | null,
  gameState: GameState | null
): UseSessionPersistenceReturn => {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const { error, handleError, clearError } = useErrorHandler();
  const { loadingStates, setLoading } = useLoadingStates();

  const saveSession = useCallback(async (): Promise<void> => {
    if (!gameSession || !character || !gameState) {
      return;
    }

    setLoading('saving', true);
    try {
      const response = await fetch('/api/sessions/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: gameSession.sessionId,
          character,
          gameState,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      handleError(error, 'Failed to save session');
      throw error; // Re-throw so debounced save can handle it
    } finally {
      setLoading('saving', false);
    }
  }, [gameSession, character, gameState, setLoading, handleError]);

  // Set up debounced auto-save
  const { debouncedSave, forceSave } = useDebouncedAutoSave(saveSession, 2000);

  const loadSession = useCallback(async (sessionId: string): Promise<void> => {
    setLoading('loading', true);
    clearError();

    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const rawSession = await response.json();
      
      // Basic validation of session data
      if (!rawSession || typeof rawSession !== 'object') {
        throw new Error('Invalid session data received');
      }

      if (!rawSession.sessionId || !rawSession.characterId) {
        throw new Error('Session data missing required fields');
      }

      setGameSession(rawSession as GameSession);

      // Join the session via socket
      if (socket) {
        socket.emit('join-session', sessionId);
      }

    } catch (error) {
      handleError(error, 'Failed to load session');
    } finally {
      setLoading('loading', false);
    }
  }, [socket, setLoading, handleError, clearError]);

  const createSession = useCallback((character: Character, gameState: GameState): GameSession => {
    const newSession = gameSessionUtils.createGameSession(character, gameState);
    setGameSession(newSession);

    // Join the session via socket
    if (socket) {
      socket.emit('join-session', newSession.sessionId);
    }

    return newSession;
  }, [socket]);

  // Auto-save when game state or character changes
  useEffect(() => {
    if (gameSession && character && gameState) {
      debouncedSave();
    }
  }, [gameSession, character, gameState, debouncedSave]);

  // Force save on unmount
  useEffect(() => {
    return () => {
      if (gameSession && character && gameState) {
        forceSave().catch(error => {
          console.error('Failed to save session on unmount:', error);
        });
      }
    };
  }, [gameSession, character, gameState, forceSave]);

  return {
    gameSession,
    loadingStates,
    error,
    saveSession: forceSave, // Expose force save as manual save
    loadSession,
    createSession,
    clearError,
  };
};