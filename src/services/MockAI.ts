import { GameContext, NarrativeEntry } from '../types/GameSession';

/**
 * Mock AI service for placeholder DM responses
 * This will be replaced with real AI integration in Phase 2
 */
export class MockAI {
  private responses: Record<string, string[]> = {
    greeting: [
      "Welcome, brave adventurer! You find yourself at the entrance of a mysterious tavern called 'The Prancing Pony'. The wooden sign creaks in the evening breeze.",
      "Greetings, traveler! You stand before the gates of the ancient city of Waterdeep. Guards in shining armor watch your approach with curious eyes.",
      "Hello, hero! You awaken in a dimly lit dungeon cell. The sound of dripping water echoes through the stone corridors."
    ],
    
    look: [
      "You scan your surroundings carefully. The room is dimly lit by flickering torchlight, casting dancing shadows on the stone walls.",
      "Your keen eyes notice several interesting details about this place. Ancient runes are carved into the walls, and you sense magic in the air.",
      "Looking around, you see multiple paths ahead. Each seems to lead to different adventures and challenges."
    ],
    
    move: [
      "You move forward cautiously, your footsteps echoing in the silence. The path ahead seems both promising and perilous.",
      "With determination, you advance deeper into the unknown. The air grows thicker with mystery and anticipation.",
      "You take a step forward, and the world around you shifts slightly. New possibilities emerge before you."
    ],
    
    attack: [
      "You draw your weapon and prepare for battle! Roll for initiative as danger approaches.",
      "Your combat instincts kick in. The enemy before you looks formidable, but you're ready for the challenge.",
      "Steel rings against steel as combat begins! Your training will be put to the test."
    ],
    
    talk: [
      "The NPC looks at you with interest, ready to share information or perhaps offer a quest.",
      "A conversation begins. The character before you seems to have stories to tell and wisdom to share.",
      "Words are exchanged, and you sense this interaction might lead to important developments in your adventure."
    ],
    
    default: [
      "Your action resonates through the world around you. The consequences of your choice begin to unfold.",
      "The DM considers your creative approach. Sometimes the most unexpected actions lead to the greatest adventures.",
      "Interesting choice! The world responds to your unique perspective in ways you didn't anticipate."
    ]
  };

  /**
   * Generate a mock AI response based on player input
   */
  async generateResponse(input: string, context: GameContext): Promise<string> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    const action = this.interpretAction(input);
    const responses = this.responses[action] || this.responses.default;
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    // Add context-aware elements
    return this.enhanceResponse(response, context);
  }

  /**
   * Interpret player action from input text
   */
  private interpretAction(input: string): string {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('look') || lowerInput.includes('examine') || lowerInput.includes('search')) {
      return 'look';
    }
    
    if (lowerInput.includes('move') || lowerInput.includes('go') || lowerInput.includes('walk') || lowerInput.includes('enter')) {
      return 'move';
    }
    
    if (lowerInput.includes('attack') || lowerInput.includes('fight') || lowerInput.includes('combat') || lowerInput.includes('hit')) {
      return 'attack';
    }
    
    if (lowerInput.includes('talk') || lowerInput.includes('speak') || lowerInput.includes('say') || lowerInput.includes('ask')) {
      return 'talk';
    }
    
    if (lowerInput.includes('hello') || lowerInput.includes('start') || lowerInput.includes('begin')) {
      return 'greeting';
    }
    
    return 'default';
  }

  /**
   * Enhance response with context-aware details
   */
  private enhanceResponse(response: string, context: GameContext): string {
    const character = context.session.character;
    const location = context.session.currentLocation;
    
    // Add character-specific details
    if (character.name && Math.random() > 0.7) {
      response += ` Your character ${character.name} feels confident in this situation.`;
    }
    
    // Add location context
    if (location && Math.random() > 0.8) {
      response += ` The atmosphere of ${location} influences your next decision.`;
    }
    
    return response;
  }

  /**
   * Generate a narrative entry for the session history
   */
  createNarrativeEntry(content: string): NarrativeEntry {
    return {
      id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'dm_response',
      content,
      metadata: {
        source: 'mock_ai',
        version: '1.0.0'
      }
    };
  }
}