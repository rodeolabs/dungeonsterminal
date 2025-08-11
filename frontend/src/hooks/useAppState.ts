// Composite hook to manage App-level state
import { useMemo } from 'react';
import { useGameSession } from './useGameSession';
import { useAIDMConnection } from './useAIDMConnection';
import { useUserPreferences } from './useUserPreferences';
import { useModalState } from './useModalState';

interface ConnectionStatus {
  isFullyConnected: boolean;
  hasAnyError: boolean;
  isAnyLoading: boolean;
  combinedError: string | null;
}

export const useAppState = () => {
  const gameSession = useGameSession();
  const aiDMConnection = useAIDMConnection();
  const preferences = useUserPreferences();
  const modals = useModalState();

  // Memoized derived state to prevent unnecessary re-renders
  const connectionStatus: ConnectionStatus = useMemo(() => {
    const isFullyConnected = gameSession.isConnected && aiDMConnection.isConnected;
    const hasAnyError = Boolean(gameSession.error || aiDMConnection.error);
    const isAnyLoading = gameSession.isLoading || aiDMConnection.isLoading;
    
    // Prioritize game session errors over AI DM errors
    const combinedError = gameSession.error || aiDMConnection.error || null;

    return {
      isFullyConnected,
      hasAnyError,
      isAnyLoading,
      combinedError,
    };
  }, [
    gameSession.isConnected,
    gameSession.isLoading,
    gameSession.error,
    aiDMConnection.isConnected,
    aiDMConnection.isLoading,
    aiDMConnection.error,
  ]);

  // Memoized character creation trigger
  const shouldShowCharacterCreator = useMemo(() => 
    !gameSession.character && 
    !gameSession.isLoading && 
    gameSession.isConnected && 
    !modals.showCharacterCreator,
    [gameSession.character, gameSession.isLoading, gameSession.isConnected, modals.showCharacterCreator]
  );

  return {
    gameSession,
    aiDMConnection,
    preferences,
    modals,
    connectionStatus,
    shouldShowCharacterCreator,
  };
};