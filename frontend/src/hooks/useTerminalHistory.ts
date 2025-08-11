import { useState, useCallback } from 'react';
import { TerminalHistory } from '@/types/terminal';

const MAX_HISTORY_SIZE = 100;

/**
 * Calculate the next history index based on navigation direction
 */
const calculateNextIndex = (
  currentIndex: number,
  commandsLength: number,
  direction: 'up' | 'down'
): number => {
  if (commandsLength === 0) return -1;
  
  if (direction === 'up') {
    return currentIndex === -1 ? commandsLength - 1 : Math.max(0, currentIndex - 1);
  } else {
    if (currentIndex === -1) return -1;
    return currentIndex < commandsLength - 1 ? currentIndex + 1 : -1;
  }
};

export const useTerminalHistory = () => {
  const [history, setHistory] = useState<TerminalHistory>({
    commands: [],
    currentIndex: -1,
  });

  const addToHistory = useCallback((command: string) => {
    const trimmedCommand = command.trim();
    if (!trimmedCommand) return;
    
    setHistory(prev => {
      const newCommands = [...prev.commands];
      
      // Don't add duplicate consecutive commands
      if (newCommands.length > 0 && newCommands[newCommands.length - 1].input === trimmedCommand) {
        return {
          commands: newCommands,
          currentIndex: -1,
        };
      }

      // Add new command
      newCommands.push({
        input: trimmedCommand,
        timestamp: new Date(),
      });

      // Limit history size
      if (newCommands.length > MAX_HISTORY_SIZE) {
        newCommands.shift();
      }

      return {
        commands: newCommands,
        currentIndex: -1,
      };
    });
  }, []);

  const navigateHistory = useCallback((direction: 'up' | 'down'): string | null => {
    const currentHistory = history;
    if (currentHistory.commands.length === 0) return null;

    const newIndex = calculateNextIndex(currentHistory.currentIndex, currentHistory.commands.length, direction);
    
    // Only update state if index actually changed
    if (newIndex !== currentHistory.currentIndex) {
      setHistory(prev => ({ ...prev, currentIndex: newIndex }));
    }
    
    return newIndex === -1 ? '' : currentHistory.commands[newIndex].input;
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory({
      commands: [],
      currentIndex: -1,
    });
  }, []);

  const getRecentCommands = useCallback((count: number = 10): string[] => {
    return history.commands
      .slice(-count)
      .map(cmd => cmd.input);
  }, [history.commands]);

  return {
    history,
    addToHistory,
    navigateHistory,
    clearHistory,
    getRecentCommands,
  };
};