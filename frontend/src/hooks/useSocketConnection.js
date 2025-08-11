import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, Character } from '@/types/game';
import { useStateMachine, createStateMachine } from './useStateMachine';
const DEFAULT_CONFIG = {
    serverUrl: process.env.REACT_APP_SERVER_URL || 'http://localhost:3001',
    reconnectAttempts: 3,
    reconnectDelay: 1000,
    timeout: 20000,
    enableHeartbeat: true,
    heartbeatInterval: 30000,
};
// Connection state machine configuration
const CONNECTION_STATES = ['disconnected', 'connecting', 'connected', 'reconnecting', 'error'];
const connectionStateMachine = createStateMachine(CONNECTION_STATES, {
    disconnected: ['connecting'],
    connecting: ['connected', 'error'],
    connected: ['disconnected', 'reconnecting'],
    reconnecting: ['connected', 'error', 'disconnected'],
    error: ['connecting', 'disconnected'],
});
export const useSocketConnection = (config = {}) => {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const [socket, setSocket] = useState(null);
    const [connectionQuality, setConnectionQuality] = useState('unknown');
    const [latency, setLatency] = useState(null);
    const [error, setError] = useState(null);
    const reconnectTimeoutRef = useRef();
    const heartbeatIntervalRef = useRef();
    // Use the state machine hook for connection state management
    const { state: connectionState, transition, history: connectionHistory, canTransition } = useStateMachine(connectionStateMachine.initialState, connectionStateMachine.transitions);
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
        const cleanup = [];
        const addCleanup = (fn) => cleanup.push(fn);
        // Connection event handlers with enhanced error handling
        const eventHandlers = {
            connect: () => {
                transition('connected', 'server_connected');
                setError(null);
                setConnectionQuality('good'); // Initial quality assumption
            },
            disconnect: (reason) => {
                const newState = reason === 'io server disconnect' ? 'disconnected' : 'reconnecting';
                transition(newState, `disconnect_reason: ${reason}`);
                setConnectionQuality('unknown');
                setLatency(null);
            },
            connect_error: (err) => {
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
            reconnect: (attemptNumber) => {
                transition('connected', `reconnected_after_${attemptNumber}_attempts`);
                setError(null);
                setConnectionQuality('good');
            },
            reconnect_error: (err) => {
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
        const handlePong = (startTime) => {
            const currentLatency = Date.now() - startTime;
            setLatency(currentLatency);
            // Update connection quality based on latency
            if (currentLatency < 100) {
                setConnectionQuality('excellent');
            }
            else if (currentLatency < 300) {
                setConnectionQuality('good');
            }
            else {
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
            window.socketDebug = {
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
                delete window.socketDebug;
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
export const createMockSocket = (overrides = {}) => {
    const mockSocket = {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn(),
        close: jest.fn(),
        connected: true,
        ...overrides,
    };
    return mockSocket;
};
// Export configuration and utilities for testing
export const socketConnectionTestUtils = {
    createMockSocket,
    DEFAULT_CONFIG,
    connectionStateMachine,
    CONNECTION_STATES,
};
//# sourceMappingURL=useSocketConnection.js.map