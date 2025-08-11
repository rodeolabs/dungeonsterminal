import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, Character } from '@/types/game';
import { useStateMachine, createStateMachine } from './useStateMachine';

// Socket event type definitions for type safety
interface SocketEvents {
  // Game events
  gameStateUpdate: (gameState: GameState) => void;
  characterUpdate: (character: Character) => void;
  narrativeUpdate: (narrative: string) => void;
  diceRoll: (result: { dice: string; result: number; modifier?: number }) => void;
  
  // System events
  ping: (timestamp: number) => void;
  pong: (timestamp: number) => void;
  error: (error: { message: string; code?: string }) => void;
  
  // Session events
  sessionStart: (sessionId: string) => void;
  sessionEnd: (sessionId: string) => void;
  playerJoin: (playerId: string) => void;
  playerLeave: (playerId: string) => void;
}

// Enhanced configuration interface
interface SocketConfig {
  serverUrl: string;
  reconnectAttempts: number;
  reconnectDelay: number;
  timeout: number;
  enableHeartbeat: boolean;
  heartbeatInterval: number;
}

const DEFAULT_CONFIG: SocketConfig = {
  serverUrl: process.env.REACT_APP_SERVER_URL || 'http://localhost:3001',
  reconnectAttempts: 3,
  reconnectDelay: 1000,
  timeout: 20000,
  enableHeartbeat: true,
  heartbeatInterval: 30000,
} as const;

// Connection state machine configuration
const CONNECTION_STATES = ['disconnected', 'connecting', 'connected', 'reconnecting', 'error'] as const;
type ConnectionState = typeof CONNECTION_STATES[number];
type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'unknown';

const connectionStateMachine = createStateMachine(CONNECTION_STATES, {
  disconnected: ['connecting'],
  connecting: ['connected', 'error'],
  connected: ['disconnected', 'reconnecting'],
  reconnecting: ['connected', 'error', 'disconnected'],
  error: ['connecting', 'disconnected'],
});

interface UseSocketConnectionReturn {
  socket: Socket<SocketEvents> | null;
  isConnected: boolean;
  connectionState: ConnectionState;
  connectionQuality: ConnectionQuality;
  latency: number | null;
  error: string | null;
  reconnect: () => void;
  getConnectionHistory: () => ReturnType<typeof useStateMachine>['history'];
  canTransition: (newState: ConnectionState) => boolean;
}

