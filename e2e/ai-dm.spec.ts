import { test, expect } from '@playwright/test';

test.describe('AI Dungeon Master API', () => {
  test.beforeEach(async ({ page }) => {
    // Set up any necessary authentication or state
  });

  test('should respond to health check', async ({ request }) => {
    const response = await request.get('/api/ai-dm/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('ai_dm');
    expect(data.data).toHaveProperty('timestamp');
  });

  test('should generate narrative content', async ({ request }) => {
    const narrativeRequest = {
      prompt: 'The party enters a haunted mansion',
      style: 'mysterious',
      length: 'medium'
    };

    const response = await request.post('/api/ai-dm/generate', {
      data: narrativeRequest
    });

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('narrative');
    expect(data.data).toHaveProperty('metadata');
    expect(data.data.metadata).toHaveProperty('model');
    expect(data.data.metadata).toHaveProperty('timestamp');
  });

  test('should generate combat encounters', async ({ request }) => {
    const encounterRequest = {
      partyLevel: 5,
      partySize: 4,
      difficulty: 'hard',
      environment: 'forest',
      theme: 'undead'
    };

    const response = await request.post('/api/ai-dm/encounter', {
      data: encounterRequest
    });

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('monsters');
    expect(data.data).toHaveProperty('encounterDescription');
    expect(data.data).toHaveProperty('xpReward');
    expect(data.data.monsters).toBeInstanceOf(Array);
  });

  test('should generate NPCs', async ({ request }) => {
    const npcRequest = {
      name: 'Elara Nightwhisper',
      race: 'Elf',
      occupation: 'Ranger',
      personality: 'Stoic and observant'
    };

    const response = await request.post('/api/ai-dm/npc', {
      data: npcRequest
    });

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('name');
    expect(data.data).toHaveProperty('race');
    expect(data.data).toHaveProperty('occupation');
    expect(data.data).toHaveProperty('backstory');
  });

  test('should return AI capabilities', async ({ request }) => {
    const response = await request.get('/api/ai-dm/capabilities');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('ai_capabilities');
    expect(data.data).toHaveProperty('mcp_integration');
    expect(data.data).toHaveProperty('supported_styles');
    expect(data.data).toHaveProperty('supported_lengths');
    
    // Verify specific capabilities
    expect(data.data.ai_capabilities.narrative_generation).toBe(true);
    expect(data.data.ai_capabilities.encounter_creation).toBe(true);
    expect(data.data.ai_capabilities.npc_generation).toBe(true);
  });

  test('should handle MCP service requests', async ({ request }) => {
    // Test Supabase MCP service tools endpoint
    const toolsResponse = await request.get('/api/ai-dm/mcp/supabase/tools');
    expect(toolsResponse.status()).toBe(200);
    
    const toolsData = await toolsResponse.json();
    expect(toolsData.success).toBe(true);
    expect(toolsData.data).toHaveProperty('service', 'supabase');
    expect(toolsData.data).toHaveProperty('tools');
    expect(toolsData.data.tools).toBeInstanceOf(Array);
    
    // Test Fetch MCP service tools endpoint
    const fetchToolsResponse = await request.get('/api/ai-dm/mcp/fetch/tools');
    expect(fetchToolsResponse.status()).toBe(200);
    
    const fetchToolsData = await fetchToolsResponse.json();
    expect(fetchToolsData.success).toBe(true);
    expect(fetchToolsData.data).toHaveProperty('service', 'fetch');
  });

  test('should validate request schemas', async ({ request }) => {
    // Test invalid narrative request
    const invalidNarrativeRequest = {
      prompt: '', // Empty prompt should fail
    };

    const narrativeResponse = await request.post('/api/ai-dm/generate', {
      data: invalidNarrativeRequest
    });
    expect(narrativeResponse.status()).toBe(400);

    // Test invalid encounter request
    const invalidEncounterRequest = {
      partyLevel: 0, // Invalid level
      partySize: 4,
      difficulty: 'medium'
    };

    const encounterResponse = await request.post('/api/ai-dm/encounter', {
      data: invalidEncounterRequest
    });
    expect(encounterResponse.status()).toBe(400);
  });

  test('should handle MCP service errors gracefully', async ({ request }) => {
    // Test request to non-existent service
    const response = await request.post('/api/ai-dm/mcp/nonexistent/method', {
      data: {}
    });
    expect(response.status()).toBe(404);
    
    const data = await response.json();
    expect(data.success).toBe(false);
  });
});