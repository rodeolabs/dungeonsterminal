import { BaseMCPService, MCPTool, MCPRequest, MCPResponse } from './base';

export class FetchMCPService extends BaseMCPService {
  name = 'fetch';
  description = 'HTTP fetch operations for D&D API data and external resources';

  private readonly dndApiBase = process.env.DND_API_BASE_URL || 'https://www.dnd5eapi.co/api';

  getAvailableTools(): MCPTool[] {
    return [
      {
        name: 'fetch_spells',
        description: 'Fetch D&D spells data',
        inputSchema: {
          type: 'object',
          properties: {
            level: { type: 'number', minimum: 0, maximum: 9 },
            school: { type: 'string' },
            class: { type: 'string' },
            limit: { type: 'number', default: 20 }
          }
        }
      },
      {
        name: 'fetch_monsters',
        description: 'Fetch D&D monsters data',
        inputSchema: {
          type: 'object',
          properties: {
            challenge_rating: { type: 'string' },
            type: { type: 'string' },
            size: { type: 'string' },
            limit: { type: 'number', default: 20 }
          }
        }
      },
      {
        name: 'fetch_equipment',
        description: 'Fetch D&D equipment data',
        inputSchema: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            equipment_type: { type: 'string' },
            limit: { type: 'number', default: 20 }
          }
        }
      },
      {
        name: 'fetch_classes',
        description: 'Fetch D&D classes data',
        inputSchema: {
          type: 'object',
          properties: {
            class_index: { type: 'string' }
          }
        }
      },
      {
        name: 'fetch_races',
        description: 'Fetch D&D races data',
        inputSchema: {
          type: 'object',
          properties: {
            race_index: { type: 'string' }
          }
        }
      },
      {
        name: 'custom_fetch',
        description: 'Make custom HTTP requests',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            method: { type: 'string', default: 'GET' },
            headers: { type: 'object' },
            body: { type: 'string' }
          },
          required: ['url']
        }
      }
    ];
  }

  async executeRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      switch (request.method) {
        case 'fetch_spells':
          return await this.fetchSpells(request.params);
        
        case 'fetch_monsters':
          return await this.fetchMonsters(request.params);
          
        case 'fetch_equipment':
          return await this.fetchEquipment(request.params);
          
        case 'fetch_classes':
          return await this.fetchClasses(request.params);
          
        case 'fetch_races':
          return await this.fetchRaces(request.params);
          
        case 'custom_fetch':
          return await this.customFetch(request.params);
          
        default:
          return { success: false, error: `Unknown method: ${request.method}` };
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  private async fetchSpells(params: Record<string, unknown>): Promise<MCPResponse> {
    let url = `${this.dndApiBase}/spells`;
    const searchParams = new URLSearchParams();
    
    if (params.level !== undefined) {
      searchParams.append('level', String(params.level));
    }
    if (params.school) {
      searchParams.append('school', params.school as string);
    }
    
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
    
    const data = await response.json();
    return { success: true, data };
  }

  private async fetchMonsters(params: Record<string, unknown>): Promise<MCPResponse> {
    let url = `${this.dndApiBase}/monsters`;
    const searchParams = new URLSearchParams();
    
    if (params.challenge_rating) {
      searchParams.append('challenge_rating', params.challenge_rating as string);
    }
    if (params.type) {
      searchParams.append('type', params.type as string);
    }
    if (params.size) {
      searchParams.append('size', params.size as string);
    }
    
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
    
    const data = await response.json();
    return { success: true, data };
  }

  private async fetchEquipment(params: Record<string, unknown>): Promise<MCPResponse> {
    let url = `${this.dndApiBase}/equipment`;
    const searchParams = new URLSearchParams();
    
    if (params.category) {
      searchParams.append('category', params.category as string);
    }
    
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
    
    const data = await response.json();
    return { success: true, data };
  }

  private async fetchClasses(params: Record<string, unknown>): Promise<MCPResponse> {
    let url = `${this.dndApiBase}/classes`;
    
    if (params.class_index) {
      url += `/${params.class_index}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
    
    const data = await response.json();
    return { success: true, data };
  }

  private async fetchRaces(params: Record<string, unknown>): Promise<MCPResponse> {
    let url = `${this.dndApiBase}/races`;
    
    if (params.race_index) {
      url += `/${params.race_index}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
    
    const data = await response.json();
    return { success: true, data };
  }

  private async customFetch(params: Record<string, unknown>): Promise<MCPResponse> {
    const url = params.url as string;
    const method = (params.method as string) || 'GET';
    const headers = (params.headers as Record<string, string>) || {};
    const body = params.body as string;
    
    const response = await fetch(url, {
      method,
      headers,
      body: body || undefined
    });
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
    
    const data = await response.json();
    return { success: true, data };
  }
}