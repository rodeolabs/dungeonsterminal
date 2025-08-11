# Socket Connection Hooks Documentation

## Overview

This directory contains React hooks for managing WebSocket connections in the AI Dungeon Master application. The hooks provide type-safe, robust connection management with state machine patterns, health monitoring, and comprehensive error handling.

## Hooks

### `useSocketConnection`

A comprehensive hook for managing WebSocket connections with advanced features including:

- **Type-safe socket events** with TypeScript interfaces
- **State machine-based connection management** with validation
- **Connection health monitoring** with latency tracking
- **Automatic reconnection** with configurable retry logic
- **Error handling** with detailed logging and recovery
- **Development debugging utilities** for easier troubleshooting

#### Basic Usage

```typescript
import { useSocketConnection } from '@/hooks/useSocketConnection';

function GameComponent() {
  const { 
    socket, 
    isConnected, 
    connectionState, 
    connectionQuality,
    latency,
    error,
    reconnect 
  } = useSocketConnection();

  useEffect(() => {
    if (!socket) return;

    // Type-safe event handlers
    socket.on('gameStateUpdate', (gameState: GameState) => {
      console.log('Game state updated:', gameState);
    });

    socket.on('narrativeUpdate', (narrative: string) => {
      console.log('New narrative:', narrative);
    });

    return () => {
      socket.off('gameStateUpdate');
      socket.off('narrativeUpdate');
    };
  }, [socket]);

  if (!isConnected) {
    return (
      <div>
        <p>Connection Status: {connectionState}</p>
        {error && <p>Error: {error}</p>}
        <button onClick={reconnect}>Reconnect</button>
      </div>
    );
  }

  return (
    <div>
      <p>Connected! Quality: {connectionQuality}</p>
      {latency && <p>Latency: {latency}ms</p>}
      {/* Your game UI here */}
    </div>
  );
}
```

#### Advanced Configuration

```typescript
const { socket, isConnected } = useSocketConnection({
  serverUrl: 'wss://my-game-server.com',
  reconnectAttempts: 5,
  reconnectDelay: 2000,
  timeout: 30000,
  enableHeartbeat: true,
  heartbeatInterval: 15000,
});
```

#### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `serverUrl` | string | `process.env.REACT_APP_SERVER_URL \|\| 'http://localhost:3001'` | WebSocket server URL |
| `reconnectAttempts` | number | `3` | Maximum reconnection attempts |
| `reconnectDelay` | number | `1000` | Delay between reconnection attempts (ms) |
| `timeout` | number | `20000` | Connection timeout (ms) |
| `enableHeartbeat` | boolean | `true` | Enable connection health monitoring |
| `heartbeatInterval` | number | `30000` | Heartbeat ping interval (ms) |

#### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `socket` | `Socket<SocketEvents> \| null` | Type-safe socket instance |
| `isConnected` | boolean | Whether socket is connected |
| `connectionState` | `ConnectionState` | Current connection state |
| `connectionQuality` | `ConnectionQuality` | Connection quality based on latency |
| `latency` | `number \| null` | Current connection latency in ms |
| `error` | `string \| null` | Current error message |
| `reconnect` | `() => void` | Manual reconnection function |
| `getConnectionHistory` | `() => StateTransition[]` | Get connection state history |
| `canTransition` | `(state: ConnectionState) => boolean` | Check if state transition is valid |

#### Socket Events

The hook provides type-safe socket events:

```typescript
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
```

### `useStateMachine`

A reusable hook for managing state machines with validation and history tracking.

#### Basic Usage

