import { Socket } from 'socket.io-client';
import { GameState, Character } from '@/types/game';
import { useStateMachine } from './useStateMachine';
interface SocketEvents {
    gameStateUpdate: (gameState: GameState) => void;
    characterUpdate: (character: Character) => void;
    narrativeUpdate: (narrative: string) => void;
    diceRoll: (result: {
        dice: string;
        result: number;
        modifier?: number;
    }) => void;
    ping: (timestamp: number) => void;
    pong: (timestamp: number) => void;
    error: (error: {
        message: string;
        code?: string;
    }) => void;
    sessionStart: (sessionId: string) => void;
    sessionEnd: (sessionId: string) => void;
    playerJoin: (playerId: string) => void;
    playerLeave: (playerId: string) => void;
}
interface SocketConfig {
    serverUrl: string;
    reconnectAttempts: number;
    reconnectDelay: number;
    timeout: number;
    enableHeartbeat: boolean;
    heartbeatInterval: number;
}
declare const CONNECTION_STATES: readonly ["disconnected", "connecting", "connected", "reconnecting", "error"];
type ConnectionState = typeof CONNECTION_STATES[number];
type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'unknown';
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
export declare const useSocketConnection: (config?: Partial<SocketConfig>) => UseSocketConnectionReturn;
export declare const createMockSocket: (overrides?: Partial<Socket<SocketEvents>>) => Socket<SocketEvents>;
export declare const socketConnectionTestUtils: {
    createMockSocket: (overrides?: Partial<Socket<SocketEvents>>) => Socket<SocketEvents>;
    DEFAULT_CONFIG: SocketConfig;
    connectionStateMachine: {
        states: readonly ("error" | "connected" | "disconnected" | "connecting" | "reconnecting")[];
        transitions: Record<"error" | "connected" | "disconnected" | "connecting" | "reconnecting", ("error" | "connected" | "disconnected" | "connecting" | "reconnecting")[]>;
        initialState: "error" | "connected" | "disconnected" | "connecting" | "reconnecting" | undefined;
    };
    CONNECTION_STATES: readonly ["disconnected", "connecting", "connected", "reconnecting", "error"];
};
export {};
//# sourceMappingURL=useSocketConnection.d.ts.map