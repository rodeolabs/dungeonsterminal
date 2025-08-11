import { useCallback } from 'react';
import { PlayerIntent, GameContext, GameAction } from '@/types/game';

// Natural language processing patterns for D&D actions
const ACTION_PATTERNS: Record<GameAction, RegExp[]> = {
  attack: [
    /\b(attack|hit|strike|fight|stab|slash|shoot)\b/i,
    /\b(swing|thrust|fire)\s+(?:at|on)\b/i,
  ],
  move: [
    /\b(go|move|walk|run|travel|head)\s+(?:to|towards?|north|south|east|west|up|down)\b/i,
    /\b(enter|exit|leave|approach)\b/i,
  ],
  examine: [
    /\b(look|examine|inspect|check|search|investigate)\b/i,
    /\b(what\s+(?:is|are)|tell\s+me\s+about)\b/i,
  ],
  talk: [
    /\b(talk|speak|say|tell|ask|greet)\b/i,
    /\b(hello|hi|hey)\b/i,
  ],
  cast: [
    /\b(cast|use\s+spell|magic|enchant)\b/i,
    /\b(fireball|heal|shield|magic\s+missile)\b/i,
  ],
  use: [
    /\b(use|activate|drink|eat|consume|apply)\b/i,
    /\b(potion|item|tool|equipment)\b/i,
  ],
  search: [
    /\b(search|find|locate|discover)\b/i,
    /\b(hidden|secret|treasure|trap)\b/i,
  ],
  rest: [
    /\b(rest|sleep|camp|recover|heal)\b/i,
    /\b(short\s+rest|long\s+rest)\b/i,
  ],
  inventory: [
    /\b(inventory|items|gear|equipment|bag|pack)\b/i,
    /\b(what\s+(?:do\s+)?i\s+have)\b/i,
  ],
  help: [
    /\b(help|commands|what\s+can\s+i\s+do)\b/i,
    /\b(how\s+(?:do\s+)?i|instructions)\b/i,
  ],
};

// Entity extraction patterns
const ENTITY_PATTERNS = {
  target: /(?:the\s+)?(\w+)(?:\s+(?:with|using))?/i,
  method: /(?:with|using)\s+(?:my\s+)?(\w+)/i,
  direction: /\b(north|south|east|west|up|down|left|right|forward|back)\b/i,
  spell: /\b(fireball|heal|shield|magic\s+missile|cure\s+wounds|detect\s+magic)\b/i,
  item: /\b(sword|bow|potion|scroll|dagger|staff|wand)\b/i,
};

export const useNaturalLanguageProcessor = () => {
  const processNaturalLanguage = useCallback(async (
    input: string, 
    context?: GameContext
  ): Promise<PlayerIntent> => {
    // Input validation
    if (!input || typeof input !== 'string') {
      return {
        action: 'help',
        context: '',
        confidence: 0.1
      };
    }

    const normalizedInput = input.toLowerCase().trim();
    
    // Handle empty input
    if (normalizedInput.length === 0) {
      return {
        action: 'help',
        context: normalizedInput,
        confidence: 0.1
      };
    }
    
    // Determine the primary action
    let detectedAction: GameAction = 'examine'; // default action
    let confidence = 0;

    for (const [action, patterns] of Object.entries(ACTION_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(normalizedInput)) {
          detectedAction = action as GameAction;
          confidence = Math.max(confidence, 0.8);
          break;
        }
      }
      if (confidence > 0) break;
    }

    // Extract entities
    const entities = extractEntities(normalizedInput);
    
    // Adjust confidence based on context and entity extraction
    if (entities.target && confidence > 0) {
      confidence = Math.min(confidence + 0.1, 1.0);
    }

    // Handle ambiguous cases
    if (confidence < 0.5) {
      confidence = 0.3;
      // Try to infer from context
      if (context?.activeNPCs && context.activeNPCs.length > 0) {
        detectedAction = 'talk';
        confidence = 0.6;
      }
    }

    return {
      action: detectedAction,
      target: entities.target,
      method: entities.method,
      context: normalizedInput,
      confidence,
    };
  }, []);

  const extractEntities = (input: string): Record<string, string | undefined> => {
    const entities: Record<string, string | undefined> = {};

    for (const [entityType, pattern] of Object.entries(ENTITY_PATTERNS)) {
      const match = input.match(pattern);
      if (match) {
        entities[entityType] = match[1];
      }
    }

    return entities;
  };

  const validateActionFeasibility = useCallback((
    intent: PlayerIntent,
    context?: GameContext
  ): { valid: boolean; reason?: string } => {
    // Basic validation rules
    if (intent.action === 'cast' && context?.character) {
      const hasSpellSlots = Object.values(context.character.spellSlots || {})
        .some(slots => slots.current > 0);
      
      if (!hasSpellSlots) {
        return {
          valid: false,
          reason: "You don't have any spell slots remaining.",
        };
      }
    }

    if (intent.action === 'attack' && !intent.target) {
      return {
        valid: false,
        reason: "You need to specify what you want to attack.",
      };
    }

    if (intent.action === 'use' && !intent.target) {
      return {
        valid: false,
        reason: "You need to specify what item you want to use.",
      };
    }

    return { valid: true };
  }, []);

  const getSuggestions = useCallback((
    input: string,
    context?: GameContext
  ): string[] => {
    const suggestions: string[] = [];
    const normalizedInput = input.toLowerCase();

    // Suggest based on partial input
    if (normalizedInput.includes('attack') && !normalizedInput.includes(' the ')) {
      suggestions.push('attack the goblin', 'attack with my sword');
    }

    if (normalizedInput.includes('look') && normalizedInput.length < 10) {
      suggestions.push('look around', 'look at the door', 'look for traps');
    }

    if (normalizedInput.includes('go') && normalizedInput.length < 8) {
      suggestions.push('go north', 'go to the tavern', 'go upstairs');
    }

    // Context-based suggestions
    if (context?.activeNPCs && context.activeNPCs.length > 0) {
      const npc = context.activeNPCs[0];
      suggestions.push(`talk to ${npc.name}`, `ask ${npc.name} about the quest`);
    }

    if (context?.location?.exits && context.location.exits.length > 0) {
      context.location.exits.forEach(exit => {
        suggestions.push(`go ${exit}`);
      });
    }

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }, []);

  return {
    processNaturalLanguage,
    validateActionFeasibility,
    getSuggestions,
    extractEntities,
  };
};