export const useSocketConnection = (
  config: Partial<SocketConfig> = {}
): UseSocketConnectionReturn => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [socket, setSocket] = useState<Socket<SocketEvents> | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>('unknown');
  const [latency, setLatency] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();

  // Use the state machine hook for connection state management
  const { 
    state: connectionState, 
    transition, 
    history: connectionHistory,
    canTransition 
  } = useStateMachine(
    connectionStateMachine.initialState,
    connectionStateMachine.transitions
  );

  const reconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }
    setError(null);
    transition('connecting', 'manual_reconnect');
  }, [socket, transition]);

  const getConnectionHistory = useCallback(() => connectionHistory, [connectionHistory]);

  // Initialize socket connection
  useEffect(() => {
    transition('connecting', 'initial_connection');
    
    const newSocket = io(finalConfig.serverUrl, {
      reconnectionAttempts: finalConfig.reconnectAttempts,
      reconnectionDelay: finalConfig.reconnectDelay,
      timeout: finalConfig.timeout,
    });

    // Store cleanup functions to prevent memory leaks
    const cleanup: (() => void)[] = [];
    const addCleanup = (fn: () => void) => cleanup.push(fn);

    // Connection event handlers with enhanced error handling
    const eventHandlers = {
      connect: () => {
        transition('connected', 'server_connected');
        setError(null);
        setConnectionQuality('good'); // Initial quality assumption
      },

      disconnect: (reason: string) => {
        const newState = reason === 'io server disconnect' ? 'disconnected' : 'reconnecting';
        transition(newState, `disconnect_reason: ${reason}`);
        setConnectionQuality('unknown');
        setLatency(null);
      },

      connect_error: (err: Error) => {
        transition('error', 'connection_error');
        const errorMessage = err.message || 'Connection failed';
        setError(errorMessage);
        
        // Enhanced error logging
        console.error('Socket connection error:', {
          message: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString(),
        });
        
        // Optional: Report to error tracking service in production
        if (process.env.NODE_ENV === 'production') {
          // reportError(err, { context: 'socket_connection' });
        }
      },

      reconnect: (attemptNumber: number) => {
        transition('connected', `reconnected_after_${attemptNumber}_attempts`);
        setError(null);
        setConnectionQuality('good');
      },

      reconnect_error: (err: Error) => {
        transition('error', 'reconnection_error');
        setError(err.message || 'Reconnection failed');
      },

      reconnect_failed: () => {
        transition('error', 'max_reconnect_attempts_exceeded');
        setError('Failed to reconnect after maximum attempts');
      },
    };

    // Register all event handlers with cleanup tracking
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      newSocket.on(event, handler);
      addCleanup(() => newSocket.off(event, handler));
    });

    setSocket(newSocket);

    return () => {
      // Clean up all resources
      cleanup.forEach(fn => fn());
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (heartbeatIntervalRef.current) {
        clearTimeout(heartbeatIntervalRef.current);
      }
      
      newSocket.close();
      transition('disconnected', 'component_unmount');
    };
  }, [finalConfig, transition]);

  // Connection health monitoring with heartbeat
  useEffect(() => {
    if (!socket || connectionState !== 'connected' || !finalConfig.enableHeartbeat) {
      return;
    }

    const startHeartbeat = () => {
      heartbeatIntervalRef.current = setInterval(() => {
        const startTime = Date.now();
        socket.emit('ping', startTime);
      }, finalConfig.heartbeatInterval);
    };

    // Handle pong responses for latency calculation
    const handlePong = (startTime: number) => {
      const currentLatency = Date.now() - startTime;
      setLatency(currentLatency);
      
      // Update connection quality based on latency
      if (currentLatency < 100) {
        setConnectionQuality('excellent');
      } else if (currentLatency < 300) {
        setConnectionQuality('good');
      } else {
        setConnectionQuality('poor');
      }
    };

    socket.on('pong', handlePong);
    startHeartbeat();

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      socket.off('pong', handlePong);
    };
  }, [socket, connectionState, finalConfig.enableHeartbeat, finalConfig.heartbeatInterval]);

  // Development debugging utilities
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).socketDebug = {
        getConnectionState: () => connectionState,
        getConnectionHistory: () => connectionHistory,
        getLatency: () => latency,
        getConnectionQuality: () => connectionQuality,
        forceReconnect: reconnect,
        simulateError: () => socket?.emit('error', { message: 'Simulated error', code: 'TEST_ERROR' }),
      };
    }

    return () => {
      if (process.env.NODE_ENV === 'development') {
        delete (window as any).socketDebug;
      }
    };
  }, [connectionState, connectionHistory, latency, connectionQuality, reconnect, socket]);

  return {
    socket,
    isConnected: connectionState === 'connected',
    connectionState,
    connectionQuality,
    latency,
    error,
    reconnect,
    getConnectionHistory,
    canTransition,
  };
};

// Test utilities for better testability
export const createMockSocket = (overrides: Partial<Socket<SocketEvents>> = {}): Socket<SocketEvents> => {
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    close: jest.fn(),
    connected: true,
    ...overrides,
  } as unknown as Socket<SocketEvents>;

  return mockSocket;
};

// Export configuration and utilities for testing
export const socketConnectionTestUtils = {
  createMockSocket,
  DEFAULT_CONFIG,
  connectionStateMachine,
  CONNECTION_STATES,
};