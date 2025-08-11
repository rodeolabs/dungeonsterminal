export interface StateTransition<T extends string> {
    from: T;
    to: T;
    timestamp: number;
    reason?: string;
}
export interface UseStateMachineReturn<T extends string> {
    state: T;
    transition: (newState: T, reason?: string) => void;
    history: StateTransition<T>[];
    canTransition: (newState: T) => boolean;
}
/**
 * Custom hook for managing state machines with validation and history tracking
 *
 * @param initialState - The initial state of the state machine
 * @param transitions - Valid transitions mapping from each state to allowed next states
 * @param maxHistorySize - Maximum number of transitions to keep in history (default: 10)
 * @returns State machine interface with current state, transition function, and history
 */
export declare const useStateMachine: <T extends string>(initialState: T, transitions: Record<T, T[]>, maxHistorySize?: number) => UseStateMachineReturn<T>;
/**
 * Utility function to create a state machine configuration
 * Helps with type safety and validation of state machine definitions
 */
export declare const createStateMachine: <T extends string>(states: readonly T[], transitionMap: Record<T, T[]>) => {
    states: readonly T[];
    transitions: Record<T, T[]>;
    initialState: T | undefined;
};
/**
 * Hook for creating a simple toggle state machine (on/off, enabled/disabled, etc.)
 */
export declare const useToggleStateMachine: (initialState?: 'on' | 'off') => {
    toggle: (reason?: string) => void;
    isOn: boolean;
    isOff: boolean;
    state: "on" | "off";
    transition: (newState: "on" | "off", reason?: string) => void;
    history: StateTransition<"on" | "off">[];
    canTransition: (newState: "on" | "off") => boolean;
};
//# sourceMappingURL=useStateMachine.d.ts.map