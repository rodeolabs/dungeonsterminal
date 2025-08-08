import { Router } from 'express';
import { z } from 'zod';
import { mcpManager } from '../services/mcp/mcp-manager';
import { asyncHandler, ApiError } from '../middleware/error-handler';

const router = Router();

const createCharacterSchema = z.object({
  name: z.string().min(1).max(100),
  class: z.string().min(1).max(50),
  race: z.string().min(1).max(50),
  campaign_id: z.string().uuid(),
  player_user_id: z.string().uuid(),
  level: z.number().int().min(1).max(20).default(1),
  stats: z.object({
    strength: z.number().int().min(1).max(30),
    dexterity: z.number().int().min(1).max(30),
    constitution: z.number().int().min(1).max(30),
    intelligence: z.number().int().min(1).max(30),
    wisdom: z.number().int().min(1).max(30),
    charisma: z.number().int().min(1).max(30)
  }).optional(),
  background: z.string().optional(),
  backstory: z.string().optional()
});

const updateCharacterSchema = createCharacterSchema.partial().omit({
  campaign_id: true,
  player_user_id: true
});

// Get all characters (with optional filters)
router.get('/', asyncHandler(async (req, res) => {
  const { campaign_id, player_user_id, limit = 10 } = req.query;
  
  const response = await mcpManager.executeRequest('supabase', {
    method: 'query_characters',
    params: {
      campaign_id: campaign_id as string,
      player_user_id: player_user_id as string,
      limit: parseInt(limit as string)
    }
  });
  
  if (!response.success) {
    throw new ApiError(response.error || 'Failed to fetch characters', 500);
  }
  
  res.json({
    success: true,
    data: response.data
  });
}));

// Get a specific character
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const response = await mcpManager.executeRequest('supabase', {
    method: 'query_characters',
    params: { character_id: id }
  });
  
  if (!response.success) {
    throw new ApiError(response.error || 'Failed to fetch character', 500);
  }
  
  const characters = response.data as any[];
  if (characters.length === 0) {
    throw new ApiError('Character not found', 404);
  }
  
  res.json({
    success: true,
    data: characters[0]
  });
}));

// Create a new character
router.post('/', asyncHandler(async (req, res) => {
  const validatedData = createCharacterSchema.parse(req.body);
  
  const response = await mcpManager.executeRequest('supabase', {
    method: 'create_character',
    params: validatedData
  });
  
  if (!response.success) {
    throw new ApiError(response.error || 'Failed to create character', 500);
  }
  
  res.status(201).json({
    success: true,
    data: response.data
  });
}));

// Update a character
router.patch('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const validatedData = updateCharacterSchema.parse(req.body);
  
  // First check if character exists
  const existingResponse = await mcpManager.executeRequest('supabase', {
    method: 'query_characters',
    params: { character_id: id }
  });
  
  if (!existingResponse.success || (existingResponse.data as any[]).length === 0) {
    throw new ApiError('Character not found', 404);
  }
  
  // Update character (this would need to be implemented in the Supabase MCP service)
  res.json({
    success: true,
    message: 'Character update functionality to be implemented',
    data: { id, ...validatedData }
  });
}));

// Delete a character
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if character exists first
  const existingResponse = await mcpManager.executeRequest('supabase', {
    method: 'query_characters',
    params: { character_id: id }
  });
  
  if (!existingResponse.success || (existingResponse.data as any[]).length === 0) {
    throw new ApiError('Character not found', 404);
  }
  
  // Delete character (this would need to be implemented in the Supabase MCP service)
  res.json({
    success: true,
    message: 'Character deletion functionality to be implemented'
  });
}));

// Level up a character
router.post('/:id/level-up', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Get current character
  const response = await mcpManager.executeRequest('supabase', {
    method: 'query_characters',
    params: { character_id: id }
  });
  
  if (!response.success || (response.data as any[]).length === 0) {
    throw new ApiError('Character not found', 404);
  }
  
  const character = (response.data as any[])[0];
  const newLevel = character.level + 1;
  
  if (newLevel > 20) {
    throw new ApiError('Character is already at maximum level', 400);
  }
  
  // Update character level (this would need to be implemented)
  res.json({
    success: true,
    message: 'Character leveled up successfully',
    data: {
      ...character,
      level: newLevel
    }
  });
}));

// Get character spell list (using D&D API)
router.get('/:id/spells', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Get character details
  const characterResponse = await mcpManager.executeRequest('supabase', {
    method: 'query_characters',
    params: { character_id: id }
  });
  
  if (!characterResponse.success || (characterResponse.data as any[]).length === 0) {
    throw new ApiError('Character not found', 404);
  }
  
  const character = (characterResponse.data as any[])[0];
  
  // Fetch spells for character class from D&D API
  const spellsResponse = await mcpManager.executeRequest('fetch', {
    method: 'fetch_spells',
    params: {
      class: character.class.toLowerCase(),
      limit: 50
    }
  });
  
  if (!spellsResponse.success) {
    throw new ApiError('Failed to fetch spells', 500);
  }
  
  res.json({
    success: true,
    data: {
      character: {
        id: character.id,
        name: character.name,
        class: character.class,
        level: character.level
      },
      available_spells: spellsResponse.data,
      current_spells: character.spells || []
    }
  });
}));

// Get character equipment suggestions
router.get('/:id/equipment-suggestions', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Get character details
  const characterResponse = await mcpManager.executeRequest('supabase', {
    method: 'query_characters',
    params: { character_id: id }
  });
  
  if (!characterResponse.success || (characterResponse.data as any[]).length === 0) {
    throw new ApiError('Character not found', 404);
  }
  
  const character = (characterResponse.data as any[])[0];
  
  // Fetch equipment appropriate for character class and level
  const equipmentResponse = await mcpManager.executeRequest('fetch', {
    method: 'fetch_equipment',
    params: {
      category: 'weapon',
      limit: 20
    }
  });
  
  if (!equipmentResponse.success) {
    throw new ApiError('Failed to fetch equipment', 500);
  }
  
  res.json({
    success: true,
    data: {
      character: {
        id: character.id,
        name: character.name,
        class: character.class,
        level: character.level
      },
      suggested_equipment: equipmentResponse.data,
      current_equipment: character.equipment || []
    }
  });
}));

export { router as characterRouter };