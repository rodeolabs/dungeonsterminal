import { BaseMCPService, MCPRequest, MCPResponse, MCPTool } from './base';
import { SupabaseMCPService } from './supabase-service';
import { FetchMCPService } from './fetch-service';
import { FirecrawlMCPService } from './firecrawl-service';
import { PlaywrightMCPService } from './playwright-service';
import { GitHubMCPService } from './github-service';
import { logger } from '../../utils/logger';

export class MCPManager {
  private services: Map<string, BaseMCPService>;

  constructor() {
    this.services = new Map();
    this.initializeServices();
  }

  private initializeServices(): void {
    const serviceInstances = [
      new SupabaseMCPService(),
      new FetchMCPService(),
      new FirecrawlMCPService(),
      new PlaywrightMCPService(),
      new GitHubMCPService()
    ];

    for (const service of serviceInstances) {
      this.services.set(service.name, service);
      logger.info(`Initialized MCP service: ${service.name}`);
    }
  }

  public getAvailableServices(): string[] {
    return Array.from(this.services.keys());
  }

  public getServiceTools(serviceName: string): MCPTool[] {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service.getAvailableTools();
  }

  public getAllTools(): Record<string, MCPTool[]> {
    const allTools: Record<string, MCPTool[]> = {};
    
    for (const [serviceName, service] of this.services) {
      allTools[serviceName] = service.getAvailableTools();
    }
    
    return allTools;
  }

  public async executeRequest(serviceName: string, request: MCPRequest): Promise<MCPResponse> {
    const service = this.services.get(serviceName);
    
    if (!service) {
      return {
        success: false,
        error: `Service ${serviceName} not found. Available services: ${this.getAvailableServices().join(', ')}`
      };
    }

    try {
      logger.info(`Executing MCP request: ${serviceName}.${request.method}`);
      const response = await service.executeRequest(request);
      
      if (response.success) {
        logger.info(`MCP request completed successfully: ${serviceName}.${request.method}`);
      } else {
        logger.warn(`MCP request failed: ${serviceName}.${request.method} - ${response.error}`);
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`MCP request error: ${serviceName}.${request.method}`, error);
      
      return {
        success: false,
        error: `Service execution failed: ${errorMessage}`
      };
    }
  }

  public async executeBatchRequests(requests: Array<{serviceName: string, request: MCPRequest}>): Promise<MCPResponse[]> {
    const promises = requests.map(({serviceName, request}) => 
      this.executeRequest(serviceName, request)
    );
    
    return Promise.all(promises);
  }

  public getServiceStatus(): Record<string, { available: boolean, tools: number }> {
    const status: Record<string, { available: boolean, tools: number }> = {};
    
    for (const [serviceName, service] of this.services) {
      try {
        const tools = service.getAvailableTools();
        status[serviceName] = {
          available: true,
          tools: tools.length
        };
      } catch (error) {
        status[serviceName] = {
          available: false,
          tools: 0
        };
      }
    }
    
    return status;
  }

  public async healthCheck(): Promise<{ healthy: boolean, services: Record<string, boolean> }> {
    const serviceHealth: Record<string, boolean> = {};
    let overallHealth = true;

    for (const serviceName of this.getAvailableServices()) {
      try {
        // Simple health check - try to get tools
        this.getServiceTools(serviceName);
        serviceHealth[serviceName] = true;
      } catch (error) {
        serviceHealth[serviceName] = false;
        overallHealth = false;
        logger.error(`Health check failed for service ${serviceName}:`, error);
      }
    }

    return {
      healthy: overallHealth,
      services: serviceHealth
    };
  }
}

export const mcpManager = new MCPManager();