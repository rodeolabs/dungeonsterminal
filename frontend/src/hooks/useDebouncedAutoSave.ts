import { useCallback, useRef, useEffect } from 'react';

interface UseDebouncedAutoSaveReturn {
  debouncedSave: () => void;
  forceSave: () => Promise<void>;
  cancelPendingSave: () => void;
}

export const useDebouncedAutoSave = (
  saveFunction: () => Promise<void>,
  delay = 2000
): UseDebouncedAutoSaveReturn => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isExecutingRef = useRef(false);

  const debouncedSave = useCallback(() => {
    // Cancel any pending save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't schedule a new save if one is already executing
    if (isExecutingRef.current) {
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      if (isExecutingRef.current) {
        return;
      }

      isExecutingRef.current = true;
      try {
        await saveFunction();
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        isExecutingRef.current = false;
      }
    }, delay);
  }, [saveFunction, delay]);

  const forceSave = useCallback(async () => {
    // Cancel any pending debounced save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't execute if already executing
    if (isExecutingRef.current) {
      return;
    }

    isExecutingRef.current = true;
    try {
      await saveFunction();
    } finally {
      isExecutingRef.current = false;
    }
  }, [saveFunction]);

  const cancelPendingSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    debouncedSave,
    forceSave,
    cancelPendingSave,
  };
};