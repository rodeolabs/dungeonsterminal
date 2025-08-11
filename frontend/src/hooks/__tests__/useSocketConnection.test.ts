import { renderHook, act } from '@testing-library/react';
import { io } from 'socket.io-client';
import { useSocketConnection, createMockSocket, socketConnectionTestUtils } from '../useSocketConnection';

// Mock socket.io-client
jest.mock('socket.io-client');
const mockIo = io as jest.MockedFunction<typeof io>;

describe('useSocketConnection', () => {
  let mockSocket: ReturnType<typeof createMockSocket>;

  beforeEach(() => {
    mockSocket = createMockSocket();
    mockIo.mockReturnValue(mockSocket);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('initialization', () => {
    it('should initialize with disconnected state', () => {
      const { result } = renderHook(() => useSocketConnection());

      expect(result.current.isConnected).toBe(false);
      expect(result.current.connectionState).toBe('disconnected');
      expect(result.current.connectionQuality).toBe('unknown');
      expect(result.current.latency).toBe(null);
      expect(result.current.error).toBe(null);
    });

    it('should create socket with default configuration', () => {
      renderHook(() => useSocketConnection());

      expect(mockIo).toHaveBeenCalledWith(
        socketConnectionTestUtils.DEFAULT_CONFIG.serverUrl,
        expect.objectContaining({
          reconnectionAttempts: socketConnectionTestUtils.DEFAULT_CONFIG.reconnectAttempts,
          reconnectionDelay: socketConnectionTestUtils.DEFAULT_CONFIG.reconnectDelay,
          timeout: socketConnectionTestUtils.DEFAULT_CONFIG.timeout,
        })
      );
    });

    it('should create socket with custom configuration', () => {
      const customConfig = {
        serverUrl: 'http://custom-server:3000',
        reconnectAttempts: 5,
        timeout: 30000,
      };

      renderHook(() => useSocketConnection(customConfig));

      expect(mockIo).toHaveBeenCalledWith(
        customConfig.serverUrl,
        expect.objectContaining({
          reconnectionAttempts: customConfig.reconnectAttempts,
          timeout: customConfig.timeout,
        })
      );
    });
  });

  describe('connection state management', () => {
    it('should transition to connected state on connect event', () => {
      const { result } = renderHook(() => useSocketConnection());

      act(() => {
        const connectHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'connect'
        )?.[1];
        connectHandler?.();
      });

      expect(result.current.isConnected).toBe(true);
      expect(result.current.connectionState).toBe('connected');
      expect(result.current.error).toBe(null);
    });

    it('should handle disconnect events correctly', () => {
      const { result } = renderHook(() => useSocketConnection());

      // First connect
      act(() => {
        const connectHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'connect'
        )?.[1];
        connectHandler?.();
      });

      // Then disconnect
      act(() => {
        const disconnectHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'disconnect'
        )?.[1];
        disconnectHandler?.('transport close');
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.connectionState).toBe('reconnecting');
    });

    it('should handle server-initiated disconnect', () => {
      const { result } = renderHook(() => useSocketConnection());

      act(() => {
        const disconnectHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'disconnect'
        )?.[1];
        disconnectHandler?.('io server disconnect');
      });

      expect(result.current.connectionState).toBe('disconnected');
    });

    it('should handle connection errors', () => {
      const { result } = renderHook(() => useSocketConnection());
      const testError = new Error('Connection failed');

      act(() => {
        const errorHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'connect_error'
        )?.[1];
        errorHandler?.(testError);
      });

      expect(result.current.connectionState).toBe('error');
      expect(result.current.error).toBe('Connection failed');
      expect(result.current.isConnected).toBe(false);
    });
  });

  describe('connection quality monitoring', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should monitor connection quality with heartbeat', () => {
      const { result } = renderHook(() => 
        useSocketConnection({ enableHeartbeat: true, heartbeatInterval: 1000 })
      );

      // Connect first
      act(() => {
        const connectHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'connect'
        )?.[1];
        connectHandler?.();
      });

      // Fast forward to trigger heartbeat
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('ping', expect.any(Number));
    });

    it('should calculate latency and update connection quality', () => {
      const { result } = renderHook(() => useSocketConnection());

      // Connect first
      act(() => {
        const connectHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'connect'
        )?.[1];
        connectHandler?.();
      });

      // Simulate pong response with low latency
      const startTime = Date.now() - 50; // 50ms latency
      act(() => {
        const pongHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'pong'
        )?.[1];
        pongHandler?.(startTime);
      });

      expect(result.current.latency).toBeLessThan(100);
      expect(result.current.connectionQuality).toBe('excellent');
    });

    it('should update connection quality based on latency', () => {
      const { result } = renderHook(() => useSocketConnection());

      // Connect first
      act(() => {
        const connectHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'connect'
        )?.[1];
        connectHandler?.();
      });

      // Simulate high latency pong response
      const startTime = Date.now() - 400; // 400ms latency
      act(() => {
        const pongHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'pong'
        )?.[1];
        pongHandler?.(startTime);
      });

      expect(result.current.connectionQuality).toBe('poor');
    });
  });

  describe('reconnection functionality', () => {
    it('should provide manual reconnect function', () => {
      const { result } = renderHook(() => useSocketConnection());

      act(() => {
        result.current.reconnect();
      });

      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(result.current.connectionState).toBe('connecting');
      expect(result.current.error).toBe(null);
    });

    it('should handle reconnection success', () => {
      const { result } = renderHook(() => useSocketConnection());

      act(() => {
        const reconnectHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'reconnect'
        )?.[1];
        reconnectHandler?.(2); // Reconnected after 2 attempts
      });

      expect(result.current.connectionState).toBe('connected');
      expect(result.current.error).toBe(null);
    });

    it('should handle reconnection failure', () => {
      const { result } = renderHook(() => useSocketConnection());

      act(() => {
        const reconnectFailedHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'reconnect_failed'
        )?.[1];
        reconnectFailedHandler?.();
      });

      expect(result.current.connectionState).toBe('error');
      expect(result.current.error).toBe('Failed to reconnect after maximum attempts');
    });
  });

  describe('connection history tracking', () => {
    it('should track connection state transitions', () => {
      const { result } = renderHook(() => useSocketConnection());

      // Initial state should have no history
      expect(result.current.getConnectionHistory()).toHaveLength(0);

      // Connect
      act(() => {
        const connectHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'connect'
        )?.[1];
        connectHandler?.();
      });

      const history = result.current.getConnectionHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        from: 'connecting',
        to: 'connected',
        reason: 'server_connected',
      });
    });

    it('should limit history to last 10 transitions', () => {
      const { result } = renderHook(() => useSocketConnection());

      // Simulate many state transitions
      act(() => {
        for (let i = 0; i < 15; i++) {
          const connectHandler = mockSocket.on.mock.calls.find(
            call => call[0] === 'connect'
          )?.[1];
          const disconnectHandler = mockSocket.on.mock.calls.find(
            call => call[0] === 'disconnect'
          )?.[1];
          
          connectHandler?.();
          disconnectHandler?.('transport close');
        }
      });

      const history = result.current.getConnectionHistory();
      expect(history).toHaveLength(10); // Should be limited to 10
    });
  });

  describe('cleanup', () => {
    it('should clean up resources on unmount', () => {
      const { unmount } = renderHook(() => useSocketConnection());

      unmount();

      expect(mockSocket.close).toHaveBeenCalled();
    });

    it('should remove event listeners on unmount', () => {
      const { unmount } = renderHook(() => useSocketConnection());

      unmount();

      // Verify that off was called for each event that was registered
      const onCalls = mockSocket.on.mock.calls;
      const offCalls = mockSocket.off.mock.calls;
      
      expect(offCalls.length).toBeGreaterThan(0);
      expect(offCalls.length).toBe(onCalls.length);
    });
  });

  describe('development utilities', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
      delete (window as any).socketDebug;
    });

    it('should expose debug utilities in development', () => {
      renderHook(() => useSocketConnection());

      expect((window as any).socketDebug).toBeDefined();
      expect((window as any).socketDebug.getConnectionState).toBeInstanceOf(Function);
      expect((window as any).socketDebug.forceReconnect).toBeInstanceOf(Function);
    });

    it('should not expose debug utilities in production', () => {
      process.env.NODE_ENV = 'production';
      renderHook(() => useSocketConnection());

      expect((window as any).socketDebug).toBeUndefined();
    });
  });
});