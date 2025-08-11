import { useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { Character } from '@/types/game';
import { useErrorHandler } from './useErrorHandler';
import { useLoadingStates } from './useLoadingStates';
import { gameSessionUtils } from '@/utils/gameSessionUtils';

type CharacterOperationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

interface UseCharacterManagerReturn {
  character: Character | null;
  characters: Character[];
  loadingStates: ReturnType<typeof useLoadingStates>['loadingStates'];
  error: string | null;
  createCharacter: (characterData: Partial<Character>) => Promise<CharacterOperationResult<Character>>;
  loadCharacter: (characterId: string) => Promise<CharacterOperationResult<Character>>;
  updateCharacter: (characterId: string, updates: Partial<Character>) => Promise<CharacterOperationResult<Character>>;
  deleteCharacter: (characterId: string) => Promise<CharacterOperationResult<boolean>>;
  listCharacters: () => Promise<CharacterOperationResult<Character[]>>;
  clearError: () => void;
}

export const useCharacterManager = (socket: Socket | null): UseCharacterManagerReturn => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [characterCache, setCharacterCache] = useState<Map<string, Character>>(new Map());
  const { error, handleError, clearError } = useErrorHandler();
  const { loadingStates, setLoading } = useLoadingStates();

  // Connection validation
  const validateConnection = useCallback(() => {
    if (!socket) {
      throw new Error('Not connected to server');
    }
  }, [socket]);

  // Input validation
  const validateCharacterData = useCallback((data: Partial<Character>): void => {
    if (!data.name?.trim()) {
      throw new Error('Character name is required');
    }
    
    if (data.name.length > 50) {
      throw new Error('Character name must be 50 characters or less');
    }
    
    if (data.level && (data.level < 1 || data.level > 20)) {
      throw new Error('Character level must be between 1 and 20');
    }
  }, []);

  // Centralized HTTP request handler
  const makeCharacterRequest = useCallback(async (
    url: string, 
    options?: RequestInit
  ): Promise<Character> => {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
    }

    const rawData = await response.json();
    return gameSessionUtils.validateCharacter(rawData);
  }, []);

  // Update cache helper
  const updateCache = useCallback((characterToCache: Character) => {
    setCharacterCache(prev => new Map(prev).set(characterToCache.id, characterToCache));
  }, []);

  const createCharacter = useCallback(async (characterData: Partial<Character>): Promise<CharacterOperationResult<Character>> => {
    try {
      validateCharacterData(characterData);
      validateConnection();
      setLoading('creating', true);
      clearError();

      const newCharacter = await makeCharacterRequest('/api/characters', {
        method: 'POST',
        body: JSON.stringify(characterData),
      });
      
      setCharacter(newCharacter);
      updateCache(newCharacter);
      setCharacters(prev => [...prev, newCharacter]);
      
      return { success: true, data: newCharacter };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create character';
      handleError(error, errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading('creating', false);
    }
  }, [validateCharacterData, validateConnection, makeCharacterRequest, handleError, clearError, setLoading, updateCache]);

  const loadCharacter = useCallback(async (characterId: string): Promise<CharacterOperationResult<Character>> => {
    try {
      // Check cache first
      const cachedCharacter = characterCache.get(characterId);
      if (cachedCharacter) {
        setCharacter(cachedCharacter);
        return { success: true, data: cachedCharacter };
      }

      validateConnection();
      setLoading('loading', true);
      clearError();

      const loadedCharacter = await makeCharacterRequest(`/api/characters/${characterId}`);
      
      setCharacter(loadedCharacter);
      updateCache(loadedCharacter);
      
      return { success: true, data: loadedCharacter };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load character';
      handleError(error, errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading('loading', false);
    }
  }, [characterCache, validateConnection, makeCharacterRequest, handleError, clearError, setLoading, updateCache]);

  const updateCharacter = useCallback(async (
    characterId: string, 
    updates: Partial<Character>
  ): Promise<CharacterOperationResult<Character>> => {
    try {
      validateCharacterData(updates);
      
      if (!character || character.id !== characterId) {
        throw new Error('Character not loaded');
      }

      validateConnection();
      setLoading('updating', true);
      clearError();

      // Optimistic update
      const optimisticCharacter = { ...character, ...updates };
      setCharacter(optimisticCharacter);

      const updatedCharacter = await makeCharacterRequest(`/api/characters/${characterId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      
      setCharacter(updatedCharacter);
      updateCache(updatedCharacter);
      setCharacters(prev => prev.map(char => char.id === characterId ? updatedCharacter : char));
      
      return { success: true, data: updatedCharacter };
    } catch (error) {
      // Revert optimistic update on error
      if (character) {
        setCharacter(character);
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to update character';
      handleError(error, errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading('updating', false);
    }
  }, [character, validateCharacterData, validateConnection, makeCharacterRequest, handleError, clearError, setLoading, updateCache]);

  const deleteCharacter = useCallback(async (characterId: string): Promise<CharacterOperationResult<boolean>> => {
    try {
      validateConnection();
      setLoading('updating', true);
      clearError();

      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
      }

      // Update local state
      if (character?.id === characterId) {
        setCharacter(null);
      }
      setCharacters(prev => prev.filter(char => char.id !== characterId));
      setCharacterCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(characterId);
        return newCache;
      });
      
      return { success: true, data: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete character';
      handleError(error, errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading('updating', false);
    }
  }, [character, validateConnection, handleError, clearError, setLoading]);

  const listCharacters = useCallback(async (): Promise<CharacterOperationResult<Character[]>> => {
    try {
      validateConnection();
      setLoading('loading', true);
      clearError();

      const response = await fetch('/api/characters');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
      }

      const rawData = await response.json();
      
      if (!Array.isArray(rawData)) {
        throw new Error('Invalid response: expected array of characters');
      }

      const validatedCharacters = rawData.map(data => gameSessionUtils.validateCharacter(data));
      
      setCharacters(validatedCharacters);
      
      // Update cache with all characters
      validatedCharacters.forEach(char => updateCache(char));
      
      return { success: true, data: validatedCharacters };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to list characters';
      handleError(error, errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading('loading', false);
    }
  }, [validateConnection, handleError, clearError, setLoading, updateCache]);

  return {
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
  };
};