import { Router } from 'express';
import { z } from 'zod';
import { mcpManager } from '../services/mcp/mcp-manager';
import { asyncHandler, ApiError } from '../middleware/error-handler';

const router = Router();

const createCampaignSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  dm_user_id: z.string().uuid(),
  setting_info: z.record(z.unknown()).optional(),
  max_players: z.number().int().min(1).max(12).default(6)
});

const updateCampaignSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  setting_info: z.record(z.unknown()).optional(),
  max_players: z.number().int().min(1).max(12).optional(),
  status: z.enum(['active', 'paused', 'completed', 'archived']).optional()
});

// Get all campaigns for a user
router.get('/', asyncHandler(async (req, res) => {
  const { user_id, status, limit = 10 } = req.query;
  
  const response = await mcpManager.executeRequest('supabase', {
    method: 'query_campaigns',
    params: {
      user_id: user_id as string,
      status: status as string,
      limit: parseInt(limit as string)
    }
  });
  
  if (!response.success) {
    throw new ApiError(response.error || 'Failed to fetch campaigns', 500);
  }
  
  res.json({
    success: true,
    data: response.data
  });
}));

// Get a specific campaign
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const response = await mcpManager.executeRequest('supabase', {
    method: 'query_campaigns',
    params: { campaign_id: id }
  });
  
  if (!response.success) {
    throw new ApiError(response.error || 'Failed to fetch campaign', 500);
  }
  
  const campaigns = response.data as any[];
  if (campaigns.length === 0) {
    throw new ApiError('Campaign not found', 404);
  }
  
  res.json({
    success: true,
    data: campaigns[0]
  });
}));

// Create a new campaign
router.post('/', asyncHandler(async (req, res) => {
  const validatedData = createCampaignSchema.parse(req.body);
  
  const response = await mcpManager.executeRequest('supabase', {
    method: 'create_campaign',
    params: validatedData
  });
  
  if (!response.success) {
    throw new ApiError(response.error || 'Failed to create campaign', 500);
  }
  
  res.status(201).json({
    success: true,
    data: response.data
  });
}));

// Update a campaign
router.patch('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const validatedData = updateCampaignSchema.parse(req.body);
  
  // First check if campaign exists
  const existingResponse = await mcpManager.executeRequest('supabase', {
    method: 'query_campaigns',
    params: { campaign_id: id }
  });
  
  if (!existingResponse.success || (existingResponse.data as any[]).length === 0) {
    throw new ApiError('Campaign not found', 404);
  }
  
  // Update campaign (this would need to be implemented in the Supabase MCP service)
  res.json({
    success: true,
    message: 'Campaign update functionality to be implemented'
  });
}));

// Delete a campaign
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if campaign exists first
  const existingResponse = await mcpManager.executeRequest('supabase', {
    method: 'query_campaigns',
    params: { campaign_id: id }
  });
  
  if (!existingResponse.success || (existingResponse.data as any[]).length === 0) {
    throw new ApiError('Campaign not found', 404);
  }
  
  // Delete campaign (this would need to be implemented in the Supabase MCP service)
  res.json({
    success: true,
    message: 'Campaign deletion functionality to be implemented'
  });
}));

// Get campaign statistics
router.get('/:id/stats', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Get campaign characters
  const charactersResponse = await mcpManager.executeRequest('supabase', {
    method: 'query_characters',
    params: { campaign_id: id }
  });
  
  // Get campaign sessions (would need to be implemented)
  const sessionsResponse = { success: true, data: [] }; // Placeholder
  
  const stats = {
    total_characters: charactersResponse.success ? (charactersResponse.data as any[]).length : 0,
    total_sessions: sessionsResponse.success ? (sessionsResponse.data as any[]).length : 0,
    active_players: new Set(charactersResponse.success ? (charactersResponse.data as any[]).map((c: any) => c.player_user_id) : []).size,
    average_level: charactersResponse.success && (charactersResponse.data as any[]).length > 0 
      ? (charactersResponse.data as any[]).reduce((sum: number, c: any) => sum + c.level, 0) / (charactersResponse.data as any[]).length 
      : 0
  };
  
  res.json({
    success: true,
    data: stats
  });
}));

export { router as campaignRouter };