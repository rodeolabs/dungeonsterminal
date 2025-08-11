import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TerminalOutput, TerminalTheme, OutputType } from '@/types/terminal';
import { PlayerIntent, DMResponse } from '@/types/game';
import { useTerminalHistory } from '@/hooks/useTerminalHistory';
import { useNaturalLanguageProcessor } from '@/hooks/useNaturalLanguageProcessor';
import { useGameSession } from '@/hooks/useGameSession';
import { formatOutput } from '@/utils/terminalFormatters';
import './TerminalEmulator.css';

interface TerminalEmulatorProps {
  theme: TerminalTheme;
  onDashboardUpdate?: (updates: any[]) => void;
  className?: string;
}

export const TerminalEmulator: React.FC<TerminalEmulatorProps> = ({
  theme,
  onDashboardUpdate,
  className = '',
}) => {
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputs, setOutputs] = useState<TerminalOutput[]>([
    {
      id: '1',
      text: 'Welcome to the AI Dungeon Master Terminal Interface',
      type: 'system',
      timestamp: new Date(),
    },
    {
      id: '2',
      text: 'Type your actions in natural language. For example: "I look around" or "I want to attack the goblin"',
      type: 'system',
      timestamp: new Date(),
    },
    {
      id: '3',
      text: 'Type "help" for available commands or just start your adventure!',
      type: 'system',
      timestamp: new Date(),
    },
  ]);

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToHistory, navigateHistory } = useTerminalHistory();
  const { processNaturalLanguage } = useNaturalLanguageProcessor();
  const { gameSession, updateGameState } = useGameSession();

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [outputs]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const addOutput = useCallback((text: string, type: OutputType, metadata?: Record<string, any>) => {
    const newOutput: TerminalOutput = {
      id: Date.now().toString(),
      text,
      type,
      timestamp: new Date(),
      metadata,
    };
    setOutputs(prev => [...prev, newOutput]);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        if (currentInput.trim()) {
          handleSubmit();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevCommand = navigateHistory('up');
        if (prevCommand) {
          setCurrentInput(prevCommand);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        const nextCommand = navigateHistory('down');
        setCurrentInput(nextCommand || '');
        break;
      case 'l':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleClearScreen();
        }
        break;
    }
  }, [currentInput, navigateHistory]);

  const handleSubmit = useCallback(async () => {
    if (!currentInput.trim() || isProcessing) return;

    const input = currentInput.trim();
    setCurrentInput('');
    setIsProcessing(true);

    // Add user input to output
    addOutput(`> ${input}`, 'system');
    addToHistory(input);

    try {
      // Handle built-in commands
      if (input.toLowerCase() === 'help') {
        handleHelpCommand();
        return;
      }

      if (input.toLowerCase() === 'clear') {
        handleClearScreen();
        return;
      }

      if (input.toLowerCase().startsWith('inventory') || input.toLowerCase() === 'inv') {
        handleInventoryCommand();
        return;
      }

      // Process natural language input
      const intent: PlayerIntent = await processNaturalLanguage(input, undefined);
      const response: DMResponse = await processGameAction(intent);

      // Display narrative response
      if (response.narrative) {
        addOutput(response.narrative, 'narrative');
      }

      // Handle game effects
      response.gameEffects?.forEach(effect => {
        addOutput(effect.description, 'combat');
      });

      // Update dashboard if callback provided
      if (onDashboardUpdate && response.dashboardUpdates) {
        onDashboardUpdate(response.dashboardUpdates);
      }

      // Update game state
      if (response.gameEffects) {
        await updateGameState(response.gameEffects);
      }

    } catch (error) {
      console.error('Error processing input:', error);
      addOutput('An error occurred while processing your action. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [currentInput, isProcessing, addOutput, addToHistory, processNaturalLanguage, gameSession, onDashboardUpdate, updateGameState]);

  const handleHelpCommand = useCallback(() => {
    const helpText = `
Available Commands:
• Natural language actions: "I look around", "I attack the goblin", "I cast fireball"
• help - Show this help message
• clear - Clear the terminal screen
• inventory (or inv) - Show your inventory
• stats - Show character statistics

Navigation:
• Up/Down arrows - Navigate command history
• Ctrl+L - Clear screen
• Enter - Submit command

Tips:
• Speak naturally - the AI understands conversational language
• Be specific about your actions for better results
• The dashboard on the side shows your current stats and inventory
    `.trim();
    
    addOutput(helpText, 'help');
  }, [addOutput]);

  const handleClearScreen = useCallback(() => {
    setOutputs([]);
  }, []);

  const handleInventoryCommand = useCallback(() => {
    if (gameSession?.gameState?.inventory) {
      const inventory = gameSession.gameState.inventory;
      if (inventory.length === 0) {
        addOutput('Your inventory is empty.', 'system');
      } else {
        const inventoryText = inventory.map(item => 
          `• ${item.name} (${item.quantity}x) - ${item.description}`
        ).join('\n');
        addOutput(`Inventory:\n${inventoryText}`, 'system');
      }
    } else {
      addOutput('Unable to access inventory. Please ensure you have a character loaded.', 'error');
    }
  }, [gameSession, addOutput]);

  const processGameAction = async (intent: PlayerIntent): Promise<DMResponse> => {
    // Import the AI DM service dynamically to avoid circular dependencies
    const { aiDMService } = await import('@/services/aiDMService');
    
    // Get current character and game state
    if (!gameSession?.character || !gameSession?.gameState) {
      return {
        narrative: "You need to create a character first before beginning your adventure. Use the character creator to get started!",
        gameEffects: [],
        dashboardUpdates: [],
      };
    }

    // Call the real AI DM service
    return await aiDMService.processAction(
      intent,
      gameSession.character,
      gameSession.gameState,
      {
        location: gameSession.gameState.location,
        activeNPCs: gameSession.gameState.activeNPCs || [],
        character: gameSession.character,
      }
    );
  };

  const terminalStyle = {
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    fontFamily: theme.fontFamily,
    fontSize: `${theme.fontSize}px`,
  };

  const inputStyle = {
    backgroundColor: 'transparent',
    color: theme.textColor,
    fontFamily: theme.fontFamily,
    fontSize: `${theme.fontSize}px`,
    border: 'none',
    outline: 'none',
    caretColor: theme.cursorColor,
  };

  return (
    <div className={`terminal-emulator ${className}`} style={terminalStyle}>
      <div className="terminal-header">
        <div className="terminal-title">AI Dungeon Master Terminal</div>
        <div className="terminal-controls">
          <div className="terminal-button close"></div>
          <div className="terminal-button minimize"></div>
          <div className="terminal-button maximize"></div>
        </div>
      </div>
      
      <div 
        ref={terminalRef}
        className="terminal-content"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="terminal-output">
          {outputs.map((output) => (
            <div 
              key={output.id} 
              className={`output-line output-${output.type}`}
              style={{ color: getOutputColor(output.type, theme) }}
            >
              {formatOutput(output)}
            </div>
          ))}
        </div>
        
        <div className="terminal-input-line">
          <span className="terminal-prompt" style={{ color: theme.accentColor }}>
            {'> '}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={inputStyle}
            className="terminal-input"
            disabled={isProcessing}
            placeholder={isProcessing ? "Processing..." : "Enter your action..."}
            autoComplete="off"
            spellCheck="false"
          />
          <span 
            className={`terminal-cursor ${isProcessing ? 'processing' : ''}`}
            style={{ backgroundColor: theme.cursorColor }}
          />
        </div>
      </div>
    </div>
  );
};

const getOutputColor = (type: OutputType, theme: TerminalTheme): string => {
  switch (type) {
    case 'error':
      return theme.errorColor || '#ff4444';
    case 'success':
      return theme.successColor || '#44ff44';
    case 'system':
      return theme.accentColor || theme.textColor;
    case 'dialogue':
      return theme.accentColor || theme.textColor;
    case 'combat':
      return theme.errorColor || '#ff4444';
    case 'help':
      return theme.accentColor || theme.textColor;
    default:
      return theme.textColor;
  }
};