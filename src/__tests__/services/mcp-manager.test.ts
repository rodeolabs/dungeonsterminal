import { MCPManager } from '../../services/mcp/mcp-manager';

describe('MCPManager', () => {
  let mcpManager: MCPManager;

  beforeEach(() => {
    mcpManager = new MCPManager();
  });

  describe('Service Management', () => {
    it('should initialize all MCP services', () => {
      const services = mcpManager.getAvailableServices();
      
      expect(services).toContain('supabase');
      expect(services).toContain('fetch');
      expect(services).toContain('firecrawl');
      expect(services).toContain('playwright');
      expect(services).toContain('github');
      expect(services.length).toBe(5);
    });

    it('should get tools for specific service', () => {
      const supabaseTools = mcpManager.getServiceTools('supabase');
      
      expect(Array.isArray(supabaseTools)).toBe(true);
      expect(supabaseTools.length).toBeGreaterThan(0);
      expect(supabaseTools[0]).toHaveProperty('name');
      expect(supabaseTools[0]).toHaveProperty('description');
      expect(supabaseTools[0]).toHaveProperty('inputSchema');
    });

    it('should throw error for unknown service', () => {
      expect(() => {
        mcpManager.getServiceTools('unknown-service');
      }).toThrow('Service unknown-service not found');
    });

    it('should get all tools from all services', () => {
      const allTools = mcpManager.getAllTools();
      
      expect(allTools).toHaveProperty('supabase');
      expect(allTools).toHaveProperty('fetch');
      expect(allTools).toHaveProperty('firecrawl');
      expect(allTools).toHaveProperty('playwright');
      expect(allTools).toHaveProperty('github');
      
      Object.values(allTools).forEach(tools => {
        expect(Array.isArray(tools)).toBe(true);
      });
    });
  });

  describe('Request Execution', () => {
    it('should execute valid supabase request', async () => {
      const response = await mcpManager.executeRequest('supabase', {
        method: 'query_campaigns',
        params: { user_id: 'test-user' }
      });

      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('data');
      expect(response.success).toBe(true);
    });

    it('should handle unknown service', async () => {
      const response = await mcpManager.executeRequest('unknown', {
        method: 'test',
        params: {}
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('Service unknown not found');
    });

    it('should handle invalid method', async () => {
      const response = await mcpManager.executeRequest('supabase', {
        method: 'invalid_method',
        params: {}
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('Unknown method');
    });
  });

  describe('Batch Operations', () => {
    it('should execute multiple requests in batch', async () => {
      const requests = [
        {
          serviceName: 'supabase',
          request: {
            method: 'query_campaigns',
            params: { user_id: 'user1' }
          }
        },
        {
          serviceName: 'fetch',
          request: {
            method: 'fetch_spells',
            params: { level: 1 }
          }
        }
      ];

      const responses = await mcpManager.executeBatchRequests(requests);

      expect(responses).toHaveLength(2);
      expect(responses[0]).toHaveProperty('success');
      expect(responses[1]).toHaveProperty('success');
    });
  });

  describe('Service Health', () => {
    it('should get service status', () => {
      const status = mcpManager.getServiceStatus();

      expect(status).toHaveProperty('supabase');
      expect(status).toHaveProperty('fetch');
      expect(status).toHaveProperty('firecrawl');
      expect(status).toHaveProperty('playwright');
      expect(status).toHaveProperty('github');

      Object.values(status).forEach(serviceStatus => {
        expect(serviceStatus).toHaveProperty('available');
        expect(serviceStatus).toHaveProperty('tools');
        expect(typeof serviceStatus.available).toBe('boolean');
        expect(typeof serviceStatus.tools).toBe('number');
      });
    });

    it('should perform health check', async () => {
      const healthCheck = await mcpManager.healthCheck();

      expect(healthCheck).toHaveProperty('healthy');
      expect(healthCheck).toHaveProperty('services');
      expect(typeof healthCheck.healthy).toBe('boolean');
      
      Object.keys(healthCheck.services).forEach(serviceName => {
        expect(typeof healthCheck.services[serviceName]).toBe('boolean');
      });
    });
  });
});