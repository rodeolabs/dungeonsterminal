import { Character } from './Character';

/**
 * Game session state management
 */
export interface GameSession {
  id: string;
  characterId: string;
  character: Character;
  
  // Session state
  currentLocation: string;
  gameState: GameState;
  
  // Command history
  commandHistory: string[];
  narrativeHistory: NarrativeEntry[];
  
  // Session metadata
  createdAt: Date;
  lastUpdated: Date;
  isActive: boolean;
}

export interface GameState {
  // Current game context
  currentScene: string;
  availableActions: string[];
  
  // Game flags and variables
  flags: Record<string, boolean>;
  variables: Record<string, any>;
  
  // Quest and story tracking
  activeQuests: Quest[];
  completedQuests: Quest[];
}

export interface NarrativeEntry {
  id: string;
  timestamp: Date;
  type: 'player_action' | 'dm_response' | 'system_message';
  content: string;
  metadata?: Record<string, any>;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed';
  objectives: QuestObjective[];
}

export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
}

export interface GameContext {
  session: GameSession;
  lastPlayerAction: string;
  relevantHistory: NarrativeEntry[];
}