```typescript
import { useStateMachine, createStateMachine } from '@/hooks/useStateMachine';

const gameStateMachine = createStateMachine(
  ['idle', 'playing', 'paused', 'ended'] as const,
  {
    idle: ['playing'],
    playing: ['paused', 'ended'],
    paused: ['playing', 'ended'],
    ended: ['idle'],
  }
);

function GameStateManager() {
  const { state, transition, history, canTransition } = useStateMachine(
    gameStateMachine.initialState,
    gameStateMachine.transitions
  );

  const startGame = () => transition('playing', 'user_started_game');
  const pauseGame = () => transition('paused', 'user_paused_game');
  const endGame = () => transition('ended', 'game_completed');

  return (
    <div>
      <p>Game State: {state}</p>
      <button onClick={startGame} disabled={!canTransition('playing')}>
        Start Game
      </button>
      <button onClick={pauseGame} disabled={!canTransition('paused')}>
        Pause Game
      </button>
      <button onClick={endGame} disabled={!canTransition('ended')}>
        End Game
      </button>
    </div>
  );
}
```

#### Toggle State Machine

For simple on/off states:

```typescript
import { useToggleStateMachine } from '@/hooks/useStateMachine';

function ToggleComponent() {
  const { state, toggle, isOn, isOff } = useToggleStateMachine('off');

  return (
    <button onClick={() => toggle('user_clicked')}>
      {isOn ? 'Turn Off' : 'Turn On'}
    </button>
  );
}
```

## Connection States

The socket connection uses a state machine with the following states:

- **`disconnected`** - Not connected to server
- **`connecting`** - Attempting to establish connection
- **`connected`** - Successfully connected and ready
- **`reconnecting`** - Attempting to reconnect after disconnection
- **`error`** - Connection failed or encountered error

### State Transitions

```
disconnected → connecting
connecting → connected | error
connected → disconnected | reconnecting
reconnecting → connected | error | disconnected
error → connecting | disconnected
```

## Connection Quality

Connection quality is determined by latency:

- **`excellent`** - < 100ms latency
- **`good`** - 100-300ms latency  
- **`poor`** - > 300ms latency
- **`unknown`** - No latency data available

## Development Debugging

In development mode, debugging utilities are available on `window.socketDebug`:

```javascript
// Check current connection state
window.socketDebug.getConnectionState()

// View connection history
window.socketDebug.getConnectionHistory()

// Check current latency
window.socketDebug.getLatency()

// Force reconnection
window.socketDebug.forceReconnect()

// Simulate error for testing
window.socketDebug.simulateError()
```

## Testing

The hooks include comprehensive test utilities:

```typescript
import { createMockSocket, socketConnectionTestUtils } from '@/hooks/useSocketConnection';

// Create mock socket for testing
const mockSocket = createMockSocket({
  connected: true,
  emit: jest.fn(),
});

// Access test utilities
const { DEFAULT_CONFIG, connectionStateMachine } = socketConnectionTestUtils;
```

## Error Handling

The hooks implement comprehensive error handling:

1. **Connection Errors** - Logged with context and timestamp
2. **Reconnection Failures** - Automatic retry with exponential backoff
3. **State Transition Errors** - Validation prevents invalid transitions
4. **Memory Leaks** - Automatic cleanup of event listeners and timers

## Best Practices

1. **Always handle the disconnected state** in your UI
2. **Use the `isConnected` boolean** for conditional rendering
3. **Implement error boundaries** for connection failures
4. **Monitor connection quality** for user experience optimization
5. **Use type-safe event handlers** to prevent runtime errors
6. **Clean up event listeners** in useEffect cleanup functions

## Performance Considerations

- **Event listener cleanup** prevents memory leaks
- **Debounced state transitions** prevent excessive re-renders
- **Connection history limiting** keeps memory usage bounded
- **Conditional heartbeat** can be disabled to reduce network traffic
- **Development utilities** are automatically removed in production builds

## Integration with AI Dungeon Master

The socket connection hooks are designed specifically for the AI Dungeon Master application:

- **Game state synchronization** across multiple players
- **Real-time narrative updates** from the AI DM
- **Dice roll broadcasting** for shared game experience
- **Character sheet updates** with conflict resolution
- **Session management** with join/leave notifications

This robust connection system ensures a smooth, real-time multiplayer RPG experience with comprehensive error handling and monitoring capabilities.