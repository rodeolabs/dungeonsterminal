import { Router } from 'express';
import { z } from 'zod';
import { mcpManager } from '../services/mcp/mcp-manager';
import { asyncHandler, ApiError } from '../middleware/error-handler';

const router = Router();

const createSessionSchema = z.object({
  campaign_id: z.string().uuid(),
  session_number: z.number().int().min(1),
  title: z.string().max(255).optional(),
  session_date: z.string().datetime().optional()
});

const updateSessionSchema = z.object({
  title: z.string().max(255).optional(),
  summary: z.string().optional(),
  notes: z.string().optional(),
  narrative_log: z.array(z.record(z.unknown())).optional(),
  combat_encounters: z.array(z.record(z.unknown())).optional(),
  npc_interactions: z.array(z.record(z.unknown())).optional(),
  treasure_found: z.array(z.record(z.unknown())).optional(),
  experience_gained: z.number().int().min(0).optional(),
  duration_minutes: z.number().int().min(0).optional(),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']).optional()
});

// Get all sessions (with optional filters)
router.get('/', asyncHandler(async (req, res) => {
  const { campaign_id, status, limit = 10 } = req.query;
  
  if (!campaign_id) {
    throw new ApiError('campaign_id is required', 400);
  }
  
  // This would need to be implemented in the Supabase MCP service
  const response = { success: true, data: [] }; // Placeholder
  
  res.json({
    success: true,
    data: response.data
  });
}));

// Get a specific session
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // This would need to be implemented in the Supabase MCP service
  res.json({
    success: true,
    message: 'Session retrieval to be implemented',
    data: { id }
  });
}));

// Create a new session
router.post('/', asyncHandler(async (req, res) => {
  const validatedData = createSessionSchema.parse(req.body);
  
  const response = await mcpManager.executeRequest('supabase', {
    method: 'create_session',
    params: validatedData
  });
  
  if (!response.success) {
    throw new ApiError(response.error || 'Failed to create session', 500);
  }
  
  res.status(201).json({
    success: true,
    data: response.data
  });
}));

// Update a session
router.patch('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const validatedData = updateSessionSchema.parse(req.body);
  
  const response = await mcpManager.executeRequest('supabase', {
    method: 'update_session',
    params: {
      session_id: id,
      ...validatedData
    }
  });
  
  if (!response.success) {
    throw new ApiError(response.error || 'Failed to update session', 500);
  }
  
  res.json({
    success: true,
    data: response.data
  });
}));

// Delete a session
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Delete session (this would need to be implemented in the Supabase MCP service)
  res.json({
    success: true,
    message: 'Session deletion functionality to be implemented'
  });
}));

// Add narrative entry to session
router.post('/:id/narrative', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { entry, timestamp, speaker, type = 'narration' } = req.body;
  
  if (!entry) {
    throw new ApiError('Narrative entry is required', 400);
  }
  
  const narrativeEntry = {
    id: Date.now().toString(),
    timestamp: timestamp || new Date().toISOString(),
    speaker,
    type, // 'narration', 'dialogue', 'action', 'description'
    content: entry
  };
  
  // This would need to fetch current narrative_log and append the new entry
  const response = await mcpManager.executeRequest('supabase', {
    method: 'update_session',
    params: {
      session_id: id,
      narrative_log: [narrativeEntry] // In real implementation, this would append to existing log
    }
  });
  
  if (!response.success) {
    throw new ApiError(response.error || 'Failed to add narrative entry', 500);
  }
  
  res.json({
    success: true,
    data: {
      message: 'Narrative entry added successfully',
      entry: narrativeEntry
    }
  });
}));

// Add combat encounter to session
router.post('/:id/encounter', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const encounterSchema = z.object({
    name: z.string(),
    monsters: z.array(z.record(z.unknown())),
    start_time: z.string().datetime().optional(),
    end_time: z.string().datetime().optional(),
    outcome: z.enum(['victory', 'defeat', 'escape', 'ongoing']).optional(),
    xp_awarded: z.number().int().min(0).optional(),
    treasure: z.array(z.record(z.unknown())).optional()
  });
  
  const validatedEncounter = encounterSchema.parse(req.body);
  
  const encounterEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    ...validatedEncounter
  };
  
  const response = await mcpManager.executeRequest('supabase', {
    method: 'update_session',
    params: {
      session_id: id,
      combat_encounters: [encounterEntry] // In real implementation, this would append
    }
  });
  
  if (!response.success) {
    throw new ApiError(response.error || 'Failed to add encounter', 500);
  }
  
  res.json({
    success: true,
    data: {
      message: 'Combat encounter added successfully',
      encounter: encounterEntry
    }
  });
}));

// Add NPC interaction to session
router.post('/:id/npc-interaction', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const interactionSchema = z.object({
    npc_name: z.string(),
    interaction_type: z.enum(['conversation', 'trade', 'combat', 'quest']),
    description: z.string(),
    outcome: z.string().optional(),
    reputation_change: z.number().optional()
  });
  
  const validatedInteraction = interactionSchema.parse(req.body);
  
  const interactionEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    ...validatedInteraction
  };
  
  const response = await mcpManager.executeRequest('supabase', {
    method: 'update_session',
    params: {
      session_id: id,
      npc_interactions: [interactionEntry] // In real implementation, this would append
    }
  });
  
  if (!response.success) {
    throw new ApiError(response.error || 'Failed to add NPC interaction', 500);
  }
  
  res.json({
    success: true,
    data: {
      message: 'NPC interaction added successfully',
      interaction: interactionEntry
    }
  });
}));

// Generate session summary using AI
router.post('/:id/generate-summary', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // This would fetch session data and use the AI DM to generate a summary
  // For now, return a placeholder
  res.json({
    success: true,
    data: {
      message: 'AI summary generation to be implemented',
      session_id: id,
      summary: 'Session summary would be generated here using narrative log and encounters'
    }
  });
}));

// Get session statistics
router.get('/:id/stats', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // This would calculate session statistics from the session data
  const stats = {
    total_narrative_entries: 0,
    combat_encounters: 0,
    npc_interactions: 0,
    total_xp_awarded: 0,
    session_duration_minutes: 0,
    player_participation: {}
  };
  
  res.json({
    success: true,
    data: stats
  });
}));

export { router as sessionRouter };