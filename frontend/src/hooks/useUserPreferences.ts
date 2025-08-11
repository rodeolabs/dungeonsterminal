// User preferences management hook

import { useState, useEffect, useCallback } from 'react';

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  soundEffects: boolean;
  autoSave: boolean;
  aiDMSettings: {
    responseSpeed: 'fast' | 'normal' | 'detailed';
    narrativeStyle: 'concise' | 'descriptive' | 'immersive';
    difficultyPreference: 'easy' | 'normal' | 'hard' | 'adaptive';
    contentFilters: string[];
  };
  gameplaySettings: {
    showDiceRolls: boolean;
    autoCalculateDamage: boolean;
    highlightAvailableActions: boolean;
    showCharacterStats: boolean;
  };
  accessibilitySettings: {
    highContrast: boolean;
    reducedMotion: boolean;
    screenReaderOptimized: boolean;
    keyboardNavigation: boolean;
  };
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'auto',
  fontSize: 'medium',
  animations: true,
  soundEffects: true,
  autoSave: true,
  aiDMSettings: {
    responseSpeed: 'normal',
    narrativeStyle: 'descriptive',
    difficultyPreference: 'adaptive',
    contentFilters: [],
  },
  gameplaySettings: {
    showDiceRolls: true,
    autoCalculateDamage: true,
    highlightAvailableActions: true,
    showCharacterStats: true,
  },
  accessibilitySettings: {
    highContrast: false,
    reducedMotion: false,
    screenReaderOptimized: false,
    keyboardNavigation: false,
  },
};

const STORAGE_KEY = 'ai-dm-user-preferences';

interface UseUserPreferencesReturn {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for managing user preferences
 * Handles localStorage persistence and provides type-safe preference management
 */
export function useUserPreferences(): UseUserPreferencesReturn {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new preference additions
        setPreferences(prev => ({
          ...DEFAULT_PREFERENCES,
          ...parsed,
          aiDMSettings: {
            ...DEFAULT_PREFERENCES.aiDMSettings,
            ...parsed.aiDMSettings,
          },
          gameplaySettings: {
            ...DEFAULT_PREFERENCES.gameplaySettings,
            ...parsed.gameplaySettings,
          },
          accessibilitySettings: {
            ...DEFAULT_PREFERENCES.accessibilitySettings,
            ...parsed.accessibilitySettings,
          },
        }));
      }
    } catch (err) {
      console.error('Failed to load user preferences:', err);
      setError('Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
        setError(null);
      } catch (err) {
        console.error('Failed to save user preferences:', err);
        setError('Failed to save preferences');
      }
    }
  }, [preferences, isLoading]);

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const newPreferences = { ...prev };
      
      // Handle nested updates properly
      Object.keys(updates).forEach(key => {
        const value = updates[key as keyof UserPreferences];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          // Merge nested objects
          newPreferences[key as keyof UserPreferences] = {
            ...prev[key as keyof UserPreferences],
            ...value,
          } as any;
        } else {
          // Direct assignment for primitives and arrays
          newPreferences[key as keyof UserPreferences] = value as any;
        }
      });
      
      return newPreferences;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    try {
      localStorage.removeItem(STORAGE_KEY);
      setError(null);
    } catch (err) {
      console.error('Failed to reset user preferences:', err);
      setError('Failed to reset preferences');
    }
  }, []);

  return {
    preferences,
    updatePreferences,
    resetPreferences,
    isLoading,
    error,
  };
}

// Helper hooks for specific preference categories
export function useThemePreference() {
  const { preferences, updatePreferences } = useUserPreferences();
  
  return {
    theme: preferences.theme,
    setTheme: (theme: UserPreferences['theme']) => 
      updatePreferences({ theme }),
  };
}

export function useAIDMPreferences() {
  const { preferences, updatePreferences } = useUserPreferences();
  
  return {
    aiDMSettings: preferences.aiDMSettings,
    updateAIDMSettings: (settings: Partial<UserPreferences['aiDMSettings']>) =>
      updatePreferences({ aiDMSettings: settings }),
  };
}

export function useGameplayPreferences() {
  const { preferences, updatePreferences } = useUserPreferences();
  
  return {
    gameplaySettings: preferences.gameplaySettings,
    updateGameplaySettings: (settings: Partial<UserPreferences['gameplaySettings']>) =>
      updatePreferences({ gameplaySettings: settings }),
  };
}

export function useAccessibilityPreferences() {
  const { preferences, updatePreferences } = useUserPreferences();
  
  return {
    accessibilitySettings: preferences.accessibilitySettings,
    updateAccessibilitySettings: (settings: Partial<UserPreferences['accessibilitySettings']>) =>
      updatePreferences({ accessibilitySettings: settings }),
  };
}

export default useUserPreferences;