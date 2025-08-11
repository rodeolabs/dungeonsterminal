import { useEffect, useCallback } from 'react';
import { TerminalEmulator } from '@/components/TerminalEmulator';
import { PlayerDashboard } from '@/components/PlayerDashboard';
import { ThemeSelector } from '@/components/ThemeSelector';
import { CharacterCreator } from '@/components/CharacterCreator';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAppState } from '@/hooks/useAppState';
import { TerminalTheme, DashboardTheme, DashboardLayout } from '@/types/terminal';
import './App.css';

function App() {
  const {
    gameSession,
    aiDMConnection,
    preferences,
    modals,
    connectionStatus,
    shouldShowCharacterCreator,
  } = useAppState();

  // Handle character creation
  const handleCharacterCreated = useCallback(async (characterData: any) => {
    await gameSession.createCharacter(characterData);
    modals.closeCharacterCreator();
  }, [gameSession.createCharacter, modals.closeCharacterCreator]);

  // Handle theme changes
  const handleThemeChange = useCallback((terminalTheme: TerminalTheme, dashboardTheme: DashboardTheme) => {
    preferences.updateThemes(terminalTheme, dashboardTheme);
  }, [preferences.updateThemes]);

  // Handle layout changes
  const handleLayoutChange = useCallback((layout: DashboardLayout) => {
    preferences.updateLayout(layout);
  }, [preferences.updateLayout]);

  // Handle dashboard updates (simplified - no longer storing in state)
  const handleDashboardUpdate = useCallback((updates: any[]) => {
    // Process updates immediately instead of storing in state
    console.log('Dashboard updates received:', updates);
    // In a real implementation, you might dispatch these to a context or state manager
  }, []);

  // Auto-show character creator when needed
  useEffect(() => {
    if (shouldShowCharacterCreator) {
      modals.openCharacterCreator();
    }
  }, [shouldShowCharacterCreator, modals.openCharacterCreator]);

  // Handle connection errors with retry logic
  useEffect(() => {
    if (aiDMConnection.error?.retryable && !aiDMConnection.isLoading) {
      const retryTimeout = setTimeout(() => {
        aiDMConnection.retryConnection();
      }, 5000); // Retry after 5 seconds

      return () => clearTimeout(retryTimeout);
    }
  }, [aiDMConnection.error, aiDMConnection.isLoading, aiDMConnection.retryConnection]);

  const appStyle = {
    backgroundColor: preferences.preferences.terminal.theme.backgroundColor,
    color: preferences.preferences.terminal.theme.textColor,
  };

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('App Error Boundary:', error, errorInfo);
        // In production, report to error monitoring service
      }}
    >
      <div className="app" style={appStyle}>
        {/* Connection Status */}
        {!connectionStatus.isFullyConnected && (
          <div className="connection-status error">
            ⚠️ {!gameSession.isConnected ? 'Game server disconnected' : 'AI DM unavailable'} - Attempting to reconnect...
          </div>
        )}
        
        {/* Error Display */}
        {connectionStatus.hasAnyError && (
          <div className="error-banner">
            <div className="error-content">
              ❌ {connectionStatus.combinedError}
              {aiDMConnection.error?.retryable && (
                <button 
                  onClick={aiDMConnection.retryConnection}
                  className="retry-button-inline"
                  disabled={aiDMConnection.isLoading}
                >
                  🔄 Retry
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Loading Overlay */}
        {connectionStatus.isAnyLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner">🎲</div>
            <div>
              {gameSession.isLoading ? 'Loading your adventure...' : 'Connecting to AI DM...'}
            </div>
          </div>
        )}

        {/* AI DM Status Indicator */}
        <div className="ai-status-bar">
          <div className="ai-status-indicator">
            <span className={`status-dot ${aiDMConnection.isConnected ? 'connected' : 'disconnected'}`} />
            AI DM: {aiDMConnection.isConnected ? 'Ready' : 'Offline'}
            {aiDMConnection.usageStats && (
              <span className="usage-info">
                ({aiDMConnection.usageStats.requestsToday} requests today)
              </span>
            )}
          </div>
        </div>

        {/* Main Interface */}
        <div className="app-layout">
          {/* Terminal Section */}
          <div className="terminal-section">
            <div className="terminal-header-bar">
              <div className="terminal-title">
                🎲 AI Dungeon Master Terminal
                {gameSession.character && (
                  <span className="character-name"> - {gameSession.character.name}</span>
                )}
              </div>
              <div className="terminal-controls">
                <button 
                  className="control-button"
                  onClick={modals.openThemeSelector}
                  title="Change Theme"
                >
                  🎨
                </button>
                <button 
                  className="control-button"
                  onClick={modals.openCharacterCreator}
                  title="Create New Character"
                >
                  👤
                </button>
              </div>
            </div>
            
            <TerminalEmulator
              theme={preferences.preferences.terminal.theme}
              onDashboardUpdate={handleDashboardUpdate}
              className="main-terminal"
            />
          </div>

          {/* Dashboard Section */}
          <PlayerDashboard
            character={gameSession.character || undefined}
            gameState={gameSession.gameState || undefined}
            theme={preferences.preferences.dashboard.theme}
            layout={preferences.preferences.dashboard.layout}
            onLayoutChange={handleLayoutChange}
            className="main-dashboard"
          />
        </div>

        {/* Modals */}
        {modals.showThemeSelector && (
          <ThemeSelector
            currentTerminalTheme={preferences.preferences.terminal.theme}
            currentDashboardTheme={preferences.preferences.dashboard.theme}
            onThemeChange={handleThemeChange}
            onClose={modals.closeThemeSelector}
          />
        )}

        {modals.showCharacterCreator && (
          <CharacterCreator
            onCharacterCreated={handleCharacterCreated}
            onClose={modals.closeCharacterCreator}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;