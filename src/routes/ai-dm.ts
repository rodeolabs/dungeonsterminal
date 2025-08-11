// AI Dungeon Master API Routes
// Backend routes for handling AI DM requests

import express from 'express';
import type { Request, Response } from 'express';
import type { PlayerIntent, Character, GameState, GameContext, DMResponse } from '../types/game';
import { AIDungeonMaster } from '../services/AIDungeonMaster';

const router = express.Router();

// Initialize AI DM service
const aiDM = new AIDungeonMaster();

interface ProcessActionRequest {
  intent: PlayerIntent;
  character: Character;
  gameState: GameState;
  context?: GameContext;
}

interface StartSessionRequest {
  character: Character;
  gameState: GameState;
}

/**
 * Process a player action and get AI DM response
 */
router.post('/process-action', async (req: Request<{}, DMResponse, ProcessActionRequest>, res: Response<DMResponse>) => {
  try {
    const { intent, character, gameState, context } = req.body;

    // Validate required fields
    if (!intent || !character || !gameState) {
      return res.status(400).json({
        narrative: "The cosmic forces are confused by your request... *reality flickers* Please provide complete information about your action, character, and current game state.",
        gameEffects: [],
        dashboardUpdates: [],
        error: 'Missing required fields: intent, character, or gameState',
      });
    }

    // Process the action through AI DM
    const response = await aiDM.processPlayerAction(intent, character, gameState, context);

    res.json(response);
  } catch (error) {
    console.error('Error processing AI DM action:', error);
    
    res.status(500).json({
      narrative: "A disturbance in the magical fabric disrupts the session... *reality glitches briefly* The DM will return shortly. Please try your action again.",
      gameEffects: [],
      dashboardUpdates: [],
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * Test connection to AI DM service
 */
router.get('/test-connection', async (_req: Request, res: Response) => {
  try {
    const isConnected = await aiDM.testConnection();
    
    res.json({
      success: true,
      data: {
        connected: isConnected,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        features: ['narrative-generation', 'rule-enforcement', 'character-tracking'],
      },
    });
  } catch (error) {
    console.error('Error testing AI DM connection:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to test AI DM connection',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get AI DM usage statistics
 */
router.get('/usage-stats', async (_req: Request, res: Response) => {
  try {
    const stats = await aiDM.getUsageStats();
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting AI DM usage stats:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to get usage statistics',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Start a new AI DM session
 */
router.post('/start-session', async (req: Request<{}, any, StartSessionRequest>, res: Response) => {
  try {
    const { character, gameState } = req.body;

    // Validate required fields
    if (!character || !gameState) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: character or gameState',
      });
    }

    const sessionData = await aiDM.startSession(character, gameState);
    
    res.json({
      success: true,
      data: sessionData,
    });
  } catch (error) {
    console.error('Error starting AI DM session:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to start session',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Health check endpoint
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const health = await aiDM.getHealthStatus();
    
    res.json({
      success: true,
      data: {
        status: health.status,
        uptime: health.uptime,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    console.error('Error checking AI DM health:', error);
    
    res.status(503).json({
      success: false,
      error: 'Service unavailable',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get AI DM capabilities and features
 */
router.get('/capabilities', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      features: [
        'narrative-generation',
        'rule-enforcement',
        'character-tracking',
        'world-building',
        'combat-management',
        'dialogue-generation',
        'quest-creation',
        'npc-management',
      ],
      supportedSystems: ['D&D 5e'],
      version: '1.0.0',
      maxPlayersPerSession: 6,
      supportedLanguages: ['en'],
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
      },
    },
  });
});

/**
 * Generate random encounter
 */
router.post('/generate-encounter', async (req: Request, res: Response) => {
  try {
    const { partyLevel, environment, difficulty } = req.body;
    
    const encounter = await aiDM.generateEncounter({
      partyLevel: partyLevel || 1,
      environment: environment || 'forest',
      difficulty: difficulty || 'medium',
    });
    
    res.json({
      success: true,
      data: encounter,
    });
  } catch (error) {
    console.error('Error generating encounter:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate encounter',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Generate NPC
 */
router.post('/generate-npc', async (req: Request, res: Response) => {
  try {
    const { race, profession, personality, location } = req.body;
    
    const npc = await aiDM.generateNPC({
      race,
      profession,
      personality,
      location,
    });
    
    res.json({
      success: true,
      data: npc,
    });
  } catch (error) {
    console.error('Error generating NPC:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate NPC',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Error handling middleware
 */
router.use((error: Error, _req: Request, res: Response, _next: express.NextFunction) => {
  console.error('AI DM Route Error:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: error.message,
  });
});

export default router;