import { Router } from 'express';
import { z } from 'zod';
import { aiDungeonMaster } from '../services/ai-dm';
import { mcpManager } from '../services/mcp/mcp-manager';
import { asyncHandler, ApiError } from '../middleware/error-handler';

const router = Router();

const narrativeRequestSchema = z.object({
  prompt: z.string().min(1).max(1000),
  context: z.object({
    campaignId: z.string().uuid().optional(),
    sessionId: z.string().uuid().optional(),
    characterNames: z.array(z.string()).optional(),
    currentLocation: z.string().optional(),
    recentEvents: z.array(z.string()).optional()
  }).optional(),
  style: z.enum(['dramatic', 'humorous', 'serious', 'mysterious']).optional(),
  length: z.enum(['short', 'medium', 'long']).optional()
});

const encounterRequestSchema = z.object({
  partyLevel: z.number().int().min(1).max(20),
  partySize: z.number().int().min(1).max(8),
  difficulty: z.enum(['easy', 'medium', 'hard', 'deadly']),
  environment: z.string().optional(),
  monsterTypes: z.array(z.string()).optional(),
  theme: z.string().optional()
});

const npcRequestSchema = z.object({
  name: z.string().optional(),
  race: z.string().optional(),
  occupation: z.string().optional(),
  personality: z.string().optional(),
  campaignId: z.string().uuid().optional()
});

// Generate narrative content
router.post('/generate', asyncHandler(async (req, res) => {
  const validatedData = narrativeRequestSchema.parse(req.body);
  
  const narrative = await aiDungeonMaster.generateNarrative(validatedData);
  
  res.json({
    success: true,
    data: narrative
  });
}));

// Generate combat encounters
router.post('/encounter', asyncHandler(async (req, res) => {
  const validatedData = encounterRequestSchema.parse(req.body);
  
  const encounter = await aiDungeonMaster.generateEncounter(validatedData);
  
  res.json({
    success: true,
    data: encounter
  });
}));

// Generate NPCs
router.post('/npc', asyncHandler(async (req, res) => {
  const validatedData = npcRequestSchema.parse(req.body);
  
  const npc = await aiDungeonMaster.generateNPC(validatedData);
  
  res.json({
    success: true,
    data: npc
  });
}));

// Get AI DM capabilities and available tools
router.get('/capabilities', asyncHandler(async (req, res) => {
  const mcpTools = mcpManager.getAllTools();
  const mcpStatus = mcpManager.getServiceStatus();
  const healthCheck = await mcpManager.healthCheck();
  
  res.json({
    success: true,
    data: {
      ai_capabilities: {
        narrative_generation: true,
        encounter_creation: true,
        npc_generation: true,
        context_awareness: true,
        style_adaptation: true
      },
      mcp_integration: {
        services: mcpStatus,
        health: healthCheck,
        available_tools: mcpTools
      },
      supported_styles: ['dramatic', 'humorous', 'serious', 'mysterious'],
      supported_lengths: ['short', 'medium', 'long'],
      max_prompt_length: 1000
    }
  });
}));

// Execute MCP tool requests
router.post('/mcp/:serviceName/:method', asyncHandler(async (req, res) => {
  const { serviceName, method } = req.params;
  const params = req.body;
  
  if (!mcpManager.getAvailableServices().includes(serviceName)) {
    throw new ApiError(`Service ${serviceName} not available`, 404);
  }
  
  const response = await mcpManager.executeRequest(serviceName, {
    method,
    params
  });
  
  if (!response.success) {
    throw new ApiError(`MCP request failed: ${response.error}`, 400);
  }
  
  res.json({
    success: true,
    data: response.data
  });
}));

// Get MCP service tools
router.get('/mcp/:serviceName/tools', asyncHandler(async (req, res) => {
  const { serviceName } = req.params;
  
  if (!mcpManager.getAvailableServices().includes(serviceName)) {
    throw new ApiError(`Service ${serviceName} not available`, 404);
  }
  
  const tools = mcpManager.getServiceTools(serviceName);
  
  res.json({
    success: true,
    data: {
      service: serviceName,
      tools
    }
  });
}));

// Health check for AI DM service
router.get('/health', asyncHandler(async (req, res) => {
  const mcpHealth = await mcpManager.healthCheck();
  
  res.json({
    success: true,
    data: {
      ai_dm: 'healthy',
      openai_configured: !!process.env.OPENAI_API_KEY,
      mcp_services: mcpHealth,
      timestamp: new Date().toISOString()
    }
  });
}));

export { router as aiDmRouter };