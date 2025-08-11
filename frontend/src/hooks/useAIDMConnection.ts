// AI Dungeon Master Connection Hook
// Manages connection status and health checks for the AI DM service

import { useState, useEffect, useCallback, useRef } from 'react';
import { aiDMService } from '@/services/aiDMService';
import { 
  AIDMConnectionState, 
  AIDMError, 
  AIDM_ERROR_CODES, 
  AIDM_CONFIG,
  ConnectionHealth,
  UsageStats 
} from '@/types/aiDM';

interface UseAIDMConnectionReturn {
  // Connection state
  isConnected: boolean;
  isAvailable: boolean;
  isLoading: boolean;
  error: AIDMError | null;
  
  // Health and stats
  health: ConnectionHealth;
  usageStats: UsageStats | null;
  
  // Actions
  checkConnection: () => Promise<void>;
  refreshUsageStats: () => Promise<void>;
  clearError: () => void;
  retryConnection: () => Promise<void>;
}

const createAIDMError = (
  code: string, 
  message: string, 
  details?: string, 
  retryable: boolean = true
): AIDMError => ({
  code,
  message,
  details,
  timestamp: new Date(),
  retryable,
});

const INITIAL_HEALTH: ConnectionHealth = {
  isConnected: false,
  isAvailable: false,
  lastChecked: new Date(),
};

export const useAIDMConnection = (): UseAIDMConnectionReturn => {
  const [state, setState] = useState<AIDMConnectionState>({
    health: INITIAL_HEALTH,
    isLoading: true,
    error: null,
    usageStats: null,
  });

  const retryCountRef = useRef(0);
  const connectionCheckTimeoutRef = useRef<NodeJS.Timeout>();
  const usageStatsTimeoutRef = useRef<NodeJS.Timeout>();

  const checkConnection = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const startTime = Date.now();

    try {
      // Check if service is available with timeout
      const availabilityPromise = aiDMService.isAvailable();
      const timeoutPromise = new Promise<boolean>((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), AIDM_CONFIG.CONNECTION_TIMEOUT)
      );

      const isAvailable = await Promise.race([availabilityPromise, timeoutPromise]);
      
      if (!isAvailable) {
        const error = createAIDMError(
          AIDM_ERROR_CODES.SERVICE_UNAVAILABLE,
          'AI DM service is not available',
          'The service may be down for maintenance or experiencing issues'
        );
        
        setState(prev => ({
          ...prev,
          health: {
            ...prev.health,
            isConnected: false,
            isAvailable: false,
            lastChecked: new Date(),
            responseTime: Date.now() - startTime,
          },
          isLoading: false,
          error,
        }));
        return;
      }

      // Test AI connection
      const isConnected = await aiDMService.testConnection();
      const responseTime = Date.now() - startTime;
      
      setState(prev => ({
        ...prev,
        health: {
          isConnected,
          isAvailable: true,
          lastChecked: new Date(),
          responseTime,
        },
        isLoading: false,
        error: isConnected ? null : createAIDMError(
          AIDM_ERROR_CODES.API_ERROR,
          'AI DM connection test failed',
          'The service is available but not responding correctly'
        ),
      }));

      // Reset retry count on successful connection
      if (isConnected) {
        retryCountRef.current = 0;
      }

    } catch (error) {
      const responseTime = Date.now() - startTime;
      let aidmError: AIDMError;

      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          aidmError = createAIDMError(
            AIDM_ERROR_CODES.TIMEOUT,
            'Connection timeout',
            `Request timed out after ${AIDM_CONFIG.CONNECTION_TIMEOUT}ms`
          );
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          aidmError = createAIDMError(
            AIDM_ERROR_CODES.NETWORK_ERROR,
            'Network error',
            error.message
          );
        } else {
          aidmError = createAIDMError(
            AIDM_ERROR_CODES.UNKNOWN,
            'Connection check failed',
            error.message
          );
        }
      } else {
        aidmError = createAIDMError(
          AIDM_ERROR_CODES.UNKNOWN,
          'Unknown error occurred',
          'An unexpected error occurred during connection check'
        );
      }

      setState(prev => ({
        ...prev,
        health: {
          isConnected: false,
          isAvailable: false,
          lastChecked: new Date(),
          responseTime,
        },
        isLoading: false,
        error: aidmError,
      }));
    }
  }, []);

  const refreshUsageStats = useCallback(async () => {
    try {
      const stats = await aiDMService.getUsageStats();
      if (stats) {
        setState(prev => ({
          ...prev,
          usageStats: {
            ...stats,
            lastUpdated: new Date(),
          },
        }));
      }
    } catch (error) {
      console.error('Failed to refresh usage stats:', error);
      // Don't update error state for usage stats failures
    }
  }, []);

  const retryConnection = useCallback(async () => {
    if (retryCountRef.current < AIDM_CONFIG.MAX_RETRY_ATTEMPTS) {
      retryCountRef.current++;
      
      // Exponential backoff
      const delay = AIDM_CONFIG.RETRY_DELAY * Math.pow(2, retryCountRef.current - 1);
      
      setTimeout(() => {
        checkConnection();
      }, delay);
    }
  }, [checkConnection]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
    retryCountRef.current = 0;
  }, []);

  // Initial connection check
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Periodic connection checks
  useEffect(() => {
    connectionCheckTimeoutRef.current = setInterval(() => {
      if (!state.isLoading) {
        checkConnection();
      }
    }, AIDM_CONFIG.CONNECTION_CHECK_INTERVAL);

    return () => {
      if (connectionCheckTimeoutRef.current) {
        clearInterval(connectionCheckTimeoutRef.current);
      }
    };
  }, [checkConnection, state.isLoading]);

  // Periodic usage stats refresh
  useEffect(() => {
    if (state.health.isConnected) {
      // Initial stats fetch
      if (!state.usageStats) {
        refreshUsageStats();
      }

      // Periodic refresh
      usageStatsTimeoutRef.current = setInterval(() => {
        refreshUsageStats();
      }, AIDM_CONFIG.USAGE_STATS_REFRESH_INTERVAL);
    }

    return () => {
      if (usageStatsTimeoutRef.current) {
        clearInterval(usageStatsTimeoutRef.current);
      }
    };
  }, [state.health.isConnected, state.usageStats, refreshUsageStats]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connectionCheckTimeoutRef.current) {
        clearInterval(connectionCheckTimeoutRef.current);
      }
      if (usageStatsTimeoutRef.current) {
        clearInterval(usageStatsTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Connection state
    isConnected: state.health.isConnected,
    isAvailable: state.health.isAvailable,
    isLoading: state.isLoading,
    error: state.error,
    
    // Health and stats
    health: state.health,
    usageStats: state.usageStats,
    
    // Actions
    checkConnection,
    refreshUsageStats,
    clearError,
    retryConnection,
  };
};