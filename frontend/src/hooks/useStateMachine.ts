import { useState, useCallback } from 'react';

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
export const useStateMachine = <T extends string>(
  initialState: T,
  transitions: Record<T, T[]>,
  maxHistorySize: number = 10
): UseStateMachineReturn<T> => {
  const [state, setState] = useState<T>(initialState);
  const [history, setHistory] = useState<StateTransition<T>[]>([]);

  const canTransition = useCallback((newState: T): boolean => {
    return transitions[state]?.includes(newState) ?? false;
  }, [state, transitions]);

  const transition = useCallback((newState: T, reason?: string) => {
    setState(currentState => {
      const isValidTransition = transitions[currentState]?.includes(newState) ?? false;
      
      if (!isValidTransition) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `Invalid state transition from ${currentState} to ${newState}`,
            { reason, validTransitions: transitions[currentState] }
          );
        }
        return currentState;
      }

      // Create transition record
      const transitionRecord: StateTransition<T> = {
        from: currentState,
        to: newState,
        timestamp: Date.now(),
        reason,
      };

      // Update history with size limit
      setHistory(prev => {
        const newHistory = [...prev, transitionRecord];
        return newHistory.slice(-maxHistorySize);
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`State transition: ${currentState} → ${newState}`, { reason });
      }

      return newState;
    });
  }, [transitions, maxHistorySize]);

  return {
    state,
    transition,
    history,
    canTransition,
  };
};

/**
 * Utility function to create a state machine configuration
 * Helps with type safety and validation of state machine definitions
 */
export const createStateMachine = <T extends string>(
  states: readonly T[],
  transitionMap: Record<T, T[]>
) => {
  // Validate that all states in transitions are defined
  const definedStates = new Set(states);
  
  for (const [fromState, toStates] of Object.entries(transitionMap)) {
    if (!definedStates.has(fromState as T)) {
      throw new Error(`State '${fromState}' not found in defined states`);
    }
    
    for (const toState of toStates as T[]) {
      if (!definedStates.has(toState)) {
        throw new Error(`Target state '${toState}' not found in defined states`);
      }
    }
  }

  return {
    states,
    transitions: transitionMap,
    initialState: states[0],
  };
};

/**
 * Hook for creating a simple toggle state machine (on/off, enabled/disabled, etc.)
 */
export const useToggleStateMachine = (
  initialState: 'on' | 'off' = 'off'
) => {
  const stateMachine = useStateMachine(
    initialState,
    {
      on: ['off'],
      off: ['on'],
    }
  );

  const toggle = useCallback((reason?: string) => {
    const newState = stateMachine.state === 'on' ? 'off' : 'on';
    stateMachine.transition(newState, reason);
  }, [stateMachine]);

  return {
    ...stateMachine,
    toggle,
    isOn: stateMachine.state === 'on',
    isOff: stateMachine.state === 'off',
  };
};