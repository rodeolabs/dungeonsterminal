import express from 'express';
import type { GameSession, GameState } from '../types/game.js';

const router = express.Router();

// In-memory storage for demo (replace with database in production)
const sessions: Map<string, GameSession> = new Map();

// GET /api/sessions - List all sessions for a user
router.get('/', (_req, res) => {
  // In production, filter by user ID from authentication
  const userSessions = Array.from(sessions.values());
  return res.json(userSessions);
});

// GET /api/sessions/:id - Get specific session
router.get('/:id', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  return res.json(session);
});

// POST /api/sessions - Create new session
router.post('/', (req, res) => {
  try {
    const { characterId, gameState } = req.body;
    
    if (!characterId) {
      return res.status(400).json({ error: 'Character ID is required' });
    }
    
    const session: GameSession = {
      sessionId: Date.now().toString(),
      playerId: 'demo-user', // In production, get from authentication
      characterId,
      currentLocation: {
        id: 'starting-area',
        name: 'Starting Area',
        description: 'You find yourself in a dimly lit tavern. The air is thick with the smell of ale and adventure.',
        type: 'building',
        exits: ['north', 'east'],
      },
      gameState: gameState || {
        currentHp: 0,
        spellSlots: {},
        inventory: [],
        activeEffects: [],
        location: 'Starting Area',
        questLog: [],
      },
    };
    
    sessions.set(session.sessionId, session);
    
    return res.status(201).json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    return res.status(400).json({ error: 'Invalid session data' });
  }
});

// PUT /api/sessions/:id - Update session
router.put('/:id', (req, res) => {
  try {
    const session = sessions.get(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const updatedSession: GameSession = {
      ...session,
      ...req.body,
      sessionId: session.sessionId, // Prevent ID changes
      playerId: session.playerId, // Prevent player ID changes
    };
    
    sessions.set(session.sessionId, updatedSession);
    
    return res.json(updatedSession);
  } catch (error) {
    console.error('Error updating session:', error);
    return res.status(400).json({ error: 'Invalid session data' });
  }
});

// DELETE /api/sessions/:id - Delete session
router.delete('/:id', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  sessions.delete(req.params.id);
  return res.status(204).send();
});

// POST /api/sessions/:id/actions - Process player action
router.post('/:id/actions', async (req, res) => {
  try {
    const session = sessions.get(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const { action, target, method, context } = req.body;
    
    // Mock AI DM response (replace with actual AI integration)
    const response = await processPlayerAction(session, { action, target, method, context });
    
    // Update session with any game state changes
    if (response.gameEffects && response.gameEffects.length > 0) {
      const updatedGameState = applyGameEffects(session.gameState, response.gameEffects);
      session.gameState = updatedGameState;
      sessions.set(session.sessionId, session);
    }
    
    return res.json(response);
  } catch (error) {
    console.error('Error processing action:', error);
    return res.status(500).json({ error: 'Failed to process action' });
  }
});

// Mock AI DM response function (replace with actual AI integration)
async function processPlayerAction(session: GameSession, intent: any) {
  const { action, target } = intent;
  
  // Simple mock responses based on action type
  const responses = {
    examine: `You carefully examine ${target || 'your surroundings'}. ${generateDescription()}`,
    attack: `You attack ${target || 'the air'} with determination! Roll for initiative!`,
    move: `You move ${target || 'forward'}, your footsteps echoing in the ${session.currentLocation.type}.`,
    talk: `You speak ${target ? `to ${target}` : 'aloud'}, your voice carrying through the area.`,
    cast: `You begin casting ${target || 'a spell'}, magical energy swirling around you.`,
    use: `You use ${target || 'an item'} from your inventory.`,
    search: `You search ${target || 'the area'} thoroughly, looking for anything of interest.`,
    rest: `You take a moment to rest and recover your strength.`,
    help: `Available actions: examine, attack, move, talk, cast, use, search, rest, inventory`,
  };
  
  const narrative = responses[action as keyof typeof responses] || 
    `You attempt to ${action}${target ? ` ${target}` : ''}. The world responds to your actions.`;
  
  return {
    narrative,
    gameEffects: [],
    dashboardUpdates: [],
    environmentUpdate: null,
    requiresPlayerChoice: null,
  };
}

function generateDescription(): string {
  const descriptions = [
    "The shadows dance in the flickering candlelight.",
    "You notice intricate details carved into the wooden beams.",
    "The atmosphere is thick with mystery and possibility.",
    "Ancient symbols are etched into the stone walls.",
    "You sense that this place holds many secrets.",
  ];
  
  const index = Math.floor(Math.random() * descriptions.length);
  return descriptions[index] || "A mysterious atmosphere surrounds you.";
}

function applyGameEffects(gameState: GameState, effects: any[]): GameState {
  let updatedState = { ...gameState };
  
  effects.forEach(effect => {
    switch (effect.type) {
      case 'damage':
        if (effect.target === 'player' && effect.value) {
          updatedState.currentHp = Math.max(0, updatedState.currentHp - effect.value);
        }
        break;
      case 'heal':
        if (effect.target === 'player' && effect.value) {
          updatedState.currentHp += effect.value;
        }
        break;
      case 'move':
        updatedState.location = effect.description;
        break;
      // Add more effect types as needed
    }
  });
  
  return updatedState;
}

export default router;