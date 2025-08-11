// Shared game types between frontend and backend

export interface Character {
  id: string;
  userId: string;
  name: string;
  race: string;
  class: string;
  level: number;
  
  // Core stats
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  
  // Game mechanics
  hitPoints: {
    current: number;
    maximum: number;
    temporary: number;
  };
  
  spellSlots: Record<number, { current: number; maximum: number }>;
  inventory: Item[];
  equipment: Equipment;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'tool' | 'treasure';
  quantity: number;
  weight: number;
  value: number;
  properties?: Record<string, string | number | boolean>;
}

export interface Equipment {
  mainHand?: Item;
  offHand?: Item;
  armor?: Item;
  helmet?: Item;
  boots?: Item;
  gloves?: Item;
  ring1?: Item;
  ring2?: Item;
  necklace?: Item;
}

export interface GameState {
  currentHp: number;
  spellSlots: Record<number, number>;
  inventory: Item[];
  activeEffects: Effect[];
  location: string;
  questLog: Quest[];
}

export interface Effect {
  id: string;
  name: string;
  description: string;
  duration: number;
  type: 'buff' | 'debuff' | 'condition';
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

export interface GameSession {
  sessionId: string;
  playerId: string;
  characterId: string;
  currentLocation: Location;
  gameState: GameState;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  type: 'dungeon' | 'town' | 'wilderness' | 'building';
  exits: string[];
}

export interface PlayerIntent {
  action: GameAction;
  target?: string;
  method?: string;
  context: string;
  confidence: number;
}

export type GameAction = 
  | 'attack' 
  | 'move' 
  | 'examine' 
  | 'talk' 
  | 'cast' 
  | 'use' 
  | 'search' 
  | 'rest' 
  | 'inventory'
  | 'help';

export interface DMResponse {
  narrative: string;
  gameEffects: GameEffect[];
  dashboardUpdates: DashboardUpdate[];
  environmentUpdate?: EnvironmentChange;
  requiresPlayerChoice?: PlayerChoice[];
}

export interface GameEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'move' | 'item';
  target: string;
  value?: number;
  description: string;
}

export interface DashboardUpdate {
  type: 'hitPoints' | 'spellSlots' | 'inventory' | 'conditions' | 'location';
  data: unknown;
  animation?: 'highlight' | 'flash' | 'fade';
}

export interface EnvironmentChange {
  newLocation?: Location;
  weatherChange?: string;
  timeChange?: string;
}

export interface PlayerChoice {
  id: string;
  description: string;
  consequences?: string;
}

export interface NPC {
  id: string;
  name: string;
  description: string;
  personality: string;
  location: string;
  dialogue: DialogueNode[];
}

export interface DialogueNode {
  id: string;
  text: string;
  responses: DialogueResponse[];
}

export interface DialogueResponse {
  id: string;
  text: string;
  nextNodeId?: string;
  action?: GameAction;
}

export interface Campaign {
  id: string;
  dmId: string;
  name: string;
  description: string;
  setting: string;
  
  // Game world
  locations: Location[];
  npcs: NPC[];
  quests: Quest[];
  
  // Session management
  sessions: GameSession[];
  activeSession?: string;
  
  // Configuration
  houseRules: Rule[];
  allowedRaces: string[];
  allowedClasses: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  type: 'house_rule' | 'variant' | 'optional';
}

export interface GameContext {
  character: Character;
  location: Location;
  gameState: GameState;
  recentHistory: string[];
  activeNPCs: NPC[];
}