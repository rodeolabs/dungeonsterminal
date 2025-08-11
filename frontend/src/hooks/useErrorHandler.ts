import { useState, useCallback } from 'react';

interface UseErrorHandlerReturn {
  error: string | null;
  handleError: (error: unknown, fallbackMessage?: string) => void;
  clearError: () => void;
  hasError: boolean;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: unknown, fallbackMessage = 'An error occurred') => {
    let message: string;
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      message = String((error as any).message);
    } else {
      message = fallbackMessage;
    }
    
    setError(message);
    console.error('Error occurred:', error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: error !== null,
  };
};