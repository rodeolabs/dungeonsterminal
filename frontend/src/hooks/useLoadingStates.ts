import { useState, useCallback } from 'react';

interface LoadingStates {
  creating: boolean;
  loading: boolean;
  saving: boolean;
  updating: boolean;
}

interface UseLoadingStatesReturn {
  loadingStates: LoadingStates;
  setLoading: (operation: keyof LoadingStates, isLoading: boolean) => void;
  isAnyLoading: boolean;
}

export const useLoadingStates = (): UseLoadingStatesReturn => {
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    creating: false,
    loading: false,
    saving: false,
    updating: false,
  });

  const setLoading = useCallback((operation: keyof LoadingStates, isLoading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [operation]: isLoading }));
  }, []);

  const isAnyLoading = Object.values(loadingStates).some(Boolean);

  return {
    loadingStates,
    setLoading,
    isAnyLoading,
  };
};